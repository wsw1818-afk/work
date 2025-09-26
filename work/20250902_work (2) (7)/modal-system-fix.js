// 모달 시스템 완전 수정 - Modal System Complete Fix
(function() {
    'use strict';
    
    // 모달 관리 객체
    const modalManager = {
        openModals: new Set(),
        
        // 모달 열기
        open: function(modalId) {
            console.log(`🔓 모달 열기 시도: ${modalId}`);
            
            // 먼저 모든 다른 모달 닫기
            this.closeAll();
            
            const modal = document.getElementById(modalId);
            if (modal) {
                // 모달 표시
                modal.classList.add('show');
                modal.style.display = 'flex';
                modal.style.opacity = '1';
                modal.style.visibility = 'visible';
                modal.style.zIndex = '10000';
                
                // aria 속성 설정
                modal.setAttribute('aria-hidden', 'false');
                modal.setAttribute('aria-modal', 'true');
                
                // body 스크롤 잠금
                document.body.classList.add('modal-open');
                document.body.style.overflow = 'hidden';
                
                // 열린 모달 추가
                this.openModals.add(modalId);
                
                console.log(`✅ 모달 열림: ${modalId}`);
                
                // 모달별 초기화 함수 실행
                this.initializeModal(modalId);
                
                return true;
            } else {
                console.error(`❌ 모달을 찾을 수 없음: ${modalId}`);
                return false;
            }
        },
        
        // 모달 닫기
        close: function(modalId) {
            console.log(`🔒 모달 닫기 시도: ${modalId}`);
            
            const modal = document.getElementById(modalId);
            if (modal) {
                // 모달 숨김
                modal.classList.remove('show');
                modal.style.display = 'none';
                modal.style.opacity = '0';
                modal.style.visibility = 'hidden';
                modal.style.zIndex = '-1';
                
                // aria 속성 설정
                modal.setAttribute('aria-hidden', 'true');
                modal.setAttribute('aria-modal', 'false');
                
                // 열린 모달에서 제거
                this.openModals.delete(modalId);
                
                console.log(`✅ 모달 닫힘: ${modalId}`);
                
                // 다른 모달이 열려있지 않으면 body 스크롤 잠금 해제
                if (this.openModals.size === 0) {
                    document.body.classList.remove('modal-open');
                    document.body.style.overflow = '';
                    document.body.style.paddingRight = '';
                }
                
                return true;
            } else {
                console.error(`❌ 모달을 찾을 수 없음: ${modalId}`);
                return false;
            }
        },
        
        // 모든 모달 닫기
        closeAll: function() {
            console.log('🔒 모든 모달 닫기');
            
            const modalsToClose = Array.from(this.openModals);
            modalsToClose.forEach(modalId => {
                this.close(modalId);
            });
            
            // 추가 안전장치: DOM에서 모든 모달 숨김
            const allModals = document.querySelectorAll('.modal, .unified-modal, .backup-modal, .sync-modal');
            allModals.forEach(modal => {
                modal.classList.remove('show');
                modal.style.display = 'none';
                modal.style.opacity = '0';
                modal.style.visibility = 'hidden';
                modal.setAttribute('aria-hidden', 'true');
                modal.setAttribute('aria-modal', 'false');
            });
            
            // body 정리
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
            
            this.openModals.clear();
        },
        
        // 모달별 초기화
        initializeModal: function(modalId) {
            switch(modalId) {
                case 'settingsModal':
                    if (typeof loadCurrentSettingsToModal === 'function') {
                        loadCurrentSettingsToModal();
                    }
                    break;
                    
                case 'storageModal':
                    if (typeof getStorageSize === 'function') {
                        const currentSize = getStorageSize();
                        const totalCapacity = typeof testStorageCapacity === 'function' ? testStorageCapacity() : 10;
                        console.log(`저장소 상태: ${currentSize}MB / ${totalCapacity}MB`);
                    }
                    break;
                    
                case 'excelModal':
                    // 엑셀 모달 초기화
                    const today = new Date();
                    const startDateInput = document.getElementById('startDate');
                    const endDateInput = document.getElementById('endDate');
                    
                    if (startDateInput && endDateInput) {
                        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                        
                        startDateInput.value = firstDay.toISOString().split('T')[0];
                        endDateInput.value = lastDay.toISOString().split('T')[0];
                    }
                    break;
            }
        }
    };
    
    // X 버튼 클릭 이벤트 통합 처리
    function setupCloseButtons() {
        // 모든 X 버튼에 대해
        const closeButtons = document.querySelectorAll('.modal-close, .close, button[aria-label="Close"]');
        
        closeButtons.forEach(button => {
            // 기존 이벤트 제거
            const newButton = button.cloneNode(true);
            if (button.parentNode) {
                button.parentNode.replaceChild(newButton, button);
            }
            
            newButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('🔴 X 버튼 클릭됨');
                
                // 부모 모달 찾기
                let modal = this.closest('.modal, .unified-modal, .backup-modal');
                if (modal && modal.id) {
                    modalManager.close(modal.id);
                } else {
                    // fallback: 모든 모달 닫기
                    modalManager.closeAll();
                }
            });
        });
        
        console.log(`✅ ${closeButtons.length}개의 X 버튼 이벤트 설정 완료`);
    }
    
    // 백드롭 클릭으로 모달 닫기
    function setupBackdropClose() {
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal')) {
                const modalId = e.target.id;
                if (modalId) {
                    modalManager.close(modalId);
                }
            }
        });
    }
    
    // ESC 키로 모달 닫기
    function setupKeyboardClose() {
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modalManager.openModals.size > 0) {
                modalManager.closeAll();
            }
        });
    }
    
    // 전역 함수들 재정의
    window.openModal = function(modalId) {
        return modalManager.open(modalId);
    };
    
    window.closeModal = function(modalId) {
        return modalManager.close(modalId);
    };
    
    window.cancelSettings = function() {
        console.log('🔧 설정 취소');
        
        try {
            // 원본 설정으로 되돌리기 (기존 함수 재사용)
            if (typeof originalSettings !== 'undefined') {
                document.documentElement.setAttribute('data-theme', originalSettings.theme);
                if (typeof applyFontSize === 'function') {
                    applyFontSize(parseFloat(originalSettings.fontSize));
                }
                if (typeof applyCalendarSize === 'function') {
                    applyCalendarSize(originalSettings.widthScale, originalSettings.heightScale);
                }
            }
        } catch (error) {
            console.error('설정 되돌리기 중 오류:', error);
        }
        
        modalManager.close('settingsModal');
    };
    
    // 메뉴 버튼들 업데이트 (기존 menu-button-fix.js와 연동)
    function updateMenuButtons() {
        const buttons = {
            'createBtn': () => modalManager.open('createModal'),
            'excelBtn': () => modalManager.open('excelModal'),
            'settingsBtn': () => modalManager.open('settingsModal'),
            'storageBtn': () => modalManager.open('storageModal')
        };
        
        Object.entries(buttons).forEach(([buttonId, handler]) => {
            const button = document.getElementById(buttonId);
            if (button) {
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);
                
                newButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    console.log(`🎯 ${buttonId} 클릭됨`);
                    handler();
                });
            }
        });
    }
    
    // 초기화 함수
    function initModalSystem() {
        console.log('🔧 모달 시스템 초기화 시작');
        
        // 모든 모달 닫기
        modalManager.closeAll();
        
        // 이벤트 설정
        setupCloseButtons();
        setupBackdropClose();
        setupKeyboardClose();
        updateMenuButtons();
        
        console.log('✅ 모달 시스템 초기화 완료');
    }
    
    // DOM 로드 시 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initModalSystem);
    } else {
        initModalSystem();
    }
    
    // 페이지 로드 완료 후 재초기화
    window.addEventListener('load', function() {
        setTimeout(initModalSystem, 300);
    });
    
    // 전역 접근을 위한 객체 노출
    window.modalManager = modalManager;
    
    console.log('🎉 모달 시스템 스크립트 로드 완료');
    
})();