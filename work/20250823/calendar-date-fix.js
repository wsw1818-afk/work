/**
 * 달력 날짜 표시 및 메뉴 클릭 문제 수정 스크립트
 * 2025년 8월 달력 완전 복원
 */

(function() {
    'use strict';
    
    console.log('📅 달력 수정 시작');
    
    // 달력 강제 재생성 함수
    function forceCreateCalendar() {
        console.log('달력 강제 재생성 시작');
        
        const grid = document.getElementById('daysGrid');
        if (!grid) {
            console.error('daysGrid를 찾을 수 없습니다');
            return;
        }
        
        const year = 2025;
        const month = 8; // 8월 고정
        
        const firstDay = new Date(year, month - 1, 1).getDay();
        const daysInMonth = new Date(year, month, 0).getDate();
        const prevMonthDays = new Date(year, month - 1, 0).getDate();
        
        grid.innerHTML = '';
        
        // 이전 달 날짜
        for (let i = firstDay - 1; i >= 0; i--) {
            const day = document.createElement('div');
            day.className = 'day other-month';
            day.innerHTML = `<div class="day-number">${prevMonthDays - i}</div>`;
            grid.appendChild(day);
        }
        
        // 현재 달 날짜
        for (let date = 1; date <= daysInMonth; date++) {
            const day = document.createElement('div');
            day.className = 'day';
            
            // 오늘 날짜 (현재 날짜 기준)
            const today = new Date();
            if (date === today.getDate() && month === (today.getMonth() + 1) && year === today.getFullYear()) {
                day.classList.add('today');
            }
            
            // 주말 체크
            const dayOfWeek = (firstDay + date - 1) % 7;
            if (dayOfWeek === 0) day.classList.add('sunday');
            if (dayOfWeek === 6) day.classList.add('saturday');
            
            // 메모 확인
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
            const memos = JSON.parse(localStorage.getItem('calendarMemos') || '[]');
            const dateMemos = memos.filter(memo => memo.date === dateStr);
            
            // 광복절 (8월 15일)
            if (month === 8 && date === 15) {
                day.classList.add('holiday');
                day.innerHTML = `
                    <div class="day-number">${date}</div>
                    <div class="holiday-label">광복절</div>
                    ${dateMemos.length > 0 ? `
                        <div class="memo-indicator"></div>
                        <div class="memo-count">${dateMemos.length}</div>
                    ` : ''}
                `;
            } else {
                day.innerHTML = `
                    <div class="day-number">${date}</div>
                    ${dateMemos.length > 0 ? `
                        <div class="memo-indicator"></div>
                        <div class="memo-count">${dateMemos.length}</div>
                    ` : ''}
                `;
            }
            
            // 날짜 클릭 이벤트
            day.addEventListener('click', function() {
                console.log(`날짜 클릭: ${dateStr}`);
                if (typeof openDateMemo === 'function') {
                    openDateMemo(dateStr);
                }
            });
            
            grid.appendChild(day);
        }
        
        // 다음 달 날짜 (달력 격자 완성)
        const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
        const currentCells = firstDay + daysInMonth;
        
        for (let date = 1; date <= totalCells - currentCells; date++) {
            const day = document.createElement('div');
            day.className = 'day other-month';
            day.innerHTML = `<div class="day-number">${date}</div>`;
            grid.appendChild(day);
        }
        
        console.log('달력 재생성 완료');
    }
    
    // 메뉴 버튼 강제 초기화 함수
    function forceInitButtons() {
        console.log('메뉴 버튼 강제 초기화 시작');
        
        // 공지 쓰기
        const noticeBtn = document.getElementById('noticeBtn');
        if (noticeBtn) {
            noticeBtn.removeEventListener('click', null);
            noticeBtn.addEventListener('click', function() {
                console.log('공지 버튼 클릭됨');
                if (typeof openModal === 'function') {
                    openModal('noticeModal');
                }
            });
            console.log('공지 버튼 이벤트 등록 완료');
        }
        
        // 생성 모드
        const createBtn = document.getElementById('createBtn');
        if (createBtn) {
            createBtn.removeEventListener('click', null);
            createBtn.addEventListener('click', function() {
                console.log('생성 버튼 클릭됨');
                if (typeof openModal === 'function') {
                    openModal('createModal');
                }
            });
            console.log('생성 버튼 이벤트 등록 완료');
        }
        
        // 메모장
        const memoBtn = document.getElementById('memoBtn');
        if (memoBtn) {
            memoBtn.removeEventListener('click', null);
            memoBtn.addEventListener('click', function() {
                console.log('메모장 버튼 클릭됨');
                if (typeof openStickyMemo === 'function') {
                    openStickyMemo();
                }
            });
            console.log('메모장 버튼 이벤트 등록 완료');
        }
        
        // 설정
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.removeEventListener('click', null);
            settingsBtn.addEventListener('click', function() {
                console.log('설정 버튼 클릭됨');
                if (typeof openModal === 'function') {
                    openModal('settingsModal');
                }
            });
            console.log('설정 버튼 이벤트 등록 완료');
        }
        
        // 엑셀
        const excelBtn = document.getElementById('excelBtn');
        if (excelBtn) {
            excelBtn.removeEventListener('click', null);
            excelBtn.addEventListener('click', function() {
                console.log('엑셀 버튼 클릭됨');
                if (typeof openModal === 'function') {
                    openModal('excelModal');
                }
            });
            console.log('엑셀 버튼 이벤트 등록 완료');
        }
        
        // 클라우드 설정
        const unifiedCloudBtn = document.getElementById('unifiedCloudBtn');
        if (unifiedCloudBtn) {
            unifiedCloudBtn.removeEventListener('click', null);
            unifiedCloudBtn.addEventListener('click', function() {
                console.log('클라우드 설정 버튼 클릭됨');
                if (typeof openModal === 'function') {
                    openModal('unifiedCloudModal');
                }
            });
            console.log('클라우드 설정 버튼 이벤트 등록 완료');
        }
        
        console.log('메뉴 버튼 강제 초기화 완료');
    }
    
    // DOM이 준비된 후 실행
    function initFix() {
        console.log('달력 수정 초기화 시작');
        
        // 달력 강제 재생성
        forceCreateCalendar();
        
        // 메뉴 버튼 강제 초기화
        forceInitButtons();
        
        console.log('달력 수정 초기화 완료');
    }
    
    // 즉시 실행 또는 DOM 준비 후 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFix);
    } else {
        // DOM이 이미 준비된 경우 즉시 실행
        setTimeout(initFix, 100);
    }
    
    // 전역에 함수 노출 (필요시 수동 호출 가능)
    window.forceCreateCalendar = forceCreateCalendar;
    window.forceInitButtons = forceInitButtons;
    
})();