import cxdata from './comexexchanges.json';

interface Location {
  id: string;
  name: string;
  code: string;
}

export interface Exchange {
  id: string;
  name: string;
  code: string;
  currencyCode: string;
  station: Location;
}

export class ExchangeRepository {
  private readonly exchanges: Exchange[];

  static default(): ExchangeRepository {
    const results: Exchange[] = [];

    for (const cx of cxdata) {
      results.push({
        id: cx.ComexExchangeId,
        name: cx.ExchangeName,
        code: cx.ExchangeCode,
        currencyCode: cx.CurrencyCode,
        station: {
          id: cx.LocationId,
          name: cx.LocationName,
          code: cx.LocationNaturalId,
        },
      });
    }

    return new ExchangeRepository(results);
  }

  constructor(exchanges: Exchange[]) {
    this.exchanges = exchanges.sort((a, b) => a.code.localeCompare(b.code));
  }

  all(): Exchange[] {
    return this.exchanges;
  }

  findById(id: string): Exchange | null {
    return this.exchanges.find((exchange) => exchange.id === id) ?? null;
  }

  findByCode(code: string): Exchange {
    const exchange = this.exchanges.find((exchange) => exchange.code === code);
    if (!exchange) {
      throw new Error(`Couldn't find exchange '${code}'`);
    }
    return exchange;
  }
}
