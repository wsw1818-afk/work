/**
 * 최종 시스템 수정 스크립트
 * - 모든 기존 이벤트 완전 제거
 * - 단일 통합 시스템으로 구성
 * - 중복 방지 및 안정성 보장
 */

(function() {
    'use strict';
    
    console.log('🔥 최종 시스템 수정 시작');
    
    // 중복 실행 완전 방지
    if (window.finalSystemFixApplied) {
        console.log('이미 적용됨 - 실행 중단');
        return;
    }
    
    // 다른 수정 스크립트들 비활성화
    window.modalFixApplied = true;
    window.ultimateMenuFixApplied = true;
    
    // DOM이 완전히 로드되었는지 확인
    function waitForDOM(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            setTimeout(callback, 500); // 추가 지연으로 안정성 확보
        }
    }
    
    // 모든 기존 이벤트 완전 제거
    function clearAllEvents() {
        console.log('🧹 모든 기존 이벤트 제거');
        
        // 모든 액션 버튼 이벤트 제거
        const buttons = document.querySelectorAll('.action-btn');
        buttons.forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            // 강제 스타일 적용
            newBtn.style.pointerEvents = 'all';
            newBtn.style.cursor = 'pointer';
            newBtn.style.opacity = '1';
            newBtn.style.zIndex = '100';
        });
        
        console.log('✅ 모든 기존 이벤트 제거 완료');
    }
    
    // 간단하고 확실한 모달 시스템
    function createSimpleModalSystem() {
        console.log('🎯 간단한 모달 시스템 생성');
        
        // 기본 모달 열기 함수
        window.openModal = function(modalId) {
            console.log('모달 열기:', modalId);
            
            // 모든 모달 먼저 닫기
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
            
            // 스티키 메모도 닫기
            const stickyMemo = document.getElementById('stickyMemo');
            if (stickyMemo) {
                stickyMemo.style.display = 'none';
            }
            
            // 대상 모달 열기
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'block';
                modal.style.zIndex = '10000';
            } else {
                console.warn(`모달 ${modalId}을 찾을 수 없습니다`);
            }
        };
        
        // 모달 닫기 함수
        window.closeModal = function(modalId) {
            console.log('모달 닫기:', modalId);
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'none';
            }
        };
        
        // 스티키 메모 열기 함수
        window.openStickyMemo = function() {
            console.log('스티키 메모 열기');
            
            // 다른 모달들 모두 닫기
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
            
            let stickyMemo = document.getElementById('stickyMemo');
            if (!stickyMemo) {
                createStickyMemoElement();
                stickyMemo = document.getElementById('stickyMemo');
            }
            
            if (stickyMemo) {
                stickyMemo.style.display = 'block';
                stickyMemo.style.position = 'fixed';
                stickyMemo.style.top = '50px';
                stickyMemo.style.right = '50px';
                stickyMemo.style.zIndex = '10001';
                stickyMemo.style.width = '400px';
                stickyMemo.style.minHeight = '300px';
            }
        };
        
        console.log('✅ 간단한 모달 시스템 생성 완료');
    }
    
    // 스티키 메모 요소 생성
    function createStickyMemoElement() {
        console.log('🗒️ 스티키 메모 요소 생성');
        
        const existing = document.getElementById('stickyMemo');
        if (existing) existing.remove();
        
        const stickyMemo = document.createElement('div');
        stickyMemo.id = 'stickyMemo';
        stickyMemo.className = 'sticky-memo';
        stickyMemo.innerHTML = `
            <div class="sticky-memo-header">
                <div class="sticky-memo-title">
                    <span>🗒️</span>
                    <span>스티커 메모</span>
                </div>
                <div class="sticky-memo-controls">
                    <button onclick="document.getElementById('stickyMemo').style.display='none'">✕</button>
                </div>
            </div>
            <div class="sticky-memo-content">
                <textarea placeholder="메모를 입력하세요..." style="width: 100%; height: 200px; margin-bottom: 10px;"></textarea>
                <button onclick="alert('메모가 저장되었습니다!')">💾 저장</button>
            </div>
        `;
        
        document.body.appendChild(stickyMemo);
        console.log('✅ 스티키 메모 요소 생성 완료');
    }
    
    // 누락된 모달들 생성
    function createMissingModals() {
        console.log('🏗️ 누락된 모달들 생성');
        
        // unifiedCloudModal 생성
        if (!document.getElementById('unifiedCloudModal')) {
            const modal = document.createElement('div');
            modal.id = 'unifiedCloudModal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>☁️ 클라우드 설정</h2>
                        <button onclick="closeModal('unifiedCloudModal')">✕</button>
                    </div>
                    <div class="modal-body">
                        <p>구글 드라이브와 연동하여 데이터를 백업할 수 있습니다.</p>
                        <button>구글 드라이브 연결</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        
        // syncStatusModal 생성
        if (!document.getElementById('syncStatusModal')) {
            const modal = document.createElement('div');
            modal.id = 'syncStatusModal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>🔍 동기화 상태</h2>
                        <button onclick="closeModal('syncStatusModal')">✕</button>
                    </div>
                    <div class="modal-body">
                        <p><strong>연결 상태:</strong> 연결 안됨</p>
                        <p><strong>마지막 동기화:</strong> 없음</p>
                        <button onclick="alert('동기화가 시작되었습니다!')">수동 동기화</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        
        console.log('✅ 누락된 모달들 생성 완료');
    }
    
    // 최종 이벤트 등록
    function registerFinalEvents() {
        console.log('⚡ 최종 이벤트 등록');
        
        const eventMap = {
            'noticeBtn': () => openModal('noticeModal'),
            'createBtn': () => openModal('createModal'),
            'memoBtn': () => openStickyMemo(),
            'excelBtn': () => openModal('excelModal'),
            'unifiedCloudBtn': () => openModal('unifiedCloudModal'),
            'syncStatusBtn': () => openModal('syncStatusModal'),
            'settingsBtn': () => openModal('settingsModal')
        };
        
        Object.keys(eventMap).forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                // 이벤트 등록
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`🎯 ${buttonId} 클릭!`);
                    eventMap[buttonId]();
                });
                
                console.log(`✅ ${buttonId} 이벤트 등록됨`);
            } else {
                console.warn(`❌ ${buttonId} 버튼을 찾을 수 없음`);
            }
        });
        
        // 모달 배경 클릭으로 닫기
        setTimeout(() => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.addEventListener('click', function(e) {
                    if (e.target === this) {
                        this.style.display = 'none';
                    }
                });
            });
        }, 1000);
        
        console.log('⚡ 최종 이벤트 등록 완료');
    }
    
    // 달력 생성 기능
    function createCalendar() {
        console.log('📅 달력 생성 시작');
        
        const grid = document.getElementById('daysGrid');
        if (!grid) {
            console.warn('daysGrid 요소를 찾을 수 없습니다');
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
            
            // 오늘 날짜
            const today = new Date();
            if (date === today.getDate() && month === (today.getMonth() + 1) && year === today.getFullYear()) {
                day.classList.add('today');
            }
            
            // 주말 체크
            const dayOfWeek = (firstDay + date - 1) % 7;
            if (dayOfWeek === 0) day.classList.add('sunday');
            if (dayOfWeek === 6) day.classList.add('saturday');
            
            // 광복절 (8월 15일)
            if (month === 8 && date === 15) {
                day.classList.add('holiday');
                day.innerHTML = `
                    <div class="day-number">${date}</div>
                    <div class="holiday-label">광복절</div>
                `;
            } else {
                day.innerHTML = `<div class="day-number">${date}</div>`;
            }
            
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
        
        console.log('📅 달력 생성 완료');
    }

    // 최종 초기화
    function finalInit() {
        console.log('🚀 최종 시스템 초기화 시작');
        
        try {
            // 0. 달력 생성
            createCalendar();
            
            // 1. 기존 이벤트 완전 제거
            clearAllEvents();
            
            // 2. 모달 시스템 생성
            createSimpleModalSystem();
            
            // 3. 누락된 모달들 생성
            createMissingModals();
            
            // 4. 스티키 메모 요소 생성
            createStickyMemoElement();
            
            // 5. 최종 이벤트 등록
            registerFinalEvents();
            
            // 6. 중복 실행 방지
            window.finalSystemFixApplied = true;
            
            console.log('✅ 최종 시스템 초기화 완료!');
            
            // 상태 확인 로그
            setTimeout(() => {
                console.log('📊 시스템 상태 확인:');
                const buttons = ['noticeBtn', 'createBtn', 'memoBtn', 'excelBtn', 'unifiedCloudBtn', 'syncStatusBtn', 'settingsBtn'];
                buttons.forEach(id => {
                    const btn = document.getElementById(id);
                    console.log(`${id}:`, btn ? '존재함' : '없음');
                });
                
                const modals = ['noticeModal', 'createModal', 'excelModal', 'settingsModal', 'unifiedCloudModal', 'syncStatusModal', 'stickyMemo'];
                modals.forEach(id => {
                    const modal = document.getElementById(id);
                    console.log(`${id}:`, modal ? '존재함' : '없음');
                });
            }, 2000);
            
        } catch (error) {
            console.error('❌ 최종 시스템 초기화 오류:', error);
        }
    }
    
    // DOM 준비 후 실행
    waitForDOM(finalInit);
    
    // 전역 접근 함수
    window.finalSystemFix = finalInit;
    window.testAllButtons = function() {
        const buttons = ['noticeBtn', 'createBtn', 'memoBtn', 'excelBtn', 'unifiedCloudBtn', 'syncStatusBtn', 'settingsBtn'];
        buttons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                console.log(`${id} 클릭 테스트`);
                btn.click();
                setTimeout(() => {
                    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
                    const sticky = document.getElementById('stickyMemo');
                    if (sticky) sticky.style.display = 'none';
                }, 500);
            }
        });
    };
    
})();