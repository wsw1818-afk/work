/**
 * 메모 X 버튼 제거 및 첨부파일 미리보기
 * 실시간으로 메모 리스트의 X 버튼을 찾아서 제거
 */

console.log('🚀 메모 X 버튼 수정 스크립트 시작');

// X 버튼 제거 함수
function removeXButtons() {
    // 날짜별 메모 리스트의 X 버튼들
    const memoItems = document.querySelectorAll('.date-memo-item, .memo-item');
    let removedCount = 0;
    
    memoItems.forEach(item => {
        // 각 메모 아이템 내의 모든 버튼 확인
        const buttons = item.querySelectorAll('button');
        buttons.forEach(button => {
            const text = button.textContent.trim();
            
            // X 버튼 텍스트 확인
            if (text === '×' || text === 'X' || text === 'x') {
                // 빨간색 배경 확인
                const style = window.getComputedStyle(button);
                const bgColor = style.backgroundColor;
                
                if (bgColor.includes('239') && bgColor.includes('68') && bgColor.includes('68')) {
                    // 빨간색 X 버튼 제거
                    button.style.display = 'none';
                    button.style.visibility = 'hidden';
                    button.remove(); // 완전히 제거
                    removedCount++;
                } else if (bgColor === 'rgb(239, 68, 68)' || bgColor === 'rgb(220, 38, 38)') {
                    button.style.display = 'none';
                    button.style.visibility = 'hidden';
                    button.remove();
                    removedCount++;
                }
            }
        });
    });
    
    if (removedCount > 0) {
        console.log(`✅ ${removedCount}개의 X 버튼 제거됨`);
    }
}

// 첨부파일 버튼 변경 함수
function modifyAttachmentButtons() {
    const attachmentButtons = document.querySelectorAll('button[onclick*="downloadAttachment"]');
    
    attachmentButtons.forEach(button => {
        if (button.textContent !== '👁️ 미리보기') {
            button.textContent = '👁️ 미리보기';
            button.style.backgroundColor = '#17a2b8';
            button.style.color = 'white';
            button.style.border = 'none';
            button.style.padding = '4px 8px';
            button.style.borderRadius = '4px';
            button.style.cursor = 'pointer';
        }
    });
    
    if (attachmentButtons.length > 0) {
        console.log(`📎 ${attachmentButtons.length}개의 첨부파일 버튼 수정됨`);
    }
}

// 통합 실행 함수
function fixMemoDisplay() {
    removeXButtons();
    modifyAttachmentButtons();
}

// DOM 변경 감지
const observer = new MutationObserver(function(mutations) {
    let hasRelevantChange = false;
    
    mutations.forEach(function(mutation) {
        // 메모 리스트 관련 변경 감지
        if (mutation.target.id === 'dateMemoList' || 
            mutation.target.classList.contains('memo-list') ||
            mutation.target.classList.contains('date-memo-list')) {
            hasRelevantChange = true;
        }
        
        // 새로운 메모 아이템 추가 감지
        mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) {
                if (node.classList && (node.classList.contains('date-memo-item') || 
                    node.classList.contains('memo-item'))) {
                    hasRelevantChange = true;
                }
            }
        });
    });
    
    if (hasRelevantChange) {
        fixMemoDisplay();
    }
});

// 옵저버 시작
observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class']
});

// 초기 실행
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixMemoDisplay);
} else {
    fixMemoDisplay();
}

// 주기적 체크 (1초마다)
setInterval(fixMemoDisplay, 1000);

// 페이지 로드 완료 후 추가 실행
window.addEventListener('load', function() {
    setTimeout(fixMemoDisplay, 500);
});

console.log('✅ 메모 X 버튼 수정 스크립트 초기화 완료');