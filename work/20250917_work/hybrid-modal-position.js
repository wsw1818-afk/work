// 하이브리드 모달 위치 시스템 - 고정 위치 + 드래그 기능
console.log('🔄 하이브리드 모달 위치 시스템 로드');

// 모달 위치 강제 고정 (초기 위치만)
function enforceInitialPosition(modal) {
    if (!modal) return;

    const content = modal.querySelector('.memo-modal-content, .modal-content');
    if (content) {
        // 초기 위치만 강제 설정 (드래그 상태가 아닐 때만)
        if (!content.classList.contains('dragging') && !modal.classList.contains('has-positioned-content')) {
            content.style.setProperty('position', 'fixed', 'important');
            content.style.setProperty('top', '25%', 'important');
            content.style.setProperty('left', '50%', 'important');
            content.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
            content.style.setProperty('margin', '0', 'important');
            content.style.setProperty('z-index', '999999', 'important');

            console.log('🔄 모달 초기 위치 25% 강제 적용:', modal.id);
        }
    }
}

// 드래그 기능 활성화
function enableDragFunctionality() {
    console.log('🔄 드래그 기능 활성화');

    const modalIds = ['dateMemoModal', 'memoDetailModal'];

    modalIds.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            const modalContent = modal.querySelector('.memo-modal-content');
            const header = modal.querySelector('.memo-header');

            if (header && modalContent) {
                // 기존 드래그 이벤트 제거
                header.removeEventListener('mousedown', handleDragStart);

                // 새 드래그 이벤트 추가
                header.addEventListener('mousedown', function(e) {
                    // X 버튼은 드래그하지 않음
                    if (e.target.classList.contains('close-btn') ||
                        e.target.id === 'closeDateMemo' ||
                        e.target.id === 'closeMemoDetail' ||
                        e.target.textContent.includes('×')) {
                        e.stopPropagation();
                        console.log('🔄 X 버튼 클릭 - 드래그 방지');
                        return;
                    }

                    console.log('🔄 드래그 시작:', modalId);

                    // 드래그 상태 설정
                    modalContent.classList.add('dragging');
                    header.classList.add('dragging');

                    // 현재 위치 계산
                    const rect = modalContent.getBoundingClientRect();
                    const offsetX = e.clientX - rect.left - rect.width / 2;
                    const offsetY = e.clientY - rect.top - rect.height / 2;

                    // absolute 위치로 전환
                    modalContent.style.position = 'absolute';
                    modalContent.style.left = (rect.left + offsetX) + 'px';
                    modalContent.style.top = (rect.top + offsetY) + 'px';
                    modalContent.style.transform = 'none';
                    modalContent.style.margin = '0';

                    // 모달 컨테이너 드래그 모드
                    modal.classList.add('has-positioned-content');

                    // 마우스 이동 이벤트
                    function handleMouseMove(e) {
                        if (modalContent.classList.contains('dragging')) {
                            modalContent.style.left = (e.clientX + offsetX) + 'px';
                            modalContent.style.top = (e.clientY + offsetY) + 'px';
                        }
                    }

                    // 마우스 업 이벤트
                    function handleMouseUp() {
                        modalContent.classList.remove('dragging');
                        header.classList.remove('dragging');

                        document.removeEventListener('mousemove', handleMouseMove);
                        document.removeEventListener('mouseup', handleMouseUp);

                        console.log('🔄 드래그 완료');
                    }

                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);

                    e.preventDefault();
                });
            }
        }
    });
}

// 기존 openModal 함수 확장
const originalOpenModal = window.openModal;
window.openModal = function(modalId) {
    console.log('🔄 하이브리드 openModal 호출:', modalId);

    // 기존 함수 실행
    if (originalOpenModal) {
        originalOpenModal(modalId);
    }

    // 초기 위치 강제 적용
    setTimeout(() => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            modal.style.visibility = 'visible';
            modal.style.opacity = '1';

            // 초기 위치만 고정
            enforceInitialPosition(modal);

            // 드래그 기능 활성화
            enableDragFunctionality();
        }
    }, 100);
};

// 날짜 메모 모달 전용 확장
const originalOpenDateMemoModal = window.openDateMemoModal;
window.openDateMemoModal = function(date) {
    console.log('🔄 하이브리드 openDateMemoModal 호출:', date);

    // 기존 함수 실행
    if (originalOpenDateMemoModal) {
        originalOpenDateMemoModal(date);
    }

    // 초기 위치 강제 적용
    setTimeout(() => {
        const modal = document.getElementById('dateMemoModal');
        if (modal) {
            // 드래그 상태가 아니라면 초기 위치로 리셋
            const content = modal.querySelector('.memo-modal-content');
            if (content && !content.classList.contains('dragging')) {
                content.style.setProperty('position', 'fixed', 'important');
                content.style.setProperty('top', '25%', 'important');
                content.style.setProperty('left', '50%', 'important');
                content.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
                content.style.setProperty('margin', '0', 'important');

                // 드래그 상태 해제
                modal.classList.remove('has-positioned-content');
            }

            // 드래그 기능 활성화
            enableDragFunctionality();
        }
    }, 100);
};

// 모달 닫을 때 위치 리셋
const originalCloseDateMemoModal = window.closeDateMemoModal;
window.closeDateMemoModal = function() {
    console.log('🔄 하이브리드 closeDateMemoModal 호출');

    const modal = document.getElementById('dateMemoModal');
    if (modal) {
        const content = modal.querySelector('.memo-modal-content');
        if (content) {
            // 드래그 상태 완전 해제
            content.classList.remove('dragging');
            content.style.position = '';
            content.style.left = '';
            content.style.top = '';
            content.style.transform = '';
            content.style.margin = '';

            modal.classList.remove('has-positioned-content');
        }
    }

    // 기존 함수 실행
    if (originalCloseDateMemoModal) {
        originalCloseDateMemoModal();
    }
};

// DOM 준비 시 초기화
function initializeHybridSystem() {
    console.log('🔄 하이브리드 모달 시스템 초기화');

    // 드래그 기능 즉시 활성화
    enableDragFunctionality();

    // MutationObserver로 새 모달 감지
    const hybridObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const target = mutation.target;

                if ((target.classList.contains('memo-modal') || target.id.includes('modal')) &&
                    (target.style.display === 'block' || target.style.visibility === 'visible')) {

                    setTimeout(() => {
                        enforceInitialPosition(target);
                        enableDragFunctionality();
                    }, 50);
                }
            }
        });
    });

    // Observer 시작
    if (document.body) {
        hybridObserver.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style']
        });
    }

    console.log('🔄 하이브리드 모달 시스템 활성화 완료');
}

// DOM 로드 시 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeHybridSystem);
} else {
    initializeHybridSystem();
}

// 보장을 위한 지연 초기화
setTimeout(initializeHybridSystem, 500);

console.log('🔄 하이브리드 모달 위치 시스템 로드 완료');