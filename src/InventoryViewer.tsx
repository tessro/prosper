import { useContext, useMemo, useState } from 'react';

import {
  Exchange,
  ExchangeRepository,
  FioClient,
  PriceSource,
  StationRepository,
  Store,
  StorageRepository,
  UserShips,
  UserSites,
  UserStorage,
} from './data';
import { OrderBookContext } from './contexts/OrderBookContext';

function formatCurrency(amount: number, currency: string): string {
  const value = amount.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  });
  return `${value} ${currency}`;
}

const client = new FioClient();
const exchanges = ExchangeRepository.default();
const stations = StationRepository.default();

interface StorageLocationProps {
  store: Store;
  defaultExchange: Exchange;
  defaultPriceSource: PriceSource;
}

interface MaterialProps {
  ticker?: string;
  name?: string;
  type: string;
  quantity: number;
  weight: number;
  volume: number;
  price: number;
  currencyCode: string;
}

function Material({ ticker, price, quantity, currencyCode }: MaterialProps) {
  return (
    <tr>
      <td className="text-right">{quantity}</td>
      <td>{ticker}</td>
      <td className="text-right">{formatCurrency(price, currencyCode)}</td>
      <td className="text-right">
        {formatCurrency(quantity * price, currencyCode)}
      </td>
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

function StorageLocation({
  store,
  defaultExchange,
  defaultPriceSource,
}: StorageLocationProps) {
  const orderBook = useContext(OrderBookContext);

  const totalValue = store.items.reduce((total, item) => {
    if (item.ticker)
      total +=
        item.quantity *
        (orderBook.findByTicker(item.ticker, defaultExchange.code)?.[
          defaultPriceSource
        ] ?? 0);
    return total;
  }, 0);
  return (
    <div>
      <table className="table table-compact bg-base-200 w-full">
        <thead>
          <tr>
            <th>Qty</th>
            <th>Mat.</th>
            <th className="text-center">Price</th>
            <th className="text-center">Value</th>
          </tr>
        </thead>
        <tbody>
          {store.items.map((material) => {
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
                  price={
                    material.ticker
                      ? orderBook.findByTicker(
                          material.ticker,
                          defaultExchange.code
                        )?.[defaultPriceSource] ?? 0
                      : 0
                  }
                  currencyCode={defaultExchange.currencyCode}
                />
              );
            } else {
              return <Other type={material.type} />;
            }
          })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3}>Total</td>
            <td className="text-right">
              {formatCurrency(totalValue, defaultExchange.currencyCode)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

interface FuelTankProps {
  type: 'ftl' | 'stl';
  tank: Store;
}

function FuelTank({ type, tank }: FuelTankProps) {
  const pct = (100 * tank.volume.used) / tank.volume.capacity;
  return (
    <div className="flex items-center space-x-1">
      <div className="font-bold">{type.toUpperCase()}</div>
      <progress className="progress w-40" value={pct} max="100"></progress>
    </div>
  );
}

interface ShipInventoryProps {
  ship: UserShips[number];
  hold?: Store | null;
  ftlTank?: Store | null;
  stlTank?: Store | null;
  defaultExchange: Exchange;
  defaultPriceSource: PriceSource;
}

function ShipInventory({
  ship,
  hold,
  ftlTank,
  stlTank,
  defaultExchange,
  defaultPriceSource,
}: ShipInventoryProps) {
  return (
    <div>
      <div className="my-2 font-bold">🚀 {ship.Name}</div>
      {stlTank && <FuelTank type="stl" tank={stlTank} />}
      {ftlTank && <FuelTank type="ftl" tank={ftlTank} />}
      {hold && (
        <StorageLocation
          store={hold}
          defaultExchange={defaultExchange}
          defaultPriceSource={defaultPriceSource}
        />
      )}
    </div>
  );
}

interface SiteInventoryProps {
  site: UserSites[number];
  stores: Store[];
  defaultExchange: Exchange;
  defaultPriceSource: PriceSource;
}

function SiteInventory({
  site,
  stores,
  defaultExchange,
  defaultPriceSource,
}: SiteInventoryProps) {
  return (
    <div>
      <div className="my-2 font-bold">🪐 {site.PlanetName}</div>
      {stores.length > 0 && (
        <StorageLocation
          store={stores[0]}
          defaultExchange={defaultExchange}
          defaultPriceSource={defaultPriceSource}
        />
      )}
    </div>
  );
}

interface WarehouseProps {
  inventory: Store;
  defaultExchange: Exchange;
  defaultPriceSource: PriceSource;
}

function Warehouse({
  inventory,
  defaultExchange,
  defaultPriceSource,
}: WarehouseProps) {
  const station = stations.findByWarehouseId(inventory.parentId);
  const displayName = station
    ? `${station.name} (${station.system.code})`
    : inventory.parentId;

  return (
    <div>
      <div className="my-2 font-bold">📦 {displayName}</div>
      <StorageLocation
        store={inventory}
        defaultExchange={defaultExchange}
        defaultPriceSource={defaultPriceSource}
      />
    </div>
  );
}

export default function InventoryViewer() {
  const [exchange, setExchange] = useState<Exchange>(
    exchanges.findByCode('IC1')
  );
  const [priceSource, setPriceSource] = useState<PriceSource>('average');
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

  const handleExchangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setExchange(exchanges.findByCode(e.target.value));
  };

  const handlePriceSourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPriceSource(e.target.value as PriceSource);
  };

  return (
    <div className="pt-20 p-4">
      <select
        className="select"
        defaultValue={exchange.code}
        onChange={handleExchangeChange}
      >
        {exchanges.all().map((exchange) => (
          <option key={exchange.code}>{exchange.code}</option>
        ))}
      </select>
      <select
        className="select"
        defaultValue={priceSource}
        onChange={handlePriceSourceChange}
      >
        <option key="bid">bid</option>
        <option key="ask">ask</option>
        <option key="average">average</option>
        <option key="last">last</option>
      </select>
      <div className="flex space-x-4">
        {ships.map((ship) => (
          <div className="w-80">
            <ShipInventory
              key={ship.ShipId}
              ship={ship}
              hold={storage.findById(ship.StoreId)}
              ftlTank={storage.findById(ship.FtlFuelStoreId)}
              stlTank={storage.findById(ship.StlFuelStoreId)}
              defaultExchange={exchange}
              defaultPriceSource={priceSource}
            />
          </div>
        ))}
      </div>
      <div className="flex space-x-4">
        {sites.map((site) => (
          <div className="w-80">
            <SiteInventory
              key={site.SiteId}
              site={site}
              stores={storage.findByParentId(site.SiteId)}
              defaultExchange={exchange}
              defaultPriceSource={priceSource}
            />
          </div>
        ))}
      </div>
      <div className="flex space-x-4">
        {storage.findByType('warehouse').map((wh) => (
          <div className="w-80">
            <Warehouse
              key={wh.id}
              inventory={wh}
              defaultExchange={exchange}
              defaultPriceSource={priceSource}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
