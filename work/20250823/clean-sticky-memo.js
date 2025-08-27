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
                <!-- 텍스트 서식 도구 모음 -->
                <div style="margin-bottom: 10px; padding: 8px; background: rgba(255,255,255,0.5); border-radius: 5px; display: flex; flex-wrap: wrap; gap: 5px;">
                    <select id="fontFamily" onchange="applyTextFormat('fontFamily', this.value)" style="padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
                        <option value="inherit">기본 폰트</option>
                        <option value="'Malgun Gothic'">맑은 고딕</option>
                        <option value="'Noto Sans KR'">노토 산스</option>
                        <option value="Arial">Arial</option>
                        <option value="'Times New Roman'">Times</option>
                        <option value="monospace">고정폭</option>
                    </select>
                    <select id="fontSize" onchange="applyTextFormat('fontSize', this.value)" style="padding: 4px; border: 1px solid #ccc; border-radius: 3px;">
                        <option value="12px">12px</option>
                        <option value="14px" selected>14px</option>
                        <option value="16px">16px</option>
                        <option value="18px">18px</option>
                        <option value="20px">20px</option>
                        <option value="24px">24px</option>
                    </select>
                    <button onclick="applyTextFormat('bold')" style="background: #f8f9fa; border: 1px solid #ccc; border-radius: 3px; padding: 4px 8px; cursor: pointer; font-weight: bold;">𝐁</button>
                    <button onclick="applyTextFormat('italic')" style="background: #f8f9fa; border: 1px solid #ccc; border-radius: 3px; padding: 4px 8px; cursor: pointer; font-style: italic;">𝐼</button>
                    <button onclick="applyTextFormat('underline')" style="background: #f8f9fa; border: 1px solid #ccc; border-radius: 3px; padding: 4px 8px; cursor: pointer; text-decoration: underline;">U</button>
                    <!-- 글자색 메뉴 -->
                    <div style="position: relative; display: inline-block;">
                        <button onclick="toggleTextColorMenu()" style="background: #f8f9fa; border: 1px solid #ccc; border-radius: 3px; padding: 4px 8px; cursor: pointer; font-weight: bold;" title="글자 색상">A▼</button>
                        <div id="textColorMenu" style="display: none; position: absolute; top: 30px; left: 0; background: white; border: 1px solid #ccc; border-radius: 5px; padding: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); z-index: 1000; min-width: 120px;">
                            <input type="color" id="textColor" value="#000000" style="width: 100%; height: 30px; border: 1px solid #ccc; border-radius: 3px; cursor: pointer; margin-bottom: 5px;">
                            <div style="display: flex; gap: 5px;">
                                <button onclick="applyTextColorFromMenu()" style="background: #28a745; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 11px; flex: 1;">적용</button>
                                <button onclick="resetTextColorFromMenu()" style="background: #6c757d; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 11px;">초기화</button>
                            </div>
                        </div>
                    </div>
                    <!-- 배경색 메뉴 -->
                    <div style="position: relative; display: inline-block;">
                        <button onclick="toggleBgColorMenu()" style="background: #f8f9fa; border: 1px solid #ccc; border-radius: 3px; padding: 4px 8px; cursor: pointer; font-weight: bold;" title="배경 색상">🎨▼</button>
                        <div id="bgColorMenu" style="display: none; position: absolute; top: 30px; left: 0; background: white; border: 1px solid #ccc; border-radius: 5px; padding: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); z-index: 1000; min-width: 120px;">
                            <input type="color" id="bgColor" value="#ffffff" style="width: 100%; height: 30px; border: 1px solid #ccc; border-radius: 3px; cursor: pointer; margin-bottom: 5px;">
                            <div style="display: flex; gap: 5px;">
                                <button onclick="applyBgColorFromMenu()" style="background: #28a745; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 11px; flex: 1;">적용</button>
                                <button onclick="resetBgColorFromMenu()" style="background: #6c757d; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 11px;">초기화</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div contenteditable="true" id="cleanStickyText" style="width: 100%; height: 200px; padding: 10px; border: 1px solid #ddd; border-radius: 5px; box-sizing: border-box; font-family: inherit; resize: none; overflow-y: auto; background: white;" placeholder="메모를 입력하세요..."></div>
                <div style="margin-top: 10px; text-align: center;">
                    <button onclick="saveToCalendar()" style="background: #28a745; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold;">📅 달력에 저장</button>
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
            document.getElementById('cleanStickyText').innerHTML = saved;
        }
        
        // contenteditable placeholder 처리
        const textArea = document.getElementById('cleanStickyText');
        textArea.addEventListener('focus', function() {
            if (this.innerHTML.trim() === '' || this.innerHTML === '<br>') {
                this.innerHTML = '';
            }
        });
        
        textArea.addEventListener('blur', function() {
            if (this.innerHTML.trim() === '' || this.innerHTML === '<br>') {
                this.innerHTML = '';
            }
        });
        
        // 드래그 및 리사이즈 기능 초기화
        initStickyDrag();
        initStickyResize();
        initColorMenuEvents();
        
        console.log('✅ 깨끗한 스티커 메모 생성 완료');
        return false;
    };
    
    // 달력에 저장 함수
    window.saveToCalendar = function() {
        const textArea = document.getElementById('cleanStickyText');
        const content = textArea.innerText || textArea.textContent || '';
        
        if (!content.trim()) {
            alert('저장할 내용을 입력해주세요.');
            return;
        }
        
        // 첫 번째 줄을 제목으로, 나머지를 내용으로 분리
        const lines = content.split('\n').filter(line => line.trim() !== '');
        if (lines.length === 0) {
            alert('저장할 내용을 입력해주세요.');
            return;
        }
        
        const title = lines[0].trim();
        const memoContent = lines.slice(1).join('\n').trim();
        
        if (!title) {
            alert('첫 번째 줄에 메모 제목을 입력해주세요.');
            return;
        }
        
        // 오늘 날짜로 메모 저장
        const today = new Date();
        const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD 형식
        
        const memo = {
            id: Date.now(),
            title: title,
            content: memoContent || '(내용 없음)',
            date: todayString,
            timestamp: new Date().toISOString()
        };
        
        // 일반 메모 리스트에 저장
        let memos = JSON.parse(localStorage.getItem('calendarMemos') || '[]');
        memos.unshift(memo);
        localStorage.setItem('calendarMemos', JSON.stringify(memos));
        
        // 날짜별 메모에도 저장
        let dateMemos = JSON.parse(localStorage.getItem('dateMemos') || '{}');
        if (!dateMemos[todayString]) {
            dateMemos[todayString] = [];
        }
        dateMemos[todayString].unshift(memo);
        localStorage.setItem('dateMemos', JSON.stringify(dateMemos));
        
        // 스티커 메모도 저장 (나중에 다시 열 때 복원용)
        localStorage.setItem('cleanStickyMemoText', textArea.innerHTML);
        
        alert(`📅 메모가 오늘(${todayString}) 달력에 저장되었습니다!\\n제목: ${title}`);
        
        // 달력 표시 업데이트 (있다면)
        if (window.updateCalendarDisplay) {
            window.updateCalendarDisplay();
        }
    };
    
    // 글자색 메뉴 토글
    window.toggleTextColorMenu = function() {
        const menu = document.getElementById('textColorMenu');
        const bgMenu = document.getElementById('bgColorMenu');
        
        // 배경색 메뉴 닫기
        if (bgMenu) bgMenu.style.display = 'none';
        
        if (menu) {
            menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
        }
    };
    
    // 배경색 메뉴 토글
    window.toggleBgColorMenu = function() {
        const menu = document.getElementById('bgColorMenu');
        const textMenu = document.getElementById('textColorMenu');
        
        // 글자색 메뉴 닫기
        if (textMenu) textMenu.style.display = 'none';
        
        if (menu) {
            menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
        }
    };
    
    // 글자색 적용
    window.applyTextColorFromMenu = function() {
        const colorPicker = document.getElementById('textColor');
        const textArea = document.getElementById('cleanStickyText');
        
        if (colorPicker && textArea) {
            textArea.focus();
            try {
                document.execCommand('foreColor', false, colorPicker.value);
            } catch (error) {
                console.log('글자색 적용 중 오류:', error);
            }
        }
        
        // 메뉴 닫기
        const menu = document.getElementById('textColorMenu');
        if (menu) menu.style.display = 'none';
    };
    
    // 배경색 적용
    window.applyBgColorFromMenu = function() {
        const colorPicker = document.getElementById('bgColor');
        const textArea = document.getElementById('cleanStickyText');
        
        if (colorPicker && textArea) {
            textArea.focus();
            try {
                document.execCommand('backColor', false, colorPicker.value);
            } catch (error) {
                console.log('배경색 적용 중 오류:', error);
            }
        }
        
        // 메뉴 닫기
        const menu = document.getElementById('bgColorMenu');
        if (menu) menu.style.display = 'none';
    };
    
    // 글자색 초기화
    window.resetTextColorFromMenu = function() {
        const colorPicker = document.getElementById('textColor');
        const textArea = document.getElementById('cleanStickyText');
        
        if (colorPicker) colorPicker.value = '#000000';
        
        if (textArea) {
            textArea.focus();
            try {
                document.execCommand('foreColor', false, '#000000');
            } catch (error) {
                console.log('글자색 초기화 중 오류:', error);
            }
        }
        
        // 메뉴 닫기
        const menu = document.getElementById('textColorMenu');
        if (menu) menu.style.display = 'none';
    };
    
    // 배경색 초기화
    window.resetBgColorFromMenu = function() {
        const colorPicker = document.getElementById('bgColor');
        const textArea = document.getElementById('cleanStickyText');
        
        if (colorPicker) colorPicker.value = '#ffffff';
        
        if (textArea) {
            textArea.focus();
            try {
                document.execCommand('backColor', false, '#ffffff');
            } catch (error) {
                console.log('배경색 초기화 중 오류:', error);
            }
        }
        
        // 메뉴 닫기
        const menu = document.getElementById('bgColorMenu');
        if (menu) menu.style.display = 'none';
    };
    
    // 텍스트 서식 적용 함수
    window.applyTextFormat = function(command, value) {
        const textArea = document.getElementById('cleanStickyText');
        textArea.focus();
        
        try {
            if (command === 'fontFamily') {
                document.execCommand('fontName', false, value);
            } else if (command === 'fontSize') {
                // fontSize는 1-7 값을 사용하므로 픽셀 값을 변환
                const sizeMap = {
                    '12px': '2',
                    '14px': '3',
                    '16px': '4',
                    '18px': '5',
                    '20px': '6',
                    '24px': '7'
                };
                document.execCommand('fontSize', false, sizeMap[value] || '3');
                
                // execCommand 후에 실제 픽셀 크기로 변경
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    const span = document.createElement('span');
                    span.style.fontSize = value;
                    
                    try {
                        range.surroundContents(span);
                    } catch (e) {
                        // 선택된 텍스트가 없으면 현재 위치에 스타일 적용
                        span.innerHTML = '&#8203;'; // 투명 문자
                        range.insertNode(span);
                        range.setStartAfter(span);
                        range.setEndAfter(span);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    }
                }
            } else if (command === 'color') {
                document.execCommand('foreColor', false, value);
            } else if (command === 'backgroundColor') {
                document.execCommand('backColor', false, value);
            } else {
                document.execCommand(command, false, null);
            }
        } catch (error) {
            console.log('서식 적용 중 오류:', error);
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
    
    // 색상 메뉴 이벤트 초기화
    function initColorMenuEvents() {
        // 문서 클릭 시 메뉴 닫기
        document.addEventListener('click', function(e) {
            const textColorMenu = document.getElementById('textColorMenu');
            const bgColorMenu = document.getElementById('bgColorMenu');
            
            // 클릭된 요소가 색상 메뉴나 버튼이 아닌 경우 메뉴 닫기
            if (!e.target.closest('#textColorMenu') && !e.target.closest('[onclick*="toggleTextColorMenu"]')) {
                if (textColorMenu) textColorMenu.style.display = 'none';
            }
            
            if (!e.target.closest('#bgColorMenu') && !e.target.closest('[onclick*="toggleBgColorMenu"]')) {
                if (bgColorMenu) bgColorMenu.style.display = 'none';
            }
        });
        
        console.log('✅ 색상 메뉴 이벤트 초기화 완료');
    }
    
})();