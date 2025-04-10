-- Добавляем поле orientation в таблицу projects
ALTER TABLE projects ADD COLUMN orientation TEXT DEFAULT 'TB'; 