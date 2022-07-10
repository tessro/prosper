import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import { OrderBookProvider } from './contexts/OrderBookContext';
import { FioClient } from './data';
import { Nav } from './Nav';
import { SettingsPane } from './SettingsPane';

(globalThis as any).fio = new FioClient();

export default function App() {
  const [showSettings, setShowSettings] = useState(false);

  const handleSettingsClick = () => {
    setShowSettings(!showSettings);
  };

  const handleSettingsClose = () => {
    setShowSettings(false);
  };

  return (
    <OrderBookProvider>
      <div>
        {showSettings ? <SettingsPane onClose={handleSettingsClose} /> : <></>}
        <Nav onSettingsClick={handleSettingsClick} />
        <Outlet />
      </div>
    </OrderBookProvider>
  );
}
