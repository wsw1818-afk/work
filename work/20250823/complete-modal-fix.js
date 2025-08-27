/**
 * 완전한 모달 및 메뉴 수정 스크립트
 * - 누락된 모달 동적 생성
 * - 이벤트 중복 방지
 * - 스티커 메모 복원
 */

(function() {
    'use strict';
    
    console.log('🔥 완전한 모달 수정 시작');
    
    // 전역 이벤트 중복 방지 플래그
    window.modalFixApplied = window.modalFixApplied || false;
    
    if (window.modalFixApplied) {
        console.log('⚠️ 모달 수정이 이미 적용되었습니다. 중복 실행을 방지합니다.');
        return;
    }
    
    // 누락된 모달들 생성
    function createMissingModals() {
        console.log('🏗️ 누락된 모달들 생성 시작');
        
        // 1. unifiedCloudModal 생성
        if (!document.getElementById('unifiedCloudModal')) {
            const unifiedCloudModal = document.createElement('div');
            unifiedCloudModal.className = 'modal';
            unifiedCloudModal.id = 'unifiedCloudModal';
            unifiedCloudModal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 class="modal-title">☁️ 클라우드 설정</h2>
                        <button class="modal-close" onclick="closeModal('unifiedCloudModal')">✕</button>
                    </div>
                    <div class="modal-body">
                        <p>클라우드 설정 기능입니다.</p>
                    </div>
                </div>
            `;
            document.body.appendChild(unifiedCloudModal);
            console.log('✅ unifiedCloudModal 생성됨');
        }
        
        // 2. syncStatusModal 생성
        if (!document.getElementById('syncStatusModal')) {
            const syncStatusModal = document.createElement('div');
            syncStatusModal.className = 'modal';
            syncStatusModal.id = 'syncStatusModal';
            syncStatusModal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 class="modal-title">🔍 동기화 상태</h2>
                        <button class="modal-close" onclick="closeModal('syncStatusModal')">✕</button>
                    </div>
                    <div class="modal-body">
                        <p>동기화 상태를 확인할 수 있습니다.</p>
                    </div>
                </div>
            `;
            document.body.appendChild(syncStatusModal);
            console.log('✅ syncStatusModal 생성됨');
        }
        
        // 3. stickyMemo 생성 (없는 경우)
        if (!document.getElementById('stickyMemo')) {
            const stickyMemo = document.createElement('div');
            stickyMemo.className = 'sticky-memo';
            stickyMemo.id = 'stickyMemo';
            stickyMemo.innerHTML = `
                <div class="sticky-memo-header">
                    <div class="sticky-memo-title">
                        <span>🗒️</span>
                        <span>스티커 메모</span>
                    </div>
                    <div class="sticky-memo-controls">
                        <button class="sticky-control-btn sticky-close" onclick="closeStickyMemo()">✕</button>
                    </div>
                </div>
                <div class="sticky-memo-content">
                    <div class="sticky-memo-form">
                        <textarea class="sticky-memo-textarea" placeholder="메모를 입력하세요..."></textarea>
                        <button class="sticky-memo-save-btn">💾 저장</button>
                    </div>
                </div>
            `;
            document.body.appendChild(stickyMemo);
            console.log('✅ stickyMemo 생성됨');
        }
        
        console.log('🏗️ 누락된 모달들 생성 완료');
    }
    
    // 단순한 모달 함수들 재정의
    window.openModal = function(modalId) {
        console.log('🔓 모달 열기:', modalId);
        const modal = document.getElementById(modalId);
        if (modal) {
            // 다른 모달들 모두 닫기
            const allModals = document.querySelectorAll('.modal');
            allModals.forEach(m => {
                if (m.id !== modalId) {
                    m.style.display = 'none';
                }
            });
            
            modal.style.display = 'block';
            modal.style.zIndex = '10000';
            console.log('✅ 모달 열림:', modalId);
        } else {
            console.error('❌ 모달을 찾을 수 없음:', modalId);
        }
    };
    
    window.closeModal = function(modalId) {
        console.log('🔒 모달 닫기:', modalId);
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            console.log('✅ 모달 닫힘:', modalId);
        }
    };
    
    window.openStickyMemo = function() {
        console.log('🗒️ 스티커 메모 열기');
        const stickyMemo = document.getElementById('stickyMemo');
        if (stickyMemo) {
            stickyMemo.style.display = 'block';
            stickyMemo.style.position = 'fixed';
            stickyMemo.style.top = '50px';
            stickyMemo.style.right = '50px';
            stickyMemo.style.zIndex = '2000';
            stickyMemo.style.width = '400px';
            stickyMemo.style.height = '500px';
            console.log('✅ 스티커 메모 열림');
        } else {
            console.error('❌ 스티커 메모를 찾을 수 없음');
        }
    };
    
    window.closeStickyMemo = function() {
        console.log('🗒️ 스티커 메모 닫기');
        const stickyMemo = document.getElementById('stickyMemo');
        if (stickyMemo) {
            stickyMemo.style.display = 'none';
            console.log('✅ 스티커 메모 닫힘');
        }
    };
    
    // 이벤트 리스너 중복 방지 등록
    function registerEventsOnce() {
        console.log('🎯 이벤트 리스너 등록 (중복 방지)');
        
        // 기존 이벤트 리스너 완전 제거
        const buttons = [
            { id: 'noticeBtn', modal: 'noticeModal' },
            { id: 'createBtn', modal: 'createModal' },
            { id: 'memoBtn', action: 'sticky' },
            { id: 'excelBtn', modal: 'excelModal' },
            { id: 'unifiedCloudBtn', modal: 'unifiedCloudModal' },
            { id: 'syncStatusBtn', modal: 'syncStatusModal' },
            { id: 'settingsBtn', modal: 'settingsModal' }
        ];
        
        buttons.forEach(({ id, modal, action }) => {
            const btn = document.getElementById(id);
            if (btn) {
                // 기존 모든 이벤트 제거
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);
                
                // 새 이벤트 등록
                newBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`🎯 버튼 클릭: ${id}`);
                    
                    if (action === 'sticky') {
                        openStickyMemo();
                    } else {
                        openModal(modal);
                    }
                });
                
                console.log(`✅ ${id} 이벤트 등록됨`);
            }
        });
        
        // 모든 모달 닫기 버튼 재등록
        const closeButtons = document.querySelectorAll('.modal-close');
        closeButtons.forEach(btn => {
            const newCloseBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newCloseBtn, btn);
            
            newCloseBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const modal = this.closest('.modal');
                if (modal) {
                    modal.style.display = 'none';
                    console.log('✅ 모달 닫힘 (닫기 버튼)');
                }
            });
        });
        
        // 모달 배경 클릭으로 닫기
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    this.style.display = 'none';
                    console.log('✅ 모달 닫힘 (배경 클릭)');
                }
            });
        });
        
        console.log('🎯 이벤트 리스너 등록 완료');
    }
    
    // 초기화 함수
    function init() {
        console.log('🚀 완전한 모달 수정 초기화');
        
        // 1. 누락된 모달들 생성
        createMissingModals();
        
        // 2. 이벤트 리스너 등록 (중복 방지)
        registerEventsOnce();
        
        // 3. 중복 실행 방지 플래그 설정
        window.modalFixApplied = true;
        
        console.log('✅ 완전한 모달 수정 초기화 완료');
    }
    
    // DOM 준비 후 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 200);
    }
    
})();