const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : '/api';

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

function showMessage(text, isError = false) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = isError ? 'message error' : 'message success';
    messageEl.classList.remove('hidden');
    
    setTimeout(() => {
        messageEl.classList.add('hidden');
    }, 5000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getPurposeInfo(purpose) {
    const map = {
        'love': { emoji: '❤️', text: 'Tìm người yêu' },
        'friend': { emoji: '🤝', text: 'Tìm bạn' },
        'study': { emoji: '📖', text: 'Tìm người học tập' },
        'research': { emoji: '🔬', text: 'Tìm người nghiên cứu' },
        'roommate': { emoji: '🏠', text: 'Tìm Roommate' }
    };
    return map[purpose] || { emoji: '🎯', text: 'Không xác định' };
}

function editOrientation() {
    localStorage.setItem('editOrientation', 'true');
    window.location.href = 'questionnaire-orientation.html';
}

function getOrientationLabels() {
    return {
        myGender: 'Giới tính của bạn',
        targetGender: 'Muốn kết nối với',
        relationshipGoal: 'Mục tiêu mối quan hệ',
        readiness: 'Mức độ sẵn sàng',
        freeTime: 'Thời gian rảnh',
        conversationStyle: 'Phong cách trò chuyện',
        comfortZone: 'Vùng thoải mái',
        lifestyle: 'Phong cách sống',
        stressResponse: 'Phản ứng với áp lực'
    };
}

function formatOrientationValue(key, value) {
    const valueMap = {
        myGender: {
            'male': '👨 Nam',
            'female': '👩 Nữ',
            'other': '🌈 Khác'
        },
        targetGender: {
            'male': '👨 Nam',
            'female': '👩 Nữ',
            'both': '🤝 Nam hoặc nữ'
        },
        relationshipGoal: {
            'long-term': '💍 Lâu dài, nghiêm túc',
            'slow-serious': '🌱 Tìm hiểu nghiêm túc nhưng chậm rãi',
            'undefined': '❓ Chưa xác định rõ, cần thời gian'
        },
        readiness: {
            'very-ready': '✅ Rất sẵn sàng',
            'quite-ready': '👍 Khá sẵn sàng',
            'need-time': '⏳ Cần thêm thời gian'
        },
        freeTime: {
            'stay-home': '🏠 Ở nhà một mình',
            'go-out': '🚶 Ra ngoài gặp gỡ',
            'depends': '🤔 Tuỳ thời điểm'
        },
        conversationStyle: {
            'talk-much': '💬 Chủ động nói nhiều',
            'listen': '👂 Lắng nghe là chính',
            'talk-when-needed': '🤐 Chỉ nói khi cần'
        },
        comfortZone: {
            'alone': '🧘 Làm việc/hoạt động một mình',
            'with-others': '👥 Làm việc/hoạt động cùng người khác',
            'flexible': '⚖️ Lúc này lúc kia'
        },
        lifestyle: {
            'fun': '😄 Vui vẻ, thoải mái',
            'serious': '📋 Nghiêm túc, có kế hoạch',
            'balanced': '⚖️ Linh hoạt giữa hai kiểu'
        },
        stressResponse: {
            'share': '🤗 Muốn có người chia sẻ',
            'self-solve': '💪 Tự giải quyết',
            'avoid': '🚫 Tránh tiếp xúc'
        }
    };

    return valueMap[key]?.[value] || value;
}

function renderOrientation(orientation) {
    const container = document.getElementById('orientationContent');
    const labels = getOrientationLabels();
    
    let html = '<div class="answers-list">';
    Object.entries(orientation).forEach(([key, value]) => {
        if (key === 'userId' || key === 'studentId' || key === 'createdAt') return;
        
        const label = labels[key] || key;
        const displayValue = formatOrientationValue(key, value);
        
        html += `
            <div class="answer-item">
                <span class="answer-label">${label}:</span>
                <span class="answer-value">${displayValue}</span>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

function renderAnswersLog(answers, purpose) {
    const container = document.getElementById('answersLog');
    
    if (!answers || Object.keys(answers).length === 0) {
        container.innerHTML = '<p class="no-data">Chưa có câu trả lời</p>';
        return;
    }

    const questionLabels = getQuestionLabels(purpose);
    
    let html = '<div class="answers-list">';
    Object.entries(answers).forEach(([key, value]) => {
        const label = questionLabels[key] || key;
        html += `
            <div class="answer-item">
                <span class="answer-label">${label}:</span>
                <span class="answer-value">${formatAnswerValue(key, value)}</span>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

function getQuestionLabels(purpose) {
    const commonLabels = {
        name: 'Tên/Biệt danh',
        gender: 'Giới tính'
    };

    if (purpose === 'love') {
        return {
            ...commonLabels,
            birthYear: 'Năm sinh',
            height: 'Chiều cao',
            appearance: 'Ngoại hình',
            lifestyle: 'Lối sống',
            travel: 'Du lịch',
            personality: 'Tính cách',
            creative: 'Sáng tạo',
            datingStyle: 'Phong cách hẹn hò',
            idealPersonality: 'Tính cách lý tưởng',
            priority: 'Ưu tiên',
            relationshipGoal: 'Mục tiêu quan hệ',
            sharedInterests: 'Sở thích chung',
            openToNew: 'Sẵn sàng thử mới'
        };
    } else if (purpose === 'friend') {
        return {
            ...commonLabels,
            friendPurpose: 'Tìm bạn để',
            friendStyle: 'Phong cách bạn bè',
            contactFrequency: 'Tần suất liên lạc',
            friendExpectation: 'Mong muốn ở người bạn'
        };
    } else if (purpose === 'study') {
        return {
            ...commonLabels,
            studyGoal: 'Mục đích học',
            studyField: 'Lĩnh vực học',
            punctuality: 'Tính đúng giờ',
            studyEfficiency: 'Hiệu quả học tập',
            groupRole: 'Vai trò trong nhóm',
            proactivity: 'Tính chủ động',
            studyFormat: 'Hình thức học (x2)',
            studyFrequency: 'Tần suất học',
            partnerExpectation: 'Mong đợi ở bạn học'
        };
    } else if (purpose === 'research') {
        return {
            ...commonLabels,
            field: 'Lĩnh vực',
            level: 'Trình độ',
            experience: 'Kinh nghiệm',
            purpose: 'Mục đích',
            duration: 'Thời gian',
            workStyle: 'Phong cách làm việc',
            workLocation: 'Địa điểm',
            workTime: 'Khung giờ',
            skillNeeded: 'Kỹ năng',
            teamwork: 'Làm việc nhóm',
            teamValue: 'Giá trị nhóm'
        };
    }

    return commonLabels;
}

function formatAnswerValue(key, value) {
    const valueMap = {
        gender: {
            'male': '👨 Nam',
            'female': '👩 Nữ',
            'other': '🧑 Khác'
        },
        appearance: {
            'attractive': 'Ưu nhìn',
            'normal': 'Bình thường',
            'notAttracted': 'Không ưu nhìn'
        },
        lifestyle: {
            'quiet': 'Yên tĩnh',
            'active': 'Sôi nổi',
            'balanced': 'Cân bằng'
        },
        personality: {
            'extrovert': 'Hướng ngoại',
            'introvert': 'Hướng nội',
            'ambivert': 'Cả hai'
        },
        friendPurpose: {
            'chat': '💬 Trò chuyện, chia sẻ',
            'activities': '🎉 Cùng tham gia hoạt động',
            'support': '🤝 Hỗ trợ tinh thần',
            'other': '✨ Khác'
        },
        friendStyle: {
            'friendly': '😊 Hoà đồng',
            'calm': '😌 Điềm đạm',
            'quiet': '🤫 Không quá ồn ào'
        },
        contactFrequency: {
            'often': '📞 Thường xuyên',
            'whenNeeded': '📱 Khi cần',
            'casual': '🎲 Tuỳ hứng'
        },
        friendExpectation: {
            'listening': '👂 Biết lắng nghe',
            'respectPrivacy': '🔒 Tôn trọng riêng tư',
            'sincere': '💖 Chân thành',
            'other': '✨ Khác'
        },
        studyGoal: {
            'groupStudy': '📚 Học nhóm',
            'homework': '✍️ Làm bài tập',
            'examPrep': '📝 Ôn thi',
            'project': '💼 Làm project',
            'other': '✨ Khác'
        },
        studyField: {
            'socialScience': '👥 Khoa học xã hội',
            'naturalScience': '🔬 Khoa học tự nhiên',
            'language': '🗣️ Ngôn ngữ',
            'economics': '💰 Kinh tế',
            'technology': '💻 Công nghệ',
            'other': '✨ Khác'
        },
        punctuality: {
            'always': '⏰ Luôn đúng giờ',
            'often': '👍 Thường đúng giờ',
            'sometimes': '🤔 Thỉnh thoảng',
            'flexible': '🤷 Linh hoạt'
        },
        studyEfficiency: {
            'planned': '📋 Có kế hoạch rõ ràng',
            'focused': '🎯 Tập trung cao độ',
            'flexible': '🔄 Linh hoạt',
            'needMotivation': '💪 Cần động lực'
        },
        groupRole: {
            'leader': '👑 Người dẫn dắt',
            'active': '🙋 Tích cực tham gia',
            'support': '🤝 Hỗ trợ',
            'listener': '👂 Lắng nghe và học hỏi'
        },
        proactivity: {
            'veryProactive': '🚀 Rất chủ động',
            'proactive': '👍 Chủ động',
            'balanced': '⚖️ Cân bằng',
            'needGuidance': '🧭 Cần hướng dẫn'
        },
        studyFormat: {
            'online': '💻 Online',
            'offline': '🏫 Offline',
            'hybrid': '🔄 Cả hai'
        },
        studyFrequency: {
            'daily': '📅 Hàng ngày',
            'fewTimesWeek': '📆 Vài lần/tuần',
            'weekly': '📆 Hàng tuần',
            'flexible': '🤷 Linh hoạt'
        },
        partnerExpectation: {
            'serious': '💯 Nghiêm túc',
            'punctual': '⏰ Đúng giờ',
            'knowledgeable': '🧠 Am hiểu',
            'patient': '😌 Kiên nhẫn',
            'friendly': '😊 Thân thiện',
            'other': '✨ Khác'
        }
    };

    if (valueMap[key] && valueMap[key][value]) {
        return valueMap[key][value];
    }

    return value;
}

function editProfile() {
    const profile = window.currentProfile;
    if (!profile) return;

    // Lưu purpose và chuyển đến trang questionnaire tương ứng
    localStorage.setItem('purpose', profile.purpose);
    localStorage.setItem('editMode', 'true');

    if (profile.purpose === 'love') {
        window.location.href = 'questionnaire-love.html';
    } else if (profile.purpose === 'friend') {
        window.location.href = 'questionnaire-friend.html';
    } else if (profile.purpose === 'research') {
        window.location.href = 'questionnaire-research.html';
    } else if (profile.purpose === 'roommate') {
        window.location.href = 'questionnaire-roommate.html';
    }
}

async function loadProfile() {
    const token = localStorage.getItem('token');
    const loadingEl = document.getElementById('loadingMessage');
    const contentEl = document.getElementById('profileContent');
    const noProfileEl = document.getElementById('noProfile');

    try {
        // Load profile
        const response = await fetch(`${API_URL}/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        loadingEl.classList.add('hidden');

        if (data.profiles && data.profiles.length > 0) {
            window.currentProfiles = data.profiles;
            contentEl.classList.remove('hidden');
            renderProfiles(data.profiles);
            
            // Load orientation
            loadOrientation(token);
        } else {
            noProfileEl.classList.remove('hidden');
        }
    } catch (error) {
        loadingEl.innerHTML = '<p class="error">Lỗi kết nối server</p>';
    }
}

async function loadOrientation(token) {
    const orientationLoading = document.getElementById('orientationLoading');
    const orientationContent = document.getElementById('orientationContent');
    const noOrientation = document.getElementById('noOrientation');
    
    try {
        const response = await fetch(`${API_URL}/orientation/check`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        console.log('Orientation data:', data); // Debug log
        
        orientationLoading.classList.add('hidden');
        
        if (data.hasOrientation && data.orientation) {
            orientationContent.classList.remove('hidden');
            renderOrientation(data.orientation);
        } else {
            noOrientation.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error loading orientation:', error); // Debug log
        orientationLoading.innerHTML = '<p class="error">Lỗi tải định hướng</p>';
    }
}

function renderProfiles(profiles) {
    // User info từ profile đầu tiên (tất cả đều có userInfo giống nhau)
    const firstProfile = profiles[0];
    if (firstProfile.userInfo) {
        document.getElementById('studentId').textContent = firstProfile.userInfo.studentId;

        // Contact info - CHỈ hiển thị Facebook và Instagram
        const contactInfo = firstProfile.userInfo.contact || {};
        let contactHtml = '';
        if (contactInfo.facebook) {
            contactHtml += `<p>📘 Facebook: <a href="${contactInfo.facebook.includes('http') ? contactInfo.facebook : 'https://facebook.com/' + contactInfo.facebook}" target="_blank">${contactInfo.facebook}</a></p>`;
        }
        if (contactInfo.instagram) {
            contactHtml += `<p>📷 Instagram: <a href="https://instagram.com/${contactInfo.instagram.replace('@', '')}" target="_blank">${contactInfo.instagram}</a></p>`;
        }
        if (!contactHtml) {
            contactHtml = '<p class="no-data">Chưa có thông tin liên hệ</p>';
        }
        document.getElementById('contactInfo').innerHTML = contactHtml;
    }

    // Hiển thị tất cả các profiles
    const purposeBadgeEl = document.getElementById('purposeBadge');
    const answersLogEl = document.getElementById('answersLog');
    const createdAtEl = document.getElementById('createdAt');
    const updatedAtEl = document.getElementById('updatedAt');
    
    // Tạo HTML cho tất cả profiles
    let purposeHtml = '';
    let answersHtml = '<div class="profiles-container">';
    
    profiles.forEach((profile, index) => {
        const purposeInfo = getPurposeInfo(profile.purpose);
        
        // Badge cho purpose
        purposeHtml += `<span class="badge" style="margin: 5px;">${purposeInfo.emoji} ${purposeInfo.text}</span>`;
        
        // Section cho mỗi profile
        answersHtml += `
            <div class="profile-section" style="margin-bottom: 32px; padding: 24px; border: 2px solid var(--gray-lighter); border-radius: 16px; background: linear-gradient(135deg, rgba(255,107,157,0.02) 0%, rgba(79,172,254,0.02) 100%);">
                <h3 style="color: var(--primary); margin-bottom: 16px; display: flex; align-items: center; gap: 10px;">
                    ${purposeInfo.emoji} ${purposeInfo.text}
                    <button onclick="editProfileByPurpose('${profile.purpose}')" class="btn btn-secondary" style="margin-left: auto; padding: 8px 16px; font-size: 14px;">✏️ Chỉnh sửa</button>
                    <button onclick="viewMatches('${profile.purpose}')" class="btn-primary" style="padding: 8px 16px; font-size: 14px; width: auto;">👥 Xem matches</button>
                </h3>
                <p style="color: var(--gray); font-size: 0.9em; margin-bottom: 16px;">
                    Tạo lúc: ${formatDate(profile.createdAt)} 
                    ${profile.updatedAt ? `| Cập nhật: ${formatDate(profile.updatedAt)}` : ''}
                </p>
        `;
        
        // Render answers
        if (profile.answers && Object.keys(profile.answers).length > 0) {
            const questionLabels = getQuestionLabels(profile.purpose);
            answersHtml += '<div class="answers-list">';
            Object.entries(profile.answers).forEach(([key, value]) => {
                const label = questionLabels[key] || key;
                answersHtml += `
                    <div class="answer-item">
                        <span class="answer-label">${label}:</span>
                        <span class="answer-value">${formatAnswerValue(key, value)}</span>
                    </div>
                `;
            });
            answersHtml += '</div>';
        } else {
            answersHtml += '<p class="no-data">Chưa có câu trả lời</p>';
        }
        
        answersHtml += '</div>';
    });
    
    answersHtml += '</div>';
    
    purposeBadgeEl.innerHTML = purposeHtml;
    answersLogEl.innerHTML = answersHtml;
    
    // Ẩn phần created/updated date cũ vì đã hiển thị trong từng profile
    createdAtEl.parentElement.parentElement.style.display = 'none';
}

function editProfileByPurpose(purpose) {
    localStorage.setItem('purpose', purpose);
    localStorage.setItem('editMode', 'true');

    if (purpose === 'love') {
        window.location.href = 'questionnaire-love.html';
    } else if (purpose === 'friend') {
        window.location.href = 'questionnaire-friend.html';
    } else if (purpose === 'research') {
        window.location.href = 'questionnaire-research.html';
    } else if (purpose === 'roommate') {
        window.location.href = 'questionnaire-roommate.html';
    }
}

function viewMatches(purpose) {
    window.location.href = `matches.html?purpose=${purpose}`;
}

function renderProfile(profile) {
    // User info
    if (profile.userInfo) {
        document.getElementById('studentId').textContent = profile.userInfo.studentId;

        // Contact info - CHỈ hiển thị Facebook và Instagram
        const contactInfo = profile.userInfo.contact || {};
        let contactHtml = '';
        if (contactInfo.facebook) {
            contactHtml += `<p>📘 Facebook: <a href="${contactInfo.facebook.includes('http') ? contactInfo.facebook : 'https://facebook.com/' + contactInfo.facebook}" target="_blank">${contactInfo.facebook}</a></p>`;
        }
        if (contactInfo.instagram) {
            contactHtml += `<p>📷 Instagram: <a href="https://instagram.com/${contactInfo.instagram.replace('@', '')}" target="_blank">${contactInfo.instagram}</a></p>`;
        }
        if (!contactHtml) {
            contactHtml = '<p class="no-data">Chưa có thông tin liên hệ</p>';
        }
        document.getElementById('contactInfo').innerHTML = contactHtml;
    }

    // Purpose
    const purposeInfo = getPurposeInfo(profile.purpose);
    document.getElementById('purposeBadge').innerHTML = `
        <span class="badge">${purposeInfo.emoji} ${purposeInfo.text}</span>
    `;

    // Answers
    renderAnswersLog(profile.answers, profile.purpose);

    // Dates
    document.getElementById('createdAt').textContent = formatDate(profile.createdAt);
    document.getElementById('updatedAt').textContent = profile.updatedAt 
        ? formatDate(profile.updatedAt) 
        : formatDate(profile.createdAt);
}

// Init
window.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadProfile();
    loadConnections();
    loadPremiumStatus();
    checkPaymentStatus();
});

async function loadPremiumStatus() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/premium/status`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            
            if (data.isPremium && data.remainingMatches > 0) {
                document.getElementById('premiumStatus').style.display = 'block';
                document.getElementById('premiumMatches').textContent = data.remainingMatches;
                
                let info = '';
                if (data.isMonthly) {
                    const expiresAt = new Date(data.expiresAt);
                    info = `Premium Monthly - Hết hạn: ${expiresAt.toLocaleDateString('vi-VN')}`;
                } else {
                    info = 'Lượt match một lần';
                }
                document.getElementById('premiumInfo').textContent = info;
            }
        }
    } catch (error) {
        console.error('Error loading premium status:', error);
    }
}

function checkPaymentStatus() {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    
    if (paymentStatus === 'success') {
        showMessage('✅ Thanh toán thành công! Lượt match đã được cộng vào tài khoản.');
        // Remove query param
        window.history.replaceState({}, document.title, window.location.pathname);
        // Reload premium status
        setTimeout(() => loadPremiumStatus(), 500);
    } else if (paymentStatus === 'failed') {
        showMessage('❌ Thanh toán thất bại', true);
        window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus === 'cancelled') {
        showMessage('⚠️ Bạn đã hủy thanh toán', true);
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

async function loadConnections() {
    const token = localStorage.getItem('token');
    const loadingEl = document.getElementById('loadingConnections');
    const listEl = document.getElementById('connectionsList');
    const noConnectionsEl = document.getElementById('noConnections');
    
    try {
        const response = await fetch(`${API_URL}/my-connections`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        console.log('Connections data:', data); // Debug log
        
        loadingEl.classList.add('hidden');
        
        if (data.connections && data.connections.length > 0) {
            listEl.classList.remove('hidden');
            renderConnections(data.connections);
        } else {
            noConnectionsEl.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Error loading connections:', error); // Debug log
        loadingEl.innerHTML = '<p class="error">Lỗi khi tải kết nối</p>';
    }
}

function renderConnections(connections) {
    const listEl = document.getElementById('connectionsList');
    
    let html = '<div class="connections-grid">';
    
    connections.forEach(conn => {
        const partner = conn.partner;
        const purposeInfo = getPurposeInfo(conn.purpose);
        const answers = partner.profile?.answers || {};
        
        html += `
            <div class="connection-card">
                <div class="connection-header">
                    <div class="connection-avatar">${getAvatarEmoji(answers.gender)}</div>
                    <div class="connection-info">
                        <h4>${answers.name || 'Người dùng VNU'}</h4>
                        <p class="connection-badge">
                            ${purposeInfo.emoji} ${purposeInfo.text}
                        </p>
                    </div>
                </div>
                
                <div class="connection-meta">
                    <p>📅 Kết nối từ: ${formatDate(conn.createdAt)}</p>
                    ${answers.gender ? `<p>${answers.gender === 'male' ? '👨 Nam' : answers.gender === 'female' ? '👩 Nữ' : '🧑 Khác'}</p>` : ''}
                    ${answers.birthYear ? `<p>🎂 Sinh năm ${answers.birthYear}</p>` : ''}
                </div>
                
                <div class="connection-contact">
                    <h5>📱 Liên hệ:</h5>
                    ${partner.contact?.facebook ? `<p>📘 Facebook: <a href="${partner.contact.facebook.includes('http') ? partner.contact.facebook : 'https://facebook.com/' + partner.contact.facebook}" target="_blank">${partner.contact.facebook}</a></p>` : ''}
                    ${partner.contact?.instagram ? `<p>📷 Instagram: <a href="https://instagram.com/${partner.contact.instagram.replace('@', '')}" target="_blank">${partner.contact.instagram}</a></p>` : ''}
                    ${!partner.contact?.facebook && !partner.contact?.instagram ? `<p class="no-data">Chưa có thông tin liên hệ</p>` : ''}
                </div>
                
                <div class="connection-actions">
                    <button onclick="disconnectUser('${conn.id}')" class="btn btn-danger" style="width: 100%; background: var(--danger); color: white;">
                        ❌ Hủy kết nối
                    </button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    listEl.innerHTML = html;
}

function getAvatarEmoji(gender) {
    if (gender === 'male') return '👨';
    if (gender === 'female') return '👩';
    return '🧑';
}

async function disconnectUser(connectionId) {
    const confirmed = await customConfirm(
        'Bạn có chắc muốn hủy kết nối này?\n\nSau khi hủy, cả hai bạn sẽ có thể match với người khác.',
        'Xác nhận hủy kết nối',
        {
            icon: '⚠️',
            confirmText: 'Hủy kết nối',
            cancelText: 'Giữ lại'
        }
    );
    
    if (!confirmed) {
        return;
    }
    
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_URL}/connection/${connectionId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('✅ ' + data.message);
            // Reload connections
            loadConnections();
        } else {
            showMessage('❌ ' + (data.error || 'Không thể hủy kết nối'), true);
        }
    } catch (error) {
        showMessage('❌ Lỗi kết nối server', true);
    }
}
