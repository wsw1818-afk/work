/**
 * 모달 가시성 문제 해결
 * 모달이 열리지만 화면에 보이지 않는 문제 수정
 */

(function() {
    'use strict';
    
    console.log('👁️ 모달 가시성 수정 시작...');
    
    // 1. 모달 관련 CSS 강제 수정
    function forceModalVisibility() {
        const style = document.createElement('style');
        style.textContent = `
            /* 모든 모달 기본 숨김 해제 */
            .modal {
                display: none;
                position: fixed !important;
                top: 50% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) !important;
                background: white !important;
                border: 2px solid #667eea !important;
                border-radius: 15px !important;
                padding: 20px !important;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3) !important;
                min-width: 400px !important;
                max-width: 90% !important;
                max-height: 80vh !important;
                overflow-y: auto !important;
                z-index: 999999 !important;
            }
            
            /* 활성 모달 표시 */
            .modal.show,
            .modal[style*="display: block"] {
                display: block !important;
                pointer-events: auto !important;
                opacity: 1 !important;
                visibility: visible !important;
            }
            
            /* 모달 백드롭 */
            .modal-backdrop,
            .modal-overlay {
                display: none !important;
            }
            
            .modal-backdrop.show {
                display: block !important;
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: 100% !important;
                background: rgba(0, 0, 0, 0.5) !important;
                z-index: 999998 !important;
            }
            
            /* 모달 내용 가시성 */
            .modal-content {
                display: block !important;
                background: white !important;
                opacity: 1 !important;
                visibility: visible !important;
            }
            
            /* 모달 헤더와 닫기 버튼 */
            .modal-header {
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
                margin-bottom: 15px !important;
                padding-bottom: 10px !important;
                border-bottom: 1px solid #e2e8f0 !important;
            }
            
            .modal-close,
            .btn-close,
            .close-btn {
                cursor: pointer !important;
                font-size: 24px !important;
                background: transparent !important;
                border: none !important;
                color: #999 !important;
                padding: 5px 10px !important;
            }
            
            .modal-close:hover,
            .btn-close:hover,
            .close-btn:hover {
                color: #333 !important;
            }
            
            /* 날짜 메모 모달 특별 처리 */
            #dateMemoModal,
            .date-memo-modal {
                z-index: 1000000 !important;
            }
        `;
        document.head.appendChild(style);
        console.log('✅ 모달 CSS 강제 적용 완료');
    }
    
    // 2. 모달 열기/닫기 함수 개선
    function improveModalFunctions() {
        // 백드롭 생성 함수
        function createBackdrop() {
            let backdrop = document.querySelector('.modal-backdrop');
            if (!backdrop) {
                backdrop = document.createElement('div');
                backdrop.className = 'modal-backdrop';
                document.body.appendChild(backdrop);
            }
            return backdrop;
        }
        
        // openModal 함수 개선
        const originalOpenModal = window.openModal;
        window.openModal = function(modalId) {
            console.log(`🔓 모달 열기 시도: ${modalId}`);
            
            const modal = document.getElementById(modalId);
            if (!modal) {
                console.error(`❌ 모달을 찾을 수 없음: ${modalId}`);
                return;
            }
            
            // 백드롭 표시
            const backdrop = createBackdrop();
            backdrop.classList.add('show');
            
            // 모달 표시
            modal.style.display = 'block';
            modal.classList.add('show');
            
            // 포커스 설정
            const firstInput = modal.querySelector('input, textarea, select, button');
            if (firstInput) {
                firstInput.focus();
            }
            
            console.log(`✅ 모달 열림: ${modalId}`);
            
            // 원래 함수가 있으면 호출
            if (originalOpenModal && originalOpenModal !== window.openModal) {
                originalOpenModal.call(this, modalId);
            }
        };
        
        // closeModal 함수 개선
        const originalCloseModal = window.closeModal;
        window.closeModal = function(modalId) {
            console.log(`🔒 모달 닫기 시도: ${modalId}`);
            
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'none';
                modal.classList.remove('show');
            }
            
            // 다른 열린 모달이 없으면 백드롭 숨기기
            const openModals = document.querySelectorAll('.modal.show, .modal[style*="display: block"]');
            if (openModals.length === 0) {
                const backdrop = document.querySelector('.modal-backdrop');
                if (backdrop) {
                    backdrop.classList.remove('show');
                }
            }
            
            console.log(`✅ 모달 닫힘: ${modalId}`);
            
            // 원래 함수가 있으면 호출
            if (originalCloseModal && originalCloseModal !== window.closeModal) {
                originalCloseModal.call(this, modalId);
            }
        };
        
        // ESC 키로 모달 닫기
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const openModals = document.querySelectorAll('.modal.show, .modal[style*="display: block"]');
                if (openModals.length > 0) {
                    const lastModal = openModals[openModals.length - 1];
                    if (lastModal.id) {
                        window.closeModal(lastModal.id);
                    }
                }
            }
        });
        
        console.log('✅ 모달 함수 개선 완료');
    }
    
    // 3. 날짜 메모 모달 특별 처리
    function fixDateMemoModal() {
        // openDateMemoModal 함수 확인 및 수정
        const originalOpenDateMemo = window.openDateMemoModal;
        window.openDateMemoModal = function(year, month, date) {
            console.log(`📅 날짜 메모 모달 열기: ${year}-${month}-${date}`);
            
            // 원래 함수 호출
            if (originalOpenDateMemo) {
                originalOpenDateMemo.call(this, year, month, date);
            }
            
            // 모달이 제대로 표시되는지 확인
            setTimeout(() => {
                // dateMemoModal이 있는지 확인
                let modal = document.getElementById('dateMemoModal');
                if (!modal) {
                    // 동적으로 생성된 모달 찾기
                    modal = document.querySelector('.date-memo-modal, [class*="memo-modal"]');
                }
                
                if (modal) {
                    modal.style.display = 'block';
                    modal.style.visibility = 'visible';
                    modal.style.opacity = '1';
                    modal.style.zIndex = '1000000';
                    console.log('✅ 날짜 메모 모달 강제 표시');
                } else {
                    console.warn('⚠️ 날짜 메모 모달을 찾을 수 없음');
                }
            }, 100);
        };
        
        console.log('✅ 날짜 메모 모달 수정 완료');
    }
    
    // 4. 모든 모달 찾아서 수정
    function fixAllModals() {
        const modals = document.querySelectorAll('.modal, [id$="Modal"]');
        console.log(`🔍 발견된 모달: ${modals.length}개`);
        
        modals.forEach((modal, index) => {
            // 기본 스타일 설정
            if (!modal.style.position) modal.style.position = 'fixed';
            if (!modal.style.zIndex) modal.style.zIndex = '10000';
            
            // 닫기 버튼 확인
            const closeBtn = modal.querySelector('.modal-close, .btn-close, [onclick*="close"]');
            if (closeBtn) {
                closeBtn.style.cursor = 'pointer';
                closeBtn.style.pointerEvents = 'auto';
            }
            
            console.log(`  - ${modal.id || `modal-${index}`}: 수정 완료`);
        });
        
        console.log('✅ 모든 모달 수정 완료');
    }
    
    // 5. 디버깅 도구
    window.debugModals = function() {
        const modals = document.querySelectorAll('.modal, [id$="Modal"]');
        console.group('🔍 모달 디버깅 정보');
        modals.forEach(modal => {
            const style = window.getComputedStyle(modal);
            console.log(`모달: ${modal.id || modal.className}`);
            console.log(`  - display: ${style.display}`);
            console.log(`  - visibility: ${style.visibility}`);
            console.log(`  - opacity: ${style.opacity}`);
            console.log(`  - z-index: ${style.zIndex}`);
            console.log(`  - pointer-events: ${style.pointerEvents}`);
        });
        console.groupEnd();
    };
    
    // 초기화
    function initialize() {
        console.log('🚀 모달 가시성 수정 시작...');
        
        // 1. CSS 수정
        forceModalVisibility();
        
        // 2. 함수 개선
        improveModalFunctions();
        
        // 3. 날짜 메모 모달 수정
        fixDateMemoModal();
        
        // 4. 기존 모달 수정
        setTimeout(() => {
            fixAllModals();
        }, 500);
        
        console.log('✅ 모달 가시성 수정 완료!');
        console.log('💡 디버깅: debugModals() 함수를 콘솔에서 실행하여 모달 상태 확인');
    }
    
    // DOM 로드 후 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        setTimeout(initialize, 100);
    }
    
})();