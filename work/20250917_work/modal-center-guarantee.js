// 모달 중앙 정렬 보장 시스템
console.log('📍 모달 중앙 정렬 보장 시스템 로드됨');

// 모달을 화면 상단 가까이에 위치시키는 함수 (스크롤 불필요)
function forceModalCenter(modal) {
    if (!modal) return;

    // 최우선 강제 인라인 스타일로 상단 30% 위치에 정렬 (드래그 가능)
    modal.style.setProperty('position', 'fixed', 'important');
    modal.style.setProperty('top', '30%', 'important');
    modal.style.setProperty('left', '50%', 'important');
    modal.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
    modal.style.setProperty('z-index', '999999', 'important');
    modal.style.setProperty('margin', '0', 'important');

    // 추가 보장을 위한 속성들
    modal.style.setProperty('max-height', '65vh', 'important');
    modal.style.setProperty('width', '85%', 'important');
    modal.style.setProperty('max-width', '480px', 'important');

    console.log('📍 모달 상단 30% 강제 적용 완료:', modal.id || modal.className);
}

// 모든 모달 컨텐츠를 중앙 정렬하는 함수
function centerAllModalContents() {
    const modalContents = document.querySelectorAll('.modal-content');
    modalContents.forEach(content => {
        forceModalCenter(content);
    });
}

// openModal 함수 재정의 - 중앙 정렬 보장
const originalOpenModal = window.openModal;
window.openModal = function(modalId) {
    console.log('📍 중앙 정렬 보장 openModal 호출:', modalId);

    // 기존 함수 실행
    if (originalOpenModal) {
        originalOpenModal(modalId);
    }

    // 추가 중앙 정렬 보장
    setTimeout(() => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            modal.style.visibility = 'visible';
            modal.style.opacity = '1';

            // 모달 컨텐츠 중앙 정렬
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                forceModalCenter(modalContent);
            }
        }
    }, 10);
};

// openDateMemoModal 함수 강화
const originalOpenDateMemoModal = window.openDateMemoModal;
window.openDateMemoModal = function(...args) {
    console.log('📍 중앙 정렬 보장 openDateMemoModal 호출:', args);

    // 기존 함수 실행
    if (originalOpenDateMemoModal) {
        originalOpenDateMemoModal.apply(this, args);
    }

    // 즉시 강제 적용
    const dateMemoModal = document.getElementById('dateMemoModal');
    if (dateMemoModal) {
        dateMemoModal.style.display = 'block';
        dateMemoModal.style.visibility = 'visible';
        dateMemoModal.style.opacity = '1';

        // 모달 컨텐츠 강제 중앙 정렬
        const modalContent = dateMemoModal.querySelector('.modal-content, .memo-modal-content');
        if (modalContent) {
            forceModalCenter(modalContent);
        }
    }

    // 추가 보장을 위한 지연 적용
    setTimeout(() => {
        const modal = document.getElementById('dateMemoModal');
        if (modal) {
            const content = modal.querySelector('.modal-content, .memo-modal-content');
            if (content) {
                forceModalCenter(content);
            }
        }
    }, 10);

    // 더 강력한 지연 적용
    setTimeout(() => {
        const modal = document.getElementById('dateMemoModal');
        if (modal) {
            const content = modal.querySelector('.modal-content, .memo-modal-content');
            if (content) {
                forceModalCenter(content);
            }
        }
    }, 100);
};

// DOM이 준비되면 즉시 적용
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        centerAllModalContents();

        // 달력 날짜 클릭 이벤트에 중앙 정렬 보장 추가
        const calendarDays = document.querySelectorAll('.calendar-day, [data-date]');
        calendarDays.forEach(day => {
            day.addEventListener('click', function() {
                setTimeout(() => {
                    centerAllModalContents();
                }, 50);
            });
        });

        console.log('📍 달력 날짜 클릭 이벤트에 중앙 정렬 보장 추가 완료');
    });
} else {
    centerAllModalContents();
}

// MutationObserver로 새로 생성되는 모달도 감시
const modalObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === 1) { // Element node
                // 모달 컨텐츠가 추가되면 중앙 정렬
                if (node.classList && node.classList.contains('modal-content')) {
                    setTimeout(() => forceModalCenter(node), 10);
                }

                // 모달 안의 컨텐츠 체크
                const modalContents = node.querySelectorAll ? node.querySelectorAll('.modal-content') : [];
                modalContents.forEach(content => {
                    setTimeout(() => forceModalCenter(content), 10);
                });
            }
        });
    });
});

// body 감시 시작
if (document.body) {
    modalObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
} else {
    document.addEventListener('DOMContentLoaded', function() {
        modalObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

// 윈도우 리사이즈 시에도 중앙 정렬 유지
window.addEventListener('resize', function() {
    setTimeout(centerAllModalContents, 100);
});

// 스크롤 시에도 중앙 정렬 유지 (필요한 경우)
let scrollTimeout;
window.addEventListener('scroll', function() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(centerAllModalContents, 50);
});

console.log('📍 모달 중앙 정렬 보장 시스템 완전 활성화');

// 디버깅용 함수 (전역으로 노출)
window.debugModalPositions = function() {
    const modals = document.querySelectorAll('.modal-content');
    console.log('📍 현재 모달 위치 정보:');
    modals.forEach((modal, index) => {
        const rect = modal.getBoundingClientRect();
        const styles = window.getComputedStyle(modal);
        console.log(`Modal ${index + 1}:`, {
            id: modal.id,
            position: styles.position,
            top: styles.top,
            left: styles.left,
            transform: styles.transform,
            rect: {
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height
            }
        });
    });
};