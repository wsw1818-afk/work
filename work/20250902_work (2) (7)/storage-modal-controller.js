// Storage Modal Controller - 저장소 모달 컨트롤러
(function() {
    'use strict';
    
    let storageInfo = {
        used: 0,
        total: 0,
        available: 0,
        memos: { size: 0, count: 0 },
        attachments: { size: 0, count: 0 },
        settings: { size: 0 }
    };
    
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🗄️ Storage Modal Controller 초기화 시작');
        
        // 저장소 버튼 이벤트 재설정
        setupStorageButton();
        
        console.log('✅ Storage Modal Controller 초기화 완료');
    });
    
    function setupStorageButton() {
        const storageBtn = document.getElementById('storageBtn');
        if (!storageBtn) return;
        
        // 기존 이벤트 제거
        storageBtn.replaceWith(storageBtn.cloneNode(true));
        const newStorageBtn = document.getElementById('storageBtn');
        
        // 새 이벤트 등록
        newStorageBtn.addEventListener('click', function() {
            console.log('🗄️ 저장소 버튼 클릭');
            openStorageModal();
        });
    }
    
    function openStorageModal() {
        const modal = document.getElementById('storageModal');
        if (!modal) {
            console.error('저장소 모달을 찾을 수 없습니다');
            return;
        }
        
        // 모달 표시
        modal.style.display = 'block';
        
        // 저장소 정보 로드
        refreshStorageInfo();
        
        // 모달에 포커스
        setTimeout(() => {
            const closeBtn = modal.querySelector('.modal-close');
            if (closeBtn) closeBtn.focus();
        }, 100);
    }
    
    function refreshStorageInfo() {
        console.log('🔄 저장소 정보 새로고침 시작');
        
        try {
            // 저장소 사용량 계산
            calculateStorageUsage();
            
            // UI 업데이트
            updateStorageUI();
            
            console.log('✅ 저장소 정보 새로고침 완료', storageInfo);
        } catch (error) {
            console.error('❌ 저장소 정보 새로고침 실패:', error);
        }
    }
    
    function calculateStorageUsage() {
        // localStorage 전체 사용량
        let totalUsed = 0;
        
        // 각 키별 사용량 측정
        const keys = Object.keys(localStorage);
        const breakdown = {};
        
        keys.forEach(key => {
            const value = localStorage.getItem(key);
            const size = new Blob([value]).size;
            totalUsed += size;
            breakdown[key] = size;
        });
        
        // 메모 데이터 분석
        const memos = JSON.parse(localStorage.getItem('calendarMemos') || '[]');
        const memosSize = new Blob([JSON.stringify(memos)]).size;
        let attachmentSize = 0;
        let attachmentCount = 0;
        
        memos.forEach(memo => {
            if (memo.attachments && memo.attachments.length > 0) {
                memo.attachments.forEach(attachment => {
                    attachmentSize += attachment.size || 0;
                    attachmentCount++;
                });
            }
        });
        
        // 설정 데이터 크기
        const settingsKeys = ['theme', 'fontSize', 'weekStart', 'lastSyncTime'];
        let settingsSize = 0;
        settingsKeys.forEach(key => {
            const value = localStorage.getItem(key);
            if (value) {
                settingsSize += new Blob([value]).size;
            }
        });
        
        // 전체 용량 추정 (브라우저별 다름, 일반적으로 5-10MB)
        const estimatedTotal = testStorageCapacity();
        
        // 결과 저장
        storageInfo = {
            used: totalUsed,
            total: estimatedTotal,
            available: estimatedTotal - totalUsed,
            memos: { 
                size: memosSize - attachmentSize, 
                count: memos.length 
            },
            attachments: { 
                size: attachmentSize, 
                count: attachmentCount 
            },
            settings: { 
                size: settingsSize 
            }
        };
        
        console.log('📊 저장소 분석 결과:', storageInfo);
    }
    
    function testStorageCapacity() {
        // 이미 구현된 함수 사용 (기존 코드에서)
        if (typeof window.testStorageCapacity === 'function') {
            return window.testStorageCapacity();
        }
        
        // 폴백: 간단한 용량 테스트
        try {
            const testKey = 'capacityTest';
            const chunk = 'x'.repeat(1024); // 1KB
            let size = 0;
            
            while (size < 10 * 1024 * 1024) { // 10MB 한계
                try {
                    localStorage.setItem(testKey, chunk.repeat(size / 1024));
                    size += 1024;
                } catch (e) {
                    localStorage.removeItem(testKey);
                    return size;
                }
            }
            
            localStorage.removeItem(testKey);
            return 10 * 1024 * 1024; // 10MB 기본값
        } catch (e) {
            return 5 * 1024 * 1024; // 5MB 안전값
        }
    }
    
    function updateStorageUI() {
        // 사용량 표시
        const usedElement = document.getElementById('usedStorage');
        const totalElement = document.getElementById('totalStorage');
        const availableElement = document.getElementById('availableStorage');
        const progressElement = document.getElementById('storageProgress');
        
        if (usedElement) usedElement.textContent = formatFileSize(storageInfo.used);
        if (totalElement) totalElement.textContent = formatFileSize(storageInfo.total);
        if (availableElement) availableElement.textContent = formatFileSize(storageInfo.available);
        
        // 진행률 바 업데이트
        if (progressElement) {
            const percentage = (storageInfo.used / storageInfo.total) * 100;
            progressElement.style.width = percentage + '%';
            
            // 색상 변경
            progressElement.className = 'storage-progress';
            if (percentage >= 80) {
                progressElement.classList.add('high');
            } else if (percentage >= 50) {
                progressElement.classList.add('medium');
            } else {
                progressElement.classList.add('low');
            }
        }
        
        // 데이터 분석 표시
        const memoSizeElement = document.getElementById('memoSize');
        const memoCountElement = document.getElementById('memoCount');
        const attachmentSizeElement = document.getElementById('attachmentSize');
        const attachmentCountElement = document.getElementById('attachmentCount');
        const settingsSizeElement = document.getElementById('settingsSize');
        
        if (memoSizeElement) memoSizeElement.textContent = formatFileSize(storageInfo.memos.size);
        if (memoCountElement) memoCountElement.textContent = storageInfo.memos.count + '개';
        if (attachmentSizeElement) attachmentSizeElement.textContent = formatFileSize(storageInfo.attachments.size);
        if (attachmentCountElement) attachmentCountElement.textContent = storageInfo.attachments.count + '개';
        if (settingsSizeElement) settingsSizeElement.textContent = formatFileSize(storageInfo.settings.size);
    }
    
    function formatFileSize(bytes) {
        if (!bytes) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
    
    // 백업 관련 함수들
    function exportFullBackup() {
        try {
            console.log('📦 전체 백업 생성 시작');
            
            const backupData = {
                timestamp: new Date().toISOString(),
                version: '1.0',
                data: {
                    memos: JSON.parse(localStorage.getItem('calendarMemos') || '[]'),
                    settings: {
                        theme: localStorage.getItem('theme'),
                        fontSize: localStorage.getItem('fontSize'),
                        weekStart: localStorage.getItem('weekStart'),
                        // 기타 설정들
                    },
                    metadata: {
                        exportedAt: new Date().toISOString(),
                        totalMemos: JSON.parse(localStorage.getItem('calendarMemos') || '[]').length,
                        storageInfo: storageInfo
                    }
                }
            };
            
            const blob = new Blob([JSON.stringify(backupData, null, 2)], { 
                type: 'application/json' 
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `calendar_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            alert('✅ 전체 백업이 완료되었습니다!');
            console.log('✅ 전체 백업 생성 완료');
        } catch (error) {
            console.error('❌ 전체 백업 생성 실패:', error);
            alert('❌ 백업 생성 중 오류가 발생했습니다.');
        }
    }
    
    function exportMemosOnly() {
        try {
            console.log('📝 메모만 백업 생성 시작');
            
            const memos = JSON.parse(localStorage.getItem('calendarMemos') || '[]');
            const memosOnly = memos.map(memo => ({
                id: memo.id,
                title: memo.title,
                content: memo.content,
                date: memo.date,
                timestamp: memo.timestamp,
                type: memo.type
                // 첨부파일은 제외
            }));
            
            const backupData = {
                timestamp: new Date().toISOString(),
                version: '1.0',
                type: 'memos_only',
                data: memosOnly
            };
            
            const blob = new Blob([JSON.stringify(backupData, null, 2)], { 
                type: 'application/json' 
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `memos_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            alert('✅ 메모 백업이 완료되었습니다!');
            console.log('✅ 메모 백업 생성 완료');
        } catch (error) {
            console.error('❌ 메모 백업 생성 실패:', error);
            alert('❌ 메모 백업 생성 중 오류가 발생했습니다.');
        }
    }
    
    function importBackup(fileInput) {
        const file = fileInput.files[0];
        if (!file) return;
        
        console.log('📤 백업 복원 시작:', file.name);
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const backupData = JSON.parse(e.target.result);
                
                if (!backupData.version || !backupData.data) {
                    throw new Error('유효하지 않은 백업 파일입니다.');
                }
                
                const confirmRestore = confirm(
                    `백업을 복원하시겠습니까?\n\n` +
                    `백업 날짜: ${new Date(backupData.timestamp).toLocaleString()}\n` +
                    `버전: ${backupData.version}\n` +
                    `메모 개수: ${backupData.data.memos?.length || 0}개\n\n` +
                    `⚠️ 현재 데이터가 덮어씌워집니다!`
                );
                
                if (!confirmRestore) return;
                
                // 백업 데이터 복원
                if (backupData.data.memos) {
                    localStorage.setItem('calendarMemos', JSON.stringify(backupData.data.memos));
                }
                
                if (backupData.data.settings) {
                    Object.keys(backupData.data.settings).forEach(key => {
                        if (backupData.data.settings[key] !== null) {
                            localStorage.setItem(key, backupData.data.settings[key]);
                        }
                    });
                }
                
                alert('✅ 백업 복원이 완료되었습니다!\n페이지를 새로고침합니다.');
                window.location.reload();
                
            } catch (error) {
                console.error('❌ 백업 복원 실패:', error);
                alert('❌ 백업 파일을 읽을 수 없습니다:\n' + error.message);
            }
        };
        
        reader.readAsText(file);
    }
    
    // 정리 도구 함수들
    function cleanupLargeFiles() {
        try {
            console.log('🗑️ 큰 파일 정리 시작');
            
            const memos = JSON.parse(localStorage.getItem('calendarMemos') || '[]');
            let removedCount = 0;
            let savedBytes = 0;
            
            const cleanedMemos = memos.map(memo => {
                if (memo.attachments && memo.attachments.length > 0) {
                    const originalAttachments = [...memo.attachments];
                    memo.attachments = memo.attachments.filter(attachment => {
                        const isLarge = attachment.size > 500 * 1024; // 500KB 이상
                        if (isLarge) {
                            removedCount++;
                            savedBytes += attachment.size;
                        }
                        return !isLarge;
                    });
                    
                    if (originalAttachments.length !== memo.attachments.length) {
                        console.log(`큰 첨부파일 제거: ${memo.title}`);
                    }
                }
                return memo;
            });
            
            if (removedCount > 0) {
                localStorage.setItem('calendarMemos', JSON.stringify(cleanedMemos));
                alert(`✅ 큰 파일 정리 완료!\n\n제거된 파일: ${removedCount}개\n절약된 용량: ${formatFileSize(savedBytes)}`);
                refreshStorageInfo();
            } else {
                alert('ℹ️ 500KB 이상의 큰 파일이 없습니다.');
            }
            
        } catch (error) {
            console.error('❌ 큰 파일 정리 실패:', error);
            alert('❌ 파일 정리 중 오류가 발생했습니다.');
        }
    }
    
    function cleanupDuplicates() {
        try {
            console.log('🔄 중복 제거 시작');
            
            const memos = JSON.parse(localStorage.getItem('calendarMemos') || '[]');
            const seen = new Set();
            const uniqueMemos = [];
            let removedCount = 0;
            
            memos.forEach(memo => {
                const key = `${memo.title}_${memo.content}_${memo.date}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    uniqueMemos.push(memo);
                } else {
                    removedCount++;
                    console.log(`중복 메모 제거: ${memo.title}`);
                }
            });
            
            if (removedCount > 0) {
                localStorage.setItem('calendarMemos', JSON.stringify(uniqueMemos));
                alert(`✅ 중복 제거 완료!\n\n제거된 중복 메모: ${removedCount}개`);
                refreshStorageInfo();
            } else {
                alert('ℹ️ 중복된 메모가 없습니다.');
            }
            
        } catch (error) {
            console.error('❌ 중복 제거 실패:', error);
            alert('❌ 중복 제거 중 오류가 발생했습니다.');
        }
    }
    
    function cleanupEmptyMemos() {
        try {
            console.log('📝 빈 메모 정리 시작');
            
            const memos = JSON.parse(localStorage.getItem('calendarMemos') || '[]');
            const nonEmptyMemos = memos.filter(memo => {
                const isEmpty = !memo.title?.trim() && !memo.content?.trim();
                if (isEmpty) {
                    console.log(`빈 메모 제거: ${memo.id}`);
                }
                return !isEmpty;
            });
            
            const removedCount = memos.length - nonEmptyMemos.length;
            
            if (removedCount > 0) {
                localStorage.setItem('calendarMemos', JSON.stringify(nonEmptyMemos));
                alert(`✅ 빈 메모 정리 완료!\n\n제거된 빈 메모: ${removedCount}개`);
                refreshStorageInfo();
            } else {
                alert('ℹ️ 빈 메모가 없습니다.');
            }
            
        } catch (error) {
            console.error('❌ 빈 메모 정리 실패:', error);
            alert('❌ 빈 메모 정리 중 오류가 발생했습니다.');
        }
    }
    
    function clearAllData() {
        const confirm1 = confirm(
            '⚠️ 모든 데이터를 삭제하시겠습니까?\n\n' +
            '• 모든 메모와 첨부파일\n' +
            '• 모든 설정\n' +
            '• 동기화 정보\n\n' +
            '이 작업은 되돌릴 수 없습니다!'
        );
        
        if (!confirm1) return;
        
        const confirm2 = confirm(
            '정말로 모든 데이터를 삭제하시겠습니까?\n\n' +
            '마지막 확인입니다!'
        );
        
        if (!confirm2) return;
        
        try {
            console.log('⚠️ 전체 데이터 삭제 시작');
            
            // localStorage 전체 삭제
            const keysToKeep = ['googl']; // Google 관련 키는 보존
            const allKeys = Object.keys(localStorage);
            
            allKeys.forEach(key => {
                if (!keysToKeep.some(keepKey => key.includes(keepKey))) {
                    localStorage.removeItem(key);
                }
            });
            
            alert('✅ 모든 데이터가 삭제되었습니다.\n페이지를 새로고침합니다.');
            window.location.reload();
            
        } catch (error) {
            console.error('❌ 전체 삭제 실패:', error);
            alert('❌ 데이터 삭제 중 오류가 발생했습니다.');
        }
    }
    
    function resetSettings() {
        const confirmReset = confirm(
            '설정을 초기화하시겠습니까?\n\n' +
            '• 테마 설정\n' +
            '• 글꼴 크기\n' +
            '• 달력 크기\n' +
            '• 기타 환경 설정\n\n' +
            '메모 데이터는 유지됩니다.'
        );
        
        if (!confirmReset) return;
        
        try {
            console.log('🔄 설정 초기화 시작');
            
            const settingsKeys = [
                'theme', 'fontSize', 'weekStart', 'widthScale', 'heightScale',
                'lastSyncTime', 'googleDriveConnected'
            ];
            
            settingsKeys.forEach(key => {
                localStorage.removeItem(key);
            });
            
            alert('✅ 설정이 초기화되었습니다.\n페이지를 새로고침합니다.');
            window.location.reload();
            
        } catch (error) {
            console.error('❌ 설정 초기화 실패:', error);
            alert('❌ 설정 초기화 중 오류가 발생했습니다.');
        }
    }
    
    // 전역 함수로 내보내기
    window.StorageModalController = {
        refresh: refreshStorageInfo,
        open: openStorageModal
    };
    
    // 전역 함수들 (HTML onclick에서 사용)
    window.refreshStorageInfo = refreshStorageInfo;
    window.exportFullBackup = exportFullBackup;
    window.exportMemosOnly = exportMemosOnly;
    window.importBackup = importBackup;
    window.cleanupLargeFiles = cleanupLargeFiles;
    window.cleanupDuplicates = cleanupDuplicates;
    window.cleanupEmptyMemos = cleanupEmptyMemos;
    window.clearAllData = clearAllData;
    window.resetSettings = resetSettings;
    
})();