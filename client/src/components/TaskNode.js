import React from 'react';
import { Handle, Position } from '@xyflow/react';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';

// ВАЖНО: Не изменяйте стили NodeContainer!
// Этот компонент имеет фиксированные размеры и стили, которые критически важны
// для правильной работы ReactFlow и автоматического размещения узлов.
// Изменение этих стилей приведет к неправильному отображению и работе графа.
const NodeContainer = styled.div`
  width: 200px;
  border-radius: 5px;
  background: white;
  border: 1px solid #ddd;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ContentContainer = styled.div`
  margin: 10px;
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
  text-align: left;
  
  /* Стили для Markdown */
  p {
    margin: 0 0 5px 0;
    text-align: left;
  }
  
  ul, ol {
    margin: 0 0 5px 0;
    padding-left: 20px;
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
    padding: 8px;
    border-radius: 4px;
    overflow-x: auto;
    margin: 5px 0;
    text-align: left;
  }
  
  a {
    color: #007bff;
    text-decoration: none;
    text-align: left;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const EditButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 2px 5px;
  font-size: 12px;
  border-radius: 3px;

  &:hover {
    background: #f0f0f0;
  }
`;

const handleStyle = {
  width: '8px',
  height: '8px',
  background: '#555',
  border: '2px solid white',
  borderRadius: '50%',
  cursor: 'pointer',
};

const TaskNode = ({ data, selected, onEdit, orientation = 'TB' }) => {
  // Определяем, какие точки соединения отображать в зависимости от ориентации
  const showVerticalHandles = orientation === 'TB';
  const showHorizontalHandles = orientation === 'LR';

  return (
    <>
      {showVerticalHandles && (
        <>
          <Handle
            id="top"
            type="target"
            position={Position.Top}
            style={{ 
              ...handleStyle,
              left: '50%', 
              transform: 'translateX(-50%)',
              top: '-4px'
            }}
          />
          <Handle
            id="bottom"
            type="source"
            position={Position.Bottom}
            style={{ 
              ...handleStyle,
              left: '50%', 
              transform: 'translateX(-50%)',
              bottom: '-4px'
            }}
          />
        </>
      )}
      
      {showHorizontalHandles && (
        <>
          <Handle
            id="left"
            type="target"
            position={Position.Left}
            style={{ 
              ...handleStyle,
              top: '50%', 
              transform: 'translateY(-50%)',
              left: '-6px'
            }}
          />
          <Handle
            id="right"
            type="source"
            position={Position.Right}
            style={{ 
              ...handleStyle,
              top: '50%', 
              transform: 'translateY(-50%)',
              right: '-6px'
            }}
          />
        </>
      )}
      
      <NodeContainer>
        <ContentContainer>
          <Title>{data.label}</Title>
          {data.description && (
            <Description>
              <ReactMarkdown>{data.description}</ReactMarkdown>
            </Description>
          )}
          <EditButton onClick={() => onEdit({
            id: data.id,
            data: {
              label: data.label,
              description: data.description
            }
          })}>
            ✎
          </EditButton>
        </ContentContainer>
      </NodeContainer>
    </>
  );
};

export default TaskNode; 