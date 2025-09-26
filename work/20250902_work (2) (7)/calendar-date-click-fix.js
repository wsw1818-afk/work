/**
 * 달력 날짜 클릭 문제 해결 스크립트
 * 날짜 클릭이 안 되는 문제를 완전히 수정
 */

(function() {
    'use strict';

    console.log('📅 달력 날짜 클릭 수정 시작...');

    // ===== 날짜 클릭 복원 함수 =====
    function restoreDateClicks() {
        console.log('🔄 날짜 클릭 영역 보정 중...');

        const dayCells = document.querySelectorAll('.day');
        let adjustedCount = 0;

        dayCells.forEach(dayCell => {
            // 모든 날짜 셀은 기본적으로 클릭 가능해야 함
            dayCell.style.pointerEvents = 'auto';
            dayCell.style.cursor = 'pointer';

            if (dayCell.classList.contains('other-month')) {
                return;
            }

            const dayNumber = dayCell.querySelector('.day-number');
            if (!dayNumber) {
                return;
            }

            // 기본 구현에서 이미 핸들러를 심어둔다면 그대로 둠
            if (dayCell._hasDateClickListener || dayCell.onclick) {
                adjustedCount++;
                return;
            }

            const date = parseInt(dayNumber.textContent, 10);
            dayCell.addEventListener('click', function(e) {
                console.log(`📅(보조) 날짜 클릭: ${date}`);

                // 기본 동작 보장
                e.stopPropagation();
                e.preventDefault();

                const currentYear = window.currentYear || new Date().getFullYear();
                const currentMonth = window.currentMonth || (new Date().getMonth() + 1);

                if (typeof window.openDateMemoModal === 'function') {
                    window.openDateMemoModal(currentYear, currentMonth, date);
                }
            }, false);

            dayCell._hasDateClickListener = true;
            adjustedCount++;
        });

        console.log(`✅ ${adjustedCount}개 날짜 셀 클릭 영역 보정 완료`);
    }

    // ===== 클릭 차단 요소들 제거 =====
    function removeClickBlockers() {
        console.log('🚫 클릭 차단 요소들 제거 중...');

        // 모든 overlay나 backdrop 요소들 제거
        const blockers = document.querySelectorAll(
            '.overlay, .backdrop, .click-blocker, [style*="pointer-events: none"]'
        );

        blockers.forEach(blocker => {
            // 달력 영역을 덮고 있는 요소만 제거
            const rect = blocker.getBoundingClientRect();
            const calendar = document.querySelector('.calendar-container');

            if (calendar) {
                const calendarRect = calendar.getBoundingClientRect();

                // 달력과 겹치는 영역이 있으면 제거
                if (rect.left < calendarRect.right &&
                    rect.right > calendarRect.left &&
                    rect.top < calendarRect.bottom &&
                    rect.bottom > calendarRect.top) {

                    blocker.style.pointerEvents = 'none';
                    console.log('🗑️ 클릭 차단 요소 비활성화:', blocker);
                }
            }
        });

        // 날짜 셀들의 자식 요소들도 클릭 허용
        const dayNumbers = document.querySelectorAll('.day-number, .holiday-label, .memo-indicator');
        dayNumbers.forEach(element => {
            element.style.pointerEvents = 'none'; // 부모로 이벤트 전달
        });

        console.log('✅ 클릭 차단 요소 제거 완료');
    }

    // ===== 모달 충돌 방지 =====
    function preventModalConflicts() {
        console.log('🔒 모달 충돌 방지 설정 중...');

        // 기존 openDateMemoModal 함수 보완
        const originalOpenDateMemoModal = window.openDateMemoModal;

        if (originalOpenDateMemoModal) {
            window.openDateMemoModal = function(year, month, date) {
                console.log(`📝 날짜 메모 모달 열기: ${year}-${month}-${date}`);

                // 다른 모달들 먼저 닫기
                const otherModals = document.querySelectorAll('.modal[style*="display: block"]');
                otherModals.forEach(modal => {
                    if (modal.id !== 'dateMemoModal') {
                        modal.style.display = 'none';
                        console.log(`🔒 다른 모달 닫음: ${modal.id}`);
                    }
                });

                // 원래 함수 호출
                try {
                    return originalOpenDateMemoModal.call(this, year, month, date);
                } catch (error) {
                    console.error('❌ 날짜 메모 모달 열기 실패:', error);

                    // 실패 시 간단한 대안 실행
                    const dateMemoModal = document.getElementById('dateMemoModal');
                    if (dateMemoModal) {
                        dateMemoModal.style.display = 'block';
                        console.log('✅ 대안 방식으로 모달 열림');
                    }
                }
            };
        }

        console.log('✅ 모달 충돌 방지 설정 완료');
    }

    // ===== 강제 클릭 핸들러 =====
    function addForceClickHandler() {
        console.log('💪 강제 클릭 핸들러 추가 중...');

        // 달력 컨테이너에 전역 클릭 핸들러 추가
        const calendarContainer = document.querySelector('.calendar-container');

        if (calendarContainer) {
            calendarContainer.addEventListener('click', function(e) {
                const dayCell = e.target.closest('.day');
                if (!dayCell || dayCell.classList.contains('other-month')) {
                    return;
                }

                // 기본 핸들러가 없는 예외 상황에서만 보조 실행
                if (dayCell._hasDateClickListener || dayCell.onclick) {
                    return;
                }

                const dayNumber = dayCell.querySelector('.day-number');
                if (!dayNumber) {
                    return;
                }

                const date = parseInt(dayNumber.textContent, 10);
                const currentYear = window.currentYear || new Date().getFullYear();
                const currentMonth = window.currentMonth || (new Date().getMonth() + 1);

                console.log(`🎯(보조) 강제 클릭 처리: ${date}일`);

                if (typeof window.openDateMemoModal === 'function') {
                    window.openDateMemoModal(currentYear, currentMonth, date);
                }
            }, false);

            console.log('✅ 강제 클릭 핸들러 보조 모드 활성화');
        }
    }

    // ===== 디버깅 함수 =====
    window.debugDateClicks = function() {
        console.group('🔍 날짜 클릭 디버깅');

        const dayCells = document.querySelectorAll('.day:not(.other-month)');
        console.log(`현재 월 날짜 셀: ${dayCells.length}개`);

        dayCells.forEach((cell, index) => {
            const dayNumber = cell.querySelector('.day-number');
            const date = dayNumber ? dayNumber.textContent : 'N/A';
            const hasListener = cell.onclick || cell._hasDateClickListener;
            const style = window.getComputedStyle(cell);

            console.log(`날짜 ${date}:`, {
                hasListener: !!hasListener,
                pointerEvents: style.pointerEvents,
                cursor: style.cursor,
                zIndex: style.zIndex
            });
        });

        console.groupEnd();
    };

    // ===== 초기화 함수 =====
    function initialize() {
        console.log('🚀 달력 날짜 클릭 수정 초기화...');

        // 1. 클릭 차단 요소 제거
        removeClickBlockers();

        // 2. 모달 충돌 방지
        preventModalConflicts();

        // 3. 날짜 클릭 복원
        restoreDateClicks();

        // 4. 강제 클릭 핸들러 추가
        addForceClickHandler();

        console.log('✅ 달력 날짜 클릭 수정 완료!');
        console.log('💡 디버깅: debugDateClicks() 함수로 상태 확인 가능');
    }

    // ===== 실행 =====

    // DOM이 준비되면 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        // 이미 로드된 경우 즉시 실행
        setTimeout(initialize, 100);
    }

    // 달력이 새로 그려질 때마다 재적용
    const originalRenderCalendar = window.renderCalendar;
    if (originalRenderCalendar) {
        window.renderCalendar = function() {
            const result = originalRenderCalendar.apply(this, arguments);

            // 달력 렌더링 후 날짜 클릭 다시 복원
            setTimeout(() => {
                restoreDateClicks();
                removeClickBlockers();
            }, 50);

            return result;
        };
    }

})();
