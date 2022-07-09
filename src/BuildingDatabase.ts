import { Building, loadBuildings } from './fio';

export class BuildingDatabase {
  private readonly buildings: Building[];
  private readonly byTicker: Record<string, Building> = {};

  static default(): BuildingDatabase {
    return new BuildingDatabase(loadBuildings());
  }

  constructor(buildings: Building[]) {
    this.buildings = buildings.sort((a, b) => a.ticker.localeCompare(b.ticker));

    for (const building of buildings) {
      this.byTicker[building.ticker] = building;
    }
  }

  all(): Building[] {
    return this.buildings;
  }

  findByTicker(ticker: string): Building | null {
    return this.byTicker[ticker] ?? null;
  }
}
