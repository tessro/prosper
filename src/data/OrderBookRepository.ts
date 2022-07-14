import { OrderBook as FioExchangeData } from './fio';

interface OrderBook {
  ticker: string;
  exchangeCode: string;
  bid: number | null;
  ask: number | null;
  last: number | null;
  average: number | null;
  currencyCode: string;
}

export type PriceSource = 'ask' | 'bid' | 'last' | 'average';

export class OrderBookRepository {
  private readonly byExchange: Record<string, Record<string, OrderBook>> = {};

  static empty(): OrderBookRepository {
    return new OrderBookRepository();
  }

  static fromFio(exchangeData: FioExchangeData): OrderBookRepository {
    const books: OrderBook[] = [];

    for (const data of exchangeData) {
      books.push({
        ticker: data.MaterialTicker,
        exchangeCode: data.ExchangeCode,
        bid: data.Bid,
        ask: data.Ask,
        last: data.Price,
        average: data.PriceAverage,
        currencyCode: data.Currency,
      });
    }

    return new OrderBookRepository(books);
  }

  constructor(books: OrderBook[] = []) {
    for (const book of books) {
      const exchangeCode = book.exchangeCode.toUpperCase();
      const byTicker = (this.byExchange[exchangeCode] ??= {});
      byTicker[book.ticker] = book;
    }
  }

  findByTicker(ticker: string, exchangeCode: string): OrderBook | null {
    return this.byExchange[exchangeCode.toUpperCase()]?.[ticker] ?? null;
  }
}
