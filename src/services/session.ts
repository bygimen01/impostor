import {get,set,del} from 'idb-keyval'
export interface SavedSession{RoomCode:string;PlayerId:string;SessionToken:string;PlayerName:string}
const SessionKey='impostor-session'
const NameKey='impostor-player-name'
export const SaveSession=async(Session:SavedSession)=>{await set(SessionKey,Session);await set(NameKey,Session.PlayerName)}
export const LoadSession=()=>get<SavedSession>(SessionKey)
export const ClearSession=()=>del(SessionKey)
export const SavePlayerName=(PlayerName:string)=>set(NameKey,PlayerName.trim())
export const LoadPlayerName=()=>get<string>(NameKey)
