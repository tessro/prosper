import { useContext, useMemo, useState } from 'react';

import { FioClient, UserStorage, UserStorageItem } from './fio';
import { OrderBookContext } from './contexts/OrderBookContext';

async function fetchInventory(): Promise<UserStorage> {
  const client = new FioClient();
  return client.getUserStorage();
}

interface StorageLocationProps {
  name: string | null;
  type: string;
  inventory: UserStorageItem[];
}

interface MaterialProps {
  ticker: string | null;
  name: string | null;
  type: string;
  quantity: number;
  weight: number;
  volume: number;
}

function Material({ ticker, quantity }: MaterialProps) {
  const orderBook = useContext(OrderBookContext);
  let cx;
  if (orderBook) {
    cx = orderBook.find(
      (m) => m.MaterialTicker === ticker && m.ExchangeCode === 'IC1'
    );
  }

  return (
    <tr>
      <td>{quantity}</td>
      <td>{ticker}</td>
      <td>{Math.round(100 * (cx?.PriceAverage ?? 0)) / 100}</td>
      <td>{Math.round(quantity * 100 * (cx?.PriceAverage ?? 0)) / 100}</td>
    </tr>
  );
}

interface OtherProps {
  type: string;
}

function Other({ type }: OtherProps) {
  return (
    <tr>
      <td colSpan={4}>{type}</td>
    </tr>
  );
}

function StorageLocation({ name, type, inventory }: StorageLocationProps) {
  return (
    <div>
      <div className="my-2 font-bold">
        {name} ({type})
      </div>
      <table className="table bg-base-200">
        <thead>
          <tr>
            <th>Qty</th>
            <th>Mat.</th>
            <th>Price</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map((material) => {
            if (material.Type === 'INVENTORY') {
              return (
                <Material
                  ticker={material.MaterialTicker}
                  name={material.MaterialName}
                  type={material.Type}
                  quantity={material.MaterialAmount}
                  weight={material.TotalWeight}
                  volume={material.TotalVolume}
                />
              );
            } else {
              return <Other type={material.Type} />;
            }
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function Inventory() {
  const [inventory, setInventory] = useState<UserStorage>([]);
  useMemo(() => {
    fetchInventory().then((inv) => setInventory(inv));
  }, []);

  return (
    <div className="pt-20 p-4">
      {inventory.map((location) => (
        <StorageLocation
          name={location.Name}
          type={location.Type}
          inventory={location.StorageItems}
        />
      ))}
    </div>
  );
}
