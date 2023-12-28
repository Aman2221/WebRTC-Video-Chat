import { Routes, Route } from "react-router-dom";
import './styles/App.css';
import Lobby from "./screens/Lobby";
import Room from "./screens/Room";
import 'react-toastify/dist/ReactToastify.css';

function App() {
  
  return (
    <div className="App">
      <Routes>
          <Route path="/" element={<Lobby />}></Route>
          <Route path="/room/:roomId" element={<Room />}></Route>
      </Routes>
    </div>
  );
}

export default App;
