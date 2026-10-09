import {Supabase} from './supabase'
import type {WordEntry,HintStrength} from '../game/types'

type DatabaseWord={id:string;word:string;category:string;difficulty:number|null;tags:string[]|null;word_hints:{text:string;strength:number}[]|null}
export async function LoadLocalWords():Promise<WordEntry[]>{
if(!Supabase)throw new Error('Нет подключения к Supabase. Для локальной игры с общим словарём нужен интернет.')
const All:WordEntry[]=[]
for(let Offset=0;;Offset+=500){
const {data,error}=await Supabase.from('words').select('id,word,category,difficulty,tags,word_hints(text,strength)').range(Offset,Offset+499)
if(error)throw new Error('Не удалось загрузить словарь Supabase: '+error.message)
const Batch=(data??[]) as DatabaseWord[]
for(const Entry of Batch){
const Hints=(Entry.word_hints??[]).filter(Hint=>Hint.strength>=1&&Hint.strength<=3).map(Hint=>({Text:Hint.text,Strength:Hint.strength as HintStrength}))
All.push({Id:String(Entry.id),Word:Entry.word,Category:Entry.category,Difficulty:Math.max(1,Math.min(3,Entry.difficulty??2)) as 1|2|3,Hints,Tags:Entry.tags??[]})
}
if(Batch.length<500)break
}
if(!All.length)throw new Error('Словарь Supabase пуст или закрыт политиками доступа. Проверьте права чтения words и word_hints.')
return All
}
