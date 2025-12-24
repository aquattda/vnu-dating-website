const API_URL = 'http://localhost:3000/api';

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

function goToPurpose() {
    window.location.href = 'purpose.html';
}

async function loadMatches() {
    const token = localStorage.getItem('token');
    const loadingEl = document.getElementById('loadingMessage');
    const containerEl = document.getElementById('matchesContainer');
    const noMatchesEl = document.getElementById('noMatches');

    try {
        // Kiểm tra cooldown status trước
        await checkConnectionStatus();
        
        // Lấy purpose từ URL query parameter
        const urlParams = new URLSearchParams(window.location.search);
        const purpose = urlParams.get('purpose') || localStorage.getItem('purpose');
        
        // Tạo URL với purpose parameter
        const url = purpose ? `${API_URL}/matches?purpose=${purpose}` : `${API_URL}/matches`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        loadingEl.classList.add('hidden');

        if (data.matches && data.matches.length > 0) {
            containerEl.classList.remove('hidden');
            renderMatches(data.matches);
        } else {
            noMatchesEl.classList.remove('hidden');
        }
    } catch (error) {
        loadingEl.innerHTML = '<p class="error">Lỗi kết nối server</p>';
    }
}

function renderMatches(matches) {
    const container = document.getElementById('matchesContainer');
    const purpose = localStorage.getItem('purpose');
    
    let purposeEmoji = '❤️';
    let purposeText = 'Tìm người yêu';
    
    if (purpose === 'friend') {
        purposeEmoji = '🤝';
        purposeText = 'Tìm bạn';
    } else if (purpose === 'research') {
        purposeEmoji = '📚';
        purposeText = 'Tìm đồng nghiệp nghiên cứu';
    }

    container.innerHTML = `
        <div class="matches-header">
            <h2>${purposeEmoji} ${purposeText}</h2>
            <p>Tìm thấy ${matches.length} người có tỷ lệ phù hợp ≥60% với bạn</p>
            <p class="info-note">✨ Bạn có thể xem thông tin liên hệ của họ để kết nối</p>
        </div>
        <div class="matches-list">
            ${matches.map(match => createMatchCard(match)).join('')}
        </div>
    `;
}

function createMatchCard(match) {
    const matchPercent = match.compatibility || 0;

    return `
        <div class="match-card">
            <div class="match-header">
                <div class="match-avatar">👤</div>
                <div class="match-info">
                    <h3>${match.name || 'Người dùng VNU'}</h3>
                    <p class="match-meta">
                        ${match.faculty || 'VNU'} • 
                        ${match.year ? `Năm ${match.year}` : ''}
                    </p>
                </div>
                <div class="match-score">
                    <div class="score-circle ${matchPercent >= 90 ? 'score-excellent' : matchPercent >= 80 ? 'score-great' : 'score-good'}">
                        ${matchPercent}%
                    </div>
                    <p>Phù hợp</p>
                </div>
            </div>

            <div class="match-details">
                <h4>Mức độ tương thích:</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="label">Tỷ lệ phù hợp:</span>
                        <span class="value">${matchPercent}%</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Khoa:</span>
                        <span class="value">${match.faculty || 'Không rõ'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Năm học:</span>
                        <span class="value">${match.year || 'Không rõ'}</span>
                    </div>
                </div>
            </div>
            
            <div class="match-actions">
                <p class="info-note" style="text-align: center; margin-bottom: 16px; color: var(--gray); font-size: 0.9em;">
                    🔒 Thông tin liên hệ sẽ được hiển thị sau khi bạn kết nối với người này
                </p>
                <button class="btn btn-primary" onclick="connectWithUser('${match.userId}', '${localStorage.getItem('purpose')}')">
                    🤝 Kết nối với người này
                </button>
            </div>
        </div>
    `;
}

function getAvatarEmoji(gender) {
    if (gender === 'male') return '👨';
    if (gender === 'female') return '👩';
    return '🧑';
}

