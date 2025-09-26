/**
 * 백업 중복 방지 시스템
 * 여러 백업 시스템이 중복으로 실행되는 것을 방지하고 통합 관리
 */

class BackupDeduplicationSystem {
    constructor() {
        this.isBackupInProgress = false;
        this.lastBackupHash = null;
        this.backupQueue = [];
        this.backupSemaphore = 1; // 최대 동시 백업 수
        this.minBackupInterval = 300000; // 5분 (밀리초)
        this.lastBackupTime = 0;
        this.backupHistory = new Map(); // 백업 히스토리 추적
        
        this.init();
    }

    init() {
        console.log('🔧 백업 중복 방지 시스템 초기화');
        this.setupBackupInterception();
        this.loadBackupHistory();
    }

    /**
     * 기존 백업 함수들을 가로채서 중복 방지 로직 적용
     */
    setupBackupInterception() {
        // 원본 함수들 백업
        const originalUploadBackup = window.uploadBackupWithCustomName;
        const originalPerformBackup = window.autoSyncSystem?.performBackup;
        const originalDownloadBackup = window.portableBackup?.downloadBackup;

        // uploadBackupWithCustomName 함수 래핑
        if (originalUploadBackup) {
            window.uploadBackupWithCustomName = async (...args) => {
                return await this.executeBackupWithDeduplication('uploadBackup', originalUploadBackup, args);
            };
            console.log('✅ uploadBackupWithCustomName 함수 래핑 완료');
        }

        // 자동 동기화 백업 래핑
        if (window.autoSyncSystem && originalPerformBackup) {
            window.autoSyncSystem.performBackup = async (...args) => {
                return await this.executeBackupWithDeduplication('autoSync', originalPerformBackup, args);
            };
            console.log('✅ autoSyncSystem.performBackup 함수 래핑 완료');
        }

        // 포터블 백업 래핑
        if (window.portableBackup && originalDownloadBackup) {
            window.portableBackup.downloadBackup = async (...args) => {
                return await this.executeBackupWithDeduplication('portableBackup', originalDownloadBackup, args);
            };
            console.log('✅ portableBackup.downloadBackup 함수 래핑 완료');
        }
    }

    /**
     * 중복 방지 로직이 적용된 백업 실행
     */
    async executeBackupWithDeduplication(backupType, originalFunction, args) {
        const backupId = this.generateBackupId(backupType, args);
        const now = Date.now();

        // 1. 현재 백업 진행 중인지 확인
        if (this.isBackupInProgress) {
            console.log(`🚫 백업 진행 중 - ${backupType} 백업 대기열에 추가`);
            return await this.queueBackup(backupId, backupType, originalFunction, args);
        }

        // 2. 최소 간격 확인 (5분 이내 중복 백업 방지)
        const timeSinceLastBackup = now - this.lastBackupTime;
        if (timeSinceLastBackup < this.minBackupInterval) {
            const remainingTime = Math.ceil((this.minBackupInterval - timeSinceLastBackup) / 1000);
            console.log(`⏰ 백업 간격 부족 - ${remainingTime}초 후 백업 가능 (${backupType})`);
            
            // 짧은 간격의 백업은 스킵하되, 수동 백업은 허용
            if (backupType === 'uploadBackup' && !args[1]) { // silent가 false인 경우 (수동)
                return await this.executeBackup(backupId, backupType, originalFunction, args);
            }
            
            return { success: false, reason: 'interval_too_short', waitTime: remainingTime };
        }

        // 3. 데이터 변경 확인
        const currentDataHash = this.generateDataHash();
        if (this.lastBackupHash === currentDataHash) {
            console.log(`🚫 데이터 변경 없음 - ${backupType} 백업 스킵`);
            return { success: false, reason: 'no_data_change' };
        }

        // 4. 오늘 이미 같은 타입의 백업이 있는지 확인
        const today = new Date().toISOString().split('T')[0];
        const todayBackups = this.backupHistory.get(today) || {};
        
        if (todayBackups[backupType] && backupType !== 'uploadBackup') {
            console.log(`📅 오늘 이미 ${backupType} 백업 완료 - 중복 방지`);
            return { success: false, reason: 'already_backed_up_today' };
        }

        // 5. 백업 실행
        return await this.executeBackup(backupId, backupType, originalFunction, args);
    }

