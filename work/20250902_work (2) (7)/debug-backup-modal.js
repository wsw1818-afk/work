// 백업 모달 디버깅 스크립트
(function() {
    'use strict';
    
    console.log('🔍 백업 모달 디버깅 시작');
    
    // 백업 모달 디버깅 함수
    window.debugBackupModal = function() {
        console.log('🔍 백업 모달 상태 확인');
        
        const modal = document.getElementById('backupModal');
        if (!modal) {
            console.log('❌ backupModal을 찾을 수 없음');
            return;
        }
        
        console.log('✅ backupModal 발견:', modal);
        
        // 모달의 스타일 확인
        const computedStyle = window.getComputedStyle(modal);
        console.log('📊 모달 computed style:');
        console.log('  display:', computedStyle.display);
        console.log('  visibility:', computedStyle.visibility);
        console.log('  opacity:', computedStyle.opacity);
        console.log('  z-index:', computedStyle.zIndex);
        console.log('  position:', computedStyle.position);
        console.log('  top:', computedStyle.top);
        console.log('  left:', computedStyle.left);
        console.log('  width:', computedStyle.width);
        console.log('  height:', computedStyle.height);
        console.log('  background-color:', computedStyle.backgroundColor);
        
        // 모달의 inline style 확인
        console.log('🎨 모달 inline style:', modal.style.cssText);
        
        // 모달의 classList 확인
        console.log('📝 모달 classList:', Array.from(modal.classList));
        
        // 모달의 부모 요소들 확인
        let parent = modal.parentElement;
        let level = 1;
        while (parent && level <= 3) {
            console.log(`👨‍👦 부모 ${level}:`, parent.tagName, parent.id, parent.className);
            const parentStyle = window.getComputedStyle(parent);
            console.log(`  - position: ${parentStyle.position}`);
            console.log(`  - z-index: ${parentStyle.zIndex}`);
            console.log(`  - overflow: ${parentStyle.overflow}`);
            parent = parent.parentElement;
            level++;
        }
        
        // 모달 내부 요소들 확인
        const modalContent = modal.querySelector('.modal-content, .modal-dialog, .modal-body');
        if (modalContent) {
            console.log('📄 모달 내용 요소:', modalContent);
            const contentStyle = window.getComputedStyle(modalContent);
            console.log('📊 모달 내용 computed style:');
            console.log('  display:', contentStyle.display);
            console.log('  position:', contentStyle.position);
            console.log('  z-index:', contentStyle.zIndex);
            console.log('  background:', contentStyle.backgroundColor);
        }
        
        // 다른 높은 z-index 요소들 찾기
        const allElements = document.querySelectorAll('*');
        const highZIndexElements = [];
        
        allElements.forEach(el => {
            const style = window.getComputedStyle(el);
            const zIndex = parseInt(style.zIndex);
            if (zIndex > 100000) {
                highZIndexElements.push({
                    element: el,
                    zIndex: zIndex,
                    display: style.display,
                    position: style.position
                });
            }
        });
        
        console.log('🚀 높은 z-index 요소들 (100000 이상):', highZIndexElements);
        
        // 모달이 화면에 보이는지 확인
        const rect = modal.getBoundingClientRect();
        console.log('📐 모달 bounding rect:', rect);
        console.log('📺 화면 크기:', window.innerWidth, 'x', window.innerHeight);
        
        const isInViewport = (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= window.innerHeight &&
            rect.right <= window.innerWidth
        );
        
        console.log('👁️ 모달이 뷰포트 안에 있는가?', isInViewport);
        
        // 모달을 강제로 표시 시도
        console.log('💪 모달 강제 표시 시도');
        modal.style.cssText = `
            display: flex !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background-color: rgba(255, 0, 0, 0.5) !important;
            z-index: 2147483647 !important;
            visibility: visible !important;
            opacity: 1 !important;
            align-items: center !important;
            justify-content: center !important;
            pointer-events: auto !important;
        `;
        
        // 모달 내용도 강제 표시
        if (modalContent) {
            modalContent.style.cssText = `
                background: yellow !important;
                border: 5px solid red !important;
                padding: 50px !important;
                font-size: 24px !important;
                color: black !important;
                z-index: 2147483647 !important;
                position: relative !important;
                display: block !important;
            `;
            modalContent.innerHTML = '<h2>백업 모달 테스트 - 이 텍스트가 보이면 성공!</h2>';
        }
        
        console.log('✨ 강제 표시 완료 - 빨간 배경에 노란 모달이 보여야 함');
    };
    
    // 백업 버튼에 디버그 기능 추가
    const backupBtn = document.getElementById('backupBtn');
    if (backupBtn) {
        console.log('🔧 백업 버튼에 디버그 기능 추가');
        
        // Shift+클릭으로 디버그 모드 실행
        backupBtn.addEventListener('click', function(e) {
            if (e.shiftKey) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔍 Shift+클릭 감지 - 디버그 모드 실행');
                debugBackupModal();
            }
        });
    }
    
    // 전역 단축키 등록 (Ctrl+Shift+D)
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            e.preventDefault();
            console.log('🔍 디버그 단축키 감지 (Ctrl+Shift+D)');
            debugBackupModal();
        }
    });
    
    console.log('🔍 백업 모달 디버깅 스크립트 로드 완료');
    console.log('💡 사용법:');
    console.log('  - Shift+백업버튼 클릭 또는');
    console.log('  - Ctrl+Shift+D 키 또는');
    console.log('  - 콘솔에서 debugBackupModal() 호출');
    
})();