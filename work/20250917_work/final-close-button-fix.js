// CPU 최적화된 경량 닫기 버튼 시스템
console.log('⚡ 경량 닫기 버튼 시스템 시작');

// 간단하고 효율적인 닫기 기능 구현
(function() {
    let initialized = false;

    function initializeCloseButton() {
        if (initialized) return;
        initialized = true;

        console.log('⚡ 닫기 버튼 초기화');

        // 단일 이벤트 리스너로 모든 닫기 기능 처리
        document.addEventListener('click', function(e) {
            // X 버튼 클릭 감지
            if (e.target.matches('#closeDateMemo, .modal-close, [onclick*="closeDateMemoModal"]')) {
                e.preventDefault();
                e.stopPropagation();

                const modal = document.getElementById('dateMemoModal');
                if (modal) {
                    modal.style.display = 'none';
                    modal.style.visibility = 'hidden';
                    modal.style.opacity = '0';
                }
                return;
            }

            // 배경 클릭 감지 (모달 자체 클릭)
            if (e.target.id === 'dateMemoModal') {
                const modal = document.getElementById('dateMemoModal');
                if (modal) {
                    modal.style.display = 'none';
                    modal.style.visibility = 'hidden';
                    modal.style.opacity = '0';
                }
                return;
            }
        });

        // ESC 키 처리
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' || e.keyCode === 27) {
                const modal = document.getElementById('dateMemoModal');
                if (modal && modal.style.display !== 'none' && modal.style.visibility !== 'hidden') {
                    modal.style.display = 'none';
                    modal.style.visibility = 'hidden';
                    modal.style.opacity = '0';
                }
            }
        });

        console.log('⚡ 경량 닫기 시스템 활성화 완료');
    }

    // DOM 준비 시 한 번만 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeCloseButton);
    } else {
        initializeCloseButton();
    }
})();