function getPersonalityText(value) {
    const map = {
        'extrovert': 'Hướng ngoại',
        'introvert': 'Hướng nội',
        'ambivert': 'Cả hai'
    };
    return map[value] || value;
}

function getLifestyleText(value) {
    const map = {
        'quiet': 'Yên tĩnh',
        'active': 'Sôi nổi',
        'balanced': 'Cân bằng'
    };
    return map[value] || value;
}

function getPriorityText(value) {
    const map = {
        'care': 'Quan tâm',
        'fun': 'Vui vẻ',
        'intelligence': 'Trí tuệ'
    };
    return map[value] || value;
}

function getRelationshipGoalText(value) {
    const map = {
        'serious': 'Nghiêm túc',
        'explore': 'Tìm hiểu',
        'casual': 'Thoải mái'
    };
    return map[value] || value;
}

function getFieldText(value) {
    const map = {
        'technology': 'Công nghệ thông tin',
        'science': 'Khoa học tự nhiên',
        'social': 'Khoa học xã hội',
        'economics': 'Kinh tế',
        'medicine': 'Y học',
        'other': 'Khác'
    };
    return map[value] || value;
}

function getHobbiesText(value) {
    const map = {
        'sports': 'Thể thao',
        'music': 'Âm nhạc',
        'reading': 'Đọc sách',
        'gaming': 'Chơi game',
        'travel': 'Du lịch'
    };
    return map[value] || value;
}

function viewProfile(userId) {
    customAlert('Chức năng xem hồ sơ chi tiết đang phát triển!', 'Thông báo', 'ℹ️', 'info');
}

async function connectWithUser(targetUserId, purpose) {
    const token = localStorage.getItem('token');
    
    const confirmed = await customConfirm(
        'Bạn có chắc muốn kết nối với người này?',
        'Xác nhận kết nối',
        {
            icon: '🤝',
            showWarning: true,
            warningTitle: 'LƯU Ý:',
            warningList: [
                'Mỗi cặp chỉ có thể kết nối 1 lần duy nhất',
                'Bạn chỉ được tạo 1 kết nối mỗi 24 giờ',
                'Sau khi kết nối, cả hai sẽ chỉ thấy nhau'
            ],
            confirmText: 'OK',
            cancelText: 'Cancel'
        }
    );
    
    if (!confirmed) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/connection`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ targetUserId, purpose })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Hiển thị thông tin liên hệ ngay trên card
            showContactInfo(targetUserId, data.partnerContact);
            customSuccess(
                data.message + '\n\n📱 Thông tin liên hệ đã được hiển thị bên dưới.\n⏰ Bạn sẽ có thể kết nối với người khác sau 24 giờ.',
                'Kết nối thành công'
            );
        } else {
            // Xử lý các loại lỗi khác nhau
            if (data.errorCode === 'ALREADY_CONNECTED_BEFORE') {
                customError(
                    'Bạn đã từng kết nối với người này rồi!\n\n💡 Mỗi cặp chỉ có thể kết nối 1 lần duy nhất trong hệ thống.',
                    'Không thể kết nối'
                );
            } else if (data.errorCode === 'COOLDOWN_ACTIVE') {
                customWarning(
                    data.error + '\n\n💡 Bạn có thể xem lại danh sách matches và chờ đến khi hết cooldown.',
                    'Giới hạn thời gian'
                );
            } else if (data.errorCode === 'HAS_ACTIVE_CONNECTION') {
                customError(
                    'Một trong hai người đang có kết nối active với mục đích này.\n\n💡 Vui lòng thử lại sau hoặc chọn người khác.',
                    'Không thể kết nối'
                );
            } else {
                customError(data.error || 'Không thể kết nối', 'Lỗi');
            }
        }
    } catch (error) {
        customError('Lỗi kết nối server', 'Lỗi mạng');
    }
}

async function checkConnectionStatus() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_URL}/connection-status`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.cooldownActive) {
            // Hiển thị warning banner về cooldown
            const matchesHeader = document.querySelector('.matches-header');
            if (matchesHeader) {
                const cooldownBanner = document.createElement('div');
                cooldownBanner.className = 'cooldown-banner';
                cooldownBanner.style.cssText = 'background: linear-gradient(135deg, #FFD166 0%, #EF476F 100%); color: white; padding: 16px 20px; border-radius: 12px; margin: 16px 0; text-align: center; font-weight: 600;';
                cooldownBanner.innerHTML = `
                    ⏰ Bạn đã tạo kết nối trong vòng 24h gần đây<br>
                    <span style="font-size: 0.9em; opacity: 0.95;">Có thể kết nối tiếp sau: ${data.hoursLeft} giờ ${data.minutesLeft || 0} phút</span>
                `;
                matchesHeader.appendChild(cooldownBanner);
            }
        }
    } catch (error) {
        console.error('Lỗi khi kiểm tra connection status:', error);
    }
}

