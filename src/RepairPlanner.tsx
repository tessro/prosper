import { useMemo, useState } from 'react';

import { FioClient } from './data/fio';
import { RepairManager } from './RepairManager';

const client = new FioClient();

export default function RepairPlanner() {
  const [repairManager, setRepairManager] = useState<RepairManager>(
    RepairManager.empty()
  );
  useMemo(() => {
    client
      .getUserSites()
      .then((sites) => setRepairManager(RepairManager.fromFio(sites)));
  }, []);

  return (
    <div className="pt-20 p-4">
      <table className="table table-compact">
        <thead>
          <tr>
            <th>Building</th>
            <th>Planet</th>
            <th>Last Repair</th>
          </tr>
        </thead>
        <tbody>
          {repairManager.all().map((building) => (
            <tr>
              <td>{building.ticker}</td>
              <td>{building.planet.name ?? building.planet.code}</td>
              <td>
                {Math.round(building.daysSinceRepair)}{' '}
                {Math.round(building.daysSinceRepair) === 1 ? 'day' : 'days'}{' '}
                ago
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
