import workforceNeeds from './workforceneeds.json';

export const WORKFORCE_TYPES = [
  'pioneers',
  'settlers',
  'technicians',
  'engineers',
  'scientists',
] as const;

export type WorkforceType = typeof WORKFORCE_TYPES[number];

export type Workforce = {
  [K in WorkforceType]: number;
};

type WorkforceNeeds = {
  [K in WorkforceType]: Record<string, number>;
};

function loadWorkforceNeeds(): WorkforceNeeds {
  const results: WorkforceNeeds = {
    pioneers: {},
    settlers: {},
    technicians: {},
    engineers: {},
    scientists: {},
  };

  for (const workforce of workforceNeeds) {
    for (const need of workforce.Needs) {
      const type = (workforce.WorkforceType.toLowerCase() +
        's') as WorkforceType;
      results[type][need.MaterialTicker] = need.Amount;
    }
  }

  return results;
}

export function getNeeds(workforce: Workforce): Record<string, number> {
  const results: Record<string, number> = {};
  const workforceNeeds = loadWorkforceNeeds();
  for (const type of WORKFORCE_TYPES) {
    for (const ticker of Object.keys(workforceNeeds[type])) {
      if (workforce[type] > 0 && workforceNeeds[type][ticker] > 0) {
        results[ticker] ??= 0;
        results[ticker] +=
          (workforce[type] / 100) * workforceNeeds[type][ticker];
      }
    }
  }

  return results;
}
