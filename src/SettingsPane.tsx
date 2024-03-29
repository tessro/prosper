import { getApiKey, setApiKey, getUsername, setUsername } from './data';

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
    <div className="card card-compact w-96 bg-base-300 shadow-xl fixed top-20 right-5 z-10">
      <div className="card-body">
        <div className="card-title">
          Settings
          <div className="card-actions w-full justify-end">
            <button onClick={onClose} className="btn btn-square btn-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="form-control w-full">
          <label className="label" htmlFor="settings/username">
            Username
          </label>
          <input
            type="text"
            id="settings/username"
            className="input"
            autoComplete="off"
            placeholder="Your Prosperous Universe username"
            defaultValue={getUsername() ?? ''}
            onChange={handleUsernameChange}
          />
        </div>
        <div className="form-control w-full">
          <label className="label" htmlFor="settings/apiKey">
            FIO API key
          </label>
          <input
            type="text"
            id="settings/apiKey"
            className="input"
            autoComplete="off"
            placeholder="An API key from fio.fnar.net"
            defaultValue={getApiKey() ? '***' : ''}
            onChange={handleApiKeyChange}
          />
          <label className="label">
            <span className="label-text-alt">
              Stored in <code>localStorage</code> – never leaves your computer
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
