import { useContext, useMemo, useState } from 'react';

import {
  FioClient,
  StationRepository,
  Store,
  StoreItem,
  StorageRepository,
  UserShips,
  UserSites,
  UserStorage,
} from './data';
import { OrderBookContext } from './contexts/OrderBookContext';

const client = new FioClient();
const stations = StationRepository.default();

interface StorageLocationProps {
  name?: string;
  type: string;
  inventory: StoreItem[];
}

interface MaterialProps {
  ticker?: string;
  name?: string;
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
            if (material.type === 'material') {
              return (
                <Material
                  key={material.id}
                  ticker={material.ticker}
                  name={material.name}
                  type={material.type}
                  quantity={material.quantity}
                  weight={material.totalWeight}
                  volume={material.totalVolume}
                />
              );
            } else {
              return <Other type={material.type} />;
            }
          })}
        </tbody>
      </table>
    </div>
  );
}

interface ShipInventoryProps {
  ship: UserShips[number];
  hold?: Store | null;
  ftlTank?: Store | null;
  stlTank?: Store | null;
}

function ShipInventory({ ship, hold, ftlTank, stlTank }: ShipInventoryProps) {
  return (
    <div>
      <div className="my-2 font-bold">🚀 {ship.Name}</div>
      {hold && (
        <StorageLocation
          name={hold.name}
          type={hold.type}
          inventory={hold.items}
        />
      )}
    </div>
  );
}

interface SiteInventoryProps {
  site: UserSites[number];
  inventory: Store[];
}

function SiteInventory({ site, inventory }: SiteInventoryProps) {
  return (
    <div>
      <div className="my-2 font-bold">🪐 {site.PlanetName}</div>
      <StorageLocation
        name={inventory[0].name}
        type={inventory[0].type}
        inventory={inventory[0].items}
      />
    </div>
  );
}

interface WarehouseProps {
  inventory: Store;
}

function Warehouse({ inventory }: WarehouseProps) {
  const station = stations.findByWarehouseId(inventory.parentId);
  const displayName = station
    ? `${station.name} (${station.system.code})`
    : inventory.parentId;

  return (
    <div>
      <div className="my-2 font-bold">📦 {displayName}</div>
      <StorageLocation
        name={inventory.name}
        type={inventory.type}
        inventory={inventory.items}
      />
    </div>
  );
}

export default function Inventory() {
  const [inventory, setInventory] = useState<UserStorage>([]);
  const [ships, setShips] = useState<UserShips>([]);
  const [sites, setSites] = useState<UserSites>([]);
  useMemo(() => {
    client.getUserStorage().then((inv) => setInventory(inv));
  }, []);
  useMemo(() => {
    client.getUserShips().then((ships) => setShips(ships));
  }, []);
  useMemo(() => {
    client.getUserSites().then((sites) => setSites(sites));
  }, []);

  const storage = StorageRepository.fromFio(inventory);

  return (
    <div className="pt-20 p-4">
      {ships.map((ship) => (
        <ShipInventory
          key={ship.ShipId}
          ship={ship}
          hold={storage.findById(ship.StoreId)}
          ftlTank={storage.findById(ship.FtlFuelStoreId)}
          stlTank={storage.findById(ship.StlFuelStoreId)}
        />
      ))}
      {sites.map((site) => (
        <SiteInventory
          key={site.SiteId}
          site={site}
          inventory={storage.findByParentId(site.SiteId)}
        />
      ))}
      {storage.findByType('warehouse').map((wh) => (
        <Warehouse key={wh.id} inventory={wh} />
      ))}
    </div>
  );
}
