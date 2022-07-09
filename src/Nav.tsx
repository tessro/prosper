import { Link } from 'react-router-dom';

interface NavProps {
  onSettingsClick: () => void;
}

export function Nav({ onSettingsClick }: NavProps) {
  return (
    <div className="navbar bg-base-200 fixed z-10 shadow">
      <div className="flex-1 space-x-1">
        <Link to="/" className="btn btn-ghost normal-case text-xl">
          Prosper
        </Link>
        <Link to="/production-chains" className="btn btn-ghost">
          Production Chain Viewer
        </Link>
        <Link to="/inventory" className="btn btn-ghost">
          Inventory
        </Link>
      </div>
      <div>
        <button className="btn" onClick={onSettingsClick}>
          ⚙️ Settings
        </button>
      </div>
    </div>
  );
}
