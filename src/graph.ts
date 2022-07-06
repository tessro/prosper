import {
  Node as FlowNode,
  Edge as FlowEdge,
  Position,
} from 'react-flow-renderer';
import type { Recipe as FioRecipe } from './fio';

interface FlowGraph {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

interface Ingredient {
  material: Node;
  quantity: number;
}

interface Recipe {
  building: string;
  name: string;
  duration: number;
  outputs: Ingredient[];
  inputs: Ingredient[];
}

class Node {
  readonly recipes: Recipe[] = [];

  constructor(public readonly ticker: string) {}

  private pickRecipe(props: FlowGraphProps): Recipe | undefined {
    if (props.terminals.includes(this.ticker)) return;

    return (
      this.recipes.find((r) => props.recipePicks.includes(r.name)) ??
      this.recipes[0]
    );
  }

  toFlow(props: FlowGraphProps = FLOW_GRAPH_DEFAULTS): FlowGraph {
    const recipe = this.pickRecipe(props);

    const node = {
      id: this.ticker,
      type: 'recipe',
      data: { ...this, needs: props.needs, selectedRecipe: recipe },
      position: {
        x: 100 * props.depth,
        y: props.y,
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    };

    const inputs = recipe?.inputs ?? [];

    const subgraph = inputs.map((i, ix) => {
      return i.material.toFlow({
        ...props,
        needs:
          (props.needs / (recipe?.outputs[0].quantity ?? 1)) *
          (i.quantity ?? 1),
        spread: Math.max(200, props.spread / 2),
        depth: props.depth + 1,
        y: props.y - props.spread / 2 + (ix * props.spread) / inputs.length,
      });
    });
    const edges = [
      ...inputs.map((i) => ({
        id: `${this.ticker}-${i.material.ticker}`,
        source: this.ticker,
        target: i.material.ticker,
      })),
      ...subgraph.flatMap((i) => i.edges),
    ];

    const nodes = [node, ...subgraph.flatMap((g) => g.nodes)];

    function filterToMaxDepth(nodes: FlowNode[]): FlowNode[] {
      const depths: Record<string, number> = {};
      const quantities: Record<string, number> = {};
      for (const node of nodes) {
        depths[node.id] ??= node.position.x;
        quantities[node.id] ??= 0;
        quantities[node.id] += node.data.needs;
        if (node.position.x > depths[node.id]) {
          depths[node.id] = node.position.x;
        }
      }

      return nodes
        .filter((node) => node.position.x === depths[node.id])
        .map((n) => {
          n.data.needs = quantities[n.id];
          return n;
        });
    }

    function spaceEvenly(nodes: FlowNode[]): FlowNode[] {
      const ranks: Record<number, number> = {};
      for (const node of nodes) {
        ranks[node.position.x] ??= 0;
        node.position.y = 70 * ranks[node.position.x];
        ranks[node.position.x]++;
      }

      return nodes;
    }

    function uniqueEdges(edges: FlowEdge[]): FlowEdge[] {
      const cache: Set<string> = new Set();
      return edges.filter((edge) => {
        if (cache.has(edge.id)) return false;
        cache.add(edge.id);
        return true;
      });
    }

    return {
      nodes: spaceEvenly(filterToMaxDepth(nodes)),
      edges: uniqueEdges(edges),
    };
  }
}

interface FlowGraphProps {
  needs: number;
  depth: number;
  y: number;
  spread: number;
  recipePicks: string[];
  terminals: string[];
}

const FLOW_GRAPH_DEFAULTS = {
  needs: 1500,
  depth: 0,
  y: 0,
  spread: 1000,
  recipePicks: ['6xFEO 1xC 1xO=>3xFE'],
  terminals: ['O'],
};

export class RecipeGraph {
  private readonly roots: Record<string, Node> = {};

  constructor(recipes: FioRecipe[]) {
    for (const recipe of recipes) {
      for (const output of recipe.outputs) {
        const node = (this.roots[output.ticker] ??= new Node(output.ticker));

        node.recipes.push({
          ...recipe,
          inputs: recipe.inputs.map((p) => ({
            material: this.getOrCreate(p.ticker),
            quantity: p.quantity,
          })),
          outputs: recipe.outputs.map((p) => ({
            material: this.getOrCreate(p.ticker),
            quantity: p.quantity,
          })),
        });
      }
    }
  }

  private get(ticker: string): Node {
    return this.roots[ticker];
  }

  private getOrCreate(ticker: string): Node {
    return (this.roots[ticker] ??= new Node(ticker));
  }

  getFlowGraph(
    ticker: string,
    props: FlowGraphProps = FLOW_GRAPH_DEFAULTS
  ): FlowGraph {
    return this.get(ticker).toFlow(props);
  }
}
