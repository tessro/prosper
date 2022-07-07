import {
  Node as FlowNode,
  Edge as FlowEdge,
  Position,
} from 'react-flow-renderer';
import type { Recipe as FioRecipe } from './fio';
import { RecipeProps } from './RecipeNode';

interface FlowGraph {
  nodes: FlowNode<RecipeProps>[];
  edges: FlowEdge[];
}

export interface Decision {
  material: Node;
  recipes: Recipe[];
}

export interface Ingredient {
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

interface GetInputsOptions {
  quantity?: number;
  selectedRecipes: Record<string, string>;
}

interface GetDecisionsOptions {
  selectedRecipes: Record<string, string>;
}

interface FlowGraphOptions {
  quantity: number;
  selectedRecipes: Record<string, string>;
  terminals: string[];
}

interface FlowGraphState {
  depth: number;
  y: number;
  spread: number;
}

const FLOW_GRAPH_DEFAULTS = {
  quantity: 1,
  selectedRecipes: {},
  terminals: ['O'],
};

const FLOW_GRAPH_INITIAL_STATE = {
  depth: 0,
  y: 0,
  spread: 1000,
};

// Never try to manufacture these
const TERMINALS = ['O'];

class Node {
  readonly recipes: Recipe[] = [];

  constructor(public readonly ticker: string) {}

  getDecisions(options: GetDecisionsOptions): Decision[] {
    let decisions: Decision[] = [];
    if (options.selectedRecipes[this.ticker]) {
      decisions = this.recipes
        .find((r) => r.name === options.selectedRecipes[this.ticker])!
        .inputs.flatMap((input) => input.material.getDecisions(options));
    } else {
      decisions = this.recipes.flatMap((r) =>
        r.inputs.flatMap((input) => input.material.getDecisions(options))
      );
    }

    if (this.recipes.length > 1) {
      decisions.push({
        material: this,
        recipes: this.recipes,
      });
    }
    const seen = new Set<string>();
    return decisions.filter((d) => {
      const ticker = d.material.ticker;
      if (!seen.has(ticker)) {
        seen.add(ticker);
        return true;
      }
      return false;
    });
  }

  getInputs(options: GetInputsOptions): Ingredient[] {
    const quantity = options.quantity ?? 1;
    if (this.recipes.length === 0 || TERMINALS.includes(this.ticker)) {
      return [{ quantity, material: this }];
    } else {
      const recipe =
        this.recipes.find(
          (r) => r.name === options.selectedRecipes[this.ticker]
        ) ?? this.recipes[0];

      if (!recipe) {
        throw new Error(
          `Selection required for '${this.ticker}': multiple recipes available`
        );
      }

      const outputQuantity = recipe.outputs.find(
        (o) => o.material.ticker === this.ticker
      )!.quantity;

      const inputs = recipe.inputs.flatMap((input) =>
        input.material
          .getInputs({ ...options, quantity: 1 })
          .map((ingredient) => ({
            ...ingredient,
            quantity:
              (quantity * (ingredient.quantity * input.quantity)) /
              outputQuantity,
          }))
      );

      const quantities: Record<string, Ingredient> = {};
      for (const input of inputs) {
        if (!quantities[input.material.ticker]) {
          quantities[input.material.ticker] = input;
        } else {
          quantities[input.material.ticker].quantity += input.quantity;
        }
      }

      return Object.keys(quantities).map((ticker) => quantities[ticker]);
    }
  }

  toFlow(options: FlowGraphOptions, state: FlowGraphState): FlowGraph {
    if (options.terminals.includes(this.ticker)) {
      return {
        nodes: [
          {
            id: this.ticker,
            type: 'recipe',
            data: { ...this, quantity: options.quantity, building: '' },
            position: {
              x: 100 * state.depth,
              y: state.y,
            },
            sourcePosition: Position.Right,
            targetPosition: Position.Left,
          },
        ],
        edges: [],
      };
    }

    const recipe = options.selectedRecipes[this.ticker]
      ? this.recipes.find(
          (r) => r.name === options.selectedRecipes[this.ticker]
        )
      : this.recipes[0];

    const outputQuantity =
      recipe?.outputs.find((o) => o.material.ticker === this.ticker)!
        .quantity ?? 1;

    const currentNode = {
      id: this.ticker,
      type: 'recipe',
      data: { ...this, quantity: options.quantity, building: recipe?.building },
      position: {
        x: 100 * state.depth,
        y: state.y,
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    };

    const inputs = recipe?.inputs ?? [];

    const subgraph = inputs.map((i, ix) => {
      return i.material.toFlow(
        {
          ...options,
          quantity: (options.quantity / outputQuantity) * (i.quantity ?? 1),
        },
        {
          spread: Math.max(200, state.spread / 2),
          depth: state.depth + 1,
          y: state.y - state.spread / 2 + (ix * state.spread) / inputs.length,
        }
      );
    });
    const edges = [
      ...inputs.map((i) => ({
        id: `${this.ticker}-${i.material.ticker}`,
        source: this.ticker,
        target: i.material.ticker,
      })),
      ...subgraph.flatMap((i) => i.edges),
    ];

    const otherNodes = subgraph.flatMap((g) => g.nodes);
    const allNodes = [currentNode, ...otherNodes];

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
        if (cache.has(edge.id)) {
          return false;
        }
        cache.add(edge.id);
        return true;
      });
    }

    return {
      nodes: spaceEvenly(filterToMaxDepth(allNodes)),
      edges: uniqueEdges(edges),
    };
  }
}

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

  getDecisions(
    ticker: string,
    options: Partial<GetDecisionsOptions> = {}
  ): Decision[] {
    return this.get(ticker)
      .getDecisions({
        selectedRecipes: {},
        ...options,
      })
      .sort((a, b) => a.material.ticker.localeCompare(b.material.ticker));
  }

  getInputs(ticker: string, options: GetInputsOptions): Ingredient[] {
    return this.get(ticker).getInputs(options);
  }

  getFlowGraph(
    ticker: string,
    options: Partial<FlowGraphOptions> = {}
  ): FlowGraph {
    return this.get(ticker).toFlow(
      {
        ...FLOW_GRAPH_DEFAULTS,
        ...options,
      },
      FLOW_GRAPH_INITIAL_STATE
    );
  }
}