function showContactInfo(userId, contact) {
    // Tìm match card của user này
    const matchCards = document.querySelectorAll('.match-card');
    
    matchCards.forEach(card => {
        // Tìm button có userId này
        const connectBtn = card.querySelector(`button[onclick*="${userId}"]`);
        
        if (connectBtn) {
            // Tạo HTML cho thông tin liên hệ
            let contactHtml = `
                <div class="contact-section" style="margin-top: 20px; padding: 20px; background: linear-gradient(135deg, rgba(255,107,157,0.1) 0%, rgba(79,172,254,0.1) 100%); border-radius: 12px; border: 2px solid var(--primary);">
                    <h4 style="color: var(--primary); margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                        ✅ Đã kết nối - Thông tin liên hệ:
                    </h4>
                    <div class="contact-grid" style="display: flex; flex-direction: column; gap: 12px;">
            `;
            
            if (contact.facebook) {
                contactHtml += `
                    <div class="contact-item" style="display: flex; align-items: center; gap: 12px; padding: 12px; background: white; border-radius: 8px;">
                        <span style="font-size: 24px;">📘</span>
                        <div>
                            <div style="font-size: 0.85em; color: var(--gray); margin-bottom: 4px;">Facebook:</div>
                            <a href="${contact.facebook.includes('http') ? contact.facebook : 'https://facebook.com/' + contact.facebook}" 
                               target="_blank" 
                               style="color: var(--primary); font-weight: 600; text-decoration: none;">
                               ${contact.facebook} →
                            </a>
                        </div>
                    </div>
                `;
            }
            
            if (contact.instagram) {
                contactHtml += `
                    <div class="contact-item" style="display: flex; align-items: center; gap: 12px; padding: 12px; background: white; border-radius: 8px;">
                        <span style="font-size: 24px;">📷</span>
                        <div>
                            <div style="font-size: 0.85em; color: var(--gray); margin-bottom: 4px;">Instagram:</div>
                            <a href="https://instagram.com/${contact.instagram.replace('@', '')}" 
                               target="_blank" 
                               style="color: var(--primary); font-weight: 600; text-decoration: none;">
                               ${contact.instagram} →
                            </a>
                        </div>
                    </div>
                `;
            }
            
            if (!contact.facebook && !contact.instagram) {
                contactHtml += `
                    <div style="text-align: center; color: var(--gray); padding: 12px;">
                        Người này chưa cung cấp thông tin liên hệ
                    </div>
                `;
            }
            
            contactHtml += `
                    </div>
                </div>
            `;
            
            // Thay thế phần match-actions bằng contact info
            const actionsDiv = card.querySelector('.match-actions');
            if (actionsDiv) {
                actionsDiv.innerHTML = contactHtml;
            }
        }
    });
}

// Init
window.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadMatches();
});
