import { Node, Edge, Position } from 'react-flow-renderer';
import type { Recipe } from './fio';

interface FlowGraph {
  nodes: Node[];
  edges: Edge[];
}

interface GraphIngredient {
  product: GraphNode;
  quantity: number;
}

interface GraphRecipe {
  building: string;
  name: string;
  duration: number;
  outputs: GraphIngredient[];
  inputs: GraphIngredient[];
}

interface GraphNode {
  ticker: string;
  recipes: GraphRecipe[];
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
  private readonly roots: Record<string, GraphNode> = {};

  constructor(recipes: Recipe[]) {
    for (const recipe of recipes) {
      for (const output of recipe.outputs) {
        const node = (this.roots[output.product] ??= {
          ticker: output.product,
          recipes: [],
        });

        node.recipes.push({
          ...recipe,
          inputs: recipe.inputs.map((p) => ({
            product: this.getOrCreate(p.product),
            quantity: p.quantity,
          })),
          outputs: recipe.outputs.map((p) => ({
            product: this.getOrCreate(p.product),
            quantity: p.quantity,
          })),
        });
      }
    }
  }

  private get(product: string): GraphNode {
    return this.roots[product];
  }

  private getOrCreate(product: string): GraphNode {
    return (this.roots[product] ??= {
      ticker: product,
      recipes: [],
    });
  }

  getTree(
    product: string,
    props: FlowGraphProps = FLOW_GRAPH_DEFAULTS
  ): FlowGraph {
    function pickRecipe(
      node: GraphNode,
      props: FlowGraphProps
    ): GraphRecipe | undefined {
      if (props.terminals.includes(node.ticker)) return;

      return (
        node.recipes.find((r) => props.recipePicks.includes(r.name)) ??
        node.recipes[0]
      );
    }

    const root = this.roots[product];
    const recipe = pickRecipe(root, props);

    const node = {
      id: root.ticker,
      type: 'recipe',
      data: { ...root, needs: props.needs, selectedRecipe: recipe },
      position: {
        x: 100 * props.depth,
        y: props.y,
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    };

    const inputs = recipe?.inputs ?? [];

    const subgraph = inputs.map((i, ix) => {
      return this.getTree(i.product.ticker, {
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
        id: `${root.ticker}-${i.product.ticker}`,
        source: root.ticker,
        target: i.product.ticker,
      })),
      ...subgraph.flatMap((i) => i.edges),
    ];

    const nodes = [node, ...subgraph.flatMap((g) => g.nodes)];

    function filterToMaxDepth(nodes: Node[]): Node[] {
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

    function spaceEvenly(nodes: Node[]): Node[] {
      const ranks: Record<number, number> = {};
      for (const node of nodes) {
        ranks[node.position.x] ??= 0;
        node.position.y = 70 * ranks[node.position.x];
        ranks[node.position.x]++;
      }

      return nodes;
    }

    function uniqueEdges(edges: Edge[]): Edge[] {
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
