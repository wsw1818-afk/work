// 백업 모달 강제 표시 및 위치 수정
(function() {
    'use strict';
    
    console.log('🚀 백업 모달 강제 표시 스크립트 시작');
    
    // 백업 모달 생성 또는 재구성
    function ensureBackupModal() {
        let modal = document.getElementById('backupModal');
        
        // 기존 모달이 있으면 제거
        if (modal) {
            modal.remove();
        }
        
        // 새로운 모달 생성
        modal = document.createElement('div');
        modal.id = 'backupModal';
        modal.className = 'modal backup-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-hidden', 'true');
        
        modal.innerHTML = `
            <div class="modal-content" style="
                background: white;
                border-radius: 12px;
                padding: 24px;
                width: 600px;
                max-height: 500px;
                overflow-y: auto;
                position: relative;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            ">
                <button class="modal-close" style="
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #666;
                    padding: 5px 10px;
                    z-index: 10;
                " onclick="closeBackupModal()">×</button>
                
                <h2 style="margin-bottom: 20px; color: #333;">📦 백업 및 복원</h2>
                
                <div id="backupInfo" style="
                    background: #f5f5f5;
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                "></div>
                
                <div style="display: flex; flex-direction: column; gap: 15px;">
                    <button onclick="downloadBackupData()" style="
                        padding: 12px 24px;
                        background: #4CAF50;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        font-size: 16px;
                        cursor: pointer;
                        transition: background 0.3s;
                    " onmouseover="this.style.background='#45a049'" onmouseout="this.style.background='#4CAF50'">
                        💾 백업 다운로드
                    </button>
                    
                    <div style="
                        border: 2px dashed #ccc;
                        border-radius: 8px;
                        padding: 20px;
                        text-align: center;
                        background: #fafafa;
                    ">
                        <label for="restoreFile" style="
                            cursor: pointer;
                            color: #2196F3;
                            font-weight: bold;
                        ">
                            📂 복원 파일 선택
                            <input type="file" id="restoreFile" accept=".json" style="display: none;" onchange="handleRestoreFile(this)">
                        </label>
                        <p style="margin-top: 10px; color: #666; font-size: 14px;">
                            백업 파일(.json)을 선택하여 복원하세요
                        </p>
                    </div>
                    
                    <button onclick="exportToClipboard()" style="
                        padding: 12px 24px;
                        background: #2196F3;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        font-size: 16px;
                        cursor: pointer;
                        transition: background 0.3s;
                    " onmouseover="this.style.background='#1976D2'" onmouseout="this.style.background='#2196F3'">
                        📋 클립보드로 복사
                    </button>
                </div>
            </div>
        `;
        
        // body에 추가
        document.body.appendChild(modal);
        
        // 백업 정보 업데이트
        updateBackupInfo();
        
        return modal;
    }
    
    // 백업 정보 업데이트
    function updateBackupInfo() {
        const backupInfoDiv = document.getElementById('backupInfo');
        if (backupInfoDiv) {
            try {
                const memoData = JSON.parse(localStorage.getItem('memos') || '[]');
                const dataSize = Math.round(JSON.stringify(memoData).length / 1024);
                backupInfoDiv.innerHTML = `
                    <p><strong>현재 백업 정보:</strong></p>
                    <p>📝 메모 개수: ${memoData.length}개</p>
                    <p>💾 데이터 크기: ${dataSize}KB</p>
                    <p>📅 백업 날짜: ${new Date().toLocaleDateString('ko-KR')}</p>
                `;
            } catch (error) {
                console.error('백업 정보 업데이트 오류:', error);
                backupInfoDiv.innerHTML = '<p>백업 정보를 불러올 수 없습니다.</p>';
            }
        }
    }
    
    // 백업 다운로드 함수
    window.downloadBackupData = function() {
        console.log('📦 백업 다운로드 시작');
        try {
            const memoData = JSON.parse(localStorage.getItem('memos') || '[]');
            const backupData = {
                memos: memoData,
                settings: {
                    theme: localStorage.getItem('theme') || 'light',
                    fontSize: localStorage.getItem('fontSize') || '16',
                    calendarSize: {
                        width: localStorage.getItem('calendarWidthScale') || '1',
                        height: localStorage.getItem('calendarHeightScale') || '1'
                    }
                },
                exportDate: new Date().toISOString(),
                version: '1.0'
            };
            
            const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
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
            console.error('백업 다운로드 오류:', error);
            alert('❌ 백업 다운로드에 실패했습니다.');
        }
    };
    
    // 복원 파일 처리
    window.handleRestoreFile = function(input) {
        const file = input.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                
                if (!data.memos || !Array.isArray(data.memos)) {
                    throw new Error('유효하지 않은 백업 파일입니다.');
                }
                
                if (confirm(`${data.memos.length}개의 메모를 복원하시겠습니까?\n\n⚠️ 경고: 현재 데이터가 모두 대체됩니다!`)) {
                    // 메모 복원
                    localStorage.setItem('memos', JSON.stringify(data.memos));
                    
                    // 설정 복원
                    if (data.settings) {
                        if (data.settings.theme) localStorage.setItem('theme', data.settings.theme);
                        if (data.settings.fontSize) localStorage.setItem('fontSize', data.settings.fontSize);
                        if (data.settings.calendarSize) {
                            if (data.settings.calendarSize.width) 
                                localStorage.setItem('calendarWidthScale', data.settings.calendarSize.width);
                            if (data.settings.calendarSize.height) 
                                localStorage.setItem('calendarHeightScale', data.settings.calendarSize.height);
                        }
                    }
                    
                    alert('✅ 복원이 완료되었습니다! 페이지를 새로고침합니다.');
                    location.reload();
                }
            } catch (error) {
                console.error('복원 오류:', error);
                alert('❌ 복원에 실패했습니다: ' + error.message);
            }
        };
        reader.readAsText(file);
    };
    
    // 클립보드로 복사
    window.exportToClipboard = function() {
        try {
            const memoData = JSON.parse(localStorage.getItem('memos') || '[]');
            const backupData = {
                memos: memoData,
                exportDate: new Date().toISOString(),
                version: '1.0'
            };
            
            const jsonString = JSON.stringify(backupData, null, 2);
            
            // 클립보드에 복사
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(jsonString).then(() => {
                    alert('✅ 클립보드에 복사되었습니다!');
                }).catch(() => {
                    fallbackCopyToClipboard(jsonString);
                });
            } else {
                fallbackCopyToClipboard(jsonString);
            }
        } catch (error) {
            console.error('클립보드 복사 오류:', error);
            alert('❌ 클립보드 복사에 실패했습니다.');
        }
    };
    
    // 클립보드 복사 fallback
    function fallbackCopyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.top = '0';
        textarea.style.left = '0';
        textarea.style.width = '1px';
        textarea.style.height = '1px';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                alert('✅ 클립보드에 복사되었습니다!');
            } else {
                alert('❌ 클립보드 복사에 실패했습니다.');
            }
        } catch (error) {
            alert('❌ 클립보드 복사에 실패했습니다.');
        }
        
        document.body.removeChild(textarea);
    }
    
    // 모달 열기 함수
    window.openBackupModal = function() {
        console.log('📦 백업 모달 열기');
        
        const modal = ensureBackupModal();
        
        // 달력 영역 찾기 (더 정확한 선택자 사용)
        let calendarContainer = document.querySelector('.calendar-container');
        if (!calendarContainer) {
            calendarContainer = document.querySelector('.calendar');
        }
        if (!calendarContainer) {
            calendarContainer = document.querySelector('#calendar');
        }
        if (!calendarContainer) {
            // 달력 테이블 직접 찾기
            const calendarTable = document.querySelector('table');
            if (calendarTable) {
                calendarContainer = calendarTable.closest('div');
            }
        }
        
        if (!calendarContainer) {
            calendarContainer = document.querySelector('main') || document.body;
        }
        
        const calendarRect = calendarContainer.getBoundingClientRect();
        
        console.log('📍 달력 영역:', calendarContainer);
        console.log('📐 달력 위치:', calendarRect);
        
        // 달력 중앙 위치 계산
        const centerX = calendarRect.left + (calendarRect.width / 2);
        const centerY = calendarRect.top + (calendarRect.height / 2);
        
        // 모달 컨텐츠 요소 찾기
        const modalContent = modal.querySelector('.modal-content');
        
        // 모달 배경 스타일
        modal.style.cssText = `
            display: block !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background-color: rgba(0, 0, 0, 0.5) !important;
            z-index: 999999 !important;
            opacity: 1 !important;
            visibility: visible !important;
            pointer-events: auto !important;
        `;
        
        // 모달 컨텐츠를 달력 중앙에 위치시키기
        if (modalContent) {
            // 모달 크기
            const modalWidth = 600;
            const modalHeight = 500;
            
            // 달력 중앙 기준으로 모달 위치 계산
            const modalLeft = centerX - (modalWidth / 2);
            const modalTop = centerY - (modalHeight / 2);
            
            // 화면 밖으로 나가지 않도록 조정
            const adjustedLeft = Math.max(10, Math.min(modalLeft, window.innerWidth - modalWidth - 10));
            const adjustedTop = Math.max(10, Math.min(modalTop, window.innerHeight - modalHeight - 10));
            
            modalContent.style.cssText = `
                background: white !important;
                border-radius: 12px !important;
                padding: 24px !important;
                width: ${modalWidth}px !important;
                max-height: ${modalHeight}px !important;
                overflow-y: auto !important;
                position: fixed !important;
                left: ${adjustedLeft}px !important;
                top: ${adjustedTop}px !important;
                z-index: 1000000 !important;
                pointer-events: auto !important;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
            `;
            
            console.log(`📍 모달 위치: left=${adjustedLeft}px, top=${adjustedTop}px`);
            console.log(`📍 달력 중앙: x=${centerX}px, y=${centerY}px`);
        }
        
        modal.setAttribute('aria-hidden', 'false');
        
        console.log('✅ 백업 모달이 달력 중앙에 열림');
    };
    
    // 모달 닫기 함수
    window.closeBackupModal = function() {
        console.log('📦 백업 모달 닫기');
        const modal = document.getElementById('backupModal');
        if (modal) {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
        }
    };
    
    // 백업 버튼 이벤트 재설정
    function setupBackupButton() {
        const backupBtn = document.getElementById('backupBtn');
        if (backupBtn) {
            // 기존 이벤트 제거하고 새로 설정
            const newBtn = backupBtn.cloneNode(true);
            backupBtn.parentNode.replaceChild(newBtn, backupBtn);
            
            newBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                console.log('🎯 백업 버튼 클릭됨');
                openBackupModal();
            });
            
            console.log('✅ 백업 버튼 이벤트 재설정 완료');
        } else {
            console.warn('⚠️ 백업 버튼을 찾을 수 없습니다');
        }
    }
    
    // ESC 키로 모달 닫기
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('backupModal');
            if (modal && modal.style.display !== 'none') {
                closeBackupModal();
            }
        }
    });
    
    // 백드롭 클릭으로 모달 닫기
    document.addEventListener('click', function(e) {
        const modal = document.getElementById('backupModal');
        if (modal && e.target === modal) {
            closeBackupModal();
        }
    });
    
    // 초기화
    function init() {
        console.log('🚀 백업 모달 강제 표시 시스템 초기화');
        
        // 모달 생성
        ensureBackupModal();
        
        // 버튼 설정
        setupBackupButton();
        
        // 초기에는 모달 숨김
        const modal = document.getElementById('backupModal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        console.log('✅ 백업 모달 시스템 준비 완료');
    }
    
    // DOM 로드 시 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // 페이지 로드 후 재초기화
    window.addEventListener('load', function() {
        setTimeout(init, 500);
    });
    
    console.log('📦 백업 모달 강제 표시 스크립트 로드 완료');
    
})();