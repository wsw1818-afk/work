// 모든 모달을 달력 요일 영역에 위치시키는 통합 시스템
(function() {
    'use strict';
    
    console.log('🌐 통합 모달 위치 시스템 시작');
    
    // 달력 요일 영역 찾기 함수
    function findWeekdayArea() {
        // 요일 헤더 찾기
        const weekdayHeaders = document.querySelectorAll('th, .weekday, .day-header');
        let weekdayArea = null;
        
        for (const header of weekdayHeaders) {
            const text = header.textContent.trim();
            if (['일', '월', '화', '수', '목', '금', '토', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].includes(text)) {
                weekdayArea = header.closest('table, .calendar-header, .week-header') || header.parentElement;
                console.log('📅 요일 영역 발견:', weekdayArea);
                break;
            }
        }
        
        // 요일 영역을 찾지 못한 경우 달력 테이블 찾기
        if (!weekdayArea) {
            weekdayArea = document.querySelector('table') || document.querySelector('.calendar');
            console.log('📅 대체 달력 영역 사용:', weekdayArea);
        }
        
        return weekdayArea;
    }
    
    // 모달을 요일 영역에 위치시키는 함수
    function positionModalNearWeekdays(modal, modalWidth = 650, modalHeight = 750) {
        const weekdayArea = findWeekdayArea();
        
        if (!weekdayArea) {
            console.warn('⚠️ 요일 영역을 찾을 수 없음 - 기본 위치 사용');
            return;
        }
        
        const rect = weekdayArea.getBoundingClientRect();
        const container = modal.querySelector('.modal-content, .modal-dialog, .backup-modal-container, .cloud-modal-container');
        
        if (!container) {
            console.warn('⚠️ 모달 컨테이너를 찾을 수 없음');
            return;
        }
        
        // 요일 영역 위쪽에 모달 위치시키기
        const leftPos = Math.max(10, rect.left + (rect.width - modalWidth) / 2);
        const topPos = Math.max(10, rect.top - modalHeight - 20);
        
        console.log(`📍 모달 위치 설정: left=${leftPos}px, top=${topPos}px`);
        console.log(`📐 요일 영역: x=${rect.left}, y=${rect.top}, width=${rect.width}, height=${rect.height}`);
        
        // 모달 배경은 전체 화면 덮기
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
        
        // 모달 컨테이너는 요일 영역 근처에 위치
        container.style.cssText = `
            position: fixed !important;
            left: ${leftPos}px !important;
            top: ${topPos}px !important;
            width: ${modalWidth}px !important;
            max-height: ${modalHeight}px !important;
            transform: none !important;
            background: white !important;
            border-radius: 12px !important;
            padding: 24px !important;
            overflow-y: auto !important;
            z-index: 1000000 !important;
            pointer-events: auto !important;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
            border: 2px solid #e3e3e3 !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        `;
        
        // aria 속성 설정
        modal.setAttribute('aria-hidden', 'false');
        modal.setAttribute('aria-modal', 'true');
    }
    
    // 모달 닫기 핸들러 설정
    function setupModalCloseHandlers(modal) {
        console.log(`🔧 모달 닫기 핸들러 설정: ${modal.id}`);
        
        // 기존 닫기 핸들러 제거
        const existingCloseHandlers = modal.querySelectorAll('[data-close-handler]');
        existingCloseHandlers.forEach(handler => handler.remove());
        
        // 닫기 버튼이 없는 모달에 닫기 버튼 추가
        addCloseButtonIfMissing(modal);
        
        // 1. 닫기 버튼들 찾기
        const closeButtons = modal.querySelectorAll('.modal-close, .btn-close, .close, [data-dismiss="modal"]');
        closeButtons.forEach(btn => {
            // 기존 이벤트 제거
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                closeModal(modal);
            });
            
            newBtn.setAttribute('data-close-handler', 'true');
        });
        
        // 2. 배경 클릭으로 닫기
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
        
        // 3. ESC 키로 닫기
        const escHandler = function(e) {
            if (e.key === 'Escape') {
                closeModal(modal);
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
        
        // 4. 취소/닫기 텍스트 버튼들
        const cancelButtons = modal.querySelectorAll('button');
        cancelButtons.forEach(btn => {
            const text = btn.textContent.trim();
            if (['닫기', '취소', 'Close', 'Cancel'].includes(text)) {
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);
                
                newBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    closeModal(modal);
                });
                
                newBtn.setAttribute('data-close-handler', 'true');
            }
        });
        
        // 5. 엑셀 모달의 경우 기능 버튼들 복원
        if (modal.id === 'excelModal') {
            restoreExcelModalFunctionality(modal);
        }
        
        console.log(`✅ 모달 닫기 핸들러 설정 완료: ${modal.id}`);
    }
    
    // 엑셀 모달 기능 복원
    function restoreExcelModalFunctionality(modal) {
        console.log('📊 엑셀 모달 기능 복원');
        
        // 미리보기 버튼 복원
        const previewBtn = modal.querySelector('.btn-info, [onclick*="preview"]');
        if (previewBtn && !previewBtn.hasAttribute('data-excel-restored')) {
            previewBtn.setAttribute('data-excel-restored', 'true');
            previewBtn.onclick = function() {
                if (typeof previewExcelData === 'function') {
                    previewExcelData();
                } else {
                    alert('미리보기 기능이 로드되지 않았습니다.');
                }
            };
            console.log('✅ 엑셀 미리보기 버튼 복원');
        }
        
        // 내보내기 버튼 복원
        const exportBtn = modal.querySelector('.btn-primary, [onclick*="processExcelExport"]');
        if (exportBtn && !exportBtn.hasAttribute('data-excel-restored')) {
            exportBtn.setAttribute('data-excel-restored', 'true');
            exportBtn.onclick = function() {
                if (typeof processExcelExport === 'function') {
                    processExcelExport();
                } else {
                    alert('내보내기 기능이 로드되지 않았습니다.');
                }
            };
            console.log('✅ 엑셀 내보내기 버튼 복원');
        }
        
        // 기간 선택 변경 이벤트 복원
        const periodSelect = modal.querySelector('#exportPeriod');
        if (periodSelect && !periodSelect.hasAttribute('data-excel-restored')) {
            periodSelect.setAttribute('data-excel-restored', 'true');
            
            // 기존 이벤트를 제거하지 말고 추가
            periodSelect.addEventListener('change', function() {
                const customPeriod = document.getElementById('customPeriod');
                if (customPeriod) {
                    if (this.value === 'custom') {
                        customPeriod.style.display = 'block';
                        console.log('✅ 사용자 지정 날짜 기간 표시');
                    } else {
                        customPeriod.style.display = 'none';
                        console.log('📅 기본 기간 모드');
                    }
                }
                
                // 기존 toggleCustomPeriod 함수도 호출 (있다면)
                if (typeof toggleCustomPeriod === 'function') {
                    toggleCustomPeriod();
                }
            });
            
            // 초기 상태 설정
            setTimeout(() => {
                const event = new Event('change');
                periodSelect.dispatchEvent(event);
            }, 100);
            
            console.log('✅ 엑셀 기간 선택 기능 복원');
        }
        
        console.log('✅ 엑셀 모달 전체 기능 복원 완료');
    }
    
    // 엑셀 버튼 이벤트 핸들러 복원 
    function restoreExcelButtonHandler() {
        const excelBtn = document.getElementById('excelBtn');
        if (excelBtn && !excelBtn.hasAttribute('data-excel-btn-restored')) {
            excelBtn.setAttribute('data-excel-btn-restored', 'true');
            
            // 기존 이벤트 리스너는 유지하고 추가
            excelBtn.addEventListener('click', function(e) {
                console.log('📊 엑셀 버튼 클릭됨 (복원된 핸들러)');
                
                const excelModal = document.getElementById('excelModal');
                if (excelModal) {
                    // 다른 모든 모달 닫기
                    document.querySelectorAll('.modal').forEach(m => {
                        if (m !== excelModal) {
                            m.style.display = 'none';
                        }
                    });
                    
                    // 엑셀 모달 표시
                    excelModal.style.display = 'block';
                    
                    // 위치 조정
                    setTimeout(() => {
                        positionModalNearWeekdays(excelModal, 630, 700);
                        setupModalCloseHandlers(excelModal);
                    }, 50);
                    
                    console.log('✅ 엑셀 모달 열림 (복원된 핸들러)');
                } else {
                    console.error('❌ 엑셀 모달을 찾을 수 없음');
                    alert('엑셀 모달을 찾을 수 없습니다.');
                }
            });
            
            console.log('✅ 엑셀 버튼 이벤트 핸들러 복원 완료');
        }
    }
    
    // 닫기 버튼이 없는 모달에 닫기 버튼 추가
    function addCloseButtonIfMissing(modal) {
        // 기존 닫기 버튼이 있는지 확인
        const existingCloseBtn = modal.querySelector('.modal-close, .btn-close, .close, [data-dismiss="modal"]');
        if (existingCloseBtn) {
            return; // 이미 닫기 버튼이 있음
        }
        
        console.log(`➕ 닫기 버튼 추가 필요: ${modal.id}`);
        
        // 모달 헤더 찾기
        let header = modal.querySelector('.modal-header');
        if (!header) {
            // 모달 컨텐츠 상단에서 헤더 찾기
            const content = modal.querySelector('.modal-content, .modal-dialog, .modal-body');
            if (content) {
                header = content.querySelector('h1, h2, h3, h4, h5, h6')?.closest('div');
                if (!header && content.children.length > 0) {
                    header = content.children[0];
                }
            }
        }
        
        if (header) {
            // 헤더가 있으면 거기에 닫기 버튼 추가
            const closeBtn = document.createElement('button');
            closeBtn.className = 'modal-close auto-added-close';
            closeBtn.innerHTML = '✕';
            closeBtn.style.cssText = `
                position: absolute;
                top: 10px;
                right: 15px;
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
                padding: 5px 10px;
                z-index: 10;
                border-radius: 50%;
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
            `;
            
            // 호버 효과 추가
            closeBtn.addEventListener('mouseenter', function() {
                this.style.background = '#f5f5f5';
                this.style.color = '#333';
                this.style.transform = 'rotate(90deg)';
            });
            
            closeBtn.addEventListener('mouseleave', function() {
                this.style.background = 'none';
                this.style.color = '#666';
                this.style.transform = '';
            });
            
            // 헤더에 상대적 위치 설정
            if (getComputedStyle(header).position === 'static') {
                header.style.position = 'relative';
            }
            
            header.appendChild(closeBtn);
            console.log(`✅ 닫기 버튼 추가 완료: ${modal.id}`);
        } else {
            // 헤더가 없으면 모달 컨텐츠 상단에 닫기 버튼 추가
            const content = modal.querySelector('.modal-content, .modal-dialog, .modal-body');
            if (content) {
                const closeBtn = document.createElement('button');
                closeBtn.className = 'modal-close auto-added-close';
                closeBtn.innerHTML = '✕';
                closeBtn.style.cssText = `
                    position: absolute;
                    top: 10px;
                    right: 15px;
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #666;
                    padding: 5px 10px;
                    z-index: 10;
                    border-radius: 50%;
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                `;
                
                // 호버 효과 추가
                closeBtn.addEventListener('mouseenter', function() {
                    this.style.background = '#f5f5f5';
                    this.style.color = '#333';
                    this.style.transform = 'rotate(90deg)';
                });
                
                closeBtn.addEventListener('mouseleave', function() {
                    this.style.background = 'none';
                    this.style.color = '#666';
                    this.style.transform = '';
                });
                
                // 컨텐츠에 상대적 위치 설정
                if (getComputedStyle(content).position === 'static') {
                    content.style.position = 'relative';
                }
                
                content.appendChild(closeBtn);
                console.log(`✅ 컨텐츠에 닫기 버튼 추가 완료: ${modal.id}`);
            }
        }
    }
    
    // 모달 닫기 함수
    function closeModal(modal) {
        console.log(`🚪 모달 닫기: ${modal.id}`);
        
        // 모달 숨기기
        modal.style.display = 'none';
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
        
        // body 스크롤 복원
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        
        // modalManager 닫기 함수 호출
        if (window.modalManager && window.modalManager.close) {
            try {
                window.modalManager.close(modal.id);
            } catch (error) {
                console.log('modalManager 닫기 실패 (무시):', error);
            }
        }
        
        console.log(`✅ 모달 닫기 완료: ${modal.id}`);
    }
    
    // menu-click-guarantee.js의 forceShowModal 함수 재정의
    function overrideForceShowModal() {
        if (window.menuClickSystem && window.menuClickSystem.handlers && window.menuClickSystem.handlers.forceShowModal) {
            const originalForceShowModal = window.menuClickSystem.handlers.forceShowModal;
            
            window.menuClickSystem.handlers.forceShowModal = function(modal) {
                if (!modal) return;
                
                console.log(`🌐 통합 위치 시스템으로 모달 표시: ${modal.id}`);
                
                // 모든 다른 모달 먼저 닫기
                document.querySelectorAll('.modal, .unified-modal, .backup-modal').forEach(m => {
                    if (m !== modal) {
                        m.style.display = 'none';
                        m.classList.remove('show');
                    }
                });
                
                // 요일 영역에 위치시키기 (세로 크기 대폭 확대)
                let modalWidth = 650;
                let modalHeight = 750;
                
                // 모달 종류에 따라 크기 조정
                if (modal.id.includes('create')) {
                    modalWidth = 600;
                    modalHeight = 700;
                } else if (modal.id.includes('settings')) {
                    modalWidth = 700;
                    modalHeight = 800;
                } else if (modal.id.includes('storage')) {
                    modalWidth = 650;
                    modalHeight = 700;
                } else if (modal.id.includes('excel')) {
                    modalWidth = 630;
                    modalHeight = 700;
                }
                
                positionModalNearWeekdays(modal, modalWidth, modalHeight);
                
                modal.classList.add('show');
                
                // 모달 닫기 기능 강화
                setupModalCloseHandlers(modal);
                
                // body 스크롤 잠금
                document.body.classList.add('modal-open');
                document.body.style.overflow = 'hidden';
                
                console.log(`✅ 통합 위치 모달 표시 완료: ${modal.id}`);
            };
            
            console.log('✅ menuClickSystem.forceShowModal 재정의 완료');
        }
    }
    
    // 클라우드 모달 위치도 수정
    function updateCloudModalPosition() {
        if (window.CloudModalOverride && window.CloudModalOverride.open) {
            const originalOpen = window.CloudModalOverride.open;
            
            window.CloudModalOverride.open = function() {
                console.log('☁️ 클라우드 모달 위치 수정');
                
                // 다른 모달 닫기
                document.querySelectorAll('.modal, .unified-modal, .backup-modal-override').forEach(m => {
                    if (m.style.display !== 'none') {
                        m.style.display = 'none';
                    }
                });
                
                this.modal.classList.add('active');
                this.isOpen = true;
                
                // 요일 영역에 위치시키기 (클라우드 모달은 더 크게)
                positionModalNearWeekdays(this.modal, 600, 700);
                
                // 닫기 핸들러 설정 (클라우드 모달은 자체 핸들러 사용)
                // setupModalCloseHandlers(this.modal);
                
                // body 스크롤 방지
                document.body.style.overflow = 'hidden';
            };
            
            console.log('✅ CloudModalOverride 위치 재정의 완료');
        }
    }
    
    // 모든 모달에 통합 위치 적용하는 함수
    function applyUniversalPositioning() {
        console.log('🌐 모든 모달에 통합 위치 적용');
        
        // 기존 모달들 찾아서 위치 수정
        const allModals = document.querySelectorAll('.modal, .unified-modal, [id*="Modal"], [id*="modal"]');
        
        allModals.forEach(modal => {
            if (modal.style.display !== 'none' && !modal.classList.contains('backup-modal-override') && !modal.classList.contains('cloud-modal-override')) {
                console.log(`🎯 모달 위치 수정: ${modal.id}`);
                positionModalNearWeekdays(modal);
                setupModalCloseHandlers(modal);
            }
        });
    }
    
    // MutationObserver로 새로 생성되는 모달 감지
    function observeNewModals() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        // 새로 추가된 모달 확인
                        if (node.classList && (node.classList.contains('modal') || node.classList.contains('unified-modal'))) {
                            console.log('🆕 새로운 모달 감지:', node.id);
                            setTimeout(() => {
                                if (node.style.display !== 'none') {
                                    positionModalNearWeekdays(node);
                                    setupModalCloseHandlers(node);
                                }
                            }, 100);
                        }
                        
                        // 하위 요소 중 모달 확인
                        const childModals = node.querySelectorAll && node.querySelectorAll('.modal, .unified-modal, [id*="Modal"], [id*="modal"]');
                        if (childModals) {
                            childModals.forEach(childModal => {
                                console.log('🆕 새로운 하위 모달 감지:', childModal.id);
                                setTimeout(() => {
                                    if (childModal.style.display !== 'none') {
                                        positionModalNearWeekdays(childModal);
                                        setupModalCloseHandlers(childModal);
                                    }
                                }, 100);
                            });
                        }
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('👁️ 새로운 모달 감지 Observer 시작');
    }
    
    // modalManager의 open 함수도 재정의
    function overrideModalManager() {
        // modalManager가 로드될 때까지 기다리기
        const checkModalManager = () => {
            if (window.modalManager && window.modalManager.open) {
                const originalOpen = window.modalManager.open;
                
                window.modalManager.open = function(modalId) {
                    console.log(`🌐 modalManager.open 호출: ${modalId}`);
                    
                    // 원래 함수 실행
                    const result = originalOpen.call(this, modalId);
                    
                    // 모달이 열린 후 위치 조정
                    setTimeout(() => {
                        const modal = document.getElementById(modalId);
                        if (modal && modal.style.display !== 'none') {
                            console.log(`🎯 modalManager 모달 위치 조정: ${modalId}`);
                            positionModalNearWeekdays(modal);
                            setupModalCloseHandlers(modal);
                        }
                    }, 100);
                    
                    return result;
                };
                
                console.log('✅ modalManager.open 재정의 완료');
                return true;
            }
            return false;
        };
        
        // 즉시 확인하고, 없으면 주기적으로 확인
        if (!checkModalManager()) {
            const interval = setInterval(() => {
                if (checkModalManager()) {
                    clearInterval(interval);
                }
            }, 500);
        }
    }
    
    // 초기화 함수
    function initialize() {
        console.log('🌐 통합 모달 위치 시스템 초기화');
        
        // 1. menu-click-guarantee의 forceShowModal 재정의
        setTimeout(() => {
            overrideForceShowModal();
        }, 100);
        
        // 2. 클라우드 모달 위치 수정
        setTimeout(() => {
            updateCloudModalPosition();
        }, 200);
        
        // 3. modalManager 재정의
        setTimeout(() => {
            overrideModalManager();
        }, 300);
        
        // 4. 기존 모달들 위치 수정
        setTimeout(() => {
            applyUniversalPositioning();
        }, 500);
        
        // 5. 새로운 모달 감지 시작
        setTimeout(() => {
            observeNewModals();
        }, 600);
        
        // 6. 엑셀 버튼 핸들러 복원
        setTimeout(() => {
            restoreExcelButtonHandler();
        }, 700);
        
        // 7. 주기적으로 재적용 (다른 스크립트가 덮어쓸 수 있으므로)
        setInterval(() => {
            overrideForceShowModal();
            updateCloudModalPosition();
            restoreExcelButtonHandler(); // 엑셀 버튼 핸들러도 주기적으로 복원
        }, 2000);
        
        console.log('✅ 통합 모달 위치 시스템 초기화 완료');
    }
    
    // DOM 준비 시 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
    // 페이지 로드 후 재초기화
    window.addEventListener('load', function() {
        setTimeout(initialize, 700);
    });
    
    console.log('🌐 통합 모달 위치 스크립트 로드 완료');
    
})();