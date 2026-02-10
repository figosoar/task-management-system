class AdminApp {
    constructor() {
        this.currentUser = null;
        this.users = [];
        this.tasks = [];
        this.currentTaskId = null; // 用于重新分配
        this.init();
    }

    async init() {
        await this.checkAuth();
        this.bindEvents();
        this.loadData();
    }

    async checkAuth() {
        try {
            const response = await fetch('/api/user');
            if (response.ok) {
                const user = await response.json();
                if (user.role !== 'admin') {
                    window.location.href = '/';
                    return;
                }
                this.currentUser = user;
                document.getElementById('currentAdmin').textContent = user.username;
            } else {
                window.location.href = '/';
            }
        } catch (error) {
            window.location.href = '/';
        }
    }

    bindEvents() {
        // 标签切换
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // 登出
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());

        // 用户管理
        document.getElementById('addUserBtn').addEventListener('click', () => this.openUserModal());
        document.getElementById('closeUserModal').addEventListener('click', () => this.closeUserModal());
        document.getElementById('cancelUser').addEventListener('click', () => this.closeUserModal());
        document.getElementById('userForm').addEventListener('submit', (e) => this.createUser(e));

        // 任务分配
        document.getElementById('assignTaskBtn').addEventListener('click', () => this.openAssignModal());
        document.getElementById('closeAssignModal').addEventListener('click', () => this.closeAssignModal());
        document.getElementById('cancelAssign').addEventListener('click', () => this.closeAssignModal());
        document.getElementById('assignForm').addEventListener('submit', (e) => this.assignTask(e));

        // 任务详情
        document.getElementById('closeTaskDetail').addEventListener('click', () => this.closeTaskDetail());

        // 任务重新分配
        document.getElementById('closeReassignModal').addEventListener('click', () => this.closeReassignModal());
        document.getElementById('cancelReassign').addEventListener('click', () => this.closeReassignModal());
        document.getElementById('reassignForm').addEventListener('submit', (e) => this.reassignTask(e));

        // 模态框外部点击关闭
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }

    switchTab(tabName) {
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}Tab`).classList.add('active');

        if (tabName === 'stats') {
            this.loadStats();
        }
    }

    async loadData() {
        await this.loadUsers();
        await this.loadTasks();
    }

    async loadUsers() {
        try {
            const response = await fetch('/api/admin/users');
            if (response.ok) {
                this.users = await response.json();
                this.renderUsers();
            }
        } catch (error) {
            this.showMessage('加载用户失败', 'error');
        }
    }

    renderUsers() {
        const grid = document.getElementById('usersGrid');
        grid.innerHTML = '';

        this.users.forEach(user => {
            const card = document.createElement('div');
            card.className = 'user-card';
            card.innerHTML = `
                <div class="user-card-header">
                    <div class="user-info">
                        <h3>${user.username}</h3>
                        <p>${user.hero_name || '未设置显示名称'}</p>
                    </div>
                    <span class="user-role ${user.role}">${user.role === 'admin' ? '管理员' : '用户'}</span>
                </div>
                <div class="user-actions">
                    <button class="assign-btn" onclick="adminApp.quickAssign(${user.id})">分配任务</button>
                    ${user.id !== 1 ? `<button class="delete-btn" onclick="adminApp.deleteUser(${user.id})">删除</button>` : ''}
                </div>
            `;
            grid.appendChild(card);
        });
    }

    async loadTasks() {
        try {
            const response = await fetch('/api/admin/todos');
            if (response.ok) {
                this.tasks = await response.json();
                this.renderTasks();
            }
        } catch (error) {
            this.showMessage('加载任务失败', 'error');
        }
    }

    renderTasks() {
        const table = document.getElementById('tasksTable');
        table.innerHTML = `
            <div class="task-row header">
                <div>任务标题</div>
                <div>分配给</div>
                <div>分配人</div>
                <div>状态</div>
                <div>优先级</div>
            </div>
        `;

        this.tasks.forEach(task => {
            const row = document.createElement('div');
            row.className = 'task-row';
            row.innerHTML = `
                <div class="task-title-cell" onclick="adminApp.showTaskDetail(${task.id})">
                    <span class="clickable-title">${task.title}</span>
                </div>
                <div>${task.username}</div>
                <div>${task.assigned_by_username || '自建'}</div>
                <div><span class="task-status ${task.status}">${task.status === 'completed' ? '已完成' : '进行中'}</span></div>
                <div>${this.getPriorityText(task.priority)}</div>
            `;
            table.appendChild(row);
        });
    }

    showTaskDetail(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        // 保存当前任务ID，用于重新分配
        this.currentTaskId = taskId;

        // 填充任务详情
        document.getElementById('detailTitle').textContent = task.title;
        document.getElementById('detailDescription').textContent = task.description || '无描述';
        document.getElementById('detailUser').textContent = task.username;
        document.getElementById('detailAssignedBy').textContent = task.assigned_by_username || '自建';
        document.getElementById('detailPriority').textContent = this.getPriorityText(task.priority);
        document.getElementById('detailStatus').textContent = task.status === 'completed' ? '已完成' : '进行中';
        document.getElementById('detailColumn').textContent = this.getColumnText(task.column_type);
        document.getElementById('detailCreatedAt').textContent = new Date(task.created_at).toLocaleString('zh-CN');
        document.getElementById('detailCompletedAt').textContent = task.completed_at 
            ? new Date(task.completed_at).toLocaleString('zh-CN') 
            : '未完成';

        // 显示模态框
        document.getElementById('taskDetailModal').style.display = 'flex';
    }

    getColumnText(columnType) {
        const columns = {
            todo: '待执行任务',
            progress: '执行中',
            completed: '已完成'
        };
        return columns[columnType] || columnType;
    }

    closeTaskDetail() {
        document.getElementById('taskDetailModal').style.display = 'none';
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

    async loadStats() {
        await this.loadDailyStats();
        await this.loadUserStats();
    }

    async loadDailyStats() {
        try {
            const response = await fetch('/api/admin/stats/daily?days=7');
            if (response.ok) {
                const stats = await response.json();
                this.renderDailyStats(stats);
            }
        } catch (error) {
            this.showMessage('加载统计失败', 'error');
        }
    }

    renderDailyStats(stats) {
        const container = document.getElementById('dailyStats');
        container.innerHTML = '';

        if (stats.length === 0) {
            container.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">暂无数据</p>';
            return;
        }

        stats.forEach(stat => {
            const row = document.createElement('div');
            row.className = 'stat-row';
            const titles = stat.titles ? stat.titles.split('|||').slice(0, 3).join(', ') : '';
            row.innerHTML = `
                <div>
                    <div class="stat-label">${stat.date}</div>
                    <div class="stat-details">${titles}${stat.count > 3 ? '...' : ''}</div>
                </div>
                <div class="stat-value">${stat.count} 个任务</div>
            `;
            container.appendChild(row);
        });
    }

    async loadUserStats() {
        try {
            const response = await fetch('/api/admin/stats/users');
            if (response.ok) {
                const stats = await response.json();
                this.renderUserStats(stats);
            }
        } catch (error) {
            this.showMessage('加载用户统计失败', 'error');
        }
    }

    renderUserStats(stats) {
        const container = document.getElementById('userStats');
        container.innerHTML = '';

        if (stats.length === 0) {
            container.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">暂无数据</p>';
            return;
        }

        stats.forEach(stat => {
            const card = document.createElement('div');
            card.className = 'user-stat-card';
            card.innerHTML = `
                <div>
                    <div style="color: #ffd700; font-weight: bold;">${stat.username}</div>
                    <div style="color: #999; font-size: 12px;">${stat.hero_name || '未设置显示名称'}</div>
                </div>
                <div class="stat-badge pending">${stat.pending_count} 待完成</div>
                <div class="stat-badge completed">${stat.completed_count} 已完成</div>
                <div class="stat-badge total">${stat.total_count} 总计</div>
            `;
            container.appendChild(card);
        });
    }

    openUserModal() {
        document.getElementById('userModal').style.display = 'flex';
    }

    closeUserModal() {
        document.getElementById('userModal').style.display = 'none';
        document.getElementById('userForm').reset();
    }

    async createUser(e) {
        e.preventDefault();

        const userData = {
            username: document.getElementById('newUsername').value,
            password: document.getElementById('newPassword').value,
            heroName: document.getElementById('newHeroName').value,
            role: document.getElementById('newUserRole').value
        };

        try {
            const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                this.showMessage('用户创建成功', 'success');
                this.closeUserModal();
                this.loadUsers();
            } else {
                const error = await response.json();
                this.showMessage(error.error, 'error');
            }
        } catch (error) {
            this.showMessage('创建失败', 'error');
        }
    }

    async deleteUser(userId) {
        if (!confirm('确定要删除这个用户吗？')) return;

        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showMessage('用户删除成功', 'success');
                this.loadUsers();
            } else {
                const error = await response.json();
                this.showMessage(error.error, 'error');
            }
        } catch (error) {
            this.showMessage('删除失败', 'error');
        }
    }

    openAssignModal() {
        this.populateUserSelect();
        document.getElementById('assignModal').style.display = 'flex';
    }

    closeAssignModal() {
        document.getElementById('assignModal').style.display = 'none';
        document.getElementById('assignForm').reset();
    }

    populateUserSelect() {
        const select = document.getElementById('assignUserId');
        select.innerHTML = '<option value="">选择用户</option>';
        
        this.users.filter(u => u.role === 'user').forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = `${user.username}${user.hero_name ? ' (' + user.hero_name + ')' : ''}`;
            select.appendChild(option);
        });
    }

    quickAssign(userId) {
        this.openAssignModal();
        document.getElementById('assignUserId').value = userId;
    }

    async assignTask(e) {
        e.preventDefault();

        const taskData = {
            userId: parseInt(document.getElementById('assignUserId').value),
            title: document.getElementById('assignTitle').value,
            description: document.getElementById('assignDescription').value,
            priority: document.getElementById('assignPriority').value,
            columnType: 'todo'
        };

        try {
            const response = await fetch('/api/todos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData)
            });

            if (response.ok) {
                this.showMessage('任务分配成功', 'success');
                this.closeAssignModal();
                this.loadTasks();
            } else {
                const error = await response.json();
                this.showMessage(error.error, 'error');
            }
        } catch (error) {
            this.showMessage('分配失败', 'error');
        }
    }

    openReassignModal() {
        const task = this.tasks.find(t => t.id === this.currentTaskId);
        if (!task) return;

        // 填充当前任务信息
        document.getElementById('reassignTaskTitle').textContent = task.title;
        document.getElementById('reassignCurrentUser').textContent = task.username;

        // 填充用户下拉列表
        const select = document.getElementById('reassignUserId');
        select.innerHTML = '<option value="">选择用户</option>';
        
        this.users.filter(u => u.role === 'user').forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = `${user.username}${user.hero_name ? ' (' + user.hero_name + ')' : ''}`;
            // 如果是当前用户，标记为选中
            if (user.id === task.user_id) {
                option.selected = true;
            }
            select.appendChild(option);
        });

        // 关闭任务详情模态框
        document.getElementById('taskDetailModal').style.display = 'none';
        // 显示重新分配模态框
        document.getElementById('reassignModal').style.display = 'flex';
    }

    closeReassignModal() {
        document.getElementById('reassignModal').style.display = 'none';
        document.getElementById('reassignForm').reset();
    }

    async reassignTask(e) {
        e.preventDefault();

        const userId = parseInt(document.getElementById('reassignUserId').value);
        
        if (!userId) {
            this.showMessage('请选择用户', 'error');
            return;
        }

        try {
            const response = await fetch(`/api/admin/todos/${this.currentTaskId}/reassign`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            if (response.ok) {
                this.showMessage('任务重新分配成功', 'success');
                this.closeReassignModal();
                this.loadTasks(); // 重新加载任务列表
            } else {
                const error = await response.json();
                this.showMessage(error.error, 'error');
            }
        } catch (error) {
            this.showMessage('重新分配失败', 'error');
        }
    }

    async logout() {
        try {
            await fetch('/api/logout', { method: 'POST' });
            window.location.href = '/';
        } catch (error) {
            console.error('登出失败:', error);
        }
    }

    showMessage(message, type = 'info') {
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

const adminApp = new AdminApp();
