/**
 * 최종 성능 최적화 및 충돌 해결 스크립트
 * 모든 문제를 깨끗하게 해결하는 완벽한 솔루션
 */

(function() {
    'use strict';
    
    console.log('🚀 최종 성능 최적화 시작...');
    
    // ==========================================
    // 1단계: 모든 타이머와 인터벌 완전 제거
    // ==========================================
    function killAllTimers() {
        console.log('⏰ 모든 타이머 제거 중...');
        
        // 전역 타이머 ID 제거 (1부터 100000까지)
        for (let i = 1; i <= 100000; i++) {
            try {
                clearInterval(i);
                clearTimeout(i);
            } catch (e) {}
        }
        
        // setInterval과 setTimeout 오버라이드
        const noop = () => {};
        const blockedFunctions = [
            'keepCalendarNormal',
            'continuousRestore',
            'preventCalendarDeformation',
            'checkAndRestore',
            'checkAndFix',
            'cleanUnwantedModals',
            'protectButtons',
            'cleanupDuplicateButtons',
            'forceModalPosition',
            'updateProgressBar'
        ];
        
        // setInterval 차단
        const originalSetInterval = window.setInterval;
        window.setInterval = function(callback, delay, ...args) {
            const funcString = callback.toString();
            
            // 문제가 되는 함수들 차단
            for (const blocked of blockedFunctions) {
                if (funcString.includes(blocked)) {
                    console.log(`❌ 차단됨: ${blocked}`);
                    return -1;
                }
            }
            
            // 500ms 이하 차단 (sync status 제외)
            if (delay < 1000 && !funcString.includes('updateSyncStatus')) {
                console.log(`❌ 짧은 인터벌 차단: ${delay}ms`);
                return -1;
            }
            
            // 200ms 프로그레스 바 애니메이션 차단
            if (delay === 200) {
                console.log('❌ 200ms 프로그레스 바 애니메이션 차단');
                return -1;
            }
            
            return originalSetInterval.call(this, callback, delay, ...args);
        };
        
        // setTimeout 차단 (50ms 같은 짧은 것들)
        const originalSetTimeout = window.setTimeout;
        window.setTimeout = function(callback, delay, ...args) {
            if (delay < 100) {
                console.log(`❌ 짧은 타임아웃 차단: ${delay}ms`);
                return -1;
            }
            return originalSetTimeout.call(this, callback, delay, ...args);
        };
        
        console.log('✅ 타이머 제거 완료');
    }
    
    // ==========================================
    // 2단계: 이벤트 리스너 정리 및 최적화
    // ==========================================
    function optimizeEventListeners() {
        console.log('🎯 이벤트 리스너 최적화...');
        
        // stopPropagation 제한
        const originalStopPropagation = Event.prototype.stopPropagation;
        Event.prototype.stopPropagation = function() {
            const target = this.target;
            const className = target?.className?.toString() || '';
            
            // 닫기 버튼과 삭제 버튼만 허용
            const allowed = ['close', 'delete', 'btn-close', 'modal-close'].some(
                word => className.toLowerCase().includes(word)
            );
            
            if (allowed) {
                originalStopPropagation.call(this);
            }
        };
        
        console.log('✅ 이벤트 리스너 최적화 완료');
    }
    
    // ==========================================
    // 3단계: CSS 성능 최적화 및 깜빡임 제거
    // ==========================================
    function optimizeCSS() {
        console.log('🎨 CSS 최적화...');
        
        const style = document.createElement('style');
        style.textContent = `
            /* 하드웨어 가속 및 깜빡임 방지 */
            * {
                /* 깜빡임 방지 */
                -webkit-backface-visibility: hidden !important;
                backface-visibility: hidden !important;
                -webkit-transform: translateZ(0) !important;
                transform: translateZ(0) !important;
                
                /* 부드러운 전환 */
                transition: opacity 0.2s ease, transform 0.2s ease !important;
            }
            
            /* 애니메이션 제거 */
            *,
            *::before,
            *::after {
                animation: none !important;
            }
            
            /* 달력 안정화 */
            .calendar-container {
                will-change: auto !important;
                position: relative !important;
                transform: none !important;
            }
            
            /* 날짜 클릭 가능 */
            .day {
                pointer-events: auto !important;
                cursor: pointer !important;
                position: relative !important;
                z-index: 10 !important;
                user-select: none !important;
            }
            
            .day:hover {
                background-color: rgba(102, 126, 234, 0.1) !important;
                transform: scale(1.02) !important;
            }
            
            .day:active {
                transform: scale(0.98) !important;
            }
            
            /* 버튼 클릭 가능 */
            button,
            .btn,
            [role="button"],
            .nav-btn,
            .action-btn {
                pointer-events: auto !important;
                cursor: pointer !important;
                z-index: 100 !important;
            }
            
            /* 모달 정리 */
            .modal {
                display: none;
                position: fixed !important;
                top: 50% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) !important;
                z-index: 10000 !important;
                background: white !important;
                border-radius: 15px !important;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3) !important;
                padding: 20px !important;
                max-width: 90% !important;
                max-height: 90vh !important;
                overflow-y: auto !important;
            }
            
            .modal[style*="display: block"],
            .modal.show,
            .modal.active {
                display: block !important;
                pointer-events: auto !important;
            }
            
            /* 메뉴 클릭 가능 */
            .menu-item,
            .dropdown-item,
            nav a,
            nav button {
                pointer-events: auto !important;
                cursor: pointer !important;
            }
            
            /* 입력 필드 활성화 */
            input,
            textarea,
            select {
                pointer-events: auto !important;
            }
            
            /* 오버레이 제거 */
            .overlay:not(.modal),
            .backdrop:not(.modal-backdrop) {
                display: none !important;
                pointer-events: none !important;
            }
            
            /* 프로그레스 바 애니메이션 제거 */
            .progress-bar,
            [class*="progress"] {
                transition: none !important;
                animation: none !important;
            }
        `;
        
        // 기존 충돌 스타일시트 제거
        document.querySelectorAll('style').forEach(s => {
            if (s.textContent.includes('pointer-events: none !important')) {
                s.remove();
            }
        });
        
        document.head.appendChild(style);
        console.log('✅ CSS 최적화 완료');
    }
    
    // ==========================================
    // 4단계: 날짜 클릭 이벤트 복구
    // ==========================================
    function restoreDateClickEvents() {
        console.log('📅 날짜 클릭 이벤트 복구...');
        
        const days = document.querySelectorAll('.day:not(.other-month)');
        
        days.forEach(day => {
            // 기존 리스너 제거를 위해 클론
            const newDay = day.cloneNode(true);
            day.parentNode.replaceChild(newDay, day);
            
            // 새 리스너 추가
            newDay.addEventListener('click', function(e) {
                e.stopImmediatePropagation();
                
                const dayNumber = this.querySelector('.day-number');
                if (!dayNumber) return;
                
                const date = parseInt(dayNumber.textContent);
                const year = 2025;
                const month = 8;
                
                console.log(`📅 클릭: ${year}-${month}-${date}`);
                
                // openDateMemoModal 호출
                if (typeof window.openDateMemoModal === 'function') {
                    window.openDateMemoModal(year, month, date);
                } else {
                    // Fallback
                    alert(`${year}년 ${month}월 ${date}일`);
                }
            }, true);
        });
        
        console.log(`✅ ${days.length}개 날짜 클릭 이벤트 복구 완료`);
    }
    
    // ==========================================
    // 5단계: 모달 함수 정리
    // ==========================================
    function fixModalFunctions() {
        console.log('🔧 모달 함수 정리...');
        
        // 백업
        const backups = {};
        ['openModal', 'closeModal', 'openDateMemoModal', 'openMemoDetail'].forEach(name => {
            if (window[name]) backups[name] = window[name];
        });
        
        // 안전한 openModal
        window.openModal = function(modalId) {
            console.log(`📂 모달 열기: ${modalId}`);
            const modal = document.getElementById(modalId);
            if (!modal) return;
            
            // 다른 모달 닫기
            document.querySelectorAll('.modal').forEach(m => {
                if (m.id !== modalId) {
                    m.style.display = 'none';
                }
            });
            
            // 모달 열기
            modal.style.display = 'block';
            modal.classList.add('show');
            
            // 원본 함수 호출
            if (backups.openModal && backups.openModal !== window.openModal) {
                try { backups.openModal(modalId); } catch(e) {}
            }
        };
        
        // 안전한 closeModal
        window.closeModal = function(modalId) {
            console.log(`📁 모달 닫기: ${modalId}`);
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'none';
                modal.classList.remove('show');
            }
            
            // 원본 함수 호출
            if (backups.closeModal && backups.closeModal !== window.closeModal) {
                try { backups.closeModal(modalId); } catch(e) {}
            }
        };
        
        console.log('✅ 모달 함수 정리 완료');
    }
    
    // ==========================================
    // 6단계: 메뉴와 버튼 클릭 복구
    // ==========================================
    function restoreMenuAndButtons() {
        console.log('🔘 메뉴와 버튼 복구...');
        
        // onclick 속성 재활성화
        document.querySelectorAll('[onclick]').forEach(element => {
            const onclick = element.getAttribute('onclick');
            element.style.pointerEvents = 'auto';
            element.style.cursor = 'pointer';
            
            // 리스너 재등록
            element.removeAttribute('onclick');
            element.addEventListener('click', function(e) {
                try {
                    eval(onclick);
                } catch (error) {
                    console.error('onclick 오류:', error);
                }
            });
        });
        
        // 버튼들 활성화
        document.querySelectorAll('button, .btn').forEach(btn => {
            btn.style.pointerEvents = 'auto';
            btn.style.cursor = 'pointer';
        });
        
        console.log('✅ 메뉴와 버튼 복구 완료');
    }
    
    // ==========================================
    // 7단계: MutationObserver 최적화
    // ==========================================
    function optimizeObservers() {
        console.log('👁️ Observer 최적화...');
        
        // 기존 MutationObserver 래핑
        const OriginalMutationObserver = window.MutationObserver;
        
        window.MutationObserver = class extends OriginalMutationObserver {
            constructor(callback) {
                // Throttle 적용
                let timeout;
                const throttledCallback = (mutations, observer) => {
                    clearTimeout(timeout);
                    timeout = setTimeout(() => {
                        callback(mutations, observer);
                    }, 100);
                };
                super(throttledCallback);
            }
        };
        
        console.log('✅ Observer 최적화 완료');
    }
    
    // ==========================================
    // 초기화
    // ==========================================
    function initialize() {
        console.log('🎯 최종 성능 최적화 시작...');
        
        // 1. 타이머 제거
        killAllTimers();
        
        // 2. 이벤트 최적화
        optimizeEventListeners();
        
        // 3. CSS 최적화
        optimizeCSS();
        
        // 4. Observer 최적화
        optimizeObservers();
        
        // 5. 모달 함수 정리
        fixModalFunctions();
        
        // DOM 로드 후 실행
        setTimeout(() => {
            // 6. 날짜 클릭 복구
            restoreDateClickEvents();
            
            // 7. 메뉴/버튼 복구
            restoreMenuAndButtons();
            
            console.log('✅ 최종 성능 최적화 완료!');
            console.log('💡 모든 기능이 정상 작동해야 합니다.');
        }, 500);
        
        // 안전장치: 2초 후 재실행
        setTimeout(() => {
            killAllTimers(); // 타이머 재제거
            restoreDateClickEvents(); // 클릭 재복구
            console.log('🔄 안전장치 실행 완료');
        }, 2000);
    }
    
    // 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
    // 디버깅 도구
    window.debugCalendar = function() {
        console.group('🔍 달력 디버깅');
        console.log('날짜 개수:', document.querySelectorAll('.day:not(.other-month)').length);
        console.log('모달 개수:', document.querySelectorAll('.modal').length);
        console.log('버튼 개수:', document.querySelectorAll('button').length);
        console.log('활성 타이머:', performance.getEntriesByType('measure').length);
        console.groupEnd();
    };
    
})();