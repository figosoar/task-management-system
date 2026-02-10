# 重新分配功能错误修复

## 问题描述

### 错误信息
```
重新分配失败
```

### 问题原因
旧的数据库表 `todos` 缺少 `assigned_by` 字段，导致重新分配任务时 SQL 更新失败。

## 问题分析

### 数据库结构变化
新功能需要 `assigned_by` 字段来记录任务的分配人：

**新表结构**:
```sql
CREATE TABLE todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT,
    description TEXT,
    status TEXT DEFAULT 'pending',
    priority TEXT DEFAULT 'medium',
    column_type TEXT DEFAULT 'todo',
    assigned_by INTEGER,  -- 新增字段
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (assigned_by) REFERENCES users (id)
);
```

### 错误场景
1. 用户使用旧版本创建了数据库
2. 更新到新版本后，表结构没有更新
3. 执行重新分配时，SQL 尝试更新不存在的字段
4. 数据库返回错误，导致操作失败

## 解决方案

### 方案 1: 自动迁移（已实现）✅

在服务器启动时自动检查并添加缺失的字段：

```javascript
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
```

**优点**:
- 自动处理，无需用户操作
- 保留现有数据
- 向后兼容

**缺点**:
- 需要重启服务器

### 方案 2: 手动删除数据库（备选）

如果自动迁移失败，可以手动删除数据库：

```bash
# 1. 停止服务器
# 2. 删除数据库文件
del avengers_todo.db

# 3. 重启服务器
npm start

# 4. 数据库会自动重新创建
```

**优点**:
- 简单直接
- 确保表结构正确

**缺点**:
- 会丢失所有数据
- 需要重新创建用户和任务

## 修复步骤

### 自动修复（推荐）

1. **重启服务器**
   ```bash
   # 停止当前服务器（Ctrl+C）
   # 重新启动
   npm start
   ```

2. **验证修复**
   - 查看控制台输出
   - 如果看到"成功添加 assigned_by 字段"，说明修复成功
   - 如果没有任何消息，说明字段已存在

3. **测试功能**
   - 登录管理员账户
   - 进入管理后台
   - 尝试重新分配任务
   - 确认操作成功

### 手动修复（如果自动修复失败）

1. **备份数据（可选）**
   ```bash
   copy avengers_todo.db avengers_todo.db.backup
   ```

2. **删除数据库**
   ```bash
   del avengers_todo.db
   ```

3. **重启服务器**
   ```bash
   npm start
   ```

4. **重新创建数据**
   - 使用默认管理员登录（admin/admin123）
   - 创建用户
   - 创建或分配任务

## 验证修复

### 测试步骤

1. **登录管理员账户**
   - 用户名: admin
   - 密码: admin123

2. **创建测试用户**
   - 进入管理后台 → 用户管理
   - 创建两个测试用户（user1, user2）

3. **分配测试任务**
   - 切换到任务管理
   - 点击"分配任务"
   - 给 user1 分配一个任务

4. **测试重新分配**
   - 点击任务标题查看详情
   - 点击"重新分配"按钮
   - 选择 user2
   - 点击"确认分配"
   - **预期**: 显示"任务重新分配成功"

5. **验证结果**
   - 任务列表刷新
   - 任务的"分配给"列显示 user2
   - 点击标题查看详情，确认分配给 user2

### 预期结果

✅ 重新分配成功  
✅ 显示成功提示  
✅ 任务列表更新  
✅ 任务详情正确  

## 技术细节

### SQLite ALTER TABLE
SQLite 支持有限的 ALTER TABLE 操作：
- ✅ 可以添加列（ADD COLUMN）
- ❌ 不能删除列
- ❌ 不能修改列

### PRAGMA table_info
用于查询表结构：
```sql
PRAGMA table_info(todos);
```

返回结果：
```
cid | name        | type    | notnull | dflt_value | pk
----|-------------|---------|---------|------------|----
0   | id          | INTEGER | 0       | NULL       | 1
1   | user_id     | INTEGER | 0       | NULL       | 0
2   | title       | TEXT    | 0       | NULL       | 0
...
7   | assigned_by | INTEGER | 0       | NULL       | 0
```

### 字段默认值
新添加的 `assigned_by` 字段：
- 类型: INTEGER
- 默认值: NULL
- 可为空: 是

对于现有任务：
- `assigned_by` 将为 NULL
- 表示"自建"任务
- 不影响功能使用

## 常见问题

### Q: 重启后还是报错怎么办？
A: 尝试手动删除数据库文件，让系统重新创建。

### Q: 会丢失数据吗？
A: 自动迁移不会丢失数据。只有手动删除数据库才会丢失数据。

### Q: 现有任务的 assigned_by 是什么？
A: 现有任务的 assigned_by 为 NULL，显示为"自建"。

### Q: 如何确认字段已添加？
A: 查看服务器启动时的控制台输出，或者尝试重新分配任务。

### Q: 可以手动添加字段吗？
A: 可以，但不推荐。使用 SQLite 工具执行：
```sql
ALTER TABLE todos ADD COLUMN assigned_by INTEGER;
```

## 预防措施

### 1. 数据库版本管理
未来可以添加数据库版本表：
```sql
CREATE TABLE schema_version (
    version INTEGER PRIMARY KEY,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 2. 迁移脚本
创建独立的迁移脚本文件：
```javascript
// migrations/001_add_assigned_by.js
module.exports = {
  up: (db) => {
    return db.run("ALTER TABLE todos ADD COLUMN assigned_by INTEGER");
  },
  down: (db) => {
    // SQLite 不支持删除列
    return Promise.resolve();
  }
};
```

### 3. 启动检查
在服务器启动时运行所有待执行的迁移。

## 总结

问题已通过自动数据库迁移解决：
- ✅ 自动检测缺失字段
- ✅ 自动添加 assigned_by 字段
- ✅ 保留现有数据
- ✅ 向后兼容

重启服务器后，重新分配功能应该可以正常工作了。

---

**修复日期**: 2026-02-09  
**影响范围**: 任务重新分配功能  
**状态**: ✅ 已修复
