import { createContext, useState, PropsWithChildren, useMemo } from 'react';

import { FioClient, OrderBookRepository } from '../data';

export const OrderBookContext = createContext<OrderBookRepository>(
  OrderBookRepository.empty()
);

function fetchOrderBook() {
  const client = new FioClient();
  return client.getAllExchangeOrders();
}

export function OrderBookProvider({ children }: PropsWithChildren) {
  const [orderBook, setOrderBook] = useState<OrderBookRepository>(
    OrderBookRepository.empty()
  );

  useMemo(() => {
    fetchOrderBook().then((result) =>
      setOrderBook(OrderBookRepository.fromFio(result))
    );
  }, []);

  return (
    <OrderBookContext.Provider value={orderBook}>
      {children}
    </OrderBookContext.Provider>
  );
}
