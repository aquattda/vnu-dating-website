// Custom Modal Functions
function createModal(options) {
    const {
        title = 'Thông báo',
        message = '',
        icon = '💬',
        type = 'info', // 'info', 'success', 'error', 'warning', 'confirm'
        showWarning = false,
        warningTitle = '',
        warningList = [],
        confirmText = 'OK',
        cancelText = 'Hủy',
        onConfirm = null,
        onCancel = null
    } = options;

    // Remove existing modal if any
    const existingModal = document.querySelector('.custom-modal');
    if (existingModal) {
        existingModal.remove();
    }

    // Create modal HTML
    const modal = document.createElement('div');
    modal.className = `custom-modal modal-${type}`;
    
    let warningHtml = '';
    if (showWarning && warningList.length > 0) {
        warningHtml = `
            <div class="modal-warning">
                <div class="modal-warning-title">⚠️ ${warningTitle}</div>
                <ul class="modal-warning-list">
                    ${warningList.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    let footerHtml = '';
    if (type === 'confirm') {
        footerHtml = `
            <div class="modal-footer">
                <button class="modal-btn modal-btn-secondary" onclick="closeCustomModal(false)">
                    ${cancelText}
                </button>
                <button class="modal-btn modal-btn-primary" onclick="closeCustomModal(true)">
                    ${confirmText}
                </button>
            </div>
        `;
    } else {
        footerHtml = `
            <div class="modal-footer">
                <button class="modal-btn modal-btn-primary" onclick="closeCustomModal(true)">
                    ${confirmText}
                </button>
            </div>
        `;
    }

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <span class="modal-icon">${icon}</span>
                <h3 class="modal-title">${title}</h3>
            </div>
            <div class="modal-body">
                <p class="modal-message">${message.replace(/\n/g, '<br>')}</p>
                ${warningHtml}
            </div>
            ${footerHtml}
        </div>
    `;

    document.body.appendChild(modal);

    // Store callbacks
    modal._onConfirm = onConfirm;
    modal._onCancel = onCancel;

    // Show modal with animation
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeCustomModal(false);
        }
    });

    return modal;
}

function closeCustomModal(confirmed) {
    const modal = document.querySelector('.custom-modal');
    if (!modal) return;

    modal.classList.remove('active');
    
    setTimeout(() => {
        if (confirmed && modal._onConfirm) {
            modal._onConfirm();
        } else if (!confirmed && modal._onCancel) {
            modal._onCancel();
        }
        modal.remove();
    }, 300);
}

// Custom Alert
function customAlert(message, title = 'Thông báo', icon = '💬', type = 'info') {
    createModal({
        title,
        message,
        icon,
        type,
        confirmText: 'Đóng'
    });
}

// Custom Confirm
function customConfirm(message, title = 'Xác nhận', options = {}) {
    return new Promise((resolve) => {
        createModal({
            title,
            message,
            icon: options.icon || '❓',
            type: 'confirm',
            showWarning: options.showWarning || false,
            warningTitle: options.warningTitle || 'LƯU Ý:',
            warningList: options.warningList || [],
            confirmText: options.confirmText || 'OK',
            cancelText: options.cancelText || 'Hủy',
            onConfirm: () => resolve(true),
            onCancel: () => resolve(false)
        });
    });
}

// Custom Success
function customSuccess(message, title = 'Thành công') {
    createModal({
        title,
        message,
        icon: '✅',
        type: 'success',
        confirmText: 'Đóng'
    });
}

// Custom Error
function customError(message, title = 'Lỗi') {
    createModal({
        title,
        message,
        icon: '❌',
        type: 'error',
        confirmText: 'Đóng'
    });
}

// Custom Warning
function customWarning(message, title = 'Cảnh báo') {
    createModal({
        title,
        message,
        icon: '⚠️',
        type: 'warning',
        confirmText: 'Đóng'
    });
}
