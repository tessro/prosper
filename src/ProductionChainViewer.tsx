import JSONCrush from 'jsoncrush';
import { useEffect, useMemo, useState } from 'react';
import ReactFlow, { FitViewOptions, Node, Edge } from 'react-flow-renderer';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { loadRecipes } from './data';
import { RecipeGraph } from './graph';
import RecipeNode from './RecipeNode';
import { ProductionChainSidebar } from './ProductionChainSidebar';

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

const graph = new RecipeGraph(loadRecipes());

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function ProductionChainViewer() {
  const query = useQuery();
  const navigate = useNavigate();
  const params = useParams();
  const [ticker, setTicker] = useState(params.ticker?.toUpperCase() ?? 'RAT');
  const [includeIntermediates, setIncludeIntermediates] = useState(false);
  const [quantity, setQuantity] = useState(parseInt(params.quantity ?? '1'));
  const [userSelectedRecipes, setUserSelectedRecipes] = useState<
    Record<string, string>
  >({});
  const [terminals, setTerminals] = useState<string[]>(
    query.get('terminals')?.split(',') ?? []
  );

  const selectedRecipes: Record<string, string> = useMemo(
    () => ({
      ...DEFAULT_RECIPES,
      ...userSelectedRecipes,
    }),
    [userSelectedRecipes]
  );

  const { nodes, edges } = graph.getFlowGraph(ticker, {
    quantity,
    selectedRecipes,
    terminals,
  });

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

    if (terminals.length > 0) {
      url.searchParams.set('terminals', terminals.join(','));
    } else {
      url.searchParams.delete('terminals');
    }

    if (url.toString() !== window.location.href) {
      navigate(url.pathname + url.search);
    }
  }, [navigate, ticker, quantity, terminals, userSelectedRecipes]);

  const handleChange = (ticker: string, recipeName: string) => {
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

  const handleTickerChange = (ticker: string) => {
    setTicker(ticker);
  };

  const handleQuantityChange = (quantity: number) => {
    setQuantity(quantity);
  };

  const handleIncludeIntermediatesChange = (includeIntermediates: boolean) => {
    setIncludeIntermediates(includeIntermediates);
  };

  const handleTerminalsChange = (terminals: string[]) => {
    setTerminals(terminals);
  };

  return (
    <div className="w-screen h-screen">
      <ProductionChainSidebar
        ticker={ticker}
        quantity={quantity}
        includeIntermediates={includeIntermediates}
        selectedRecipes={selectedRecipes}
        terminals={terminals}
        onTickerChange={handleTickerChange}
        onQuantityChange={handleQuantityChange}
        onIncludeIntermediatesChange={handleIncludeIntermediatesChange}
        onRecipeChange={handleChange}
        onTerminalsChange={handleTerminalsChange}
      />
      <Flow nodes={nodes} edges={edges} />
    </div>
  );
}
