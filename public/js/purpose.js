function showAdModal() {
    const adPopup = document.getElementById('adPopup');
    const adOverlay = document.getElementById('adOverlay');
    if (adPopup && adOverlay) {
        adPopup.classList.add('show');
        adOverlay.classList.add('show');
    }
}

function closeAdModal() {
    const adPopup = document.getElementById('adPopup');
    const adOverlay = document.getElementById('adOverlay');
    if (adPopup && adOverlay) {
        adPopup.classList.remove('show');
        adOverlay.classList.remove('show');
    }
}

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html';
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('studentId');
    window.location.href = 'index.html';
}

async function selectPurpose(purpose) {
    localStorage.setItem('purpose', purpose);
    
    // Luôn đi đến questionnaire (sẽ tự động load câu trả lời cũ nếu có)
    // Điều hướng đến trang questionnaire tương ứng
    if (purpose === 'love') {
        window.location.href = 'questionnaire-love.html';
    } else if (purpose === 'friend') {
        window.location.href = 'questionnaire-friend.html';
    } else if (purpose === 'academic') {
        // Đi tới trang chọn study hoặc research
        window.location.href = 'academic-choice.html';
    } else if (purpose === 'study') {
        window.location.href = 'questionnaire-study.html';
    } else if (purpose === 'research') {
        window.location.href = 'questionnaire-research.html';
    } else if (purpose === 'roommate') {
        window.location.href = 'questionnaire-roommate.html';
    }
}

// Kiểm tra auth và hiển thị quảng cáo khi load trang
window.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    // Hiển thị quảng cáo sau 0.5s
    setTimeout(() => {
        showAdModal();
    }, 500);
});
