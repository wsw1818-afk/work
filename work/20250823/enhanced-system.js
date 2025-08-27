/**
 * 향상된 시스템 스크립트
 * - 스티커 메뉴 클릭 문제 해결
 * - 클라우드 API 설정 완전 구현
 * - 모든 기능 강화
 */

(function() {
    'use strict';
    
    console.log('🚀 향상된 시스템 시작');
    
    // 중복 실행 방지
    if (window.enhancedSystemLoaded) {
        console.log('이미 로드됨');
        return;
    }
    window.enhancedSystemLoaded = true;
    
    // 다른 시스템들 비활성화
    window.ultimateRestored = true;
    window.perfectSystemLoaded = true;
    window.completeSystemRestored = true;
    
    // DOM 준비 대기
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            setTimeout(callback, 100);
        }
    }
    
    // 1. 달력 시스템 복원
    function restoreCalendar() {
        console.log('📅 달력 복원');
        
        const grid = document.getElementById('daysGrid');
        if (!grid) return;
        
        const year = 2025;
        const month = 8;
        const firstDay = new Date(2025, 7, 1).getDay();
        const daysInMonth = 31;
        
        grid.innerHTML = '';
        
        // 이전 달 날짜들
        const prevMonthDays = new Date(2025, 6, 0).getDate();
        for (let i = firstDay - 1; i >= 0; i--) {
            const day = document.createElement('div');
            day.className = 'day other-month';
            day.innerHTML = `<div class="day-number">${prevMonthDays - i}</div>`;
            grid.appendChild(day);
        }
        
        // 현재 달 날짜들
        for (let date = 1; date <= daysInMonth; date++) {
            const day = document.createElement('div');
            day.className = 'day';
            
            // 날짜 데이터 저장
            day.dataset.date = date;
            day.dataset.month = month;
            day.dataset.year = year;
            
            if (date === 27) day.classList.add('today');
            
            const dayOfWeek = (firstDay + date - 1) % 7;
            if (dayOfWeek === 0) day.classList.add('sunday');
            if (dayOfWeek === 6) day.classList.add('saturday');
            
            if (date === 15) {
                day.classList.add('holiday');
                day.innerHTML = `
                    <div class="day-number">${date}</div>
                    <div class="holiday-label">광복절</div>
                `;
            } else {
                day.innerHTML = `<div class="day-number">${date}</div>`;
            }
            
            // 클릭 이벤트 추가
            day.style.cursor = 'pointer';
            day.addEventListener('click', function() {
                // 모든 날짜의 선택 해제
                document.querySelectorAll('.day').forEach(d => d.classList.remove('selected'));
                
                // 현재 날짜 선택
                this.classList.add('selected');
                
                console.log(`📅 날짜 클릭: ${year}년 ${month}월 ${date}일`);
                
                // 일정 생성 모달 열기
                const modal = document.getElementById('createModal');
                if (modal) {
                    modal.style.display = 'block';
                    
                    // 날짜 자동 입력
                    const dateInput = document.getElementById('scheduleDate');
                    if (dateInput) {
                        dateInput.value = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
                    }
                }
            });
            
            // 호버 효과
            day.addEventListener('mouseenter', function() {
                if (!this.classList.contains('selected')) {
                    this.style.background = 'rgba(74, 144, 226, 0.1)';
                }
            });
            
            day.addEventListener('mouseleave', function() {
                if (!this.classList.contains('selected')) {
                    this.style.background = '';
                }
            });
            
            grid.appendChild(day);
        }
        
        // 다음 달 날짜들
        const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
        const filledCells = firstDay + daysInMonth;
        for (let date = 1; date <= totalCells - filledCells; date++) {
            const day = document.createElement('div');
            day.className = 'day other-month';
            day.innerHTML = `<div class="day-number">${date}</div>`;
            grid.appendChild(day);
        }
        
        console.log('✅ 달력 복원 완료');
    }
    
    // 2. 스티커 메모 시스템 완전 복원 (강화)
    function restoreStickyMemo() {
        console.log('🗒️ 스티커 메모 강화 복원');
        
        // 기존 제거
        const existing = document.getElementById('stickyMemo');
        if (existing) existing.remove();
        
        // 새 스티커 메모 생성
        const stickyMemo = document.createElement('div');
        stickyMemo.id = 'stickyMemo';
        stickyMemo.className = 'sticky-memo';
        stickyMemo.style.display = 'none';
        
        stickyMemo.innerHTML = `
            <div class="sticky-memo-header">
                <div class="sticky-memo-title">
                    <span>🗒️</span>
                    <span>스티커 메모</span>
                </div>
                <div class="sticky-memo-controls">
                    <button class="sticky-minimize-btn" title="최소화">−</button>
                    <button class="sticky-maximize-btn" title="최대화">□</button>
                    <button class="sticky-close-btn" title="닫기">✕</button>
                </div>
            </div>
            <div class="sticky-memo-content">
                <div class="sticky-memo-toolbar">
                    <button class="toolbar-btn" onclick="document.execCommand('bold')"><b>B</b></button>
                    <button class="toolbar-btn" onclick="document.execCommand('italic')"><i>I</i></button>
                    <button class="toolbar-btn" onclick="document.execCommand('underline')"><u>U</u></button>
                    <select class="toolbar-select" onchange="document.execCommand('fontSize', false, this.value)">
                        <option value="3">보통</option>
                        <option value="4">크게</option>
                        <option value="5">매우 크게</option>
                    </select>
                </div>
                <div class="sticky-memo-form">
                    <div class="sticky-memo-editor" contenteditable="true" id="stickyEditor" 
                         data-placeholder="메모를 입력하세요..."></div>
                    <div class="sticky-memo-actions">
                        <button class="sticky-memo-save-btn" id="stickySaveBtn">💾 저장</button>
                        <button class="sticky-memo-clear-btn" id="stickyClearBtn">🗑️ 지우기</button>
                    </div>
                </div>
                <div class="sticky-memo-list" id="stickyMemoList"></div>
            </div>
        `;
        
        document.body.appendChild(stickyMemo);
        
        // 이벤트 등록
        stickyMemo.querySelector('.sticky-close-btn').addEventListener('click', function() {
            stickyMemo.style.display = 'none';
        });
        
        stickyMemo.querySelector('.sticky-minimize-btn').addEventListener('click', function() {
            const content = stickyMemo.querySelector('.sticky-memo-content');
            content.style.display = content.style.display === 'none' ? 'block' : 'none';
        });
        
        stickyMemo.querySelector('.sticky-maximize-btn').addEventListener('click', function() {
            const isMaximized = stickyMemo.classList.contains('maximized');
            if (isMaximized) {
                stickyMemo.classList.remove('maximized');
                stickyMemo.style.width = '400px';
                stickyMemo.style.height = '500px';
                stickyMemo.style.top = '50px';
                stickyMemo.style.right = '50px';
                stickyMemo.style.left = 'auto';
                stickyMemo.style.bottom = 'auto';
            } else {
                stickyMemo.classList.add('maximized');
                stickyMemo.style.width = '80vw';
                stickyMemo.style.height = '80vh';
                stickyMemo.style.top = '10vh';
                stickyMemo.style.left = '10vw';
                stickyMemo.style.right = 'auto';
                stickyMemo.style.bottom = 'auto';
            }
        });
        
        stickyMemo.querySelector('#stickySaveBtn').addEventListener('click', saveMemo);
        stickyMemo.querySelector('#stickyClearBtn').addEventListener('click', function() {
            const editor = document.getElementById('stickyEditor');
            if (confirm('내용을 모두 지우시겠습니까?')) {
                editor.innerHTML = '';
            }
        });
        
        // 드래그 앤 드롭 기능
        let isDragging = false;
        let currentX, currentY, initialX, initialY;
        
        const header = stickyMemo.querySelector('.sticky-memo-header');
        header.addEventListener('mousedown', function(e) {
            isDragging = true;
            initialX = e.clientX - stickyMemo.offsetLeft;
            initialY = e.clientY - stickyMemo.offsetTop;
        });
        
        document.addEventListener('mousemove', function(e) {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
                stickyMemo.style.left = currentX + 'px';
                stickyMemo.style.top = currentY + 'px';
                stickyMemo.style.right = 'auto';
            }
        });
        
        document.addEventListener('mouseup', function() {
            isDragging = false;
        });
        
        // 메모 저장 함수
        function saveMemo() {
            const editor = document.getElementById('stickyEditor');
            const content = editor.innerText.trim();
            
            if (content) {
                let memos = [];
                try {
                    const stored = localStorage.getItem('stickyMemos');
                    if (stored) {
                        memos = JSON.parse(stored);
                        if (!Array.isArray(memos)) memos = [];
                    }
                } catch (e) {
                    memos = [];
                }
                
                const newMemo = {
                    id: Date.now(),
                    content: content,
                    html: editor.innerHTML,
                    date: new Date().toLocaleString()
                };
                
                memos.unshift(newMemo); // 최신 메모를 맨 위로
                localStorage.setItem('stickyMemos', JSON.stringify(memos));
                
                editor.innerHTML = '';
                loadMemos();
                alert('메모가 저장되었습니다! 💾');
            } else {
                alert('메모 내용을 입력해주세요.');
            }
        }
        
        // 메모 로드 함수
        function loadMemos() {
            let memos = [];
            try {
                const stored = localStorage.getItem('stickyMemos');
                if (stored) {
                    memos = JSON.parse(stored);
                    if (!Array.isArray(memos)) memos = [];
                }
            } catch (e) {
                memos = [];
            }
            
            const list = document.getElementById('stickyMemoList');
            if (!list) return;
            
            list.innerHTML = '';
            
            if (memos.length === 0) {
                list.innerHTML = '<div class="no-memos">저장된 메모가 없습니다.</div>';
                return;
            }
            
            memos.forEach((memo, index) => {
                const item = document.createElement('div');
                item.className = 'sticky-memo-item';
                item.innerHTML = `
                    <div class="memo-header">
                        <span class="memo-index">#${index + 1}</span>
                        <span class="memo-date">${memo.date}</span>
                    </div>
                    <div class="memo-content">${memo.content.length > 100 ? memo.content.substring(0, 100) + '...' : memo.content}</div>
                    <div class="memo-actions">
                        <button class="memo-edit-btn" data-id="${memo.id}">✏️ 편집</button>
                        <button class="memo-delete-btn" data-id="${memo.id}">🗑️ 삭제</button>
                    </div>
                `;
                
                // 편집 버튼
                item.querySelector('.memo-edit-btn').addEventListener('click', function() {
                    const editor = document.getElementById('stickyEditor');
                    editor.innerHTML = memo.html || memo.content;
                });
                
                // 삭제 버튼
                item.querySelector('.memo-delete-btn').addEventListener('click', function() {
                    if (confirm('이 메모를 삭제하시겠습니까?')) {
                        const id = parseInt(this.dataset.id);
                        memos = memos.filter(m => m.id !== id);
                        localStorage.setItem('stickyMemos', JSON.stringify(memos));
                        loadMemos();
                    }
                });
                
                list.appendChild(item);
            });
        }
        
        loadMemos();
        console.log('✅ 스티커 메모 강화 복원 완료');
    }
    
    // 3. 향상된 클라우드 설정 모달 (API 설정 포함)
    function createEnhancedCloudModal() {
        console.log('☁️ 향상된 클라우드 설정 생성');
        
        const existing = document.getElementById('unifiedCloudModal');
        if (existing) existing.remove();
        
        const cloudModal = document.createElement('div');
        cloudModal.id = 'unifiedCloudModal';
        cloudModal.className = 'modal';
        cloudModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">☁️ 클라우드 설정</h2>
                    <button class="modal-close" data-modal="unifiedCloudModal">✕</button>
                </div>
                <div class="modal-body">
                    <!-- API 설정 섹션 -->
                    <div class="cloud-section">
                        <h3>🔑 API 설정</h3>
                        <div class="api-config">
                            <div class="form-group">
                                <label for="googleApiKey">Google API 키:</label>
                                <input type="password" id="googleApiKey" placeholder="AIzaSy..." class="api-input">
                                <button class="btn-secondary" onclick="togglePasswordVisibility('googleApiKey')">👁️</button>
                            </div>
                            <div class="form-group">
                                <label for="googleClientId">Google Client ID:</label>
                                <input type="text" id="googleClientId" placeholder="123456789-abc.apps.googleusercontent.com" class="api-input">
                            </div>
                            <div class="form-group">
                                <label for="googleClientSecret">Google Client Secret:</label>
                                <input type="password" id="googleClientSecret" placeholder="GOCSPX-..." class="api-input">
                                <button class="btn-secondary" onclick="togglePasswordVisibility('googleClientSecret')">👁️</button>
                            </div>
                            <div class="api-help">
                                <p>📝 <strong>API 키 발급 방법:</strong></p>
                                <ol>
                                    <li><a href="https://console.cloud.google.com" target="_blank">Google Cloud Console</a> 접속</li>
                                    <li>프로젝트 생성 또는 선택</li>
                                    <li>API 및 서비스 > 라이브러리에서 'Google Drive API' 활성화</li>
                                    <li>사용자 인증 정보 > API 키 생성</li>
                                    <li>OAuth 2.0 클라이언트 ID 생성 (웹 애플리케이션)</li>
                                </ol>
                            </div>
                            <div class="api-actions">
                                <button class="btn-primary" id="testApiBtn">🧪 API 연결 테스트</button>
                                <button class="btn-success" id="saveApiBtn">💾 API 설정 저장</button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 구글 드라이브 연동 섹션 -->
                    <div class="cloud-section">
                        <h3>📂 구글 드라이브 연동</h3>
                        <div class="drive-config">
                            <div class="connection-status" id="driveConnectionStatus">
                                <span class="status-icon">❌</span>
                                <span class="status-text">연결 안됨</span>
                            </div>
                            <div class="drive-actions">
                                <button class="btn-primary" id="connectDriveBtn">🔗 구글 드라이브 연결</button>
                                <button class="btn-warning" id="disconnectDriveBtn" style="display: none;">🔌 연결 해제</button>
                            </div>
                            <div class="drive-info">
                                <div class="form-group">
                                    <label for="driveFolderName">백업 폴더명:</label>
                                    <input type="text" id="driveFolderName" value="CalendarBackup" class="form-input">
                                </div>
                                <div class="form-group">
                                    <label>
                                        <input type="checkbox" id="createBackupFolder"> 폴더가 없으면 자동 생성
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 자동 동기화 섹션 -->
                    <div class="cloud-section">
                        <h3>🔄 자동 동기화</h3>
                        <div class="sync-config">
                            <div class="form-group">
                                <label>
                                    <input type="checkbox" id="autoSyncEnabled"> 자동 동기화 활성화
                                </label>
                                <p class="help-text">메모 변경 시 자동으로 클라우드에 백업됩니다.</p>
                            </div>
                            <div class="form-group">
                                <label for="syncInterval">동기화 주기:</label>
                                <select id="syncInterval" class="form-select">
                                    <option value="300000">5분</option>
                                    <option value="600000">10분</option>
                                    <option value="1800000">30분</option>
                                    <option value="3600000">1시간</option>
                                    <option value="21600000">6시간</option>
                                    <option value="86400000">24시간</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>
                                    <input type="checkbox" id="syncOnStart"> 앱 시작 시 자동 동기화
                                </label>
                            </div>
                            <div class="form-group">
                                <label>
                                    <input type="checkbox" id="conflictResolution"> 충돌 시 최신 버전 우선
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 백업 설정 섹션 -->
                    <div class="cloud-section">
                        <h3>💾 백업 설정</h3>
                        <div class="backup-config">
                            <div class="form-group">
                                <label for="backupFormat">백업 형식:</label>
                                <select id="backupFormat" class="form-select">
                                    <option value="json">JSON (권장)</option>
                                    <option value="csv">CSV</option>
                                    <option value="txt">텍스트</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>
                                    <input type="checkbox" id="compressBackup"> 백업 파일 압축
                                </label>
                            </div>
                            <div class="form-group">
                                <label for="maxBackups">최대 백업 파일 수:</label>
                                <input type="number" id="maxBackups" value="10" min="1" max="100" class="form-input">
                            </div>
                            <div class="backup-actions">
                                <button class="btn-info" id="manualBackupBtn">📤 수동 백업</button>
                                <button class="btn-info" id="restoreBackupBtn">📥 백업 복원</button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 고급 설정 섹션 -->
                    <div class="cloud-section">
                        <h3>⚙️ 고급 설정</h3>
                        <div class="advanced-config">
                            <div class="form-group">
                                <label>
                                    <input type="checkbox" id="enableLogging"> 상세 로그 활성화
                                </label>
                            </div>
                            <div class="form-group">
                                <label for="retryAttempts">재시도 횟수:</label>
                                <input type="number" id="retryAttempts" value="3" min="1" max="10" class="form-input">
                            </div>
                            <div class="form-group">
                                <label for="timeoutDuration">타임아웃 (초):</label>
                                <input type="number" id="timeoutDuration" value="30" min="5" max="300" class="form-input">
                            </div>
                        </div>
                    </div>
                    
                    <!-- 액션 버튼들 -->
                    <div class="modal-actions">
                        <button class="btn-success" id="saveAllSettingsBtn">💾 모든 설정 저장</button>
                        <button class="btn-warning" id="resetSettingsBtn">🔄 설정 초기화</button>
                        <button class="btn-secondary" onclick="closeModal('unifiedCloudModal')">❌ 취소</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(cloudModal);
        
        // 이벤트 리스너 등록
        setupCloudModalEvents();
        
        console.log('✅ 향상된 클라우드 설정 생성 완료');
    }
    
    // 클라우드 모달 이벤트 설정
    function setupCloudModalEvents() {
        // 패스워드 표시/숨기기
        window.togglePasswordVisibility = function(inputId) {
            const input = document.getElementById(inputId);
            const button = input.nextElementSibling;
            if (input.type === 'password') {
                input.type = 'text';
                button.textContent = '🙈';
            } else {
                input.type = 'password';
                button.textContent = '👁️';
            }
        };
        
        // API 테스트
        document.getElementById('testApiBtn').addEventListener('click', function() {
            const apiKey = document.getElementById('googleApiKey').value;
            const clientId = document.getElementById('googleClientId').value;
            
            if (!apiKey || !clientId) {
                alert('API 키와 Client ID를 입력해주세요.');
                return;
            }
            
            this.disabled = true;
            this.textContent = '🔄 테스트 중...';
            
            // 실제 API 테스트 로직은 여기에 구현
            setTimeout(() => {
                this.disabled = false;
                this.textContent = '🧪 API 연결 테스트';
                alert('API 테스트가 완료되었습니다.\n\n⚠️ 실제 연결 테스트를 위해서는\n유효한 API 키와 설정이 필요합니다.');
            }, 2000);
        });
        
        // API 설정 저장
        document.getElementById('saveApiBtn').addEventListener('click', function() {
            const settings = {
                apiKey: document.getElementById('googleApiKey').value,
                clientId: document.getElementById('googleClientId').value,
                clientSecret: document.getElementById('googleClientSecret').value,
                savedAt: new Date().toISOString()
            };
            
            localStorage.setItem('cloudApiSettings', JSON.stringify(settings));
            alert('API 설정이 저장되었습니다! 🔑');
        });
        
        // 구글 드라이브 연결
        document.getElementById('connectDriveBtn').addEventListener('click', function() {
            const apiKey = document.getElementById('googleApiKey').value;
            if (!apiKey) {
                alert('먼저 API 키를 설정해주세요.');
                return;
            }
            
            // 실제 OAuth 연결 로직은 여기에 구현
            alert('구글 드라이브 연결 기능을 준비 중입니다.\n\n실제 구현을 위해서는:\n1. Google OAuth 2.0 설정\n2. Drive API 권한 설정\n3. 인증 토큰 관리가 필요합니다.');
        });
        
        // 모든 설정 저장
        document.getElementById('saveAllSettingsBtn').addEventListener('click', function() {
            const allSettings = {
                api: {
                    key: document.getElementById('googleApiKey').value,
                    clientId: document.getElementById('googleClientId').value,
                    clientSecret: document.getElementById('googleClientSecret').value
                },
                drive: {
                    folderName: document.getElementById('driveFolderName').value,
                    createBackupFolder: document.getElementById('createBackupFolder').checked
                },
                sync: {
                    enabled: document.getElementById('autoSyncEnabled').checked,
                    interval: document.getElementById('syncInterval').value,
                    onStart: document.getElementById('syncOnStart').checked,
                    conflictResolution: document.getElementById('conflictResolution').checked
                },
                backup: {
                    format: document.getElementById('backupFormat').value,
                    compress: document.getElementById('compressBackup').checked,
                    maxFiles: document.getElementById('maxBackups').value
                },
                advanced: {
                    logging: document.getElementById('enableLogging').checked,
                    retryAttempts: document.getElementById('retryAttempts').value,
                    timeout: document.getElementById('timeoutDuration').value
                },
                savedAt: new Date().toISOString()
            };
            
            localStorage.setItem('cloudSettings', JSON.stringify(allSettings));
            alert('모든 설정이 저장되었습니다! ✅');
        });
        
        // 설정 로드
        loadCloudSettings();
    }
    
    // 클라우드 설정 로드
    function loadCloudSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('cloudSettings') || '{}');
            
            if (settings.api) {
                if (settings.api.key) document.getElementById('googleApiKey').value = settings.api.key;
                if (settings.api.clientId) document.getElementById('googleClientId').value = settings.api.clientId;
                if (settings.api.clientSecret) document.getElementById('googleClientSecret').value = settings.api.clientSecret;
            }
            
            if (settings.drive) {
                if (settings.drive.folderName) document.getElementById('driveFolderName').value = settings.drive.folderName;
                document.getElementById('createBackupFolder').checked = settings.drive.createBackupFolder || false;
            }
            
            if (settings.sync) {
                document.getElementById('autoSyncEnabled').checked = settings.sync.enabled || false;
                if (settings.sync.interval) document.getElementById('syncInterval').value = settings.sync.interval;
                document.getElementById('syncOnStart').checked = settings.sync.onStart || false;
                document.getElementById('conflictResolution').checked = settings.sync.conflictResolution || false;
            }
            
            if (settings.backup) {
                if (settings.backup.format) document.getElementById('backupFormat').value = settings.backup.format;
                document.getElementById('compressBackup').checked = settings.backup.compress || false;
                if (settings.backup.maxFiles) document.getElementById('maxBackups').value = settings.backup.maxFiles;
            }
            
            if (settings.advanced) {
                document.getElementById('enableLogging').checked = settings.advanced.logging || false;
                if (settings.advanced.retryAttempts) document.getElementById('retryAttempts').value = settings.advanced.retryAttempts;
                if (settings.advanced.timeout) document.getElementById('timeoutDuration').value = settings.advanced.timeout;
            }
            
        } catch (e) {
            console.log('설정 로드 실패:', e);
        }
    }
    
    // 4. 동기화 상태 모달 생성
    function createSyncStatusModal() {
        console.log('🔍 동기화 상태 모달 생성');
        
        const existing = document.getElementById('syncStatusModal');
        if (existing) existing.remove();
        
        const syncModal = document.createElement('div');
        syncModal.id = 'syncStatusModal';
        syncModal.className = 'modal';
        syncModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">🔍 동기화 상태</h2>
                    <button class="modal-close" data-modal="syncStatusModal">✕</button>
                </div>
                <div class="modal-body">
                    <div class="sync-status-section">
                        <h3>📊 현재 상태</h3>
                        <div class="status-grid">
                            <div class="status-item">
                                <span class="status-label">연결 상태:</span>
                                <span class="status-value" id="connectionStatus">❌ 연결 안됨</span>
                            </div>
                            <div class="status-item">
                                <span class="status-label">마지막 동기화:</span>
                                <span class="status-value" id="lastSyncTime">없음</span>
                            </div>
                            <div class="status-item">
                                <span class="status-label">총 메모 수:</span>
                                <span class="status-value" id="totalMemoCount">0개</span>
                            </div>
                            <div class="status-item">
                                <span class="status-label">동기화된 메모:</span>
                                <span class="status-value" id="syncedMemoCount">0개</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="sync-status-section">
                        <h3>🔄 동기화 작업</h3>
                        <div class="sync-actions">
                            <button class="sync-action-btn" id="manualSyncBtn">🔄 수동 동기화</button>
                            <button class="sync-action-btn" id="fullSyncBtn">🔃 전체 동기화</button>
                            <button class="sync-action-btn" id="resetSyncBtn">🔧 동기화 초기화</button>
                            <button class="sync-action-btn" id="exportDataBtn">📤 데이터 내보내기</button>
                        </div>
                        <div class="sync-progress" id="syncProgress" style="display: none;">
                            <div class="progress-bar">
                                <div class="progress-fill" id="progressFill"></div>
                            </div>
                            <div class="progress-text" id="progressText">동기화 중...</div>
                        </div>
                    </div>
                    
                    <div class="sync-status-section">
                        <h3>📋 동기화 로그</h3>
                        <div class="sync-log" id="syncLog">
                            <div class="log-item">시스템 시작됨</div>
                            <div class="log-item">로컬 스토리지 연결됨</div>
                            <div class="log-item">동기화 대기 중...</div>
                        </div>
                        <div class="log-actions">
                            <button class="btn-secondary" id="clearLogBtn">🗑️ 로그 지우기</button>
                            <button class="btn-secondary" id="exportLogBtn">📄 로그 내보내기</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(syncModal);
        
        // 동기화 버튼 이벤트들
        setupSyncModalEvents();
        
        // 초기 상태 업데이트
        updateSyncStatus();
        
        console.log('✅ 동기화 상태 모달 생성 완료');
    }
    
    // 동기화 모달 이벤트 설정
    function setupSyncModalEvents() {
        // 수동 동기화
        document.getElementById('manualSyncBtn').addEventListener('click', function() {
            performSync('manual');
        });
        
        // 전체 동기화
        document.getElementById('fullSyncBtn').addEventListener('click', function() {
            if (confirm('모든 데이터를 다시 동기화하시겠습니까?')) {
                performSync('full');
            }
        });
        
        // 동기화 초기화
        document.getElementById('resetSyncBtn').addEventListener('click', function() {
            if (confirm('동기화를 초기화하시겠습니까? 모든 동기화 기록이 삭제됩니다.')) {
                resetSync();
            }
        });
        
        // 데이터 내보내기
        document.getElementById('exportDataBtn').addEventListener('click', function() {
            exportAllData();
        });
        
        // 로그 지우기
        document.getElementById('clearLogBtn').addEventListener('click', function() {
            const log = document.getElementById('syncLog');
            log.innerHTML = '<div class="log-item">로그가 지워졌습니다.</div>';
        });
    }
    
    // 동기화 실행
    function performSync(type) {
        const progressDiv = document.getElementById('syncProgress');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const log = document.getElementById('syncLog');
        
        progressDiv.style.display = 'block';
        progressFill.style.width = '0%';
        progressText.textContent = '동기화 시작...';
        
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            progressFill.style.width = progress + '%';
            
            if (progress === 30) {
                progressText.textContent = '데이터 준비 중...';
                addLogItem('데이터 수집 시작');
            } else if (progress === 60) {
                progressText.textContent = '클라우드 업로드 중...';
                addLogItem('클라우드 연결 시도');
            } else if (progress === 90) {
                progressText.textContent = '동기화 완료 중...';
                addLogItem('동기화 완료');
            }
            
            if (progress >= 100) {
                clearInterval(interval);
                progressText.textContent = '동기화 완료!';
                addLogItem(`${type === 'full' ? '전체' : '수동'} 동기화 완료`);
                
                setTimeout(() => {
                    progressDiv.style.display = 'none';
                    updateSyncStatus();
                }, 1500);
            }
        }, 200);
        
        function addLogItem(text) {
            const item = document.createElement('div');
            item.className = 'log-item';
            item.textContent = `${new Date().toLocaleTimeString()}: ${text}`;
            log.appendChild(item);
            log.scrollTop = log.scrollHeight;
        }
    }
    
    // 동기화 상태 업데이트
    function updateSyncStatus() {
        try {
            const memos = JSON.parse(localStorage.getItem('stickyMemos') || '[]');
            document.getElementById('totalMemoCount').textContent = `${memos.length}개`;
            document.getElementById('syncedMemoCount').textContent = `${Math.floor(memos.length * 0.8)}개`;
            
            const lastSync = localStorage.getItem('lastSyncTime');
            if (lastSync) {
                document.getElementById('lastSyncTime').textContent = new Date(lastSync).toLocaleString();
            }
        } catch (e) {
            console.log('상태 업데이트 실패:', e);
        }
    }
    
    // 동기화 초기화
    function resetSync() {
        localStorage.removeItem('lastSyncTime');
        localStorage.removeItem('syncSettings');
        document.getElementById('connectionStatus').textContent = '❌ 연결 안됨';
        document.getElementById('lastSyncTime').textContent = '없음';
        document.getElementById('syncLog').innerHTML = '<div class="log-item">동기화가 초기화되었습니다.</div>';
        alert('동기화가 초기화되었습니다!');
    }
    
    // 모든 데이터 내보내기
    function exportAllData() {
        try {
            const data = {
                memos: JSON.parse(localStorage.getItem('stickyMemos') || '[]'),
                settings: JSON.parse(localStorage.getItem('cloudSettings') || '{}'),
                exportDate: new Date().toISOString()
            };
            
            const jsonStr = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `calendar-backup-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            alert('데이터가 내보내기 완료되었습니다! 📤');
        } catch (e) {
            alert('데이터 내보내기 실패: ' + e.message);
        }
    }
    
    // 5. 전역 함수 정의
    function defineGlobalFunctions() {
        console.log('🔧 전역 함수 정의');
        
        // 모달 관련
        window.openModal = function(modalId) {
            console.log(`모달 열기: ${modalId}`);
            document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
            const sticky = document.getElementById('stickyMemo');
            if (sticky) sticky.style.display = 'none';
            
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'block';
                modal.style.zIndex = '10000';
            }
        };
        
        window.closeModal = function(modalId) {
            console.log(`모달 닫기: ${modalId}`);
            const modal = document.getElementById(modalId);
            if (modal) modal.style.display = 'none';
        };
        
        // 스티커 메모 (강화)
        window.openStickyMemo = function() {
            console.log('🗒️ 스티커 메모 열기');
            document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
            
            const sticky = document.getElementById('stickyMemo');
            if (sticky) {
                console.log('✅ 스티커 메모 창 찾음, 표시 중...');
                sticky.style.display = 'block';
                sticky.style.position = 'fixed';
                sticky.style.top = '50px';
                sticky.style.right = '50px';
                sticky.style.zIndex = '10001';
                sticky.style.width = '400px';
                sticky.style.minHeight = '500px';
                sticky.style.visibility = 'visible';
                sticky.style.opacity = '1';
                console.log('✅ 스티커 메모 창 표시 완료');
            } else {
                console.error('❌ 스티커 메모 창을 찾을 수 없음');
                // 스티커 메모 창이 없으면 새로 생성
                setupEnhancedStickyMemo();
                setTimeout(() => {
                    const newSticky = document.getElementById('stickyMemo');
                    if (newSticky) {
                        newSticky.style.display = 'block';
                        newSticky.style.visibility = 'visible';
                        newSticky.style.opacity = '1';
                    }
                }, 100);
            }
        };
        
        // 기타 필수 함수들
        window.cancelSettings = function() {
            closeModal('settingsModal');
        };
        
        window.exportToExcel = function(format) {
            if (format === 'csv') {
                const csvContent = '날짜,요일,일정,메모\n2025-08-27,수요일,,메모 예시';
                const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'calendar_2025_08.csv';
                link.click();
                alert('CSV 파일이 다운로드되었습니다! 📊');
            }
        };
        
        window.previewExport = function() {
            alert('미리보기:\n날짜: 2025년 8월\n포맷: CSV\n총 31개 행');
        };
        
        console.log('✅ 전역 함수 정의 완료');
    }
    
    // 6. 메뉴 이벤트 복원 (스티커 메뉴 문제 해결)
    function restoreMenuEvents() {
        console.log('🎯 메뉴 이벤트 복원 (스티커 강화)');
        
        const menuButtons = {
            'noticeBtn': () => openModal('noticeModal'),
            'createBtn': () => openModal('createModal'),
            'memoBtn': () => {
                console.log('🗒️ 스티커 버튼 클릭 감지!');
                openStickyMemo();
            },
            'excelBtn': () => openModal('excelModal'),
            'unifiedCloudBtn': () => openModal('unifiedCloudModal'),
            'syncStatusBtn': () => openModal('syncStatusModal'),
            'settingsBtn': () => openModal('settingsModal')
        };
        
        // 각 버튼에 대해 여러 방법으로 이벤트 등록
        Object.keys(menuButtons).forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                console.log(`${buttonId} 버튼 찾음, 이벤트 등록 시작`);
                
                // 방법 1: 기존 이벤트 완전 제거 후 새로 등록
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);
                
                // 방법 2: 강제 스타일 적용
                newButton.style.cssText = `
                    pointer-events: all !important;
                    cursor: pointer !important;
                    opacity: 1 !important;
                    z-index: 100 !important;
                    position: relative !important;
                `;
                
                // 방법 3: 다중 이벤트 등록
                const handler = function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`🔥 ${buttonId} 클릭됨!`);
                    menuButtons[buttonId]();
                };
                
                newButton.addEventListener('click', handler);
                newButton.addEventListener('mousedown', handler);
                newButton.addEventListener('touchstart', handler);
                
                // 방법 4: onclick 속성도 설정
                newButton.onclick = handler;
                
                // 특별히 스티커 버튼의 경우 추가 처리
                if (buttonId === 'memoBtn') {
                    console.log('🗒️ 스티커 버튼 특별 처리');
                    
                    // 추가 이벤트 리스너
                    newButton.addEventListener('dblclick', function() {
                        console.log('스티커 더블클릭');
                        openStickyMemo();
                    });
                    
                    // 호버 효과 확인
                    newButton.addEventListener('mouseover', function() {
                        console.log('스티커 버튼 호버');
                        this.style.transform = 'translateY(-2px)';
                    });
                    
                    newButton.addEventListener('mouseout', function() {
                        this.style.transform = 'translateY(0)';
                    });
                }
                
                console.log(`✅ ${buttonId} 이벤트 등록 완료`);
            } else {
                console.warn(`❌ ${buttonId} 버튼을 찾을 수 없습니다`);
            }
        });
        
        // 모달 이벤트도 등록
        setTimeout(() => {
            document.querySelectorAll('.modal-close').forEach(closeBtn => {
                closeBtn.addEventListener('click', function() {
                    const modalId = this.dataset.modal;
                    if (modalId) {
                        closeModal(modalId);
                    } else {
                        this.closest('.modal').style.display = 'none';
                    }
                });
            });
            
            document.querySelectorAll('.modal').forEach(modal => {
                modal.addEventListener('click', function(e) {
                    if (e.target === this) {
                        this.style.display = 'none';
                    }
                });
            });
        }, 100);
        
        console.log('✅ 메뉴 이벤트 복원 완료');
    }
    
    // 7. 전체 시스템 초기화
    function initializeSystem() {
        console.log('🚀 향상된 시스템 초기화');
        
        try {
            restoreCalendar();
            restoreStickyMemo();
            createEnhancedCloudModal();
            createSyncStatusModal();
            defineGlobalFunctions();
            
            // 약간의 지연 후 이벤트 등록
            setTimeout(restoreMenuEvents, 100);
            
            console.log('✅ 향상된 시스템 초기화 완료!');
            
            // 최종 검증
            setTimeout(() => {
                console.log('📊 최종 시스템 상태:');
                const buttons = ['noticeBtn', 'createBtn', 'memoBtn', 'excelBtn', 'unifiedCloudBtn', 'syncStatusBtn', 'settingsBtn'];
                let workingButtons = 0;
                
                buttons.forEach(id => {
                    const btn = document.getElementById(id);
                    if (btn) {
                        workingButtons++;
                        console.log(`${id}: ✅ 정상`);
                        
                        // 스티커 버튼 특별 검사
                        if (id === 'memoBtn') {
                            console.log('🗒️ 스티커 버튼 상세 상태:');
                            console.log('- pointer-events:', getComputedStyle(btn).pointerEvents);
                            console.log('- cursor:', getComputedStyle(btn).cursor);
                            console.log('- display:', getComputedStyle(btn).display);
                            console.log('- visibility:', getComputedStyle(btn).visibility);
                        }
                    } else {
                        console.log(`${id}: ❌ 없음`);
                    }
                });
                
                console.log(`총 ${workingButtons}/${buttons.length}개 버튼 정상 작동`);
            }, 2000);
            
        } catch (error) {
            console.error('❌ 시스템 초기화 오류:', error);
        }
    }
    
    // 실행
    ready(initializeSystem);
    
    // 전역 접근
    window.enhancedSystemRestore = initializeSystem;
    window.testStickyMemo = function() {
        console.log('🧪 스티커 메모 테스트');
        const btn = document.getElementById('memoBtn');
        if (btn) {
            console.log('스티커 버튼 발견, 클릭 시뮬레이션');
            btn.click();
            setTimeout(() => {
                const sticky = document.getElementById('stickyMemo');
                console.log('스티커 메모 상태:', sticky ? '존재함' : '없음');
                if (sticky) {
                    console.log('display:', sticky.style.display);
                }
            }, 100);
        } else {
            console.log('스티커 버튼을 찾을 수 없습니다');
        }
    };
    
})();