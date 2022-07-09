import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import { OrderBookProvider } from './contexts/OrderBookContext';
import { Nav } from './Nav';
import { SettingsPane } from './SettingsPane';

export default function App() {
  const [showSettings, setShowSettings] = useState(false);

  const handleSettingsOpen = () => {
    setShowSettings(true);
  };

  const handleSettingsClose = () => {
    setShowSettings(false);
  };

  return (
    <OrderBookProvider>
      <div>
        {showSettings ? <SettingsPane onClose={handleSettingsClose} /> : <></>}
        <Nav onSettingsClick={handleSettingsOpen} />
        <Outlet />
      </div>
    </OrderBookProvider>
  );
}
