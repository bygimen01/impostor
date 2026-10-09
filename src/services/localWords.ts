import {Supabase} from './supabase'
import type {WordEntry,HintStrength} from '../game/types'

type Row=Record<string,unknown>
export let CurrentLocalWords:WordEntry[]=[]

async function ReadTable(Table:string):Promise<Row[]>{
if(!Supabase)throw new Error('Supabase не настроен')
const Rows:Row[]=[]
for(let Offset=0;;Offset+=500){
const {data,error}=await Supabase.from(Table).select('*').range(Offset,Offset+499)
if(error)throw new Error(error.message)
const Batch=(data??[]) as Row[]
Rows.push(...Batch)
if(Batch.length<500)break
}
return Rows
}
function GetText(Value:unknown):string{return typeof Value==='string'?Value.trim():''}
function GetHints(Value:unknown):string[]{
if(Array.isArray(Value))return Value.map(Item=>typeof Item==='string'?Item:GetText((Item as Row)?.text??(Item as Row)?.hint)).filter(Boolean)
if(typeof Value==='string'){try{return GetHints(JSON.parse(Value))}catch{return Value.trim()?[Value.trim()]:[]}}
return []
}
export async function LoadLocalWords():Promise<WordEntry[]>{
if(!Supabase)throw new Error('Supabase не настроен')
const RawWords=await ReadTable('words')
if(!RawWords.length)throw new Error('В Supabase нет доступных слов')
let HintRows:Row[]=[]
for(const Table of ['hints','word_hints']){
try{HintRows=await ReadTable(Table);if(HintRows.length)break}catch{}
}
const HintsByWord=new Map<string,{Text:string;Strength:HintStrength}[]>()
for(const Hint of HintRows){
const Key=String(Hint.word_id??Hint.wordId??Hint.word??'')
const Text=GetText(Hint.hint??Hint.text??Hint.hint_text)
if(!Key||!Text)continue
const Existing=HintsByWord.get(Key)??[]
Existing.push({Text,Strength:Math.max(1,Math.min(3,Number(Hint.strength??Hint.level??Existing.length+1))) as HintStrength})
HintsByWord.set(Key,Existing)
}
const Words:WordEntry[]=RawWords.map(Entry=>{
const Id=String(Entry.id??'')
const Word=GetText(Entry.word??Entry.name)
const Inline=GetHints(Entry.hints??Entry.hint_options??Entry.hint)
const Extra=[Entry.hint_1,Entry.hint_2,Entry.hint_3].map(GetText).filter(Boolean)
const Hints=HintsByWord.get(Id)??HintsByWord.get(Word)??[...Inline,...Extra].map((Text,Index)=>({Text,Strength:Math.min(3,Index+1) as HintStrength}))
return {Id,Word,Category:GetText(Entry.category??Entry.category_name)||'Обычный режим',Difficulty:Math.max(1,Math.min(3,Number(Entry.difficulty??2))) as 1|2|3,Hints,Tags:Array.isArray(Entry.tags)?Entry.tags.map(String):[]}
}).filter(Entry=>Entry.Id&&Entry.Word&&Entry.Hints.length>0)
if(!Words.length)throw new Error('Слова загружены, но подсказки не найдены. Нужны реальные названия полей таблиц Supabase.')
CurrentLocalWords=Words
return Words
}
