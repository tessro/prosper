import { Material, loadMaterials } from './fio';

export class MaterialDatabase {
  private readonly materials: Material[];
  private readonly byTicker: Record<string, Material> = {};

  static default(): MaterialDatabase {
    return new MaterialDatabase(loadMaterials());
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
