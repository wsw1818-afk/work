// 달력 표시 및 메모 모달 재열림 문제 해결
(function() {
    'use strict';
    
    console.log('🔧 달력 및 모달 수정 시스템 시작');
    
    // ===== 1. 달력 표시 문제 해결 =====
    function fixCalendarDisplay() {
        console.log('📅 달력 표시 수정 시작');
        
        // 달력 컨테이너 찾기
        const calendarContainer = document.querySelector('.calendar-container');
        if (!calendarContainer) {
            console.warn('⚠️ 달력 컨테이너를 찾을 수 없음');
            return;
        }
        
        // days-grid 요소 확인
        const daysGrid = calendarContainer.querySelector('.days-grid');
        if (daysGrid) {
            // 그리드 레이아웃 강제 적용
            daysGrid.style.display = 'grid';
            daysGrid.style.gridTemplateColumns = 'repeat(7, 1fr)';
            daysGrid.style.gap = '0';
            daysGrid.style.width = '100%';
            daysGrid.style.boxSizing = 'border-box';
            
            // 각 날짜 셀 스타일 수정
            const dayCells = daysGrid.querySelectorAll('.day');
            dayCells.forEach(cell => {
                cell.style.width = '100%';
                cell.style.boxSizing = 'border-box';
                cell.style.minHeight = '100px';
                cell.style.padding = '8px';
            });
            
            console.log('✅ 달력 그리드 레이아웃 수정 완료');
        }
        
        // weekdays 헤더 수정
        const weekdays = calendarContainer.querySelector('.weekdays');
        if (weekdays) {
            weekdays.style.display = 'grid';
            weekdays.style.gridTemplateColumns = 'repeat(7, 1fr)';
            weekdays.style.gap = '0';
            weekdays.style.width = '100%';
            weekdays.style.boxSizing = 'border-box';
            
            console.log('✅ 요일 헤더 레이아웃 수정 완료');
        }
        
        // 전체 캘린더 컨테이너 크기 조정
        calendarContainer.style.width = '100%';
        calendarContainer.style.maxWidth = '100%';
        calendarContainer.style.overflow = 'visible';
        
        // z-index 문제 해결
        calendarContainer.style.position = 'relative';
        calendarContainer.style.zIndex = '1';
        
        console.log('✅ 달력 표시 문제 해결 완료');
    }
    
    // ===== 2. 메모 모달 재열림 문제 해결 =====
    
    // 모달 상태 추적기
    const ModalStateTracker = {
        states: new Map(),
        blockedModals: new Set(),
        
        // 모달 상태 초기화
        resetModal(modalId) {
            this.states.delete(modalId);
            this.blockedModals.delete(modalId);
            console.log(`🔄 모달 상태 초기화: ${modalId}`);
        },
        
        // 모달이 차단되었는지 확인
        isBlocked(modalId) {
            return this.blockedModals.has(modalId);
        },
        
        // 모달 차단 해제
        unblock(modalId) {
            this.blockedModals.delete(modalId);
            this.states.delete(modalId);
            console.log(`✅ 모달 차단 해제: ${modalId}`);
        },
        
        // 모든 모달 상태 초기화
        resetAll() {
            this.states.clear();
            this.blockedModals.clear();
            console.log('🔄 모든 모달 상태 초기화');
        }
    };
    
    // 전역 openMemoModal 함수 수정
    function fixMemoModalOpening() {
        console.log('🔧 메모 모달 열기 함수 수정 시작');
        
        // 기존 openMemoModal 함수 백업
        const originalOpenMemoModal = window.openMemoModal;
        
        // 개선된 openMemoModal 함수
        window.openMemoModal = function(date) {
            console.log(`📝 메모 모달 열기 시도: ${date}`);
            
            // 모달 상태 초기화
            ModalStateTracker.resetModal('memoModal');
            ModalStateTracker.resetModal('improvedMemoModal');
            ModalStateTracker.resetModal('dateMemoModal');
            
            // 모든 가능한 메모 모달 찾기
            const modalIds = [
                'memoModal',
                'improvedMemoModal', 
                'dateMemoModal',
                'memoDetailModal'
            ];
            
            let modalOpened = false;
            
            for (const modalId of modalIds) {
                const modal = document.getElementById(modalId);
                if (modal) {
                    // 모달 상태 완전 초기화
                    modal.style.display = 'none';
                    modal.style.visibility = 'hidden';
                    modal.style.opacity = '0';
                    modal.classList.remove('show', 'visible', 'active', 'open');
                    modal.classList.remove('closing', 'closed', 'hiding', 'hidden');
                    
                    // 잠시 후 모달 열기
                    setTimeout(() => {
                        modal.style.display = 'block';
                        modal.style.visibility = 'visible';
                        modal.style.opacity = '1';
                        modal.classList.add('show', 'visible', 'active', 'open');
                        console.log(`✅ 모달 열림: ${modalId}`);
                    }, 50);
                    
                    modalOpened = true;
                }
            }
            
            // 원래 함수도 호출 (있는 경우)
            if (originalOpenMemoModal && typeof originalOpenMemoModal === 'function') {
                try {
                    originalOpenMemoModal.call(this, date);
                } catch (error) {
                    console.error('원래 openMemoModal 함수 오류:', error);
                }
            }
            
            // UnifiedCalendar 시스템의 openModal 호출
            if (window.UnifiedCalendar && typeof window.UnifiedCalendar.openModal === 'function') {
                try {
                    window.UnifiedCalendar.openModal(date);
                } catch (error) {
                    console.error('UnifiedCalendar.openModal 오류:', error);
                }
            }
            
            // CalendarApp의 openModal 호출
            if (window.CalendarApp && typeof window.CalendarApp.openModal === 'function') {
                try {
                    window.CalendarApp.openModal(date);
                } catch (error) {
                    console.error('CalendarApp.openModal 오류:', error);
                }
            }
            
            if (!modalOpened) {
                console.warn('⚠️ 메모 모달을 찾을 수 없음');
            }
        };
        
        console.log('✅ 메모 모달 열기 함수 수정 완료');
    }
    
    // 메모 모달 닫기 함수 수정
    function fixMemoModalClosing() {
        console.log('🔧 메모 모달 닫기 함수 수정 시작');
        
        // 기존 closeMemoModal 함수 백업
        const originalCloseMemoModal = window.closeMemoModal;
        
        // 개선된 closeMemoModal 함수
        window.closeMemoModal = function() {
            console.log('📝 메모 모달 닫기');
            
            // 모든 모달 상태 초기화
            ModalStateTracker.resetAll();
            
            // 모든 가능한 메모 모달 닫기
            const modalIds = [
                'memoModal',
                'improvedMemoModal',
                'dateMemoModal', 
                'memoDetailModal'
            ];
            
            modalIds.forEach(modalId => {
                const modal = document.getElementById(modalId);
                if (modal) {
                    modal.style.display = 'none';
                    modal.style.visibility = 'hidden';
                    modal.style.opacity = '0';
                    modal.classList.remove('show', 'visible', 'active', 'open');
                    modal.classList.add('closed');
                    
                    // 상태 플래그 초기화
                    delete modal.dataset.isOpen;
                    delete modal.dataset.isClosing;
                    
                    console.log(`✅ 모달 닫힘: ${modalId}`);
                }
            });
            
            // 원래 함수도 호출 (있는 경우)
            if (originalCloseMemoModal && typeof originalCloseMemoModal === 'function') {
                try {
                    originalCloseMemoModal.call(this);
                } catch (error) {
                    console.error('원래 closeMemoModal 함수 오류:', error);
                }
            }
            
            // UnifiedCalendar 시스템의 closeModal 호출
            if (window.UnifiedCalendar && typeof window.UnifiedCalendar.closeModal === 'function') {
                try {
                    window.UnifiedCalendar.closeModal();
                } catch (error) {
                    console.error('UnifiedCalendar.closeModal 오류:', error);
                }
            }
            
            // 전역 상태 플래그 초기화
            if (window.isModalOpen !== undefined) {
                window.isModalOpen = false;
            }
            if (window.modalOpen !== undefined) {
                window.modalOpen = false;
            }
            
            console.log('✅ 메모 모달 닫기 완료 및 상태 초기화');
        };
        
        console.log('✅ 메모 모달 닫기 함수 수정 완료');
    }
    
    // ===== 3. 모달 이벤트 리스너 재등록 =====
    function reattachModalEventListeners() {
        console.log('🔧 모달 이벤트 리스너 재등록');
        
        // 날짜 클릭 이벤트 재등록
        const dayElements = document.querySelectorAll('.day');
        dayElements.forEach(dayEl => {
            // 기존 이벤트 제거
            const newDayEl = dayEl.cloneNode(true);
            dayEl.parentNode.replaceChild(newDayEl, dayEl);
            
            // 새 이벤트 등록
            newDayEl.addEventListener('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                
                const date = this.dataset.date || this.getAttribute('data-date');
                if (date) {
                    console.log(`📅 날짜 클릭: ${date}`);
                    
                    // 모달 상태 초기화
                    ModalStateTracker.resetAll();
                    
                    // 약간의 지연 후 모달 열기
                    setTimeout(() => {
                        window.openMemoModal(date);
                    }, 100);
                }
            });
        });
        
        console.log(`✅ ${dayElements.length}개 날짜 요소에 이벤트 재등록 완료`);
    }
    
    // ===== 4. 전역 상태 플래그 모니터링 =====
    function monitorGlobalStates() {
        // 전역 상태 플래그들을 주기적으로 확인하고 초기화
        const checkInterval = setInterval(() => {
            // isModalOpen 플래그 확인
            if (window.isModalOpen === true) {
                const visibleModal = document.querySelector('.modal.show, .modal[style*="display: block"]');
                if (!visibleModal) {
                    window.isModalOpen = false;
                    console.log('🔄 isModalOpen 플래그 초기화');
                }
            }
            
            // modalOpen 플래그 확인
            if (window.modalOpen === true) {
                const visibleModal = document.querySelector('.modal.show, .modal[style*="display: block"]');
                if (!visibleModal) {
                    window.modalOpen = false;
                    console.log('🔄 modalOpen 플래그 초기화');
                }
            }
        }, 2000); // 2초마다 확인
        
        // 10분 후 모니터링 중지
        setTimeout(() => {
            clearInterval(checkInterval);
            console.log('🛑 전역 상태 모니터링 중지');
        }, 600000);
    }
    
    // ===== 5. CSS 충돌 해결 =====
    function fixCSSConflicts() {
        const style = document.createElement('style');
        style.textContent = `
            /* 달력 그리드 레이아웃 강제 적용 */
            .calendar-container {
                width: 100% !important;
                max-width: 100% !important;
                overflow: visible !important;
                position: relative !important;
                z-index: 1 !important;
            }
            
            .days-grid {
                display: grid !important;
                grid-template-columns: repeat(7, 1fr) !important;
                gap: 0 !important;
                width: 100% !important;
                box-sizing: border-box !important;
            }
            
            .weekdays {
                display: grid !important;
                grid-template-columns: repeat(7, 1fr) !important;
                gap: 0 !important;
                width: 100% !important;
                box-sizing: border-box !important;
            }
            
            .day {
                width: 100% !important;
                box-sizing: border-box !important;
                min-height: 100px !important;
                cursor: pointer !important;
            }
            
            /* 모달 상태 초기화 */
            .modal.closed {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
            }
            
            .modal.show,
            .modal.visible,
            .modal.active,
            .modal.open {
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
            }
            
            /* 모달 z-index 보정 */
            #memoModal,
            #improvedMemoModal,
            #dateMemoModal,
            #memoDetailModal {
                z-index: 9999 !important;
            }
        `;
        document.head.appendChild(style);
        console.log('✅ CSS 충돌 해결 스타일 적용');
    }
    
    // ===== 초기화 함수 =====
    function initialize() {
        console.log('🚀 달력 및 모달 수정 초기화 시작');
        
        // 1. CSS 충돌 해결
        fixCSSConflicts();
        
        // 2. 달력 표시 문제 해결
        fixCalendarDisplay();
        
        // 3. 메모 모달 함수 수정
        fixMemoModalOpening();
        fixMemoModalClosing();
        
        // 4. 이벤트 리스너 재등록
        reattachModalEventListeners();
        
        // 5. 전역 상태 모니터링 시작
        monitorGlobalStates();
        
        // 달력 재렌더링 시 다시 수정 적용
        if (window.CalendarApp && window.CalendarApp.render) {
            const originalRender = window.CalendarApp.render;
            window.CalendarApp.render = function() {
                const result = originalRender.apply(this, arguments);
                setTimeout(() => {
                    fixCalendarDisplay();
                    reattachModalEventListeners();
                }, 100);
                return result;
            };
        }
        
        console.log('✅ 달력 및 모달 수정 초기화 완료');
    }
    
    // DOM 로드 완료 시 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        // 이미 로드된 경우 즉시 실행
        setTimeout(initialize, 100);
    }
    
    // 페이지 로드 완료 후에도 한 번 더 실행
    window.addEventListener('load', () => {
        setTimeout(() => {
            fixCalendarDisplay();
            reattachModalEventListeners();
        }, 500);
    });
    
    // 전역 접근 가능하도록 노출
    window.CalendarModalFix = {
        fixCalendarDisplay,
        fixMemoModalOpening,
        fixMemoModalClosing,
        reattachModalEventListeners,
        resetModalStates: () => ModalStateTracker.resetAll(),
        initialize
    };
    
})();