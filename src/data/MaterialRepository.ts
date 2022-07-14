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
        ticker: project.code.toUpperCase(),
        category: {
          id: 'planetary_projects',
          name: 'planetary projects',
          background:
            'linear-gradient(135deg, rgb(52, 140, 160), rgb(77, 165, 185))',
          color: 'rgb(179, 255, 255)',
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
    return this.byTicker[ticker.toUpperCase()] ?? null;
  }
}
