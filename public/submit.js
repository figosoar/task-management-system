document.getElementById('submitForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('.submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = '提交中...';
    
    const taskData = {
        submitterName: document.getElementById('submitterName').value,
        submitterContact: document.getElementById('submitterContact').value,
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDescription').value,
        priority: document.getElementById('taskPriority').value,
        deadline: document.getElementById('taskDeadline').value
    };
    
    // 验证必填项
    if (!taskData.submitterName || !taskData.submitterContact || !taskData.title || !taskData.description) {
        showMessage('请填写所有必填项', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = '提交任务';
        return;
    }
    
    try {
        const response = await fetch('/api/public/submit-task', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskData)
        });
        
        if (response.ok) {
            // 隐藏表单，显示成功消息
            document.querySelector('form').style.display = 'none';
            document.getElementById('successMessage').style.display = 'block';
        } else {
            const error = await response.json();
            showMessage(error.error || '提交失败，请重试', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = '提交任务';
        }
    } catch (error) {
        showMessage('网络错误，请检查连接后重试', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = '提交任务';
    }
});

function resetForm() {
    document.querySelector('form').style.display = 'block';
    document.getElementById('successMessage').style.display = 'none';
    document.getElementById('submitForm').reset();
    document.querySelector('.submit-btn').disabled = false;
    document.querySelector('.submit-btn').textContent = '提交任务';
}

function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 300);
    }, 3000);
}

// 设置最小日期为今天
const today = new Date().toISOString().split('T')[0];
document.getElementById('taskDeadline').setAttribute('min', today);
