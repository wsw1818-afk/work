// 백업 모달 완전 재정의 시스템
(function() {
    'use strict';
    
    console.log('🔒 백업 모달 재정의 시스템 시작');
    
    // 기존 백업 관련 시스템 완전 제거
    function removeAllBackupSystems() {
        console.log('🗑️ 모든 기존 백업 시스템 제거 시작');
        
        // 1. 기존 모달들 제거
        const modalIds = [
            'backupModal', 
            'backupModalBackdrop',
            'backup-modal',
            'portable-backup-modal',
            'standalone-backup-modal'
        ];
        
        modalIds.forEach(id => {
            const elements = document.querySelectorAll(`#${id}, [id*="${id}"]`);
            elements.forEach(el => {
                el.remove();
                console.log(`  ✅ 제거: ${id}`);
            });
        });
        
        // 2. 클래스 기반 모달 제거
        document.querySelectorAll('.backup-modal, .backup-modal-content').forEach(el => {
            el.remove();
        });
        
        // 3. window 객체의 백업 함수들 제거
        const backupFunctions = [
            'openBackupModal',
            'closeBackupModal', 
            'downloadBackupData',
            'handleRestoreFile',
            'exportToClipboard',
            'StandaloneBackupModal',
            'portableBackupSystem'
        ];
        
        backupFunctions.forEach(func => {
            if (window[func]) {
                delete window[func];
                console.log(`  ✅ 함수 제거: window.${func}`);
            }
        });
        
        console.log('✅ 기존 백업 시스템 제거 완료');
    }
    
    // menu-click-guarantee.js의 백업 핸들러 무효화
    function disableMenuClickBackup() {
        console.log('🔐 menu-click-guarantee 백업 핸들러 무효화');
        
        // menuClickSystem 객체 재정의
        if (window.menuClickSystem && window.menuClickSystem.handlers) {
            // 백업 버튼 핸들러를 새로운 것으로 대체
            window.menuClickSystem.handlers.backupBtn = function(event) {
                console.log('🎯 백업 버튼 클릭 - 재정의된 핸들러');
                if (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                }
                // 새로운 백업 모달 열기
                window.BackupModalOverride.open();
                return false;
            };
            console.log('✅ menuClickSystem.handlers.backupBtn 재정의 완료');
        }
    }
    
    // 새로운 백업 모달 시스템
    class BackupModalOverride {
        constructor() {
            this.modalId = 'backup-modal-override';
            this.isOpen = false;
            this.init();
        }
        
        init() {
            console.log('🚀 BackupModalOverride 초기화');
            this.createModal();
            this.setupEventListeners();
        }
        
        createModal() {
            // 기존 모달 제거
            const existing = document.getElementById(this.modalId);
            if (existing) existing.remove();
            
            // 새 모달 생성
            const modal = document.createElement('div');
            modal.id = this.modalId;
            modal.className = 'backup-modal-override';
            modal.innerHTML = `
                <div class="backup-modal-backdrop"></div>
                <div class="backup-modal-container">
                    <div class="backup-modal-header">
                        <h2>📦 백업 및 복원</h2>
                        <button class="backup-modal-close">✕</button>
                    </div>
                    <div class="backup-modal-body">
                        <div class="backup-info-section">
                            <h3>📊 현재 데이터 정보</h3>
                            <div id="backup-data-info">
                                <p>계산 중...</p>
                            </div>
                        </div>
                        
                        <div class="backup-actions">
                            <button class="backup-action-btn download-btn">
                                <span class="icon">💾</span>
                                <span class="text">백업 다운로드</span>
                            </button>
                            
                            <label class="backup-action-btn restore-btn">
                                <span class="icon">📂</span>
                                <span class="text">복원 파일 선택</span>
                                <input type="file" accept=".json" style="display: none;" id="restore-file-input">
                            </label>
                            
                            <button class="backup-action-btn clipboard-btn">
                                <span class="icon">📋</span>
                                <span class="text">클립보드 복사</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            // 스타일 추가
            const style = document.createElement('style');
            style.textContent = `
                #${this.modalId} {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 2147483647;
                }
                
                #${this.modalId}.active {
                    display: block !important;
                }
                
                .backup-modal-backdrop {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(5px);
                    animation: fadeIn 0.3s ease;
                }
                
                .backup-modal-container {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 3px;
                    border-radius: 16px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    animation: slideUp 0.3s ease;
                    width: 90%;
                    max-width: 500px;
                }
                
                .backup-modal-container::before {
                    content: '';
                    position: absolute;
                    top: -3px;
                    left: -3px;
                    right: -3px;
                    bottom: -3px;
                    background: linear-gradient(45deg, #ff0080, #ff8c00, #40e0d0);
                    border-radius: 16px;
                    opacity: 0.6;
                    z-index: -1;
                    animation: gradient-rotate 3s ease infinite;
                }
                
                .backup-modal-header {
                    background: white;
                    padding: 20px;
                    border-radius: 13px 13px 0 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 2px solid #f0f0f0;
                }
                
                .backup-modal-header h2 {
                    margin: 0;
                    font-size: 24px;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    font-weight: bold;
                }
                
                .backup-modal-close {
                    background: none;
                    border: none;
                    font-size: 28px;
                    cursor: pointer;
                    color: #999;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                }
                
                .backup-modal-close:hover {
                    background: #f5f5f5;
                    color: #333;
                    transform: rotate(90deg);
                }
                
                .backup-modal-body {
                    background: white;
                    padding: 30px;
                    border-radius: 0 0 13px 13px;
                }
                
                .backup-info-section {
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                    padding: 20px;
                    border-radius: 12px;
                    margin-bottom: 25px;
                }
                
                .backup-info-section h3 {
                    margin: 0 0 15px 0;
                    color: #333;
                    font-size: 18px;
                }
                
                #backup-data-info {
                    font-size: 14px;
                    color: #666;
                }
                
                #backup-data-info p {
                    margin: 5px 0;
                    padding: 5px 0;
                }
                
                .backup-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                
                .backup-action-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    padding: 16px 24px;
                    border: none;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }
                
                .backup-action-btn::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                    transition: left 0.6s ease;
                }
                
                .backup-action-btn:hover::before {
                    left: 100%;
                }
                
                .download-btn {
                    background: linear-gradient(135deg, #4CAF50, #45a049);
                    color: white;
                }
                
                .download-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
                }
                
                .restore-btn {
                    background: linear-gradient(135deg, #2196F3, #1976D2);
                    color: white;
                }
                
                .restore-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(33, 150, 243, 0.4);
                }
                
                .clipboard-btn {
                    background: linear-gradient(135deg, #FF9800, #F57C00);
                    color: white;
                }
                
                .clipboard-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(255, 152, 0, 0.4);
                }
                
                .backup-action-btn .icon {
                    font-size: 24px;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideUp {
                    from {
                        transform: translate(-50%, -40%);
                        opacity: 0;
                    }
                    to {
                        transform: translate(-50%, -50%);
                        opacity: 1;
                    }
                }
                
                @keyframes gradient-rotate {
                    0% { filter: hue-rotate(0deg); }
                    100% { filter: hue-rotate(360deg); }
                }
            `;
            
            document.head.appendChild(style);
            document.body.appendChild(modal);
            
            this.modal = modal;
            this.updateDataInfo();
        }
        
        updateDataInfo() {
            const infoDiv = document.getElementById('backup-data-info');
            if (infoDiv) {
                try {
                    const memos = JSON.parse(localStorage.getItem('memos') || '[]');
                    const dataSize = Math.round(JSON.stringify(memos).length / 1024);
                    const today = new Date().toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                    
                    infoDiv.innerHTML = `
                        <p>📝 메모 개수: <strong>${memos.length}개</strong></p>
                        <p>💾 데이터 크기: <strong>${dataSize}KB</strong></p>
                        <p>📅 백업 날짜: <strong>${today}</strong></p>
                        <p>🔒 암호화: <strong>비활성화</strong></p>
                    `;
                } catch (error) {
                    console.error('데이터 정보 업데이트 실패:', error);
                    infoDiv.innerHTML = '<p>데이터를 불러올 수 없습니다.</p>';
                }
            }
        }
        
        setupEventListeners() {
            // 닫기 버튼
            this.modal.querySelector('.backup-modal-close').addEventListener('click', () => {
                this.close();
            });
            
            // 배경 클릭
            this.modal.querySelector('.backup-modal-backdrop').addEventListener('click', () => {
                this.close();
            });
            
            // 다운로드 버튼
            this.modal.querySelector('.download-btn').addEventListener('click', () => {
                this.downloadBackup();
            });
            
            // 복원 파일 선택
            this.modal.querySelector('#restore-file-input').addEventListener('change', (e) => {
                this.handleRestore(e.target.files[0]);
            });
            
            // 클립보드 복사
            this.modal.querySelector('.clipboard-btn').addEventListener('click', () => {
                this.copyToClipboard();
            });
            
            // ESC 키로 닫기
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.close();
                }
            });
        }
        
        open() {
            console.log('🎯 BackupModalOverride 열기');
            
            // 모든 다른 모달 닫기
            document.querySelectorAll('.modal, .unified-modal').forEach(m => {
                m.style.display = 'none';
            });
            
            // 달력 요일 헤더 영역 찾기
            const weekdayHeaders = document.querySelectorAll('th, .weekday, .day-header');
            let weekdayArea = null;
            
            // 요일 헤더가 포함된 테이블 또는 컨테이너 찾기
            for (const header of weekdayHeaders) {
                const text = header.textContent.trim();
                if (['일', '월', '화', '수', '목', '금', '토', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].includes(text)) {
                    weekdayArea = header.closest('table, .calendar-header, .week-header') || header.parentElement;
                    console.log('📅 요일 영역 발견:', weekdayArea);
                    break;
                }
            }
            
            // 요일 영역을 찾지 못한 경우 달력 테이블 찾기
            if (!weekdayArea) {
                weekdayArea = document.querySelector('table') || document.querySelector('.calendar');
                console.log('📅 대체 달력 영역 사용:', weekdayArea);
            }
            
            if (weekdayArea) {
                const rect = weekdayArea.getBoundingClientRect();
                const container = this.modal.querySelector('.backup-modal-container');
                
                // 요일 영역 위쪽에 모달 위치시키기
                const modalWidth = 500;
                const modalHeight = 400;
                const leftPos = Math.max(10, rect.left + (rect.width - modalWidth) / 2);
                const topPos = Math.max(10, rect.top - modalHeight - 20); // 요일 영역 위쪽
                
                console.log(`📍 모달 위치: left=${leftPos}px, top=${topPos}px`);
                console.log(`📐 요일 영역: x=${rect.left}, y=${rect.top}, width=${rect.width}, height=${rect.height}`);
                
                // 모달 컨테이너 직접 위치 설정
                if (container) {
                    container.style.cssText = `
                        position: fixed !important;
                        left: ${leftPos}px !important;
                        top: ${topPos}px !important;
                        width: ${modalWidth}px !important;
                        max-height: ${modalHeight}px !important;
                        transform: none !important;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        padding: 3px;
                        border-radius: 16px;
                        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                        animation: slideUp 0.3s ease;
                        z-index: 1000001 !important;
                    `;
                }
            }
            
            this.modal.classList.add('active');
            this.isOpen = true;
            this.updateDataInfo();
            
            // body 스크롤 방지
            document.body.style.overflow = 'hidden';
        }
        
        close() {
            console.log('🎯 BackupModalOverride 닫기');
            this.modal.classList.remove('active');
            this.isOpen = false;
            
            // body 스크롤 복원
            document.body.style.overflow = '';
        }
        
        downloadBackup() {
            try {
                const backupData = {
                    version: '2.0',
                    timestamp: new Date().toISOString(),
                    memos: JSON.parse(localStorage.getItem('memos') || '[]'),
                    settings: {
                        theme: localStorage.getItem('theme') || 'light',
                        fontSize: localStorage.getItem('fontSize') || '16',
                        calendarSize: {
                            width: localStorage.getItem('calendarWidthScale') || '1',
                            height: localStorage.getItem('calendarHeightScale') || '1'
                        }
                    }
                };
                
                const blob = new Blob([JSON.stringify(backupData, null, 2)], {
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
                
                alert('✅ 백업이 다운로드되었습니다!');
            } catch (error) {
                console.error('백업 다운로드 실패:', error);
                alert('❌ 백업 다운로드에 실패했습니다.');
            }
        }
        
        handleRestore(file) {
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    if (!data.memos || !Array.isArray(data.memos)) {
                        throw new Error('유효하지 않은 백업 파일입니다.');
                    }
                    
                    if (confirm(`${data.memos.length}개의 메모를 복원하시겠습니까?\n\n⚠️ 현재 데이터가 모두 대체됩니다!`)) {
                        // 데이터 복원
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
                        
                        alert('✅ 복원이 완료되었습니다! 페이지를 새로고침합니다.');
                        location.reload();
                    }
                } catch (error) {
                    console.error('복원 실패:', error);
                    alert('❌ 복원에 실패했습니다: ' + error.message);
                }
            };
            
            reader.readAsText(file);
        }
        
        copyToClipboard() {
            try {
                const backupData = {
                    version: '2.0',
                    timestamp: new Date().toISOString(),
                    memos: JSON.parse(localStorage.getItem('memos') || '[]')
                };
                
                const jsonString = JSON.stringify(backupData, null, 2);
                
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(jsonString).then(() => {
                        alert('✅ 클립보드에 복사되었습니다!');
                    }).catch(() => {
                        this.fallbackCopyToClipboard(jsonString);
                    });
                } else {
                    this.fallbackCopyToClipboard(jsonString);
                }
            } catch (error) {
                console.error('클립보드 복사 실패:', error);
                alert('❌ 클립보드 복사에 실패했습니다.');
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
                document.execCommand('copy');
                alert('✅ 클립보드에 복사되었습니다!');
            } catch (error) {
                alert('❌ 클립보드 복사에 실패했습니다.');
            }
            
            document.body.removeChild(textarea);
        }
    }
    
    // 백업 버튼 재설정
    function overrideBackupButton() {
        console.log('🔨 백업 버튼 재설정');
        
        const backupBtn = document.getElementById('backupBtn');
        if (backupBtn) {
            // 기존 이벤트 리스너 제거
            const newBtn = backupBtn.cloneNode(true);
            backupBtn.parentNode.replaceChild(newBtn, backupBtn);
            
            // 새 이벤트 리스너 추가
            newBtn.addEventListener('click', function(e) {
                console.log('🎯 백업 버튼 클릭 - 재정의된 핸들러');
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                if (window.BackupModalOverride) {
                    window.BackupModalOverride.open();
                }
                
                return false;
            }, true); // capture phase에서 처리
            
            // 스타일 강화
            newBtn.style.cssText += `
                pointer-events: auto !important;
                cursor: pointer !important;
                z-index: 10000 !important;
            `;
            
            console.log('✅ 백업 버튼 재설정 완료');
        }
    }
    
    // 초기화 함수
    function initialize() {
        console.log('🚀 백업 모달 재정의 시스템 초기화');
        
        // 1. 기존 시스템 제거
        removeAllBackupSystems();
        
        // 2. menu-click-guarantee 무효화
        setTimeout(() => {
            disableMenuClickBackup();
        }, 100);
        
        // 3. 새 백업 모달 생성
        window.BackupModalOverride = new BackupModalOverride();
        
        // 4. 백업 버튼 재설정
        setTimeout(() => {
            overrideBackupButton();
        }, 200);
        
        // 5. 주기적으로 재설정 (다른 스크립트가 덮어쓸 수 있으므로)
        setInterval(() => {
            disableMenuClickBackup();
            overrideBackupButton();
        }, 1000);
        
        console.log('✅ 백업 모달 재정의 시스템 초기화 완료');
    }
    
    // DOM 로드 시 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
    // 페이지 완전 로드 후 재초기화
    window.addEventListener('load', function() {
        setTimeout(initialize, 500);
    });
    
    console.log('✅ 백업 모달 재정의 스크립트 로드 완료');
    
})();