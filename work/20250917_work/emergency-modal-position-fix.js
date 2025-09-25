// CPU 최적화된 정적 모달 위치 시스템
console.log('⚡ 정적 모달 위치 시스템 활성화');

// CSS만 사용하는 극단적 경량화 버전
(function() {
    // 한 번만 삽입하는 정적 CSS
    const staticStyle = document.createElement('style');
    staticStyle.id = 'static-modal-position-fix';
    staticStyle.textContent = `
        /* 고정 모달 위치 - CPU 효율적 */
        .modal-content,
        #dateMemoModal .modal-content,
        #dateMemoModal .memo-modal-content,
        [class*="modal-content"] {
            position: fixed !important;
            top: 25% !important;
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
                top: 20% !important;
                width: 95% !important;
                max-height: 75vh !important;
            }
        }

        /* 작은 화면 최적화 */
        @media (max-height: 600px) {
            .modal-content,
            #dateMemoModal .modal-content,
            #dateMemoModal .memo-modal-content {
                top: 15% !important;
                max-height: 80vh !important;
            }
        }
    `;

    // head에 삽입
    document.head.appendChild(staticStyle);
    console.log('⚡ 정적 CSS 스타일 삽입 완료');
})();