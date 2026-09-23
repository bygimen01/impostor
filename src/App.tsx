import {Routes,Route,Navigate} from 'react-router-dom'
import Home from './pages/Home'
import LocalLobby from './pages/LocalLobby'
import LocalGame from './pages/LocalGame'
import OnlineRoom from './pages/OnlineRoom'
import Rules from './pages/Rules'
import PublicRooms from './pages/PublicRooms'
import Invite from './pages/Invite'
export default function App(){return <Routes><Route path="/" element={<Home/>}/><Route path="/local" element={<LocalLobby/>}/><Route path="/local/game" element={<LocalGame/>}/><Route path="/invite/:code" element={<Invite/>}/><Route path="/room/:code" element={<OnlineRoom/>}/><Route path="/rules" element={<Rules/>}/><Route path="/rooms" element={<PublicRooms/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Routes>}