    /**
     * 실제 백업 실행
     */
    async executeBackup(backupId, backupType, originalFunction, args) {
        this.isBackupInProgress = true;
        const startTime = Date.now();

        try {
            console.log(`🚀 백업 실행 시작: ${backupType} (ID: ${backupId})`);
            
            // 원본 함수 실행
            const result = await originalFunction.apply(this, args);
            
            if (result && (result.success !== false)) {
                // 백업 성공 처리
                const currentDataHash = this.generateDataHash();
                this.lastBackupHash = currentDataHash;
                this.lastBackupTime = startTime;
                this.recordBackupSuccess(backupType, backupId, result);
                
                const duration = Date.now() - startTime;
                console.log(`✅ 백업 성공: ${backupType} (${duration}ms)`);
                
                this.showNotification(`✅ ${this.getBackupTypeDisplayName(backupType)} 완료`, 'success');
            } else {
                console.log(`❌ 백업 실패: ${backupType}`, result);
            }
            
            return result;
            
        } catch (error) {
            console.error(`❌ 백업 오류: ${backupType}`, error);
            this.showNotification(`❌ ${this.getBackupTypeDisplayName(backupType)} 실패: ${error.message}`, 'error');
            throw error;
        } finally {
            this.isBackupInProgress = false;
            this.processBackupQueue(); // 대기 중인 백업 처리
        }
    }

    /**
     * 백업을 대기열에 추가
     */
    async queueBackup(backupId, backupType, originalFunction, args) {
        return new Promise((resolve, reject) => {
            const queueItem = {
                id: backupId,
                type: backupType,
                function: originalFunction,
                args: args,
                resolve: resolve,
                reject: reject,
                timestamp: Date.now()
            };
            
            // 같은 타입의 백업이 이미 대기열에 있으면 교체 (최신 것만 유지)
            const existingIndex = this.backupQueue.findIndex(item => item.type === backupType);
            if (existingIndex !== -1) {
                console.log(`🔄 대기열의 기존 ${backupType} 백업을 새로운 것으로 교체`);
                this.backupQueue[existingIndex].resolve({ success: false, reason: 'replaced_by_newer' });
                this.backupQueue[existingIndex] = queueItem;
            } else {
                this.backupQueue.push(queueItem);
            }
            
            console.log(`📋 백업 대기열에 추가: ${backupType} (대기중: ${this.backupQueue.length}개)`);
        });
    }

    /**
     * 대기열의 백업 처리
     */
    async processBackupQueue() {
        if (this.backupQueue.length === 0 || this.isBackupInProgress) {
            return;
        }

        const nextBackup = this.backupQueue.shift();
        if (!nextBackup) return;

        console.log(`📤 대기열에서 백업 처리: ${nextBackup.type}`);

        try {
            const result = await this.executeBackupWithDeduplication(
                nextBackup.type, 
                nextBackup.function, 
                nextBackup.args
            );
            nextBackup.resolve(result);
        } catch (error) {
            nextBackup.reject(error);
        }
    }

    /**
     * 백업 ID 생성
     */
    generateBackupId(backupType, args) {
        const timestamp = Date.now();
        const argsHash = this.hashCode(JSON.stringify(args));
        return `${backupType}_${timestamp}_${argsHash}`;
    }

    /**
     * 현재 메모 데이터의 해시 생성
     */
    generateDataHash() {
        const memos = localStorage.getItem('calendarMemos') || '{}';
        const schedules = localStorage.getItem('calendarSchedules') || '[]';
        const settings = JSON.stringify({
            fontSize: localStorage.getItem('fontSize'),
            theme: localStorage.getItem('theme'),
            calendarSize: localStorage.getItem('calendarSize')
        });
        
        const combinedData = memos + schedules + settings;
        return this.hashCode(combinedData);
    }

