// 메뉴 버튼 클릭 문제 해결
(function() {
    'use strict';
    
    // 메뉴 버튼들과 해당 함수 매핑
    const menuButtons = {
        'createBtn': function() {
            console.log('생성 버튼 클릭됨');
            if (typeof openModal === 'function') {
                openModal('createModal');
            } else {
                const modal = document.getElementById('createModal');
                if (modal) {
                    modal.classList.add('show');
                    modal.style.display = 'flex';
                }
            }
        },
        
        'memoBtn': function() {
            console.log('스티커 메모 버튼 클릭됨');
            if (typeof openStickyMemo === 'function') {
                openStickyMemo();
            } else {
                alert('스티커 메모 기능을 로드하는 중입니다. 잠시 후 다시 시도해주세요.');
            }
        },
        
        'excelBtn': function() {
            console.log('엑셀 버튼 클릭됨');
            const modal = document.getElementById('excelModal');
            if (modal) {
                modal.classList.add('show');
                modal.style.display = 'flex';
                modal.style.opacity = '1';
                modal.style.visibility = 'visible';
                modal.style.zIndex = '10000';
                document.body.classList.add('modal-open');
            } else {
                console.error('excelModal을 찾을 수 없습니다.');
                alert('엑셀 내보내기 기능을 준비 중입니다.');
            }
        },
        
        'unifiedCloudBtn': function() {
            console.log('클라우드 설정 버튼 클릭됨');
            if (typeof window.showUnifiedCloudModal === 'function') {
                window.showUnifiedCloudModal();
            } else {
                // 스크립트 재로드 시도
                const script = document.createElement('script');
                script.src = 'unified-cloud-modal.js';
                script.onload = function() {
                    console.log('클라우드 모달 스크립트 재로드 완료');
                    if (typeof window.showUnifiedCloudModal === 'function') {
                        window.showUnifiedCloudModal();
                    }
                };
                document.body.appendChild(script);
            }
        },
        
        'syncStatusBtn': function() {
            console.log('동기화 상태 버튼 클릭됨');
            if (typeof window.showSyncStatusWindow === 'function') {
                window.showSyncStatusWindow();
            } else {
                alert('동기화 상태를 확인하는 중입니다. 잠시 후 다시 시도해주세요.');
            }
        },
        
        'settingsBtn': function() {
            console.log('설정 버튼 클릭됨');
            const modal = document.getElementById('settingsModal');
            if (modal) {
                modal.classList.add('show');
                modal.style.display = 'flex';
                modal.style.opacity = '1';
                modal.style.visibility = 'visible';
                modal.style.zIndex = '10000';
                document.body.classList.add('modal-open');
            } else {
                console.error('settingsModal을 찾을 수 없습니다.');
                alert('설정 기능을 준비 중입니다.');
            }
        },
        
        'storageBtn': function() {
            console.log('저장소 버튼 클릭됨');
            const modal = document.getElementById('storageModal');
            if (modal) {
                modal.classList.add('show');
                modal.style.display = 'flex';
                modal.style.opacity = '1';
                modal.style.visibility = 'visible';
                modal.style.zIndex = '10000';
                document.body.classList.add('modal-open');
                
                // 저장소 정보 업데이트
                if (typeof getStorageSize === 'function') {
                    const currentSize = getStorageSize();
                    const totalCapacity = testStorageCapacity();
                    const availableSpace = totalCapacity - currentSize;
                    console.log(`저장소 상태: 사용중 ${currentSize}MB, 전체 ${totalCapacity}MB, 가용 ${availableSpace}MB`);
                }
            } else {
                console.error('storageModal을 찾을 수 없습니다.');
                alert('저장소 관리 기능을 준비 중입니다.');
            }
        }
    };
    
    // 메뉴 버튼 초기화 함수
    function initMenuButtons() {
        Object.keys(menuButtons).forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                // 기존 이벤트 리스너 제거 (중복 방지)
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);
                
                // 버튼 스타일 강화
                newButton.style.cssText += `
                    pointer-events: auto !important;
                    cursor: pointer !important;
                    z-index: 10 !important;
                    position: relative !important;
                `;
                
                // 클릭 이벤트 추가
                newButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    console.log(`🎯 ${buttonId} 클릭됨`);
                    
                    // 버튼 클릭 피드백
                    newButton.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        newButton.style.transform = '';
                    }, 150);
                    
                    // 해당 함수 실행
                    try {
                        menuButtons[buttonId]();
                    } catch (error) {
                        console.error(`${buttonId} 실행 중 오류:`, error);
                        alert('기능을 실행하는 중 오류가 발생했습니다. 페이지를 새로고침해 주세요.');
                    }
                });
                
                // 호버 효과 추가
                newButton.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-2px)';
                    this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                });
                
                newButton.addEventListener('mouseleave', function() {
                    this.style.transform = '';
                    this.style.boxShadow = '';
                });
                
                console.log(`✅ ${buttonId} 이벤트 등록 완료`);
            } else {
                console.warn(`⚠️ ${buttonId} 버튼을 찾을 수 없습니다.`);
            }
        });
        
        console.log('🎉 모든 메뉴 버튼 초기화 완료');
    }
    
    // DOM 로드 완료 시 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMenuButtons);
    } else {
        initMenuButtons();
    }
    
    // 페이지 로드 완료 후 재확인
    window.addEventListener('load', function() {
        setTimeout(initMenuButtons, 500);
    });
    
    // 테마 토글 버튼도 수정
    function fixThemeToggle() {
        const themeBtn = document.getElementById('themeToggle');
        if (themeBtn) {
            const newThemeBtn = themeBtn.cloneNode(true);
            themeBtn.parentNode.replaceChild(newThemeBtn, themeBtn);
            
            newThemeBtn.style.cssText += `
                pointer-events: auto !important;
                cursor: pointer !important;
                z-index: 10 !important;
            `;
            
            newThemeBtn.addEventListener('click', function() {
                const current = document.documentElement.getAttribute('data-theme') || 'light';
                const newTheme = current === 'light' ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
                console.log(`테마 변경: ${current} → ${newTheme}`);
                
                // 버튼 텍스트 업데이트
                this.textContent = newTheme === 'dark' ? '☀️' : '🌙';
            });
            
            console.log('✅ 테마 토글 버튼 수정 완료');
        }
    }
    
    // 테마 버튼도 수정
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fixThemeToggle);
    } else {
        fixThemeToggle();
    }
    
    // 전역 함수로 노출
    window.initMenuButtons = initMenuButtons;
    
    console.log('🔧 메뉴 버튼 수정 시스템 초기화 완료');
    
})();