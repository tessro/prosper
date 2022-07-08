import { useMemo, useState } from 'react';

import { FioClient, UserStorage, UserStorageItem } from './fio';

async function fetchInventory(): Promise<any> {
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
  return (
    <li>
      {quantity} {ticker}
    </li>
  );
}

interface OtherProps {
  type: string;
}

function Other({ type }: OtherProps) {
  return <li>{type}</li>;
}

function StorageLocation({ name, type, inventory }: StorageLocationProps) {
  return (
    <div>
      <div>
        {name} ({type})
      </div>
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
    </div>
  );
}

export default function Inventory() {
  const [inventory, setInventory] = useState<UserStorage>([]);
  useMemo(() => {
    fetchInventory().then((inv) => setInventory(inv));
  }, []);
  console.log(inventory);

  return (
    <div>
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
