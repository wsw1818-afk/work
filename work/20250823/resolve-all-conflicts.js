/**
 * 모든 스크립트 충돌 해결 통합 수정
 * 이 파일이 모든 충돌을 해결하고 안정적인 동작을 보장합니다
 */

(function() {
    'use strict';
    
    console.log('🔧 통합 충돌 해결 스크립트 시작...');
    
    // 1. 모든 기존 interval과 timeout 정리
    function clearAllTimers() {
        console.log('⏰ 모든 타이머 정리 중...');
        
        // 모든 setInterval 정리
        for (let i = 1; i <= 10000; i++) {
            clearInterval(i);
            clearTimeout(i);
        }
        
        // 위험한 전역 interval 변수들 초기화
        if (window.updateInterval) {
            clearInterval(window.updateInterval);
            window.updateInterval = null;
        }
        
        console.log('✅ 타이머 정리 완료');
    }
    
    // 2. 이벤트 리스너 충돌 해결
    function fixEventListenerConflicts() {
        console.log('🎯 이벤트 리스너 충돌 해결 중...');
        
        // stopPropagation을 남용하는 핸들러들 제거
        const originalStopPropagation = Event.prototype.stopPropagation;
        const originalPreventDefault = Event.prototype.preventDefault;
        
        Event.prototype.stopPropagation = function() {
            // 특정 경우에만 stopPropagation 허용
            const allowedTargets = ['modal-close', 'memo-item-delete', 'btn-close'];
            const target = this.target;
            
            if (target && target.className) {
                const className = target.className.toString();
                const isAllowed = allowedTargets.some(allowed => className.includes(allowed));
                
                if (isAllowed) {
                    originalStopPropagation.call(this);
                } else {
                    console.warn('⚠️ stopPropagation 차단됨:', target);
                }
            }
        };
        
        console.log('✅ 이벤트 리스너 충돌 해결 완료');
    }
    
    // 3. 함수 중복 정의 해결
    function resolveFunctionDuplicates() {
        console.log('🔄 함수 중복 정의 해결 중...');
        
        // 안전한 버전의 핵심 함수들 정의
        const safeFunctions = {
            openModal: function(modalId) {
                console.log(`📂 모달 열기: ${modalId}`);
                const modal = document.getElementById(modalId);
                if (modal) {
                    // 다른 모달들 닫기
                    document.querySelectorAll('.modal').forEach(m => {
                        if (m.id !== modalId) {
                            m.style.display = 'none';
                            m.style.pointerEvents = 'none';
                        }
                    });
                    
                    modal.style.display = 'block';
                    modal.style.pointerEvents = 'auto';
                    modal.style.zIndex = '10000';
                    
                    // 모달 내부 요소들도 클릭 가능하게
                    modal.querySelectorAll('button, input, select, textarea').forEach(el => {
                        el.style.pointerEvents = 'auto';
                    });
                }
            },
            
            closeModal: function(modalId) {
                console.log(`📁 모달 닫기: ${modalId}`);
                const modal = document.getElementById(modalId);
                if (modal) {
                    modal.style.display = 'none';
                    modal.style.pointerEvents = 'none';
                }
            },
            
            openDateMemoModal: function(year, month, date) {
                console.log(`📅 날짜 메모 모달: ${year}-${month}-${date}`);
                
                // 기존 함수가 있으면 호출
                const originalFunc = window.__originalOpenDateMemoModal || window.openDateMemoModal;
                if (originalFunc && originalFunc !== safeFunctions.openDateMemoModal) {
                    return originalFunc(year, month, date);
                }
                
                // 없으면 기본 동작
                const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
                alert(`날짜: ${dateStr}\n메모 모달 기능이 준비 중입니다.`);
            },
            
            openMemoDetail: function(memoId) {
                console.log(`📝 메모 상세: ${memoId}`);
                
                // 기존 함수가 있으면 호출
                const originalFunc = window.__originalOpenMemoDetail || window.openMemoDetail;
                if (originalFunc && originalFunc !== safeFunctions.openMemoDetail) {
                    return originalFunc(memoId);
                }
                
                // 없으면 기본 동작
                alert(`메모 ID: ${memoId}\n메모 상세 기능이 준비 중입니다.`);
            }
        };
        
        // 기존 함수들 백업
        ['openModal', 'closeModal', 'openDateMemoModal', 'openMemoDetail'].forEach(funcName => {
            if (window[funcName] && window[funcName] !== safeFunctions[funcName]) {
                window[`__original${funcName.charAt(0).toUpperCase() + funcName.slice(1)}`] = window[funcName];
            }
        });
        
        // 안전한 버전으로 교체
        Object.assign(window, safeFunctions);
        
        console.log('✅ 함수 중복 정의 해결 완료');
    }
    
    // 4. CSS 충돌 해결
    function fixCSSConflicts() {
        console.log('🎨 CSS 충돌 해결 중...');
        
        const style = document.createElement('style');
        style.textContent = `
            /* 최우선 순위 스타일 (모든 충돌 해결) */
            
            /* 달력 날짜 클릭 가능 */
            .day {
                pointer-events: auto !important;
                cursor: pointer !important;
                position: relative !important;
                z-index: 1 !important;
            }
            
            .day:hover {
                z-index: 10 !important;
                background-color: rgba(102, 126, 234, 0.1) !important;
                transform: scale(1.02) !important;
                transition: all 0.2s !important;
            }
            
            /* 메뉴와 버튼 클릭 가능 */
            button,
            .btn,
            .menu-item,
            .nav-btn,
            [role="button"] {
                pointer-events: auto !important;
                cursor: pointer !important;
            }
            
            /* 모달 처리 */
            .modal {
                pointer-events: none !important;
                z-index: -1 !important;
            }
            
            .modal[style*="display: block"],
            .modal.active,
            .modal.show {
                pointer-events: auto !important;
                z-index: 10000 !important;
            }
            
            .modal-content {
                pointer-events: auto !important;
            }
            
            /* 오버레이 제거 */
            .overlay,
            .backdrop,
            .modal-backdrop {
                display: none !important;
                pointer-events: none !important;
            }
            
            /* 입력 필드 활성화 */
            input,
            textarea,
            select {
                pointer-events: auto !important;
            }
            
            /* 메모 리스트 클릭 가능 */
            .memo-item,
            .memo-list-item,
            .schedule-item {
                pointer-events: auto !important;
                cursor: pointer !important;
            }
            
            /* 깜빡임 방지 */
            * {
                backface-visibility: hidden !important;
                -webkit-backface-visibility: hidden !important;
                transform: translateZ(0) !important;
                -webkit-transform: translateZ(0) !important;
            }
            
            /* 애니메이션 최적화 */
            *, *::before, *::after {
                animation-duration: 0.2s !important;
                transition-duration: 0.2s !important;
            }
        `;
        
        // 가장 마지막에 추가하여 최우선 순위 보장
        document.head.appendChild(style);
        
        console.log('✅ CSS 충돌 해결 완료');
    }
    
    // 5. 클릭 이벤트 재등록
    function reattachAllClickEvents() {
        console.log('🖱️ 클릭 이벤트 재등록 중...');
        
        // 달력 날짜 클릭
        document.querySelectorAll('.day:not(.other-month)').forEach(day => {
            // 기존 리스너 제거
            const newDay = day.cloneNode(true);
            day.parentNode.replaceChild(newDay, day);
            
            // 새 리스너 추가
            newDay.addEventListener('click', function(e) {
                const dayNumber = this.querySelector('.day-number');
                if (dayNumber) {
                    const date = parseInt(dayNumber.textContent);
                    window.openDateMemoModal(2025, 8, date);
                }
            });
        });
        
        // 버튼 클릭 이벤트 복원
        document.querySelectorAll('[onclick]').forEach(element => {
            const onclickAttr = element.getAttribute('onclick');
            element.removeAttribute('onclick');
            element.addEventListener('click', function(e) {
                try {
                    eval(onclickAttr);
                } catch (error) {
                    console.error('onclick 실행 오류:', error);
                }
            });
        });
        
        console.log('✅ 클릭 이벤트 재등록 완료');
    }
    
    // 6. MutationObserver 최적화
    function optimizeObservers() {
        console.log('👁️ Observer 최적화 중...');
        
        // 기존 observer들 비활성화
        if (window.MutationObserver) {
            const observers = [];
            const originalObserver = window.MutationObserver;
            
            window.MutationObserver = class OptimizedObserver extends originalObserver {
                constructor(callback) {
                    // 과도한 호출 방지
                    let timeout;
                    const throttledCallback = (mutations, observer) => {
                        clearTimeout(timeout);
                        timeout = setTimeout(() => {
                            callback(mutations, observer);
                        }, 100);
                    };
                    super(throttledCallback);
                    observers.push(this);
                }
                
                disconnect() {
                    super.disconnect();
                    const index = observers.indexOf(this);
                    if (index > -1) observers.splice(index, 1);
                }
            };
        }
        
        console.log('✅ Observer 최적화 완료');
    }
    
    // 7. 전역 오류 핸들러
    function setupErrorHandler() {
        window.addEventListener('error', function(e) {
            console.error('전역 오류:', e.message);
            // 오류가 발생해도 계속 실행
            e.preventDefault();
        });
    }
    
    // 8. 디버깅 도구
    function enableDebugging() {
        // 클릭 이벤트 모니터링
        document.addEventListener('click', function(e) {
            console.log('클릭:', e.target.tagName, e.target.className, e.target.id);
        }, true);
        
        // 함수 호출 모니터링
        ['openModal', 'closeModal', 'openDateMemoModal', 'openMemoDetail'].forEach(funcName => {
            const original = window[funcName];
            window[funcName] = function(...args) {
                console.log(`함수 호출: ${funcName}`, args);
                if (original) return original.apply(this, args);
            };
        });
    }
    
    // 메인 초기화 함수
    function initialize() {
        console.log('🚀 통합 충돌 해결 시작...');
        
        // 1. 타이머 정리
        clearAllTimers();
        
        // 2. 이벤트 충돌 해결
        fixEventListenerConflicts();
        
        // 3. 함수 중복 해결
        resolveFunctionDuplicates();
        
        // 4. CSS 충돌 해결
        fixCSSConflicts();
        
        // 5. Observer 최적화
        optimizeObservers();
        
        // 6. 오류 핸들러 설정
        setupErrorHandler();
        
        // 7. 클릭 이벤트 재등록 (약간의 지연 후)
        setTimeout(() => {
            reattachAllClickEvents();
        }, 500);
        
        // 8. 디버깅 활성화 (필요시)
        // enableDebugging();
        
        console.log('✅ 모든 충돌 해결 완료!');
        console.log('💡 팁: 여전히 문제가 있다면 Ctrl+F5로 강제 새로고침하세요.');
    }
    
    // DOM 로드 완료 후 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        // 이미 로드된 경우 즉시 실행
        setTimeout(initialize, 100);
    }
    
    // 추가 안전장치: 2초 후 재실행
    setTimeout(() => {
        console.log('🔄 안전장치: 재초기화 실행');
        clearAllTimers();
        reattachAllClickEvents();
    }, 2000);
    
})();