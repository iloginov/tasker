import React from 'react';
import { Handle, Position } from '@xyflow/react';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
  max-height: 100px;
  overflow-y: auto;
  word-break: break-word;
  text-align: left;

  /* Стили для Markdown */
  p {
    margin: 0 0 5px 0;
    text-align: left;
  }

  ul, ol {
    margin: 0 0 5px 0;
    padding-left: 10px;
    text-align: left;
  }

  code {
    background: #f5f5f5;
    padding: 2px 4px;
    border-radius: 3px;
    font-family: monospace;
    text-align: left;
  }

  pre {
    background: #f5f5f5;
    padding: 5px;
    border-radius: 3px;
    overflow-x: auto;
    margin: 5px 0;
    text-align: left;
  }

  a {
    color: #007bff;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }

  /* Стилизация скроллбара */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
    &:hover {
      background: #555;
    }
  }
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
        {data.description && (
          <Description>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {data.description}
            </ReactMarkdown>
          </Description>
        )}
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