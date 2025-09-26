/**
 * 궁극의 메모 모달 수정 - 모든 방법을 동원한 강제 표시
 * 날짜 클릭 이벤트를 직접 가로채고 모달을 강제로 표시
 */

(function() {
    'use strict';

    console.log('🚀 궁극의 메모 모달 수정 시작...');

    // 전역 차단 변수들 모두 초기화
    window.modalJustClosed = false;
    window.lastClosedModalDate = '';

    // ===== 날짜 클릭 이벤트 직접 가로채기 =====
    function interceptDateClicks() {
        console.log('🎯 날짜 클릭 이벤트 가로채기 시작...');

        // Capture phase에서 모든 클릭 이벤트 가로채기
        document.addEventListener('click', function(e) {
            const dayCell = e.target.closest('.day:not(.other-month)');
            if (!dayCell) return;

            const dayNumber = dayCell.querySelector('.day-number');
            if (!dayNumber) return;

            const date = parseInt(dayNumber.textContent);
            const currentYear = window.currentYear || new Date().getFullYear();
            const currentMonth = window.currentMonth || (new Date().getMonth() + 1);

            console.log(`🎯 날짜 ${date}일 클릭 감지!`);

            // 이벤트 전파 중단
            e.stopImmediatePropagation();
            e.preventDefault();

            // 강제로 모달 열기
            forceShowMemoModal(currentYear, currentMonth, date);
        }, true); // true = capture phase
    }

    // ===== 모달 강제 표시 함수 =====
    function forceShowMemoModal(year, month, date) {
        console.log(`💪 모달 강제 표시: ${year}-${month}-${date}`);

        // 모든 차단 변수 무효화
        window.modalJustClosed = false;
        window.lastClosedModalDate = '';

        const targetDate = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
        window.selectedDate = targetDate;

        // 모달 찾기
        let dateMemoModal = document.getElementById('dateMemoModal');

        if (!dateMemoModal) {
            console.error('❌ 모달 요소가 없음! 생성 시도...');
            createModalIfNotExists();
            dateMemoModal = document.getElementById('dateMemoModal');
        }

        // 제목 업데이트
        const titleElement = document.getElementById('dateMemoTitle');
        if (titleElement) {
            titleElement.textContent = `📅 ${targetDate} 메모`;
        }

        // 다른 모달들 모두 숨기기
        document.querySelectorAll('.modal').forEach(modal => {
            if (modal.id !== 'dateMemoModal') {
                modal.style.display = 'none';
            }
        });

        // CSS 속성 강제 설정 (!important 포함)
        const importantStyle = `
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            z-index: 2147483647 !important;
            background-color: white !important;
            border-radius: 12px !important;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3) !important;
            padding: 20px !important;
            min-width: 500px !important;
            max-width: 90vw !important;
            max-height: 90vh !important;
            overflow: auto !important;
        `;

        dateMemoModal.setAttribute('style', importantStyle);

        // 클래스 추가
        dateMemoModal.classList.add('force-visible');

        // 오버레이 추가
        addModalOverlay();

        // 포커스 설정
        setTimeout(() => {
            const input = dateMemoModal.querySelector('input[type="text"], textarea');
            if (input) {
                input.focus();
                console.log('✅ 입력 필드 포커스 설정');
            }
        }, 100);

        // 메모 리스트 렌더링
        if (window.MemoSystem && window.MemoSystem.renderDateMemoList) {
            window.MemoSystem.renderDateMemoList(targetDate);
        }

        console.log('✅ 모달 강제 표시 완료!');
    }

    // ===== 모달 오버레이 추가 =====
    function addModalOverlay() {
        let overlay = document.getElementById('ultimate-modal-overlay');

        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'ultimate-modal-overlay';
            document.body.appendChild(overlay);
        }

        const overlayStyle = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background-color: rgba(0, 0, 0, 0.7) !important;
            z-index: 2147483646 !important;
            display: block !important;
        `;

        overlay.setAttribute('style', overlayStyle);

        overlay.onclick = function() {
            closeUltimateMemoModal();
        };
    }

    // ===== 모달 닫기 함수 =====
    function closeUltimateMemoModal() {
        const modal = document.getElementById('dateMemoModal');
        const overlay = document.getElementById('ultimate-modal-overlay');

        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('force-visible');
        }

        if (overlay) {
            overlay.style.display = 'none';
        }

        console.log('🔒 모달 닫기 완료');
    }

    // ===== 모달 HTML 생성 (없을 경우) =====
    function createModalIfNotExists() {
        const modalHTML = `
            <div id="dateMemoModal" class="modal memo-modal" style="display:none;">
                <div class="memo-modal-content">
                    <div class="memo-modal-header">
                        <h3 id="dateMemoTitle">📅 메모</h3>
                        <button class="modal-close-btn" onclick="closeUltimateMemoModal()">✕</button>
                    </div>
                    <div class="memo-modal-body">
                        <div class="memo-input-section">
                            <input type="text" id="memoTitleInput" placeholder="메모 제목을 입력하세요..." class="memo-title-input">
                            <textarea id="memoContentInput" placeholder="메모 내용을 입력하세요..." class="memo-content-input"></textarea>
                            <input type="file" id="memoFileInput" accept="image/*" multiple class="memo-file-input">
                            <button onclick="addDateMemo()" class="add-memo-btn">메모 추가</button>
                        </div>
                        <div id="dateMemoList" class="memo-list"></div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        console.log('✅ 메모 모달 HTML 생성 완료');
    }

    // ===== 기존 함수들 덮어쓰기 =====
    function overrideOriginalFunctions() {
        // openDateMemoModal 완전 교체
        window.openDateMemoModal = function(year, month, date) {
            console.log('🔄 원본 openDateMemoModal 호출 -> 강제 표시로 리디렉션');
            forceShowMemoModal(year, month, date);
        };

        // closeDateMemoModal 교체
        window.closeDateMemoModal = function() {
            closeUltimateMemoModal();
        };

        // closeModal 교체 (메모 모달인 경우)
        const originalCloseModal = window.closeModal;
        window.closeModal = function(modalId) {
            if (modalId === 'dateMemoModal') {
                closeUltimateMemoModal();
            } else if (originalCloseModal) {
                originalCloseModal.call(this, modalId);
            }
        };

        console.log('✅ 함수 덮어쓰기 완료');
    }

    // ===== CSS 강제 주입 =====
    function injectForceCSS() {
        const style = document.createElement('style');
        style.textContent = `
            #dateMemoModal.force-visible {
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                z-index: 2147483647 !important;
            }

            #ultimate-modal-overlay {
                z-index: 2147483646 !important;
            }

            .day:not(.other-month) {
                cursor: pointer !important;
            }

            .day:not(.other-month):hover {
                background-color: #e3f2fd !important;
                transform: scale(1.02);
                transition: all 0.2s;
            }
        `;
        document.head.appendChild(style);
        console.log('✅ 강제 CSS 주입 완료');
    }

    // ===== 초기화 =====
    function initialize() {
        console.log('🚀 궁극의 메모 모달 수정 초기화...');

        // 1. CSS 주입
        injectForceCSS();

        // 2. 기존 함수 덮어쓰기
        overrideOriginalFunctions();

        // 3. 날짜 클릭 이벤트 가로채기
        interceptDateClicks();

        // 4. ESC 키로 닫기
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeUltimateMemoModal();
            }
        });

        // 5. 전역 함수로 등록 (디버깅용)
        window.forceShowMemoModal = forceShowMemoModal;
        window.closeUltimateMemoModal = closeUltimateMemoModal;

        console.log('✅ 궁극의 메모 모달 수정 완료!');
        console.log('💡 날짜를 클릭하면 메모창이 강제로 나타납니다');
        console.log('💡 디버그: forceShowMemoModal(2025, 9, 24) 로 직접 호출 가능');
    }

    // DOM 준비 확인
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        // 즉시 실행
        initialize();
    }

    // 백업: 1초 후에도 한 번 더 실행
    setTimeout(initialize, 1000);

})();