import { memo } from 'react';

import { Handle, NodeProps, Position } from 'react-flow-renderer';

import { MaterialDatabase } from './MaterialDatabase';

const materials = MaterialDatabase.default();

const baseNodeStyle = {
  height: 50,
  width: 50,
  border: '1px solid #000',
  display: 'flex',
  flexDirection: 'column' as any,
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 10,
  textDecoration: 'none',
};

interface RecipeProps {
  needs: number;
  ticker: string;
  recipes: any[];
  selectedRecipe: any;
}

type RecipeNodeProps = NodeProps<RecipeProps>;

export default memo(({ data, isConnectable }: RecipeNodeProps) => {
  const material = materials.findByTicker(data.ticker);

  const nodeStyle = {
    ...baseNodeStyle,
    background: material?.category.background,
    color: material?.category.color,
  };

  return (
    <a href={`/production-chains/${data.ticker}`} style={nodeStyle}>
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: '#555' }}
        onConnect={(params) => console.log('handle onConnect', params)}
        isConnectable={isConnectable}
      />
      <div>{Math.round(data.needs * 100) / 100}</div>
      <div>
        <strong>{data.ticker}</strong>
      </div>
      <div>{data.selectedRecipe?.building}</div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: '#555' }}
        isConnectable={isConnectable}
      />
    </a>
  );
});
