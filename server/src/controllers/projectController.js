const db = require('../models/database');

const projectController = {
  // Получить все проекты
  getAllProjects: (req, res) => {
    db.all('SELECT * FROM projects ORDER BY createdAt DESC', (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    });
  },

  // Получить проект по ID
  getProjectById: (req, res) => {
    const { id } = req.params;
    
    db.get('SELECT * FROM projects WHERE id = ?', [id], (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (!row) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }
      res.json(row);
    });
  },

  // Создать новый проект
  createProject: (req, res) => {
    const { name, orientation } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    db.run('INSERT INTO projects (name, orientation) VALUES (?, ?)', [name, orientation || 'TB'], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        id: this.lastID,
        name,
        orientation: orientation || 'TB',
        createdAt: new Date().toISOString()
      });
    });
  },

  // Обновить проект
  updateProject: (req, res) => {
    const { id } = req.params;
    const { name, orientation } = req.body;
    
    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    db.run('UPDATE projects SET name = ?, orientation = ? WHERE id = ?', [name, orientation || 'TB', id], (err) => {
      if (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Получаем обновленный проект
      db.get('SELECT * FROM projects WHERE id = ?', [id], (err, row) => {
        if (err) {
          console.error('Error fetching updated project:', err);
          res.status(500).json({ error: err.message });
          return;
        }
        console.log('Updated project:', row);
        res.json(row);
      });
    });
  },

  // Удалить проект
  deleteProject: (req, res) => {
    const { id } = req.params;
    
    db.run('DELETE FROM projects WHERE id = ?', [id], (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Project deleted successfully' });
    });
  }
};

module.exports = projectController; 