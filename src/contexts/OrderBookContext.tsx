import { createContext, useState, PropsWithChildren } from 'react';

import { FioClient, OrderBook } from '../fio';

export const OrderBookContext = createContext<OrderBook | null>(null);

function fetchOrderBook() {
  const client = new FioClient();
  return client.getAllExchangeOrders();
}

export function OrderBookProvider({ children }: PropsWithChildren) {
  const [orderBook, setOrderBook] = useState<OrderBook | null>(null);

  fetchOrderBook().then((result) => setOrderBook(result));

  return (
    <OrderBookContext.Provider value={orderBook}>
      {children}
    </OrderBookContext.Provider>
  );
}
