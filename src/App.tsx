import { useState, useCallback } from 'react';
import ReactFlow, {
  addEdge,
  FitViewOptions,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
} from 'react-flow-renderer';
import './App.css';
import { loadRecipes } from './fio';
import { RecipeGraph } from './graph';
import RecipeNode from './RecipeNode';

const fitViewOptions: FitViewOptions = {
  padding: 0.2,
};

const nodeTypes = {
  recipe: RecipeNode,
};

interface FlowProps {
  ticker: string;
}

function Flow(props: FlowProps) {
  const graph = new RecipeGraph(loadRecipes());
  const tree = graph.getTree(props.ticker);

  const initialNodes: Node[] = tree.nodes;
  const initialEdges: Edge[] = tree.edges;

  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

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
  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
      fitViewOptions={fitViewOptions}
      snapToGrid
      snapGrid={[10, 10]}
    />
  );
}

function App() {
  const ticker = window.location.pathname.match(
    /^\/supply-chain\/([a-zA-Z0-9]+)$/
  )?.[1];
  const flow = ticker ? <Flow ticker={ticker.toUpperCase()} /> : <></>;
  return (
    <div className="App" style={{ width: '100vw', height: '100vh' }}>
      {flow}
    </div>
  );
}

export default App;
