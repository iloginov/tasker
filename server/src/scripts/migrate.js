const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Путь к базе данных
const dbPath = path.join(__dirname, '../../database.sqlite');

// Создаем подключение к базе данных
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Ошибка при подключении к базе данных:', err);
    process.exit(1);
  }
  console.log('Подключено к базе данных SQLite');
});

// Функция для выполнения SQL-запросов
const runQuery = (query) => {
  return new Promise((resolve, reject) => {
    db.run(query, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Функция для выполнения миграции
const migrate = async () => {
  try {
    // Читаем SQL-файл миграции
    const migrationPath = path.join(__dirname, '../migrations/add_orientation_to_projects.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Выполняем миграцию
    await runQuery(migrationSQL);
    console.log('Миграция успешно выполнена');

    // Закрываем соединение с базой данных
    db.close((err) => {
      if (err) {
        console.error('Ошибка при закрытии соединения с базой данных:', err);
        process.exit(1);
      }
      console.log('Соединение с базой данных закрыто');
    });
  } catch (error) {
    console.error('Ошибка при выполнении миграции:', error);
    process.exit(1);
  }
};

// Запускаем миграцию
migrate(); 