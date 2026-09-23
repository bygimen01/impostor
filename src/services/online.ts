import {Supabase} from './supabase'
import type {GameSettings} from '../game/types'
function RequireClient(){if(!Supabase)throw new Error('Supabase не настроен');return Supabase}
async function Rpc(Name:string,Args:Record<string,unknown>={}){const{data,error}=await RequireClient().rpc(Name,Args);if(error)throw new globalThis.Error(error.message||'Ошибка сервера');return data}
export function CreateRoom(PlayerName:string,Settings:GameSettings,IsPublic:boolean){return Rpc('create_room_v2',{player_name:PlayerName,settings_input:Settings,is_public_input:IsPublic})}
export function JoinRoom(RoomCode:string,PlayerName:string){return Rpc('join_room',{room_code_input:RoomCode.toUpperCase(),player_name:PlayerName})}
export function ListPublicRooms(){return Rpc('list_public_rooms')}
export function GetRoomState(RoomCode:string,SessionToken:string){return Rpc('get_room_state',{room_code_input:RoomCode,session_token_input:SessionToken})}
export function StartOnlineRound(RoomCode:string,SessionToken:string){return Rpc('start_round',{room_code_input:RoomCode,session_token_input:SessionToken})}
export function GetMySecret(RoomCode:string,SessionToken:string){return Rpc('get_my_secret',{room_code_input:RoomCode,session_token_input:SessionToken})}
export function MarkRoundReady(RoomCode:string,SessionToken:string){return Rpc('mark_round_ready',{room_code_input:RoomCode,session_token_input:SessionToken})}
export function LeaveRoom(RoomCode:string,SessionToken:string){return Rpc('leave_room',{room_code_input:RoomCode,session_token_input:SessionToken})}
export function KickPlayer(RoomCode:string,SessionToken:string,TargetPlayerId:string){return Rpc('kick_player',{room_code_input:RoomCode,session_token_input:SessionToken,target_player_id_input:TargetPlayerId})}
export function UpdateOnlineSettings(RoomCode:string,SessionToken:string,Settings:GameSettings){return Rpc('update_room_settings',{room_code_input:RoomCode,session_token_input:SessionToken,settings_input:Settings})}
export function SubmitClue(RoomCode:string,SessionToken:string,Text:string){return Rpc('submit_clue',{room_code_input:RoomCode,session_token_input:SessionToken,clue_input:Text})}
export function ContinuePlay(RoomCode:string,SessionToken:string){return Rpc('continue_play',{room_code_input:RoomCode,session_token_input:SessionToken})}
export function GuessWord(RoomCode:string,SessionToken:string,Guess:string){return Rpc('guess_word',{room_code_input:RoomCode,session_token_input:SessionToken,guess_input:Guess})}
export function ResolveVoiceGuess(RoomCode:string,SessionToken:string,Correct:boolean){return Rpc('resolve_voice_guess',{room_code_input:RoomCode,session_token_input:SessionToken,correct_input:Correct})}
export function BeginVoting(RoomCode:string,SessionToken:string){return Rpc('begin_voting',{room_code_input:RoomCode,session_token_input:SessionToken})}
export function CastVote(RoomCode:string,SessionToken:string,TargetPlayerId:string){return Rpc('cast_vote',{room_code_input:RoomCode,session_token_input:SessionToken,target_player_id_input:TargetPlayerId})}
export function ReturnToLobby(RoomCode:string,SessionToken:string){return Rpc('return_to_lobby',{room_code_input:RoomCode,session_token_input:SessionToken})}
export function NextOnlineRound(RoomCode:string,SessionToken:string){return StartOnlineRound(RoomCode,SessionToken)}
let SubscriptionCounter=0
export function SubscribeRoom(RoomCode:string,OnChange:()=>void){const Client=RequireClient();SubscriptionCounter+=1;const Channel=Client.channel(`room-${RoomCode}-${SubscriptionCounter}`).on('postgres_changes',{event:'INSERT',schema:'public',table:'room_events',filter:`room_code=eq.${RoomCode}`},()=>OnChange()).subscribe();return()=>{void Client.removeChannel(Channel)}}
