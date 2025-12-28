import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Landing } from './components/Landing';
import { HostView } from './components/HostView';
import { PlayerView } from './components/PlayerView';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/host" element={<HostView />} />
        <Route path="/play/:hostId" element={<PlayerView />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
