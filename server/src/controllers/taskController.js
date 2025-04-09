const db = require('../models/database');

const taskController = {
  // Получить все задачи проекта
  getProjectTasks: (req, res) => {
    const { projectId } = req.params;
    
    db.all(
      'SELECT * FROM tasks WHERE projectId = ? ORDER BY createdAt DESC',
      [projectId],
      (err, rows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json(rows);
      }
    );
  },

  // Создать новую задачу
  createTask: (req, res) => {
    const { projectId } = req.params;
    const { title, description, positionX, positionY, parentId } = req.body;

    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    db.run(
      `INSERT INTO tasks (projectId, title, description, positionX, positionY, parentId)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [projectId, title, description, positionX || 0, positionY || 0, parentId || null],
      function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({
          id: this.lastID,
          projectId,
          title,
          description,
          positionX,
          positionY,
          parentId,
          createdAt: new Date().toISOString()
        });
      }
    );
  },

  // Обновить задачу
  updateTask: (req, res) => {
    const { id } = req.params;
    const { title, description, positionX, positionY, parentId } = req.body;

    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (positionX !== undefined) {
      updates.push('positionX = ?');
      values.push(positionX);
    }
    if (positionY !== undefined) {
      updates.push('positionY = ?');
      values.push(positionY);
    }
    if (parentId !== undefined) {
      updates.push('parentId = ?');
      values.push(parentId);
    }

    if (updates.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    values.push(id);
    const query = `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`;

    db.run(query, values, (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Task updated successfully' });
    });
  },

  // Удалить задачу
  deleteTask: (req, res) => {
    const { id } = req.params;
    
    db.run('DELETE FROM tasks WHERE id = ?', [id], (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Task deleted successfully' });
    });
  }
};

module.exports = taskController; 