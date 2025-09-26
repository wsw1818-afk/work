// 통합 모달 매니저 - 모든 모달을 일관된 UI와 위치로 관리
(function() {
    'use strict';
    
    console.log('🎯 통합 모달 매니저 시작');
    
    // 모달 매니저 객체
    const UnifiedModalManager = {
        activeModal: null,
        
        // 모달 템플릿 생성
        createModal: function(id, title, content, width = 600, height = 500) {
            // 기존 모달 제거
            const existing = document.getElementById(id);
            if (existing) {
                existing.remove();
            }
            
            // 모달 컨테이너 생성
            const modal = document.createElement('div');
            modal.id = id;
            modal.className = 'unified-modal';
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-hidden', 'true');
            modal.setAttribute('aria-labelledby', `${id}-title`);
            
            // 모달 HTML 구조
            modal.innerHTML = `
                <div class="unified-modal-backdrop"></div>
                <div class="unified-modal-content" style="width: ${width}px; max-height: ${height}px;">
                    <div class="unified-modal-header">
                        <h2 id="${id}-title" class="unified-modal-title">${title}</h2>
                        <button class="unified-modal-close" aria-label="닫기">&times;</button>
                    </div>
                    <div class="unified-modal-body">
                        ${content}
                    </div>
                </div>
            `;
            
            // 이벤트 설정
            const backdrop = modal.querySelector('.unified-modal-backdrop');
            const closeBtn = modal.querySelector('.unified-modal-close');
            
            backdrop.addEventListener('click', () => this.close(id));
            closeBtn.addEventListener('click', () => this.close(id));
            
            // DOM에 추가
            document.body.appendChild(modal);
            
            return modal;
        },
        
        // 모달 열기
        open: function(modalId) {
            console.log(`📂 모달 열기: ${modalId}`);
            
            // 다른 모달 닫기
            if (this.activeModal) {
                this.close(this.activeModal);
            }
            
            const modal = document.getElementById(modalId);
            if (!modal) {
                console.error(`❌ 모달을 찾을 수 없음: ${modalId}`);
                return false;
            }
            
            // 달력 영역 찾기
            const calendarArea = this.findCalendarArea();
            const modalContent = modal.querySelector('.unified-modal-content');
            
            if (modalContent && calendarArea) {
                const rect = calendarArea.getBoundingClientRect();
                const modalWidth = parseInt(modalContent.style.width) || 600;
                const modalHeight = parseInt(modalContent.style.maxHeight) || 500;
                
                // 달력 중앙 위치 계산
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                // 모달 위치 설정
                const left = Math.max(20, centerX - modalWidth / 2);
                const top = Math.max(20, centerY - modalHeight / 2);
                
                modalContent.style.left = `${left}px`;
                modalContent.style.top = `${top}px`;
                
                console.log(`📍 모달 위치: ${left}, ${top} (달력 중앙: ${centerX}, ${centerY})`);
            }
            
            // 모달 표시
            modal.classList.add('unified-modal-open');
            modal.setAttribute('aria-hidden', 'false');
            document.body.classList.add('modal-open');
            
            this.activeModal = modalId;
            
            // 모달별 초기화 콜백 실행
            this.onModalOpen(modalId);
            
            return true;
        },
        
        // 모달 닫기
        close: function(modalId) {
            console.log(`📪 모달 닫기: ${modalId}`);
            
            const modal = document.getElementById(modalId || this.activeModal);
            if (!modal) return false;
            
            modal.classList.remove('unified-modal-open');
            modal.setAttribute('aria-hidden', 'true');
            
            if (this.activeModal === modalId || modalId === undefined) {
                this.activeModal = null;
                document.body.classList.remove('modal-open');
            }
            
            return true;
        },
        
        // 달력 영역 찾기
        findCalendarArea: function() {
            // 달력 컨테이너 찾기 우선순위
            const selectors = [
                '.calendar-container',
                '.calendar',
                '#calendar',
                'table', // 달력 테이블
                'main',
                '.content',
                'body'
            ];
            
            for (const selector of selectors) {
                const element = document.querySelector(selector);
                if (element) {
                    console.log(`📅 달력 영역 발견: ${selector}`);
                    return element;
                }
            }
            
            return document.body;
        },
        
        // 모달별 초기화 콜백
        onModalOpen: function(modalId) {
            switch(modalId) {
                case 'backupModal':
                    this.initBackupModal();
                    break;
                case 'settingsModal':
                    this.initSettingsModal();
                    break;
                case 'excelModal':
                    this.initExcelModal();
                    break;
                case 'storageModal':
                    this.initStorageModal();
                    break;
            }
        },
        
        // 백업 모달 초기화
        initBackupModal: function() {
            console.log('💾 백업 모달 초기화');
            try {
                const memos = JSON.parse(localStorage.getItem('memos') || '[]');
                const info = document.querySelector('#backupModal .backup-info');
                if (info) {
                    const size = Math.round(JSON.stringify(memos).length / 1024);
                    info.innerHTML = `
                        <div>📝 메모 개수: ${memos.length}개</div>
                        <div>💾 데이터 크기: ${size}KB</div>
                        <div>📅 백업 일시: ${new Date().toLocaleString('ko-KR')}</div>
                    `;
                }
            } catch (e) {
                console.error('백업 정보 로드 실패:', e);
            }
        },
        
        // 설정 모달 초기화
        initSettingsModal: function() {
            console.log('⚙️ 설정 모달 초기화');
            // 현재 설정 값 로드
            if (typeof loadCurrentSettingsToModal === 'function') {
                loadCurrentSettingsToModal();
            }
        },
        
        // 엑셀 모달 초기화
        initExcelModal: function() {
            console.log('📊 엑셀 모달 초기화');
            const today = new Date();
            const startInput = document.querySelector('#excelModal input[name="startDate"]');
            const endInput = document.querySelector('#excelModal input[name="endDate"]');
            
            if (startInput && endInput) {
                const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                
                startInput.value = firstDay.toISOString().split('T')[0];
                endInput.value = lastDay.toISOString().split('T')[0];
            }
        },
        
        // 저장소 모달 초기화
        initStorageModal: function() {
            console.log('💿 저장소 모달 초기화');
            // 저장소 정보 업데이트
            if (typeof updateStorageInfo === 'function') {
                updateStorageInfo();
            }
        }
    };
    
    // CSS 스타일 추가
    function addStyles() {
        const styleId = 'unified-modal-styles';
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            /* 통합 모달 스타일 */
            .unified-modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 999999;
            }
            
            .unified-modal.unified-modal-open {
                display: block;
            }
            
            .unified-modal-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(2px);
            }
            
            .unified-modal-content {
                position: fixed;
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                overflow: hidden;
                display: flex;
                flex-direction: column;
                animation: modalSlideIn 0.3s ease-out;
            }
            
            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .unified-modal-header {
                padding: 20px 24px;
                border-bottom: 1px solid #e0e0e0;
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: linear-gradient(to right, #f8f9fa, #ffffff);
            }
            
            .unified-modal-title {
                margin: 0;
                font-size: 20px;
                font-weight: 600;
                color: #333;
            }
            
            .unified-modal-close {
                background: none;
                border: none;
                font-size: 28px;
                color: #999;
                cursor: pointer;
                padding: 0;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
                transition: all 0.2s;
            }
            
            .unified-modal-close:hover {
                background: #f0f0f0;
                color: #333;
            }
            
            .unified-modal-body {
                padding: 24px;
                overflow-y: auto;
                flex: 1;
            }
            
            /* 버튼 스타일 */
            .unified-btn {
                padding: 10px 20px;
                border: none;
                border-radius: 6px;
                font-size: 15px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
                display: inline-flex;
                align-items: center;
                gap: 8px;
            }
            
            .unified-btn-primary {
                background: #4CAF50;
                color: white;
            }
            
            .unified-btn-primary:hover {
                background: #45a049;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
            }
            
            .unified-btn-secondary {
                background: #2196F3;
                color: white;
            }
            
            .unified-btn-secondary:hover {
                background: #1976D2;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
            }
            
            .unified-btn-danger {
                background: #f44336;
                color: white;
            }
            
            .unified-btn-danger:hover {
                background: #da190b;
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
            }
            
            /* 정보 박스 */
            .unified-info-box {
                background: #f5f5f5;
                border-left: 4px solid #4CAF50;
                padding: 16px;
                border-radius: 4px;
                margin-bottom: 20px;
            }
            
            .unified-info-box div {
                margin: 8px 0;
                color: #555;
            }
            
            /* 입력 필드 */
            .unified-input {
                width: 100%;
                padding: 10px 12px;
                border: 1px solid #ddd;
                border-radius: 6px;
                font-size: 14px;
                transition: all 0.2s;
            }
            
            .unified-input:focus {
                outline: none;
                border-color: #4CAF50;
                box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
            }
            
            /* 파일 업로드 영역 */
            .unified-upload-area {
                border: 2px dashed #ccc;
                border-radius: 8px;
                padding: 30px;
                text-align: center;
                background: #fafafa;
                transition: all 0.2s;
                cursor: pointer;
            }
            
            .unified-upload-area:hover {
                border-color: #4CAF50;
                background: #f0f8f0;
            }
            
            /* body 스크롤 제어 */
            body.modal-open {
                overflow: hidden;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    // 모달 생성 함수들
    function createModals() {
        // 백업 모달
        UnifiedModalManager.createModal(
            'backupModal',
            '💾 백업 및 복원',
            `
            <div class="backup-info unified-info-box"></div>
            <div style="display: flex; flex-direction: column; gap: 16px;">
                <button class="unified-btn unified-btn-primary" onclick="UnifiedModalManager.downloadBackup()">
                    💾 백업 다운로드
                </button>
                <div class="unified-upload-area" onclick="document.getElementById('restoreFileInput').click()">
                    <input type="file" id="restoreFileInput" accept=".json" style="display: none;" onchange="UnifiedModalManager.handleRestore(this)">
                    📂 복원 파일 선택<br>
                    <small style="color: #999;">클릭하여 백업 파일을 선택하세요</small>
                </div>
                <button class="unified-btn unified-btn-secondary" onclick="UnifiedModalManager.copyToClipboard()">
                    📋 클립보드로 복사
                </button>
            </div>
            `
        );
        
        // 설정 모달
        UnifiedModalManager.createModal(
            'settingsModal',
            '⚙️ 설정',
            `
            <div class="settings-content">
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">테마</label>
                    <select class="unified-input" id="themeSelect">
                        <option value="light">🌞 라이트 모드</option>
                        <option value="dark">🌙 다크 모드</option>
                    </select>
                </div>
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">글꼴 크기</label>
                    <input type="range" class="unified-input" id="fontSizeRange" min="12" max="20" value="16">
                    <span id="fontSizeValue">16px</span>
                </div>
                <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 30px;">
                    <button class="unified-btn unified-btn-primary" onclick="UnifiedModalManager.saveSettings()">
                        ✅ 저장
                    </button>
                    <button class="unified-btn" onclick="UnifiedModalManager.close('settingsModal')">
                        ❌ 취소
                    </button>
                </div>
            </div>
            `
        );
        
        // 엑셀 내보내기 모달
        UnifiedModalManager.createModal(
            'excelModal',
            '📊 엑셀 내보내기',
            `
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 500;">시작 날짜</label>
                <input type="date" class="unified-input" name="startDate">
            </div>
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 500;">종료 날짜</label>
                <input type="date" class="unified-input" name="endDate">
            </div>
            <div style="display: flex; gap: 10px; justify-content: center; margin-top: 30px;">
                <button class="unified-btn unified-btn-primary" onclick="UnifiedModalManager.exportToExcel()">
                    📥 다운로드
                </button>
                <button class="unified-btn" onclick="UnifiedModalManager.close('excelModal')">
                    ❌ 취소
                </button>
            </div>
            `,
            500,
            400
        );
        
        // 저장소 모달
        UnifiedModalManager.createModal(
            'storageModal',
            '💿 저장소 관리',
            `
            <div class="storage-info unified-info-box"></div>
            <div style="margin-top: 20px;">
                <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span>사용량</span>
                        <span id="storageUsed">0 MB</span>
                    </div>
                    <div style="width: 100%; height: 20px; background: #c8e6c9; border-radius: 10px; overflow: hidden;">
                        <div id="storageBar" style="height: 100%; background: #4CAF50; width: 0%; transition: width 0.3s;"></div>
                    </div>
                </div>
                <button class="unified-btn unified-btn-danger" onclick="UnifiedModalManager.clearStorage()">
                    🗑️ 저장소 비우기
                </button>
            </div>
            `,
            500,
            400
        );
    }
    
    // 백업 관련 기능들
    UnifiedModalManager.downloadBackup = function() {
        try {
            const memos = JSON.parse(localStorage.getItem('memos') || '[]');
            const backup = {
                memos: memos,
                settings: {
                    theme: localStorage.getItem('theme') || 'light',
                    fontSize: localStorage.getItem('fontSize') || '16'
                },
                exportDate: new Date().toISOString(),
                version: '2.0'
            };
            
            const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `calendar-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            alert('✅ 백업이 완료되었습니다!');
        } catch (e) {
            alert('❌ 백업 실패: ' + e.message);
        }
    };
    
    UnifiedModalManager.handleRestore = function(input) {
        const file = input.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                if (!data.memos) throw new Error('유효하지 않은 백업 파일');
                
                if (confirm(`${data.memos.length}개의 메모를 복원하시겠습니까?\n현재 데이터는 모두 삭제됩니다.`)) {
                    localStorage.setItem('memos', JSON.stringify(data.memos));
                    if (data.settings) {
                        if (data.settings.theme) localStorage.setItem('theme', data.settings.theme);
                        if (data.settings.fontSize) localStorage.setItem('fontSize', data.settings.fontSize);
                    }
                    alert('✅ 복원이 완료되었습니다!');
                    location.reload();
                }
            } catch (e) {
                alert('❌ 복원 실패: ' + e.message);
            }
        };
        reader.readAsText(file);
    };
    
    UnifiedModalManager.copyToClipboard = function() {
        try {
            const memos = JSON.parse(localStorage.getItem('memos') || '[]');
            const backup = {
                memos: memos,
                exportDate: new Date().toISOString()
            };
            
            navigator.clipboard.writeText(JSON.stringify(backup, null, 2)).then(() => {
                alert('✅ 클립보드에 복사되었습니다!');
            }).catch(() => {
                alert('❌ 복사 실패');
            });
        } catch (e) {
            alert('❌ 복사 실패: ' + e.message);
        }
    };
    
    // 설정 저장
    UnifiedModalManager.saveSettings = function() {
        const theme = document.getElementById('themeSelect').value;
        const fontSize = document.getElementById('fontSizeRange').value;
        
        localStorage.setItem('theme', theme);
        localStorage.setItem('fontSize', fontSize);
        document.documentElement.setAttribute('data-theme', theme);
        
        alert('✅ 설정이 저장되었습니다!');
        this.close('settingsModal');
    };
    
    // 엑셀 내보내기
    UnifiedModalManager.exportToExcel = function() {
        const startDate = document.querySelector('#excelModal input[name="startDate"]').value;
        const endDate = document.querySelector('#excelModal input[name="endDate"]').value;
        
        if (!startDate || !endDate) {
            alert('날짜를 선택해주세요');
            return;
        }
        
        // 실제 엑셀 내보내기 로직 호출
        if (typeof exportToExcel === 'function') {
            exportToExcel(startDate, endDate);
        }
        
        this.close('excelModal');
    };
    
    // 저장소 비우기
    UnifiedModalManager.clearStorage = function() {
        if (confirm('정말로 모든 데이터를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
            localStorage.clear();
            alert('✅ 저장소가 비워졌습니다.');
            location.reload();
        }
    };
    
    // 메뉴 버튼 설정
    function setupMenuButtons() {
        const buttons = {
            'backupBtn': 'backupModal',
            'settingsBtn': 'settingsModal',
            'excelBtn': 'excelModal',
            'storageBtn': 'storageModal'
        };
        
        Object.entries(buttons).forEach(([btnId, modalId]) => {
            const btn = document.getElementById(btnId);
            if (btn) {
                // 기존 이벤트 제거
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);
                
                // 새 이벤트 추가
                newBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`🎯 ${btnId} 클릭 → ${modalId} 열기`);
                    UnifiedModalManager.open(modalId);
                });
            }
        });
    }
    
    // ESC 키로 모달 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && UnifiedModalManager.activeModal) {
            UnifiedModalManager.close();
        }
    });
    
    // 초기화
    function init() {
        console.log('🚀 통합 모달 매니저 초기화');
        
        addStyles();
        createModals();
        setupMenuButtons();
        
        // 전역 객체로 노출
        window.UnifiedModalManager = UnifiedModalManager;
        
        console.log('✅ 통합 모달 매니저 준비 완료');
    }
    
    // DOM 로드 시 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();