    /**
     * 간단한 해시 함수
     */
    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 32bit 정수로 변환
        }
        return hash.toString();
    }

    /**
     * 백업 성공 기록
     */
    recordBackupSuccess(backupType, backupId, result) {
        const today = new Date().toISOString().split('T')[0];
        
        if (!this.backupHistory.has(today)) {
            this.backupHistory.set(today, {});
        }
        
        const todayBackups = this.backupHistory.get(today);
        todayBackups[backupType] = {
            id: backupId,
            timestamp: Date.now(),
            result: result
        };
        
        this.saveBackupHistory();
        console.log(`📝 백업 기록 저장: ${backupType} (${today})`);
    }

    /**
     * 백업 히스토리 저장
     */
    saveBackupHistory() {
        const historyData = {};
        this.backupHistory.forEach((value, key) => {
            historyData[key] = value;
        });
        localStorage.setItem('backupHistory', JSON.stringify(historyData));
    }

    /**
     * 백업 히스토리 로드
     */
    loadBackupHistory() {
        const saved = localStorage.getItem('backupHistory');
        if (saved) {
            const historyData = JSON.parse(saved);
            this.backupHistory = new Map(Object.entries(historyData));
            
            // 30일 이상된 히스토리 정리
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];
            
            this.backupHistory.forEach((value, key) => {
                if (key < cutoffDate) {
                    this.backupHistory.delete(key);
                }
            });
            
            console.log(`📚 백업 히스토리 로드: ${this.backupHistory.size}일`);
        }
    }

    /**
     * 백업 타입 표시명 반환
     */
    getBackupTypeDisplayName(backupType) {
        const displayNames = {
            'uploadBackup': '클라우드 백업',
            'autoSync': '자동 동기화',
            'portableBackup': '포터블 백업'
        };
        return displayNames[backupType] || backupType;
    }

    /**
     * 알림 표시
     */
    showNotification(message, type = 'info', duration = 3000) {
        // 기존 알림 제거
        const existing = document.querySelector('.deduplication-notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = `deduplication-notification dedup-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 120px;
            right: 20px;
            padding: 12px 18px;
            border-radius: 8px;
            color: white;
            font-size: 13px;
            font-weight: 500;
            z-index: 10001;
            max-width: 320px;
            word-wrap: break-word;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease;
            backdrop-filter: blur(10px);
        `;

        // 타입별 색상
        const colors = {
            success: 'linear-gradient(45deg, #27ae60, #2ecc71)',
            error: 'linear-gradient(45deg, #e74c3c, #c0392b)',
            info: 'linear-gradient(45deg, #3498db, #2980b9)',
            warning: 'linear-gradient(45deg, #f39c12, #e67e22)'
        };
        notification.style.background = colors[type] || colors.info;

        notification.textContent = message;
        document.body.appendChild(notification);

        // 자동 제거
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);
    }

    /**
     * 현재 백업 상태 정보 반환
     */
    getStatus() {
        return {
            isBackupInProgress: this.isBackupInProgress,
            queueLength: this.backupQueue.length,
            lastBackupTime: this.lastBackupTime,
            lastBackupHash: this.lastBackupHash,
            todayBackupCount: this.getTodayBackupCount(),
            nextAllowedBackupTime: this.lastBackupTime + this.minBackupInterval
        };
    }

    /**
     * 오늘 백업 횟수 반환
     */
    getTodayBackupCount() {
        const today = new Date().toISOString().split('T')[0];
        const todayBackups = this.backupHistory.get(today);
        return todayBackups ? Object.keys(todayBackups).length : 0;
    }

    /**
     * 수동으로 백업 강제 실행 (디버깅용)
     */
    async forceBackup(backupType = 'manual') {
        console.log(`🔧 강제 백업 실행: ${backupType}`);
        this.lastBackupTime = 0; // 간격 제한 무시
        this.lastBackupHash = null; // 데이터 변경 확인 무시
        
        if (window.uploadBackupWithCustomName) {
            return await window.uploadBackupWithCustomName(`force-backup-${Date.now()}.json`, false);
        }
        
        throw new Error('백업 함수를 찾을 수 없습니다');
    }

    /**
     * 백업 통계 표시
     */
    showBackupStats() {
        const status = this.getStatus();
        const nextBackupTime = status.nextAllowedBackupTime > Date.now() 
            ? Math.ceil((status.nextAllowedBackupTime - Date.now()) / 1000)
            : 0;

        const stats = `
🔧 백업 중복 방지 시스템 상태

📊 현재 상태:
• 백업 진행 중: ${status.isBackupInProgress ? '✅ 예' : '❌ 아니오'}
• 대기열 크기: ${status.queueLength}개
• 오늘 백업 횟수: ${status.todayBackupCount}회
• 마지막 백업: ${status.lastBackupTime > 0 ? new Date(status.lastBackupTime).toLocaleString() : '없음'}

⏰ 다음 백업 가능:
${nextBackupTime > 0 ? `${nextBackupTime}초 후` : '즉시 가능'}

📈 백업 히스토리: ${this.backupHistory.size}일간 기록

🛠️ 디버깅:
• 강제 백업: backupDedupe.forceBackup()
• 상태 확인: backupDedupe.getStatus()
        `;

        console.log(stats);
        alert(stats);
    }
}

// CSS 애니메이션 추가
if (!document.querySelector('#deduplication-styles')) {
    const styles = document.createElement('style');
    styles.id = 'deduplication-styles';
    styles.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(styles);
}

// 전역 인스턴스 생성
window.backupDedupe = new BackupDeduplicationSystem();

console.log('🛡️ 백업 중복 방지 시스템 로드 완료');
console.log('📋 디버깅 명령어:');
console.log('  - backupDedupe.showBackupStats() : 백업 통계 확인');
console.log('  - backupDedupe.forceBackup() : 강제 백업 실행');
console.log('  - backupDedupe.getStatus() : 현재 상태 확인');