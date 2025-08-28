// 자동 동기화 시스템
(function() {
    'use strict';

    // 동기화 설정
    let autoSyncEnabled = JSON.parse(localStorage.getItem('autoSyncEnabled') || 'false');
    let syncInterval = parseInt(localStorage.getItem('syncInterval') || '300000'); // 기본 5분
    let lastSyncTime = parseInt(localStorage.getItem('lastSyncTime') || '0');
    let customFileName = localStorage.getItem('customFileName') || '';
    let syncIntervalId = null;
    let dataChangeTimer = null;
    
    // 중복 방지를 위한 변수들
    let currentSyncPromise = null; // 현재 진행 중인 동기화 Promise
    let pendingSync = null; // 대기 중인 동기화 요청
    let syncDebounceTimer = null; // 디바운스 타이머
    let lastSyncedDataHash = null; // 마지막 동기화된 데이터 해시
    let lastChangeDetectionTime = 0; // 마지막 변경 감지 시간

    // 원본 localStorage 메서드 백업
    const originalSetItem = localStorage.setItem;
    const originalRemoveItem = localStorage.removeItem;
    const originalClear = localStorage.clear;

    /**
     * 데이터 해시 생성 (간단한 해시)
     */
    function generateDataHash(data) {
        const str = typeof data === 'string' ? data : JSON.stringify(data);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 32비트 정수로 변환
        }
        return hash.toString();
    }

    /**
     * 현재 메모 데이터의 해시 계산
     */
    function getCurrentDataHash() {
        const memos = localStorage.getItem('calendarMemos') || '{}';
        return generateDataHash(memos);
    }

    /**
     * localStorage 변경 감지 시스템
     */
    function setupLocalStorageMonitoring() {
        // setItem 오버라이드
        localStorage.setItem = function(key, value) {
            const oldValue = localStorage.getItem(key);
            const result = originalSetItem.apply(this, arguments);
            
            // 메모 관련 데이터 변경 감지
            if (key === 'calendarMemos' || key.startsWith('memos_')) {
                if (oldValue !== value) {
                    handleDataChange('modified', key, { oldValue, newValue: value });
                }
            }
            
            return result;
        };

        // removeItem 오버라이드
        localStorage.removeItem = function(key) {
            const oldValue = localStorage.getItem(key);
            const result = originalRemoveItem.apply(this, arguments);
            
            if (key === 'calendarMemos' || key.startsWith('memos_')) {
                if (oldValue !== null) {
                    handleDataChange('removed', key, { oldValue });
                }
            }
            
            return result;
        };

        // clear 오버라이드 (전체 삭제 시)
        localStorage.clear = function() {
            const memoKeys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key === 'calendarMemos' || key.startsWith('memos_')) {
                    memoKeys.push(key);
                }
            }
            
            const result = originalClear.apply(this, arguments);
            
            if (memoKeys.length > 0) {
                handleDataChange('cleared', null, { clearedKeys: memoKeys });
            }
            
            return result;
        };
    }

    /**
     * 데이터 변경 처리 (강화된 중복 방지)
     */
    function handleDataChange(type, key, data) {
        const now = Date.now();
        console.log(`📝 메모 데이터 변경 감지: ${type}`, { key, data, timestamp: new Date(now).toLocaleTimeString() });
        
        if (!autoSyncEnabled) {
            console.log('자동 동기화가 비활성화되어 있습니다.');
            return;
        }

        // 현재 데이터 해시 계산
        const currentDataHash = getCurrentDataHash();
        
        // 데이터가 실제로 변경되지 않았으면 무시
        if (lastSyncedDataHash && currentDataHash === lastSyncedDataHash) {
            console.log('🚫 데이터 내용이 변경되지 않음 - 동기화 생략');
            return;
        }

        // 너무 짧은 시간 내 중복 호출 방지 (1초 이내)
        if (now - lastChangeDetectionTime < 1000) {
            console.log(`🚫 너무 짧은 간격의 변경 감지 (${now - lastChangeDetectionTime}ms) - 무시`);
            return;
        }
        
        lastChangeDetectionTime = now;

        // 현재 동기화 진행 중이면 대기열에 추가
        if (currentSyncPromise) {
            console.log('🔄 동기화 진행 중 - 대기열에 최신 요청으로 갱신');
            pendingSync = { type, key, data, hash: currentDataHash, timestamp: now };
            return;
        }

        // 기존 디바운스 타이머 클리어
        if (syncDebounceTimer) {
            clearTimeout(syncDebounceTimer);
            console.log('⏰ 기존 디바운스 타이머 클리어');
        }

        // 3초 디바운스 (연속 변경 시 마지막 변경만 처리)
        syncDebounceTimer = setTimeout(() => {
            // 다시 한 번 데이터 변경 확인
            const finalDataHash = getCurrentDataHash();
            if (lastSyncedDataHash && finalDataHash === lastSyncedDataHash) {
                console.log('🚫 최종 확인: 데이터가 변경되지 않음 - 동기화 취소');
                return;
            }
            
            console.log(`🚀 디바운스 완료 - 동기화 실행 (해시: ${finalDataHash})`);
            performAutoSyncSafe(type, key, finalDataHash);
        }, 3000);
        
        console.log(`⏰ 3초 디바운스 타이머 시작 (해시: ${currentDataHash})`);
    }

    /**
     * 안전한 자동 동기화 실행 (중복 방지)
     */
    async function performAutoSyncSafe(changeType, changedKey, dataHash = null) {
        // 이미 진행 중인 동기화가 있으면 대기열에 추가
        if (currentSyncPromise) {
            console.log('🔄 동기화 진행 중 - 새 요청을 대기열에 추가');
            const currentDataHash = dataHash || getCurrentDataHash();
            pendingSync = { type: changeType, key: changedKey, hash: currentDataHash, timestamp: Date.now() };
            return;
        }

        try {
            // 최종 데이터 변경 확인
            const finalDataHash = dataHash || getCurrentDataHash();
            if (lastSyncedDataHash && finalDataHash === lastSyncedDataHash) {
                console.log('🚫 동기화 시작 전 최종 확인: 데이터 변경 없음 - 취소');
                return;
            }

            console.log(`🚀 동기화 시작 - 데이터 해시: ${finalDataHash}`);
            
            // 동기화 시작
            currentSyncPromise = performAutoSync(changeType, changedKey);
            await currentSyncPromise;
            
            // 동기화 성공 시 해시 업데이트
            lastSyncedDataHash = finalDataHash;
            console.log(`✅ 동기화 성공 - 해시 업데이트: ${finalDataHash}`);
            
            // 동기화 완료 후 대기 중인 요청이 있으면 처리
            if (pendingSync) {
                console.log('🔄 대기 중인 동기화 요청 처리 중...');
                const pending = pendingSync;
                pendingSync = null; // 먼저 클리어
                
                // 대기 중인 요청의 데이터가 현재와 다른지 확인
                const currentDataHash = getCurrentDataHash();
                if (pending.hash !== currentDataHash) {
                    console.log(`🔄 대기 요청 데이터 변경 감지 (${pending.hash} → ${currentDataHash}) - 3초 후 실행`);
                    setTimeout(() => {
                        performAutoSyncSafe(pending.type, pending.key, currentDataHash);
                    }, 3000);
                } else {
                    console.log('🚫 대기 요청과 현재 데이터가 동일 - 스킵');
                }
            }
            
        } catch (error) {
            console.error('안전한 동기화 실행 실패:', error);
        } finally {
            currentSyncPromise = null;
        }
    }

    /**
     * 자동 동기화 실행 (재시도 로직 포함)
     */
    async function performAutoSync(changeType, changedKey, retryCount = 0) {
        const maxRetries = 3;
        const retryDelay = 2000; // 2초
        
        try {
            const retryText = retryCount > 0 ? ` (재시도 ${retryCount}/${maxRetries})` : '';
            console.log(`🔄 자동 동기화 시작...${retryText}`);
            
            // 상태 인디케이터 업데이트
            if (typeof window.updateSyncStatus === 'function') {
                const statusText = retryCount > 0 ? `동기화 재시도 중 (${retryCount}/${maxRetries})` : '동기화 중';
                window.updateSyncStatus('syncing', statusText);
            }
            window.isCurrentlySyncing = true;
            
            // 구글 드라이브 연결 상태 확인 (강화된 확인)
            const hasAccessToken = localStorage.getItem('googleDriveAccessToken') || localStorage.getItem('googleAccessToken');
            const hasTokenData = localStorage.getItem('googleDriveToken');
            const hasGapiToken = typeof gapi !== 'undefined' && gapi.client && gapi.client.getToken();
            const isWindowAuthenticated = window.isAuthenticated;
            
            // 토큰이 있는지 다중 검증
            const hasValidToken = hasAccessToken || hasTokenData || hasGapiToken;
            const isConnected = isWindowAuthenticated || hasValidToken;
            
            console.log('🔍 동기화 연결 상태 상세:', {
                isWindowAuthenticated,
                hasAccessToken: !!hasAccessToken,
                hasTokenData: !!hasTokenData,
                hasGapiToken: !!hasGapiToken,
                isConnected,
                hasUploadFunction: typeof window.uploadBackupWithCustomName === 'function'
            });
            
            if (!isConnected || typeof window.uploadBackupWithCustomName !== 'function') {
                console.log('❌ 구글 드라이브가 연결되지 않았거나 업로드 함수가 없습니다.');
                
                let errorMessage = '자동 동기화 실패: ';
                if (!isConnected) {
                    errorMessage += '구글 드라이브 연결 필요';
                } else {
                    errorMessage += '백업 함수 로드 오류';
                }
                
                showNotification(errorMessage, 'error');
                
                // 상태 인디케이터 업데이트
                if (typeof window.updateSyncStatus === 'function') {
                    window.updateSyncStatus('error', '연결 필요');
                }
                window.isCurrentlySyncing = false;
                return;
            }

            // 파일명 생성
            const fileName = generateSyncFileName(changeType, changedKey);
            
            // 자동 백업 실행
            const result = await window.uploadBackupWithCustomName(fileName, true); // silent 모드
            
            if (result) {
                lastSyncTime = Date.now();
                localStorage.setItem('lastSyncTime', lastSyncTime.toString());
                console.log('✅ 자동 동기화 완료:', fileName);
                
                // 조용한 알림
                showNotification(`☁️ 자동 동기화 완료: ${fileName}`, 'success', 2000);
                
                // 동기화 상태 UI 업데이트
                updateSyncStatusUI();
                
                // 상태 인디케이터 업데이트
                if (typeof window.updateSyncStatus === 'function') {
                    window.updateSyncStatus('synced', '동기화됨', '방금 전');
                }
            }
            
        } catch (error) {
            console.error(`❌ 자동 동기화 실패 (시도 ${retryCount + 1}/${maxRetries + 1}):`, error);
            
            // 재시도 가능한 오류인지 확인
            const isRetryableError = 
                error.message.includes('네트워크') ||
                error.message.includes('network') ||
                error.message.includes('timeout') ||
                error.message.includes('503') ||
                error.message.includes('502') ||
                error.message.includes('500') ||
                (error.status >= 500 && error.status < 600);
            
            // 재시도 로직
            if (retryCount < maxRetries && isRetryableError) {
                console.log(`🔄 ${retryDelay/1000}초 후 재시도 예정... (${retryCount + 1}/${maxRetries})`);
                
                // 상태 인디케이터 업데이트
                if (typeof window.updateSyncStatus === 'function') {
                    window.updateSyncStatus('retrying', '재시도 대기중', `${retryDelay/1000}초 후`);
                }
                
                // 지연 후 재시도
                setTimeout(() => {
                    performAutoSync(changeType, changedKey, retryCount + 1);
                }, retryDelay);
                
                return; // finally 블록으로 가지 않고 여기서 종료
            }
            
            // 최종 실패
            const finalError = retryCount > 0 
                ? `자동 동기화 최종 실패 (${retryCount + 1}회 시도): ${error.message}`
                : `자동 동기화 실패: ${error.message}`;
                
            showNotification(finalError, 'error');
            
            // 상태 인디케이터 업데이트
            if (typeof window.updateSyncStatus === 'function') {
                const errorStatus = retryCount > 0 
                    ? `${retryCount + 1}회 시도 후 실패`
                    : '동기화 실패';
                window.updateSyncStatus('error', errorStatus, error.message);
            }
        } finally {
            // 재시도 중이 아닐 때만 동기화 상태 해제
            if (retryCount >= maxRetries || !window.isCurrentlySyncing) {
                window.isCurrentlySyncing = false;
            }
        }
    }

    /**
     * 동기화 파일명 생성
     */
    function generateSyncFileName(changeType, changedKey) {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
        const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, ''); // HHMMSS
        
        // 사용자 지정 파일명이 있으면 사용
        if (customFileName.trim()) {
            return `${customFileName}-${dateStr}-${timeStr}.json`;
        }
        
        // 기본 파일명 패턴
        const changeTypeKr = {
            'modified': '수정',
            'removed': '삭제',
            'cleared': '전체삭제',
            'manual': '수동'
        }[changeType] || '변경';
        
        return `달력메모-${changeTypeKr}-${dateStr}-${timeStr}.json`;
    }

    /**
     * 정기 동기화 시작
     */
    function startPeriodicSync() {
        if (syncIntervalId) {
            clearInterval(syncIntervalId);
        }
        
        if (autoSyncEnabled && syncInterval > 0) {
            syncIntervalId = setInterval(() => {
                const timeSinceLastSync = Date.now() - lastSyncTime;
                
                // 마지막 동기화 후 설정된 간격이 지났고 현재 동기화 중이 아니면 실행
                if (timeSinceLastSync >= syncInterval && !currentSyncPromise) {
                    performAutoSyncSafe('periodic', null);
                }
            }, Math.min(syncInterval, 60000)); // 최대 1분마다 체크
            
            console.log(`🔄 정기 동기화 시작: ${syncInterval / 1000}초 간격`);
        }
    }

    /**
     * 정기 동기화 중지
     */
    function stopPeriodicSync() {
        if (syncIntervalId) {
            clearInterval(syncIntervalId);
            syncIntervalId = null;
            console.log('🔄 정기 동기화 중지');
        }
    }

    /**
     * 자동 동기화 활성화/비활성화
     */
    function toggleAutoSync(enabled) {
        autoSyncEnabled = enabled;
        localStorage.setItem('autoSyncEnabled', JSON.stringify(enabled));
        
        if (enabled) {
            startPeriodicSync();
            showNotification('자동 동기화가 활성화되었습니다.', 'success');
        } else {
            stopPeriodicSync();
            showNotification('자동 동기화가 비활성화되었습니다.', 'info');
        }
        
        updateSyncStatusUI();
    }

    /**
     * 동기화 간격 설정
     */
    function setSyncInterval(intervalMinutes) {
        syncInterval = intervalMinutes * 60 * 1000; // 분을 밀리초로 변환
        localStorage.setItem('syncInterval', syncInterval.toString());
        
        if (autoSyncEnabled) {
            startPeriodicSync(); // 새로운 간격으로 재시작
        }
        
        console.log(`동기화 간격 설정: ${intervalMinutes}분`);
    }

    /**
     * 사용자 지정 파일명 설정
     */
    function setCustomFileName(fileName) {
        customFileName = fileName.trim();
        localStorage.setItem('customFileName', customFileName);
        console.log('사용자 지정 파일명:', customFileName);
    }

    /**
     * 동기화 상태 UI 업데이트
     */
    function updateSyncStatusUI() {
        // 동기화 상태 표시 요소들 업데이트
        const statusElements = document.querySelectorAll('.sync-status');
        const enabledElements = document.querySelectorAll('.sync-enabled-indicator');
        const lastSyncElements = document.querySelectorAll('.last-sync-time');
        
        const statusText = autoSyncEnabled ? '활성화' : '비활성화';
        const statusColor = autoSyncEnabled ? '#4caf50' : '#f44336';
        const lastSyncText = lastSyncTime > 0 ? 
            `마지막 동기화: ${new Date(lastSyncTime).toLocaleString('ko-KR')}` : 
            '아직 동기화되지 않음';
        
        statusElements.forEach(el => {
            el.textContent = statusText;
            el.style.color = statusColor;
        });
        
        enabledElements.forEach(el => {
            el.style.display = autoSyncEnabled ? 'inline' : 'none';
        });
        
        lastSyncElements.forEach(el => {
            el.textContent = lastSyncText;
        });
    }

    /**
     * 조용한 알림 표시
     */
    function showNotification(message, type = 'info', duration = 3000) {
        // 기존 알림이 있다면 제거
        const existing = document.querySelector('.auto-sync-notification');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.className = `auto-sync-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-size: 14px;
            font-weight: 500;
            z-index: 10000;
            max-width: 350px;
            word-wrap: break-word;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        // 타입별 배경색
        const colors = {
            success: '#4caf50',
            error: '#f44336',
            info: '#2196f3',
            warning: '#ff9800'
        };
        notification.style.background = colors[type] || colors.info;
        
        // 애니메이션 CSS 추가
        if (!document.querySelector('#auto-sync-notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'auto-sync-notification-styles';
            styles.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(notification);
        
        // 자동 제거
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideIn 0.3s ease reverse';
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);
    }

    /**
     * 수동 동기화 실행 (중복 방지)
     */
    async function performManualSync(fileName = '') {
        // 이미 동기화 진행 중이면 중단
        if (currentSyncPromise) {
            showNotification('❌ 동기화가 이미 진행 중입니다. 잠시 후 다시 시도해주세요.', 'warning');
            return false;
        }
        
        try {
            showNotification('수동 동기화 시작...', 'info');
            
            // 상태 인디케이터 업데이트
            if (typeof window.updateSyncStatus === 'function') {
                window.updateSyncStatus('syncing', '수동 동기화 중');
            }
            window.isCurrentlySyncing = true;
            
            // 구글 드라이브 연결 상태 확인 (강화된 확인)
            const hasAccessToken = localStorage.getItem('googleDriveAccessToken') || localStorage.getItem('googleAccessToken');
            const hasTokenData = localStorage.getItem('googleDriveToken');
            const hasGapiToken = typeof gapi !== 'undefined' && gapi.client && gapi.client.getToken();
            const isWindowAuthenticated = window.isAuthenticated;
            
            // 토큰이 있는지 다중 검증
            const hasValidToken = hasAccessToken || hasTokenData || hasGapiToken;
            const isConnected = isWindowAuthenticated || hasValidToken;
            
            console.log('🔍 수동 동기화 연결 상태 상세:', {
                isWindowAuthenticated,
                hasAccessToken: !!hasAccessToken,
                hasTokenData: !!hasTokenData,
                hasGapiToken: !!hasGapiToken,
                isConnected,
                hasUploadFunction: typeof window.uploadBackupWithCustomName === 'function'
            });
            
            if (!isConnected || typeof window.uploadBackupWithCustomName !== 'function') {
                let errorMessage = '구글 드라이브가 연결되지 않았습니다.';
                if (!isConnected) {
                    errorMessage = '구글 드라이브에 로그인이 필요합니다.';
                } else if (typeof window.uploadBackupWithCustomName !== 'function') {
                    errorMessage = '백업 함수가 로드되지 않았습니다.';
                }
                throw new Error(errorMessage);
            }
            
            const syncFileName = fileName || generateSyncFileName('manual', null);
            const result = await window.uploadBackupWithCustomName(syncFileName, false);
            
            if (result) {
                lastSyncTime = Date.now();
                localStorage.setItem('lastSyncTime', lastSyncTime.toString());
                showNotification('수동 동기화 완료!', 'success');
                updateSyncStatusUI();
                
                // 상태 인디케이터 업데이트
                if (typeof window.updateSyncStatus === 'function') {
                    window.updateSyncStatus('synced', '동기화됨', '방금 전');
                }
            }
            
            return result;
            
        } catch (error) {
            console.error('수동 동기화 실패:', error);
            showNotification('수동 동기화 실패: ' + error.message, 'error');
            
            // 상태 인디케이터 업데이트
            if (typeof window.updateSyncStatus === 'function') {
                window.updateSyncStatus('error', '동기화 실패', error.message);
            }
            
            throw error;
        } finally {
            window.isCurrentlySyncing = false;
        }
    }

    /**
     * 자동 동기화 강제 활성화
     */
    function enableAutoSync() {
        console.log('🔄 자동 동기화 강제 활성화');
        autoSyncEnabled = true;
        localStorage.setItem('autoSyncEnabled', 'true');
        
        // 정기 동기화 시작
        startPeriodicSync();
        
        // UI 업데이트
        updateSyncStatusUI();
        
        // 첫 번째 동기화 실행 (3초 후, 중복 방지)
        setTimeout(() => {
            if (window.isAuthenticated && !currentSyncPromise) {
                performAutoSyncSafe('enabled', 'system');
            }
        }, 3000);
        
        return true;
    }

    /**
     * 전역 함수로 노출
     */
    window.autoSyncSystem = {
        toggle: toggleAutoSync,
        enable: enableAutoSync,
        setSyncInterval: setSyncInterval,
        setCustomFileName: setCustomFileName,
        performManualSync: performManualSync,
        updateUI: updateSyncStatusUI,
        isEnabled: () => autoSyncEnabled,
        getInterval: () => syncInterval / 60000, // 분 단위로 반환
        getCustomFileName: () => customFileName,
        getLastSyncTime: () => lastSyncTime
    };

    /**
     * 초기화
     */
    function initialize() {
        // 현재 데이터 해시 설정 (초기화 시 기준점 설정)
        lastSyncedDataHash = getCurrentDataHash();
        console.log(`🔧 초기 데이터 해시 설정: ${lastSyncedDataHash}`);
        
        // localStorage 모니터링 시작
        setupLocalStorageMonitoring();
        
        // 자동 동기화가 활성화되어 있으면 정기 동기화 시작
        if (autoSyncEnabled) {
            startPeriodicSync();
        }
        
        // UI 상태 업데이트
        setTimeout(() => {
            updateSyncStatusUI();
        }, 1000);
        
        console.log('🔄 자동 동기화 시스템 초기화 완료');
        console.log('설정:', { autoSyncEnabled, syncInterval, customFileName, lastSyncTime, initialHash: lastSyncedDataHash });
    }

    // 페이지 로드 완료 후 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})();