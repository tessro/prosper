import { useContext, useMemo, useState } from 'react';

import {
  Exchange,
  ExchangeRepository,
  FioClient,
  PriceSource,
  StationRepository,
  Store,
  StorageRepository,
  UserShips,
  UserSites,
  UserStorage,
} from './data';
import { OrderBookContext } from './contexts/OrderBookContext';

function formatCurrency(amount: number, currency: string): string {
  const value = amount.toLocaleString(undefined, {
    maximumFractionDigits: 0,
  });
  return `${value} ${currency}`;
}

export default function InventoryViewer() {
  return <div className="pt-20 p-4">Hi</div>;
}
