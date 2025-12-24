const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : '/api';
let currentQuestion = 1;
let totalQuestions = 13;

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

function initTotalQuestions() {
    // Đếm số section không bị ẩn
    const visibleSections = document.querySelectorAll('.question-section:not([style*="display: none"])');
    totalQuestions = visibleSections.length;
}

function updateProgress() {
    const progress = (currentQuestion / totalQuestions) * 100;
    document.getElementById('progress').style.width = progress + '%';
    document.getElementById('currentQ').textContent = currentQuestion;
}

function showQuestion(questionNum) {
    // Lấy danh sách các section visible (không bị ẩn)
    const visibleSections = Array.from(document.querySelectorAll('.question-section:not([style*="display: none"])'));
    
    // Ẩn tất cả câu hỏi và disable inputs
    visibleSections.forEach(section => {
        section.classList.remove('active');
        section.querySelectorAll('input').forEach(input => {
            input.disabled = true;
        });
    });

    // Hiển thị câu hỏi hiện tại dựa trên index (bắt đầu từ 1)
    const targetSection = visibleSections[questionNum - 1];
    if (targetSection) {
        targetSection.classList.add('active');
        // Enable tất cả inputs trong section hiện tại
        targetSection.querySelectorAll('input').forEach(input => {
            input.disabled = false;
        });
        currentQuestion = questionNum;
        updateProgress();

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function nextQuestion() {
    // Lấy danh sách visible sections
    const visibleSections = Array.from(document.querySelectorAll('.question-section:not([style*="display: none"])'));
    const currentSection = visibleSections[currentQuestion - 1];
    const inputs = currentSection.querySelectorAll('input[required]');
    
    // Kiểm tra validation
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

    // Lấy danh sách visible sections
    const visibleSections = Array.from(document.querySelectorAll('.question-section:not([style*="display: none"])'));
    const currentSection = visibleSections[currentQuestion - 1];
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

    // Enable tất cả inputs để lấy dữ liệu (bao gồm cả hidden sections)
    document.querySelectorAll('.question-section input').forEach(input => {
        input.disabled = false;
    });

    const formData = new FormData(e.target);
    const answers = {};
    
    formData.forEach((value, key) => {
        answers[key] = value;
    });

    const purpose = localStorage.getItem('purpose');
    const token = localStorage.getItem('token');

    try {
        // Lấy thông tin user để merge các trường cơ bản
        const userResponse = await fetch(`${API_URL}/user-info`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const userData = await userResponse.json();

        // Merge thông tin cơ bản từ user vào answers
        if (userData.success && userData.user) {
            answers.gender = userData.user.gender;
            answers.birthYear = userData.user.birthYear;
            answers.hometown = userData.user.hometown;
            answers.major = userData.user.major;
        }

        const response = await fetch(`${API_URL}/profile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ purpose, answers })
        });

        const data = await response.json();

        if (data.success) {
            showMessage('Lưu thông tin thành công!');
            setTimeout(() => {
                window.location.href = 'matches.html';
            }, 1500);
        } else {
            showMessage(data.error || 'Có lỗi xảy ra', true);
        }
    } catch (error) {
        showMessage('Lỗi kết nối server', true);
    }
}

// Init
window.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initTotalQuestions(); // Tính tổng số câu hỏi
    
    // Disable tất cả inputs trừ visible section đầu tiên
    const visibleSections = Array.from(document.querySelectorAll('.question-section:not([style*="display: none"])'));
    visibleSections.forEach((section, index) => {
        if (index !== 0) {
            section.querySelectorAll('input').forEach(input => {
                input.disabled = true;
            });
        }
    });
    
    updateProgress();
    
    // Kiểm tra chế độ chỉnh sửa và load dữ liệu cũ
    loadExistingAnswers();
});

// Load câu trả lời cũ nếu đang ở chế độ chỉnh sửa
async function loadExistingAnswers() {
    const editMode = localStorage.getItem('editMode');
    if (editMode === 'true') {
        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch(`${API_URL}/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.profile && data.profile.answers) {
                const answers = data.profile.answers;
                
                // Điền dữ liệu vào form
                Object.entries(answers).forEach(([name, value]) => {
                    const input = document.querySelector(`input[name="${name}"]`);
                    if (input) {
                        if (input.type === 'radio') {
                            const radio = document.querySelector(`input[name="${name}"][value="${value}"]`);
                            if (radio) radio.checked = true;
                        } else {
                            input.value = value;
                        }
                    }
                });

                showMessage('Đang chỉnh sửa câu trả lời của bạn', false);
            }
        } catch (error) {
            console.error('Lỗi load dữ liệu:', error);
        }

        // Xóa edit mode flag
        localStorage.removeItem('editMode');
    }
}
