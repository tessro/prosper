import { getApiKey, setApiKey, getUsername, setUsername } from './fio';

interface SettingsPaneProps {
  onClose: () => void;
}

export function SettingsPane({ onClose }: SettingsPaneProps) {
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  return (
    <div
      style={{
        width: 280,
        textAlign: 'left',
        position: 'fixed',
        left: 10,
        top: 10,
        zIndex: 10,
        background: '#fafafa',
        border: '1px solid #444',
        padding: 5,
      }}
    >
      Settings <button onClick={onClose}>x</button>
      <p>
        Username:{' '}
        <input
          type="text"
          defaultValue={getUsername() ?? ''}
          onChange={handleUsernameChange}
        />
      </p>
      <p>
        FIO API key:{' '}
        <input
          type="text"
          defaultValue={getApiKey() ? '***' : ''}
          onChange={handleApiKeyChange}
        />
      </p>
    </div>
  );
}
