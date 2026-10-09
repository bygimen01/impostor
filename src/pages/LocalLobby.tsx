import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import Header from '../components/Header'
import Button from '../components/Button'
import {UseLocalGame} from '../store/localGame'
import {Categories} from '../data/words'
import type {GameSettings} from '../game/types'
const HintOptions=[['NONE','Без подсказок'],['STANDARD','Всегда'],['RANDOM','Случайная'],['RANDOM_PRESENCE','50 / 50']] as const
export default function LocalLobby(){
const Navigate=useNavigate()
const {Players,AddPlayer,RemovePlayer,BeginRound,Settings,UpdateSettings}=UseLocalGame()
const [Name,SetName]=useState('')
const [StartError,SetStartError]=useState('')
const [Starting,SetStarting]=useState(false)
async function Start(){SetStartError('');SetStarting(true);try{await BeginRound();Navigate('/local/game')}catch(ErrorValue){SetStartError(String(ErrorValue))}finally{SetStarting(false)}}
function Add(){if(!Name.trim()||Players.length>=12)return;AddPlayer(Name);SetName('')}
function ChangeSettings(Patch:Partial<GameSettings>){UpdateSettings(Patch)}
function ToggleCategory(Category:string){const Current=Settings.Categories;const Next=Current.includes(Category)?Current.filter(Value=>Value!==Category):[...Current,Category];ChangeSettings({Categories:Next.length?Next:['Обычный режим']})}
return <main className="shell localLobby"><Header/><div className="pageHead"><div><div className="eyebrow">ЛОКАЛЬНАЯ ИГРА</div><h1>Игроки</h1></div><div className="counter">{Players.length}/12</div></div>
<section className="panel"><div className="joinRow"><input value={Name} maxLength={20} onChange={Event=>SetName(Event.target.value)} onKeyDown={Event=>Event.key==='Enter'&&Add()} placeholder="Имя игрока"/><Button onClick={Add}>+</Button></div><div className="playerList">{Players.map((Player,Index)=><div className="player" key={Player.Id}><span className="avatar">{Index+1}</span><b>{Player.Name}</b><button className="iconButton" onClick={()=>RemovePlayer(Player.Id)} aria-label={`Удалить ${Player.Name}`}>×</button></div>)}</div></section>
<section className="panel settingsPanel onlineSettings localSettings">
<div className="settingsBlock"><span className="settingLabel">Формат игры</span><div className="choiceGrid"><button className="active" disabled><b>🎙 Голосом</b><small>Один телефон на всех</small></button></div></div>
<div className="settingsBlock"><span className="settingLabel">Подсказки Импостору</span><div className="pillChoices">{HintOptions.map(([Value,Label])=><button key={Value} className={Settings.HintMode===Value?'active':''} onClick={()=>ChangeSettings({HintMode:Value})}>{Label}</button>)}</div></div>
<div className="settingsBlock"><span className="settingLabel">Угадывание слова</span><div className="choiceGrid"><button className={Settings.AllowImpostorGuess?'active':''} onClick={()=>ChangeSettings({AllowImpostorGuess:true})}><b>🧠 Во время игры</b><small>Разрешить попытку угадать слово</small></button><button className={!Settings.AllowImpostorGuess?'active':''} onClick={()=>ChangeSettings({AllowImpostorGuess:false})}><b>Выкл</b><small>Без угадывания во время игры</small></button></div></div>
<div className="settingsBlock"><span className="settingLabel">Последний шанс</span><div className="choiceGrid"><button className={Settings.LastChanceGuess?'active':''} onClick={()=>ChangeSettings({LastChanceGuess:true})}><b>🎯 Включён</b><small>После разоблачения</small></button><button className={!Settings.LastChanceGuess?'active':''} onClick={()=>ChangeSettings({LastChanceGuess:false})}><b>Классика</b><small>Без последнего шанса</small></button></div></div>
<div className="settingsBlock"><span className="settingLabel">Категории</span><div className="categoryChoices">{Categories.map(Category=><button key={Category} className={Settings.Categories.includes(Category)?'active':''} onClick={()=>ToggleCategory(Category)}>{Category}</button>)}</div><small className="settingHelp">Можно выбрать несколько категорий</small></div>
<div className="settingsBlock"><span className="settingLabel">Импосторов</span><div className="stepper"><button onClick={()=>ChangeSettings({ImpostorCount:Math.max(1,Settings.ImpostorCount-1)})}>−</button><b>{Settings.ImpostorCount}</b><button onClick={()=>ChangeSettings({ImpostorCount:Math.min(3,Math.max(1,Players.length-1),Settings.ImpostorCount+1)})}>+</button></div></div>
<div className="roomQuickStats"><span>♾ Раунды без лимита</span></div>
</section>{StartError&&<div className="error">{StartError}</div>}<div className="lobbyActions"><Button disabled={Players.length<3||Starting} onClick={()=>void Start()}>Начать игру</Button><Button className="secondary rulesAction" onClick={()=>Navigate('/rules')}>Как играть</Button></div></main>
}