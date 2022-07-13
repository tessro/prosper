import { PlanetaryProjectRepository } from './PlanetaryProjectRepository';
import { Recipe, loadRecipes } from './fio';

const compareByOutput = (a: Recipe, b: Recipe) => {
  return a.outputs
    .map((o) => o.ticker)
    .join('-')
    .localeCompare(b.outputs.map((o) => o.ticker).join('-'));
};

export class RecipeRepository {
  private readonly recipes: Recipe[] = [];
  private readonly byOutputTicker: Record<string, Recipe[]> = {};
  private readonly byName: Record<string, Recipe> = {};

  static default(): RecipeRepository {
    const projects: Recipe[] = PlanetaryProjectRepository.default()
      .all()
      .map((project) => ({
        name: project.name,
        duration: 0,
        inputs: project.billOfMaterials,
        outputs: [{ ticker: project.code, quantity: 1 }],
      }));

    return new RecipeRepository(loadRecipes().concat(projects));
  }

  constructor(recipes: Recipe[]) {
    for (const recipe of recipes) {
      this.add(recipe);
    }
  }

  add(recipe: Recipe): void {
    this.recipes.push(recipe);
    this.byName[recipe.name] = recipe;
    for (const output of recipe.outputs) {
      this.byOutputTicker[output.ticker] ??= [];
      this.byOutputTicker[output.ticker].push(recipe);
    }
  }

  all(): Recipe[] {
    return this.recipes.sort(compareByOutput);
  }

  findByOutput(ticker: string): Recipe[] {
    return this.byOutputTicker[ticker].sort(compareByOutput) ?? [];
  }

  findByName(name: string): Recipe | null {
    return this.byName[name] ?? null;
  }
}
