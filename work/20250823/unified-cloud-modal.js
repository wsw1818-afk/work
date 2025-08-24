// 통합 클라우드 설정 모달
(function() {
    'use strict';

    /**
     * 통합 클라우드 설정 모달 표시
     */
    function showUnifiedCloudModal() {
        const modal = createUnifiedModal('☁️ 구글 드라이브 & 자동 동기화 설정');
        const content = modal.querySelector('.modal-body');
        
        // 현재 설정값 가져오기
        const isAuthenticated = window.isAuthenticated || false;
        const autoSyncSystem = window.autoSyncSystem;
        const autoSyncEnabled = autoSyncSystem ? autoSyncSystem.isEnabled() : false;
        const intervalMinutes = autoSyncSystem ? autoSyncSystem.getInterval() : 5;
        const customFileName = autoSyncSystem ? autoSyncSystem.getCustomFileName() : '';
        const lastSyncTime = autoSyncSystem ? autoSyncSystem.getLastSyncTime() : 0;
        
        // API 설정값
        const CLIENT_ID = window.CLIENT_ID || localStorage.getItem('googleDriveClientId') || '';
        const API_KEY = window.API_KEY || localStorage.getItem('googleDriveApiKey') || '';
        const isConfigured = CLIENT_ID && API_KEY && 
                           CLIENT_ID !== 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com' && 
                           API_KEY !== 'YOUR_API_KEY_HERE';
        
        content.innerHTML = `
            <div style="padding: 25px;">
                <!-- 탭 네비게이션 -->
                <div class="tab-navigation" style="display: flex; margin-bottom: 30px; border-bottom: 2px solid #e0e0e0;">
                    <button class="tab-btn active" data-tab="connection" style="flex: 1; padding: 15px; background: none; border: none; font-size: 16px; font-weight: 600; color: #3498db; border-bottom: 3px solid #3498db; cursor: pointer; transition: all 0.3s;">
                        🔗 연결 설정
                    </button>
                    <button class="tab-btn" data-tab="sync" style="flex: 1; padding: 15px; background: none; border: none; font-size: 16px; font-weight: 600; color: #666; border-bottom: 3px solid transparent; cursor: pointer; transition: all 0.3s;">
                        🔄 자동 동기화
                    </button>
                    <button class="tab-btn" data-tab="backup" style="flex: 1; padding: 15px; background: none; border: none; font-size: 16px; font-weight: 600; color: #666; border-bottom: 3px solid transparent; cursor: pointer; transition: all 0.3s;">
                        📦 백업 관리
                    </button>
                </div>

                <!-- 연결 설정 탭 -->
                <div class="tab-content" id="connection-tab">
                    <!-- 연결 상태 -->
                    <div style="background: ${isAuthenticated ? '#e8f5e8' : '#fff3cd'}; padding: 20px; border-radius: 12px; margin-bottom: 25px; border: 2px solid ${isAuthenticated ? '#4caf50' : '#ffc107'};">
                        <div style="display: flex; align-items: center; margin-bottom: 15px;">
                            <span style="font-size: 28px; margin-right: 15px;">${isAuthenticated ? '✅' : isConfigured ? '⚠️' : '❌'}</span>
                            <div>
                                <h3 style="margin: 0; color: #2c3e50; margin-bottom: 5px;">
                                    ${isAuthenticated ? '구글 드라이브 연결됨' : isConfigured ? 'API 설정 완료 - 연결 대기중' : '연결되지 않음'}
                                </h3>
                                <p style="margin: 0; color: #666; font-size: 14px;">
                                    ${isAuthenticated ? 
                                        '구글 드라이브가 성공적으로 연결되어 백업이 가능합니다.' :
                                        isConfigured ? 
                                        'API 설정이 완료되었습니다. 아래 연결 버튼을 클릭하여 인증을 완료하세요.' :
                                        'API 키와 클라이언트 ID를 설정한 후 구글 드라이브에 연결하세요.'
                                    }
                                </p>
                            </div>
                        </div>
                        
                        ${isAuthenticated ? `
                            <div style="display: flex; gap: 15px; margin-top: 15px;">
                                <button onclick="window.performQuickBackup()" 
                                        style="background: #27ae60; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 500;">
                                    📤 즉시 백업
                                </button>
                                <button onclick="window.testDriveConnection()" 
                                        style="background: #3498db; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 500;">
                                    🧪 연결 테스트
                                </button>
                                <button onclick="window.disconnectDrive()" 
                                        style="background: #e74c3c; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 500;">
                                    🔌 연결 해제
                                </button>
                            </div>
                        ` : isConfigured ? `
                            <div style="margin-top: 15px;">
                                <button onclick="window.connectToDrive()" 
                                        style="background: #27ae60; color: white; border: none; padding: 15px 30px; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600;">
                                    🔗 구글 드라이브 연결
                                </button>
                            </div>
                        ` : `
                            <div style="margin-top: 15px; padding: 15px; background: rgba(52, 152, 219, 0.1); border-radius: 8px;">
                                <p style="margin: 0; color: #2980b9; font-weight: 500; font-size: 14px;">
                                    💡 먼저 아래의 API 설정을 완료해주세요.
                                </p>
                            </div>
                        `}
                    </div>

                    ${!isAuthenticated ? `
                    <!-- API 설정 -->
                    <div style="margin-bottom: 30px;">
                        <h4 style="margin-bottom: 20px; color: #2c3e50; display: flex; align-items: center;">
                            <span style="margin-right: 10px;">🔑</span>
                            Google API 설정
                        </h4>
                        
                        <!-- 빠른 시작 가이드 -->
                        <details style="margin-bottom: 20px; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px;">
                            <summary style="cursor: pointer; font-weight: 500; color: #3498db; list-style: none;">
                                🚀 빠른 설정 가이드 (클릭하여 펼치기)
                            </summary>
                            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
                                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                                    <div style="display: flex; margin-bottom: 15px;">
                                        <div style="width: 30px; height: 30px; background: #3498db; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; margin-right: 15px;">1</div>
                                        <div style="flex: 1;">
                                            <strong>Google Cloud Console 접속</strong>
                                            <p style="margin: 5px 0 10px 0; color: #666; font-size: 14px;">프로젝트 생성 및 Drive API 활성화</p>
                                            <button onclick="window.open('https://console.cloud.google.com/', '_blank')" 
                                                    style="background: #4285f4; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px;">
                                                Console 열기
                                            </button>
                                        </div>
                                    </div>
                                    <div style="display: flex; margin-bottom: 15px;">
                                        <div style="width: 30px; height: 30px; background: #27ae60; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; margin-right: 15px;">2</div>
                                        <div style="flex: 1;">
                                            <strong>OAuth 2.0 클라이언트 ID 생성</strong>
                                            <p style="margin: 5px 0; color: #666; font-size: 14px;">웹 애플리케이션 유형으로 생성, 현재 도메인을 승인된 JavaScript 원본에 추가</p>
                                        </div>
                                    </div>
                                    <div style="display: flex;">
                                        <div style="width: 30px; height: 30px; background: #f39c12; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; margin-right: 15px;">3</div>
                                        <div style="flex: 1;">
                                            <strong>API 키 생성</strong>
                                            <p style="margin: 5px 0; color: #666; font-size: 14px;">브라우저 키로 생성 후 Drive API로 제한</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </details>
                        
                        <div class="form-group" style="margin-bottom: 20px; background: #f8f9fa; padding: 20px; border-radius: 12px; border: 2px solid #e0e0e0;">
                            <label style="display: block; margin-bottom: 10px; font-weight: 600; color: #2c3e50; font-size: 15px;">
                                🔑 클라이언트 ID <span style="color: #e74c3c; font-size: 12px;">*필수</span>
                            </label>
                            <div style="display: flex; gap: 10px; margin-bottom: 8px;">
                                <input type="text" id="clientId" 
                                       style="flex: 1; padding: 14px; border: 2px solid #bdc3c7; border-radius: 8px; font-size: 14px; font-family: monospace;" 
                                       placeholder="000000000000-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com"
                                       value="${CLIENT_ID === 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com' ? '' : CLIENT_ID}">
                                <button onclick="window.pasteFromClipboard('clientId')" 
                                        style="background: #95a5a6; color: white; border: none; padding: 14px 18px; border-radius: 8px; cursor: pointer; white-space: nowrap; font-weight: 500;">
                                    📋 붙여넣기
                                </button>
                            </div>
                            <small style="color: #7f8c8d; font-size: 12px;">OAuth 2.0 클라이언트 ID (웹 애플리케이션 유형)</small>
                        </div>

                        <div class="form-group" style="margin-bottom: 25px; background: #f8f9fa; padding: 20px; border-radius: 12px; border: 2px solid #e0e0e0;">
                            <label style="display: block; margin-bottom: 10px; font-weight: 600; color: #2c3e50; font-size: 15px;">
                                🗝️ API 키 <span style="color: #e74c3c; font-size: 12px;">*필수</span>
                            </label>
                            <div style="display: flex; gap: 10px; margin-bottom: 8px;">
                                <input type="password" id="apiKey" 
                                       style="flex: 1; padding: 14px; border: 2px solid #bdc3c7; border-radius: 8px; font-size: 14px; font-family: monospace;" 
                                       placeholder="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                                       value="${API_KEY === 'YOUR_API_KEY_HERE' ? '' : API_KEY}">
                                <button onclick="window.pasteFromClipboard('apiKey')" 
                                        style="background: #95a5a6; color: white; border: none; padding: 14px 18px; border-radius: 8px; cursor: pointer; white-space: nowrap; font-weight: 500;">
                                    📋 붙여넣기
                                </button>
                            </div>
                            <small style="color: #7f8c8d; font-size: 12px;">Google Drive API 키 (브라우저 키 권장)</small>
                        </div>

                        <!-- API 설정 테스트 및 저장 -->
                        <div style="text-align: center; margin-bottom: 25px;">
                            <button onclick="window.testAPISettings()" 
                                    style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; padding: 15px 35px; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600; margin-right: 15px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                                🧪 API 연결 테스트
                            </button>
                            <button onclick="window.saveAPISettings()" 
                                    style="background: linear-gradient(135deg, #27ae60, #2ecc71); color: white; border: none; padding: 15px 35px; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3);">
                                💾 설정 저장
                            </button>
                        </div>
                        
                        <div id="apiTestResult" style="padding: 15px; border-radius: 8px; font-size: 14px; font-weight: 500; display: none; margin-top: 15px;"></div>
                    </div>
                    ` : ''}
                </div>

                <!-- 자동 동기화 탭 -->
                <div class="tab-content" id="sync-tab" style="display: none;">
                    <!-- 동기화 상태 -->
                    <div style="background: ${autoSyncEnabled ? '#e8f5e8' : '#fff3cd'}; padding: 20px; border-radius: 12px; margin-bottom: 25px; border: 2px solid ${autoSyncEnabled ? '#4caf50' : '#ffc107'};">
                        <div style="display: flex; align-items: center; margin-bottom: 10px;">
                            <span style="font-size: 28px; margin-right: 15px;">${autoSyncEnabled ? '✅' : '⏸️'}</span>
                            <div>
                                <h3 style="margin: 0; color: #2c3e50; margin-bottom: 5px;">자동 동기화 ${autoSyncEnabled ? '활성화' : '비활성화'}</h3>
                                <p style="margin: 0; color: #666; font-size: 14px;">
                                    ${autoSyncEnabled ? 
                                        `메모 변경 시 자동으로 구글 드라이브에 백업됩니다. (${intervalMinutes}분 간격)` :
                                        '자동 동기화가 비활성화되어 있습니다. 수동으로 백업해야 합니다.'
                                    }
                                </p>
                                ${lastSyncTime > 0 ? `
                                    <div style="margin-top: 8px; font-size: 13px; color: #555; background: rgba(255,255,255,0.7); padding: 5px 10px; border-radius: 15px; display: inline-block;">
                                        <strong>마지막 동기화:</strong> ${new Date(lastSyncTime).toLocaleString('ko-KR')}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>

                    ${!isAuthenticated ? `
                        <div style="text-align: center; padding: 30px; background: #f8f9fa; border-radius: 12px; margin-bottom: 25px;">
                            <div style="font-size: 48px; margin-bottom: 15px;">🔗</div>
                            <h3 style="color: #2c3e50; margin-bottom: 10px;">먼저 구글 드라이브 연결이 필요합니다</h3>
                            <p style="color: #666; margin-bottom: 20px;">자동 동기화 기능을 사용하려면 먼저 '연결 설정' 탭에서 구글 드라이브를 연결해주세요.</p>
                            <button onclick="window.switchToTab('connection')" 
                                    style="background: #3498db; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 500;">
                                📡 연결 설정으로 이동
                            </button>
                        </div>
                    ` : `
                        <!-- 동기화 설정 -->
                        <div style="margin-bottom: 30px;">
                            <h4 style="margin-bottom: 20px; color: #2c3e50; display: flex; align-items: center;">
                                <span style="margin-right: 10px;">⚙️</span>
                                동기화 설정
                            </h4>
                            
                            <div style="margin-bottom: 25px;">
                                <label style="display: flex; align-items: center; cursor: pointer; padding: 20px; background: #f8f9fa; border-radius: 12px; border: 2px solid ${autoSyncEnabled ? '#27ae60' : '#e0e0e0'}; transition: all 0.3s;">
                                    <input type="checkbox" id="autoSyncEnabled" ${autoSyncEnabled ? 'checked' : ''} 
                                           style="margin-right: 20px; transform: scale(1.3);">
                                    <div>
                                        <div style="font-size: 16px; font-weight: 600; color: #2c3e50; margin-bottom: 5px;">🔄 자동 동기화 활성화</div>
                                        <div style="font-size: 14px; color: #666;">메모가 변경될 때 자동으로 구글 드라이브에 백업합니다</div>
                                    </div>
                                </label>
                            </div>

                            <div style="margin-bottom: 25px;">
                                <label style="display: block; margin-bottom: 12px; font-weight: 600; color: #2c3e50; font-size: 15px;">
                                    ⏱️ 동기화 간격
                                </label>
                                <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; border: 2px solid #e0e0e0;">
                                    <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 15px;">
                                        <input type="range" id="syncIntervalSlider" 
                                               min="1" max="60" value="${intervalMinutes}" 
                                               style="flex: 1; height: 8px; background: #ddd; border-radius: 4px; outline: none; -webkit-appearance: none;">
                                        <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 10px 20px; border-radius: 8px; min-width: 80px; text-align: center; font-weight: 600; font-size: 16px;" id="intervalDisplay">
                                            ${intervalMinutes}분
                                        </div>
                                    </div>
                                    <small style="color: #7f8c8d; font-size: 13px;">
                                        💡 변경 후 최소 대기 시간입니다. 너무 짧으면 Google API 제한에 걸릴 수 있습니다.
                                    </small>
                                </div>
                            </div>

                            <div style="margin-bottom: 25px;">
                                <label style="display: block; margin-bottom: 12px; font-weight: 600; color: #2c3e50; font-size: 15px;">
                                    📝 파일명 접두사 <small style="color: #7f8c8d; font-weight: normal;">(선택사항)</small>
                                </label>
                                <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; border: 2px solid #e0e0e0;">
                                    <div style="display: flex; gap: 12px; margin-bottom: 10px;">
                                        <input type="text" id="customFileNamePrefix" 
                                               value="${customFileName}" 
                                               placeholder="예: 내-달력-메모, 회사-업무-일정, 개인-일정-백업"
                                               style="flex: 1; padding: 14px; border: 2px solid #bdc3c7; border-radius: 8px; font-size: 14px;">
                                        <button onclick="window.previewSyncFileName()" 
                                                style="background: #3498db; color: white; border: none; padding: 14px 20px; border-radius: 8px; cursor: pointer; white-space: nowrap; font-weight: 500;">
                                            👁️ 미리보기
                                        </button>
                                    </div>
                                    <small style="color: #7f8c8d; font-size: 12px;">
                                        비어있으면 기본 형식을 사용합니다: "달력메모-변경-YYYY-MM-DD-HHMMSS.json"
                                    </small>
                                    <div id="fileNamePreview" style="margin-top: 12px; padding: 12px; background: white; border-radius: 6px; font-family: monospace; font-size: 13px; color: #2c3e50; display: none; border: 1px dashed #3498db;"></div>
                                </div>
                            </div>
                        </div>

                        <!-- 동기화 테스트 -->
                        <div style="background: #ecf0f1; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
                            <h4 style="margin-bottom: 20px; color: #2c3e50; display: flex; align-items: center;">
                                <span style="margin-right: 10px;">🧪</span>
                                동기화 테스트
                            </h4>
                            <div style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
                                <button onclick="window.testSyncConnection()" 
                                        style="background: #17a2b8; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; flex: 1; min-width: 140px;">
                                    🔍 연결 테스트
                                </button>
                                <button onclick="window.performTestSync()" 
                                        style="background: #28a745; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; flex: 1; min-width: 140px;">
                                    🚀 수동 동기화
                                </button>
                                <button onclick="window.viewSyncHistory()" 
                                        style="background: #6c757d; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; flex: 1; min-width: 140px;">
                                    📊 동기화 기록
                                </button>
                            </div>
                            <div id="syncTestResult" style="padding: 15px; border-radius: 8px; font-size: 14px; font-weight: 500; display: none;"></div>
                        </div>
                    `}
                </div>

                <!-- 백업 관리 탭 -->
                <div class="tab-content" id="backup-tab" style="display: none;">
                    ${!isAuthenticated ? `
                        <div style="text-align: center; padding: 30px; background: #f8f9fa; border-radius: 12px; margin-bottom: 25px;">
                            <div style="font-size: 48px; margin-bottom: 15px;">🔗</div>
                            <h3 style="color: #2c3e50; margin-bottom: 10px;">먼저 구글 드라이브 연결이 필요합니다</h3>
                            <p style="color: #666; margin-bottom: 20px;">백업 관리 기능을 사용하려면 먼저 '연결 설정' 탭에서 구글 드라이브를 연결해주세요.</p>
                            <button onclick="window.switchToTab('connection')" 
                                    style="background: #3498db; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 500;">
                                📡 연결 설정으로 이동
                            </button>
                        </div>
                    ` : `
                        <!-- 현재 메모 정보 -->
                        <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
                            <div style="display: flex; align-items: center; justify-content: space-between;">
                                <div>
                                    <h3 style="margin: 0 0 10px 0; font-size: 20px;">📊 현재 메모 상태</h3>
                                    <div style="font-size: 16px; opacity: 0.9;">
                                        <span id="currentMemoCount" style="font-weight: 600;">계산 중...</span>개의 메모가 저장되어 있습니다
                                    </div>
                                    ${lastSyncTime > 0 ? `
                                        <div style="font-size: 14px; opacity: 0.8; margin-top: 5px;">
                                            마지막 백업: ${new Date(lastSyncTime).toLocaleString('ko-KR')}
                                        </div>
                                    ` : `
                                        <div style="font-size: 14px; opacity: 0.8; margin-top: 5px;">
                                            아직 백업된 적이 없습니다
                                        </div>
                                    `}
                                </div>
                                <div style="font-size: 48px; opacity: 0.3;">📝</div>
                            </div>
                        </div>

                        <!-- 백업 액션 -->
                        <div style="margin-bottom: 30px;">
                            <h4 style="margin-bottom: 20px; color: #2c3e50; display: flex; align-items: center;">
                                <span style="margin-right: 10px;">📤</span>
                                백업 실행
                            </h4>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
                                <button onclick="window.performQuickBackup()" 
                                        style="background: linear-gradient(135deg, #27ae60, #2ecc71); color: white; border: none; padding: 20px; border-radius: 12px; cursor: pointer; text-align: left; transition: transform 0.2s; box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3);">
                                    <div style="font-size: 24px; margin-bottom: 8px;">⚡</div>
                                    <div style="font-weight: 600; font-size: 16px; margin-bottom: 5px;">즉시 백업</div>
                                    <div style="font-size: 13px; opacity: 0.9;">현재 메모를 즉시 백업합니다</div>
                                </button>
                                <button onclick="window.showCustomBackupModal()" 
                                        style="background: linear-gradient(135deg, #3498db, #2980b9); color: white; border: none; padding: 20px; border-radius: 12px; cursor: pointer; text-align: left; transition: transform 0.2s; box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);">
                                    <div style="font-size: 24px; margin-bottom: 8px;">📝</div>
                                    <div style="font-weight: 600; font-size: 16px; margin-bottom: 5px;">사용자 지정 백업</div>
                                    <div style="font-size: 13px; opacity: 0.9;">파일명을 직접 지정하여 백업</div>
                                </button>
                            </div>
                        </div>

                        <!-- 백업 복원 -->
                        <div style="margin-bottom: 25px;">
                            <h4 style="margin-bottom: 20px; color: #2c3e50; display: flex; align-items: center;">
                                <span style="margin-right: 10px;">📥</span>
                                백업 복원
                            </h4>
                            <div style="background: #fff5f5; border: 2px solid #e74c3c; border-radius: 12px; padding: 20px;">
                                <div style="display: flex; align-items: center; margin-bottom: 15px;">
                                    <span style="font-size: 24px; margin-right: 12px;">⚠️</span>
                                    <div>
                                        <div style="font-weight: 600; color: #c0392b; margin-bottom: 5px;">주의사항</div>
                                        <div style="color: #7f8c8d; font-size: 14px;">백업을 복원하면 현재의 모든 메모가 덮어쓰여집니다.</div>
                                    </div>
                                </div>
                                <button onclick="window.showRestoreModal()" 
                                        style="background: #e74c3c; color: white; border: none; padding: 15px 25px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 16px;">
                                    📥 백업에서 복원하기
                                </button>
                            </div>
                        </div>
                    `}
                </div>

                <!-- 하단 버튼 -->
                <div style="display: flex; gap: 15px; margin-top: 30px; padding-top: 25px; border-top: 2px solid #e0e0e0;">
                    <button onclick="window.saveUnifiedSettings()" 
                            style="flex: 1; background: linear-gradient(135deg, #27ae60, #2ecc71); color: white; border: none; padding: 18px; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3);">
                        💾 모든 설정 저장
                    </button>
                    <button onclick="window.closeModal()" 
                            style="background: #95a5a6; color: white; border: none; padding: 18px 30px; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 500;">
                        닫기
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'flex';

        // 이벤트 리스너 및 초기화
        setupUnifiedModalEvents();
        updateCurrentMemoCount();
    }

    /**
     * 통합 모달 이벤트 리스너 설정
     */
    function setupUnifiedModalEvents() {
        // 탭 전환 이벤트
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('data-tab');
                switchToTab(tabName);
            });
        });

        // 슬라이더 이벤트
        const slider = document.getElementById('syncIntervalSlider');
        const display = document.getElementById('intervalDisplay');
        
        if (slider && display) {
            slider.addEventListener('input', (e) => {
                const value = e.target.value;
                display.textContent = `${value}분`;
            });
        }

        // 체크박스 스타일링
        const autoSyncCheckbox = document.getElementById('autoSyncEnabled');
        if (autoSyncCheckbox) {
            const label = autoSyncCheckbox.closest('label');
            if (label) {
                autoSyncCheckbox.addEventListener('change', () => {
                    if (autoSyncCheckbox.checked) {
                        label.style.borderColor = '#27ae60';
                        label.style.background = '#f8fff8';
                    } else {
                        label.style.borderColor = '#e0e0e0';
                        label.style.background = '#f8f9fa';
                    }
                });
            }
        }
    }

    /**
     * 현재 메모 개수 업데이트
     */
    function updateCurrentMemoCount() {
        setTimeout(() => {
            const memos = JSON.parse(localStorage.getItem('calendarMemos') || '{}');
            const count = Object.keys(memos).length;
            const countEl = document.getElementById('currentMemoCount');
            if (countEl) {
                countEl.textContent = count;
            }
        }, 100);
    }

    /**
     * 탭 전환 함수
     */
    window.switchToTab = function(tabName) {
        // 모든 탭 버튼 비활성화
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.style.color = '#666';
            btn.style.borderBottom = '3px solid transparent';
        });

        // 모든 탭 내용 숨기기
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            content.style.display = 'none';
        });

        // 선택된 탭 활성화
        const selectedBtn = document.querySelector(`[data-tab="${tabName}"]`);
        const selectedContent = document.getElementById(`${tabName}-tab`);
        
        if (selectedBtn) {
            selectedBtn.style.color = '#3498db';
            selectedBtn.style.borderBottom = '3px solid #3498db';
        }
        
        if (selectedContent) {
            selectedContent.style.display = 'block';
        }
    };

    /**
     * 통합 모달 생성
     */
    function createUnifiedModal(title) {
        // 기존 모달들 제거
        const existingModals = document.querySelectorAll('.unified-modal, .sync-modal, .drive-modal, .modal, [class*="modal"]');
        existingModals.forEach(modal => modal.remove());
        
        const modal = document.createElement('div');
        modal.className = 'unified-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(2px);
        `;

        // 백드롭 클릭 및 ESC 키 이벤트
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                window.closeModal();
            }
        });

        const handleEsc = function(e) {
            if (e.key === 'Escape') {
                window.closeModal();
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);

        const content = document.createElement('div');
        content.className = 'modal-content';
        content.style.cssText = `
            background: white;
            padding: 0;
            border-radius: 16px;
            max-width: 900px;
            max-height: 90vh;
            width: 95%;
            overflow: hidden;
            position: relative;
            display: flex;
            flex-direction: column;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        `;

        const header = document.createElement('div');
        header.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 25px;
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: 16px 16px 0 0;
        `;
        
        header.innerHTML = `
            <h2 style="margin: 0; font-size: 22px; font-weight: 700; display: flex; align-items: center;">
                ${title}
            </h2>
            <button onclick="window.closeModal()" style="background: rgba(255,255,255,0.2); border: none; color: white; font-size: 24px; cursor: pointer; padding: 8px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.3)'; this.style.transform='scale(1.1)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'; this.style.transform='scale(1)'">×</button>
        `;
        
        const body = document.createElement('div');
        body.className = 'modal-body';
        body.style.cssText = `
            padding: 0;
            overflow-y: auto;
            max-height: calc(90vh - 100px);
        `;

        content.appendChild(header);
        content.appendChild(body);
        modal.appendChild(content);

        return modal;
    }

    // 전역 함수로 노출
    window.showUnifiedCloudModal = showUnifiedCloudModal;

    // 기존 개별 모달 함수들을 통합 모달로 리다이렉션
    window.showCloudSettingsModal = showUnifiedCloudModal;
    window.showSyncSettingsModal = showUnifiedCloudModal;
    
    // 드라이브 버튼도 통합 모달로 연결
    setTimeout(() => {
        const driveBtn = document.getElementById('driveBtn');
        if (driveBtn) {
            driveBtn.onclick = showUnifiedCloudModal;
            driveBtn.textContent = '☁️ 클라우드 설정';
        }
    }, 1000);

    /**
     * API 설정 테스트
     */
    window.testAPISettings = async function() {
        const clientId = document.getElementById('clientId').value.trim();
        const apiKey = document.getElementById('apiKey').value.trim();
        const resultDiv = document.getElementById('apiTestResult');

        if (!clientId || !apiKey) {
            showTestResult('클라이언트 ID와 API 키를 모두 입력해주세요.', 'error', 'apiTestResult');
            return;
        }

        showTestResult('API 연결 테스트 중...', 'info', 'apiTestResult');

        try {
            // 기본 형식 검증
            if (!clientId.includes('.apps.googleusercontent.com')) {
                throw new Error('올바르지 않은 클라이언트 ID 형식입니다.');
            }

            if (!apiKey.startsWith('AIza') || apiKey.length < 30) {
                throw new Error('올바르지 않은 API 키 형식입니다.');
            }

            // API 테스트
            const testUrl = `https://www.googleapis.com/drive/v3/about?fields=user&key=${apiKey}`;
            
            try {
                const response = await fetch(testUrl);
                const data = await response.json();
                
                if (response.ok) {
                    showTestResult('✅ API 연결 성공! 설정을 저장하고 구글 드라이브에 연결하세요.', 'success', 'apiTestResult');
                } else if (data.error) {
                    if (data.error.code === 403) {
                        showTestResult('⚠️ API 키는 유효하지만 Drive API가 활성화되지 않았습니다.', 'error', 'apiTestResult');
                    } else {
                        showTestResult(`❌ API 오류: ${data.error.message}`, 'error', 'apiTestResult');
                    }
                }
            } catch (fetchErr) {
                showTestResult('✅ 기본 형식 검증 통과! 설정을 저장한 후 연결을 테스트하세요.', 'success', 'apiTestResult');
            }
            
        } catch (err) {
            showTestResult(`❌ 테스트 실패: ${err.message}`, 'error', 'apiTestResult');
        }
    };

    /**
     * API 설정 저장
     */
    window.saveAPISettings = function() {
        const clientId = document.getElementById('clientId').value.trim();
        const apiKey = document.getElementById('apiKey').value.trim();

        if (!clientId || !apiKey) {
            showTestResult('클라이언트 ID와 API 키를 모두 입력해주세요.', 'error', 'apiTestResult');
            return;
        }

        localStorage.setItem('googleDriveClientId', clientId);
        localStorage.setItem('googleDriveApiKey', apiKey);

        window.CLIENT_ID = clientId;
        window.API_KEY = apiKey;

        showTestResult('✅ 설정이 저장되었습니다. 페이지를 새로고침하여 적용하세요.', 'success', 'apiTestResult');
        
        setTimeout(() => {
            if (confirm('설정을 적용하려면 페이지를 새로고침해야 합니다. 지금 새로고침 하시겠습니까?')) {
                location.reload();
            }
        }, 2000);
    };

    /**
     * 구글 드라이브 연결
     */
    window.connectToDrive = function() {
        if (typeof window.handleAuthClick === 'function') {
            window.handleAuthClick();
        } else {
            showTestResult('구글 드라이브 연결 함수를 찾을 수 없습니다. 페이지를 새로고침해주세요.', 'error', 'apiTestResult');
        }
    };

    /**
     * 구글 드라이브 연결 해제
     */
    window.disconnectDrive = function() {
        if (typeof window.handleSignoutClick === 'function') {
            if (confirm('구글 드라이브 연결을 해제하시겠습니까?')) {
                window.handleSignoutClick();
                setTimeout(() => {
                    window.closeModal();
                }, 1000);
            }
        } else {
            showTestResult('연결 해제 함수를 찾을 수 없습니다.', 'error', 'apiTestResult');
        }
    };

    /**
     * 드라이브 연결 테스트
     */
    window.testDriveConnection = async function() {
        showTestResult('구글 드라이브 연결 테스트 중...', 'info', 'apiTestResult');
        
        try {
            if (!window.isAuthenticated) {
                throw new Error('구글 드라이브가 연결되지 않았습니다.');
            }
            
            if (typeof gapi !== 'undefined' && gapi.client) {
                await gapi.client.drive.about.get({ fields: 'user' });
            }
            
            showTestResult('✅ 구글 드라이브 연결이 정상적으로 작동합니다!', 'success', 'apiTestResult');
            
        } catch (error) {
            showTestResult('❌ 연결 테스트 실패: ' + error.message, 'error', 'apiTestResult');
        }
    };

    /**
     * 즉시 백업 실행
     */
    window.performQuickBackup = async function() {
        try {
            if (typeof window.backupCalendarMemos === 'function') {
                await window.backupCalendarMemos();
                showTestResult('✅ 즉시 백업이 완료되었습니다!', 'success', 'syncTestResult');
            } else {
                throw new Error('백업 함수를 찾을 수 없습니다.');
            }
        } catch (error) {
            showTestResult('❌ 백업 실패: ' + error.message, 'error', 'syncTestResult');
        }
    };

    /**
     * 복원 모달 표시
     */
    window.showRestoreModal = function() {
        if (typeof window.restoreCalendarMemos === 'function') {
            window.restoreCalendarMemos();
        } else {
            showTestResult('복원 함수를 찾을 수 없습니다.', 'error', 'syncTestResult');
        }
    };

    /**
     * 동기화 파일명 미리보기
     */
    window.previewSyncFileName = function() {
        const prefix = document.getElementById('customFileNamePrefix').value.trim();
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '');
        
        let preview;
        if (prefix) {
            preview = `${prefix}-${dateStr}-${timeStr}.json`;
        } else {
            preview = `달력메모-수정-${dateStr}-${timeStr}.json`;
        }
        
        const previewDiv = document.getElementById('fileNamePreview');
        if (previewDiv) {
            previewDiv.innerHTML = `<strong>미리보기:</strong> ${preview}`;
            previewDiv.style.display = 'block';
            
            setTimeout(() => {
                previewDiv.style.display = 'none';
            }, 5000);
        }
    };

    /**
     * 통합 설정 저장
     */
    window.saveUnifiedSettings = function() {
        try {
            // 자동 동기화 설정 저장
            const autoSyncCheckbox = document.getElementById('autoSyncEnabled');
            const intervalSlider = document.getElementById('syncIntervalSlider');
            const customPrefix = document.getElementById('customFileNamePrefix');
            
            const autoSyncSystem = window.autoSyncSystem;
            if (autoSyncSystem && autoSyncCheckbox && intervalSlider && customPrefix) {
                const enabled = autoSyncCheckbox.checked;
                const interval = parseInt(intervalSlider.value);
                const prefix = customPrefix.value.trim();
                
                autoSyncSystem.toggle(enabled);
                autoSyncSystem.setSyncInterval(interval);
                autoSyncSystem.setCustomFileName(prefix);
                
                showTestResult('✅ 자동 동기화 설정이 저장되었습니다!', 'success', 'syncTestResult');
            }

            // API 설정이 있으면 저장
            const clientIdInput = document.getElementById('clientId');
            const apiKeyInput = document.getElementById('apiKey');
            
            if (clientIdInput && apiKeyInput) {
                const clientId = clientIdInput.value.trim();
                const apiKey = apiKeyInput.value.trim();
                
                if (clientId && apiKey) {
                    localStorage.setItem('googleDriveClientId', clientId);
                    localStorage.setItem('googleDriveApiKey', apiKey);
                    window.CLIENT_ID = clientId;
                    window.API_KEY = apiKey;
                }
            }
            
            setTimeout(() => {
                window.closeModal();
            }, 1500);
            
        } catch (error) {
            console.error('설정 저장 실패:', error);
            showTestResult('설정 저장 실패: ' + error.message, 'error', 'syncTestResult');
        }
    };

    /**
     * 테스트 결과 표시 함수
     */
    function showTestResult(message, type, elementId) {
        const testResult = document.getElementById(elementId);
        if (!testResult) return;
        
        testResult.style.display = 'block';
        testResult.textContent = message;
        testResult.className = `test-result ${type}`;
        
        const colors = {
            success: { background: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' },
            error: { background: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' },
            info: { background: '#d1ecf1', color: '#0c5460', border: '1px solid #bee5eb' }
        };
        
        const color = colors[type] || colors.info;
        Object.assign(testResult.style, color);
        testResult.style.borderRadius = '8px';
        testResult.style.padding = '12px 15px';
    }

    /**
     * 클립보드에서 붙여넣기 (재사용)
     */
    window.pasteFromClipboard = async function(inputId) {
        try {
            const text = await navigator.clipboard.readText();
            const input = document.getElementById(inputId);
            if (input) {
                input.value = text;
                showTestResult('붙여넣기 완료!', 'success', 'apiTestResult');
            }
        } catch (err) {
            try {
                const input = document.getElementById(inputId);
                if (input) {
                    input.focus();
                    input.select();
                    document.execCommand('paste');
                }
            } catch (fallbackErr) {
                showTestResult('클립보드 접근 권한이 필요합니다. Ctrl+V를 사용해주세요.', 'info', 'apiTestResult');
            }
        }
    };

    // 동기화 테스트 함수들 (기존 함수 재사용)
    if (!window.testSyncConnection) {
        window.testSyncConnection = async function() {
            showTestResult('연결 테스트 중...', 'info', 'syncTestResult');
            
            try {
                if (!window.isAuthenticated) {
                    throw new Error('구글 드라이브가 연결되지 않았습니다.');
                }
                
                if (typeof window.uploadBackupWithCustomName !== 'function') {
                    throw new Error('업로드 함수를 찾을 수 없습니다.');
                }
                
                if (typeof gapi !== 'undefined' && gapi.client) {
                    await gapi.client.drive.about.get({ fields: 'user' });
                }
                
                showTestResult('✅ 동기화 시스템이 정상적으로 작동합니다!', 'success', 'syncTestResult');
                
            } catch (error) {
                showTestResult('❌ 연결 테스트 실패: ' + error.message, 'error', 'syncTestResult');
            }
        };
    }

    if (!window.performTestSync) {
        window.performTestSync = async function() {
            const autoSyncSystem = window.autoSyncSystem;
            if (!autoSyncSystem) {
                showTestResult('자동 동기화 시스템을 찾을 수 없습니다.', 'error', 'syncTestResult');
                return;
            }
            
            try {
                showTestResult('수동 동기화 실행 중...', 'info', 'syncTestResult');
                await autoSyncSystem.performManualSync('테스트-동기화');
                showTestResult('✅ 수동 동기화 완료!', 'success', 'syncTestResult');
            } catch (error) {
                showTestResult('❌ 수동 동기화 실패: ' + error.message, 'error', 'syncTestResult');
            }
        };
    }

    if (!window.viewSyncHistory) {
        window.viewSyncHistory = function() {
            const lastSync = window.autoSyncSystem ? window.autoSyncSystem.getLastSyncTime() : 0;
            const historyText = lastSync > 0 ? 
                `마지막 동기화: ${new Date(lastSync).toLocaleString('ko-KR')}` :
                '동기화 기록이 없습니다.';
                
            showTestResult(historyText, 'info', 'syncTestResult');
        };
    }

})();