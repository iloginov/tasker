import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const EditorContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  width: 400px;
  box-sizing: border-box;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

const Title = styled.h2`
  margin: 0 0 20px 0;
  padding: 0;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
  width: 100%;
  box-sizing: border-box;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  box-sizing: border-box;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  width: 100%;
  box-sizing: border-box;
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  margin-left: 10px;
  
  ${props => props.primary ? `
    background: #007bff;
    color: white;
    border: none;
    
    &:hover {
      background: #0056b3;
    }
  ` : `
    background: white;
    color: #333;
    border: 1px solid #ddd;
    
    &:hover {
      background: #f8f9fa;
    }
  `}
`;

const TaskEditor = ({ task, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.data.label || '');
      setDescription(task.data.description || '');
    }
  }, [task]);

  const handleSave = async () => {
    try {
      const response = await axios.patch(`http://localhost:3001/api/tasks/${task.id}`, {
        title,
        description
      });
      
      onSave({
        ...task,
        data: {
          ...task.data,
          label: response.data.title,
          description: response.data.description
        }
      });
      
      onClose();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  if (!task) return null;

  return (
    <>
      <Overlay onClick={onClose} />
      <EditorContainer>
        <Title>Редактировать задачу</Title>
        <FormGroup>
          <Label>Название</Label>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Введите название задачи"
          />
        </FormGroup>
        <FormGroup>
          <Label>Описание</Label>
          <TextArea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Введите описание задачи"
          />
        </FormGroup>
        <ButtonGroup>
          <Button onClick={onClose}>Отмена</Button>
          <Button primary onClick={handleSave}>Сохранить</Button>
        </ButtonGroup>
      </EditorContainer>
    </>
  );
};

export default TaskEditor; 