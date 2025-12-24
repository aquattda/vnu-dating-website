const API_URL = 'http://localhost:3000/api';

function showMessage(text, isError = false) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = isError ? 'message error' : 'message success';
    messageEl.classList.remove('hidden');
    
    setTimeout(() => {
        messageEl.classList.add('hidden');
    }, 5000);
}

function showLogin() {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('forgotPasswordForm').classList.add('hidden');
}

function showRegister() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
    document.getElementById('forgotPasswordForm').classList.add('hidden');
}

function showForgotPassword() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('forgotPasswordForm').classList.remove('hidden');
}

async function handleLogin(e) {
    e.preventDefault();
    
    const studentId = document.getElementById('loginStudentId').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ studentId, password })
        });

        const data = await response.json();

        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('studentId', data.user.id || data.user.studentId);
            showMessage('Đăng nhập thành công!');
            
            // Kiểm tra xem user đã có orientation chưa
            setTimeout(async () => {
                try {
                    const orientationResponse = await fetch(`${API_URL}/orientation/check`, {
                        headers: {
                            'Authorization': `Bearer ${data.token}`
                        }
                    });
                    const orientationData = await orientationResponse.json();
                    
                    if (orientationData.hasOrientation) {
                        window.location.href = 'purpose.html';
                    } else {
                        window.location.href = 'questionnaire-orientation.html';
                    }
                } catch (error) {
                    window.location.href = 'questionnaire-orientation.html';
                }
            }, 1000);
        } else {
            showMessage(data.error || 'Đăng nhập thất bại', true);
        }
    } catch (error) {
        showMessage('Lỗi kết nối server', true);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const studentId = document.getElementById('regStudentId').value;
    const gender = document.getElementById('regGender').value;
    const birthYear = parseInt(document.getElementById('regBirthYear').value);
    const hometown = document.getElementById('regHometown').value;
    const major = document.getElementById('regMajor').value;
    const facebook = document.getElementById('regFacebook').value;
    const instagram = document.getElementById('regInstagram').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;

    if (password !== confirmPassword) {
        showMessage('Mật khẩu xác nhận không khớp', true);
        return;
    }

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                studentId,
                gender,
                birthYear,
                hometown,
                major,
                facebook,
                instagram,
                password 
            })
        });

        const data = await response.json();

        if (data.success) {
            showMessage('Đăng ký thành công! Vui lòng đăng nhập');
            setTimeout(() => {
                showLogin();
            }, 1500);
        } else {
            showMessage(data.error || 'Đăng ký thất bại', true);
        }
    } catch (error) {
        showMessage('Lỗi kết nối server', true);
    }
}

// Kiểm tra đã đăng nhập chưa
window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        window.location.href = 'purpose.html';
    }
});
