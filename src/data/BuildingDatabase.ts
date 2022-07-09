import buildings from './allbuildings.json';
import { Workforce } from './workforce';

interface BuildingCost {
  name: string;
  ticker: string;
  weight: number;
  volume: number;
  quantity: number;
}

export interface Building {
  id: string;
  name: string;
  ticker: string;
  expertise: string | null;
  workforce: Workforce;
  area: number;
  costs: BuildingCost[];
}

export function loadBuildings(): Building[] {
  const results = [];

  for (const raw of buildings) {
    results.push({
      id: raw.BuildingId,
      name: raw.Name,
      ticker: raw.Ticker,
      expertise: raw.Expertise,
      workforce: {
        pioneers: raw.Pioneers,
        settlers: raw.Settlers,
        technicians: raw.Technicians,
        engineers: raw.Engineers,
        scientists: raw.Scientists,
      },
      area: raw.AreaCost,
      costs: raw.BuildingCosts.map((bc) => ({
        name: bc.CommodityName,
        ticker: bc.CommodityTicker,
        weight: bc.Weight,
        volume: bc.Volume,
        quantity: bc.Amount,
      })),
    });
  }

  return results;
}

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
