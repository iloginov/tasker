const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../../database.sqlite'), (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initDatabase();
  }
});

function initDatabase() {
  db.serialize(() => {
    // Создаем таблицу проектов
    db.run(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        orientation TEXT DEFAULT 'TB',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Создаем таблицу задач
    db.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        projectId INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        positionX INTEGER DEFAULT 0,
        positionY INTEGER DEFAULT 0,
        parentId INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (projectId) REFERENCES projects (id) ON DELETE CASCADE,
        FOREIGN KEY (parentId) REFERENCES tasks (id) ON DELETE SET NULL
      )
    `);

    // Создаем таблицу зависимостей задач
    db.run(`
      CREATE TABLE IF NOT EXISTS task_dependencies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sourceTaskId INTEGER NOT NULL,
        dependentTaskId INTEGER NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sourceTaskId) REFERENCES tasks (id) ON DELETE CASCADE,
        FOREIGN KEY (dependentTaskId) REFERENCES tasks (id) ON DELETE CASCADE,
        UNIQUE(sourceTaskId, dependentTaskId)
      )
    `);
  });
}

module.exports = db; 