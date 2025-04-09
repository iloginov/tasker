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

  // Создать новый проект
  createProject: (req, res) => {
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    db.run('INSERT INTO projects (name) VALUES (?)', [name], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        id: this.lastID,
        name,
        createdAt: new Date().toISOString()
      });
    });
  },

  // Обновить проект
  updateProject: (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    db.run('UPDATE projects SET name = ? WHERE id = ?', [name, id], (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id, name });
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