export type GamePhase='LOBBY'|'ROLE_REVEAL'|'PLAYING'|'DISCUSSION'|'VOTING'|'VOTING_RESULT'|'IMPOSTOR_GUESS'|'ROUND_RESULT'|'GAME_RESULT'
export type Role='PLAYER'|'IMPOSTOR'
export type HintStrength=1|2|3
export type HintMode='NONE'|'STANDARD'|'RANDOM'|'RANDOM_PRESENCE'
export type OnlineGameMode='VOICE'|'TEXT'
export interface Hint { Text:string; Strength:HintStrength }
export interface WordEntry { Id:string; Word:string; Category:string; Difficulty:1|2|3; Hints:Hint[]; Tags:string[] }
export interface Player { Id:string; Name:string; Score:number; IsConnected:boolean }
export interface GameSettings { ImpostorCount:number; Categories:string[]; HintMode:HintMode; GameMode:OnlineGameMode; TurnSeconds:number; DiscussionSeconds:number; VotingSeconds:number; RoundCount:number; ShowCategoryToImpostor:boolean; AllowImpostorGuess:boolean }
export interface RoundAssignment { PlayerId:string; Role:Role; TurnPosition:number }
export interface RoundState { Number:number; Phase:GamePhase; WordId:string; Category:string; Hint:string|null; Assignments:RoundAssignment[]; CurrentTurn:number; Votes:Record<string,string>; EligibleVoteTargets:string[]|null; RevealedPlayerIds:string[] }
export interface GameState { Players:Player[]; Settings:GameSettings; Round:RoundState|null; Scores:Record<string,number>; UsedWordIds:string[]; RecentCategories:string[]; RecentImpostorIds:string[] }
