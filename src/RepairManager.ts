import {
  BuildingRepository,
  BuildingCost,
  MaterialRepository,
  PlanetRepository,
  UserSites,
} from './data';

interface BuildingInfo {
  id: string;
  ticker: string;
  costs: BuildingCost[];
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
  readonly costs: BuildingCost[];
  readonly planet: {
    name: string;
    code: string;
  };
  readonly condition: number;
  readonly lastRepair: number;

  constructor(info: BuildingInfo) {
    this.id = info.id;
    this.ticker = info.ticker;
    this.costs = info.costs;
    this.planet = info.planet;
    this.condition = info.condition;
    this.lastRepair = info.lastRepair;
  }

  get daysSinceRepair(): number {
    return (Date.now() - this.lastRepair) / 1000 / 60 / 60 / 24;
  }

  daysUntil(threshold: number): number {
    return threshold - (Date.now() - this.lastRepair) / 1000 / 60 / 60 / 24;
  }

  repairPercentage(age: number, sevenDayBug: boolean = false): number {
    const effectiveAge = sevenDayBug ? age - 7 : age;
    return Math.min(1, Math.max(0, effectiveAge / 180));
  }

  repairCosts(age: number, sevenDayBug: boolean = false): BuildingCost[] {
    const pct = this.repairPercentage(age, sevenDayBug);
    return this.costs.map((cost) => ({
      ...cost,
      quantity: Math.ceil(cost.quantity * pct),
    }));
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
  static empty(): RepairManager {
    return new RepairManager([]);
  }

  static async fromFio(sites: UserSites): Promise<RepairManager> {
    const buildingRepository = BuildingRepository.default();
    const materialRepository = MaterialRepository.default();
    const planetRepository = PlanetRepository.default();
    const buildings: Building[] = [];
    for (const site of sites) {
      const planet = await planetRepository.findByCode(site.PlanetIdentifier);
      if (!planet) {
        throw new Error(`Couldn't find planet '${site.PlanetIdentifier}'!`);
      }

      for (const building of site.Buildings) {
        const ticker = building.BuildingTicker;
        const buildingType = buildingRepository.findByTicker(ticker)!;

        // Skip buildings that don't need repair
        if (['CM'].includes(ticker) || ticker.startsWith('HB')) continue;

        const costs = [...buildingType.costs];

        if (planet.isRocky) {
          const mat = materialRepository.findByTicker('MCG');
          costs.push({
            ...mat!,
            quantity: buildingType.area * 4,
          });
        } else if (planet.isGaseous) {
          const mat = materialRepository.findByTicker('AEF');
          costs.push({
            ...mat!,
            quantity: Math.ceil(buildingType.area / 3),
          });
        }

        if (planet.isLowGravity) {
          const mat = materialRepository.findByTicker('MGC');
          costs.push({
            ...mat!,
            quantity: 1,
          });
        } else if (planet.isHighGravity) {
          const mat = materialRepository.findByTicker('BL');
          costs.push({
            ...mat!,
            quantity: 1,
          });
        }

        if (planet.isLowPressure) {
          const mat = materialRepository.findByTicker('SEA');
          costs.push({
            ...mat!,
            quantity: buildingType.area,
          });
        } else if (planet.isHighPressure) {
          const mat = materialRepository.findByTicker('HSE');
          costs.push({
            ...mat!,
            quantity: 1,
          });
        }

        if (planet.isLowTemperature) {
          const mat = materialRepository.findByTicker('INS');
          costs.push({
            ...mat!,
            quantity: buildingType.area * 10,
          });
        } else if (planet.isHighTemperature) {
          const mat = materialRepository.findByTicker('TSH');
          costs.push({
            ...mat!,
            quantity: 1,
          });
        }

        buildings.push(
          new Building({
            id: building.BuildingId,
            ticker,
            costs,
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

  constructor(private readonly buildings: Building[]) {}

  all(): Building[] {
    return this.buildings.sort(lastRepairComparator);
  }

  needingRepairWithin(days: number, threshold: number): Building[] {
    return this.buildings
      .filter((building) => building.daysUntil(threshold) <= days)
      .sort(lastRepairComparator);
  }
}
