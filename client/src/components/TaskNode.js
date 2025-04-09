import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';

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

const TaskNode = ({ data, selected }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(data.label);
  const [description, setDescription] = useState(data.description || '');

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/tasks/${data.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      // Обновляем данные в родительском компоненте
      data.label = title;
      data.description = description;
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  return (
    <>
      <Handle
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
        type="source"
        position={Position.Right}
        style={{ 
          ...handleStyle,
          top: '50%', 
          transform: 'translateY(-50%)',
          right: '-6px'
        }}
      />
      
      <NodeContainer>
        <ContentContainer>
          {isEditing ? (
            <>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: '100%', marginBottom: '5px' }}
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: '100%', minHeight: '60px', marginBottom: '5px' }}
                placeholder="Поддерживается Markdown"
              />
              <button onClick={handleSave}>Сохранить</button>
              <button onClick={() => setIsEditing(false)}>Отмена</button>
            </>
          ) : (
            <>
              <Title>{title}</Title>
              {description && (
                <Description>
                  <ReactMarkdown>{description}</ReactMarkdown>
                </Description>
              )}
              <EditButton onClick={() => setIsEditing(true)}>
                ✎
              </EditButton>
            </>
          )}
        </ContentContainer>
      </NodeContainer>
      
      <Handle
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
  );
};

export default TaskNode; 