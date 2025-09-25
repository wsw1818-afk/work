// 중복 닫기 버튼 제거 및 정리 시스템
console.log('🎯 중복 닫기 버튼 제거 시스템 로드됨');

// 중복 닫기 버튼 제거 함수
function removeDuplicateCloseButtons() {
    // 모든 닫기 버튼 요소 찾기
    const closeButtons = document.querySelectorAll(`
        .modal-close,
        [class*="close"],
        [onclick*="close"],
        [onclick*="Close"],
        button[aria-label*="close"],
        button[title*="close"],
        .close-btn,
        .btn-close,
        [data-dismiss="modal"]
    `);

    console.log('🎯 발견된 닫기 버튼 개수:', closeButtons.length);

    // 모달별로 그룹화
    const modalCloseButtons = {};

    closeButtons.forEach((button, index) => {
        const modal = button.closest('.modal') ||
                     button.closest('[id*="modal"]') ||
                     button.closest('[id*="Modal"]') ||
                     document.getElementById('dateMemoModal');

        if (modal) {
            const modalId = modal.id || 'unknown-modal';

            if (!modalCloseButtons[modalId]) {
                modalCloseButtons[modalId] = [];
            }

            modalCloseButtons[modalId].push({
                element: button,
                index: index,
                isVisible: window.getComputedStyle(button).display !== 'none',
                hasText: button.textContent.includes('×') || button.textContent.includes('✕'),
                className: button.className,
                position: window.getComputedStyle(button).position
            });
        }
    });

    // 각 모달에서 중복 버튼 제거
    Object.keys(modalCloseButtons).forEach(modalId => {
        const buttons = modalCloseButtons[modalId];

        if (buttons.length > 1) {
            console.log(`🎯 ${modalId}에서 ${buttons.length}개의 닫기 버튼 발견`);

            // 가장 적합한 버튼 하나만 남기기
            // 우선순위: visible > positioned > has close text > first
            buttons.sort((a, b) => {
                if (a.isVisible !== b.isVisible) return b.isVisible - a.isVisible;
                if (a.position === 'absolute' || a.position === 'fixed') return -1;
                if (b.position === 'absolute' || b.position === 'fixed') return 1;
                if (a.hasText !== b.hasText) return b.hasText - a.hasText;
                return a.index - b.index;
            });

            // 첫 번째(최적) 버튼만 남기고 나머지 제거
            const keepButton = buttons[0];
            const removeButtons = buttons.slice(1);

            removeButtons.forEach(buttonInfo => {
                console.log('🎯 중복 버튼 제거:', buttonInfo.className);

                // 부모 요소가 오직 이 버튼만 포함하면 부모까지 제거
                const parent = buttonInfo.element.parentElement;
                if (parent && parent.children.length === 1 &&
                    (parent.classList.contains('close') || parent.classList.contains('modal-close'))) {
                    parent.remove();
                } else {
                    buttonInfo.element.remove();
                }
            });

            console.log(`🎯 ${modalId}: ${removeButtons.length}개 버튼 제거, 1개 유지`);

            // 남은 버튼이 제대로 작동하도록 보장
            const finalButton = keepButton.element;
            if (finalButton && finalButton.parentElement) {
                // 기존 이벤트 제거 후 새로 바인딩
                const newButton = finalButton.cloneNode(true);
                finalButton.parentElement.replaceChild(newButton, finalButton);

                // 새 이벤트 바인딩
                newButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    if (modalId === 'dateMemoModal') {
                        if (window.closeDateMemoModal) {
                            window.closeDateMemoModal();
                        } else if (window.safeCloseModal) {
                            window.safeCloseModal('dateMemoModal');
                        }
                    } else {
                        if (window.safeCloseModal) {
                            window.safeCloseModal(modalId);
                        }
                    }

                    console.log('🎯 단일 닫기 버튼 클릭:', modalId);
                    return false;
                });

                // 스타일 정리
                newButton.style.cursor = 'pointer';
                newButton.style.userSelect = 'none';

                console.log('🎯 최종 닫기 버튼 설정 완료:', modalId);
            }
        }
    });
}

// CSS로 중복 버튼 숨김 처리
function hideDuplicateCloseButtonsCSS() {
    const style = document.createElement('style');
    style.id = 'duplicate-close-button-fix';
    style.textContent = `
        /* 중복 닫기 버튼 숨김 */
        .modal-header .modal-close:not(:first-of-type),
        .modal-content .modal-close:not(:first-of-type),
        .modal-close.duplicate {
            display: none !important;
        }

        /* 단일 닫기 버튼 스타일 정리 */
        .modal-close {
            position: absolute !important;
            top: 10px !important;
            right: 15px !important;
            z-index: 1000 !important;
            cursor: pointer !important;
            user-select: none !important;
            background: transparent !important;
            border: none !important;
            font-size: 24px !important;
            line-height: 1 !important;
            color: #999 !important;
            transition: color 0.2s ease !important;
        }

        .modal-close:hover {
            color: #333 !important;
            background: rgba(0,0,0,0.1) !important;
            border-radius: 50% !important;
        }

        /* 다른 닫기 버튼들도 정리 */
        .close, .btn-close, [data-dismiss="modal"] {
            position: relative !important;
        }
    `;

    document.head.appendChild(style);
    console.log('🎯 중복 버튼 숨김 CSS 적용 완료');
}

// 즉시 실행
(function() {
    // CSS 먼저 적용
    hideDuplicateCloseButtonsCSS();

    // DOM이 준비되면 중복 버튼 제거
    function cleanup() {
        setTimeout(removeDuplicateCloseButtons, 100);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', cleanup);
    } else {
        cleanup();
    }

    // 모달이 열릴 때마다 중복 제거
    const originalOpenModal = window.openModal;
    if (originalOpenModal) {
        window.openModal = function(...args) {
            const result = originalOpenModal.apply(this, args);
            setTimeout(removeDuplicateCloseButtons, 50);
            return result;
        };
    }

    const originalOpenDateMemoModal = window.openDateMemoModal;
    if (originalOpenDateMemoModal) {
        window.openDateMemoModal = function(...args) {
            const result = originalOpenDateMemoModal.apply(this, args);
            setTimeout(removeDuplicateCloseButtons, 50);
            return result;
        };
    }

    // MutationObserver로 새로 생성된 모달도 처리
    const duplicateObserver = new MutationObserver(function(mutations) {
        let shouldCleanup = false;

        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) {
                    if (node.classList && (
                        node.classList.contains('modal') ||
                        node.classList.contains('modal-close') ||
                        node.id && node.id.includes('modal')
                    )) {
                        shouldCleanup = true;
                    }

                    const modalElements = node.querySelectorAll ?
                        node.querySelectorAll('.modal, .modal-close') : [];
                    if (modalElements.length > 0) {
                        shouldCleanup = true;
                    }
                }
            });
        });

        if (shouldCleanup) {
            setTimeout(removeDuplicateCloseButtons, 100);
        }
    });

    if (document.body) {
        duplicateObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    console.log('🎯 중복 닫기 버튼 제거 시스템 완전 활성화');
})();

// 전역 정리 함수
window.cleanupDuplicateCloseButtons = removeDuplicateCloseButtons;