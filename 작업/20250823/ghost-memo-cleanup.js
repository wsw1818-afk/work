// 유령 메모 정리 시스템 - 삭제된 메모가 UI에 남아있는 문제 해결
(function() {
    'use strict';

    console.log('👻 유령 메모 정리 시스템 로드됨');

    // 유령 메모 감지 및 정리
    function cleanupGhostMemos() {
        console.log('🧹 유령 메모 정리 시작');
        
        // 현재 localStorage에서 실제 메모 데이터 가져오기
        let actualMemos = [];
        try {
            const stored = localStorage.getItem('calendarMemos');
            if (stored) {
                actualMemos = JSON.parse(stored);
            }
        } catch (error) {
            console.error('❌ localStorage 읽기 실패:', error);
            return;
        }

        const actualMemoIds = new Set(actualMemos.map(m => String(m.id)));
        console.log('📋 실제 메모 ID들:', Array.from(actualMemoIds));

        // 모든 메모 리스트에서 유령 메모 정리
        cleanupGhostMemosInList('memoList', actualMemoIds);
        cleanupGhostMemosInList('stickyMemoList', actualMemoIds);
        cleanupGhostMemosInList('dateMemoList', actualMemoIds);

        // 전역 변수도 동기화
        window.memos = actualMemos;
        window.allMemos = actualMemos;
        window.stickyMemos = actualMemos;

        console.log('✅ 유령 메모 정리 완료');
    }

    // 특정 리스트에서 유령 메모 정리
    function cleanupGhostMemosInList(listId, actualMemoIds) {
        const listElement = document.getElementById(listId);
        if (!listElement) {
            console.warn(`⚠️ ${listId} 요소를 찾을 수 없습니다.`);
            return;
        }

        const memoItems = listElement.querySelectorAll('.memo-item');
        let removedCount = 0;

        memoItems.forEach(item => {
            // onclick 속성에서 메모 ID 추출
            const onclickAttr = item.getAttribute('onclick');
            if (onclickAttr) {
                const match = onclickAttr.match(/openMemoDetail\((\d+)\)/);
                if (match) {
                    const memoId = match[1];
                    
                    // 실제 메모에 없으면 유령 메모이므로 제거
                    if (!actualMemoIds.has(memoId)) {
                        console.log(`👻 유령 메모 발견 및 제거: ${listId} - ID ${memoId}`);
                        item.remove();
                        removedCount++;
                    }
                }
            }
        });

        if (removedCount > 0) {
            console.log(`🧹 ${listId}에서 ${removedCount}개 유령 메모 제거됨`);
        }

        // 메모가 모두 사라졌으면 빈 상태 메시지 표시
        const remainingItems = listElement.querySelectorAll('.memo-item');
        if (remainingItems.length === 0) {
            const emptyMessage = '<div style="text-align: center; color: #999; padding: 20px;">저장된 메모가 없습니다</div>';
            listElement.innerHTML = emptyMessage;
        }
    }

    // 메모 삭제 후 즉시 정리하는 함수
    function createCleanupDeleteMemo() {
        const originalDeleteMemo = window.deleteMemo;
        
        window.deleteMemo = function(id) {
            console.log('🗑️ 정리 시스템 - 메모 삭제, ID:', id);
            
            // 원본 삭제 함수 실행
            if (originalDeleteMemo) {
                originalDeleteMemo.call(this, id);
            }
            
            // 즉시 유령 메모 정리
            setTimeout(() => {
                cleanupGhostMemos();
                
                // 리스트들 새로 고침
                refreshAllLists();
            }, 200);
        };

        console.log('✅ 정리 시스템 deleteMemo 함수로 교체 완료');
    }

    // 모든 리스트 강제 새로고침
    function refreshAllLists() {
        console.log('🔄 모든 리스트 강제 새로고침');
        
        try {
            // localStorage에서 최신 데이터 다시 로드
            const stored = localStorage.getItem('calendarMemos');
            const memos = stored ? JSON.parse(stored) : [];
            
            // 전역 변수 동기화
            window.memos = memos;
            window.allMemos = memos;
            window.stickyMemos = memos;
            
            // 각 리스트 새로고침
            if (window.loadMemos) {
                try { window.loadMemos(); } catch (e) { console.error('loadMemos 오류:', e); }
            }
            
            if (window.displayStickyMemos) {
                try { window.displayStickyMemos(); } catch (e) { console.error('displayStickyMemos 오류:', e); }
            }
            
            if (window.displayDateMemos) {
                try { window.displayDateMemos(); } catch (e) { console.error('displayDateMemos 오류:', e); }
            }
            
            // 달력도 업데이트
            if (window.updateCalendarDisplay) {
                try { window.updateCalendarDisplay(); } catch (e) { console.error('updateCalendarDisplay 오류:', e); }
            }
            
        } catch (error) {
            console.error('❌ 리스트 새로고침 오류:', error);
        }

        // 유령 메모 재정리 (혹시 남아있을 수 있음)
        setTimeout(() => {
            cleanupGhostMemos();
        }, 300);
    }

    // DOM 변경 감지 및 자동 정리
    function setupAutoCleanup() {
        const observer = new MutationObserver((mutations) => {
            let shouldCleanup = false;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    // 메모 관련 요소가 추가되었는지 확인
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1 && (
                            node.classList?.contains('memo-item') || 
                            node.querySelector?.('.memo-item')
                        )) {
                            shouldCleanup = true;
                        }
                    });
                }
            });
            
            if (shouldCleanup) {
                // 지연 실행으로 DOM 변경이 완료된 후 정리
                setTimeout(() => {
                    cleanupGhostMemos();
                }, 500);
            }
        });

        // 모든 메모 리스트 감시
        ['memoList', 'stickyMemoList', 'dateMemoList'].forEach(listId => {
            const element = document.getElementById(listId);
            if (element) {
                observer.observe(element, {
                    childList: true,
                    subtree: true
                });
                console.log(`👁️ ${listId} 자동 정리 감시 시작`);
            }
        });
    }

    // 수동 정리 도구들
    function addCleanupDebugTools() {
        // 유령 메모 수동 정리
        window.cleanupGhostMemos = function() {
            console.log('🧹 수동 유령 메모 정리 실행');
            cleanupGhostMemos();
            return '✅ 유령 메모 정리 완료';
        };

        // 모든 리스트 강제 새로고침
        window.forceRefreshAllLists = function() {
            console.log('🔄 강제 전체 리스트 새로고침');
            refreshAllLists();
            return '✅ 모든 리스트 새로고침 완료';
        };

        // 메모 상태 진단
        window.diagnoseMemoState = function() {
            console.log('=== 🔍 메모 상태 진단 ===');
            
            // localStorage 메모
            let storedMemos = [];
            try {
                const stored = localStorage.getItem('calendarMemos');
                storedMemos = stored ? JSON.parse(stored) : [];
            } catch (e) {}
            
            console.log('💾 localStorage 메모:', storedMemos.length, '개');
            console.log('🌍 window.memos:', (window.memos || []).length, '개');
            console.log('📱 window.allMemos:', (window.allMemos || []).length, '개');
            
            // UI 메모 개수
            ['memoList', 'stickyMemoList', 'dateMemoList'].forEach(listId => {
                const element = document.getElementById(listId);
                if (element) {
                    const count = element.querySelectorAll('.memo-item').length;
                    console.log(`📋 ${listId}: ${count}개 표시됨`);
                }
            });
            
            return {
                localStorage: storedMemos.length,
                windowMemos: (window.memos || []).length,
                windowAllMemos: (window.allMemos || []).length
            };
        };

        console.log('✅ 유령 메모 정리 디버깅 도구 추가');
        console.log('🛠️ 명령어: cleanupGhostMemos(), forceRefreshAllLists(), diagnoseMemoState()');
    }

    // 초기화
    function initialize() {
        console.log('👻 유령 메모 정리 시스템 초기화');
        
        // 초기 정리 실행
        cleanupGhostMemos();
        
        // 정리 시스템이 포함된 삭제 함수로 교체
        createCleanupDeleteMemo();
        
        // 자동 정리 시스템 설정
        setupAutoCleanup();
        
        // 디버깅 도구 추가
        addCleanupDebugTools();
        
        console.log('✅ 유령 메모 정리 시스템 초기화 완료');
        console.log('👻 이제 삭제된 메모가 UI에 남아있지 않습니다');
    }

    // DOM 로드 완료 후 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    // 즉시 초기화
    initialize();

    // 지연 초기화 (다른 스크립트들이 완전히 로드된 후)
    setTimeout(initialize, 3000);

})();