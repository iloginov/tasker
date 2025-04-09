import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { ReactFlowProvider } from '@xyflow/react';
import TaskGraph from '../components/TaskGraph';
import TaskEditor from '../components/TaskEditor';

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

const ToolbarTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #333;
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

const TaskGraphPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [projectName, setProjectName] = useState('');

  // Загрузка названия проекта
  const getProjectName = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/projects/${projectId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }
      const project = await response.json();
      setProjectName(project.name);
    } catch (error) {
      console.error('Error fetching project:', error);
      setProjectName('Проект не найден');
    }
  };

  useEffect(() => {
    getProjectName();
  }, [projectId]);

  // Загрузка задач
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/projects/${projectId}/tasks`);
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        const tasks = await response.json();
        setTasks(tasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, [projectId]);

  // Обработчик создания новой задачи
  const handleAddTask = async () => {
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

      const newTask = await response.json();
      setTasks((prevTasks) => [...prevTasks, newTask]);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  // Обработчик сохранения задачи
  const handleTaskSave = async (updatedTask) => {
    try {
      const response = await fetch(`http://localhost:3001/api/tasks/${updatedTask.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: updatedTask.data.label,
          description: updatedTask.data.description,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const savedTask = await response.json();
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === savedTask.id ? savedTask : task
        )
      );
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  return (
    <Container>
      <Toolbar>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <BackButton onClick={() => navigate('/')}>← Назад</BackButton>
          <ToolbarTitle>{projectName}</ToolbarTitle>
        </div>
        <div>
          <AddButton onClick={handleAddTask}>+ Добавить задачу</AddButton>
        </div>
      </Toolbar>
      <FlowContainer>
        <ReactFlowProvider>
          <TaskGraph tasks={tasks} onTaskEdit={setEditingTask} />
        </ReactFlowProvider>
      </FlowContainer>
      {editingTask && (
        <TaskEditor
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={handleTaskSave}
        />
      )}
    </Container>
  );
};

export default TaskGraphPage; 