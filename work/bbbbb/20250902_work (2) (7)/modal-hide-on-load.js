// 페이지 로드 시 모든 모달 숨김 처리
(function() {
    'use strict';
    
    // 모달 숨김 함수
    function hideAllModals() {
        // 모든 모달 선택자
        const modalSelectors = [
            '.modal',
            '.unified-modal',
            '.backup-modal',
            '.sync-modal',
            '.drive-modal',
            '.storage-modal',
            '#excelModal',
            '#settingsModal',
            '#storageModal',
            '#backupModal',
            '#unifiedCloudModal',
            '#cloudModal',
            '#memoModal',
            '#dateMemoModal',
            '#memoDetailModal',
            '#createModal'
        ];
        
        modalSelectors.forEach(selector => {
            const modals = document.querySelectorAll(selector);
            modals.forEach(modal => {
                if (modal) {
                    // 모든 표시 클래스 제거
                    modal.classList.remove('show', 'in', 'fade', 'active');
                    
                    // 강제로 숨김 스타일 적용
                    modal.style.display = 'none';
                    modal.style.opacity = '0';
                    modal.style.visibility = 'hidden';
                    modal.style.zIndex = '-1';
                    
                    // aria 속성 설정
                    modal.setAttribute('aria-hidden', 'true');
                    modal.setAttribute('aria-modal', 'false');
                    
                    // tabindex 제거
                    modal.removeAttribute('tabindex');
                    
                    console.log(`✅ 모달 숨김: ${selector}`);
                }
            });
        });
        
        // Bootstrap 모달 백드롭 제거
        const backdrops = document.querySelectorAll('.modal-backdrop, .modal-overlay');
        backdrops.forEach(backdrop => {
            if (backdrop && backdrop.parentNode) {
                backdrop.remove();
                console.log('✅ 모달 백드롭 제거');
            }
        });
        
        // body 클래스 정리
        document.body.classList.remove('modal-open', 'no-scroll');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        
        // html 클래스 정리
        document.documentElement.classList.remove('modal-open');
        
        console.log('🎉 모든 모달 숨김 처리 완료');
    }
    
    // DOM 준비되면 즉시 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', hideAllModals);
    } else {
        hideAllModals();
    }
    
    // 페이지 로드 완료 후에도 한 번 더 실행 (안전장치)
    window.addEventListener('load', function() {
        setTimeout(hideAllModals, 100);
    });
    
    // 브라우저 뒤로가기/앞으로가기 시에도 실행
    window.addEventListener('pageshow', function(event) {
        if (event.persisted) {
            hideAllModals();
        }
    });
    
    // 모달 표시 함수 오버라이드 (안전장치)
    const originalShowModal = window.showModal;
    if (typeof originalShowModal === 'function') {
        window.showModal = function(modalId) {
            // 먼저 모든 모달 숨김
            hideAllModals();
            
            // 약간의 지연 후 지정된 모달만 표시
            setTimeout(() => {
                originalShowModal.call(this, modalId);
            }, 50);
        };
    }
    
    // 전역 모달 제어 함수 제공
    window.hideAllModals = hideAllModals;
    
    console.log('🔧 모달 자동 숨김 시스템 초기화 완료');
    
})();