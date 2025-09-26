// 클라우드 버튼 클릭 문제 해결
(function() {
    'use strict';
    
    // DOM 로드 완료 후 실행
    function initCloudButton() {
        const cloudBtn = document.getElementById('unifiedCloudBtn');
        
        if (!cloudBtn) {
            console.warn('클라우드 버튼을 찾을 수 없습니다.');
            return;
        }
        
        // 기존 이벤트 리스너 제거
        const newCloudBtn = cloudBtn.cloneNode(true);
        cloudBtn.parentNode.replaceChild(newCloudBtn, cloudBtn);
        
        // 버튼 스타일 강화
        newCloudBtn.style.cssText = `
            z-index: 10 !important;
            pointer-events: auto !important;
            cursor: pointer !important;
            position: relative !important;
        `;
        
        // 클릭 이벤트 추가
        newCloudBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('☁️ 클라우드 설정 버튼 클릭됨');
            
            // showUnifiedCloudModal 함수 확인 및 실행
            if (typeof window.showUnifiedCloudModal === 'function') {
                try {
                    window.showUnifiedCloudModal();
                    console.log('✅ 클라우드 모달 열기 성공');
                } catch (error) {
                    console.error('❌ 클라우드 모달 열기 실패:', error);
                    alert('클라우드 설정을 여는 중 오류가 발생했습니다.');
                }
            } else {
                console.error('showUnifiedCloudModal 함수를 찾을 수 없습니다.');
                
                // unified-cloud-modal.js 파일 재로드 시도
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
        });
        
        // 호버 효과 추가
        newCloudBtn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        });
        
        newCloudBtn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '';
        });
        
        console.log('✅ 클라우드 버튼 초기화 완료');
    }
    
    // 페이지 로드 시 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCloudButton);
    } else {
        initCloudButton();
    }
    
    // 추가 안전장치: 1초 후 재시도
    setTimeout(initCloudButton, 1000);
    
})();