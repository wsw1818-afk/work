/**
 * 메뉴 및 모달 클릭 문제 긴급 수정 스크립트
 * - 모든 이벤트 리스너 강제 재등록
 * - CSS 충돌 해결
 * - 모달 표시 강제 수정
 */

(function() {
    'use strict';
    
    console.log('🚨 메뉴/모달 긴급 수정 시작');
    
    // 모달 열기 함수 재정의 (강제)
    window.openModal = function(modalId) {
        console.log('모달 열기:', modalId);
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            modal.style.zIndex = '10000';
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.background = 'rgba(0, 0, 0, 0.5)';
            console.log(`모달 ${modalId} 열림`);
        } else {
            console.error(`모달 ${modalId}을 찾을 수 없습니다`);
        }
    };
    
    // 모달 닫기 함수 재정의 (강제)
    window.closeModal = function(modalId) {
        console.log('모달 닫기:', modalId);
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            console.log(`모달 ${modalId} 닫힘`);
        }
    };
    
    // 스티키 메모 열기 함수 재정의 (강제)
    window.openStickyMemo = function() {
        console.log('스티키 메모 열기');
        const stickyMemo = document.getElementById('stickyMemo');
        if (stickyMemo) {
            stickyMemo.style.display = 'block';
            stickyMemo.style.position = 'fixed';
            stickyMemo.style.zIndex = '2000';
            stickyMemo.style.top = '50px';
            stickyMemo.style.right = '50px';
            stickyMemo.classList.add('active');
            console.log('스티키 메모 활성화됨');
        } else {
            console.error('스티키 메모를 찾을 수 없습니다');
        }
    };
    
    // 모든 버튼 이벤트 강제 재등록
    function forceRegisterAllEvents() {
        console.log('모든 버튼 이벤트 강제 재등록 시작');
        
        const buttons = [
            { id: 'noticeBtn', action: () => openModal('noticeModal') },
            { id: 'createBtn', action: () => openModal('createModal') },
            { id: 'memoBtn', action: () => openStickyMemo() },
            { id: 'excelBtn', action: () => openModal('excelModal') },
            { id: 'unifiedCloudBtn', action: () => openModal('unifiedCloudModal') },
            { id: 'syncStatusBtn', action: () => openModal('syncStatusModal') },
            { id: 'settingsBtn', action: () => openModal('settingsModal') }
        ];
        
        buttons.forEach(({ id, action }) => {
            const btn = document.getElementById(id);
            if (btn) {
                // 기존 이벤트 리스너 제거
                btn.removeEventListener('click', action);
                
                // 새 이벤트 리스너 등록
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`버튼 클릭: ${id}`);
                    action();
                });
                
                // CSS로 클릭 가능하도록 강제 설정
                btn.style.pointerEvents = 'all';
                btn.style.cursor = 'pointer';
                btn.style.zIndex = '100';
                
                console.log(`버튼 ${id} 이벤트 재등록 완료`);
            } else {
                console.warn(`버튼 ${id}을 찾을 수 없습니다`);
            }
        });
        
        // 모든 모달 닫기 버튼 재등록
        const closeButtons = document.querySelectorAll('.modal-close, [onclick*="closeModal"]');
        closeButtons.forEach(btn => {
            btn.style.pointerEvents = 'all';
            btn.style.cursor = 'pointer';
            btn.style.zIndex = '10001';
            
            // onclick 속성 제거하고 새 이벤트 리스너 등록
            const onclickValue = btn.getAttribute('onclick');
            if (onclickValue) {
                btn.removeAttribute('onclick');
                const modalId = onclickValue.match(/closeModal\('(\w+)'\)/);
                if (modalId) {
                    btn.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        closeModal(modalId[1]);
                    });
                }
            }
        });
        
        console.log('모든 버튼 이벤트 강제 재등록 완료');
    }
    
    // CSS 강제 적용 함수
    function forceApplyCSS() {
        console.log('CSS 강제 적용 시작');
        
        // 모든 액션 버튼 강제 활성화
        const actionButtons = document.querySelectorAll('.action-btn');
        actionButtons.forEach(btn => {
            btn.style.pointerEvents = 'all';
            btn.style.cursor = 'pointer';
            btn.style.opacity = '1';
            btn.style.visibility = 'visible';
            btn.style.zIndex = '100';
        });
        
        // 모든 모달 z-index 조정
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.zIndex = '10000';
        });
        
        console.log('CSS 강제 적용 완료');
    }
    
    // 초기화 함수
    function initEmergencyFix() {
        console.log('긴급 수정 초기화 시작');
        
        // CSS 강제 적용
        forceApplyCSS();
        
        // 이벤트 재등록
        forceRegisterAllEvents();
        
        console.log('긴급 수정 초기화 완료');
    }
    
    // DOM 준비 확인 후 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEmergencyFix);
    } else {
        // DOM이 이미 준비된 경우
        setTimeout(initEmergencyFix, 100);
    }
    
    // 추가적으로 3초 후에도 한번 더 실행 (다른 스크립트에 의한 덮어쓰기 방지)
    setTimeout(() => {
        console.log('3초 후 재실행');
        forceRegisterAllEvents();
    }, 3000);
    
    // 전역에 함수 노출 (수동 호출 가능)
    window.forceRegisterAllEvents = forceRegisterAllEvents;
    window.forceApplyCSS = forceApplyCSS;
    window.emergencyFixMenuModal = initEmergencyFix;
    
    console.log('🚨 메뉴/모달 긴급 수정 스크립트 로드 완료');
    
})();