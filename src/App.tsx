import React, { useState } from 'react';
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

function App() {
  const match = window.location.pathname.match(
    /^\/production-chains\/([a-zA-Z0-9]+)(?:\/([0-9]+))?$/
  );
  const ticker = match?.[1].toUpperCase();
  const quantity = match?.[2] ? parseInt(match?.[2]) : 1;
  const graph = new RecipeGraph(loadRecipes());
  const materials = MaterialDatabase.default();

  const [selectedRecipes, setSelectedRecipes] = useState<
    Record<string, string>
  >({
    AL: '6xALO 1xC 1xO=>3xAL',
    DW: '10xH2O 1xPG=>10xDW',
    HCP: '2xH2O=>4xHCP',
    GRN: '1xH2O=>4xGRN',
    MAI: '4xH2O=>12xMAI',
    FE: '6xFEO 1xC 1xO=>3xFE',
    GL: '1xSIO=>10xGL',
    RAT: '1xMUS 1xNUT 1xMAI=>10xRAT',
    RG: '10xGL 15xPG=>10xRG',
    SI: '3xSIO 1xAL=>1xSI',
    C: '4xGRN=>4xC',
  });

  let inputs: Ingredient[] = [];
  let decisions: Decision[] = [];

  let flow = <></>;
  if (ticker) {
    decisions = graph.getDecisions(ticker);
    inputs = graph.getInputs(ticker, {
      quantity,
      selectedRecipes,
    });
    const { nodes, edges } = graph.getFlowGraph(ticker.toUpperCase(), {
      needs: quantity,
      selectedRecipes,
    });
    console.log(selectedRecipes, nodes);
    flow = <Flow nodes={nodes} edges={edges} />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRecipes({
      ...selectedRecipes,
      [e.target.name]: e.target.value,
    });
  };

  const handleMaterialChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    window.location.pathname = `/production-chains/${e.target.value}`;
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
              <option value={m.ticker}>
                {m.ticker} ({m.name})
              </option>
            ))}
          </select>
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
            <li key={ix}>
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
