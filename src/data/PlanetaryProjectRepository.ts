interface Material {
  ticker: string;
  quantity: number;
}

export interface PlanetaryProject {
  name: string;
  code: string;
  billOfMaterials: Material[];
}

const PLANETARY_PROJECTS: PlanetaryProject[] = [
  {
    name: 'Planetary Administration Center',
    code: 'ADM',
    billOfMaterials: [
      { ticker: 'LBH', quantity: 16 },
      { ticker: 'LDE', quantity: 32 },
      { ticker: 'LSE', quantity: 25 },
      { ticker: 'BMF', quantity: 2 },
      { ticker: 'MCG', quantity: 750 },
      { ticker: 'RTA', quantity: 5 },
      { ticker: 'BWS', quantity: 10 },
    ],
  },
  {
    name: 'Chamber of Global Commerce',
    code: 'CoGC',
    billOfMaterials: [
      { ticker: 'LBH', quantity: 32 },
      { ticker: 'LDE', quantity: 16 },
      { ticker: 'LSE', quantity: 24 },
      { ticker: 'LTA', quantity: 32 },
      { ticker: 'BMF', quantity: 1 },
      { ticker: 'SP', quantity: 32 },
      { ticker: 'BWS', quantity: 16 },
    ],
  },
  {
    name: 'Local Market',
    code: 'LOCM',
    billOfMaterials: [
      { ticker: 'BDE', quantity: 8 },
      { ticker: 'BSE', quantity: 12 },
      { ticker: 'BTA', quantity: 8 },
      { ticker: 'LBH', quantity: 8 },
      { ticker: 'TRU', quantity: 10 },
    ],
  },
  {
    name: 'Population Infrastructure',
    code: 'POP',
    billOfMaterials: [],
  },
  {
    name: 'Shipyard',
    code: 'SHY',
    billOfMaterials: [
      { ticker: 'ABH', quantity: 32 },
      { ticker: 'ADE', quantity: 24 },
      { ticker: 'ASE', quantity: 24 },
      { ticker: 'ATA', quantity: 8 },
      { ticker: 'TRU', quantity: 24 },
    ],
  },
  {
    name: 'Warehouse',
    code: 'WAR',
    billOfMaterials: [
      { ticker: 'BBH', quantity: 24 },
      { ticker: 'BDE', quantity: 24 },
      { ticker: 'BSE', quantity: 12 },
      { ticker: 'MCG', quantity: 300 },
      { ticker: 'TRU', quantity: 20 },
    ],
  },
];

export class PlanetaryProjectRepository {
  private readonly projects: PlanetaryProject[];

  static default(): PlanetaryProjectRepository {
    return new PlanetaryProjectRepository(PLANETARY_PROJECTS);
  }

  constructor(projects: PlanetaryProject[]) {
    this.projects = projects;
  }

  all(): PlanetaryProject[] {
    return this.projects;
  }

  findByCode(code: string): PlanetaryProject | null {
    return (
      this.projects.find(
        (project) => project.code.toLowerCase() === code.toLowerCase()
      ) ?? null
    );
  }
}
