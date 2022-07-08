import ky from 'ky';
import { z } from 'zod';

import materials from './allmaterials.json';
import recipes from './allrecipes.json';

interface MaterialCategoryProps {
  background: string;
  color: string;
}

const UNKNOWN_MATERIAL_PROPS: MaterialCategoryProps = {
  background: '#f00',
  color: '#fff',
};

const MATERIAL_CATEGORY_PROPS: Record<string, MaterialCategoryProps> = {
  'agricultural products': {
    background: 'linear-gradient(135deg, rgb(92, 18, 18), rgb(117, 43, 43))',
    color: 'rgb(219, 145, 145)',
  },
  alloys: {
    background: 'linear-gradient(135deg, rgb(123, 76, 30), rgb(148, 101, 55))',
    color: 'rgb(250, 203, 157)',
  },
  chemicals: {
    background: 'linear-gradient(135deg, rgb(183, 46, 91), rgb(208, 71, 116))',
    color: 'rgb(255, 173, 218)',
  },
  'construction materials': {
    background: 'linear-gradient(135deg, rgb(24, 91, 211), rgb(49, 116, 236))',
    color: 'rgb(151, 218, 255)',
  },
  'construction parts': {
    background: 'linear-gradient(135deg, rgb(41, 77, 107), rgb(66, 102, 132))',
    color: 'rgb(168, 204, 234)',
  },
  'construction prefabs': {
    background: 'linear-gradient(135deg, rgb(15, 30, 98), rgb(40, 55, 123))',
    color: 'rgb(142, 157, 225)',
  },
  'consumables (basic)': {
    background: 'linear-gradient(135deg, rgb(149, 46, 46), rgb(174, 71, 71))',
    color: 'rgb(255, 173, 173)',
  },
  'consumables (luxury)': {
    background: 'linear-gradient(135deg, rgb(136, 24, 39), rgb(161, 49, 64))',
    color: 'rgb(255, 151, 166)',
  },
  drones: {
    background: 'linear-gradient(135deg, rgb(140, 52, 18), rgb(165, 77, 43))',
    color: 'rgb(255, 179, 145)',
  },
  'electronic devices': {
    background: 'linear-gradient(135deg, rgb(86, 20, 147), rgb(111, 45, 172))',
    color: 'rgb(213, 147, 255)',
  },
  'electronic parts': {
    background: 'linear-gradient(135deg, rgb(91, 46, 183), rgb(116, 71, 208))',
    color: 'rgb(218, 173, 255)',
  },
  'electronic pieces': {
    background:
      'linear-gradient(135deg, rgb(119, 82, 189), rgb(144, 107, 214))',
    color: 'rgb(246, 209, 255)',
  },
  'electronic systems': {
    background: 'linear-gradient(135deg, rgb(51, 26, 76), rgb(76, 51, 101))',
    color: 'rgb(178, 153, 203)',
  },
  elements: {
    background: 'linear-gradient(135deg, rgb(61, 46, 32), rgb(86, 71, 57))',
    color: 'rgb(188, 173, 159)',
  },
  'energy systems': {
    background: 'linear-gradient(135deg, rgb(51, 26, 76), rgb(76, 51, 101))',
    color: 'rgb(178, 153, 203)',
  },
  fuels: {
    background: 'linear-gradient(135deg, rgb(30, 123, 30), rgb(55, 148, 55))',
    color: 'rgb(157, 250, 157)',
  },
  gases: {
    background: 'linear-gradient(135deg, rgb(0, 105, 107), rgb(25, 130, 132))',
    color: 'rgb(127, 232, 234)',
  },
  liquids: {
    background:
      'linear-gradient(135deg, rgb(114, 164, 202), rgb(139, 189, 227))',
    color: 'rgb(241, 255, 255)',
  },
  'medical equipment': {
    background: 'linear-gradient(135deg, rgb(85, 170, 85), rgb(110, 195, 110))',
    color: 'rgb(212, 255, 212)',
  },
  metals: {
    background: 'linear-gradient(135deg, rgb(54, 54, 54), rgb(79, 79, 79))',
    color: 'rgb(181, 181, 181)',
  },
  minerals: {
    background: 'linear-gradient(135deg, rgb(153, 113, 73), rgb(178, 138, 98))',
    color: 'rgb(255, 240, 200)',
  },
  ores: {
    background: 'linear-gradient(135deg, rgb(82, 87, 97), rgb(107, 112, 122))',
    color: 'rgb(209, 214, 224)',
  },
  plastics: {
    background: 'linear-gradient(135deg, rgb(121, 31, 60), rgb(146, 56, 85))',
    color: 'rgb(248, 158, 187)',
  },
  'ship engines': {
    background: 'linear-gradient(135deg, rgb(153, 41, 0), rgb(178, 66, 25))',
    color: 'rgb(255, 168, 127)',
  },
  'ship kits': {
    background: 'linear-gradient(135deg, rgb(153, 84, 0), rgb(178, 109, 25))',
    color: 'rgb(255, 211, 127)',
  },
  'ship parts': {
    background: 'linear-gradient(135deg, rgb(153, 99, 0), rgb(178, 124, 25))',
    color: 'rgb(255, 226, 127)',
  },
  'ship shields': {
    background: 'linear-gradient(135deg, rgb(224, 131, 0), rgb(249, 156, 25))',
    color: 'rgb(255, 255, 127)',
  },
  'software components': {
    background: 'linear-gradient(135deg, rgb(136, 121, 47), rgb(161, 146, 72))',
    color: 'rgb(255, 248, 174)',
  },
  'software systems': {
    background: 'linear-gradient(135deg, rgb(60, 53, 5), rgb(85, 78, 30))',
    color: 'rgb(187, 180, 132)',
  },
  'software tools': {
    background: 'linear-gradient(135deg, rgb(129, 98, 19), rgb(154, 123, 44))',
    color: 'rgb(255, 225, 146)',
  },
  textiles: {
    background: 'linear-gradient(135deg, rgb(82, 90, 33), rgb(107, 115, 58))',
    color: 'rgb(209, 217, 160)',
  },
  'unit prefabs': {
    background: 'linear-gradient(135deg, rgb(29, 27, 28), rgb(54, 52, 53))',
    color: 'rgb(156, 154, 155)',
  },
  utility: {
    background:
      'linear-gradient(135deg, rgb(161, 148, 136), rgb(186, 173, 161))',
    color: 'rgb(255, 255, 255)',
  },
};

