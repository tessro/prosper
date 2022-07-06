import { Material, loadMaterials } from './fio';

export class MaterialDatabase {
  private readonly byTicker: Record<string, Material> = {};

  static default(): MaterialDatabase {
    return new MaterialDatabase(loadMaterials());
  }

  constructor(readonly materials: Material[]) {
    for (const material of materials) {
      this.byTicker[material.ticker] = material;
    }
  }

  findByTicker(ticker: string): Material | null {
    return this.byTicker[ticker] ?? null;
  }
}
