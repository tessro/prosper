import { useMemo, useState } from 'react';

import { FioClient } from './data/fio';
import { RepairManager } from './RepairManager';

const client = new FioClient();

export default function RepairPlanner() {
  const [repairThreshold, setRepairThreshold] = useState<number>(89);
  const [showWithin, setShowWithin] = useState<number>(28);
  const [sevenDayBug, setSevenDayBug] = useState<boolean>(false);
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

  const handleShowWithinChange = (e: any) => {
    setShowWithin(e.target.value);
  };

  const handleSevenDayBugChange = (e: any) => {
    setSevenDayBug(e.target.checked);
  };

  return (
    <div className="pt-20 p-4">
      <div className="flex flex-row space-x-4">
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
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">
              Show buildings needing repair within
            </span>
          </label>
          <label className="input-group">
            <input
              type="number"
              className="input input-bordered w-20"
              defaultValue={showWithin}
              onChange={handleShowWithinChange}
            />
            <span>days</span>
          </label>
        </div>
        <div className="form-control mb-4">
          <label className="label cursor-pointer">
            <input
              type="checkbox"
              className="checkbox"
              defaultChecked={sevenDayBug}
              onChange={handleSevenDayBugChange}
            />
            <span className="label-text ml-2">Enable seven day bug</span>
          </label>
        </div>
      </div>
      <table className="table table-compact">
        <thead>
          <tr>
            <th>Building</th>
            <th>Planet</th>
            <th>Last Repair</th>
            <th>Next Repair</th>
            <th>Repair % (now)</th>
            <th>Repair Cost (now)</th>
            <th>Repair % (at {repairThreshold}d)</th>
            <th>Repair Cost (at {repairThreshold}d)</th>
          </tr>
        </thead>
        <tbody>
          {repairManager
            .needingRepairWithin(showWithin, repairThreshold)
            .map((building) => (
              <tr key={building.id}>
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
                <td>
                  {Math.round(
                    1000 *
                      building.repairPercentage(
                        building.daysSinceRepair,
                        sevenDayBug
                      )
                  ) / 10}
                  %
                </td>
                <td>
                  <ul>
                    {building
                      .repairCosts(building.daysSinceRepair, sevenDayBug)
                      .map((cost) => (
                        <li key={cost.ticker}>
                          {cost.quantity} {cost.ticker}
                        </li>
                      ))}
                  </ul>
                </td>
                <td>
                  {Math.round(
                    1000 *
                      building.repairPercentage(repairThreshold, sevenDayBug)
                  ) / 10}
                  %
                </td>
                <td>
                  <ul>
                    {building
                      .repairCosts(repairThreshold, sevenDayBug)
                      .map((cost) => (
                        <li key={cost.ticker}>
                          {cost.quantity} {cost.ticker}
                        </li>
                      ))}
                  </ul>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
