import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const ProjectCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
`;

const Button = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 20px;

  &:hover {
    background: #0056b3;
  }
`;

const ProjectsList = () => {
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const createProject = async () => {
    if (!newProjectName.trim()) return;
    
    try {
      await axios.post('http://localhost:3001/api/projects', {
        name: newProjectName
      });
      setNewProjectName('');
      fetchProjects();
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  return (
    <Container>
      <h1>Мои проекты</h1>
      <div>
        <input
          type="text"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
          placeholder="Название нового проекта"
        />
        <Button onClick={createProject}>Создать проект</Button>
      </div>
      {projects.map(project => (
        <ProjectCard key={project.id}>
          <h2>{project.name}</h2>
          <p>Создан: {new Date(project.createdAt).toLocaleDateString()}</p>
        </ProjectCard>
      ))}
    </Container>
  );
};

export default ProjectsList; 