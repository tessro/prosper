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

export function ProductionChainSidebar({
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
  const buildings = graph.getBuildings(ticker, {
    selectedRecipes,
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
    <div className="fixed z-10 bg-base-200 w-80 top-20 bottom-4 left-3 rounded-lg shadow p-4 overflow-auto">
      <div className="form-control">
        <label className="label" htmlFor="Sidebar/material">
          <span className="label-text">Material</span>
        </label>
        <select
          id="Sidebar/material"
          className="select"
          defaultValue={ticker}
          onChange={handleMaterialChange}
        >
          {materials.all().map((m) => (
            <option key={m.ticker} value={m.ticker}>
              {m.ticker} ({m.name})
            </option>
          ))}
        </select>
      </div>

      <div className="form-control my-2">
        <label className="label" htmlFor="Sidebar/quantity">
          <span className="label-text">Quantity</span>
        </label>
        <input
          id="Sidebar/quantity"
          type="number"
          className="input w-40"
          defaultValue={quantity}
          onChange={handleQuantityChange}
        />
      </div>
      <h1 className="text-lg font-bold mt-4">Inputs</h1>
      <div className="form-control mb-1">
        <label className="label cursor-pointer justify-start">
          <input
            type="checkbox"
            className="checkbox"
            onChange={handleIncludeIntermediatesChange}
          />{' '}
          <span className="label-text ml-1">Include intermediate products</span>
        </label>
      </div>
      <table className="table table-compact w-full">
        <thead>
          <tr>
            <td className="bg-base-300">Qty</td>
            <td className="bg-base-300">Material</td>
          </tr>
        </thead>
        <tbody>
          {inputs.map((i, ix) => (
            <tr key={ix}>
              <td>{Math.round(100 * i.quantity) / 100}</td>
              <td>{i.material.ticker}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h1 className="text-lg font-bold mt-4 mb-1">Buildings</h1>
      <table className="table table-compact w-full">
        <thead>
          <tr>
            <td className="bg-base-300">Qty</td>
            <td className="bg-base-300">Building</td>
          </tr>
        </thead>
        <tbody>
          {buildings.map((ticker) => (
            <tr key={ticker}>
              <td>1</td>
              <td>{ticker}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {decisions.length > 0 ? (
        <>
          <h1 className="text-lg font-bold mt-4 mb-1">Recipe choices</h1>
          <table className="table table-compact w-full">
            <thead>
              <tr>
                <td className="bg-base-300">Mat.</td>
                <td className="bg-base-300 pl-5">Recipe</td>
              </tr>
            </thead>
            <tbody>
              {decisions.map((d, ix) => (
                <tr key={d.material.ticker}>
                  <td>{d.material.ticker}</td>
                  <td>
                    <select
                      name={d.material.ticker}
                      className="select select-sm w-full leading-none"
                      onChange={handleChange}
                      defaultValue={selectedRecipes[d.material.ticker]}
                    >
                      {d.recipes.map((recipe) => (
                        <option key={recipe.name} value={recipe.name}>
                          {recipe.name}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <></>
      )}
    </div>
  );
}
