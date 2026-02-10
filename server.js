const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 数据库初始化
const db = new sqlite3.Database('avengers_todo.db');

// 创建表
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    hero_name TEXT,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT,
    description TEXT,
    status TEXT DEFAULT 'pending',
    priority TEXT DEFAULT 'medium',
    column_type TEXT DEFAULT 'todo',
    assigned_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (assigned_by) REFERENCES users (id)
  )`);
  
  // 检查并添加 assigned_by 字段（如果不存在）
  db.all("PRAGMA table_info(todos)", (err, columns) => {
    if (!err) {
      const hasAssignedBy = columns.some(col => col.name === 'assigned_by');
      if (!hasAssignedBy) {
        db.run("ALTER TABLE todos ADD COLUMN assigned_by INTEGER", (err) => {
          if (err) {
            console.log('添加 assigned_by 字段失败（可能已存在）:', err.message);
          } else {
            console.log('成功添加 assigned_by 字段');
          }
        });
      }
    }
  });
  
  // 创建默认管理员账户（如果不存在）
  const adminPassword = bcrypt.hashSync('admin123', 10);
  db.run(`INSERT OR IGNORE INTO users (id, username, password, hero_name, role) 
          VALUES (1, 'admin', ?, '系统管理员', 'admin')`, [adminPassword]);
});

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: 'avengers-assemble-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// 路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 用户注册
app.post('/api/register', async (req, res) => {
  const { username, password, heroName, role } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role || 'user';
    
    db.run('INSERT INTO users (username, password, hero_name, role) VALUES (?, ?, ?, ?)', 
      [username, hashedPassword, heroName, userRole], 
      function(err) {
        if (err) {
          return res.status(400).json({ error: '用户名已存在' });
        }
        res.json({ success: true, message: '注册成功' });
      });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// 用户登录
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err || !user) {
      return res.status(400).json({ error: '用户不存在' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: '密码错误' });
    }
    
    req.session.userId = user.id;
    req.session.heroName = user.hero_name;
    req.session.userRole = user.role;
    res.json({ 
      success: true, 
      user: { 
        id: user.id, 
        username: user.username, 
        heroName: user.hero_name,
        role: user.role
      } 
    });
  });
});

// 获取用户信息
app.get('/api/user', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: '未登录' });
  }
  
  db.get('SELECT id, username, hero_name, role FROM users WHERE id = ?', 
    [req.session.userId], (err, user) => {
      if (err || !user) {
        return res.status(404).json({ error: '用户不存在' });
      }
      res.json(user);
    });
});

// 获取todos
app.get('/api/todos', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: '未登录' });
  }
  
  db.all('SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC', 
    [req.session.userId], (err, todos) => {
      if (err) {
        return res.status(500).json({ error: '获取任务失败' });
      }
      res.json(todos);
    });
});

// 创建todo
app.post('/api/todos', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: '未登录' });
  }
  
  const { title, description, priority, columnType, userId } = req.body;
  const targetUserId = userId || req.session.userId;
  const assignedBy = userId ? req.session.userId : null;
  
  db.run('INSERT INTO todos (user_id, title, description, priority, column_type, assigned_by) VALUES (?, ?, ?, ?, ?, ?)',
    [targetUserId, title, description, priority, columnType, assignedBy],
    function(err) {
      if (err) {
        return res.status(500).json({ error: '创建任务失败' });
      }
      res.json({ id: this.lastID, success: true });
    });
});

// 更新todo
app.put('/api/todos/:id', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: '未登录' });
  }
  
  const { id } = req.params;
  const { title, description, status, priority, columnType } = req.body;
  
  const completedAt = status === 'completed' ? new Date().toISOString() : null;
  
  db.run(`UPDATE todos SET title = ?, description = ?, status = ?, priority = ?, 
           column_type = ?, completed_at = ? WHERE id = ? AND user_id = ?`,
    [title, description, status, priority, columnType, completedAt, id, req.session.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: '更新任务失败' });
      }
      res.json({ success: true });
    });
});

// 删除todo
app.delete('/api/todos/:id', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: '未登录' });
  }
  
  const { id } = req.params;
  
  db.run('DELETE FROM todos WHERE id = ? AND user_id = ?', 
    [id, req.session.userId], function(err) {
      if (err) {
        return res.status(500).json({ error: '删除任务失败' });
      }
      res.json({ success: true });
    });
});

// 登出
app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// ========== 公开API ==========

// 公开任务提交（无需登录）
app.post('/api/public/submit-task', (req, res) => {
  const { submitterName, submitterContact, title, description, priority, deadline } = req.body;
  
  if (!submitterName || !submitterContact || !title || !description) {
    return res.status(400).json({ error: '请填写必填项' });
  }
  
  // 构建完整的任务描述，包含提交者信息
  const fullDescription = `【联系人】${submitterName}
