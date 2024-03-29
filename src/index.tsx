import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import ProductionChainViewer from './ProductionChainViewer';
import InventoryViewer from './InventoryViewer';
import RepairPlanner from './RepairPlanner';
import reportWebVitals from './reportWebVitals';
import ShoppingCartView from './ShoppingCartView';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route path="/inventory" element={<InventoryViewer />} />
          <Route path="/production-chains">
            <Route index element={<ProductionChainViewer />} />
            <Route path=":ticker" element={<ProductionChainViewer />} />
            <Route
              path=":ticker/:quantity"
              element={<ProductionChainViewer />}
            />
          </Route>
          <Route path="/repair-planner" element={<RepairPlanner />} />
          <Route path="/shopping-cart" element={<ShoppingCartView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
