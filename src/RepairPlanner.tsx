import { useMemo, useState } from 'react';

import { FioClient } from './data/fio';
import { RepairManager } from './RepairManager';

const client = new FioClient();

export default function RepairPlanner() {
  const [repairThreshold, setRepairThreshold] = useState<number>(89);
  const [repairManager, setRepairManager] = useState<RepairManager>(
    RepairManager.empty()
  );
  useMemo(() => {
    client
      .getUserSites()
      .then((sites) => setRepairManager(RepairManager.fromFio(sites)));
  }, []);

  const handleThresholdChange = (e: any) => {
    setRepairThreshold(e.target.value);
  };

  return (
    <div className="pt-20 p-4">
      <div className="form-control mb-4">
        <label className="label">
          <span className="label-text">Repair frequency</span>
        </label>
        <label className="input-group">
          <input
            type="number"
            className="input input-bordered w-20"
            defaultValue={repairThreshold}
            onChange={handleThresholdChange}
          />
          <span>days</span>
        </label>
      </div>
      <table className="table table-compact">
        <thead>
          <tr>
            <th>Building</th>
            <th>Planet</th>
            <th>Last Repair</th>
            <th>Next Repair</th>
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
              <td>
                {Math.round(building.daysUntil(repairThreshold))}{' '}
                {Math.round(building.daysUntil(repairThreshold)) === 1
                  ? 'day'
                  : 'days'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
