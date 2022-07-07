import JSONCrush from 'jsoncrush';
import { useEffect, useMemo, useState } from 'react';
import ReactFlow, { FitViewOptions, Node, Edge } from 'react-flow-renderer';
import './App.css';
import { loadRecipes } from './fio';
import { RecipeGraph, Decision, Ingredient } from './graph';
import { MaterialDatabase } from './MaterialDatabase';
import RecipeNode from './RecipeNode';

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

const nodeTypes = {
  recipe: RecipeNode,
};

interface FlowProps {
  nodes: Node[];
  edges: Edge[];
}

function Flow(props: FlowProps) {
  return (
    <ReactFlow
      defaultNodes={props.nodes}
      defaultEdges={props.edges}
      nodeTypes={nodeTypes}
      nodesConnectable={false}
      fitView
      fitViewOptions={fitViewOptions}
      snapToGrid
      snapGrid={[10, 10]}
    />
  );
}

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

function App() {
  const match = window.location.pathname.match(
    /^\/production-chains\/([a-zA-Z0-9]+)(?:\/([0-9]+))?$/
  );
  const [ticker, setTicker] = useState(match?.[1].toUpperCase() ?? 'RAT');
  const [quantity, setQuantity] = useState(
    match?.[2] ? parseInt(match?.[2]) : 1
  );
  const graph = new RecipeGraph(loadRecipes());
  const materials = MaterialDatabase.default();

  const [userSelectedRecipes, setUserSelectedRecipes] = useState<
    Record<string, string>
  >({});

  let inputs: Ingredient[] = [];
  let decisions: Decision[] = [];

  const selectedRecipes: Record<string, string> = useMemo(
    () => ({
      ...DEFAULT_RECIPES,
      ...userSelectedRecipes,
    }),
    [userSelectedRecipes]
  );

  let flow = <></>;
  if (ticker) {
    decisions = graph.getDecisions(ticker, {
      selectedRecipes,
    });
    inputs = graph.getInputs(ticker, {
      quantity,
      selectedRecipes,
    });
    const { nodes, edges } = graph.getFlowGraph(ticker.toUpperCase(), {
      needs: quantity,
      selectedRecipes,
    });
    flow = <Flow nodes={nodes} edges={edges} />;
  }

  useEffect(() => {
    const url = new URL(window.location.href);
    url.pathname = `/production-chains/${ticker}/${quantity}`;
    if (Object.keys(userSelectedRecipes).length > 0) {
      url.searchParams.set(
        'selectedRecipes',
        JSONCrush.crush(JSON.stringify(userSelectedRecipes))
      );
    } else {
      url.searchParams.delete('selectedRecipes');
    }

    if (url.toString() !== window.location.href) {
      window.history.pushState({}, '', url);
    }
  }, [ticker, quantity, userSelectedRecipes]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const ticker = e.target.name;
    const recipeName = e.target.value;
    if (DEFAULT_RECIPES[ticker] === recipeName) {
      const { [ticker]: _, ...rest } = userSelectedRecipes;
      setUserSelectedRecipes({ ...rest });
    } else {
      setUserSelectedRecipes({
        ...userSelectedRecipes,
        [ticker]: recipeName,
      });
    }
  };

  const handleMaterialChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTicker(e.target.value);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuantity(parseInt(e.target.value));
  };

  return (
    <div className="App" style={{ width: '100vw', height: '100vh' }}>
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
        </div>
        Raw inputs:
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
      {flow}
    </div>
  );
}

export default App;
