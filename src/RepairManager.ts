import { BuildingRepository, UserSites } from './data';

interface BuildingInfo {
  id: string;
  ticker: string;
  planet: {
    name: string;
    code: string;
  };
  condition: number;
  lastRepair: number;
}

class Building {
  readonly id: string;
  readonly ticker: string;
  readonly planet: {
    name: string;
    code: string;
  };
  readonly condition: number;
  readonly lastRepair: number;

  constructor(info: BuildingInfo) {
    this.id = info.id;
    this.ticker = info.ticker;
    this.planet = info.planet;
    this.condition = info.condition;
    this.lastRepair = info.lastRepair;
  }

  get daysSinceRepair(): number {
    return (Date.now() - this.lastRepair) / 1000 / 60 / 60 / 24;
  }
}

const lastRepairComparator = (a: Building, b: Building): number => {
  if (a.lastRepair < b.lastRepair) {
    return -1;
  } else if (a.lastRepair > b.lastRepair) {
    return 1;
  } else {
    return 0;
  }
};

export class RepairManager {
  private readonly buildingRepository = BuildingRepository.default();

  static empty(): RepairManager {
    return new RepairManager([]);
  }

  static fromFio(sites: UserSites): RepairManager {
    const buildings: Building[] = [];
    for (const site of sites) {
      for (const building of site.Buildings) {
        const ticker = building.BuildingTicker;

        // Skip buildings that don't need repair
        if (['CM'].includes(ticker) || ticker.startsWith('HB')) continue;

        buildings.push(
          new Building({
            id: building.BuildingId,
            ticker,
            planet: {
              name: site.PlanetName,
              code: site.PlanetIdentifier,
            },
            condition: building.Condition,
            lastRepair: building.BuildingLastRepair ?? building.BuildingCreated,
          })
        );
      }
    }

    return new RepairManager(buildings);
  }

  constructor(private readonly buildings: Building[]) {
    console.log(buildings);
  }

  all(): Building[] {
    return this.buildings.sort(lastRepairComparator);
  }
}
