// 메모창 위치 완전 고정 시스템
console.log('📌 메모창 위치 완전 고정 시스템 로드');

// 드래그 기능 완전 비활성화 및 위치 고정
function lockModalPosition() {
    console.log('📌 모달 위치 고정 시작');

    // 기존 드래그 이벤트 제거
    document.removeEventListener('mousedown', handleModalDrag);
    document.removeEventListener('mousemove', handleModalDrag);
    document.removeEventListener('mouseup', handleModalDrag);

    // 모든 모달 컨텐츠 고정
    const modalContents = document.querySelectorAll('.memo-modal-content, .modal-content');
    modalContents.forEach(content => {
        // 드래그 관련 클래스 제거
        content.classList.remove('dragging', 'draggable');

        // 위치 완전 고정
        content.style.setProperty('position', 'fixed', 'important');
        content.style.setProperty('top', '35%', 'important');
        content.style.setProperty('left', '50%', 'important');
        content.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
        content.style.setProperty('margin', '0', 'important');

        // 드래그 방지 스타일
        content.style.setProperty('user-select', 'none', 'important');
        content.style.setProperty('pointer-events', 'auto', 'important');
        content.style.setProperty('-webkit-user-drag', 'none', 'important');
        content.style.setProperty('-moz-user-select', 'none', 'important');
        content.style.setProperty('-ms-user-select', 'none', 'important');
    });

    // 모달 헤더의 드래그 기능 비활성화
    const modalHeaders = document.querySelectorAll('.memo-header');
    modalHeaders.forEach(header => {
        // 기존 드래그 이벤트 제거
        header.onmousedown = null;
        header.ondragstart = null;

        // 드래그 방지 스타일
        header.style.setProperty('cursor', 'default', 'important');
        header.style.setProperty('user-select', 'none', 'important');
        header.style.setProperty('-webkit-user-drag', 'none', 'important');

        // 새 이벤트 리스너로 드래그 방지
        header.addEventListener('mousedown', function(e) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }, { capture: true });

        header.addEventListener('dragstart', function(e) {
            e.preventDefault();
            return false;
        });
    });

    console.log('📌 모달 위치 고정 완료');
}

// 모달이 열릴 때마다 위치 재고정
function enforceFixedPosition() {
    const modals = document.querySelectorAll('.memo-modal, [id*="modal"], [id*="Modal"]');

    modals.forEach(modal => {
        if (modal.style.display === 'block' || modal.style.visibility === 'visible') {
            const content = modal.querySelector('.memo-modal-content, .modal-content');
            if (content) {
                // 강제 위치 재설정
                content.style.setProperty('position', 'fixed', 'important');
                content.style.setProperty('top', '35%', 'important');
                content.style.setProperty('left', '50%', 'important');
                content.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
                content.style.setProperty('margin', '0', 'important');

                // 드래그된 상태 해제
                content.classList.remove('dragging');
                modal.classList.remove('has-positioned-content');
            }
        }
    });
}

// 기존 openModal 함수 확장
const originalOpenModal = window.openModal;
window.openModal = function(modalId) {
    console.log('📌 고정 위치 openModal 호출:', modalId);

    // 기존 함수 실행
    if (originalOpenModal) {
        originalOpenModal(modalId);
    }

    // 위치 강제 고정
    setTimeout(() => {
        enforceFixedPosition();
        lockModalPosition();
    }, 100);
};

// 날짜 메모 모달 전용 고정
const originalOpenDateMemoModal = window.openDateMemoModal;
window.openDateMemoModal = function(date) {
    console.log('📌 고정 위치 openDateMemoModal 호출:', date);

    // 기존 함수 실행
    if (originalOpenDateMemoModal) {
        originalOpenDateMemoModal(date);
    }

    // 위치 강제 고정
    setTimeout(() => {
        const modal = document.getElementById('dateMemoModal');
        if (modal) {
            const content = modal.querySelector('.memo-modal-content');
            if (content) {
                content.style.setProperty('position', 'fixed', 'important');
                content.style.setProperty('top', '35%', 'important');
                content.style.setProperty('left', '50%', 'important');
                content.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
                content.style.setProperty('margin', '0', 'important');

                // 드래그 상태 해제
                content.classList.remove('dragging');
                modal.classList.remove('has-positioned-content');
            }
        }
        lockModalPosition();
    }, 100);
};

// MutationObserver로 동적 모달 감지 및 고정
const positionObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' &&
            (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {

            const target = mutation.target;
            if (target.classList.contains('memo-modal') ||
                target.classList.contains('modal') ||
                target.id.includes('modal') ||
                target.id.includes('Modal')) {

                if (target.style.display === 'block' || target.style.visibility === 'visible') {
                    setTimeout(() => {
                        enforceFixedPosition();
                        lockModalPosition();
                    }, 50);
                }
            }
        }

        // 새로 추가된 모달 감지
        mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === 1 &&
                (node.classList?.contains('memo-modal') ||
                 node.classList?.contains('modal') ||
                 node.id?.includes('modal'))) {

                setTimeout(() => {
                    enforceFixedPosition();
                    lockModalPosition();
                }, 100);
            }
        });
    });
});

// DOM 준비 시 초기화
function initializeFixedPosition() {
    console.log('📌 고정 위치 시스템 초기화');

    // 즉시 고정
    lockModalPosition();

    // 주기적 점검 (1초마다)
    setInterval(() => {
        enforceFixedPosition();
    }, 1000);

    // MutationObserver 시작
    if (document.body) {
        positionObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
        });
    }

    console.log('📌 고정 위치 시스템 활성화 완료');
}

// DOM 로드 시 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFixedPosition);
} else {
    initializeFixedPosition();
}

// 추가 보장을 위한 지연 초기화
setTimeout(initializeFixedPosition, 500);
setTimeout(initializeFixedPosition, 1500);

console.log('📌 메모창 위치 완전 고정 시스템 로드 완료');