import { Recipe, loadRecipes } from './fio';

export class RecipeRepository {
  private readonly recipes: Recipe[];
  private readonly byOutputTicker: Record<string, Recipe> = {};
  private readonly byName: Record<string, Recipe> = {};

  static default(): RecipeRepository {
    return new RecipeRepository(loadRecipes());
  }

  constructor(recipes: Recipe[]) {
    this.recipes = recipes.sort((a, b) =>
      a.outputs[0].ticker.localeCompare(b.outputs[0].ticker)
    );

    for (const recipe of recipes) {
      this.byName[recipe.name] = recipe;
      for (const output of recipe.outputs) {
        this.byOutputTicker[output.ticker] = recipe;
      }
    }
  }

  all(): Recipe[] {
    return this.recipes;
  }

  findByOutput(ticker: string): Recipe | null {
    return this.byOutputTicker[ticker] ?? null;
  }

  findByName(name: string): Recipe | null {
    return this.byName[name] ?? null;
  }
}
