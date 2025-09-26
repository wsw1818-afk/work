// 시작 시 스마트 자동 실행 제어 시스템
(function() {
    'use strict';

    // 메뉴 자동 실행만 방지, 달력은 허용
    window.preventMenuAutoExecution = true;

    // 달력 기본 기능은 항상 허용할 함수들
    const allowedFunctions = [
        'updateCalendar', 'generateCalendar', 'displayCalendar',
        'showCurrentMonth', 'createCalendarHTML', 'initCalendar',
        'calendar', 'loadCalendar', 'renderCalendar'
    ];

    // 차단할 메뉴/모달 관련 함수들
    const blockedFunctions = [
        'showModal', 'openModal', 'displayModal', 'showMenu',
        'openMenu', 'displayMenu', 'popup', 'alert', 'confirm'
    ];

    // 사용자가 원할 때만 메뉴 활성화
    window.enableMenus = function() {
        window.preventMenuAutoExecution = false;
        console.log('🎯 메뉴 시스템이 수동으로 활성화되었습니다.');

        // 지연된 메뉴 초기화 실행
        if (window.delayedMenuInit && typeof window.delayedMenuInit === 'function') {
            window.delayedMenuInit();
        }
    };

    // DOMContentLoaded 이벤트 스마트 필터링
    const originalAddEventListener = Document.prototype.addEventListener;

    Document.prototype.addEventListener = function(type, listener, options) {
        if (type === 'DOMContentLoaded' && window.preventMenuAutoExecution) {
            // 리스너 함수의 문자열을 검사하여 달력 관련인지 확인
            const listenerStr = listener.toString();

            // 달력 관련 함수는 허용
            const isCalendarRelated = allowedFunctions.some(func =>
                listenerStr.includes(func) || listenerStr.includes('calendar') ||
                listenerStr.includes('Calendar') || listenerStr.includes('month') ||
                listenerStr.includes('date') || listenerStr.includes('day')
            );

            // 메뉴/모달 관련 함수는 차단
            const isMenuRelated = blockedFunctions.some(func =>
                listenerStr.includes(func) || listenerStr.includes('modal') ||
                listenerStr.includes('Modal') || listenerStr.includes('menu') ||
                listenerStr.includes('Menu')
            );

            if (isCalendarRelated && !isMenuRelated) {
                // 달력 관련 기능은 허용
                console.log('✅ 달력 기능 자동 실행 허용');
                return originalAddEventListener.call(this, type, listener, options);
            } else if (isMenuRelated) {
                // 메뉴 관련 기능은 차단하고 지연 실행을 위해 저장
                console.log('🛡️ 메뉴/모달 자동 실행 방지됨');
                window.delayedMenuInit = function() {
                    listener();
                };
                return;
            } else {
                // 기타 기능은 허용 (기본 동작)
                return originalAddEventListener.call(this, type, listener, options);
            }
        }

        return originalAddEventListener.call(this, type, listener, options);
    };

    // 페이지 로드 시 안내 메시지
    window.addEventListener('load', function() {
        if (window.preventMenuAutoExecution) {
            console.log('📅 달력이 표시됩니다. 메뉴는 enableMenus() 실행으로 활성화 가능합니다.');
        }
    });

})();