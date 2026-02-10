class AvengersToDoApp {
    constructor() {
        this.currentUser = null;
        this.todos = [];
        this.isLogin = true;
        this.editingTask = null;
        this.currentColumn = 'todo';
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkAuthStatus();
        this.startTimeTracking();
    }

    bindEvents() {
        // 认证相关事件
        document.getElementById('authForm').addEventListener('submit', (e) => this.handleAuth(e));
        document.getElementById('authSwitchLink').addEventListener('click', (e) => this.toggleAuthMode(e));
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());

        // 任务相关事件
        document.querySelectorAll('.add-task-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.openTaskModal(e.target.dataset.column));
        });

        document.getElementById('taskForm').addEventListener('submit', (e) => this.handleTaskSubmit(e));
        document.getElementById('cancelTask').addEventListener('click', () => this.closeTaskModal());
        
        // 模态框关闭事件
        document.querySelector('.close').addEventListener('click', () => this.closeTaskModal());
        
        // 点击模态框外部关闭
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeTaskModal();
            }
        });
        
        // 为所有列添加拖放事件
        document.querySelectorAll('.column').forEach(column => {
            column.addEventListener('dragover', (e) => this.handleDragOver(e));
            column.addEventListener('drop', (e) => this.handleDrop(e));
        });
        
        // 为任务列表添加拖放事件
        document.querySelectorAll('.task-list').forEach(list => {
            list.addEventListener('dragover', (e) => this.handleDragOver(e));
            list.addEventListener('drop', (e) => this.handleDrop(e));
        });
    }

    async checkAuthStatus() {
        try {
            const response = await fetch('/api/user');
            if (response.ok) {
                const user = await response.json();
                this.currentUser = user;
                this.showApp();
                this.loadTodos();
            } else {
                this.showAuth();
            }
        } catch (error) {
            this.showAuth();
        }
    }

    async handleAuth(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const heroName = document.getElementById('heroName').value;

        const endpoint = this.isLogin ? '/api/login' : '/api/register';
        const data = this.isLogin ? { username, password } : { username, password, heroName };

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                if (this.isLogin) {
                    this.currentUser = result.user;
                    this.showApp();
                    this.loadTodos();
                } else {
                    this.showMessage('注册成功！请登录', 'success');
                    this.toggleAuthMode();
                }
            } else {
                this.showMessage(result.error, 'error');
            }
        } catch (error) {
            this.showMessage('网络错误，请重试', 'error');
        }
    }

    toggleAuthMode(e) {
        if (e) e.preventDefault();
        
        this.isLogin = !this.isLogin;
        const authTitle = document.getElementById('authTitle');
        const authSubmit = document.getElementById('authSubmit');
        const heroNameGroup = document.getElementById('heroNameGroup');
        const authSwitchText = document.getElementById('authSwitchText');
        const authSwitchLink = document.getElementById('authSwitchLink');

        if (this.isLogin) {
            authTitle.textContent = '用户登录';
            authSubmit.textContent = '登录';
            heroNameGroup.style.display = 'none';
            authSwitchText.textContent = '还没有账号？';
            authSwitchLink.textContent = '立即注册';
        } else {
            authTitle.textContent = '注册新用户';
            authSubmit.textContent = '注册';
            heroNameGroup.style.display = 'block';
            authSwitchText.textContent = '已有账号？';
            authSwitchLink.textContent = '立即登录';
        }

        // 清空表单
        document.getElementById('authForm').reset();
    }

    showAuth() {
        const authModal = document.getElementById('authModal');
        authModal.style.display = 'flex';
        document.getElementById('app').classList.add('hidden');
    }

    showApp() {
        const authModal = document.getElementById('authModal');
        authModal.style.display = 'none';
        document.getElementById('app').classList.remove('hidden');
        document.getElementById('currentHero').textContent = this.currentUser.username;
        
        // 显示管理员入口
        if (this.currentUser.role === 'admin') {
            const adminLink = document.getElementById('adminLink');
            if (adminLink) {
                adminLink.style.display = 'inline-block';
            }
        }
    }

    async logout() {
        try {
            await fetch('/api/logout', { method: 'POST' });
            this.currentUser = null;
            this.todos = [];
            this.showAuth();
        } catch (error) {
            console.error('登出失败:', error);
        }
    }

    async loadTodos() {
        try {
            const response = await fetch('/api/todos');
            if (response.ok) {
                this.todos = await response.json();
                this.renderTodos();
                this.updateStats();
            }
        } catch (error) {
            console.error('加载任务失败:', error);
        }
    }

    renderTodos() {
        const todoList = document.getElementById('todoList');
        const progressList = document.getElementById('progressList');
        const completedList = document.getElementById('completedList');

        // 清空列表
        [todoList, progressList, completedList].forEach(list => list.innerHTML = '');

        // 按列分组
        const todoTasks = this.todos.filter(t => t.column_type === 'todo');
        const progressTasks = this.todos.filter(t => t.column_type === 'progress');
        const completedTasks = this.todos.filter(t => t.column_type === 'completed');

        // 渲染任务（带折叠功能）
        this.renderTasksWithCollapse(todoList, todoTasks, 'todo');
        this.renderTasksWithCollapse(progressList, progressTasks, 'progress');
        this.renderTasksWithCollapse(completedList, completedTasks, 'completed');
    }

    renderTasksWithCollapse(container, tasks, columnType) {
        const maxVisible = 6;
        
        tasks.forEach((todo, index) => {
            const taskElement = this.createTaskElement(todo);
            
            if (index >= maxVisible) {
                taskElement.classList.add('collapsed-task');
                taskElement.style.display = 'none';
            }
            
            container.appendChild(taskElement);
        });

        // 如果超过6个，添加展开/折叠按钮
        if (tasks.length > maxVisible) {
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'toggle-collapse-btn';
            toggleBtn.textContent = `显示更多 (${tasks.length - maxVisible})`;
            toggleBtn.onclick = () => this.toggleCollapse(container, toggleBtn, tasks.length - maxVisible);
            container.appendChild(toggleBtn);
        }
    }

    toggleCollapse(container, button, hiddenCount) {
        const collapsedTasks = container.querySelectorAll('.collapsed-task');
        const isExpanded = collapsedTasks[0].style.display !== 'none';

        collapsedTasks.forEach(task => {
            task.style.display = isExpanded ? 'none' : 'block';
        });

        button.textContent = isExpanded ? `显示更多 (${hiddenCount})` : '收起';
    }

    createTaskElement(todo) {
        const taskCard = document.createElement('div');
        taskCard.className = 'task-card';
        taskCard.dataset.taskId = todo.id;

        const timeInfo = this.getTimeInfo(todo);
        
        taskCard.innerHTML = `
            <div class="task-actions">
                <button class="task-action-btn edit-btn" onclick="app.editTask(${todo.id})">✏️</button>
                <button class="task-action-btn delete-btn" onclick="app.deleteTask(${todo.id})">🗑️</button>
            </div>
            <div class="task-title">${todo.title}</div>
            <div class="task-description">${todo.description || ''}</div>
            <div class="task-meta">
                <span class="task-priority priority-${todo.priority}">${this.getPriorityText(todo.priority)}</span>
                <span class="task-time">${timeInfo}</span>
            </div>
        `;

        // 添加拖拽功能
        taskCard.draggable = true;
        taskCard.addEventListener('dragstart', (e) => this.handleDragStart(e, todo));
        taskCard.addEventListener('dragend', (e) => this.handleDragEnd(e));

        return taskCard;
    }

    getPriorityText(priority) {
        const priorities = {
            low: '🟢 低',
            medium: '🟡 中',
            high: '🔴 高',
            urgent: '🚨 紧急'
        };
        return priorities[priority] || '🟡 中';
    }

    getTimeInfo(todo) {
        const createdAt = new Date(todo.created_at);
        const now = new Date();
        const diffTime = Math.abs(now - createdAt);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (todo.status === 'completed') {
            return `已完成`;
        } else if (diffDays > 0) {
            return `${diffDays}天前创建`;
        } else if (diffHours > 0) {
            return `${diffHours}小时前创建`;
        } else {
            return '刚刚创建';
        }
    }

    openTaskModal(column = 'todo') {
        this.currentColumn = column;
        this.editingTask = null;
        
        document.getElementById('taskModalTitle').textContent = '创建新任务';
        document.getElementById('taskForm').reset();
        document.getElementById('taskModal').style.display = 'flex';
    }

    closeTaskModal() {
        document.getElementById('taskModal').style.display = 'none';
        this.editingTask = null;
    }

    async handleTaskSubmit(e) {
        e.preventDefault();
        
        const title = document.getElementById('taskTitle').value;
        const description = document.getElementById('taskDescription').value;
        const priority = document.getElementById('taskPriority').value;

        const taskData = {
            title,
            description,
            priority,
            columnType: this.currentColumn,
            status: this.currentColumn === 'completed' ? 'completed' : 'pending'
        };

        try {
            let response;
            if (this.editingTask) {
                response = await fetch(`/api/todos/${this.editingTask.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(taskData)
                });
            } else {
                response = await fetch('/api/todos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(taskData)
                });
            }

            if (response.ok) {
                this.closeTaskModal();
                this.loadTodos();
                this.showMessage(this.editingTask ? '任务更新成功' : '任务创建成功', 'success');
            } else {
                const error = await response.json();
                this.showMessage(error.error, 'error');
            }
        } catch (error) {
            this.showMessage('操作失败，请重试', 'error');
        }
    }

    async editTask(taskId) {
        const task = this.todos.find(t => t.id === taskId);
        if (!task) return;

        this.editingTask = task;
        this.currentColumn = task.column_type;

        document.getElementById('taskModalTitle').textContent = '编辑任务';
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description || '';
        document.getElementById('taskPriority').value = task.priority;
        
        document.getElementById('taskModal').style.display = 'flex';
    }

    async deleteTask(taskId) {
        if (!confirm('确定要删除这个任务吗？')) return;

        try {
            const response = await fetch(`/api/todos/${taskId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.loadTodos();
                this.showMessage('任务删除成功', 'success');
            } else {
                this.showMessage('删除失败', 'error');
            }
        } catch (error) {
            this.showMessage('删除失败，请重试', 'error');
        }
    }

    handleDragStart(e, todo) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', JSON.stringify(todo));
        e.target.style.opacity = '0.5';
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // 找到目标列
        const column = e.target.closest('.column');
        if (!column) return;

        const newColumnType = column.dataset.column;
        const todoData = JSON.parse(e.dataTransfer.getData('text/plain'));

        if (todoData.column_type !== newColumnType) {
            this.moveTask(todoData.id, newColumnType);
        }
    }
    
    handleDragEnd(e) {
        e.target.style.opacity = '1';
    }
    
    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    async moveTask(taskId, newColumn) {
        const task = this.todos.find(t => t.id === taskId);
        if (!task) return;

        const updatedTask = {
            ...task,
            columnType: newColumn,
            status: newColumn === 'completed' ? 'completed' : 'pending'
        };

        try {
            const response = await fetch(`/api/todos/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedTask)
            });

            if (response.ok) {
                this.loadTodos();
            }
        } catch (error) {
            console.error('移动任务失败:', error);
        }
    }

    updateStats() {
        const pendingTasks = this.todos.filter(t => t.status !== 'completed');
        const pendingCount = pendingTasks.length;

        // 计算最长停留时间
        let longestPending = 0;
        pendingTasks.forEach(task => {
            const createdAt = new Date(task.created_at);
            const now = new Date();
            const diffDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
            if (diffDays > longestPending) {
                longestPending = diffDays;
            }
        });

        document.getElementById('pendingCount').textContent = pendingCount;
        document.getElementById('longestPending').textContent = `${longestPending}天`;
    }

    startTimeTracking() {
        // 每分钟更新一次时间显示
        setInterval(() => {
            if (this.todos.length > 0) {
                this.renderTodos();
                this.updateStats();
            }
        }, 60000);
    }

    showMessage(message, type = 'info') {
        // 创建消息提示
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
            background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;

        document.body.appendChild(messageDiv);

        setTimeout(() => {
            messageDiv.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                document.body.removeChild(messageDiv);
            }, 300);
        }, 3000);
    }
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// 初始化应用
const app = new AvengersToDoApp();