export interface MaterialCategory {
  id: string;
  name: string;
  color: string;
  background: string;
}

export interface Material {
  id: string;
  category: MaterialCategory;
  name: string;
  ticker: string;
  weight: number;
  volume: number;
}

export interface Ingredient {
  ticker: string;
  quantity: number;
}

export interface Recipe {
  building: string;
  name: string;
  inputs: Ingredient[];
  outputs: Ingredient[];
  duration: number;
}

export function loadMaterials(): Material[] {
  const results = [];

  for (const raw of materials) {
    results.push({
      id: raw.MaterialId,
      category: {
        id: raw.CategoryId,
        name: raw.CategoryName,
        ...(MATERIAL_CATEGORY_PROPS[raw.CategoryName] ??
          UNKNOWN_MATERIAL_PROPS),
      },
      name: raw.Name,
      ticker: raw.Ticker,
      weight: raw.Weight,
      volume: raw.Volume,
    });
  }

  return results;
}

export function loadRecipes(): Recipe[] {
  const results = [];

  for (const raw of recipes) {
    results.push({
      building: raw.BuildingTicker,
      name: raw.RecipeName,
      inputs: raw.Inputs.map((raw) => ({
        ticker: raw.Ticker,
        quantity: raw.Amount,
      })),
      outputs: raw.Outputs.map((raw) => ({
        ticker: raw.Ticker,
        quantity: raw.Amount,
      })),
      duration: raw.TimeMs,
    });
  }

  return results;
}

const userStorageItemSchema = z.object({
  MaterialId: z.string(),
  MaterialName: z.string().nullable(),
  MaterialTicker: z.string().nullable(),
  MaterialCategory: z.string().nullable(),
  MaterialWeight: z.number(),
  MaterialVolume: z.number(),
  MaterialAmount: z.number(),
  MaterialValue: z.number(),
  MaterialValueCurrency: z.string().nullable(),
  Type: z.string(),
  TotalWeight: z.number(),
  TotalVolume: z.number(),
});
export type UserStorageItem = z.infer<typeof userStorageItemSchema>;

const userStorageSchema = z.array(
  z.object({
    StorageItems: z.array(userStorageItemSchema),
    AddressableId: z.string(),
    FixedStore: z.boolean(),
    Name: z.string().nullable(),
    StorageId: z.string(),
    Timestamp: z.string(),
    Type: z.string(),
    UserNameSubmitted: z.string(),
    VolumeCapacity: z.number(),
    VolumeLoad: z.number(),
    WeightCapacity: z.number(),
    WeightLoad: z.number(),
  })
);
export type UserStorage = z.infer<typeof userStorageSchema>;

export class FioClient {
  private readonly api = ky.extend({
    headers: {},
    hooks: {
      beforeRequest: [
        (request) => {
          const apiKey = getApiKey();
          if (apiKey) {
            request.headers.set('authorization', apiKey);
          }
        },
      ],
    },
  });

  async getUserStorage(): Promise<UserStorage> {
    if (!this.username) {
      return [];
    }

    const data = await this.api
      .get(`https://rest.fnar.net/storage/${this.username}`)
      .json();

    return userStorageSchema.parse(data);
  }

  async getAllExchangeOrders(): Promise<any> {
    return ky.get('https://rest.fnar.net/exchange/full');
  }

  private get username(): string | null {
    return getUsername();
  }
}

export function setUsername(username: string): void {
  window.localStorage.setItem('prun:username', username);
}

export function getUsername(): string | null {
  return window.localStorage.getItem('prun:username');
}

export function setApiKey(key: string): void {
  window.localStorage.setItem('fio:apiKey', key);
}

export function getApiKey(): string | null {
  return window.localStorage.getItem('fio:apiKey');
}
