import React, { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  useReactFlow,
} from '@xyflow/react';
import dagre from 'dagre';
import '@xyflow/react/dist/style.css';
import styled from 'styled-components';
import TaskNode from './TaskNode';

// Функция для автоматического размещения узлов
const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  // Базовые размеры карточки
  const baseNodeWidth = 200;
  const baseNodeHeight = 100;
  
  dagreGraph.setGraph({ rankdir: direction, nodesep: 100, ranksep: 100 });

  // Добавляем узлы в граф dagre с учетом размера описания
  nodes.forEach((node) => {
    const description = node.data.description || '';
    const lines = description.split('\n').length;
    const estimatedHeight = baseNodeHeight + (lines * 20); // 20px на строку описания
    
    dagreGraph.setNode(node.id, { 
      width: baseNodeWidth, 
      height: Math.max(estimatedHeight, baseNodeHeight)
    });
  });

  // Добавляем рёбра в граф dagre
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Вычисляем layout
  dagre.layout(dagreGraph);

  // Получаем новые позиции узлов
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const description = node.data.description || '';
    const lines = description.split('\n').length;
    const estimatedHeight = baseNodeHeight + (lines * 20);
    
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - baseNodeWidth / 2,
        y: nodeWithPosition.y - Math.max(estimatedHeight, baseNodeHeight) / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

const TaskGraph = ({ tasks, onTaskEdit }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView } = useReactFlow();

  const nodeTypes = {
    task: (props) => <TaskNode {...props} onEdit={onTaskEdit} />,
  };

  // Преобразуем задачи в узлы и рёбра
  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        // Создаем узлы
        const newNodes = tasks.map((task) => ({
          id: task.id.toString(),
          type: 'task',
          data: {
            id: task.id,
            label: task.title,
            description: task.description,
          },
        }));

        // Загружаем зависимости для каждой задачи
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
        const newEdges = Array.from(allDependencies).map(edgeId => {
          const [source, target] = edgeId.slice(1).split('-');
          return {
            id: edgeId,
            source: target.toString(),
            target: source.toString(),
            type: 'smoothstep',
          };
        });

        // Применяем layout
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
          newNodes,
          newEdges
        );

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        
        // Подстраиваем viewport после обновления узлов
        setTimeout(() => {
          fitView({ padding: 0.2 });
        }, 50);
      } catch (error) {
        console.error('Error fetching dependencies:', error);
      }
    };

    fetchDependencies();
  }, [tasks, setNodes, setEdges, fitView]);

  // Обновляем узлы при изменении задач
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        const task = tasks.find((t) => t.id.toString() === node.id);
        if (task) {
          return {
            ...node,
            data: {
              ...node.data,
              label: task.title,
              description: task.description,
            },
          };
        }
        return node;
      })
    );
  }, [tasks, setNodes]);

  const onConnect = useCallback(
    async (params) => {
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

        // Создаем новую связь с правильным идентификатором и учетом выбранных точек соединения
        const newEdge = {
          id: `e${params.source}-${params.target}`,
          source: params.source.toString(),
          target: params.target.toString(),
          type: 'smoothstep',
          sourceHandle: params.sourceHandle,
          targetHandle: params.targetHandle,
        };

        setEdges((eds) => addEdge(newEdge, eds));
      } catch (error) {
        console.error('Error creating dependency:', error);
      }
    },
    [setEdges]
  );

  const onLayout = useCallback(
    (direction) => {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        nodes,
        edges,
        direction
      );
      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
      setTimeout(() => {
        fitView({ padding: 0.2 });
      }, 50);
    },
    [nodes, edges, setNodes, setEdges, fitView]
  );

  const onEdgeDoubleClick = useCallback(
    async (event, edge) => {
      try {
        const [source, target] = edge.id.slice(1).split('-');
        const response = await fetch(
          `http://localhost:3001/api/tasks/${target}/dependencies/${source}`,
          {
            method: 'DELETE',
          }
        );

        if (!response.ok) {
          throw new Error('Failed to delete dependency');
        }

        // Удаляем связь из состояния
        setEdges((eds) => eds.filter((e) => e.id !== edge.id));
      } catch (error) {
        console.error('Error deleting dependency:', error);
      }
    },
    [setEdges]
  );

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeDoubleClick={onEdgeDoubleClick}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
        <Panel position="top-right">
          <button onClick={() => onLayout('TB')}>TB</button>
          <button onClick={() => onLayout('LR')}>LR</button>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default TaskGraph;