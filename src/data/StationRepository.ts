import stationData from './station.json';

interface Exchange {
  id: string;
  name: string;
  code: string;
}

interface System {
  id: string;
  name: string;
  code: string;
}

export interface Station {
  id: string;
  code: string;
  name: string;
  cx: Exchange;
  system: System;
  countryCode: string;
  currencyCode: string;
  warehouseId: string;
}

export class StationRepository {
  private readonly stations: Station[];

  static default(): StationRepository {
    const results: Station[] = [];

    for (const station of stationData) {
      results.push({
        id: station.StationId,
        code: station.NaturalId,
        name: station.Name,
        cx: {
          id: station.ComexId,
          name: station.ComexName,
          code: station.ComexCode,
        },
        system: {
          id: station.SystemId,
          name: station.SystemName,
          code: station.SystemNaturalId,
        },
        countryCode: station.CountryCode,
        currencyCode: station.CurrencyCode,
        warehouseId: station.WarehouseId,
      });
    }

    return new StationRepository(results);
  }

  constructor(stations: Station[]) {
    this.stations = stations;
  }

  all(): Station[] {
    return this.stations;
  }

  findById(id: string): Station | null {
    return this.stations.find((station) => station.id === id) ?? null;
  }

  findByWarehouseId(id: string): Station | null {
    return this.stations.find((station) => station.warehouseId === id) ?? null;
  }
}
