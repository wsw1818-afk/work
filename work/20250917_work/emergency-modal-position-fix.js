// 긴급 모달 위치 수정 시스템 - 최강 강제 적용
console.log('🚨 긴급 모달 위치 수정 시스템 활성화');

// 즉시 실행 함수로 모든 모달을 강제로 위쪽에 배치
(function() {
    // CSS 강제 삽입
    const emergencyStyle = document.createElement('style');
    emergencyStyle.id = 'emergency-modal-position-fix';
    emergencyStyle.textContent = `
        /* 편리한 모달 위치 - 더 아래쪽으로 조정 */
        .modal-content,
        #dateMemoModal .modal-content,
        #dateMemoModal .memo-modal-content,
        [class*="modal-content"] {
            position: fixed !important;
            top: 45% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            z-index: 999999 !important;
            margin: 0 !important;
            max-height: 70vh !important;
            width: 85% !important;
            max-width: 480px !important;
        }

        /* 모바일 최적화 */
        @media (max-width: 768px) {
            .modal-content,
            #dateMemoModal .modal-content,
            #dateMemoModal .memo-modal-content {
                top: 40% !important;
                width: 95% !important;
                max-height: 75vh !important;
            }
        }

        /* 작은 화면 최적화 */
        @media (max-height: 600px) {
            .modal-content,
            #dateMemoModal .modal-content,
            #dateMemoModal .memo-modal-content {
                top: 35% !important;
                max-height: 80vh !important;
            }
        }
    `;

    // head에 최우선으로 삽입
    document.head.insertBefore(emergencyStyle, document.head.firstChild);
    console.log('🚨 긴급 CSS 스타일 강제 삽입 완료');

    // 강제 위치 적용 함수
    function emergencyForcePosition(element) {
        if (!element) return;

        // 모든 CSS 속성을 강제로 설정 - 더 아래쪽 위치 45%
        const styles = {
            'position': 'fixed',
            'top': '45%',
            'left': '50%',
            'transform': 'translate(-50%, -50%)',
            'z-index': '999999',
            'margin': '0',
            'max-height': '70vh',
            'width': '85%',
            'max-width': '480px'
        };

        Object.entries(styles).forEach(([property, value]) => {
            element.style.setProperty(property, value, 'important');
        });

        console.log('🚨 긴급 위치 강제 적용:', element.id || element.className);
    }

    // 모든 기존 모달에 즉시 적용
    function applyToAllModals() {
        const selectors = [
            '.modal-content',
            '#dateMemoModal .modal-content',
            '#dateMemoModal .memo-modal-content',
            '[class*="modal-content"]'
        ];

        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(emergencyForcePosition);
        });
    }

    // 즉시 적용
    applyToAllModals();

    // DOM 변경 감시
    const emergencyObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) {
                    // 새로 추가된 모달 요소에 즉시 적용
                    if (node.classList && (
                        node.classList.contains('modal-content') ||
                        node.classList.contains('memo-modal-content')
                    )) {
                        emergencyForcePosition(node);
                    }

                    // 하위 모달 요소들도 체크
                    const modalElements = node.querySelectorAll ?
                        node.querySelectorAll('.modal-content, .memo-modal-content') : [];
                    modalElements.forEach(emergencyForcePosition);
                }
            });
        });
    });

    // 감시 시작
    if (document.body) {
        emergencyObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            emergencyObserver.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }

    // 주기적 강제 적용 (1초마다)
    setInterval(applyToAllModals, 1000);

    // 모달 열기 이벤트 감지 및 강제 적용
    const originalAddEventListener = Element.prototype.addEventListener;
    Element.prototype.addEventListener = function(type, listener, options) {
        if (type === 'click' && this.dataset && this.dataset.date) {
            // 달력 날짜 클릭 이벤트 감지
            const originalListener = listener;
            const newListener = function(event) {
                originalListener.call(this, event);

                // 모달이 열릴 때까지 반복 체크
                let checkCount = 0;
                const checkModal = () => {
                    if (checkCount > 20) return; // 최대 20회 체크

                    const modal = document.getElementById('dateMemoModal');
                    if (modal && modal.style.display !== 'none') {
                        const content = modal.querySelector('.modal-content, .memo-modal-content');
                        if (content) {
                            emergencyForcePosition(content);
                            console.log('🚨 날짜 클릭 후 긴급 위치 적용');
                            return;
                        }
                    }

                    checkCount++;
                    setTimeout(checkModal, 50);
                };

                setTimeout(checkModal, 10);
            };
            return originalAddEventListener.call(this, type, newListener, options);
        }
        return originalAddEventListener.call(this, type, listener, options);
    };

    console.log('🚨 긴급 모달 위치 수정 시스템 완전 활성화');
})();

// 전역 긴급 함수 - 더 아래쪽 위치 45%
window.emergencyFixModalPosition = function() {
    const modals = document.querySelectorAll('.modal-content, .memo-modal-content');
    modals.forEach(modal => {
        modal.style.setProperty('position', 'fixed', 'important');
        modal.style.setProperty('top', '45%', 'important');
        modal.style.setProperty('left', '50%', 'important');
        modal.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
        modal.style.setProperty('z-index', '999999', 'important');
    });
    console.log('🚨 긴급 함수로 모달 위치 45% 수정 완료');
};