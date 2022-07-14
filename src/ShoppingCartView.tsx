import {
  DataEditor,
  EditableGridCell,
  GridCell,
  GridCellKind,
  GridColumn,
  Item,
} from '@glideapps/glide-data-grid';
import { useCallback, useContext, useMemo, useState } from 'react';

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

const exchanges = ExchangeRepository.default();

export default function InventoryViewer() {
  const orderBook = useContext(OrderBookContext);

  const [data, setData] = useState([
    { ticker: 'HCP', quantity: 5, exchange: 'IC1', source: 'ask' },
  ]);

  const columns: GridColumn[] = useMemo(
    () => [
      { title: 'Ticker', id: 'ticker', width: 80 },
      { title: 'Qty', id: 'quantity', width: 80 },
      { title: 'CX', id: 'exchange', width: 80 },
      { title: 'Source', id: 'source', width: 80 },
      { title: 'Price', id: 'price', width: 80 },
      { title: 'Total', id: 'total', width: 80 },
    ],
    []
  );

  const getContent = useCallback(
    ([col, row]: Item): GridCell => {
      const dataRow = data[row];
      const colInfo = columns[col];

      if (colInfo.id! in dataRow) {
        const value = (dataRow as any)[colInfo.id!];
        return {
          kind: GridCellKind.Text,
          allowOverlay: true,
          displayData: value.toString(),
          data: value,
        };
      } else if (colInfo.id === 'price') {
        const book = orderBook.findByTicker(dataRow.ticker, dataRow.exchange);
        if (!book) {
          return {
            kind: GridCellKind.Text,
            allowOverlay: false,
            displayData: 'loading...',
            data: '',
          };
        }
        const price = (book as any)[dataRow.source];
        return {
          kind: GridCellKind.Text,
          allowOverlay: false,
          displayData: price ? formatCurrency(price, book.currencyCode) : '',
          data: price?.toString() ?? '',
          contentAlign: 'right',
        };
      } else {
        const book = orderBook.findByTicker(dataRow.ticker, dataRow.exchange);
        if (!book) {
          return {
            kind: GridCellKind.Text,
            allowOverlay: false,
            displayData: 'loading...',
            data: '',
          };
        }
        const total = (book as any)[dataRow.source] * dataRow.quantity;
        return {
          kind: GridCellKind.Text,
          allowOverlay: false,
          displayData: total ? formatCurrency(total, book.currencyCode) : '',
          data: total?.toString() ?? '',
          contentAlign: 'right',
        };
      }
    },
    [columns, data, orderBook]
  );

  const onCellEdited = useCallback(
    ([col, row]: Item, newValue: EditableGridCell) => {
      if (newValue.kind !== GridCellKind.Text) {
        return;
      }

      // Someday maybe I'll regret not using `setData`. This is a note to future
      // self, if you find yourself debugging state problems here.
      const dataRow = data[row];
      const colInfo = columns[col];
      switch (colInfo.id) {
        case 'ticker':
          dataRow.ticker = newValue.data.toUpperCase();
          break;
        case 'quantity':
          dataRow.quantity = parseInt(newValue.data);
          break;
        case 'exchange':
          dataRow.exchange = newValue.data.toUpperCase();
          break;
        case 'source':
          dataRow.source = newValue.data;
          break;
      }
    },
    [columns, data]
  );

  const onRowAppended = useCallback(() => {
    setData(
      data.concat({ ticker: '', quantity: 0, exchange: 'IC1', source: 'ask' })
    );
  }, [data]);

  return (
    <div className="pt-20 p-4">
      <div className="rounded shadow h-96">
        <DataEditor
          width="100%"
          height="100%"
          getCellContent={getContent}
          onCellEdited={onCellEdited}
          onRowAppended={onRowAppended}
          columns={columns}
          rows={data.length}
        />
      </div>
    </div>
  );
}
