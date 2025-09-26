// 독립형 백업 모달 시스템 - 다른 모달 시스템과 완전히 분리
(function() {
    'use strict';
    
    console.log('🔐 독립형 백업 모달 시스템 시작');
    
    // 기존 충돌 시스템 모두 비활성화
    function disableConflictingSystems() {
        // 기존 백업 관련 모달 모두 제거
        const existingModals = [
            'backupModal',
            'backupModalBackdrop', 
            'backup-modal',
            'portable-backup-modal'
        ];
        
        existingModals.forEach(id => {
            const modal = document.getElementById(id);
            if (modal) {
                modal.remove();
                console.log(`🗑️ 기존 모달 제거: ${id}`);
            }
        });
        
        // 기존 백업 버튼 이벤트 모두 제거
        const backupBtn = document.getElementById('backupBtn');
        if (backupBtn) {
            const newBtn = backupBtn.cloneNode(true);
            backupBtn.parentNode.replaceChild(newBtn, backupBtn);
            console.log('🔄 백업 버튼 이벤트 리셋');
        }
    }
    
    // 독립형 백업 모달 생성
    class StandaloneBackupModal {
        constructor() {
            this.modalId = 'standalone-backup-modal';
            this.isOpen = false;
            this.init();
        }
        
        init() {
            this.createStyles();
            this.createModal();
            this.setupButton();
            this.setupKeyboardShortcuts();
            console.log('✅ 독립형 백업 모달 초기화 완료');
        }
        
        createStyles() {
            const styleId = 'standalone-backup-styles';
            if (document.getElementById(styleId)) return;
            
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                /* 독립형 백업 모달 스타일 */
                #standalone-backup-modal {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    z-index: 2147483647; /* 최상위 */
                    isolation: isolate; /* 렌더링 독립성 보장 */
                }
                
                #standalone-backup-modal.active {
                    display: flex !important;
                    align-items: center;
                    justify-content: center;
                }
                
                .standalone-backdrop {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(4px);
                }
                
                .standalone-modal-container {
                    position: relative;
                    background: white;
                    border-radius: 16px;
                    width: 90%;
                    max-width: 650px;
                    max-height: 85vh;
                    overflow: hidden;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    display: flex;
                    flex-direction: column;
                    animation: slideUpFade 0.3s ease-out;
                }
                
                @keyframes slideUpFade {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .standalone-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                
                .standalone-title {
                    font-size: 24px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                
                .standalone-close {
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    color: white;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    font-size: 20px;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .standalone-close:hover {
                    background: rgba(255, 255, 255, 0.3);
                    transform: rotate(90deg);
                }
                
                .standalone-body {
                    padding: 30px;
                    overflow-y: auto;
                    flex: 1;
                }
                
                .backup-info-card {
                    background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
                    border: 2px solid #667eea30;
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 25px;
                }
                
                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 15px;
                }
                
                .info-item {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }
                
                .info-label {
                    font-size: 13px;
                    color: #666;
                    font-weight: 500;
                }
                
                .info-value {
                    font-size: 18px;
                    color: #333;
                    font-weight: 600;
                }
                
                .action-buttons {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }
                
                .action-btn {
                    padding: 16px 24px;
                    border: none;
                    border-radius: 10px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    text-transform: none;
                    letter-spacing: 0.5px;
                }
                
                .btn-download {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }
                
                .btn-download:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
                }
                
                .btn-restore {
                    background: #f0f2f5;
                    color: #333;
                    border: 2px dashed #ccc;
                    position: relative;
                    overflow: hidden;
                }
                
                .btn-restore:hover {
                    background: #e8ebef;
                    border-color: #667eea;
                }
                
                .btn-clipboard {
                    background: linear-gradient(135deg, #00c9ff 0%, #92fe9d 100%);
                    color: white;
                }
                
                .btn-clipboard:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 30px rgba(0, 201, 255, 0.4);
                }
                
                .file-input {
                    display: none;
                }
                
                .footer-info {
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 1px solid #e0e0e0;
                    text-align: center;
                    color: #999;
                    font-size: 13px;
                }
                
                /* 모바일 최적화 */
                @media (max-width: 600px) {
                    .standalone-modal-container {
                        width: 95%;
                        max-height: 90vh;
                    }
                    
                    .standalone-header {
                        padding: 20px;
                    }
                    
                    .standalone-title {
                        font-size: 20px;
                    }
                    
                    .standalone-body {
                        padding: 20px;
                    }
                }
            `;
            
            document.head.appendChild(style);
        }
        
        createModal() {
            // 기존 모달 제거
            const existing = document.getElementById(this.modalId);
            if (existing) {
                existing.remove();
            }
            
            const modal = document.createElement('div');
            modal.id = this.modalId;
            modal.innerHTML = `
                <div class="standalone-backdrop"></div>
                <div class="standalone-modal-container">
                    <div class="standalone-header">
                        <div class="standalone-title">
                            <span>💾</span>
                            <span>백업 및 복원</span>
                        </div>
                        <button class="standalone-close" aria-label="닫기">✕</button>
                    </div>
                    <div class="standalone-body">
                        <div class="backup-info-card">
                            <div class="info-grid">
                                <div class="info-item">
                                    <div class="info-label">메모 개수</div>
                                    <div class="info-value" id="backup-memo-count">0개</div>
                                </div>
                                <div class="info-item">
                                    <div class="info-label">데이터 크기</div>
                                    <div class="info-value" id="backup-data-size">0KB</div>
                                </div>
                                <div class="info-item">
                                    <div class="info-label">백업 시간</div>
                                    <div class="info-value" id="backup-time">-</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="action-buttons">
                            <button class="action-btn btn-download" id="backup-download-btn">
                                <span>⬇️</span>
                                <span>백업 다운로드</span>
                            </button>
                            
                            <button class="action-btn btn-restore" id="backup-restore-btn">
                                <span>📂</span>
                                <span>백업 파일 복원</span>
                                <input type="file" class="file-input" id="restore-file-input" accept=".json">
                            </button>
                            
                            <button class="action-btn btn-clipboard" id="backup-clipboard-btn">
                                <span>📋</span>
                                <span>클립보드로 복사</span>
                            </button>
                        </div>
                        
                        <div class="footer-info">
                            백업 파일은 JSON 형식으로 저장되며, 언제든지 복원할 수 있습니다.
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // 이벤트 설정
            this.setupModalEvents();
        }
        
        setupModalEvents() {
            const modal = document.getElementById(this.modalId);
            if (!modal) return;
            
            // 닫기 버튼
            const closeBtn = modal.querySelector('.standalone-close');
            const backdrop = modal.querySelector('.standalone-backdrop');
            
            closeBtn.addEventListener('click', () => this.close());
            backdrop.addEventListener('click', () => this.close());
            
            // 다운로드 버튼
            const downloadBtn = modal.querySelector('#backup-download-btn');
            downloadBtn.addEventListener('click', () => this.downloadBackup());
            
            // 복원 버튼
            const restoreBtn = modal.querySelector('#backup-restore-btn');
            const fileInput = modal.querySelector('#restore-file-input');
            
            restoreBtn.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => this.handleRestore(e));
            
            // 클립보드 버튼
            const clipboardBtn = modal.querySelector('#backup-clipboard-btn');
            clipboardBtn.addEventListener('click', () => this.copyToClipboard());
        }
        
        setupButton() {
            const backupBtn = document.getElementById('backupBtn');
            if (!backupBtn) {
                console.warn('⚠️ 백업 버튼을 찾을 수 없습니다');
                return;
            }
            
            backupBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                console.log('🎯 독립형 백업 버튼 클릭');
                this.open();
            });
            
            console.log('✅ 독립형 백업 버튼 설정 완료');
        }
        
        setupKeyboardShortcuts() {
            document.addEventListener('keydown', (e) => {
                // ESC로 닫기
                if (e.key === 'Escape' && this.isOpen) {
                    this.close();
                }
                
                // Ctrl+Shift+B로 열기
                if (e.ctrlKey && e.shiftKey && e.key === 'B') {
                    e.preventDefault();
                    this.open();
                }
            });
        }
        
        open() {
            const modal = document.getElementById(this.modalId);
            if (!modal) return;
            
            // 정보 업데이트
            this.updateInfo();
            
            // 모달 표시
            modal.classList.add('active');
            this.isOpen = true;
            
            // body 스크롤 금지
            document.body.style.overflow = 'hidden';
            
            console.log('📂 독립형 백업 모달 열림');
        }
        
        close() {
            const modal = document.getElementById(this.modalId);
            if (!modal) return;
            
            modal.classList.remove('active');
            this.isOpen = false;
            
            // body 스크롤 복원
            document.body.style.overflow = '';
            
            console.log('📪 독립형 백업 모달 닫힘');
        }
        
        updateInfo() {
            try {
                const memos = JSON.parse(localStorage.getItem('memos') || '[]');
                const dataSize = Math.round(JSON.stringify(memos).length / 1024);
                const now = new Date().toLocaleString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                document.getElementById('backup-memo-count').textContent = `${memos.length}개`;
                document.getElementById('backup-data-size').textContent = `${dataSize}KB`;
                document.getElementById('backup-time').textContent = now;
            } catch (error) {
                console.error('정보 업데이트 오류:', error);
            }
        }
        
        downloadBackup() {
            try {
                const memos = JSON.parse(localStorage.getItem('memos') || '[]');
                const backup = {
                    version: '3.0',
                    exportDate: new Date().toISOString(),
                    memos: memos,
                    settings: {
                        theme: localStorage.getItem('theme') || 'light',
                        fontSize: localStorage.getItem('fontSize') || '16',
                        calendarSize: {
                            width: localStorage.getItem('calendarWidthScale') || '1',
                            height: localStorage.getItem('calendarHeightScale') || '1'
                        }
                    },
                    metadata: {
                        totalMemos: memos.length,
                        platform: navigator.platform,
                        userAgent: navigator.userAgent
                    }
                };
                
                const blob = new Blob([JSON.stringify(backup, null, 2)], {
                    type: 'application/json'
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `calendar-backup-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                this.showNotification('✅ 백업이 다운로드되었습니다!');
            } catch (error) {
                console.error('백업 다운로드 오류:', error);
                this.showNotification('❌ 백업 다운로드 실패', 'error');
            }
        }
        
        handleRestore(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    if (!data.memos || !Array.isArray(data.memos)) {
                        throw new Error('유효하지 않은 백업 파일입니다.');
                    }
                    
                    const message = `
                        백업 정보:
                        - 메모 개수: ${data.memos.length}개
                        - 백업 일시: ${data.exportDate ? new Date(data.exportDate).toLocaleString('ko-KR') : '알 수 없음'}
                        - 버전: ${data.version || '알 수 없음'}
                        
                        복원하시겠습니까? 현재 데이터는 모두 대체됩니다.
                    `;
                    
                    if (confirm(message)) {
                        // 메모 복원
                        localStorage.setItem('memos', JSON.stringify(data.memos));
                        
                        // 설정 복원
                        if (data.settings) {
                            if (data.settings.theme) {
                                localStorage.setItem('theme', data.settings.theme);
                            }
                            if (data.settings.fontSize) {
                                localStorage.setItem('fontSize', data.settings.fontSize);
                            }
                            if (data.settings.calendarSize) {
                                if (data.settings.calendarSize.width) {
                                    localStorage.setItem('calendarWidthScale', data.settings.calendarSize.width);
                                }
                                if (data.settings.calendarSize.height) {
                                    localStorage.setItem('calendarHeightScale', data.settings.calendarSize.height);
                                }
                            }
                        }
                        
                        this.showNotification('✅ 복원이 완료되었습니다! 페이지를 새로고침합니다.');
                        setTimeout(() => location.reload(), 1500);
                    }
                } catch (error) {
                    console.error('복원 오류:', error);
                    this.showNotification(`❌ 복원 실패: ${error.message}`, 'error');
                }
            };
            
            reader.readAsText(file);
            
            // 파일 입력 초기화
            event.target.value = '';
        }
        
        copyToClipboard() {
            try {
                const memos = JSON.parse(localStorage.getItem('memos') || '[]');
                const backup = {
                    version: '3.0',
                    exportDate: new Date().toISOString(),
                    memos: memos
                };
                
                const jsonString = JSON.stringify(backup, null, 2);
                
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(jsonString).then(() => {
                        this.showNotification('✅ 클립보드에 복사되었습니다!');
                    }).catch(() => {
                        this.fallbackCopyToClipboard(jsonString);
                    });
                } else {
                    this.fallbackCopyToClipboard(jsonString);
                }
            } catch (error) {
                console.error('클립보드 복사 오류:', error);
                this.showNotification('❌ 클립보드 복사 실패', 'error');
            }
        }
        
        fallbackCopyToClipboard(text) {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            
            try {
                const successful = document.execCommand('copy');
                if (successful) {
                    this.showNotification('✅ 클립보드에 복사되었습니다!');
                } else {
                    this.showNotification('❌ 클립보드 복사 실패', 'error');
                }
            } catch (error) {
                this.showNotification('❌ 클립보드 복사 실패', 'error');
            }
            
            document.body.removeChild(textarea);
        }
        
        showNotification(message, type = 'success') {
            // 기존 알림 제거
            const existing = document.getElementById('backup-notification');
            if (existing) {
                existing.remove();
            }
            
            const notification = document.createElement('div');
            notification.id = 'backup-notification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                padding: 16px 24px;
                background: ${type === 'success' ? '#4CAF50' : '#f44336'};
                color: white;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 500;
                z-index: 2147483648;
                animation: slideDown 0.3s ease-out;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            `;
            notification.textContent = message;
            
            // 애니메이션 스타일 추가
            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideDown {
                    from {
                        transform: translateX(-50%) translateY(-100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(-50%) translateY(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
            
            document.body.appendChild(notification);
            
            // 3초 후 자동 제거
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }
    }
    
    // 초기화
    function init() {
        console.log('🚀 독립형 백업 시스템 초기화');
        
        // 충돌 시스템 비활성화
        disableConflictingSystems();
        
        // 약간의 지연 후 독립형 시스템 생성
        setTimeout(() => {
            window.standaloneBackup = new StandaloneBackupModal();
            console.log('✅ 독립형 백업 모달 시스템 준비 완료');
            console.log('💡 사용법: 백업 버튼 클릭 또는 Ctrl+Shift+B');
        }, 100);
    }
    
    // DOM 로드 완료 후 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // 즉시 초기화
        init();
    }
    
})();