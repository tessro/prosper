import { useMemo } from 'react';
import { loadRecipes } from './fio';
import { RecipeGraph } from './graph';
import { MaterialDatabase } from './MaterialDatabase';

const DEFAULT_RECIPES: Record<string, string> = {
  AL: '6xALO 1xC 1xO=>3xAL',
  DW: '10xH2O 1xPG=>10xDW',
  HCP: '2xH2O=>4xHCP',
  GRN: '1xH2O=>4xGRN',
  MAI: '4xH2O=>12xMAI',
  FE: '6xFEO 1xC 1xO=>3xFE',
  GL: '1xSIO=>10xGL',
  RAT: '1xGRN 1xBEA 1xNUT=>10xRAT',
  RG: '10xGL 15xPG=>10xRG',
  SI: '3xSIO 1xAL=>1xSI',
  C: '4xGRN=>4xC',
};

const graph = new RecipeGraph(loadRecipes());
const materials = MaterialDatabase.default();

interface SidebarProps {
  ticker: string;
  onTickerChange: (ticker: string) => void;
  includeIntermediates: boolean;
  onIncludeIntermediatesChange: (includeIntermediates: boolean) => void;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  selectedRecipes: Record<string, string>;
  onRecipeChange: (ticker: string, recipe: string) => void;
}

export function Sidebar({
  ticker,
  quantity,
  includeIntermediates,
  onTickerChange,
  onQuantityChange,
  onIncludeIntermediatesChange,
  selectedRecipes: userSelectedRecipes,
  onRecipeChange,
}: SidebarProps) {
  const selectedRecipes: Record<string, string> = useMemo(
    () => ({
      ...DEFAULT_RECIPES,
      ...userSelectedRecipes,
    }),
    [userSelectedRecipes]
  );

  const decisions = graph.getDecisions(ticker, {
    selectedRecipes,
  });
  const inputs = graph.getInputs(ticker, {
    quantity,
    selectedRecipes,
    includeIntermediates,
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onRecipeChange(e.target.name, e.target.value);
  };

  const handleMaterialChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onTickerChange(e.target.value);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onQuantityChange(parseInt(e.target.value));
  };

  const handleIncludeIntermediatesChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onIncludeIntermediatesChange(e.target.checked);
  };

  return (
    <div
      style={{
        width: 280,
        textAlign: 'left',
        position: 'fixed',
        zIndex: 10,
        background: 'rgba(255, 255, 255, 0.8)',
        padding: 5,
      }}
    >
      <div>
        <select defaultValue={ticker} onChange={handleMaterialChange}>
          {materials.all().map((m) => (
            <option key={m.ticker} value={m.ticker}>
              {m.ticker} ({m.name})
            </option>
          ))}
        </select>
        Output quantity:{' '}
        <input
          type="number"
          style={{ width: 60 }}
          defaultValue={quantity}
          onChange={handleQuantityChange}
        />
        <div>
          <input
            id="includeIntermediates"
            type="checkbox"
            onChange={handleIncludeIntermediatesChange}
          />{' '}
          <label htmlFor="includeIntermediates">Include intermediates</label>
        </div>
      </div>
      {includeIntermediates ? 'All' : 'Raw'} inputs:
      <ul style={{ margin: 0 }}>
        {inputs.map((i, ix) => (
          <li key={ix}>
            {Math.round(100 * i.quantity) / 100} {i.material.ticker}
          </li>
        ))}
      </ul>
      Recipes:
      <ul style={{ margin: 0 }}>
        {decisions.map((d, ix) => (
          <li key={d.material.ticker}>
            {d.material.ticker}:&nbsp;
            <select
              name={d.material.ticker}
              onChange={handleChange}
              defaultValue={selectedRecipes[d.material.ticker]}
            >
              {d.recipes.map((recipe) => (
                <option key={recipe.name} value={recipe.name}>
                  {recipe.name}
                </option>
              ))}
            </select>
          </li>
        ))}
      </ul>
    </div>
  );
}
