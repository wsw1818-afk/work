/**
 * 스티커 메모 완전 개선 버전
 * - 달력 저장 기능 수정
 * - 가로 확대 제한 제거
 * - 체크박스 기능 제거
 * - 글자색/배경색 기능 추가
 * - 색상 초기화 기능 추가
 * - 코드 정리 및 최적화
 */

(function() {
    'use strict';
    
    console.log('✨ 스티커 메모 완전 개선 버전 시작');
    
    // 전역 상태 관리
    window.stickyMemoState = {
        element: null,
        isOpen: false,
        isDragging: false,
        isResizing: false,
        isMaximized: false,
        savedContent: '',
        position: { x: null, y: null },
        size: { width: 600, height: 650 },
        dragOffset: { x: 0, y: 0 },
        currentTextColor: '#000000',
        currentBgColor: '#ffffff'
    };
    
    /**
     * 스티커 메모 HTML 생성
     */
    function createStickyHTML() {
        return `
            <div id="stickyMemoHeader" class="sticky-memo-header">
                <div class="sticky-memo-title">
                    <span class="sticky-memo-icon">📝</span>
                    <span>스티커 메모</span>
                </div>
                <div class="sticky-memo-controls">
                    <button id="stickyMinimize" class="control-btn" title="최소화">_</button>
                    <button id="stickyMaximize" class="control-btn" title="최대화">□</button>
                    <button id="stickyClose" class="control-btn close-btn" title="닫기">✕</button>
                </div>
            </div>
            
            <div class="sticky-memo-toolbar">
                <button class="toolbar-btn" data-action="bold" title="굵게">
                    <b>B</b>
                </button>
                <button class="toolbar-btn" data-action="italic" title="기울임">
                    <i>I</i>
                </button>
                <button class="toolbar-btn" data-action="underline" title="밑줄">
                    <u>U</u>
                </button>
                <span class="toolbar-separator">|</span>
                <div class="color-controls">
                    <label class="color-control" title="글자색">
                        <span class="color-label">A</span>
                        <input type="color" id="textColorPicker" value="#000000">
                    </label>
                    <label class="color-control" title="배경색">
                        <span class="color-label bg-icon">⬛</span>
                        <input type="color" id="bgColorPicker" value="#ffffff">
                    </label>
                    <button class="toolbar-btn reset-btn" data-action="resetColors" title="색상 초기화">
                        🔄
                    </button>
                </div>
            </div>
            
            <div class="sticky-memo-content">
                <div id="stickyTextarea" class="sticky-memo-textarea" 
                    contenteditable="true"
                    data-placeholder="첫 줄: 제목&#10;둘째 줄: 내용&#10;&#10;저장하면 오늘 날짜에 메모가 저장됩니다."
                    style="min-width: 500px; min-height: 400px; max-width: none; max-height: none;"></div>
            </div>
            
            <div class="sticky-memo-footer">
                <div class="footer-left">
                    <span class="char-count">0 글자</span>
                    <span class="save-status">자동 저장됨</span>
                </div>
                <div class="footer-right">
                    <button class="footer-btn" data-action="save" title="오늘 날짜로 저장">
                        💾 저장
                    </button>
                    <button class="footer-btn" data-action="clear" title="지우기">
                        🗑️ 지우기
                    </button>
                </div>
            </div>
            
            <div class="resize-handle"></div>
        `;
    }
    
    /**
     * 스티커 메모 생성 또는 가져오기
     */
    function getOrCreateStickyMemo() {
        // 기존 중복 제거
        const duplicates = document.querySelectorAll('#stickyMemo');
        if (duplicates.length > 1) {
            console.log('🧹 중복 스티커 메모 제거');
            for (let i = 1; i < duplicates.length; i++) {
                duplicates[i].remove();
            }
        }
        
        let sticky = document.getElementById('stickyMemo');
        
        if (!sticky) {
            console.log('📝 새 스티커 메모 생성');
            
            sticky = document.createElement('div');
            sticky.id = 'stickyMemo';
            sticky.className = 'sticky-memo';
            sticky.innerHTML = createStickyHTML();
            
            document.body.appendChild(sticky);
            
            // 저장된 내용 복원
            const savedContent = localStorage.getItem('stickyMemoContent');
            if (savedContent) {
                const textarea = sticky.querySelector('#stickyTextarea');
                if (textarea) {
                    textarea.innerHTML = savedContent;
                    window.stickyMemoState.savedContent = savedContent;
                }
            }
            
            // 저장된 위치 복원
            const savedPosition = localStorage.getItem('stickyMemoPosition');
            if (savedPosition) {
                try {
                    const pos = JSON.parse(savedPosition);
                    sticky.style.left = pos.x + 'px';
                    sticky.style.top = pos.y + 'px';
                    window.stickyMemoState.position = pos;
                } catch (e) {
                    console.error('위치 복원 실패:', e);
                }
            }
            
            // 저장된 크기 복원
            const savedSize = localStorage.getItem('stickyMemoSize');
            if (savedSize) {
                try {
                    const size = JSON.parse(savedSize);
                    window.stickyMemoState.size = size;
                } catch (e) {
                    console.error('크기 복원 실패:', e);
                }
            }
        }
        
        window.stickyMemoState.element = sticky;
        return sticky;
    }
    
    /**
     * 스티커 메모 표시
     */
    function showStickyMemo() {
        const sticky = getOrCreateStickyMemo();
        
        // 기본 스타일 설정
        Object.assign(sticky.style, {
            display: 'flex',
            flexDirection: 'column',
            visibility: 'visible',
            opacity: '1',
            position: 'fixed',
            zIndex: '2147483647',
            width: window.stickyMemoState.size.width + 'px',
            height: window.stickyMemoState.size.height + 'px',
            background: 'linear-gradient(135deg, #fff9c4 0%, #fff59d 100%)',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            border: '1px solid rgba(255, 193, 7, 0.3)',
            minWidth: '300px', // 최소 크기만 설정
            minHeight: '200px'
            // 최대 크기 제한 완전 제거
        });
        
        // 위치 설정 (중앙 또는 저장된 위치)
        if (!window.stickyMemoState.position.x) {
            const centerX = (window.innerWidth - window.stickyMemoState.size.width) / 2;
            const centerY = (window.innerHeight - window.stickyMemoState.size.height) / 2;
            
            sticky.style.left = centerX + 'px';
            sticky.style.top = centerY + 'px';
            
            window.stickyMemoState.position = { x: centerX, y: centerY };
        }
        
        window.stickyMemoState.isOpen = true;
        
        // 이벤트 설정
        setupEvents(sticky);
        
        console.log('✅ 스티커 메모 표시 완료');
    }
    
    /**
     * 이벤트 설정
     */
    function setupEvents(sticky) {
        // 헤더 드래그
        const header = sticky.querySelector('#stickyMemoHeader');
        if (header) {
            header.style.cursor = 'move';
            header.addEventListener('mousedown', startDrag);
        }
        
        // 리사이즈 핸들
        const resizeHandle = sticky.querySelector('.resize-handle');
        if (resizeHandle) {
            resizeHandle.style.cssText = `
                position: absolute;
                bottom: 0;
                right: 0;
                width: 20px;
                height: 20px;
                cursor: nwse-resize;
                background: linear-gradient(135deg, transparent 50%, rgba(255, 193, 7, 0.5) 50%);
            `;
            resizeHandle.addEventListener('mousedown', startResize);
        }
        
        // 컨트롤 버튼들
        const closeBtn = sticky.querySelector('#stickyClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeStickyMemo);
        }
        
        const minimizeBtn = sticky.querySelector('#stickyMinimize');
        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', minimizeStickyMemo);
        }
        
        const maximizeBtn = sticky.querySelector('#stickyMaximize');
        if (maximizeBtn) {
            maximizeBtn.addEventListener('click', toggleMaximize);
        }
        
        // 툴바 버튼들
        const toolbarBtns = sticky.querySelectorAll('.toolbar-btn');
        toolbarBtns.forEach(btn => {
            btn.addEventListener('click', handleToolbarAction);
        });
        
        // 푸터 버튼들
        const footerBtns = sticky.querySelectorAll('.footer-btn');
        footerBtns.forEach(btn => {
            btn.addEventListener('click', handleToolbarAction);
        });
        
        // 색상 피커들
        const textColorPicker = sticky.querySelector('#textColorPicker');
        const bgColorPicker = sticky.querySelector('#bgColorPicker');
        
        if (textColorPicker) {
            textColorPicker.addEventListener('change', (e) => {
                window.stickyMemoState.currentTextColor = e.target.value;
                applySelectedColor();
            });
        }
        
        if (bgColorPicker) {
            bgColorPicker.addEventListener('change', (e) => {
                window.stickyMemoState.currentBgColor = e.target.value;
                applySelectedBackgroundColor();
            });
        }
        
        // 텍스트 영역
        const textarea = sticky.querySelector('#stickyTextarea');
        if (textarea) {
            textarea.addEventListener('input', handleTextInput);
            
            // 자동 저장
            textarea.addEventListener('input', debounce(() => {
                localStorage.setItem('stickyMemoContent', textarea.innerHTML);
                updateSaveStatus('자동 저장됨');
            }, 1000));
        }
    }
    
    /**
     * 드래그 기능
     */
    function startDrag(e) {
        if (window.stickyMemoState.isMaximized) return;
        
        const sticky = window.stickyMemoState.element;
        if (!sticky) return;
        
        window.stickyMemoState.isDragging = true;
        
        const rect = sticky.getBoundingClientRect();
        window.stickyMemoState.dragOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        
        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('mouseup', stopDrag);
        
        e.preventDefault();
    }
    
    function handleDrag(e) {
        if (!window.stickyMemoState.isDragging) return;
        
        const sticky = window.stickyMemoState.element;
        if (!sticky) return;
        
        const newX = e.clientX - window.stickyMemoState.dragOffset.x;
        const newY = e.clientY - window.stickyMemoState.dragOffset.y;
        
        // 화면 경계 체크 (더 관대하게)
        const maxX = window.innerWidth - 100; // 최소 100px만 보이면 됨
        const maxY = window.innerHeight - 50; // 최소 50px만 보이면 됨
        
        const finalX = Math.max(-sticky.offsetWidth + 100, Math.min(newX, maxX));
        const finalY = Math.max(0, Math.min(newY, maxY));
        
        sticky.style.left = finalX + 'px';
        sticky.style.top = finalY + 'px';
        
        window.stickyMemoState.position = { x: finalX, y: finalY };
    }
    
    function stopDrag() {
        window.stickyMemoState.isDragging = false;
        
        document.removeEventListener('mousemove', handleDrag);
        document.removeEventListener('mouseup', stopDrag);
        
        // 위치 저장
        localStorage.setItem('stickyMemoPosition', JSON.stringify(window.stickyMemoState.position));
    }
    
    /**
     * 리사이즈 기능 (제한 완전 제거)
     */
    function startResize(e) {
        if (window.stickyMemoState.isMaximized) return;
        
        window.stickyMemoState.isResizing = true;
        
        document.addEventListener('mousemove', handleResize);
        document.addEventListener('mouseup', stopResize);
        
        e.preventDefault();
        e.stopPropagation();
    }
    
    function handleResize(e) {
        if (!window.stickyMemoState.isResizing) return;
        
        const sticky = window.stickyMemoState.element;
        if (!sticky) return;
        
        const rect = sticky.getBoundingClientRect();
        const newWidth = Math.max(500, e.clientX - rect.left); // 더 큰 최소 크기
        const newHeight = Math.max(400, e.clientY - rect.top); // 더 큰 최소 크기
        
        // 최대 크기 제한 완전 제거 - 화면 크기도 무시
        sticky.style.width = newWidth + 'px';
        sticky.style.height = newHeight + 'px';
        
        window.stickyMemoState.size = { width: newWidth, height: newHeight };
    }
    
    function stopResize() {
        window.stickyMemoState.isResizing = false;
        
        document.removeEventListener('mousemove', handleResize);
        document.removeEventListener('mouseup', stopResize);
        
        // 크기 저장
        localStorage.setItem('stickyMemoSize', JSON.stringify(window.stickyMemoState.size));
    }
    
    /**
     * 최대화 토글
     */
    function toggleMaximize() {
        const sticky = window.stickyMemoState.element;
        if (!sticky) return;
        
        if (window.stickyMemoState.isMaximized) {
            // 원래 크기로 복원
            sticky.style.width = window.stickyMemoState.size.width + 'px';
            sticky.style.height = window.stickyMemoState.size.height + 'px';
            sticky.style.left = window.stickyMemoState.position.x + 'px';
            sticky.style.top = window.stickyMemoState.position.y + 'px';
            
            window.stickyMemoState.isMaximized = false;
        } else {
            // 최대화 - 화면 전체 크기로
            sticky.style.width = window.innerWidth + 'px';
            sticky.style.height = window.innerHeight + 'px';
            sticky.style.left = '0px';
            sticky.style.top = '0px';
            
            window.stickyMemoState.isMaximized = true;
        }
    }
    
    /**
     * 최소화
     */
    function minimizeStickyMemo() {
        const sticky = window.stickyMemoState.element;
        if (!sticky) return;
        
        sticky.style.height = '40px';
        sticky.style.overflow = 'hidden';
        
        // 내용 영역 숨기기
        const content = sticky.querySelector('.sticky-memo-content');
        const toolbar = sticky.querySelector('.sticky-memo-toolbar');
        const footer = sticky.querySelector('.sticky-memo-footer');
        
        if (content) content.style.display = 'none';
        if (toolbar) toolbar.style.display = 'none';
        if (footer) footer.style.display = 'none';
    }
    
    /**
     * 닫기
     */
    function closeStickyMemo() {
        const sticky = window.stickyMemoState.element;
        if (!sticky) return;
        
        sticky.style.display = 'none';
        window.stickyMemoState.isOpen = false;
        
        console.log('📪 스티커 메모 닫기');
    }
    
    /**
     * 툴바 액션 처리
     */
    function handleToolbarAction(e) {
        const action = e.currentTarget.dataset.action;
        const textarea = document.querySelector('#stickyTextarea');
        
        if (!textarea) return;
        
        switch(action) {
            case 'bold':
                wrapText(textarea, '**', '**');
                break;
            case 'italic':
                wrapText(textarea, '*', '*');
                break;
            case 'underline':
                wrapText(textarea, '<u>', '</u>');
                break;
            case 'resetColors':
                resetColors();
                break;
            case 'save':
                saveToDateMemo();
                break;
            case 'clear':
                if (confirm('메모를 모두 지우시겠습니까?')) {
                    textarea.innerHTML = '';
                    localStorage.removeItem('stickyMemoContent');
                    updateSaveStatus('지워짐');
                }
                break;
        }
    }
    
    /**
     * 색상 관련 함수들
     */
    function applySelectedColor() {
        const textarea = document.querySelector('#stickyTextarea');
        if (!textarea) {
            console.error('❌ 텍스트 영역을 찾을 수 없습니다');
            return;
        }
        
        const selection = window.getSelection();
        const selectedText = selection.toString();
        
        try {
            if (selectedText) {
                // 선택된 텍스트가 있는 경우 - 선택된 텍스트에 색상 적용
                const range = selection.getRangeAt(0);
                const span = document.createElement('span');
                span.style.color = window.stickyMemoState.currentTextColor;
                span.textContent = selectedText;
                
                range.deleteContents();
                range.insertNode(span);
                
                // 선택 해제
                selection.removeAllRanges();
                textarea.focus();
                
                console.log('✅ 선택된 텍스트에 글자색 적용 완료:', window.stickyMemoState.currentTextColor);
                updateSaveStatus('선택 텍스트에 색상 적용됨');
            } else {
                // 선택된 텍스트가 없는 경우 - 커서 위치에 색상 모드 활성화
                const span = document.createElement('span');
                span.style.color = window.stickyMemoState.currentTextColor;
                span.className = 'color-input-mode';
                span.contentEditable = true;
                span.textContent = '색상 텍스트를 입력하세요';
                
                // 커서 위치에 삽입
                if (selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    range.insertNode(span);
                    
                    // 텍스트 선택하여 바로 입력 가능하게 만들기
                    const newRange = document.createRange();
                    newRange.selectNodeContents(span);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                } else {
                    textarea.appendChild(span);
                    const newRange = document.createRange();
                    newRange.selectNodeContents(span);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                }
                
                textarea.focus();
                console.log('✅ 색상 입력 모드 활성화:', window.stickyMemoState.currentTextColor);
                updateSaveStatus('색상 입력 모드 활성화');
            }
        } catch (error) {
            console.error('❌ 글자색 적용 중 오류:', error);
            updateSaveStatus('색상 적용 실패');
        }
    }
    
    function applySelectedBackgroundColor() {
        const textarea = document.querySelector('#stickyTextarea');
        if (!textarea) {
            console.error('❌ 텍스트 영역을 찾을 수 없습니다');
            return;
        }
        
        const selection = window.getSelection();
        const selectedText = selection.toString();
        
        try {
            if (selectedText) {
                // 선택된 텍스트가 있는 경우 - 선택된 텍스트에 배경색 적용
                const range = selection.getRangeAt(0);
                const span = document.createElement('span');
                span.style.backgroundColor = window.stickyMemoState.currentBgColor;
                span.textContent = selectedText;
                
                range.deleteContents();
                range.insertNode(span);
                
                // 선택 해제
                selection.removeAllRanges();
                textarea.focus();
                
                console.log('✅ 선택된 텍스트에 배경색 적용 완료:', window.stickyMemoState.currentBgColor);
                updateSaveStatus('선택 텍스트에 배경색 적용됨');
                
                // 색상 적용은 자동 저장하지 않음 - 사용자가 직접 저장 버튼 클릭해야 함
            } else {
                // 선택된 텍스트가 없는 경우 - 커서 위치에 배경색 모드 활성화
                const span = document.createElement('span');
                span.style.backgroundColor = window.stickyMemoState.currentBgColor;
                span.className = 'bg-color-input-mode';
                span.contentEditable = true;
                span.textContent = '배경색 텍스트를 입력하세요';
                
                // 커서 위치에 삽입
                if (selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    range.insertNode(span);
                    
                    // 텍스트 선택하여 바로 입력 가능하게 만들기
                    const newRange = document.createRange();
                    newRange.selectNodeContents(span);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                } else {
                    textarea.appendChild(span);
                    const newRange = document.createRange();
                    newRange.selectNodeContents(span);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                }
                
                textarea.focus();
                console.log('✅ 배경색 입력 모드 활성화:', window.stickyMemoState.currentBgColor);
                updateSaveStatus('배경색 입력 모드 활성화');
            }
        } catch (error) {
            console.error('❌ 배경색 적용 중 오류:', error);
            updateSaveStatus('배경색 적용 실패');
        }
    }
    
    function resetColors() {
        const textColorPicker = document.querySelector('#textColorPicker');
        const bgColorPicker = document.querySelector('#bgColorPicker');
        
        if (textColorPicker) {
            textColorPicker.value = '#000000';
            window.stickyMemoState.currentTextColor = '#000000';
        }
        
        if (bgColorPicker) {
            bgColorPicker.value = '#ffffff';
            window.stickyMemoState.currentBgColor = '#ffffff';
        }
        
        updateSaveStatus('색상 초기화됨');
    }
    
    /**
     * 텍스트 래핑
     */
    function wrapText(textarea, before, after) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        
        const newText = before + selectedText + after;
        
        textarea.value = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
        
        // 커서 위치 조정
        textarea.selectionStart = start + before.length;
        textarea.selectionEnd = start + before.length + selectedText.length;
        textarea.focus();
    }
    
    /**
     * 텍스트 삽입
     */
    function insertText(textarea, text) {
        const pos = textarea.selectionStart;
        textarea.value = textarea.value.substring(0, pos) + text + textarea.value.substring(pos);
        
        textarea.selectionStart = pos + text.length;
        textarea.selectionEnd = pos + text.length;
        textarea.focus();
    }
    
    /**
     * 날짜별 메모 저장 (개선된 버전)
     */
    function saveToDateMemo() {
        const textarea = document.querySelector('#stickyTextarea');
        
        if (!textarea) {
            console.error('❌ 텍스트 영역을 찾을 수 없습니다');
            return;
        }
        
        const content = textarea.textContent.trim();
        if (!content) {
            alert('저장할 내용을 입력해주세요.');
            return;
        }
        
        // 현재 날짜 자동 설정
        const now = new Date();
        const selectedDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
        
        // 첫째 줄과 둘째 줄 분리
        const lines = content.split('\n');
        const title = lines[0]?.trim() || '제목 없음';
        const memoContent = lines.slice(1).join('\n').trim() || content;
        
        console.log('💾 저장 시도:', { title, content: memoContent, date: selectedDate });
        
        // 우선 순위 1: unified-memo-system의 addMemo 함수 사용
        if (typeof window.addMemo === 'function') {
            try {
                const savedMemo = window.addMemo(title, memoContent, selectedDate);
                
                updateSaveStatus(`오늘(${selectedDate})에 저장됨!`);
                
                // 성공 메시지
                setTimeout(() => {
                    if (confirm(`"${title}"이(가) 오늘(${selectedDate})에 저장되었습니다.\n\n스티커 메모를 지우시겠습니까?`)) {
                        textarea.innerHTML = '';
                        localStorage.removeItem('stickyMemoContent');
                        updateSaveStatus('저장 후 지워짐');
                    }
                }, 500);
                
                console.log('✅ unified-memo-system으로 메모 저장 성공:', savedMemo);
                return;
            } catch (error) {
                console.warn('⚠️ unified-memo-system 저장 실패, 백업 방식 시도:', error);
            }
        }
        
        // 우선 순위 2: MemoSystem 직접 접근
        if (window.MemoSystem && window.MemoSystem.data) {
            try {
                const memo = {
                    id: Date.now(),
                    title: title,
                    content: memoContent,
                    date: selectedDate,
                    timestamp: new Date().toISOString()
                };
                
                window.MemoSystem.data.unshift(memo);
                
                // localStorage 저장
                if (typeof window.safelyStoreData === 'function') {
                    window.safelyStoreData('calendarMemos', window.MemoSystem.data);
                } else {
                    localStorage.setItem('calendarMemos', JSON.stringify(window.MemoSystem.data));
                }
                
                // UI 새로고침
                if (window.updateCalendarDisplay) {
                    window.updateCalendarDisplay();
                }
                
                updateSaveStatus(`오늘(${selectedDate})에 저장됨!`);
                
                setTimeout(() => {
                    if (confirm(`"${title}"이(가) 오늘(${selectedDate})에 저장되었습니다.\n\n스티커 메모를 지우시겠습니까?`)) {
                        textarea.innerHTML = '';
                        localStorage.removeItem('stickyMemoContent');
                        updateSaveStatus('저장 후 지워짐');
                    }
                }, 500);
                
                console.log('✅ MemoSystem 직접 저장 성공:', memo);
                return;
            } catch (error) {
                console.warn('⚠️ MemoSystem 직접 저장 실패, 레거시 방식 시도:', error);
            }
        }
        
        // 우선 순위 3: 레거시 백업 저장 방식
        try {
            const dateKey = selectedDate.replace(/-/g, ''); // YYYYMMDD
            
            const newMemo = {
                id: Date.now(),
                title: title,
                content: memoContent,
                date: selectedDate,
                time: now.toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                }),
                type: 'sticky-date'
            };
            
            // calendarMemos에 저장 (통합 방식)
            let allMemos = JSON.parse(localStorage.getItem('calendarMemos') || '[]');
            allMemos.unshift(newMemo);
            localStorage.setItem('calendarMemos', JSON.stringify(allMemos));
            
            // 날짜별 메모 저장 (호환성)
            let dateMemos = JSON.parse(localStorage.getItem(`memos_${dateKey}`) || '[]');
            dateMemos.push(newMemo);
            localStorage.setItem(`memos_${dateKey}`, JSON.stringify(dateMemos));
            
            // 전체 메모 목록에도 추가 (호환성)
            let legacyMemos = JSON.parse(localStorage.getItem('memos') || '[]');
            legacyMemos.unshift(newMemo);
            localStorage.setItem('memos', JSON.stringify(legacyMemos));
            
            // 달력 업데이트
            if (window.updateCalendarDisplay) {
                window.updateCalendarDisplay();
            }
            
            updateSaveStatus(`오늘(${selectedDate})에 저장됨!`);
            
            setTimeout(() => {
                if (confirm(`"${title}"이(가) 오늘(${selectedDate})에 저장되었습니다.\n\n스티커 메모를 지우시겠습니까?`)) {
                    textarea.innerHTML = '';
                    localStorage.removeItem('stickyMemoContent');
                    updateSaveStatus('저장 후 지워짐');
                }
            }, 500);
            
            console.log('✅ 레거시 방식으로 메모 저장 성공:', newMemo);
        } catch (error) {
            console.error('❌ 모든 저장 방식 실패:', error);
            alert('메모 저장에 실패했습니다. 콘솔을 확인해주세요.');
        }
    }
    
    /**
     * 텍스트 입력 처리
     */
    function handleTextInput(e) {
        const textarea = e.target;
        const charCount = textarea.textContent.length;
        
        // 글자 수 업데이트
        const countElement = document.querySelector('.char-count');
        if (countElement) {
            countElement.textContent = `${charCount} 글자`;
        }
    }
    
    /**
     * 저장 상태 업데이트
     */
    function updateSaveStatus(status) {
        const statusElement = document.querySelector('.save-status');
        if (statusElement) {
            statusElement.textContent = status;
            statusElement.style.animation = 'pulse 0.5s';
            
            setTimeout(() => {
                statusElement.style.animation = '';
            }, 500);
        }
    }
    
    /**
     * 디바운스 유틸리티
     */
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
    
    /**
     * openStickyMemo 재정의
     */
    window.openStickyMemo = function() {
        console.log('📝 스티커 메모 열기');
        showStickyMemo();
    };
    
    /**
     * CSS 추가 (개선된 스타일)
     */
    function addStyles() {
        if (document.getElementById('sticky-enhanced-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'sticky-enhanced-styles';
        style.textContent = `
            /* 스티커 메모 기본 스타일 */
            #stickyMemo {
                font-family: 'Malgun Gothic', sans-serif;
                user-select: none;
                transition: all 0.3s ease;
                box-sizing: border-box;
            }
            
            /* 헤더 스타일 */
            .sticky-memo-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 16px;
                background: rgba(255, 193, 7, 0.2);
                border-bottom: 1px solid rgba(255, 193, 7, 0.3);
                border-radius: 12px 12px 0 0;
                flex-shrink: 0;
            }
            
            .sticky-memo-title {
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: bold;
                color: #f57c00;
                font-size: 14px;
            }
            
            .sticky-memo-controls {
                display: flex;
                gap: 5px;
            }
            
            .control-btn {
                width: 24px;
                height: 24px;
                border: none;
                background: transparent;
                cursor: pointer;
                border-radius: 4px;
                transition: all 0.2s;
                font-size: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .control-btn:hover {
                background: rgba(0, 0, 0, 0.1);
            }
            
            .close-btn:hover {
                background: #ff5252;
                color: white;
            }
            
            /* 개선된 툴바 스타일 */
            .sticky-memo-toolbar {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 10px 16px;
                background: rgba(255, 193, 7, 0.1);
                border-bottom: 1px solid rgba(255, 193, 7, 0.2);
                flex-wrap: wrap;
                flex-shrink: 0;
            }
            
            .toolbar-btn {
                padding: 6px 10px;
                border: none;
                background: transparent;
                cursor: pointer;
                border-radius: 4px;
                transition: all 0.2s;
                font-size: 12px;
                min-width: 28px;
                height: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .toolbar-btn:hover {
                background: rgba(255, 193, 7, 0.3);
            }
            
            .reset-btn:hover {
                background: rgba(76, 175, 80, 0.2);
            }
            
            .toolbar-separator {
                color: rgba(0, 0, 0, 0.2);
                margin: 0 5px;
                font-size: 16px;
            }
            
            /* 색상 컨트롤 스타일 */
            .color-controls {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .color-control {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 2px;
                cursor: pointer;
                position: relative;
            }
            
            .color-label {
                font-size: 12px;
                font-weight: bold;
                color: #666;
            }
            
            .bg-icon {
                font-size: 10px;
            }
            
            .color-control input[type="color"] {
                width: 24px;
                height: 20px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                padding: 0;
                background: transparent;
            }
            
            .color-control input[type="color"]::-webkit-color-swatch-wrapper {
                padding: 0;
                border-radius: 4px;
            }
            
            .color-control input[type="color"]::-webkit-color-swatch {
                border: 1px solid rgba(0, 0, 0, 0.2);
                border-radius: 3px;
            }
            
            /* 컨텐츠 영역 */
            .sticky-memo-content {
                flex: 1;
                padding: 16px;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }
            
            .sticky-memo-textarea {
                width: 100%;
                height: 100%;
                border: none;
                background: transparent;
                outline: none;
                font-size: 14px;
                line-height: 1.6;
                font-family: inherit;
                box-sizing: border-box;
                overflow-y: auto;
                white-space: pre-wrap;
                word-wrap: break-word;
                padding: 8px;
            }
            
            .sticky-memo-textarea:empty::before {
                content: attr(data-placeholder);
                color: #999;
                white-space: pre-line;
            }
            
            .sticky-memo-textarea:focus:empty::before {
                content: '';
            }
            
            /* 색상 입력 모드 스타일 */
            .color-input-mode {
                border: 2px dashed rgba(255, 193, 7, 0.5);
                padding: 2px 4px;
                border-radius: 3px;
                background: rgba(255, 255, 255, 0.1);
                animation: colorModeGlow 2s infinite;
            }
            
            .bg-color-input-mode {
                border: 2px dashed rgba(255, 193, 7, 0.5);
                padding: 2px 4px;
                border-radius: 3px;
                animation: colorModeGlow 2s infinite;
            }
            
            @keyframes colorModeGlow {
                0%, 100% { 
                    border-color: rgba(255, 193, 7, 0.5);
                    box-shadow: 0 0 5px rgba(255, 193, 7, 0.3);
                }
                50% { 
                    border-color: rgba(255, 193, 7, 0.8);
                    box-shadow: 0 0 10px rgba(255, 193, 7, 0.5);
                }
            }
            
            /* 푸터 스타일 */
            .sticky-memo-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 16px;
                background: rgba(255, 193, 7, 0.1);
                border-top: 1px solid rgba(255, 193, 7, 0.2);
                border-radius: 0 0 12px 12px;
                font-size: 12px;
                color: #666;
                flex-shrink: 0;
            }
            
            .footer-left {
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .footer-right {
                display: flex;
                gap: 8px;
            }
            
            .footer-btn {
                padding: 8px 12px;
                border: none;
                background: rgba(255, 193, 7, 0.2);
                border: 1px solid rgba(255, 193, 7, 0.4);
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
                color: #333;
                transition: all 0.2s;
                font-weight: 500;
            }
            
            .footer-btn:hover {
                background: rgba(255, 193, 7, 0.4);
                transform: translateY(-1px);
                box-shadow: 0 2px 8px rgba(255, 193, 7, 0.3);
            }
            
            .footer-btn:active {
                transform: translateY(0);
            }
            
            /* 리사이즈 핸들 */
            .resize-handle {
                position: absolute;
                bottom: 0;
                right: 0;
                width: 20px;
                height: 20px;
                cursor: nwse-resize;
                background: linear-gradient(135deg, transparent 50%, rgba(255, 193, 7, 0.5) 50%);
                border-radius: 0 0 12px 0;
            }
            
            /* 애니메이션 */
            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
            }
            
            /* 최대화 상태 */
            #stickyMemo.maximized {
                border-radius: 0 !important;
            }
            
            /* 반응형 대응 */
            @media (max-width: 768px) {
                .sticky-memo-toolbar {
                    padding: 8px 12px;
                    gap: 6px;
                }
                
                .toolbar-btn {
                    padding: 4px 6px;
                    min-width: 24px;
                    height: 24px;
                    font-size: 11px;
                }
                
                .color-control input[type="color"] {
                    width: 20px;
                    height: 18px;
                }
                
                .footer-btn {
                    padding: 6px 10px;
                    font-size: 11px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * 초기화
     */
    function init() {
        console.log('✨ 스티커 메모 완전 개선 버전 초기화');
        
        // 스타일 추가
        addStyles();
        
        // 저장된 크기 복원
        const savedSize = localStorage.getItem('stickyMemoSize');
        if (savedSize) {
            try {
                window.stickyMemoState.size = JSON.parse(savedSize);
            } catch (e) {
                console.error('크기 복원 실패:', e);
            }
        }
        
        console.log('✅ 스티커 메모 완전 개선 버전 준비 완료');
    }
    
    // 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // 디버그 함수
    window.debugStickyMemo = function() {
        console.group('📝 스티커 메모 상태');
        console.log('상태:', window.stickyMemoState);
        console.log('요소:', document.getElementById('stickyMemo'));
        console.log('저장된 내용:', localStorage.getItem('stickyMemoContent'));
        console.log('저장된 위치:', localStorage.getItem('stickyMemoPosition'));
        console.log('저장된 크기:', localStorage.getItem('stickyMemoSize'));
        console.log('addMemo 함수:', typeof window.addMemo);
        console.log('MemoSystem:', window.MemoSystem);
        console.groupEnd();
    };
    
    console.log('✨ 스티커 메모 완전 개선 버전 로드 완료');
    console.log('🛠️ 명령어: debugStickyMemo()');
    console.log('🎯 개선사항:');
    console.log('  - 달력 저장 기능 수정 및 다중 백업');
    console.log('  - 가로 확대 제한 완전 제거');
    console.log('  - 체크박스 기능 제거');
    console.log('  - 글자색/배경색 기능 추가');
    console.log('  - 색상 초기화 기능 추가');
    console.log('  - 코드 정리 및 최적화');
    
})();