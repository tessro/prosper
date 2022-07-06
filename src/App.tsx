import { useState, useCallback } from 'react';
import ReactFlow, {
  FitViewOptions,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
} from 'react-flow-renderer';
import './App.css';
import { loadRecipes } from './fio';
import { RecipeGraph, Ingredient } from './graph';
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
  const [nodes, setNodes] = useState<Node[]>(props.nodes);
  const [edges, setEdges] = useState<Edge[]>(props.edges);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodesConnectable={false}
      fitView
      fitViewOptions={fitViewOptions}
      snapToGrid
      snapGrid={[10, 10]}
    />
  );
}

function App() {
  const ticker = window.location.pathname.match(
    /^\/production-chains\/([a-zA-Z0-9]+)$/
  )?.[1];
  const graph = new RecipeGraph(loadRecipes());

  let inputs: Ingredient[] = [];
  let flow = <></>;
  if (ticker) {
    inputs = graph.getInputs(ticker.toUpperCase(), {
      quantity: 1,
      selectedRecipes: {
        AL: '6xALO 1xC 1xO=>3xAL',
        DW: '10xH2O 1xPG=>10xDW',
        HCP: '2xH2O=>4xHCP',
        GRN: '4xH2O=>4xGRN',
        MAI: '4xH2O=>12xMAI',
        FE: '6xFEO 1xC 1xO=>3xFE',
        GL: '1xSIO=>10xGL',
        RG: '10xGL 15xPG=>10xRG',
        SI: '3xSIO 1xAL=>1xSI',
        C: '4xHCP 2xGRN 2xMAI=>4xC',
      },
    });
    const { nodes, edges } = graph.getFlowGraph(ticker.toUpperCase());
    flow = <Flow nodes={nodes} edges={edges} />;
  }

  return (
    <div className="App" style={{ width: '100vw', height: '100vh' }}>
      <div
        style={{
          width: 150,
          textAlign: 'left',
          position: 'fixed',
          zIndex: 10,
          background: 'rgba(255, 255, 255, 0.8)',
          padding: 5,
        }}
      >
        Raw inputs:
        <ul style={{ margin: 0 }}>
          {inputs.map((i, ix) => (
            <li key={ix}>
              {Math.round(100 * i.quantity) / 100} {i.material.ticker}
            </li>
          ))}
        </ul>
      </div>
      {flow}
    </div>
  );
}

export default App;
