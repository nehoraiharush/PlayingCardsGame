import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './screens/Login';
import Scoreboard from './screens/Scoreboard';
import Game from './screens/Game';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/scoreboard' element={<Scoreboard />} />
          <Route path='/game' element={<Game />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
