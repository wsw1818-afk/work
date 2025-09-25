// 모달 닫기 기능 수정 시스템
console.log('❌ 모달 닫기 기능 수정 시스템 로드됨');

// 안전한 모달 닫기 함수
function safeCloseModal(modalId) {
    console.log('❌ 안전한 모달 닫기 시도:', modalId);

    const modal = document.getElementById(modalId);
    if (!modal) {
        console.warn('❌ 모달을 찾을 수 없음:', modalId);
        return false;
    }

    // 모달 숨김
    modal.style.display = 'none';
    modal.style.visibility = 'hidden';
    modal.style.opacity = '0';

    // 추가 클래스 제거
    modal.classList.remove('opening', 'closing', 'has-positioned-content');

    // 배경 스크롤 복원
    document.body.style.overflow = '';

    console.log('❌ 모달 닫기 완료:', modalId);
    return true;
}

// 날짜 메모 모달 닫기 함수 강화
function closeDateMemoModal() {
    console.log('❌ closeDateMemoModal 호출됨');

    // 기존 함수가 있으면 호출
    if (window.originalCloseDateMemoModal) {
        try {
            window.originalCloseDateMemoModal();
        } catch (error) {
            console.error('❌ 기존 닫기 함수 오류:', error);
        }
    }

    // 강제 닫기
    const success = safeCloseModal('dateMemoModal');

    // 추가 정리 작업
    if (success) {
        // 선택된 날짜 초기화
        if (window.selectedDate) {
            window.selectedDate = null;
        }

        // 입력 필드 초기화
        const titleInput = document.querySelector('#dateMemoModal input[type="text"]');
        const contentInput = document.querySelector('#dateMemoModal textarea');

        if (titleInput) titleInput.value = '';
        if (contentInput) contentInput.value = '';

        console.log('❌ 날짜 메모 모달 완전 닫기 완료');
    }
}

// DOM이 준비되면 닫기 이벤트 바인딩
function bindCloseEvents() {
    // X 버튼 클릭 이벤트
    const closeButtons = document.querySelectorAll('.modal-close, [onclick*="close"], [onclick*="Close"]');
    closeButtons.forEach(button => {
        // 기존 이벤트 제거 후 새로 바인딩
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);

        newButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            // 모달 찾기
            const modal = this.closest('.modal') || document.getElementById('dateMemoModal');
            if (modal) {
                const modalId = modal.id || 'dateMemoModal';
                if (modalId === 'dateMemoModal') {
                    closeDateMemoModal();
                } else {
                    safeCloseModal(modalId);
                }
            }

            return false;
        });

        console.log('❌ 닫기 버튼 이벤트 바인딩 완료');
    });

    // ESC 키 이벤트
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' || e.keyCode === 27) {
            // 열린 모달 찾기
            const openModals = document.querySelectorAll('.modal[style*="block"], .modal[style*="visible"]');
            openModals.forEach(modal => {
                if (modal.id === 'dateMemoModal') {
                    closeDateMemoModal();
                } else {
                    safeCloseModal(modal.id);
                }
            });
        }
    });

    // 배경 클릭 이벤트
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) { // 배경 클릭
                if (this.id === 'dateMemoModal') {
                    closeDateMemoModal();
                } else {
                    safeCloseModal(this.id);
                }
            }
        });
    });
}

// 기존 닫기 함수 백업 및 교체
if (typeof window.closeDateMemoModal !== 'undefined') {
    window.originalCloseDateMemoModal = window.closeDateMemoModal;
}
window.closeDateMemoModal = closeDateMemoModal;

// DOM 준비 시 이벤트 바인딩
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindCloseEvents);
} else {
    bindCloseEvents();
}

// MutationObserver로 동적 생성된 버튼도 처리
const closeObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === 1) {
                // 새로 추가된 닫기 버튼들
                const newCloseButtons = node.querySelectorAll ?
                    node.querySelectorAll('.modal-close, [onclick*="close"], [onclick*="Close"]') : [];

                newCloseButtons.forEach(button => {
                    const newButton = button.cloneNode(true);
                    button.parentNode.replaceChild(newButton, button);

                    newButton.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();

                        const modal = this.closest('.modal') || document.getElementById('dateMemoModal');
                        if (modal) {
                            const modalId = modal.id || 'dateMemoModal';
                            if (modalId === 'dateMemoModal') {
                                closeDateMemoModal();
                            } else {
                                safeCloseModal(modalId);
                            }
                        }
                        return false;
                    });
                });
            }
        });
    });
});

// 감시 시작
if (document.body) {
    closeObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
} else {
    document.addEventListener('DOMContentLoaded', function() {
        closeObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

// 전역 닫기 함수
window.forceCloseAllModals = function() {
    const modals = document.querySelectorAll('.modal, [id*="modal"], [id*="Modal"]');
    modals.forEach(modal => {
        modal.style.display = 'none';
        modal.style.visibility = 'hidden';
        modal.style.opacity = '0';
    });
    document.body.style.overflow = '';
    console.log('❌ 모든 모달 강제 닫기 완료');
};

console.log('❌ 모달 닫기 기능 수정 시스템 완전 활성화');