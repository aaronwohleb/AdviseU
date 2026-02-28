import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainMenu from './components/MainMenu';
import CreatePlan from './components/CreatePlan';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* The base URL shows the animated hero screen */}
        <Route path="/" element={<MainMenu />} />
        
        {/* The /create URL shows the form */}
        <Route path="/create" element={<CreatePlan />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;