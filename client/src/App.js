import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProjectsList from './pages/ProjectsList';
import TaskGraph from './pages/TaskGraph';
import styled from 'styled-components';

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: #f5f5f5;
`;

const App = () => {
  return (
    <Router>
      <AppContainer>
        <Routes>
          <Route path="/" element={<ProjectsList />} />
          <Route path="/project/:projectId" element={<TaskGraph />} />
        </Routes>
      </AppContainer>
    </Router>
  );
};

export default App; 