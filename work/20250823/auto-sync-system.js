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

    // 원본 localStorage 메서드 백업
    const originalSetItem = localStorage.setItem;
    const originalRemoveItem = localStorage.removeItem;
    const originalClear = localStorage.clear;

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
     * 데이터 변경 처리
     */
    function handleDataChange(type, key, data) {
        console.log(`📝 메모 데이터 변경 감지: ${type}`, { key, data });
        
        if (!autoSyncEnabled) {
            console.log('자동 동기화가 비활성화되어 있습니다.');
            return;
        }

        // 기존 타이머 클리어 (연속 변경 시 마지막 변경만 처리)
        if (dataChangeTimer) {
            clearTimeout(dataChangeTimer);
        }

        // 2초 후 동기화 (연속 변경 방지)
        dataChangeTimer = setTimeout(() => {
            performAutoSync(type, key);
        }, 2000);
    }

    /**
     * 자동 동기화 실행
     */
    async function performAutoSync(changeType, changedKey) {
        try {
            console.log('🔄 자동 동기화 시작...');
            
            // 구글 드라이브 연결 상태 확인
            if (!window.isAuthenticated || typeof window.uploadBackupWithCustomName !== 'function') {
                console.log('구글 드라이브가 연결되지 않았거나 업로드 함수가 없습니다.');
                showNotification('자동 동기화 실패: 구글 드라이브 연결 확인 필요', 'error');
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
            }
            
        } catch (error) {
            console.error('자동 동기화 실패:', error);
            showNotification('자동 동기화 실패: ' + error.message, 'error');
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
                
                // 마지막 동기화 후 설정된 간격이 지났으면 실행
                if (timeSinceLastSync >= syncInterval) {
                    performAutoSync('periodic', null);
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
     * 수동 동기화 실행
     */
    async function performManualSync(fileName = '') {
        try {
            showNotification('수동 동기화 시작...', 'info');
            
            if (!window.isAuthenticated || typeof window.uploadBackupWithCustomName !== 'function') {
                throw new Error('구글 드라이브가 연결되지 않았습니다.');
            }
            
            const syncFileName = fileName || generateSyncFileName('manual', null);
            const result = await window.uploadBackupWithCustomName(syncFileName, false);
            
            if (result) {
                lastSyncTime = Date.now();
                localStorage.setItem('lastSyncTime', lastSyncTime.toString());
                showNotification('수동 동기화 완료!', 'success');
                updateSyncStatusUI();
            }
            
            return result;
            
        } catch (error) {
            console.error('수동 동기화 실패:', error);
            showNotification('수동 동기화 실패: ' + error.message, 'error');
            throw error;
        }
    }

    /**
     * 전역 함수로 노출
     */
    window.autoSyncSystem = {
        toggle: toggleAutoSync,
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
        console.log('설정:', { autoSyncEnabled, syncInterval, customFileName, lastSyncTime });
    }

    // 페이지 로드 완료 후 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})();