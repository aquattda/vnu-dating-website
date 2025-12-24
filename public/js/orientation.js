const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : '/api';
let currentQuestion = 1;
let totalQuestions = 9;

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('studentId');
    localStorage.removeItem('purpose');
    window.location.href = 'index.html';
}

function updateProgress() {
    const progress = (currentQuestion / totalQuestions) * 100;
    document.getElementById('progress').style.width = progress + '%';
    document.getElementById('currentQ').textContent = currentQuestion;
}

function showQuestion(questionNum) {
    const sections = document.querySelectorAll('.question-section');
    
    sections.forEach((section, index) => {
        section.classList.remove('active');
        section.querySelectorAll('input').forEach(input => {
            input.disabled = true;
        });
    });

    const targetSection = sections[questionNum - 1];
    if (targetSection) {
        targetSection.classList.add('active');
        targetSection.querySelectorAll('input').forEach(input => {
            input.disabled = false;
        });
        currentQuestion = questionNum;
        updateProgress();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function nextQuestion() {
    const sections = Array.from(document.querySelectorAll('.question-section'));
    const currentSection = sections[currentQuestion - 1];
    const inputs = currentSection.querySelectorAll('input[required]');
    
    let isValid = true;
    inputs.forEach(input => {
        if (input.type === 'radio') {
            const radioGroup = currentSection.querySelectorAll(`input[name="${input.name}"]`);
            const checked = Array.from(radioGroup).some(radio => radio.checked);
            if (!checked) isValid = false;
        } else if (!input.value) {
            isValid = false;
        }
    });

    if (!isValid) {
        showMessage('Vui lòng trả lời câu hỏi này', true);
        return;
    }

    if (currentQuestion < totalQuestions) {
        showQuestion(currentQuestion + 1);
    }
}

function prevQuestion() {
    if (currentQuestion > 1) {
        showQuestion(currentQuestion - 1);
    }
}

function showMessage(text, isError = false) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = isError ? 'message error' : 'message success';
    messageEl.classList.remove('hidden');
    
    setTimeout(() => {
        messageEl.classList.add('hidden');
    }, 5000);
}

async function handleSubmit(e) {
    e.preventDefault();

    const sections = Array.from(document.querySelectorAll('.question-section'));
    const currentSection = sections[currentQuestion - 1];
    const inputs = currentSection.querySelectorAll('input[required]');
    
    let isValid = true;
    inputs.forEach(input => {
        if (input.type === 'radio') {
            const radioGroup = currentSection.querySelectorAll(`input[name="${input.name}"]`);
            const checked = Array.from(radioGroup).some(radio => radio.checked);
            if (!checked) isValid = false;
        } else if (!input.value) {
            isValid = false;
        }
    });

    if (!isValid) {
        showMessage('Vui lòng trả lời câu hỏi này', true);
        return;
    }

    // Enable all inputs to get data
    document.querySelectorAll('.question-section input').forEach(input => {
        input.disabled = false;
    });

    const formData = new FormData(e.target);
    const answers = {};
    
    formData.forEach((value, key) => {
        answers[key] = value;
    });

    console.log('Submitting orientation answers:', answers); // Debug log

    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`${API_URL}/orientation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ answers })
        });

        const data = await response.json();
        console.log('Orientation response:', response.status, data); // Debug log

        if (response.ok && data.success) {
            showMessage('Lưu thông tin thành công!');
            setTimeout(() => {
                // Kiểm tra xem có phải từ profile quay lại không
                const fromProfile = localStorage.getItem('editOrientation');
                if (fromProfile) {
                    localStorage.removeItem('editOrientation');
                    window.location.href = 'profile.html';
                } else {
                    window.location.href = 'purpose.html';
                }
            }, 1500);
        } else {
            showMessage(data.error || 'Có lỗi xảy ra', true);
        }
    } catch (error) {
        showMessage('Lỗi kết nối server', true);
    }
}

async function loadExistingOrientation() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_URL}/orientation/check`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.hasOrientation && data.orientation) {
            // Fill form với dữ liệu cũ
            const orientation = data.orientation;
            Object.entries(orientation).forEach(([key, value]) => {
                const input = document.querySelector(`input[name="${key}"][value="${value}"]`);
                if (input) {
                    input.checked = true;
                }
            });
        }
    } catch (error) {
        console.error('Lỗi tải orientation:', error);
    }
}

// Init
window.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    // Load existing orientation nếu đang edit
    loadExistingOrientation();
    
    // Disable all inputs except first section
    const sections = Array.from(document.querySelectorAll('.question-section'));
    sections.forEach((section, index) => {
        if (index !== 0) {
            section.querySelectorAll('input').forEach(input => {
                input.disabled = true;
            });
        }
    });
    
    updateProgress();
});
