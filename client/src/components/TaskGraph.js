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

const nodeTypes = {
  task: TaskNode,
};

// Функция для автоматического размещения узлов
const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  const nodeWidth = 200;
  const nodeHeight = 100;
  
  dagreGraph.setGraph({ rankdir: direction, nodesep: 50, ranksep: 50 });

  // Добавляем узлы в граф dagre
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
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
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

const TaskGraph = ({ tasks, onTaskEdit }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView } = useReactFlow();

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

        // Создаем новую связь с правильным идентификатором
        const newEdge = {
          id: `e${params.target}-${params.source}`,
          source: params.target.toString(),
          target: params.source.toString(),
          type: 'smoothstep',
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