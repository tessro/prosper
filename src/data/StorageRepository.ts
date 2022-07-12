import { UserStorage } from './fio';

type FioItemType = UserStorage[number]['StorageItems'][number]['Type'];
type FioStorageType = UserStorage[number]['Type'];

type ItemType = 'material' | 'blocked' | 'shipment';
type StoreType = 'base' | 'warehouse' | 'ship' | 'stl' | 'ftl';

export interface StoreItem {
  id: string;
  type: ItemType;
  ticker?: string;
  name?: string;
  quantity: number;
  unitVolume: number;
  unitWeight: number;
  totalVolume: number;
  totalWeight: number;
}

interface StoreUsage {
  capacity: number;
  used: number;
}

export interface Store {
  id: string;
  parentId: string;
  type: StoreType;
  name?: string;
  items: StoreItem[];
  volume: StoreUsage;
  weight: StoreUsage;
}

function convertFioType(type: FioStorageType): StoreType {
  switch (type) {
    case 'STORE':
      return 'base';
    case 'WAREHOUSE_STORE':
      return 'warehouse';
    case 'SHIP_STORE':
      return 'ship';
    case 'FTL_FUEL_STORE':
      return 'ftl';
    case 'STL_FUEL_STORE':
      return 'stl';
  }
}

function convertFioItemType(type: FioItemType): ItemType {
  switch (type) {
    case 'INVENTORY':
      return 'material';
    case 'BLOCKED':
      return 'blocked';
    case 'SHIPMENT':
      return 'shipment';
  }
}

export class StorageRepository {
  private readonly stores: Store[];

  static fromFio(userStorage: UserStorage): StorageRepository {
    const stores: Store[] = [];

    for (const store of userStorage) {
      stores.push({
        id: store.StorageId,
        parentId: store.AddressableId,
        type: convertFioType(store.Type),
        name: store.Name ?? undefined,
        volume: {
          capacity: store.VolumeCapacity,
          used: store.VolumeLoad,
        },
        weight: {
          capacity: store.WeightCapacity,
          used: store.WeightLoad,
        },
        items: store.StorageItems.map((item) => ({
          id: item.MaterialId,
          type: convertFioItemType(item.Type),
          name: item.MaterialName ?? undefined,
          ticker: item.MaterialTicker ?? undefined,
          quantity: item.MaterialAmount,
          // MaterialVolume/MaterialWeight seem to suffer from rounding errors
          unitVolume: item.TotalVolume / item.MaterialAmount,
          unitWeight: item.TotalWeight / item.MaterialAmount,
          totalVolume: item.TotalVolume,
          totalWeight: item.TotalWeight,
        })),
      });
    }

    return new StorageRepository(stores);
  }

  constructor(stores: Store[]) {
    this.stores = stores;
  }

  all(): Store[] {
    return this.stores;
  }

  findById(id: string): Store | null {
    return this.stores.find((store) => store.id === id) ?? null;
  }

  findByType(type: StoreType): Store[] {
    return this.stores.filter((store) => store.type === type);
  }

  findByParentId(id: string): Store[] {
    return this.stores.filter((store) => store.parentId === id);
  }
}
