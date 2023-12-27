import { Routes, Route } from "react-router-dom";
import './styles/App.css';
import Lobby from "./screens/Lobby";

function App() {
  return (
    <div className="App">
    <Routes>
      <Route path="/" element={<Lobby />}></Route>
    </Routes>
    </div>
  );
}

export default App;
