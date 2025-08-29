// DOM 안전성 수정 스크립트
(function() {
    'use strict';

    console.log('🛡️ DOM 안전성 수정 스크립트 로드됨');

    // 안전한 DOM 요소 접근 함수
    function safeGetElement(id, context = 'DOM 요소') {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`⚠️ ${context}: '${id}' 요소를 찾을 수 없습니다.`);
        }
        return element;
    }

    // loadMemos 함수를 안전하게 교체
    function createSafeLoadMemos() {
        const originalLoadMemos = window.loadMemos;
        
        window.loadMemos = function() {
            console.log('📋 loadMemos 호출됨 (안전한 버전)');
            
            const memoList = safeGetElement('memoList', '메모 리스트');
            if (!memoList) {
                console.warn('memoList 요소가 없어 loadMemos를 건너뜁니다.');
                return;
            }

            // localStorage에서 직접 메모 데이터 확인
            let memos = [];
            try {
                const stored = localStorage.getItem('calendarMemos');
                if (stored) {
                    memos = JSON.parse(stored);
                } else {
                    memos = window.memos || [];
                }
            } catch (error) {
                console.error('localStorage 읽기 실패:', error);
                memos = window.memos || [];
            }
            
            console.log('현재 메모 개수:', memos.length);
            
            if (memos.length === 0) {
                memoList.innerHTML = '<div style="text-align: center; color: #999; padding: 20px;">저장된 메모가 없습니다</div>';
                console.log('✅ 빈 메모 리스트 표시 완료');
                return;
            }

            // 잠금 상태 확인
            const isMemosUnlocked = window.isMemosUnlocked || false;
            
            try {
                const memoHTML = memos.map(memo => {
                    if (!memo || !memo.id) {
                        console.warn('유효하지 않은 메모 데이터:', memo);
                        return '';
                    }
                    
                    return `
                        <div class="memo-item ${isMemosUnlocked ? 'unlocked' : ''}" onclick="openMemoDetail(${memo.id})">
                            <div class="memo-item-title">${memo.title || '제목 없음'}</div>
                            <div class="memo-item-content">${(memo.content || '').substring(0, 100)}${(memo.content || '').length > 100 ? '...' : ''}</div>
                            <div class="memo-item-date">${memo.date || '날짜 없음'}</div>
                            <div class="memo-item-preview">클릭하여 보기</div>
                            <button class="memo-item-delete ${isMemosUnlocked ? 'visible' : ''}" onclick="event.stopPropagation(); deleteMemoFromList(${memo.id})">✕</button>
                        </div>
                    `;
                }).filter(html => html).join('');
                
                memoList.innerHTML = memoHTML;
                console.log('✅ 메모 리스트 업데이트 완료:', memos.length, '개');
                
            } catch (error) {
                console.error('❌ 메모 리스트 업데이트 오류:', error);
                memoList.innerHTML = '<div style="text-align: center; color: #ff6b6b; padding: 20px;">메모 표시 중 오류가 발생했습니다.</div>';
            }
        };

        console.log('✅ 안전한 loadMemos 함수로 교체 완료');
    }

    // displayStickyMemos 함수도 안전하게 교체
    function createSafeDisplayStickyMemos() {
        const originalDisplayStickyMemos = window.displayStickyMemos;
        
        window.displayStickyMemos = function() {
            console.log('📌 displayStickyMemos 호출됨 (안전한 버전)');
            
            const memoList = safeGetElement('stickyMemoList', '스티커 메모 리스트');
            if (!memoList) {
                console.warn('stickyMemoList 요소가 없어 displayStickyMemos를 건너뜁니다.');
                return;
            }

            // localStorage에서 직접 메모 데이터 확인
            let memos = [];
            try {
                const stored = localStorage.getItem('calendarMemos');
                if (stored) {
                    memos = JSON.parse(stored);
                } else {
                    memos = window.memos || [];
                }
            } catch (error) {
                console.error('localStorage 읽기 실패:', error);
                memos = window.memos || [];
            }
            
            const isMemosUnlocked = window.isMemosUnlocked || false;
            
            if (memos.length === 0) {
                memoList.innerHTML = '<div style="text-align: center; color: #999; padding: 20px;">저장된 메모가 없습니다</div>';
                console.log('✅ 빈 스티커 메모 리스트 표시 완료');
                return;
            }

            try {
                const memoHTML = memos.map(memo => {
                    if (!memo || !memo.id) return '';
                    
                    return `
                        <div class="memo-item ${isMemosUnlocked ? 'unlocked' : ''}" onclick="openMemoDetail(${memo.id})">
                            <div class="memo-item-title">${memo.title || '제목 없음'}</div>
                            <div class="memo-item-content">${(memo.content || '').substring(0, 100)}${(memo.content || '').length > 100 ? '...' : ''}</div>
                            <div class="memo-item-date">${memo.date || '날짜 없음'}</div>
                            <div class="memo-item-preview">클릭하여 보기</div>
                            <button class="memo-item-delete ${isMemosUnlocked ? 'visible' : ''}" onclick="event.stopPropagation(); deleteMemoFromList(${memo.id})">✕</button>
                        </div>
                    `;
                }).filter(html => html).join('');
                
                memoList.innerHTML = memoHTML;
                console.log('✅ 스티커 메모 리스트 업데이트 완료:', memos.length, '개');
                
            } catch (error) {
                console.error('❌ 스티커 메모 리스트 업데이트 오류:', error);
                memoList.innerHTML = '<div style="text-align: center; color: #ff6b6b; padding: 20px;">메모 표시 중 오류가 발생했습니다.</div>';
            }
        };

        console.log('✅ 안전한 displayStickyMemos 함수로 교체 완료');
    }

    // displayDateMemos 함수도 안전하게 교체
    function createSafeDisplayDateMemos() {
        const originalDisplayDateMemos = window.displayDateMemos;
        
        window.displayDateMemos = function() {
            console.log('📅 displayDateMemos 호출됨 (안전한 버전)');
            
            const dateMemoList = safeGetElement('dateMemoList', '날짜별 메모 리스트');
            if (!dateMemoList) {
                console.warn('dateMemoList 요소가 없어 displayDateMemos를 건너뜁니다.');
                return;
            }

            // 선택된 날짜 확인
            const selectedDate = window.selectedDate;
            if (!selectedDate) {
                console.warn('선택된 날짜가 없습니다.');
                dateMemoList.innerHTML = '<div style="text-align: center; color: #999; padding: 20px;">날짜를 선택하세요</div>';
                return;
            }

            // localStorage에서 직접 메모 데이터 확인
            let memos = [];
            try {
                const stored = localStorage.getItem('calendarMemos');
                if (stored) {
                    memos = JSON.parse(stored);
                } else {
                    memos = window.memos || [];
                }
            } catch (error) {
                console.error('localStorage 읽기 실패:', error);
                memos = window.memos || [];
            }
            
            const dateMemos = memos.filter(memo => memo.date === selectedDate);
            const isDateMemosUnlocked = window.isDateMemosUnlocked || false;
            
            if (dateMemos.length === 0) {
                dateMemoList.innerHTML = '<div style="text-align: center; color: #999; padding: 20px;">이 날짜에 저장된 메모가 없습니다</div>';
                console.log('✅ 빈 날짜별 메모 리스트 표시 완료');
                return;
            }

            try {
                const memoHTML = dateMemos.map(memo => {
                    if (!memo || !memo.id) return '';
                    
                    return `
                        <div class="memo-item ${isDateMemosUnlocked ? 'unlocked' : ''}" onclick="openMemoDetail(${memo.id})">
                            <div class="memo-item-title">${memo.title || '제목 없음'}</div>
                            <div class="memo-item-content">${(memo.content || '').substring(0, 100)}${(memo.content || '').length > 100 ? '...' : ''}</div>
                            <div class="memo-item-date">${memo.date || '날짜 없음'}</div>
                            <div class="memo-item-preview">클릭하여 보기</div>
                            <button class="memo-item-delete ${isDateMemosUnlocked ? 'visible' : ''}" onclick="event.stopPropagation(); deleteMemoFromList(${memo.id})">✕</button>
                        </div>
                    `;
                }).filter(html => html).join('');
                
                dateMemoList.innerHTML = memoHTML;
                console.log('✅ 날짜별 메모 리스트 업데이트 완료:', dateMemos.length, '개');
                
            } catch (error) {
                console.error('❌ 날짜별 메모 리스트 업데이트 오류:', error);
                dateMemoList.innerHTML = '<div style="text-align: center; color: #ff6b6b; padding: 20px;">메모 표시 중 오류가 발생했습니다.</div>';
            }
        };

        console.log('✅ 안전한 displayDateMemos 함수로 교체 완료');
    }

    // deleteMemo 함수를 안전하게 교체
    function createSafeDeleteMemo() {
        const originalDeleteMemo = window.deleteMemo;
        
        window.deleteMemo = function(id) {
            console.log('🗑️ deleteMemo 호출됨 (안전한 버전), ID:', id);
            
            // 메모 데이터 확인 및 삭제
            const memos = window.memos || [];
            const beforeCount = memos.length;
            
            window.memos = memos.filter(m => m.id != id); // != 사용 (타입 변환 허용)
            const afterCount = window.memos.length;
            
            if (beforeCount === afterCount) {
                console.warn('⚠️ 삭제할 메모를 찾지 못했습니다. ID:', id);
                console.log('사용 가능한 메모 ID들:', memos.map(m => m.id));
            } else {
                console.log('✅ 메모 삭제 완료. 변경:', beforeCount, '→', afterCount);
                
                // localStorage 업데이트
                try {
                    localStorage.setItem('calendarMemos', JSON.stringify(window.memos));
                    console.log('✅ localStorage 업데이트 완료');
                } catch (error) {
                    console.error('❌ localStorage 업데이트 오류:', error);
                }
            }
            
            // UI 업데이트 (안전하게)
            setTimeout(() => {
                if (window.loadMemos) {
                    try {
                        window.loadMemos();
                    } catch (error) {
                        console.error('❌ loadMemos 업데이트 오류:', error);
                    }
                }
                
                if (window.displayDateMemos) {
                    try {
                        window.displayDateMemos();
                    } catch (error) {
                        console.error('❌ displayDateMemos 업데이트 오류:', error);
                    }
                }
                
                if (window.displayStickyMemos) {
                    try {
                        window.displayStickyMemos();
                    } catch (error) {
                        console.error('❌ displayStickyMemos 업데이트 오류:', error);
                    }
                }
                
                if (window.updateCalendarDisplay) {
                    try {
                        window.updateCalendarDisplay();
                    } catch (error) {
                        console.error('❌ updateCalendarDisplay 업데이트 오류:', error);
                    }
                }
            }, 100);
        };

        console.log('✅ 안전한 deleteMemo 함수로 교체 완료');
    }

    // DOM 요소 존재 확인 및 생성
    function ensureDOMElements() {
        const requiredElements = [
            { id: 'memoList', type: 'div', className: 'memo-list', context: '메모 리스트' },
            { id: 'stickyMemoList', type: 'div', className: 'memo-list', context: '스티커 메모 리스트' },
            { id: 'dateMemoList', type: 'div', className: 'memo-list', context: '날짜별 메모 리스트' }
        ];

        requiredElements.forEach(({ id, type, className, context }) => {
            let element = document.getElementById(id);
            
            if (!element) {
                console.warn(`⚠️ ${context} 요소(${id})가 없어서 생성합니다.`);
                
                element = document.createElement(type);
                element.id = id;
                element.className = className;
                element.innerHTML = `<div style="text-align: center; color: #999; padding: 20px;">${context} 로딩 중...</div>`;
                
                // 적절한 위치에 추가 (body의 끝에 임시로)
                document.body.appendChild(element);
                
                console.log(`✅ ${context} 요소 생성 완료`);
            } else {
                console.log(`✅ ${context} 요소 존재 확인됨`);
            }
        });
    }

    // 전역 오류 핸들러에 DOM 관련 오류 처리 추가
    function enhanceErrorHandling() {
        const originalErrorHandler = window.onerror;
        
        window.onerror = function(message, source, lineno, colno, error) {
            // DOM 관련 오류 특별 처리
            if (message && message.includes('Cannot set properties of null')) {
                console.warn('🛡️ DOM null 오류 감지됨, 요소 존재 확인 중...');
                
                setTimeout(() => {
                    ensureDOMElements();
                }, 100);
                
                return true; // 오류 처리함
            }
            
            // 다른 오류는 기존 핸들러에게
            if (originalErrorHandler) {
                return originalErrorHandler.call(this, message, source, lineno, colno, error);
            }
            
            return false;
        };
    }

    // 디버깅 도구
    function addDOMDebugTools() {
        window.checkDOMElements = function() {
            console.log('=== 🔍 DOM 요소 확인 ===');
            
            const elements = ['memoList', 'stickyMemoList', 'dateMemoList'];
            
            elements.forEach(id => {
                const element = document.getElementById(id);
                console.log(`${id}:`, element ? '✅ 존재' : '❌ 없음');
                
                if (element) {
                    console.log(`  - 내용 길이: ${element.innerHTML.length}`);
                    console.log(`  - 클래스: ${element.className}`);
                }
            });
        };

        window.refreshAllMemoLists = function() {
            console.log('🔄 모든 메모 리스트 새로고침');
            
            try {
                if (window.loadMemos) window.loadMemos();
                if (window.displayStickyMemos) window.displayStickyMemos();
                if (window.displayDateMemos) window.displayDateMemos();
                console.log('✅ 모든 메모 리스트 새로고침 완료');
            } catch (error) {
                console.error('❌ 메모 리스트 새로고침 오류:', error);
            }
        };

        console.log('✅ DOM 디버깅 도구 추가: checkDOMElements(), refreshAllMemoLists()');
    }

    // 초기화
    function initialize() {
        console.log('🛡️ DOM 안전성 시스템 초기화');
        
        // DOM 요소 존재 확인 및 생성
        ensureDOMElements();
        
        // 안전한 함수들로 교체
        createSafeLoadMemos();
        createSafeDisplayStickyMemos();
        createSafeDisplayDateMemos();
        createSafeDeleteMemo();
        
        // 오류 처리 강화
        enhanceErrorHandling();
        
        // 디버깅 도구 추가
        addDOMDebugTools();
        
        console.log('✅ DOM 안전성 시스템 초기화 완료');
        console.log('🛠️ 디버깅: checkDOMElements(), refreshAllMemoLists()');
    }

    // DOM 로드 완료 후 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    // 지연 초기화
    setTimeout(initialize, 1000);

})();