import { createContext, useState, PropsWithChildren, useMemo } from 'react';

import { FioClient, OrderBook } from '../data';

export const OrderBookContext = createContext<OrderBook | null>(null);

function fetchOrderBook() {
  const client = new FioClient();
  return client.getAllExchangeOrders();
}

export function OrderBookProvider({ children }: PropsWithChildren) {
  const [orderBook, setOrderBook] = useState<OrderBook | null>(null);

  useMemo(() => {
    fetchOrderBook().then((result) => setOrderBook(result));
  }, []);

  return (
    <OrderBookContext.Provider value={orderBook}>
      {children}
    </OrderBookContext.Provider>
  );
}
