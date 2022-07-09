import React from 'react';
import { render, screen } from '@testing-library/react';
import ProductionChainViewer from './ProductionChainViewer';

test('renders learn react link', () => {
  render(<ProductionChainViewer />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
