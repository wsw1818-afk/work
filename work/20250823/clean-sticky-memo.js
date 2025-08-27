/**
 * 완전히 깨끗한 스티커 메모 시스템
 * 모든 충돌 요소 제거됨
 */

(function() {
    'use strict';
    
    console.log('🧹 깨끗한 스티커 메모 시스템 시작');
    
    // 전역 함수로 등록
    window.forceStickyOpen = function() {
        console.log('🗒️ 스티커 메모 열기');
        
        // 기존 스티커 메모 모두 제거
        const existingMemos = document.querySelectorAll('[id*="sticky"], [class*="sticky"]');
        existingMemos.forEach(memo => memo.remove());
        
        // 새 스티커 메모 생성
        const memo = document.createElement('div');
        memo.id = 'cleanStickyMemo';
        memo.innerHTML = `
            <div style="background: #ffc107; padding: 12px; border-radius: 8px 8px 0 0; display: flex; justify-content: space-between; align-items: center; cursor: move; font-weight: bold; color: #8b5a00; position: relative;">
                🗒️ 스티커 메모
                <button onclick="document.getElementById('cleanStickyMemo').remove()" style="background: rgba(255,255,255,0.3); border: none; color: #8b5a00; font-size: 18px; cursor: pointer; font-weight: bold; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;" onmouseover="this.style.background='#dc3545'; this.style.color='white'; this.style.transform='scale(1.1)';" onmouseout="this.style.background='rgba(255,255,255,0.3)'; this.style.color='#8b5a00'; this.style.transform='scale(1)';">×</button>
            </div>
            <div style="padding: 15px; background: #fff3cd; position: relative;">
                <textarea id="cleanStickyText" placeholder="메모를 입력하세요..." style="width: 100%; height: 200px; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box; font-family: inherit; resize: none;"></textarea>
                <div style="margin-top: 10px; text-align: center;">
                    <button onclick="saveCleanMemo()" style="background: #28a745; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-right: 8px; font-weight: bold;">💾 저장</button>
                    <button onclick="loadCleanMemo()" style="background: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold;">📂 불러오기</button>
                </div>
            </div>
            
            <!-- 리사이즈 핸들들 -->
            <div class="resize-handle resize-handle-n" style="position: absolute; top: -3px; left: 50%; transform: translateX(-50%); width: 20px; height: 6px; cursor: n-resize; background: transparent;"></div>
            <div class="resize-handle resize-handle-s" style="position: absolute; bottom: -3px; left: 50%; transform: translateX(-50%); width: 20px; height: 6px; cursor: s-resize; background: transparent;"></div>
            <div class="resize-handle resize-handle-w" style="position: absolute; left: -3px; top: 50%; transform: translateY(-50%); width: 6px; height: 20px; cursor: w-resize; background: transparent;"></div>
            <div class="resize-handle resize-handle-e" style="position: absolute; right: -3px; top: 50%; transform: translateY(-50%); width: 6px; height: 20px; cursor: e-resize; background: transparent;"></div>
            <div class="resize-handle resize-handle-nw" style="position: absolute; top: -3px; left: -3px; width: 10px; height: 10px; cursor: nw-resize; background: transparent;"></div>
            <div class="resize-handle resize-handle-ne" style="position: absolute; top: -3px; right: -3px; width: 10px; height: 10px; cursor: ne-resize; background: transparent;"></div>
            <div class="resize-handle resize-handle-sw" style="position: absolute; bottom: -3px; left: -3px; width: 10px; height: 10px; cursor: sw-resize; background: transparent;"></div>
            <div class="resize-handle resize-handle-se" style="position: absolute; bottom: -3px; right: -3px; width: 10px; height: 10px; cursor: se-resize; background: transparent;"></div>
        `;
        
        // 스타일 적용
        memo.style.cssText = `
            position: fixed !important;
            top: 80px !important;
            right: 80px !important;
            width: 380px !important;
            border: 2px solid #ffc107 !important;
            border-radius: 8px !important;
            box-shadow: 0 6px 20px rgba(0,0,0,0.25) !important;
            z-index: 999999 !important;
            font-family: 'Malgun Gothic', sans-serif !important;
            background: white !important;
        `;
        
        document.body.appendChild(memo);
        
        // 저장된 내용 자동 로드
        const saved = localStorage.getItem('cleanStickyMemoText');
        if (saved) {
            document.getElementById('cleanStickyText').value = saved;
        }
        
        // 드래그 및 리사이즈 기능 초기화
        initStickyDrag();
        initStickyResize();
        
        console.log('✅ 깨끗한 스티커 메모 생성 완료');
        return false;
    };
    
    // 메모 저장
    window.saveCleanMemo = function() {
        const text = document.getElementById('cleanStickyText').value;
        if (text.trim()) {
            localStorage.setItem('cleanStickyMemoText', text);
            alert('메모가 저장되었습니다! 💾');
        } else {
            alert('저장할 내용을 입력해주세요.');
        }
    };
    
    // 메모 불러오기
    window.loadCleanMemo = function() {
        const saved = localStorage.getItem('cleanStickyMemoText');
        if (saved) {
            document.getElementById('cleanStickyText').value = saved;
            alert('메모를 불러왔습니다! 📂');
        } else {
            alert('저장된 메모가 없습니다.');
        }
    };
    
    // 드래그 기능 초기화
    function initStickyDrag() {
        const memo = document.getElementById('cleanStickyMemo');
        if (!memo) return;
        
        const header = memo.querySelector('div:first-child'); // 헤더 부분
        if (!header) return;
        
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;
        
        // 마우스 다운
        header.addEventListener('mousedown', function(e) {
            if (e.target.tagName === 'BUTTON') return; // X 버튼 클릭 시 드래그 방지
            
            isDragging = true;
            header.style.cursor = 'grabbing';
            
            const rect = memo.getBoundingClientRect();
            startX = e.clientX;
            startY = e.clientY;
            initialLeft = rect.left;
            initialTop = rect.top;
            
            e.preventDefault();
        });
        
        // 마우스 무브
        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            const newLeft = initialLeft + deltaX;
            const newTop = initialTop + deltaY;
            
            // 화면 경계 체크
            const maxX = window.innerWidth - memo.offsetWidth;
            const maxY = window.innerHeight - memo.offsetHeight;
            
            const constrainedLeft = Math.max(0, Math.min(newLeft, maxX));
            const constrainedTop = Math.max(0, Math.min(newTop, maxY));
            
            memo.style.left = constrainedLeft + 'px';
            memo.style.top = constrainedTop + 'px';
            memo.style.right = 'auto'; // right 속성 제거
        });
        
        // 마우스 업
        document.addEventListener('mouseup', function(e) {
            if (isDragging) {
                isDragging = false;
                header.style.cursor = 'move';
                
                // 위치 저장
                const rect = memo.getBoundingClientRect();
                localStorage.setItem('cleanStickyMemoPosition', JSON.stringify({
                    left: rect.left,
                    top: rect.top
                }));
            }
        });
        
        // 저장된 위치 로드
        const savedPosition = localStorage.getItem('cleanStickyMemoPosition');
        if (savedPosition) {
            try {
                const pos = JSON.parse(savedPosition);
                memo.style.left = pos.left + 'px';
                memo.style.top = pos.top + 'px';
                memo.style.right = 'auto';
            } catch(e) {
                console.log('위치 로드 실패:', e);
            }
        }
        
        console.log('✅ 스티커 메모 드래그 기능 초기화 완료');
    }
    
    // 리사이즈 기능 초기화
    function initStickyResize() {
        const memo = document.getElementById('cleanStickyMemo');
        if (!memo) return;
        
        const handles = memo.querySelectorAll('.resize-handle');
        
        handles.forEach(handle => {
            let isResizing = false;
            let startX, startY, startWidth, startHeight, startLeft, startTop;
            
            handle.addEventListener('mousedown', function(e) {
                isResizing = true;
                startX = e.clientX;
                startY = e.clientY;
                
                const rect = memo.getBoundingClientRect();
                startWidth = rect.width;
                startHeight = rect.height;
                startLeft = rect.left;
                startTop = rect.top;
                
                document.body.style.cursor = handle.style.cursor;
                e.preventDefault();
                e.stopPropagation();
            });
            
            document.addEventListener('mousemove', function(e) {
                if (!isResizing) return;
                
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;
                
                let newWidth = startWidth;
                let newHeight = startHeight;
                let newLeft = startLeft;
                let newTop = startTop;
                
                // 최소 크기 제한
                const minWidth = 300;
                const minHeight = 250;
                
                // 각 핸들별 리사이즈 로직
                if (handle.classList.contains('resize-handle-e')) {
                    newWidth = Math.max(minWidth, startWidth + deltaX);
                } else if (handle.classList.contains('resize-handle-w')) {
                    newWidth = Math.max(minWidth, startWidth - deltaX);
                    if (newWidth > minWidth) newLeft = startLeft + deltaX;
                } else if (handle.classList.contains('resize-handle-s')) {
                    newHeight = Math.max(minHeight, startHeight + deltaY);
                } else if (handle.classList.contains('resize-handle-n')) {
                    newHeight = Math.max(minHeight, startHeight - deltaY);
                    if (newHeight > minHeight) newTop = startTop + deltaY;
                } else if (handle.classList.contains('resize-handle-se')) {
                    newWidth = Math.max(minWidth, startWidth + deltaX);
                    newHeight = Math.max(minHeight, startHeight + deltaY);
                } else if (handle.classList.contains('resize-handle-sw')) {
                    newWidth = Math.max(minWidth, startWidth - deltaX);
                    newHeight = Math.max(minHeight, startHeight + deltaY);
                    if (newWidth > minWidth) newLeft = startLeft + deltaX;
                } else if (handle.classList.contains('resize-handle-ne')) {
                    newWidth = Math.max(minWidth, startWidth + deltaX);
                    newHeight = Math.max(minHeight, startHeight - deltaY);
                    if (newHeight > minHeight) newTop = startTop + deltaY;
                } else if (handle.classList.contains('resize-handle-nw')) {
                    newWidth = Math.max(minWidth, startWidth - deltaX);
                    newHeight = Math.max(minHeight, startHeight - deltaY);
                    if (newWidth > minWidth) newLeft = startLeft + deltaX;
                    if (newHeight > minHeight) newTop = startTop + deltaY;
                }
                
                // 화면 경계 체크
                const maxX = window.innerWidth - newWidth;
                const maxY = window.innerHeight - newHeight;
                
                newLeft = Math.max(0, Math.min(newLeft, maxX));
                newTop = Math.max(0, Math.min(newTop, maxY));
                
                // 스타일 적용
                memo.style.width = newWidth + 'px';
                memo.style.height = newHeight + 'px';
                memo.style.left = newLeft + 'px';
                memo.style.top = newTop + 'px';
                
                // 텍스트영역 크기 조정
                const textarea = memo.querySelector('#cleanStickyText');
                if (textarea) {
                    textarea.style.height = (newHeight - 150) + 'px';
                }
            });
            
            document.addEventListener('mouseup', function(e) {
                if (isResizing) {
                    isResizing = false;
                    document.body.style.cursor = '';
                    
                    // 크기와 위치 저장
                    const rect = memo.getBoundingClientRect();
                    localStorage.setItem('cleanStickyMemoSize', JSON.stringify({
                        width: rect.width,
                        height: rect.height,
                        left: rect.left,
                        top: rect.top
                    }));
                }
            });
        });
        
        // 저장된 크기 로드
        const savedSize = localStorage.getItem('cleanStickyMemoSize');
        if (savedSize) {
            try {
                const size = JSON.parse(savedSize);
                memo.style.width = size.width + 'px';
                memo.style.height = size.height + 'px';
                memo.style.left = size.left + 'px';
                memo.style.top = size.top + 'px';
                
                // 텍스트영역 크기 조정
                const textarea = memo.querySelector('#cleanStickyText');
                if (textarea) {
                    textarea.style.height = (size.height - 150) + 'px';
                }
            } catch(e) {
                console.log('크기 로드 실패:', e);
            }
        }
        
        console.log('✅ 스티커 메모 리사이즈 기능 초기화 완료');
    }
    
})();