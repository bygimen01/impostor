import {create} from 'zustand'
import {persist} from 'zustand/middleware'
import {DefaultSettings,StartRound} from '../game/engine'
import {Words} from '../data/words'
import type {GameState,Player} from '../game/types'
interface LocalStore extends GameState{UpdateSettings:(Settings:Partial<GameState['Settings']>)=>void;AddPlayer:(Name:string)=>void;RemovePlayer:(Id:string)=>void;BeginRound:()=>void;Reset:()=>void}
const Initial:GameState={Players:[],Settings:DefaultSettings,Round:null,Scores:{},UsedWordIds:[],RecentCategories:[],RecentImpostorIds:[]}
export const UseLocalGame=create<LocalStore>()(persist((Set,Get)=>({...Initial,UpdateSettings:(Settings)=>Set(State=>({Settings:{...State.Settings,...Settings}})),AddPlayer:(Name)=>Set(State=>{const Player:Player={Id:crypto.randomUUID(),Name:Name.trim(),Score:0,IsConnected:true};return{Players:[...State.Players,Player],Scores:{...State.Scores,[Player.Id]:0}}}),RemovePlayer:(Id)=>Set(State=>({Players:State.Players.filter(Player=>Player.Id!==Id)})),BeginRound:()=>Set(StartRound(Get(),Words)),Reset:()=>Set(Initial)}),{name:'impostor-local-game'}))
