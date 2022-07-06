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
import { RecipeGraph } from './graph';
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

  let flow = <></>;
  if (ticker) {
    const { nodes, edges } = graph.getFlowGraph(ticker.toUpperCase());
    flow = <Flow nodes={nodes} edges={edges} />;
  }

  return (
    <div className="App" style={{ width: '100vw', height: '100vh' }}>
      {flow}
    </div>
  );
}

export default App;
