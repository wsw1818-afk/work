/**
 * 최종 완전 수정 스크립트
 * 모달 표시, 메뉴 클릭, 닫기 버튼 모든 문제 해결
 */

(function() {
    'use strict';
    
    console.log('🔥 최종 완전 수정 시작...');
    
    // ==========================================
    // 1. 모든 타이머 제거 (깜빡임 방지)
    // ==========================================
    function stopAllTimers() {
        // 모든 interval과 timeout 제거
        const highestId = window.setTimeout(() => {}, 0);
        for (let i = highestId; i >= 0; i--) {
            window.clearInterval(i);
            window.clearTimeout(i);
        }
        
        // 문제가 되는 함수들의 setInterval 차단
        const originalSetInterval = window.setInterval;
        window.setInterval = function(callback, delay) {
            // 200ms 이하는 모두 차단
            if (delay <= 500) {
                return -1;
            }
            return originalSetInterval.apply(this, arguments);
        };
        
        console.log('✅ 타이머 제거 완료');
    }
    
    // ==========================================
    // 2. 모달 가시성 강제 수정
    // ==========================================
    function forceModalVisibility() {
        const style = document.createElement('style');
        style.id = 'final-modal-fix';
        style.textContent = `
            /* 모달 기본 설정 */
            .modal,
            #dateMemoModal,
            #memoDetailModal,
            [id*="Modal"] {
                position: fixed !important;
                top: 50% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) !important;
                background: white !important;
                border: 2px solid #667eea !important;
                border-radius: 15px !important;
                padding: 20px !important;
                min-width: 400px !important;
                max-width: 90% !important;
                max-height: 80vh !important;
                overflow-y: auto !important;
                box-shadow: 0 20px 60px rgba(0,0,0,0.5) !important;
            }
            
            /* 모달 숨김 상태 */
            .modal {
                display: none !important;
                opacity: 0 !important;
                pointer-events: none !important;
                z-index: -9999 !important;
            }
            
            /* 모달 표시 상태 - 매우 중요! */
            .modal[style*="display: block"],
            .modal.show,
            .modal.active,
            .modal:target {
                display: block !important;
                opacity: 1 !important;
                pointer-events: auto !important;
                z-index: 999999 !important;
                visibility: visible !important;
            }
            
            /* 모달 백드롭 */
            .modal-backdrop {
                display: none !important;
            }
            
            .modal-backdrop.show {
                display: block !important;
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: 100% !important;
                background: rgba(0,0,0,0.5) !important;
                z-index: 999998 !important;
            }
            
            /* 날짜 클릭 가능 */
            .day {
                pointer-events: auto !important;
                cursor: pointer !important;
                position: relative !important;
                z-index: 100 !important;
            }
            
            .day:hover {
                background: rgba(102,126,234,0.1) !important;
                transform: scale(1.05) !important;
            }
            
            /* 버튼과 메뉴 클릭 가능 */
            button,
            .btn,
            .modal-close,
            .close-btn,
            [onclick],
            .action-btn,
            .menu-item,
            .nav-btn {
                pointer-events: auto !important;
                cursor: pointer !important;
                z-index: 1000 !important;
            }
            
            /* 닫기 버튼 특별 처리 */
            .modal-close,
            .btn-close,
            button.close,
            [onclick*="close"] {
                position: absolute !important;
                top: 10px !important;
                right: 10px !important;
                font-size: 24px !important;
                background: transparent !important;
                border: none !important;
                cursor: pointer !important;
                z-index: 1000000 !important;
                pointer-events: auto !important;
            }
            
            /* 입력 필드 */
            input, textarea, select {
                pointer-events: auto !important;
            }
            
            /* 깜빡임 방지 */
            * {
                animation: none !important;
                transition: opacity 0.2s, transform 0.2s !important;
            }
        `;
        
        // 기존 스타일 제거
        const existing = document.getElementById('final-modal-fix');
        if (existing) existing.remove();
        
        document.head.appendChild(style);
        console.log('✅ 모달 CSS 강제 적용');
    }
    
    // ==========================================
    // 3. 모달 함수 완전 재정의
    // ==========================================
    function redefineModalFunctions() {
        // 모달 열기
        window.openModal = function(modalId) {
            console.log(`🔓 모달 열기: ${modalId}`);
            
            const modal = document.getElementById(modalId);
            if (!modal) {
                console.error(`모달 없음: ${modalId}`);
                return;
            }
            
            // 백드롭 생성
            let backdrop = document.querySelector('.modal-backdrop');
            if (!backdrop) {
                backdrop = document.createElement('div');
                backdrop.className = 'modal-backdrop';
                document.body.appendChild(backdrop);
            }
            backdrop.classList.add('show');
            
            // 모달 표시
            modal.style.cssText = `
                display: block !important;
                opacity: 1 !important;
                visibility: visible !important;
                pointer-events: auto !important;
                z-index: 999999 !important;
                position: fixed !important;
                top: 50% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) !important;
            `;
            modal.classList.add('show');
            
            console.log(`✅ 모달 열림: ${modalId}`);
        };
        
        // 모달 닫기
        window.closeModal = function(modalId) {
            console.log(`🔒 모달 닫기: ${modalId}`);
            
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'none';
                modal.style.opacity = '0';
                modal.classList.remove('show');
            }
            
            // 백드롭 제거
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
                backdrop.classList.remove('show');
            }
            
            console.log(`✅ 모달 닫힘: ${modalId}`);
        };
        
        // openDateMemoModal 재정의
        const originalOpenDateMemo = window.openDateMemoModal;
        window.openDateMemoModal = function(year, month, date) {
            console.log(`📅 날짜 메모 모달 열기: ${year}-${month}-${date}`);
            
            // 원래 함수 호출
            if (originalOpenDateMemo) {
                originalOpenDateMemo.call(this, year, month, date);
            }
            
            // 모달 강제 표시
            setTimeout(() => {
                const modal = document.querySelector('#dateMemoModal, .date-memo-modal, [class*="memo-modal"]:not([style*="display: none"])');
                if (modal) {
                    modal.style.cssText = `
                        display: block !important;
                        opacity: 1 !important;
                        visibility: visible !important;
                        pointer-events: auto !important;
                        z-index: 999999 !important;
                        position: fixed !important;
                        top: 50% !important;
                        left: 50% !important;
                        transform: translate(-50%, -50%) !important;
                        background: white !important;
                        padding: 20px !important;
                        border: 2px solid #667eea !important;
                        border-radius: 15px !important;
                        box-shadow: 0 20px 60px rgba(0,0,0,0.5) !important;
                    `;
                    console.log('✅ 날짜 메모 모달 강제 표시');
                }
            }, 100);
        };
        
        console.log('✅ 모달 함수 재정의 완료');
    }
    
    // ==========================================
    // 4. 클릭 이벤트 완전 복구
    // ==========================================
    function restoreAllClickEvents() {
        console.log('🖱️ 클릭 이벤트 복구...');
        
        // 1. onclick 속성 복구
        document.querySelectorAll('[onclick]').forEach(element => {
            const onclick = element.getAttribute('onclick');
            
            // 기존 리스너 제거
            const newElement = element.cloneNode(true);
            element.parentNode.replaceChild(newElement, element);
            
            // 새 리스너 추가
            newElement.addEventListener('click', function(e) {
                console.log(`클릭: ${onclick}`);
                try {
                    // eval 대신 Function 사용
                    const func = new Function('event', onclick);
                    func.call(this, e);
                } catch (error) {
                    console.error('클릭 오류:', error);
                    // 직접 실행 시도
                    try {
                        eval(onclick);
                    } catch (e2) {
                        console.error('클릭 실행 실패:', e2);
                    }
                }
            });
            
            // 스타일 확인
            newElement.style.pointerEvents = 'auto';
            newElement.style.cursor = 'pointer';
        });
        
        // 2. 날짜 클릭 복구
        document.querySelectorAll('.day:not(.other-month)').forEach(day => {
            const newDay = day.cloneNode(true);
            day.parentNode.replaceChild(newDay, day);
            
            newDay.addEventListener('click', function() {
                const dayNumber = this.querySelector('.day-number');
                if (dayNumber) {
                    const date = parseInt(dayNumber.textContent);
                    console.log(`날짜 클릭: 2025-8-${date}`);
                    window.openDateMemoModal(2025, 8, date);
                }
            });
        });
        
        // 3. 모든 버튼 활성화
        document.querySelectorAll('button, .btn, .modal-close').forEach(btn => {
            btn.style.pointerEvents = 'auto';
            btn.style.cursor = 'pointer';
            btn.style.zIndex = '10000';
        });
        
        console.log('✅ 클릭 이벤트 복구 완료');
    }
    
    // ==========================================
    // 5. ESC 키와 클릭 외부 영역으로 모달 닫기
    // ==========================================
    function setupModalControls() {
        // ESC 키
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const openModals = document.querySelectorAll('.modal[style*="display: block"], .modal.show');
                openModals.forEach(modal => {
                    if (modal.id) {
                        window.closeModal(modal.id);
                    } else {
                        modal.style.display = 'none';
                    }
                });
            }
        });
        
        // 백드롭 클릭
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal-backdrop')) {
                const openModals = document.querySelectorAll('.modal[style*="display: block"], .modal.show');
                openModals.forEach(modal => {
                    if (modal.id) {
                        window.closeModal(modal.id);
                    }
                });
            }
        });
        
        console.log('✅ 모달 컨트롤 설정 완료');
    }
    
    // ==========================================
    // 6. 디버깅 도구
    // ==========================================
    window.debugModal = function() {
        const modals = document.querySelectorAll('.modal, [id*="Modal"]');
        console.group('🔍 모달 상태');
        modals.forEach(modal => {
            const style = window.getComputedStyle(modal);
            console.log(`${modal.id || modal.className}:`, {
                display: style.display,
                opacity: style.opacity,
                visibility: style.visibility,
                zIndex: style.zIndex,
                pointerEvents: style.pointerEvents
            });
        });
        console.groupEnd();
        
        console.log('버튼 상태:', document.querySelectorAll('button').length, '개');
        console.log('onclick 요소:', document.querySelectorAll('[onclick]').length, '개');
    };
    
    // ==========================================
    // 초기화
    // ==========================================
    function init() {
        console.log('🚀 최종 완전 수정 초기화...');
        
        // 1. 타이머 정리
        stopAllTimers();
        
        // 2. CSS 적용
        forceModalVisibility();
        
        // 3. 함수 재정의
        redefineModalFunctions();
        
        // 4. 이벤트 복구 (약간 지연)
        setTimeout(() => {
            restoreAllClickEvents();
            setupModalControls();
            
            console.log('✅ 최종 수정 완료!');
            console.log('💡 디버깅: debugModal() 실행');
        }, 500);
        
        // 안전장치
        setTimeout(() => {
            stopAllTimers();
            console.log('🔄 안전장치 실행');
        }, 2000);
    }
    
    // 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 100);
    }
    
})();