【联系方式】${submitterContact}
${deadline ? `【期望完成时间】${deadline}\n` : ''}
【任务详情】
${description}`;
  
  // 将任务分配给管理员（ID=1）
  db.run('INSERT INTO todos (user_id, title, description, priority, column_type, assigned_by) VALUES (?, ?, ?, ?, ?, ?)',
    [1, title, fullDescription, priority, 'todo', null],
    function(err) {
      if (err) {
        return res.status(500).json({ error: '提交失败，请重试' });
      }
      res.json({ success: true, taskId: this.lastID });
    });
});

// ========== 管理员API ==========

// 获取所有用户（仅管理员）
app.get('/api/admin/users', (req, res) => {
  if (!req.session.userId || req.session.userRole !== 'admin') {
    return res.status(403).json({ error: '无权限' });
  }
  
  db.all('SELECT id, username, hero_name, role, created_at FROM users ORDER BY created_at DESC', 
    (err, users) => {
      if (err) {
        return res.status(500).json({ error: '获取用户列表失败' });
      }
      res.json(users);
    });
});

// 创建用户（仅管理员）
app.post('/api/admin/users', async (req, res) => {
  if (!req.session.userId || req.session.userRole !== 'admin') {
    return res.status(403).json({ error: '无权限' });
  }
  
  const { username, password, heroName, role } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run('INSERT INTO users (username, password, hero_name, role) VALUES (?, ?, ?, ?)', 
      [username, hashedPassword, heroName, role || 'user'], 
      function(err) {
        if (err) {
          return res.status(400).json({ error: '用户名已存在' });
        }
        res.json({ success: true, userId: this.lastID });
      });
  } catch (error) {
    res.status(500).json({ error: '创建用户失败' });
  }
});

// 删除用户（仅管理员）
app.delete('/api/admin/users/:id', (req, res) => {
  if (!req.session.userId || req.session.userRole !== 'admin') {
    return res.status(403).json({ error: '无权限' });
  }
  
  const { id } = req.params;
  
  if (parseInt(id) === 1) {
    return res.status(400).json({ error: '不能删除默认管理员' });
  }
  
  db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: '删除用户失败' });
    }
    res.json({ success: true });
  });
});

// 获取所有任务（仅管理员）
app.get('/api/admin/todos', (req, res) => {
  if (!req.session.userId || req.session.userRole !== 'admin') {
    return res.status(403).json({ error: '无权限' });
  }
  
  db.all(`SELECT t.*, u.username, u.hero_name, 
          a.username as assigned_by_username, a.hero_name as assigned_by_hero
          FROM todos t 
          LEFT JOIN users u ON t.user_id = u.id
          LEFT JOIN users a ON t.assigned_by = a.id
          ORDER BY t.created_at DESC`, 
    (err, todos) => {
      if (err) {
        return res.status(500).json({ error: '获取任务列表失败' });
      }
      res.json(todos);
    });
});

// 获取每日完成任务统计（仅管理员）
app.get('/api/admin/stats/daily', (req, res) => {
  if (!req.session.userId || req.session.userRole !== 'admin') {
    return res.status(403).json({ error: '无权限' });
  }
  
  const { days = 7 } = req.query;
  
  db.all(`SELECT DATE(completed_at) as date, COUNT(*) as count, 
          GROUP_CONCAT(title, '|||') as titles
          FROM todos 
          WHERE completed_at IS NOT NULL 
          AND completed_at >= datetime('now', '-${days} days')
          GROUP BY DATE(completed_at)
          ORDER BY date DESC`, 
    (err, stats) => {
      if (err) {
        return res.status(500).json({ error: '获取统计数据失败' });
      }
      res.json(stats);
    });
});

// 获取用户任务统计（仅管理员）
app.get('/api/admin/stats/users', (req, res) => {
  if (!req.session.userId || req.session.userRole !== 'admin') {
    return res.status(403).json({ error: '无权限' });
  }
  
  db.all(`SELECT u.id, u.username, u.hero_name,
          COUNT(CASE WHEN t.status != 'completed' THEN 1 END) as pending_count,
          COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_count,
          COUNT(t.id) as total_count
          FROM users u
          LEFT JOIN todos t ON u.id = t.user_id
          WHERE u.role = 'user'
          GROUP BY u.id
          ORDER BY pending_count DESC`, 
    (err, stats) => {
      if (err) {
        return res.status(500).json({ error: '获取用户统计失败' });
      }
      res.json(stats);
    });
});

// 重新分配任务（仅管理员）
app.put('/api/admin/todos/:id/reassign', (req, res) => {
  if (!req.session.userId || req.session.userRole !== 'admin') {
    return res.status(403).json({ error: '无权限' });
  }
  
  const { id } = req.params;
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: '请选择用户' });
  }
  
  // 更新任务的所属用户和分配人
  db.run(`UPDATE todos SET user_id = ?, assigned_by = ? WHERE id = ?`,
    [userId, req.session.userId, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: '重新分配任务失败' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: '任务不存在' });
      }
      res.json({ success: true });
    });
});

app.listen(PORT, () => {
  console.log(`任务管理系统运行在 http://localhost:${PORT}`);
});