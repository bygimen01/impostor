import {Navigate,useNavigate} from 'react-router-dom'
import {useState} from 'react'
import type {ReactNode} from 'react'
import Header from '../components/Header'
import Button from '../components/Button'
import RoleCard from '../components/RoleCard'
import {UseLocalGame} from '../store/localGame'
import {CurrentLocalWords} from '../services/localWords'
type Stage='REVEAL'|'TURNS'|'DISCUSSION'|'CHOOSE'|'VOTE_RESULT'|'LAST_CHANCE'|'RESULT'
export default function LocalGame(){
const NavigateTo=useNavigate()
const {Players,Round,BeginRound,Settings}=UseLocalGame()
const [Stage,SetStage]=useState<Stage>('REVEAL')
const [Index,SetIndex]=useState(0)
const [Cycle,SetCycle]=useState(1)
const [Ready,SetReady]=useState(false)
const [Selected,SetSelected]=useState<string[]>([])
const [GuessResult,SetGuessResult]=useState<'CORRECT'|'WRONG'|null>(null)
const [GuessStage,SetGuessStage]=useState<'DURING'|'LAST'|null>(null)
if(!Round)return <Navigate to="/local" replace/>
const Word=CurrentLocalWords.find(Entry=>Entry.Id===Round.WordId)
if(!Word)return <Navigate to="/local" replace/>
const Ordered=[...Round.Assignments].sort((First,Second)=>First.TurnPosition-Second.TurnPosition)
const CurrentAssignment=Ordered[Index%Ordered.length]
const CurrentPlayer=Players.find(Player=>Player.Id===CurrentAssignment.PlayerId)
const Impostors=Ordered.filter(Assignment=>Assignment.Role==='IMPOSTOR').map(Assignment=>Assignment.PlayerId)
const Caught=Selected.length===Impostors.length&&Selected.every(Id=>Impostors.includes(Id))
async function NewRound(){await BeginRound();SetStage('REVEAL');SetIndex(0);SetCycle(1);SetReady(false);SetSelected([]);SetGuessResult(null);SetGuessStage(null)}
function BeginVoting(){SetIndex(0);SetReady(false);SetSelected([]);SetStage('CHOOSE')}
function ResolveGuess(Correct:boolean,Kind:'DURING'|'LAST'){SetGuessResult(Correct?'CORRECT':'WRONG');SetGuessStage(Kind);SetStage('RESULT')}
const Shell=({children}:{children:ReactNode})=><main className="shell gameScreen"><Header/>{children}</main>
if(Stage==='REVEAL'){
if(Index>=Players.length)return <Shell><section className="handoff celebrate"><div className="bigSticker">🎭</div><div className="eyebrow">ВСЕ ГОТОВЫ</div><h1>Роли розданы</h1><p>Каждый даёт ассоциацию. Не называйте загаданное слово.</p><Button onClick={()=>{SetIndex(0);SetStage('TURNS')}}>Начать круг</Button></section></Shell>
return <Shell>{!Ready?<section className="handoff"><div className="handoffSticker">📱</div><div className="eyebrow">ИГРОК {Index+1} ИЗ {Players.length}</div><h1>Передайте телефон</h1><div className="namePlate">{CurrentPlayer?.Name}</div><p>Убедитесь, что экран видите только вы.</p><Button onClick={()=>SetReady(true)}>Телефон у меня</Button></section>:<section className="roleStage"><RoleCard Role={CurrentAssignment.Role} Word={Word.Word} Hint={Round.Hint}/><Button className="secondary handoffButton" onClick={()=>{SetReady(false);SetIndex(Value=>Value+1)}}>Скрыть и передать дальше</Button></section>}</Shell>
}
if(Stage==='TURNS'){
const NextPlayer=Players.find(Player=>Player.Id===Ordered[(Index+1)%Ordered.length].PlayerId)
return <Shell><section className="handoff turnCard"><div className="handoffSticker">🎙️</div><div className="eyebrow">КРУГ {Cycle} · ХОД {Index+1} ИЗ {Players.length}</div><h1>Сейчас говорит</h1><div className="namePlate">{CurrentPlayer?.Name}</div><div className="gameFact"><span>Дальше</span><b>{NextPlayer?.Name}</b></div><p>Назовите одну ассоциацию, не раскрывая слово.</p><Button onClick={()=>{if(Index+1>=Players.length){SetIndex(0);SetStage('DISCUSSION')}else SetIndex(Value=>Value+1)}}>Готово</Button></section></Shell>
}
if(Stage==='DISCUSSION')return <Shell><section className="handoff discussionCard"><div className="handoffSticker">🗣️</div><div className="eyebrow">КРУГ {Cycle}</div><h1>Кто здесь лишний?</h1><p>Обсудите ассоциации. Можно начать ещё один круг с теми же ролями и словом, как в онлайн-режиме.</p><div className="roundDecision"><Button onClick={BeginVoting}>🗳 Голосование</Button><Button className="secondary" onClick={()=>{SetCycle(Value=>Value+1);SetIndex(0);SetStage('TURNS')}}>↻ Ещё круг</Button></div>{Settings.AllowImpostorGuess&&<div className="voiceGuessBox"><strong>Импостор назвал слово?</strong><p>Если Импостор рискнул угадать слово вслух, отметьте результат. Попытка завершает раунд.</p><div className="guessActions"><Button onClick={()=>ResolveGuess(true,'DURING')}>Импостор угадал</Button><Button className="secondary" onClick={()=>ResolveGuess(false,'DURING')}>Ошибся</Button></div></div>}</section></Shell>
if(Stage==='CHOOSE')return <Shell><section className="panel suspectPanel"><div className="handoffSticker">🎯</div><div className="eyebrow">ОБЩЕЕ РЕШЕНИЕ</div><h1>Кого кикаем?</h1><p>Выберите {Settings.ImpostorCount===1?'одного игрока':Settings.ImpostorCount+' игроков'}. Телефон передавать не нужно.</p><div className="suspectGrid">{Players.map(Player=><button key={Player.Id} className={'suspectCard '+(Selected.includes(Player.Id)?'selected':'')} onClick={()=>SetSelected(Current=>Current.includes(Player.Id)?Current.filter(Id=>Id!==Player.Id):Current.length<Settings.ImpostorCount?[...Current,Player.Id]:Current)}><span className="avatar">{Player.Name.slice(0,1).toUpperCase()}</span><b>{Player.Name}</b><span>{Selected.includes(Player.Id)?'✓':''}</span></button>)}</div><Button disabled={Selected.length!==Settings.ImpostorCount} onClick={()=>SetStage('VOTE_RESULT')}>Кикнуть и раскрыть</Button></section></Shell>
if(Stage==='VOTE_RESULT')return <Shell><section className="panel voting"><div className="eyebrow">ИТОГ ВЫБОРА</div><h2>{Caught?'Импостор раскрыт':'Импостор ускользнул'}</h2><div className="voteResultCards">{Players.filter(Player=>Selected.includes(Player.Id)||Impostors.includes(Player.Id)).map(Player=><article className={'voteResultCard '+(Selected.includes(Player.Id)?'selected ':'')+(Impostors.includes(Player.Id)?'impostor':'')} key={Player.Id}><div className="voteCandidateTop"><strong>{Player.Name}</strong><div className="voteBadges">{Impostors.includes(Player.Id)&&<b className="impostorBadge">ИМПОСТОР</b>}{Selected.includes(Player.Id)&&<b className="selectedBadge">ВЫБРАН</b>}</div></div></article>)}</div><Button onClick={()=>SetStage(Caught&&Settings.LastChanceGuess?'LAST_CHANCE':'RESULT')}>{Caught&&Settings.LastChanceGuess?'Последний шанс':'Показать результат'}</Button></section></Shell>
if(Stage==='LAST_CHANCE')return <Shell><section className="panel voting guessFinal"><div className="handoffSticker">🎯</div><div className="eyebrow">ПОСЛЕДНИЙ ШАНС</div><h2>Импостор раскрыт</h2><p>Импостор может один раз назвать слово вслух. Отметьте результат попытки.</p><div className="guessActions"><Button onClick={()=>ResolveGuess(true,'LAST')}>Импостор угадал</Button><Button className="secondary" onClick={()=>ResolveGuess(false,'LAST')}>Импостор ошибся</Button></div></section></Shell>
const ImpostorWon=GuessResult==='CORRECT'||(GuessStage!=='DURING'&&GuessResult!=='WRONG'&&!Caught)
const ResultTitle=GuessResult==='CORRECT'?'Импостор угадал слово':GuessResult==='WRONG'?'Импостор ошибся':Caught?'Импостор раскрыт':'Импостор ускользнул'
return <Shell><section className={'resultHero '+(ImpostorWon?'missResult':'successResult')}><div className="resultSticker">{ImpostorWon?'😈':'🎉'}</div><div className="eyebrow">РЕЗУЛЬТАТ РАУНДА</div><h1>{ResultTitle}</h1><p>Импостор{Impostors.length>1?'ы':''}: <b>{Players.filter(Player=>Impostors.includes(Player.Id)).map(Player=>Player.Name).join(', ')}</b></p><div className="wordReveal"><span>Загаданное слово</span><strong>{Word.Word}</strong><small>{Word.Category}</small></div></section><section className="resultActions"><Button onClick={NewRound}>Следующий раунд · {Round.Number+1}</Button><Button className="secondary" onClick={()=>NavigateTo('/local')}>В лобби</Button></section></Shell>
}