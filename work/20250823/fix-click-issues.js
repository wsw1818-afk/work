/**
 * 달력 클릭 문제 해결 스크립트
 * 클릭을 방해하는 요소들을 제거하고 이벤트 처리를 최적화합니다
 */

(function() {
    'use strict';
    
    console.log('🖱️ 클릭 문제 수정 스크립트 시작...');
    
    // 클릭을 방해하는 CSS 스타일 제거
    function fixClickBlockingStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* 모든 pointer-events: none 제거 */
            .day,
            .day *,
            .calendar-grid,
            .calendar-grid * {
                pointer-events: auto !important;
            }
            
            /* z-index 정리 */
            .day {
                position: relative !important;
                z-index: 1 !important;
            }
            
            .day:hover {
                z-index: 10 !important;
            }
            
            /* 날짜 클릭 영역 확대 */
            .day {
                cursor: pointer !important;
                min-height: 80px !important;
            }
            
            .day-number {
                pointer-events: none !important;
            }
            
            .memo-indicator,
            .memo-count,
            .holiday-label {
                pointer-events: none !important;
            }
            
            /* 투명 오버레이 제거 */
            .overlay,
            .modal-backdrop {
                pointer-events: none !important;
                display: none !important;
            }
            
            /* 숨겨진 모달들이 클릭 방해하지 않도록 */
            .modal[style*="display: none"],
            .modal:not([style*="display: block"]) {
                pointer-events: none !important;
                z-index: -9999 !important;
            }
            
            /* 활성 모달만 클릭 가능 */
            .modal[style*="display: block"] {
                pointer-events: auto !important;
                z-index: 9999 !important;
            }
            
            /* 달력 컨테이너 클릭 가능 확인 */
            .calendar-container {
                pointer-events: auto !important;
                position: relative !important;
                z-index: 1 !important;
            }
            
            #daysGrid {
                pointer-events: auto !important;
                position: relative !important;
                z-index: 2 !important;
            }
        `;
        document.head.appendChild(style);
        console.log('✅ 클릭 차단 스타일 수정 완료');
    }
    
    // 날짜 클릭 이벤트 재등록
    function reattachDateClickEvents() {
        const days = document.querySelectorAll('.day:not(.other-month)');
        let attachedCount = 0;
        
        days.forEach(day => {
            // 기존 이벤트 리스너 제거
            const newDay = day.cloneNode(true);
            day.parentNode.replaceChild(newDay, day);
            
            // 새 이벤트 리스너 추가
            newDay.addEventListener('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                
                // 날짜 추출
                const dayNumber = this.querySelector('.day-number');
                if (dayNumber) {
                    const date = parseInt(dayNumber.textContent);
                    const year = 2025;
                    const month = 8;
                    
                    console.log(`📅 날짜 클릭됨: ${year}-${month}-${date}`);
                    
                    // openDateMemoModal 함수 호출
                    if (typeof openDateMemoModal === 'function') {
                        openDateMemoModal(year, month, date);
                    } else {
                        console.warn('openDateMemoModal 함수를 찾을 수 없습니다');
                        // 대체 동작
                        alert(`${year}년 ${month}월 ${date}일`);
                    }
                }
            }, true); // capture phase에서 처리
            
            // 시각적 피드백 추가
            newDay.addEventListener('mousedown', function() {
                this.style.transform = 'scale(0.98)';
            });
            
            newDay.addEventListener('mouseup', function() {
                this.style.transform = 'scale(1)';
            });
            
            newDay.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
            });
            
            attachedCount++;
        });
        
        console.log(`✅ ${attachedCount}개 날짜에 클릭 이벤트 재등록 완료`);
    }
    
    // 클릭을 방해하는 요소들 제거
    function removeBlockingElements() {
        // 투명한 오버레이들 제거
        const overlays = document.querySelectorAll('.overlay, .backdrop, [class*="overlay"], [class*="backdrop"]');
        overlays.forEach(overlay => {
            if (overlay && !overlay.classList.contains('modal')) {
                overlay.style.pointerEvents = 'none';
                overlay.style.display = 'none';
            }
        });
        
        // 숨겨진 모달들 처리
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (modal.style.display !== 'block') {
                modal.style.pointerEvents = 'none';
                modal.style.zIndex = '-9999';
            }
        });
        
        console.log('✅ 클릭 방해 요소 제거 완료');
    }
    
    // 클릭 이벤트 디버깅 도구
    function enableClickDebugging() {
        document.addEventListener('click', function(e) {
            // 클릭된 요소 정보 로깅
            const path = e.composedPath();
            const target = e.target;
            
            console.group('🎯 클릭 이벤트 정보');
            console.log('클릭된 요소:', target);
            console.log('클래스:', target.className);
            console.log('ID:', target.id);
            console.log('이벤트 경로:', path.map(el => el.tagName || el).join(' > '));
            console.groupEnd();
        }, true);
    }
    
    // 모든 날짜 요소에 대해 클릭 가능 확인
    function verifyClickability() {
        const days = document.querySelectorAll('.day');
        let blockedCount = 0;
        
        days.forEach(day => {
            const computed = window.getComputedStyle(day);
            if (computed.pointerEvents === 'none') {
                day.style.pointerEvents = 'auto';
                blockedCount++;
            }
        });
        
        if (blockedCount > 0) {
            console.log(`⚠️ ${blockedCount}개 날짜 요소의 클릭 차단 해제`);
        }
    }
    
    // 초기화 함수
    function initialize() {
        console.log('🔧 클릭 문제 수정 시작...');
        
        // 1. CSS 수정
        fixClickBlockingStyles();
        
        // 2. 방해 요소 제거
        removeBlockingElements();
        
        // 3. 클릭 가능성 확인
        verifyClickability();
        
        // 4. 이벤트 재등록
        setTimeout(() => {
            reattachDateClickEvents();
        }, 500);
        
        // 5. 디버깅 활성화 (옵션)
        // enableClickDebugging();
        
        console.log('✅ 클릭 문제 수정 완료!');
    }
    
    // DOM 준비 후 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        // 이미 로드된 경우 바로 실행
        setTimeout(initialize, 100);
    }
    
    // 동적으로 추가되는 요소 처리
    const observer = new MutationObserver(function(mutations) {
        let hasCalendarChanges = false;
        
        mutations.forEach(mutation => {
            if (mutation.target.id === 'daysGrid' || 
                mutation.target.classList?.contains('calendar-grid')) {
                hasCalendarChanges = true;
            }
        });
        
        if (hasCalendarChanges) {
            console.log('📅 달력 변경 감지, 클릭 이벤트 재설정...');
            setTimeout(() => {
                removeBlockingElements();
                verifyClickability();
                reattachDateClickEvents();
            }, 100);
        }
    });
    
    // 달력 영역 관찰 시작
    setTimeout(() => {
        const calendarGrid = document.getElementById('daysGrid');
        if (calendarGrid) {
            observer.observe(calendarGrid, {
                childList: true,
                subtree: true
            });
        }
    }, 1000);
    
})();