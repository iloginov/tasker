import React, { useState, useEffect, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import styled from 'styled-components';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import TaskEditor from '../components/TaskEditor';
import CustomNode from '../components/CustomNode';

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
  .react-flow__node {
    background: transparent;
    border: none;
    padding: 0;
    width: auto;
    height: auto;
  }
`;

const TaskGraph = () => {
  const { projectId } = useParams();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const nodeTypes = {
    custom: CustomNode,
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/projects/${projectId}/tasks`);
      const tasks = response.data;
      
      const flowNodes = tasks.map(task => ({
        id: task.id.toString(),
        type: 'custom',
        data: { 
          label: task.title,
          description: task.description || ''
        },
        position: { x: task.positionX || 0, y: task.positionY || 0 },
      }));

      const flowEdges = tasks
        .filter(task => task.parentId)
        .map(task => ({
          id: `e${task.parentId}-${task.id}`,
          source: task.parentId.toString(),
          target: task.id.toString(),
        }));

      setNodes(flowNodes);
      setEdges(flowEdges);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const onConnect = useCallback(
    (params) => {
      // Обновляем parentId для задачи
      const targetNodeId = params.target;
      const sourceNodeId = params.source;
      
      axios.patch(`http://localhost:3001/api/tasks/${targetNodeId}`, {
        parentId: sourceNodeId
      }).catch(error => {
        console.error('Error updating task parent:', error);
      });
      
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  const createTask = async () => {
    try {
      const response = await axios.post(`http://localhost:3001/api/projects/${projectId}/tasks`, {
        title: 'Новая задача',
        positionX: 100,
        positionY: 100,
      });
      
      const newTask = response.data;
      setNodes((nds) => [
        ...nds,
        {
          id: newTask.id.toString(),
          type: 'custom',
          data: { 
            label: newTask.title,
            description: newTask.description || ''
          },
          position: { x: newTask.positionX, y: newTask.positionY },
        },
      ]);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const updateTaskPosition = async (nodeId, position) => {
    try {
      await axios.patch(`http://localhost:3001/api/tasks/${nodeId}`, {
        positionX: position.x,
        positionY: position.y,
      });
    } catch (error) {
      console.error('Error updating task position:', error);
    }
  };

  const onNodeDragStop = (event, node) => {
    updateTaskPosition(node.id, node.position);
  };

  const onNodeClick = (event, node) => {
    setSelectedNode(node);
    setIsEditorOpen(true);
  };

  const handleEditorClose = () => {
    setIsEditorOpen(false);
    setSelectedNode(null);
  };

  const handleTaskUpdate = (updatedNode) => {
    setNodes((nds) => 
      nds.map((node) => 
        node.id === updatedNode.id ? updatedNode : node
      )
    );
  };

  return (
    <Container>
      <Toolbar>
        <div>
          <Button onClick={createTask}>Добавить задачу</Button>
        </div>
        <BackButton onClick={() => window.location.href = '/'}>
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
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </FlowContainer>
      {isEditorOpen && (
        <TaskEditor
          task={selectedNode}
          onClose={handleEditorClose}
          onSave={handleTaskUpdate}
        />
      )}
    </Container>
  );
};

export default TaskGraph; 