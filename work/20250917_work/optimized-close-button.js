// 최적화된 닫기 버튼 시스템 - CPU 사용량 최소화
console.log('⚡ 최적화된 닫기 버튼 시스템 로드');

// 기존 CPU 집약적 스크립트들 완전 정지
(function stopIntensiveScripts() {
    // 기존 타이머들 정리
    const highId = setTimeout(() => {}, 0);
    for (let i = 0; i < highId; i++) {
        clearTimeout(i);
        clearInterval(i);
    }

    // MutationObserver들 정리
    if (window.modalObservers) {
        window.modalObservers.forEach(observer => {
            try { observer.disconnect(); } catch(e) {}
        });
        window.modalObservers = [];
    }

    console.log('⚡ 기존 CPU 집약적 시스템 정지 완료');
})();

// 단순하고 효율적인 닫기 시스템
function initOptimizedCloseSystem() {
    const modal = document.getElementById('dateMemoModal');
    if (!modal) return;

    // 기존 닫기 버튼들 정리 (한 번만)
    const existingButtons = modal.querySelectorAll('button, .close-btn, .modal-close');
    existingButtons.forEach(btn => {
        if (btn.textContent.includes('×') && btn.id !== 'optimizedCloseBtn') {
            btn.remove();
        }
    });

    // 단일 최적화된 닫기 버튼 생성
    let closeBtn = document.getElementById('optimizedCloseBtn');
    if (!closeBtn) {
        closeBtn = document.createElement('button');
        closeBtn.id = 'optimizedCloseBtn';
        closeBtn.innerHTML = '×';
        closeBtn.className = 'modal-close';

        // 스타일 설정 (한 번만)
        closeBtn.style.cssText = `
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
            transition: background-color 0.2s ease !important;
        `;

        // 모달 헤더에 추가
        const header = modal.querySelector('.memo-header');
        if (header) {
            header.appendChild(closeBtn);
        }
    }

    // 단일 이벤트 리스너 (중복 방지)
    if (!closeBtn.hasAttribute('data-optimized-listener')) {
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const targetModal = document.getElementById('dateMemoModal');
            if (targetModal) {
                targetModal.style.display = 'none';
                targetModal.style.visibility = 'hidden';
                targetModal.style.opacity = '0';

                // 입력 필드 초기화
                const titleInput = targetModal.querySelector('input[type="text"]');
                const contentInput = targetModal.querySelector('textarea');
                if (titleInput) titleInput.value = '';
                if (contentInput) contentInput.value = '';

                console.log('⚡ 모달 닫기 완료 (최적화됨)');
            }
            return false;
        });

        // 호버 이벤트 (최적화)
        closeBtn.addEventListener('mouseenter', function() {
            this.style.backgroundColor = 'rgba(0,0,0,0.1)';
        });

        closeBtn.addEventListener('mouseleave', function() {
            this.style.backgroundColor = 'transparent';
        });

        closeBtn.setAttribute('data-optimized-listener', 'true');
    }

    console.log('⚡ 최적화된 닫기 버튼 설정 완료');
}

// ESC 키와 배경 클릭 (한 번만 설정)
if (!document.hasAttribute('data-optimized-events')) {
    // ESC 키
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('dateMemoModal');
            if (modal && modal.style.display !== 'none') {
                modal.style.display = 'none';
                modal.style.visibility = 'hidden';
                modal.style.opacity = '0';
            }
        }
    });

    // 배경 클릭 (delegated event)
    document.addEventListener('click', function(e) {
        const modal = document.getElementById('dateMemoModal');
        if (e.target === modal && modal.style.display !== 'none') {
            modal.style.display = 'none';
            modal.style.visibility = 'hidden';
            modal.style.opacity = '0';
        }
    });

    document.setAttribute('data-optimized-events', 'true');
}

// DOM 준비 시 한 번만 실행
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOptimizedCloseSystem);
} else {
    initOptimizedCloseSystem();
}

// 전역 함수 노출 (필요시만)
window.forceOptimizedClose = function() {
    const modal = document.getElementById('dateMemoModal');
    if (modal) {
        modal.style.display = 'none';
        modal.style.visibility = 'hidden';
        modal.style.opacity = '0';
        console.log('⚡ 강제 닫기 완료');
    }
};

console.log('⚡ 최적화된 닫기 버튼 시스템 완료 - CPU 효율적');