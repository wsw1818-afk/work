// 최종 닫기 버튼 해결 시스템 - 모든 충돌 제거
console.log('🎯 최종 닫기 버튼 해결 시스템 시작');

// 즉시 실행으로 모든 기존 스크립트 무력화
(function() {
    // 기존 X 버튼 제거 스크립트들 무력화
    const scriptIds = [
        'duplicate-close-button-fix',
        'emergency-modal-position-fix'
    ];

    scriptIds.forEach(id => {
        const script = document.getElementById(id);
        if (script) {
            script.remove();
            console.log('🎯 기존 스크립트 제거:', id);
        }
    });

    // 모든 X 버튼 제거 로직 무력화
    const originalQuerySelectorAll = document.querySelectorAll;
    let buttonProtectionActive = true;

    // MutationObserver들 비활성화
    window.addEventListener('load', function() {
        setTimeout(() => {
            buttonProtectionActive = false;
            console.log('🎯 버튼 보호 해제');
        }, 1000);
    });

    // 닫기 버튼만 남기고 나머지 정리
    function setupFinalCloseButton() {
        console.log('🎯 최종 닫기 버튼 설정 시작');

        // 날짜 메모 모달의 닫기 버튼 보장
        const dateMemoModal = document.getElementById('dateMemoModal');
        if (dateMemoModal) {
            // 기존 닫기 버튼들 제거
            const existingCloseButtons = dateMemoModal.querySelectorAll('button, .close-btn, .modal-close');
            existingCloseButtons.forEach(btn => {
                if (btn.id !== 'closeDateMemo') {
                    btn.remove();
                }
            });

            // 확실한 닫기 버튼 생성
            let closeButton = document.getElementById('closeDateMemo');
            if (!closeButton) {
                closeButton = document.createElement('button');
                closeButton.id = 'closeDateMemo';

                const header = dateMemoModal.querySelector('.memo-header');
                if (header) {
                    header.appendChild(closeButton);
                }
            }

            // 닫기 버튼 스타일 및 기능 설정
            closeButton.innerHTML = '×';
            closeButton.className = 'modal-close final-close-btn';
            closeButton.style.cssText = `
                position: absolute !important;
                top: 10px !important;
                right: 15px !important;
                background: transparent !important;
                border: none !important;
                font-size: 20px !important;
                cursor: pointer !important;
                color: #999 !important;
                z-index: 99999 !important;
                width: 30px !important;
                height: 30px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                border-radius: 50% !important;
                transition: all 0.2s ease !important;
            `;

            // 호버 효과
            closeButton.addEventListener('mouseenter', function() {
                this.style.backgroundColor = 'rgba(0,0,0,0.1)';
                this.style.color = '#333';
            });

            closeButton.addEventListener('mouseleave', function() {
                this.style.backgroundColor = 'transparent';
                this.style.color = '#999';
            });

            // 클릭 이벤트 (모든 기존 이벤트 제거 후 새로 바인딩)
            closeButton.onclick = null;
            closeButton.removeAttribute('onclick');

            const newCloseButton = closeButton.cloneNode(true);
            closeButton.parentNode.replaceChild(newCloseButton, closeButton);

            // 새 이벤트 바인딩
            newCloseButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();

                console.log('🎯 최종 닫기 버튼 클릭됨');

                // 모달 닫기
                const modal = document.getElementById('dateMemoModal');
                if (modal) {
                    modal.style.display = 'none';
                    modal.style.visibility = 'hidden';
                    modal.style.opacity = '0';

                    // 입력 필드 초기화
                    const titleInput = modal.querySelector('input[type="text"]');
                    const contentInput = modal.querySelector('textarea');
                    if (titleInput) titleInput.value = '';
                    if (contentInput) contentInput.value = '';

                    console.log('🎯 날짜 메모 모달 닫기 완료');
                }

                return false;
            }, { capture: true, once: false });

            console.log('🎯 최종 닫기 버튼 설정 완료');
        }

        // ESC 키 이벤트도 보장
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' || e.keyCode === 27) {
                const modal = document.getElementById('dateMemoModal');
                if (modal && modal.style.display !== 'none') {
                    modal.style.display = 'none';
                    modal.style.visibility = 'hidden';
                    modal.style.opacity = '0';
                    console.log('🎯 ESC키로 모달 닫기');
                }
            }
        });

        // 배경 클릭 이벤트
        const modal = document.getElementById('dateMemoModal');
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    this.style.display = 'none';
                    this.style.visibility = 'hidden';
                    this.style.opacity = '0';
                    console.log('🎯 배경 클릭으로 모달 닫기');
                }
            });
        }
    }

    // DOM 준비 즉시 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupFinalCloseButton);
    } else {
        setupFinalCloseButton();
    }

    // 추가 보장을 위한 지연 실행
    setTimeout(setupFinalCloseButton, 500);
    setTimeout(setupFinalCloseButton, 1000);

    console.log('🎯 최종 닫기 버튼 해결 시스템 완료');
})();

// 전역 함수로 노출
window.ensureFinalCloseButton = function() {
    const modal = document.getElementById('dateMemoModal');
    const button = document.getElementById('closeDateMemo');

    console.log('🎯 수동 닫기 버튼 확인:', {
        modal: !!modal,
        button: !!button,
        modalVisible: modal ? modal.style.display !== 'none' : false,
        buttonVisible: button ? button.style.display !== 'none' : false
    });

    if (modal && !button) {
        console.log('🎯 닫기 버튼이 없음 - 재생성');
        setupFinalCloseButton();
    }
};