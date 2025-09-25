// 모달 깜박임 방지 스크립트 - 페이지 새로고침 시 즉시 적용
console.log('🛡️ 모달 깜박임 방지 스크립트 로드됨');

// 즉시 실행되는 스타일 강제 적용
(function() {
    // CSS 스타일을 즉시 삽입하여 모든 모달을 숨김
    const style = document.createElement('style');
    style.id = 'prevent-modal-flash';
    style.textContent = `
        /* 모든 모달을 강제로 숨김 - 페이지 로드 시 깜박임 방지 */
        .modal,
        [id*="modal"],
        [id*="Modal"],
        #dateMemoModal,
        #memoDetailModal,
        #stickyMemo,
        .sticky-memo {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
        }

        /* 페이지 초기화 중에는 모든 오버레이 숨김 */
        .modal-overlay,
        .overlay {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
        }
    `;

    // head에 즉시 삽입
    (document.head || document.documentElement).insertBefore(style, (document.head || document.documentElement).firstChild);
    console.log('🛡️ 모달 깜박임 방지 CSS 즉시 적용');

    // DOM이 준비되면 추가 처리
    function hideAllModals() {
        const allModals = document.querySelectorAll('.modal, [id*="modal"], [id*="Modal"], .sticky-memo');
        let hiddenCount = 0;

        allModals.forEach(modal => {
            if (modal.style.display !== 'none') {
                modal.style.display = 'none';
                modal.style.visibility = 'hidden';
                modal.style.opacity = '0';
                hiddenCount++;
            }
        });

        if (hiddenCount > 0) {
            console.log(`🛡️ ${hiddenCount}개 모달 강제 숨김 완료`);
        }
    }

    // 즉시 실행
    hideAllModals();

    // DOM 준비시 재실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', hideAllModals);
    } else {
        hideAllModals();
    }

    // 페이지 로드 완료시 재실행
    if (document.readyState !== 'complete') {
        window.addEventListener('load', hideAllModals);
    }

    // MutationObserver로 동적 생성된 모달도 감시
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) { // Element node
                    if (node.classList && (
                        node.classList.contains('modal') ||
                        node.id && (node.id.includes('modal') || node.id.includes('Modal')) ||
                        node.classList.contains('sticky-memo')
                    )) {
                        node.style.display = 'none';
                        node.style.visibility = 'hidden';
                        node.style.opacity = '0';
                        console.log('🛡️ 동적 생성된 모달 즉시 숨김:', node.id || node.className);
                    }
                }
            });
        });
    });

    // body가 준비되면 감시 시작
    if (document.body) {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }

    console.log('🛡️ 모달 깜박임 방지 시스템 활성화');
})();

// 모달을 정상적으로 여는 함수 (기존 함수 재정의)
window.safeOpenModal = function(modalId) {
    console.log('🔓 안전한 모달 열기:', modalId);

    const modal = document.getElementById(modalId);
    if (!modal) {
        console.warn('🚫 모달을 찾을 수 없음:', modalId);
        return;
    }

    // 즉시 스타일 제거용 CSS 제거 (해당 모달만)
    const preventStyle = document.getElementById('prevent-modal-flash');
    let tempStyle = null;

    if (preventStyle) {
        // 임시로 다른 모달들만 숨김
        tempStyle = document.createElement('style');
        tempStyle.textContent = `
            .modal:not(#${modalId}),
            [id*="modal"]:not(#${modalId}),
            [id*="Modal"]:not(#${modalId}) {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
            }
        `;
        document.head.appendChild(tempStyle);
        preventStyle.remove();
    }

    // 모달 표시
    modal.style.display = 'block';
    modal.style.visibility = 'visible';
    modal.style.opacity = '1';

    // 잠시 후 임시 스타일 정리
    setTimeout(() => {
        if (tempStyle) {
            tempStyle.remove();
        }
    }, 100);

    console.log('✅ 모달 정상 표시:', modalId);
};

// 기존 openModal 함수를 안전한 버전으로 교체
if (typeof window.openModal !== 'undefined') {
    window.originalOpenModal = window.openModal;
}
window.openModal = window.safeOpenModal;