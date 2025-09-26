// 메뉴 클릭 보장 시스템 - Menu Click Guarantee System
(function() {
    'use strict';
    
    // 메뉴 클릭 처리 통합 시스템
    const menuClickSystem = {
        // 버튼별 처리 함수
        handlers: {
            createBtn: function() {
                console.log('🆕 생성 메뉴 클릭');
                if (typeof window.modalManager !== 'undefined') {
                    window.modalManager.open('createModal');
                } else {
                    const modal = document.getElementById('createModal');
                    if (modal) {
                        this.forceShowModal(modal);
                    }
                }
            },
            
            memoBtn: function() {
                console.log('📝 스티커 메모 클릭');
                if (typeof window.openStickyMemo === 'function') {
                    window.openStickyMemo();
                } else {
                    alert('스티커 메모 기능을 준비 중입니다.');
                }
            },
            
            excelBtn: function() {
                console.log('📊 엑셀 내보내기 클릭');
                
                // 다중 방법으로 엑셀 모달 열기 시도
                const methods = [
                    // 방법 1: 모달 매니저 사용
                    () => {
                        if (typeof window.modalManager !== 'undefined') {
                            window.modalManager.open('excelModal');
                            return true;
                        }
                        return false;
                    },
                    
                    // 방법 2: 직접 모달 표시
                    () => {
                        const modal = document.getElementById('excelModal');
                        if (modal) {
                            this.forceShowModal(modal);
                            return true;
                        }
                        return false;
                    },
                    
                    // 방법 3: 모든 모달 닫고 강제 열기
                    () => {
                        // 먼저 모든 모달 닫기
                        document.querySelectorAll('.modal').forEach(m => {
                            m.style.display = 'none';
                            m.classList.remove('show');
                        });
                        
                        const modal = document.getElementById('excelModal');
                        if (modal) {
                            this.forceShowModal(modal);
                            return true;
                        }
                        return false;
                    }
                ];
                
                // 순차적으로 시도
                for (let i = 0; i < methods.length; i++) {
                    console.log(`📊 엑셀 모달 방법 ${i + 1} 시도`);
                    if (methods[i].call(this)) {
                        console.log(`✅ 엑셀 모달 방법 ${i + 1} 성공`);
                        return;
                    }
                }
                
                console.error('❌ 모든 엑셀 모달 방법 실패');
                alert('엑셀 내보내기를 준비하는 중입니다. 잠시 후 다시 시도해주세요.');
            },
            
            backupBtn: function(event) {
                console.log('📦 백업 메뉴 클릭');
                
                // 이벤트 전파 방지
                if (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                }
                
                // modal-system-fix.js와의 충돌 방지를 위한 통합 처리
                const handleBackupModal = () => {
                    // 방법 1: modalManager 시스템 사용
                    if (typeof window.modalManager === 'object' && window.modalManager.open) {
                        console.log('📦 modalManager 시스템 사용');
                        
                        // 백업 모달이 없으면 생성
                        let backupModal = document.getElementById('backupModal');
                        if (!backupModal) {
                            console.log('📦 백업 모달 생성 중...');
                            this.createBackupModal();
                            backupModal = document.getElementById('backupModal');
                        }
                        
                        if (backupModal) {
                            // 약간의 지연을 주어 DOM 안정화
                            setTimeout(() => {
                                window.modalManager.open('backupModal');
                            }, 10);
                            return true;
                        }
                    }
                    
                    // 방법 2: 기존 백업 시스템 사용 (모달 제거 없이)
                    if (typeof window.portableBackupSystem !== 'undefined' && 
                        typeof window.portableBackupSystem.openBackupModal === 'function') {
                        console.log('📦 기존 백업 시스템 사용');
                        // 모달 제거 없이 바로 실행
                        window.portableBackupSystem.openBackupModal();
                        return true;
                    }
                    
                    // 방법 3: 직접 백업 다운로드 실행
                    if (typeof window.portableBackupSystem !== 'undefined' && 
                        typeof window.portableBackupSystem.downloadBackup === 'function') {
                        console.log('📦 직접 백업 다운로드 실행');
                        window.portableBackupSystem.downloadBackup();
                        return true;
                    }
                    
                    // 방법 4: 백업 모달 동적 생성
                    console.log('📦 백업 모달 동적 생성');
                    this.createBackupModal();
                    return true;
                };
                
                try {
                    const success = handleBackupModal();
                    if (success) {
                        console.log('✅ 백업 모달 처리 성공');
                    } else {
                        console.error('❌ 백업 모달 처리 실패');
                        alert('백업 기능을 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
                    }
                } catch (error) {
                    console.error('백업 모달 처리 오류:', error);
                    alert('백업 기능 실행 중 오류가 발생했습니다.');
                }
            },
            
            unifiedCloudBtn: function() {
                console.log('☁️ 클라우드 설정 클릭 - 강력 처리 시작');
                
                // 여러 방법으로 클라우드 모달 시도
                const methods = [
                    // 방법 1: 기존 함수 사용
                    () => {
                        if (typeof window.showUnifiedCloudModal === 'function') {
                            window.showUnifiedCloudModal();
                            // 모달이 생성된 후 강제 표시
                            setTimeout(() => {
                                const modal = document.querySelector('.unified-modal, #unifiedCloudModal, #unified-modal');
                                if (modal) {
                                    this.forceShowModal(modal);
                                }
                            }, 100);
                            return true;
                        }
                        return false;
                    },
                    
                    // 방법 2: 모달 매니저 사용 (동적 생성)
                    () => {
                        try {
                            // 클라우드 모달 동적 생성
                            const modal = this.createCloudModal();
                            if (modal) {
                                this.forceShowModal(modal);
                                return true;
                            }
                        } catch (e) {
                            console.error('모달 매니저 방법 실패:', e);
                        }
                        return false;
                    },
                    
                    // 방법 3: 기존 모달 찾아서 표시
                    () => {
                        const modal = document.querySelector('.unified-modal, #unifiedCloudModal, #unified-modal');
                        if (modal) {
                            this.forceShowModal(modal);
                            return true;
                        }
                        return false;
                    }
                ];
                
                // 순차적으로 시도
                const tryMethod = async (index = 0) => {
                    if (index >= methods.length) {
                        console.error('❌ 모든 클라우드 모달 방법 실패');
                        alert('클라우드 설정을 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
                        return;
                    }
                    
                    console.log(`☁️ 클라우드 모달 방법 ${index + 1} 시도`);
                    const success = await methods[index]();
                    
                    if (!success) {
                        setTimeout(() => tryMethod(index + 1), 200);
                    } else {
                        console.log(`✅ 클라우드 모달 방법 ${index + 1} 성공`);
                    }
                };
                
                tryMethod();
            },
            
            syncStatusBtn: function() {
                console.log('🔍 동기화 상태 클릭');
                if (typeof window.showSyncStatusWindow === 'function') {
                    window.showSyncStatusWindow();
                } else {
                    alert('동기화 상태를 확인하는 중입니다.');
                }
            },
            
            settingsBtn: function() {
                console.log('⚙️ 설정 메뉴 클릭');
                if (typeof window.modalManager !== 'undefined') {
                    window.modalManager.open('settingsModal');
                } else {
                    const modal = document.getElementById('settingsModal');
                    if (modal) {
                        this.forceShowModal(modal);
                        // 설정 로드
                        if (typeof loadCurrentSettingsToModal === 'function') {
                            loadCurrentSettingsToModal();
                        }
                    }
                }
            },
            
            storageBtn: function() {
                console.log('🗄️ 저장소 관리 클릭');
                if (typeof window.modalManager !== 'undefined') {
                    window.modalManager.open('storageModal');
                } else {
                    const modal = document.getElementById('storageModal');
                    if (modal) {
                        this.forceShowModal(modal);
                        // 저장소 정보 업데이트
                        this.updateStorageInfo();
                    }
                }
            },
            
            // 모달 강제 표시 함수
            forceShowModal: function(modal) {
                if (!modal) return;
                
                console.log(`🔧 모달 강제 표시: ${modal.id}`);
                
                // 모든 다른 모달 먼저 닫기
                document.querySelectorAll('.modal, .unified-modal, .backup-modal').forEach(m => {
                    if (m !== modal) {
                        m.style.display = 'none';
                        m.classList.remove('show');
                    }
                });
                
                // 달력 영역 찾기
                const calendarContainer = document.querySelector('.calendar-container, .calendar, #calendar, main') || document.body;
                const calendarRect = calendarContainer.getBoundingClientRect();
                
                // 달력 중앙 위치 계산
                const centerX = calendarRect.left + (calendarRect.width / 2);
                const centerY = calendarRect.top + (calendarRect.height / 2);
                
                console.log(`📍 달력 위치: x=${centerX}, y=${centerY}, 영역=${calendarRect.width}x${calendarRect.height}`);
                
                // 모달 완전 강제 표시 - 달력 중앙에 위치
                modal.style.cssText = `
                    display: flex !important;
                    opacity: 1 !important;
                    visibility: visible !important;
                    z-index: 999999 !important;
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100% !important;
                    height: 100% !important;
                    background-color: rgba(0, 0, 0, 0.5) !important;
                    align-items: center !important;
                    justify-content: center !important;
                    pointer-events: auto !important;
                `;
                
                modal.classList.add('show');
                
                // 모달 내용을 달력 중앙에 위치
                const modalContent = modal.querySelector('.modal-content, .modal-dialog');
                if (modalContent) {
                    // 모달 크기 계산 (달력 영역의 80% 크기로 제한)
                    const modalWidth = Math.min(600, calendarRect.width * 0.8);
                    const modalHeight = Math.min(500, calendarRect.height * 0.8);
                    
                    modalContent.style.cssText = `
                        background: white !important;
                        border-radius: 12px !important;
                        padding: 24px !important;
                        width: ${modalWidth}px !important;
                        max-height: ${modalHeight}px !important;
                        overflow-y: auto !important;
                        position: relative !important;
                        z-index: 1000000 !important;
                        pointer-events: auto !important;
                        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
                        margin: auto !important;
                        border: 2px solid #e3e3e3 !important;
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
                    `;
                    
                    console.log(`📐 모달 크기: ${modalWidth}x${modalHeight}px (달력 영역 대비)`);
                    
                    // 모달 헤더 스타일
                    const modalHeader = modalContent.querySelector('.modal-header');
                    if (modalHeader) {
                        modalHeader.style.cssText = `
                            border-bottom: 1px solid #e9ecef !important;
                            padding-bottom: 16px !important;
                            margin-bottom: 20px !important;
                            display: flex !important;
                            justify-content: space-between !important;
                            align-items: center !important;
                        `;
                    }
                    
                    // 모달 타이틀 스타일
                    const modalTitle = modalContent.querySelector('.modal-title, h2');
                    if (modalTitle) {
                        modalTitle.style.cssText = `
                            font-size: 18px !important;
                            font-weight: 600 !important;
                            color: #333 !important;
                            margin: 0 !important;
                        `;
                    }
                    
                    // 모달 닫기 버튼 스타일
                    const closeBtn = modalContent.querySelector('.modal-close, .btn-close');
                    if (closeBtn) {
                        closeBtn.style.cssText = `
                            background: none !important;
                            border: none !important;
                            font-size: 20px !important;
                            cursor: pointer !important;
                            padding: 4px 8px !important;
                            border-radius: 4px !important;
                            transition: background-color 0.2s !important;
                        `;
                    }
                    
                    // 모달 푸터 스타일
                    const modalFooter = modalContent.querySelector('.modal-footer');
                    if (modalFooter) {
                        modalFooter.style.cssText = `
                            border-top: 1px solid #e9ecef !important;
                            padding-top: 16px !important;
                            margin-top: 20px !important;
                            display: flex !important;
                            justify-content: flex-end !important;
                            gap: 8px !important;
                        `;
                    }
                }
                
                // aria 속성
                modal.setAttribute('aria-hidden', 'false');
                modal.setAttribute('aria-modal', 'true');
                
                // body 스크롤 잠금
                document.body.classList.add('modal-open');
                document.body.style.overflow = 'hidden';
                
                console.log(`✅ 모달 강제 표시 완료: ${modal.id}`);
                console.log(`🎯 모달 현재 스타일:`, modal.style.cssText);
            },
            
            // 백업 모달 동적 생성
            createBackupModal: function() {
                console.log('📦 백업 모달 동적 생성 시작');
                
                const modalHTML = `
                <div class="modal backup-modal unified-modal" id="backupModal" style="display: none;">
                    <div class="modal-content modal-dialog modal-body">
                        <div class="modal-header">
                            <h2 class="modal-title">📦 데이터 백업</h2>
                            <button class="modal-close" onclick="window.modalManager ? window.modalManager.close('backupModal') : this.closest('.modal').style.display='none'">✕</button>
                        </div>
                        <div class="modal-body">
                            <div class="backup-section">
                                <h3>📋 메모 데이터 백업</h3>
                                <p>현재 저장된 모든 메모와 설정을 JSON 파일로 다운로드합니다.</p>
                                <button class="btn-primary" onclick="window.downloadBackupData ? window.downloadBackupData() : alert('백업 시스템을 준비 중입니다.')">
                                    💾 백업 다운로드
                                </button>
                            </div>
                            <div class="backup-section">
                                <h3>📊 백업 정보</h3>
                                <div id="backupInfo">
                                    <p>메모 개수: ${JSON.parse(localStorage.getItem('memos') || '[]').length}개</p>
                                    <p>데이터 크기: ${Math.round(JSON.stringify(localStorage.getItem('memos') || '[]').length / 1024)}KB</p>
                                    <p>백업 날짜: ${new Date().toLocaleDateString('ko-KR')}</p>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="window.modalManager ? window.modalManager.close('backupModal') : this.closest('.modal').style.display='none'">
                                닫기
                            </button>
                        </div>
                    </div>
                </div>`;
                
                // 기존 백업 모달 제거 (여러 ID 확인)
                const existingIds = ['backupModal', 'backupModalBackdrop'];
                existingIds.forEach(id => {
                    const existing = document.getElementById(id);
                    if (existing) {
                        existing.remove();
                        console.log(`📦 기존 백업 모달 제거: ${id}`);
                    }
                });
                
                // 새 모달 추가
                document.body.insertAdjacentHTML('beforeend', modalHTML);
                
                const newModal = document.getElementById('backupModal');
                if (newModal) {
                    console.log('📦 백업 모달 생성 완료, modalManager 사용 예정');
                    
                    // modalManager가 있으면 그것을 통해 열기
                    if (typeof window.modalManager === 'object' && window.modalManager.open) {
                        // 즉시 호출하지 말고 DOM이 완전히 준비된 후 호출
                        requestAnimationFrame(() => {
                            console.log('📦 modalManager.open 호출');
                            window.modalManager.open('backupModal');
                        });
                        return; // 함수 종료
                    } else {
                        console.log('📦 modalManager 없음, 직접 표시');
                        // fallback: 직접 표시
                        this.forceShowModal(newModal);
                    }
                    
                    // 백업 다운로드 함수 생성
                    if (!window.downloadBackupData) {
                        window.downloadBackupData = function() {
                            const backupData = {
                                memos: JSON.parse(localStorage.getItem('memos') || '[]'),
                                settings: JSON.parse(localStorage.getItem('calendarSettings') || '{}'),
                                theme: localStorage.getItem('theme') || 'light',
                                exportDate: new Date().toISOString()
                            };
                            
                            const blob = new Blob([JSON.stringify(backupData, null, 2)], {
                                type: 'application/json'
                            });
                            
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `memo-backup-${new Date().toISOString().slice(0, 10)}.json`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                            
                            console.log('📦 백업 다운로드 완료');
                            alert('백업 파일이 다운로드되었습니다!');
                        };
                    }
                }
                
                console.log('✅ 백업 모달 동적 생성 완료');
                return newModal;
            },
            
            // 클라우드 모달 동적 생성
            createCloudModal: function() {
                console.log('☁️ 클라우드 모달 동적 생성 시작');
                
                const modalHTML = `
                <div class="modal unified-modal" id="unifiedCloudModal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2 class="modal-title">☁️ 클라우드 설정</h2>
                            <button class="modal-close">✕</button>
                        </div>
                        <div class="modal-body">
                            <div class="cloud-section">
                                <h3>구글 드라이브 연결</h3>
                                <p>클라우드 동기화 기능을 설정합니다.</p>
                                <button class="btn-primary" onclick="alert('클라우드 기능을 준비 중입니다.')">
                                    📡 연결 설정
                                </button>
                            </div>
                            <div class="cloud-section">
                                <h3>자동 동기화</h3>
                                <p>일정과 메모를 자동으로 백업합니다.</p>
                                <button class="btn-secondary" onclick="alert('자동 동기화를 준비 중입니다.')">
                                    🔄 동기화 설정
                                </button>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-secondary" onclick="window.modalManager ? window.modalManager.close('unifiedCloudModal') : document.getElementById('unifiedCloudModal').style.display='none'">
                                닫기
                            </button>
                        </div>
                    </div>
                </div>`;
                
                // 기존 클라우드 모달 제거
                const existing = document.getElementById('unifiedCloudModal');
                if (existing) {
                    existing.remove();
                }
                
                // 새 모달 추가
                document.body.insertAdjacentHTML('beforeend', modalHTML);
                
                const newModal = document.getElementById('unifiedCloudModal');
                console.log('✅ 클라우드 모달 동적 생성 완료');
                
                return newModal;
            },
            
            // 저장소 정보 업데이트
            updateStorageInfo: function() {
                try {
                    if (typeof getStorageSize === 'function') {
                        const currentSize = getStorageSize();
                        console.log(`📊 저장소 사용량: ${currentSize}MB`);
                    }
                } catch (e) {
                    console.error('저장소 정보 업데이트 실패:', e);
                }
            }
        },
        
        // 버튼 초기화
        initButton: function(buttonId) {
            console.log(`🔧 ${buttonId} 초기화 시작`);
            
            const button = document.getElementById(buttonId);
            if (!button) {
                console.warn(`⚠️ ${buttonId} 버튼을 찾을 수 없음`);
                return;
            }
            
            // 기존 이벤트 완전 제거
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // 스타일 강화
            newButton.style.cssText += `
                pointer-events: auto !important;
                cursor: pointer !important;
                z-index: 1000 !important;
                position: relative !important;
                user-select: none !important;
            `;
            
            // 클릭 이벤트 등록 (여러 방법)
            const handler = this.handlers[buttonId];
            if (handler) {
                // 1. 일반 클릭
                newButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    
                    console.log(`🎯 ${buttonId} 클릭 감지`);
                    
                    // 시각적 피드백
                    newButton.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        newButton.style.transform = '';
                    }, 150);
                    
                    // 핸들러 실행 (이벤트 객체 전달)
                    handler.call(this.handlers, e);
                }, { passive: false });
                
                // 2. 터치 이벤트
                newButton.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    console.log(`👆 ${buttonId} 터치 감지`);
                    handler.call(this.handlers);
                }, { passive: false });
                
                // 3. 마우스다운/업
                newButton.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    newButton.style.transform = 'scale(0.95)';
                });
                
                newButton.addEventListener('mouseup', (e) => {
                    e.preventDefault();
                    newButton.style.transform = '';
                    console.log(`🖱️ ${buttonId} 마우스업 감지`);
                    setTimeout(() => handler.call(this.handlers), 50);
                });
                
                // 4. 키보드 접근성
                newButton.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handler.call(this.handlers);
                    }
                });
            }
            
            // 호버 효과
            newButton.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            });
            
            newButton.addEventListener('mouseleave', function() {
                this.style.transform = '';
                this.style.boxShadow = '';
            });
            
            console.log(`✅ ${buttonId} 초기화 완료`);
        },
        
        // 전체 초기화
        init: function() {
            console.log('🚀 메뉴 클릭 보장 시스템 시작');
            
            const buttonIds = [
                'createBtn', 'memoBtn', 'excelBtn', 'backupBtn', 'unifiedCloudBtn',
                'syncStatusBtn', 'settingsBtn', 'storageBtn'
            ];
            
            buttonIds.forEach(buttonId => {
                this.initButton(buttonId);
            });
            
            console.log('🎉 모든 메뉴 버튼 클릭 보장 완료');
        }
    };
    
    // 초기화 실행
    function initializeMenuSystem() {
        console.log('🔄 메뉴 시스템 초기화 시작');
        
        // 기존 시스템과 충돌 방지를 위한 지연
        setTimeout(() => {
            menuClickSystem.init();
        }, 200);
    }
    
    // DOM 준비시 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeMenuSystem);
    } else {
        initializeMenuSystem();
    }
    
    // 페이지 로드 완료 후 재확인
    window.addEventListener('load', function() {
        setTimeout(initializeMenuSystem, 500);
    });
    
    // 전역 접근
    window.menuClickSystem = menuClickSystem;
    
    console.log('🔧 메뉴 클릭 보장 시스템 로드 완료');
    
})();