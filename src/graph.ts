import {
  Node as FlowNode,
  Edge as FlowEdge,
  Position,
} from 'react-flow-renderer';
import type { Recipe as FioRecipe } from './data';
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

interface GetBuildingsOptions {
  selectedRecipes: Record<string, string>;
}

interface GetInputsOptions {
  quantity?: number;
  includeIntermediates?: boolean;
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
  nodeQuantities: Record<string, number>;
  edgeQuantities: Record<string, number>;
}

// Never try to manufacture these
const TERMINALS = ['O'];

const FLOW_GRAPH_DEFAULTS = {
  quantity: 1,
  selectedRecipes: {},
  terminals: TERMINALS,
};

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

  getBuildings(options: GetBuildingsOptions): string[] {
    if (this.recipes.length === 0 || TERMINALS.includes(this.ticker)) {
      return [];
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

      const inputBuildings = recipe.inputs
        .flatMap((input) => input.material.getBuildings(options))
        .concat(recipe.building);

      return [...new Set(inputBuildings)].sort();
    }
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
      const orderSize = (options.quantity ?? 1) / outputQuantity;

      const inputs = recipe.inputs.flatMap((input) =>
        input.material.getInputs({
          ...options,
          quantity: orderSize * input.quantity,
        })
      );

      if (options.includeIntermediates) {
        inputs.push({ quantity, material: this });
      }

      const quantities: Record<string, Ingredient> = {};
      for (const input of inputs) {
        if (!quantities[input.material.ticker]) {
          quantities[input.material.ticker] = input;
        } else {
          quantities[input.material.ticker].quantity += input.quantity;
        }
      }

      return Object.keys(quantities)
        .sort()
        .map((ticker) => quantities[ticker]);
    }
  }

  toFlow(options: FlowGraphOptions, state: FlowGraphState): FlowGraph {
    const commonNodeProps = {
      type: 'recipe',
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    };

    state.nodeQuantities[this.ticker] ??= 0;
    state.nodeQuantities[this.ticker] += options.quantity;
    if (this.recipes.length === 0 || options.terminals.includes(this.ticker)) {
      return {
        nodes: [
          {
            ...commonNodeProps,
            id: this.ticker,
            data: { ...this, quantity: options.quantity },
            position: {
              x: 100 * state.depth,
              y: state.y,
            },
          },
        ],
        edges: [],
      };
    }

    const recipe = (() => {
      const selection = options.selectedRecipes[this.ticker];

      if (selection) {
        const recipe = this.recipes.find((r) => r.name === selection);
        if (!recipe) {
          throw new Error(
            `selected recipe '${selection}' is not in recipe set for ${this.ticker}`
          );
        }

        return recipe;
      } else {
        return this.recipes[0];
      }
    })();

    const outputQuantity = recipe.outputs.find(
      (o) => o.material === this
    )!.quantity;

    const currentNode = {
      ...commonNodeProps,
      id: this.ticker,
      data: { ...this, quantity: options.quantity, building: recipe.building },
      position: {
        x: 100 * state.depth,
        y: state.y,
      },
    };

    const inputs = recipe.inputs;

    const subgraph = inputs.map((i, ix) => {
      return i.material.toFlow(
        {
          ...options,
          quantity: i.quantity * (options.quantity / outputQuantity),
        },
        {
          ...state,
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

    for (const input of inputs) {
      const id = `${this.ticker}-${input.material.ticker}`;
      state.edgeQuantities[id] ??= 0;
      state.edgeQuantities[id] +=
        (input.quantity * options.quantity) / outputQuantity;
    }

    const otherNodes = subgraph.flatMap((g) => g.nodes);
    const allNodes = [currentNode, ...otherNodes];

    function filterToMaxDepth(nodes: FlowNode[]): FlowNode[] {
      const depths: Record<string, number> = {};
      const quantities: Record<string, number> = {};
      for (const node of nodes) {
        depths[node.id] ??= node.position.x;
        quantities[node.id] ??= 0;
        quantities[node.id] += node.data.quantity;
        if (node.position.x > depths[node.id]) {
          depths[node.id] = node.position.x;
        }
      }

      return nodes
        .filter((node) => node.position.x === depths[node.id])
        .map((n) => {
          n.data.quantity = quantities[n.id];
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
        const node = this.getOrCreate(output.ticker);

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

  getBuildings(ticker: string, options: GetBuildingsOptions): string[] {
    return this.get(ticker).getBuildings(options);
  }

  getInputs(ticker: string, options: GetInputsOptions): Ingredient[] {
    return this.get(ticker).getInputs(options);
  }

  getFlowGraph(
    ticker: string,
    options: Partial<FlowGraphOptions> = {}
  ): FlowGraph {
    const state: FlowGraphState = {
      depth: 0,
      y: 0,
      spread: 1000,
      nodeQuantities: {},
      edgeQuantities: {},
    };

    const flowData = this.get(ticker).toFlow(
      {
        ...FLOW_GRAPH_DEFAULTS,
        ...options,
      },
      state
    );

    for (const node of flowData.nodes) {
      node.data.quantity = state.nodeQuantities[node.id];
    }

    for (const edge of flowData.edges) {
      edge.label = Math.round(100 * state.edgeQuantities[edge.id]) / 100;
    }

    return flowData;
  }
}
