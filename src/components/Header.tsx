import {useEffect,useState} from 'react'
import {useLocation,useNavigate} from 'react-router-dom'
import Logo from './Logo'

export default function Header(){
    const Navigate=useNavigate()
    const Location=useLocation()
    const[Open,SetOpen]=useState(false)
    useEffect(()=>SetOpen(false),[Location.pathname])
    function Go(Path:string){SetOpen(false);window.dispatchEvent(new CustomEvent('impostor:navigate'));Navigate(Path)}
    return <header className="appHeader">
        <button className="logoButton" onClick={()=>Go('/')} aria-label="На главную"><Logo/></button>
        <button className={`menuButton ${Open?'open':''}`} onClick={()=>SetOpen(Value=>!Value)} aria-label={Open?'Закрыть меню':'Открыть меню'} aria-expanded={Open}>
            <span></span><span></span><span></span>
        </button>
        {Open&&<>
            <button className="menuBackdrop" onClick={()=>SetOpen(false)} aria-label="Закрыть меню"/>
            <nav className="headerMenu">
                <button onClick={()=>Go('/')}><span>⌂</span><b>Главная</b></button>
                <button onClick={()=>Go('/rooms')}><span>◎</span><b>Открытые лобби</b></button><button onClick={()=>Go('/local')}><span>◉</span><b>Локальная игра</b></button>
                <button onClick={()=>Go('/rules')}><span>?</span><b>Как играть</b></button>
            </nav>
        </>}
    </header>
}
