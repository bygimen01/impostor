import {Supabase} from './supabase'
export type LocalRoundWord={id:string;word:string;category:string;hint:string|null}
export async function GetLocalRoundWord(Categories:string[],HintMode:string):Promise<LocalRoundWord>{
if(!Supabase)throw new Error('Supabase не настроен')
const {data,error}=await Supabase.rpc('get_local_round_word',{categories_input:Categories,hint_mode_input:HintMode})
if(error)throw new Error('Ошибка загрузки слова: '+error.message)
if(!data||typeof data.word!=='string')throw new Error('Сервер не вернул слово')
return {id:String(data.id),word:data.word,category:data.category??'Обычный режим',hint:data.hint??null}
}
