import React from 'react';
import { Handle, Position } from '@xyflow/react';
import styled from 'styled-components';

const NodeContainer = styled.div`
  padding: 10px;
  border-radius: 5px;
  background: white;
  border: 1px solid #ddd;
  width: 200px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Title = styled.div`
  font-weight: bold;
  margin-bottom: 5px;
  color: #333;
  word-break: break-word;
`;

const Description = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 5px;
  max-height: 60px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
`;

const CustomNode = ({ data }) => {
  return (
    <div style={{ position: 'relative', width: '200px' }}>
      <Handle
        type="target"
        position={Position.Top}
        style={{ 
          left: '50%', 
          transform: 'translateX(-50%)',
          top: '-4px'
        }}
      />
      <NodeContainer>
        <Title>{data.label}</Title>
        {data.description && <Description>{data.description}</Description>}
      </NodeContainer>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ 
          left: '50%', 
          transform: 'translateX(-50%)',
          bottom: '-4px'
        }}
      />
    </div>
  );
};

export default CustomNode; 