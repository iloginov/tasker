import React, { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  addEdge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import TaskNode from '../components/TaskNode';

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Toolbar = styled.div`
  padding: 10px;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Button = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;

  &:hover {
    background: #0056b3;
  }
`;

const BackButton = styled(Button)`
  background: #6c757d;
  
  &:hover {
    background: #5a6268;
  }
`;

const FlowContainer = styled.div`
  flex: 1;
  background: #f5f5f5;
`;

const AddButton = styled(Button)`
  background: #28a745;
  
  &:hover {
    background: #218838;
  }
`;

const TaskGraph = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Определяем типы узлов
  const nodeTypes = {
    task: TaskNode,
  };

  // Загрузка задач и их зависимостей при монтировании компонента
  useEffect(() => {
    const fetchTasksAndDependencies = async () => {
      try {
        // Загружаем задачи
        const tasksResponse = await fetch(`http://localhost:3001/api/projects/${projectId}/tasks`);
        if (!tasksResponse.ok) {
          throw new Error('Failed to fetch tasks');
        }
        const tasks = await tasksResponse.json();
        
        // Преобразуем задачи в формат узлов ReactFlow
        const flowNodes = tasks.map((task, index) => ({
          id: task.id.toString(),
          type: 'task',
          position: { 
            x: task.positionX || 100 + index * 250, 
            y: task.positionY || 100 
          },
          data: { 
            id: task.id,
            label: task.title,
            description: task.description,
          },
        }));
        
        setNodes(flowNodes);

        // Загружаем все зависимости один раз
        const allDependencies = new Set();
        
        for (const task of tasks) {
          const depsResponse = await fetch(`http://localhost:3001/api/tasks/${task.id}/dependencies`);
          if (!depsResponse.ok) {
            continue;
          }
          const dependencies = await depsResponse.json();
          
          // Добавляем только уникальные зависимости
          dependencies.forEach(dep => {
            // Проверяем, что зависимость относится к текущему проекту
            if (tasks.some(t => t.id === dep.sourceTaskId) && tasks.some(t => t.id === dep.dependentTaskId)) {
              const edgeId = `e${dep.sourceTaskId}-${dep.dependentTaskId}`;
              if (!allDependencies.has(edgeId)) {
                allDependencies.add(edgeId);
              }
            }
          });
        }

        // Преобразуем зависимости в edges
        const flowEdges = Array.from(allDependencies).map(edgeId => {
          const [source, target] = edgeId.slice(1).split('-');
          return {
            id: edgeId,
            source: target.toString(),
            target: source.toString(),
            type: 'default',
          };
        });

        setEdges(flowEdges);
      } catch (error) {
        console.error('Error fetching tasks and dependencies:', error);
      }
    };

    fetchTasksAndDependencies();
  }, [projectId, setNodes, setEdges]);

  // Обработчик создания нового узла
  const handleAddNode = useCallback(async () => {
    const newNode = {
      id: Date.now().toString(),
      type: 'task',
      position: { x: 100, y: 100 },
      data: { 
        id: Date.now(),
        label: 'Новая задача',
        description: '',
      },
    };

    try {
      const response = await fetch(`http://localhost:3001/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Новая задача',
          description: '',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const savedTask = await response.json();
      newNode.id = savedTask.id.toString();
      setNodes((nds) => [...nds, newNode]);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  }, [projectId, setNodes]);

  // Обработчик соединения узлов
  const onConnect = useCallback(async (params) => {
    try {
      const response = await fetch(`http://localhost:3001/api/tasks/${params.target}/dependencies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dependentTaskId: params.source,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create dependency');
      }

      // Создаем новую связь с правильным идентификатором
      const newEdge = {
        id: `e${params.target}-${params.source}`,
        source: params.target.toString(),
        target: params.source.toString(),
        type: 'default',
      };

      setEdges((eds) => addEdge(newEdge, eds));
    } catch (error) {
      console.error('Error creating dependency:', error);
    }
  }, [setEdges]);

  // Обработчик перемещения узла
  const onNodeDragStop = useCallback(async (event, node) => {
    try {
      const response = await fetch(`http://localhost:3001/api/tasks/${node.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          positionX: Math.round(node.position.x),
          positionY: Math.round(node.position.y),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task position');
      }
    } catch (error) {
      console.error('Error updating task position:', error);
    }
  }, []);

  return (
    <Container>
      <Toolbar>
        <div>
          <AddButton onClick={handleAddNode}>Добавить задачу</AddButton>
        </div>
        <BackButton onClick={() => navigate('/')}>
          Вернуться к проектам
        </BackButton>
      </Toolbar>
      <FlowContainer>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStop={onNodeDragStop}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </FlowContainer>
    </Container>
  );
};

export default TaskGraph; 