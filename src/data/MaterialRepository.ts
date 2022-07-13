import { PlanetaryProjectRepository } from './PlanetaryProjectRepository';
import { Material, loadMaterials } from './fio';

export class MaterialRepository {
  private readonly materials: Material[];
  private readonly byTicker: Record<string, Material> = {};

  static default(): MaterialRepository {
    const projects: Material[] = PlanetaryProjectRepository.default()
      .all()
      .map((project) => ({
        id: project.code,
        name: project.name,
        ticker: project.code,
        category: {
          id: 'planetary_projects',
          name: 'planetary projects',
          background: '#6BBCCF',
          color: '#ffffff',
        },
        weight: 0,
        volume: 0,
      }));
    return new MaterialRepository(loadMaterials().concat(projects));
  }

  constructor(materials: Material[]) {
    this.materials = materials.sort((a, b) => a.ticker.localeCompare(b.ticker));

    for (const material of materials) {
      this.byTicker[material.ticker] = material;
    }
  }

  all(): Material[] {
    return this.materials;
  }

  findByTicker(ticker: string): Material | null {
    return this.byTicker[ticker] ?? null;
  }
}
