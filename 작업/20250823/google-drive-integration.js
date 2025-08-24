// Google Drive API 통합 스크립트
(function() {
    'use strict';

    // Google API 설정
    const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
    const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.metadata.readonly';
    
    let tokenClient;
    let gapiInited = false;
    let gisInited = false;
    let isAuthenticated = false;

    // 이 값들은 실제 Google Cloud Console에서 발급받은 값으로 교체해야 합니다
    let CLIENT_ID = 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com';
    let API_KEY = 'YOUR_API_KEY_HERE';

    /**
     * Google API 라이브러리 초기화
     */
    async function initializeGapi() {
        await gapi.load('client', initializeGapiClient);
    }

    /**
     * gapi 클라이언트 초기화
     */
    async function initializeGapiClient() {
        // API 키가 설정되지 않았으면 초기화하지 않음
        if (API_KEY === 'YOUR_API_KEY_HERE' || !API_KEY) {
            console.log('Google API 키가 설정되지 않았습니다.');
            gapiInited = false;
            return;
        }

        try {
            await gapi.client.init({
                apiKey: API_KEY,
                discoveryDocs: [DISCOVERY_DOC],
            });
            gapiInited = true;
            console.log('Google API 초기화 완료');
        } catch (error) {
            console.error('Google API 초기화 실패:', error);
            gapiInited = false;
        }
        
        maybeEnableButtons();
    }

    /**
     * Google Identity Services 초기화
     */
    function initializeGis() {
        // 클라이언트 ID가 설정되지 않았으면 초기화하지 않음
        if (CLIENT_ID === 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com' || !CLIENT_ID) {
            console.log('Google 클라이언트 ID가 설정되지 않았습니다.');
            gisInited = false;
            return;
        }

        try {
            tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: CLIENT_ID,
                scope: SCOPES,
                callback: '', // 나중에 정의됨
            });
            gisInited = true;
            console.log('Google Identity Services 초기화 완료');
        } catch (error) {
            console.error('Google Identity Services 초기화 실패:', error);
            gisInited = false;
        }
        
        maybeEnableButtons();
    }

    /**
     * 초기화 완료 시 버튼 활성화
     */
    function maybeEnableButtons() {
        const driveBtn = document.getElementById('driveBtn');
        if (!driveBtn) return;
        
        if (gapiInited && gisInited) {
            driveBtn.disabled = false;
            driveBtn.textContent = '☁️ 구글 드라이브 연동';
            driveBtn.onclick = handleAuthClick;
            
            // 클라우드 설정 버튼이 있다면 업데이트
            updateCloudSettingsBtn();
        } else if (!gapiInited || !gisInited) {
            // API가 초기화되지 않았으면 설정 모달을 열도록 함
            driveBtn.disabled = false;
            driveBtn.textContent = '☁️ 구글 드라이브 설정';
            driveBtn.onclick = showCloudSettingsModal;
        }
    }

    /**
     * 인증 버튼 클릭 핸들러
     */
    function handleAuthClick() {
        tokenClient.callback = async (resp) => {
            if (resp.error !== undefined) {
                showMessage('인증 실패: ' + resp.error, 'error');
                return;
            }
            
            isAuthenticated = true;
            showMessage('구글 드라이브 연동 성공!', 'success');
            updateDriveButton();
            
            // 기본 파일 목록 표시
            listFiles();
        };

        if (gapi.client.getToken() === null) {
            // 처음 인증
            tokenClient.requestAccessToken({prompt: 'consent'});
        } else {
            // 이미 토큰이 있음
            tokenClient.requestAccessToken({prompt: ''});
        }
    }

    /**
     * 로그아웃 핸들러
     */
    function handleSignoutClick() {
        const token = gapi.client.getToken();
        if (token !== null) {
            google.accounts.oauth2.revoke(token.access_token);
            gapi.client.setToken('');
        }
        
        isAuthenticated = false;
        updateDriveButton();
        showMessage('구글 드라이브 연결이 해제되었습니다.', 'info');
    }

    /**
     * 드라이브 버튼 상태 업데이트
     */
    function updateDriveButton() {
        const driveBtn = document.getElementById('driveBtn');
        if (!driveBtn) return;

        if (isAuthenticated) {
            driveBtn.textContent = '☁️ 연결됨 (해제하기)';
            driveBtn.onclick = handleSignoutClick;
            driveBtn.style.background = 'linear-gradient(135deg, #4caf50, #45a049)';
        } else {
            driveBtn.textContent = '☁️ 구글 드라이브 연동';
            driveBtn.onclick = handleAuthClick;
            driveBtn.style.background = '';
        }
    }

    /**
     * 클라우드 설정 버튼 업데이트
     */
    function updateCloudSettingsBtn() {
        const buttons = document.querySelectorAll('.cloud-setup-btn, [onclick*="cloudSettings"]');
        buttons.forEach(btn => {
            if (btn.textContent.includes('클라우드')) {
                btn.onclick = showCloudSettingsModal;
                btn.disabled = false;
            }
        });
    }

    /**
     * 파일 목록 조회
     */
    async function listFiles() {
        try {
            const response = await gapi.client.drive.files.list({
                pageSize: 10,
                fields: 'nextPageToken, files(id, name, mimeType, createdTime, size)',
                q: "trashed=false"
            });

            const files = response.result.files;
            if (!files || files.length == 0) {
                showMessage('드라이브에 파일이 없습니다.', 'info');
                return;
            }

            showFilesList(files);
        } catch (err) {
            console.error('파일 목록 조회 실패:', err);
            showMessage('파일 목록 조회 실패: ' + err.message, 'error');
        }
    }

    /**
     * 파일 목록 표시
     */
    function showFilesList(files) {
        const modal = createModal('구글 드라이브 파일 목록');
        const content = modal.querySelector('.modal-content');
        
        const filesList = document.createElement('div');
        filesList.className = 'files-list';
        filesList.style.cssText = `
            max-height: 400px;
            overflow-y: auto;
            margin: 20px 0;
        `;

        files.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.style.cssText = `
                display: flex;
                align-items: center;
                padding: 10px;
                border-bottom: 1px solid #eee;
                cursor: pointer;
                transition: background-color 0.2s;
            `;

            fileItem.innerHTML = `
                <div style="flex: 1;">
                    <div style="font-weight: 500;">${file.name}</div>
                    <div style="font-size: 12px; color: #666;">
                        ${file.mimeType} • ${formatFileSize(file.size)} • ${formatDate(file.createdTime)}
                    </div>
                </div>
                <button class="download-btn" onclick="downloadFile('${file.id}', '${file.name}')" 
                        style="background: #4285f4; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                    다운로드
                </button>
            `;

            fileItem.addEventListener('mouseenter', () => {
                fileItem.style.backgroundColor = '#f5f5f5';
            });
            fileItem.addEventListener('mouseleave', () => {
                fileItem.style.backgroundColor = '';
            });

            filesList.appendChild(fileItem);
        });

        content.appendChild(filesList);

        // 업로드 버튼 추가
        const uploadBtn = document.createElement('button');
        uploadBtn.textContent = '📤 파일 업로드';
        uploadBtn.className = 'action-btn';
        uploadBtn.style.cssText = `
            background: #34a853;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            margin-top: 15px;
            width: 100%;
        `;
        uploadBtn.onclick = showUploadDialog;
        content.appendChild(uploadBtn);

        document.body.appendChild(modal);
        modal.style.display = 'flex';
    }

    /**
     * 파일 업로드 다이얼로그
     */
    function showUploadDialog() {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.onchange = handleFileUpload;
        input.click();
    }

    /**
     * 파일 업로드 핸들러
     */
    async function handleFileUpload(event) {
        const files = event.target.files;
        if (!files.length) return;

        for (let file of files) {
            try {
                showMessage(`"${file.name}" 업로드 중...`, 'info');
                await uploadFile(file);
                showMessage(`"${file.name}" 업로드 완료!`, 'success');
            } catch (err) {
                console.error('업로드 실패:', err);
                showMessage(`"${file.name}" 업로드 실패: ${err.message}`, 'error');
            }
        }
    }

    /**
     * 파일 업로드
     */
    async function uploadFile(file) {
        const metadata = {
            name: file.name,
        };

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
        form.append('file', file);

        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: new Headers({
                'Authorization': `Bearer ${gapi.client.getToken().access_token}`
            }),
            body: form
        });

        if (!response.ok) {
            throw new Error(`업로드 실패: ${response.statusText}`);
        }

        return await response.json();
    }

    /**
     * 파일 다운로드
     */
    window.downloadFile = async function(fileId, fileName) {
        try {
            showMessage(`"${fileName}" 다운로드 중...`, 'info');
            
            const response = await gapi.client.drive.files.get({
                fileId: fileId,
                alt: 'media'
            });

            // Blob 생성 및 다운로드
            const blob = new Blob([response.body], {type: 'application/octet-stream'});
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            a.click();
            
            URL.revokeObjectURL(url);
            showMessage(`"${fileName}" 다운로드 완료!`, 'success');
        } catch (err) {
            console.error('다운로드 실패:', err);
            showMessage(`다운로드 실패: ${err.message}`, 'error');
        }
    };

    /**
     * 캘린더 메모 백업 함수
     */
    async function backupCalendarMemos() {
        if (!isAuthenticated) {
            showMessage('먼저 구글 드라이브에 연결해주세요.', 'error');
            return;
        }

        try {
            showMessage('달력 메모 백업 중...', 'info');
            
            // 로컬스토리지에서 메모 데이터 가져오기
            const memos = JSON.parse(localStorage.getItem('calendarMemos') || '{}');
            const backupData = {
                version: '1.0',
                timestamp: new Date().toISOString(),
                memos: memos,
                metadata: {
                    totalMemos: Object.keys(memos).length,
                    createdBy: 'Korean Calendar App',
                    description: '한국 달력 앱 메모 백업'
                }
            };

            const backupContent = JSON.stringify(backupData, null, 2);
            const fileName = `calendar-memos-backup-${new Date().toISOString().split('T')[0]}.json`;
            
            await uploadBackupFile(fileName, backupContent);
            showMessage(`✅ 달력 메모 백업 완료! (${Object.keys(memos).length}개 메모)`, 'success');
            
        } catch (err) {
            console.error('백업 실패:', err);
            showMessage(`백업 실패: ${err.message}`, 'error');
        }
    }

    /**
     * 백업 파일 업로드
     */
    async function uploadBackupFile(fileName, content) {
        const metadata = {
            name: fileName,
            parents: ['appDataFolder'] // 앱 전용 폴더에 저장
        };

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
        form.append('file', new Blob([content], {type: 'application/json'}));

        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: new Headers({
                'Authorization': `Bearer ${gapi.client.getToken().access_token}`
            }),
            body: form
        });

        if (!response.ok) {
            throw new Error(`업로드 실패: ${response.statusText}`);
        }

        return await response.json();
    }

    /**
     * 달력 메모 복원
     */
    async function restoreCalendarMemos() {
        if (!isAuthenticated) {
            showMessage('먼저 구글 드라이브에 연결해주세요.', 'error');
            return;
        }

        try {
            showMessage('백업 파일 검색 중...', 'info');
            
            // 앱 데이터 폴더에서 백업 파일들 검색
            const response = await gapi.client.drive.files.list({
                q: "parents in 'appDataFolder' and name contains 'calendar-memos-backup' and trashed=false",
                fields: 'files(id, name, createdTime, size)',
                orderBy: 'createdTime desc'
            });

            const backupFiles = response.result.files;
            if (!backupFiles || backupFiles.length === 0) {
                showMessage('백업 파일을 찾을 수 없습니다.', 'error');
                return;
            }

            showBackupFilesList(backupFiles);
            
        } catch (err) {
            console.error('복원 실패:', err);
            showMessage(`복원 실패: ${err.message}`, 'error');
        }
    }

    /**
     * 백업 파일 목록 표시
     */
    function showBackupFilesList(files) {
        const modal = createModal('📥 백업 파일에서 복원');
        const content = modal.querySelector('.modal-content');
        
        const backupList = document.createElement('div');
        backupList.className = 'backup-files-list';
        backupList.style.cssText = `
            max-height: 400px;
            overflow-y: auto;
            margin: 20px 0;
        `;

        files.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'backup-file-item';
            fileItem.style.cssText = `
                display: flex;
                align-items: center;
                padding: 15px;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                margin-bottom: 10px;
                cursor: pointer;
                transition: all 0.2s;
                background: #f9f9f9;
            `;

            const createdDate = new Date(file.createdTime).toLocaleDateString('ko-KR');
            const createdTime = new Date(file.createdTime).toLocaleTimeString('ko-KR');

            fileItem.innerHTML = `
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: #2c3e50; margin-bottom: 5px;">
                        📄 ${file.name}
                    </div>
                    <div style="font-size: 13px; color: #7f8c8d;">
                        생성일: ${createdDate} ${createdTime} • 크기: ${formatFileSize(file.size)}
                    </div>
                </div>
                <button class="restore-btn" onclick="restoreFromBackup('${file.id}', '${file.name}')" 
                        style="background: #27ae60; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-weight: 500;">
                    복원하기
                </button>
            `;

            fileItem.addEventListener('mouseenter', () => {
                fileItem.style.borderColor = '#3498db';
                fileItem.style.backgroundColor = '#ecf0f1';
            });
            fileItem.addEventListener('mouseleave', () => {
                fileItem.style.borderColor = '#e0e0e0';
                fileItem.style.backgroundColor = '#f9f9f9';
            });

            backupList.appendChild(fileItem);
        });

        content.appendChild(backupList);

        // 새 백업 버튼 추가
        const newBackupBtn = document.createElement('button');
        newBackupBtn.textContent = '📤 새 백업 만들기';
        newBackupBtn.className = 'action-btn';
        newBackupBtn.style.cssText = `
            background: #3498db;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            margin-top: 15px;
            width: 100%;
            font-weight: 500;
        `;
        newBackupBtn.onclick = () => {
            closeModal();
            backupCalendarMemos();
        };
        content.appendChild(newBackupBtn);

        document.body.appendChild(modal);
        modal.style.display = 'flex';
    }

    /**
     * 백업에서 복원
     */
    window.restoreFromBackup = async function(fileId, fileName) {
        try {
            const confirmMsg = `정말로 "${fileName}"에서 복원하시겠습니까?\n\n현재 메모 데이터는 덮어쓰여집니다.`;
            if (!confirm(confirmMsg)) return;

            showMessage('백업 파일 복원 중...', 'info');
            
            const response = await gapi.client.drive.files.get({
                fileId: fileId,
                alt: 'media'
            });

            const backupData = JSON.parse(response.body);
            
            if (!backupData.memos) {
                throw new Error('올바르지 않은 백업 파일 형식입니다.');
            }

            // 로컬스토리지에 복원
            localStorage.setItem('calendarMemos', JSON.stringify(backupData.memos));
            
            // 글로벌 memos 변수 업데이트 (있다면)
            if (window.memos) {
                window.memos = backupData.memos;
            }

            // UI 새로고침
            if (window.refreshAllUI) {
                window.refreshAllUI();
            } else if (window.displayStickyMemos) {
                window.displayStickyMemos();
            }

            const memoCount = Object.keys(backupData.memos).length;
            showMessage(`✅ 복원 완료! ${memoCount}개의 메모가 복원되었습니다.`, 'success');
            
            closeModal();
            
        } catch (err) {
            console.error('복원 실패:', err);
            showMessage(`복원 실패: ${err.message}`, 'error');
        }
    };

    /**
     * 클라우드 설정 모달
     */
    function showCloudSettingsModal() {
        const modal = createModal('구글 드라이브 설정');
        const content = modal.querySelector('.modal-content');
        
        content.innerHTML = `
            <div class="cloud-settings-content">
                <div class="connection-status">
                    <h3>📱 연결 상태</h3>
                    <div class="status-card ${isAuthenticated ? 'connected' : 'disconnected'}">
                        <div class="status-icon">${isAuthenticated ? '✅' : '❌'}</div>
                        <div class="status-text">
                            <strong>${isAuthenticated ? '연결됨' : '연결 안됨'}</strong>
                            <p>${isAuthenticated ? '구글 드라이브가 연결되어 있습니다.' : '구글 드라이브 연결이 필요합니다.'}</p>
                        </div>
                    </div>
                </div>

                ${isAuthenticated ? `
                    <div class="backup-actions">
                        <h3>📦 백업 및 복원</h3>
                        <div class="action-buttons">
                            <button class="backup-action-btn backup" onclick="backupCalendarMemos()">
                                <span class="btn-icon">📤</span>
                                <span class="btn-text">
                                    <strong>백업하기</strong>
                                    <small>현재 메모를 구글 드라이브에 저장</small>
                                </span>
                            </button>
                            <button class="backup-action-btn restore" onclick="restoreCalendarMemos()">
                                <span class="btn-icon">📥</span>
                                <span class="btn-text">
                                    <strong>복원하기</strong>
                                    <small>구글 드라이브에서 메모 불러오기</small>
                                </span>
                            </button>
                        </div>
                    </div>
                ` : `
                    <div class="quick-start">
                        <h3>🚀 빠른 시작 가이드</h3>
                        <div class="quick-start-steps">
                            <div class="step">
                                <div class="step-number">1</div>
                                <div class="step-content">
                                    <strong>Google Cloud Console 접속</strong>
                                    <p>Google Cloud Console에서 프로젝트를 생성하고 Drive API를 활성화하세요.</p>
                                    <button class="quick-btn" onclick="window.open('https://console.cloud.google.com/', '_blank')">
                                        Console 열기
                                    </button>
                                </div>
                            </div>
                            <div class="step">
                                <div class="step-number">2</div>
                                <div class="step-content">
                                    <strong>OAuth 2.0 클라이언트 ID 생성</strong>
                                    <p>승인된 JavaScript 원본에 현재 도메인을 추가하세요.</p>
                                </div>
                            </div>
                            <div class="step">
                                <div class="step-number">3</div>
                                <div class="step-content">
                                    <strong>API 키 및 클라이언트 ID 설정</strong>
                                    <p>아래 필드에 발급받은 정보를 입력하세요.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="settings-section api-input">
                        <h4>🔑 API 설정</h4>
                        <div class="form-group highlight">
                            <label>
                                클라이언트 ID <span class="required">필수</span>
                            </label>
                            <div class="input-wrapper">
                                <input type="text" id="clientId" class="settings-input large" 
                                       placeholder="000000000000-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com"
                                       value="${CLIENT_ID === 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com' ? '' : CLIENT_ID}">
                                <button class="paste-btn" onclick="pasteFromClipboard('clientId')">📋 붙여넣기</button>
                            </div>
                            <small>Google Cloud Console의 사용자 인증 정보에서 생성한 OAuth 2.0 클라이언트 ID</small>
                        </div>

                        <div class="form-group highlight">
                            <label>
                                API 키 <span class="required">필수</span>
                            </label>
                            <div class="input-wrapper">
                                <input type="password" id="apiKey" class="settings-input large" 
                                       placeholder="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                                       value="${API_KEY === 'YOUR_API_KEY_HERE' ? '' : API_KEY}">
                                <button class="paste-btn" onclick="pasteFromClipboard('apiKey')">📋 붙여넣기</button>
                            </div>
                            <small>Google Cloud Console에서 생성한 API 키 (브라우저 키 권장)</small>
                        </div>
                    </div>

                    <div class="test-section">
                        <button class="test-btn large" onclick="testGoogleDriveConnection()">
                            🧪 연결 테스트
                        </button>
                        <div id="testResult" class="test-result" style="display: none;"></div>
                    </div>

                    <div class="settings-actions">
                        <button class="save-btn big" onclick="saveCloudSettings()">💾 설정 저장</button>
                        <button class="cancel-btn" onclick="closeModal()">취소</button>
                    </div>

                    <div class="help-section">
                        <details>
                            <summary>📚 상세 설정 가이드</summary>
                            <div class="help-content">
                                <h5>1. Google Cloud Console 설정</h5>
                                <ol>
                                    <li>Google Cloud Console 접속</li>
                                    <li>프로젝트 생성 또는 선택</li>
                                    <li>API 및 서비스 > 라이브러리에서 "Google Drive API" 검색 후 사용 설정</li>
                                    <li>사용자 인증 정보 > 사용자 인증 정보 만들기 > OAuth 클라이언트 ID</li>
                                    <li>애플리케이션 유형: 웹 애플리케이션</li>
                                    <li>승인된 JavaScript 원본에 현재 도메인 추가</li>
                                </ol>

                                <h5>2. API 키 생성</h5>
                                <ol>
                                    <li>사용자 인증 정보 > 사용자 인증 정보 만들기 > API 키</li>
                                    <li>API 키 제한 > 브라우저 키로 설정</li>
                                    <li>웹사이트 제한사항에 현재 도메인 추가</li>
                                </ol>

                                <h5>3. 문제 해결</h5>
                                <ul>
                                    <li><code>origin_mismatch</code> 오류: 승인된 JavaScript 원본 확인</li>
                                    <li><code>access_denied</code> 오류: OAuth 동의 화면 설정 확인</li>
                                    <li>API 키 오류: 키 제한사항 및 활성화된 API 확인</li>
                                </ul>
                            </div>
                        </details>
                    </div>
                `}
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'flex';
    }

    // 전역 함수로 노출
    window.backupCalendarMemos = backupCalendarMemos;
    window.restoreCalendarMemos = restoreCalendarMemos;

    /**
     * 클립보드에서 붙여넣기
     */
    window.pasteFromClipboard = async function(inputId) {
        try {
            const text = await navigator.clipboard.readText();
            document.getElementById(inputId).value = text;
        } catch (err) {
            console.warn('클립보드 접근 실패:', err);
            showMessage('클립보드에서 붙여넣기를 실패했습니다.', 'info');
        }
    };

    /**
     * 구글 드라이브 연결 테스트
     */
    window.testGoogleDriveConnection = async function() {
        const clientId = document.getElementById('clientId').value.trim();
        const apiKey = document.getElementById('apiKey').value.trim();
        const resultDiv = document.getElementById('testResult');

        if (!clientId || !apiKey) {
            showTestResult('클라이언트 ID와 API 키를 모두 입력해주세요.', 'error');
            return;
        }

        showTestResult('연결 테스트 중...', 'info');

        try {
            // 임시로 설정값 적용
            const originalClientId = CLIENT_ID;
            const originalApiKey = API_KEY;
            
            // 전역 변수 업데이트 (임시)
            window.TEMP_CLIENT_ID = clientId;
            window.TEMP_API_KEY = apiKey;

            // 간단한 validation 수행
            if (!clientId.includes('.apps.googleusercontent.com')) {
                throw new Error('올바르지 않은 클라이언트 ID 형식입니다.');
            }

            if (!apiKey.startsWith('AIza')) {
                throw new Error('올바르지 않은 API 키 형식입니다.');
            }

            showTestResult('✅ 기본 검증 통과! 실제 연결은 설정 저장 후 테스트하세요.', 'success');
        } catch (err) {
            showTestResult(`❌ 테스트 실패: ${err.message}`, 'error');
        }
    };

    /**
     * 테스트 결과 표시
     */
    function showTestResult(message, type) {
        const resultDiv = document.getElementById('testResult');
        resultDiv.style.display = 'block';
        resultDiv.textContent = message;
        resultDiv.className = `test-result ${type === 'success' ? 'success' : type === 'error' ? 'error' : 'info'}`;
        
        if (type === 'success') {
            resultDiv.style.background = '#c8e6c9';
            resultDiv.style.color = '#2e7d32';
        } else if (type === 'error') {
            resultDiv.style.background = '#ffcdd2';
            resultDiv.style.color = '#c62828';
        } else {
            resultDiv.style.background = '#e3f2fd';
            resultDiv.style.color = '#1976d2';
        }
    }

    /**
     * 클라우드 설정 저장
     */
    window.saveCloudSettings = function() {
        const clientId = document.getElementById('clientId').value.trim();
        const apiKey = document.getElementById('apiKey').value.trim();

        if (!clientId || !apiKey) {
            showMessage('클라이언트 ID와 API 키를 모두 입력해주세요.', 'error');
            return;
        }

        // localStorage에 저장 (실제 환경에서는 보안을 고려해야 합니다)
        localStorage.setItem('googleDriveClientId', clientId);
        localStorage.setItem('googleDriveApiKey', apiKey);

        // 전역 변수 업데이트
        window.CLIENT_ID = clientId;
        window.API_KEY = apiKey;

        showMessage('설정이 저장되었습니다. 페이지를 새로고침하여 적용하세요.', 'success');
        
        // 모달 닫기
        closeModal();
        
        // 새로고침 제안
        setTimeout(() => {
            if (confirm('설정을 적용하려면 페이지를 새로고침해야 합니다. 지금 새로고침 하시겠습니까?')) {
                location.reload();
            }
        }, 1000);
    };

    /**
     * 유틸리티 함수들
     */
    function formatFileSize(bytes) {
        if (!bytes) return '알 수 없음';
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
    }

    function formatDate(dateString) {
        if (!dateString) return '알 수 없음';
        return new Date(dateString).toLocaleDateString('ko-KR');
    }

    function createModal(title) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;

        const content = document.createElement('div');
        content.className = 'modal-content';
        content.style.cssText = `
            background: white;
            padding: 0;
            border-radius: 12px;
            max-width: 800px;
            max-height: 90vh;
            width: 90%;
            overflow-y: auto;
            position: relative;
        `;

        const header = document.createElement('div');
        header.className = 'cloud-header';
        header.innerHTML = `
            <h2 style="margin: 0; font-size: 18px;">${title}</h2>
            <button onclick="closeModal()" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer; padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 4px;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='none'">×</button>
        `;

        content.appendChild(header);
        modal.appendChild(content);

        return modal;
    }

    window.closeModal = function() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => modal.remove());
    };

    function showMessage(message, type = 'info') {
        // 기존 메시지가 있다면 제거
        const existingMsg = document.querySelector('.drive-message');
        if (existingMsg) existingMsg.remove();

        const msgDiv = document.createElement('div');
        msgDiv.className = `drive-message ${type}`;
        msgDiv.textContent = message;
        msgDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10001;
            max-width: 400px;
            word-wrap: break-word;
            animation: slideIn 0.3s ease;
        `;

        // 타입별 색상
        if (type === 'success') {
            msgDiv.style.background = '#4caf50';
        } else if (type === 'error') {
            msgDiv.style.background = '#f44336';
        } else {
            msgDiv.style.background = '#2196f3';
        }

        // 애니메이션 CSS 추가
        if (!document.querySelector('#drive-message-styles')) {
            const styles = document.createElement('style');
            styles.id = 'drive-message-styles';
            styles.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                
                .connection-status { margin-bottom: 25px; }
                .status-card { 
                    display: flex; 
                    align-items: center; 
                    padding: 20px; 
                    border-radius: 12px; 
                    margin-top: 10px;
                    border: 2px solid #e0e0e0;
                }
                .status-card.connected { background: #e8f5e8; border-color: #4caf50; }
                .status-card.disconnected { background: #ffeaea; border-color: #f44336; }
                .status-icon { font-size: 24px; margin-right: 15px; }
                .status-text strong { display: block; font-size: 16px; margin-bottom: 5px; }
                .status-text p { margin: 0; color: #666; font-size: 14px; }
                
                .backup-actions { margin-bottom: 25px; }
                .action-buttons { display: flex; gap: 15px; margin-top: 15px; }
                .backup-action-btn { 
                    flex: 1; 
                    display: flex; 
                    align-items: center; 
                    padding: 20px; 
                    border: 2px solid #e0e0e0; 
                    border-radius: 12px; 
                    background: white; 
                    cursor: pointer; 
                    transition: all 0.2s;
                    text-align: left;
                }
                .backup-action-btn:hover { border-color: #3498db; background: #f8f9fa; }
                .backup-action-btn.backup:hover { border-color: #3498db; }
                .backup-action-btn.restore:hover { border-color: #27ae60; }
                .btn-icon { font-size: 24px; margin-right: 15px; }
                .btn-text strong { display: block; font-size: 16px; margin-bottom: 5px; color: #2c3e50; }
                .btn-text small { color: #7f8c8d; font-size: 13px; }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(msgDiv);

        // 3초 후 자동 제거
        setTimeout(() => {
            if (msgDiv.parentNode) {
                msgDiv.style.animation = 'slideIn 0.3s ease reverse';
                setTimeout(() => msgDiv.remove(), 300);
            }
        }, 3000);
    }

    /**
     * 초기화 및 이벤트 리스너
     */
    function initialize() {
        // 저장된 설정 불러오기
        const savedClientId = localStorage.getItem('googleDriveClientId');
        const savedApiKey = localStorage.getItem('googleDriveApiKey');
        
        if (savedClientId && savedApiKey) {
            // 전역 변수 업데이트
            CLIENT_ID = savedClientId;
            API_KEY = savedApiKey;
            window.CLIENT_ID = savedClientId;
            window.API_KEY = savedApiKey;
            console.log('저장된 Google Drive 설정을 불러왔습니다.');
        }
        
        // 버튼 초기 상태 설정
        const driveBtn = document.getElementById('driveBtn');
        if (driveBtn) {
            driveBtn.disabled = false;
            driveBtn.textContent = '☁️ 구글 드라이브 설정';
            driveBtn.onclick = showCloudSettingsModal;
        }

        // Google API 로드 대기
        if (typeof gapi !== 'undefined') {
            initializeGapi();
        } else {
            // gapi 로드 대기
            window.gapiLoadCallback = initializeGapi;
        }

        // Google Identity Services 로드 대기
        if (typeof google !== 'undefined' && google.accounts) {
            initializeGis();
        } else {
            // GIS 로드 대기
            window.gisLoadCallback = initializeGis;
        }

        // API 초기화 후 버튼 상태 업데이트
        setTimeout(() => {
            maybeEnableButtons();
        }, 500);
    }

    // 페이지 로드 완료 후 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    // Google API 라이브러리 동적 로드
    function loadGoogleAPIs() {
        // Google API Client 로드
        if (!window.gapi) {
            const gapiScript = document.createElement('script');
            gapiScript.src = 'https://apis.google.com/js/api.js';
            gapiScript.onload = () => {
                if (window.gapiLoadCallback) window.gapiLoadCallback();
            };
            document.head.appendChild(gapiScript);
        }

        // Google Identity Services 로드
        if (!window.google || !window.google.accounts) {
            const gisScript = document.createElement('script');
            gisScript.src = 'https://accounts.google.com/gsi/client';
            gisScript.onload = () => {
                if (window.gisLoadCallback) window.gisLoadCallback();
            };
            document.head.appendChild(gisScript);
        }
    }

    // API 라이브러리 로드
    loadGoogleAPIs();

})();