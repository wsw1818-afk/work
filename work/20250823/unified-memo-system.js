// 통합 메모 관리 시스템 - 모든 메모 관련 문제 해결
(function() {
    'use strict';

    console.log('🎯 통합 메모 관리 시스템 로드됨');

    // ===== 전역 상태 관리 =====
    const MemoSystem = {
        data: [],  // 실제 메모 데이터 (단일 소스)
        locks: {
            memos: true,      // 기본 잠금 상태
            dateMemos: true,  // 기본 잠금 상태
            stickyMemos: true // 기본 잠금 상태
        },
        selectedDate: null,
        currentDetailId: null,
        initialized: false
    };

    // ===== 데이터 관리 함수 =====
    
    // localStorage 또는 IndexedDB에서 메모 로드
    async function loadMemosFromStorage() {
        // 먼저 localStorage에서 시도 (작은 데이터)
        const localData = localStorage.getItem('calendarMemos');
        if (localData) {
            try {
                const parsedData = JSON.parse(localData);
                if (parsedData && parsedData.length > 0) {
                    MemoSystem.data = parsedData;
                    console.log(`✅ 메모 로드 완료 (localStorage): ${MemoSystem.data.length}개`);
                    
                    // 전역 변수 동기화
                    window.memos = MemoSystem.data;
                    window.allMemos = MemoSystem.data;
                    window.stickyMemos = MemoSystem.data;
                    return;
                }
            } catch (error) {
                console.error('❌ localStorage 파싱 오류:', error);
            }
        }
        
        // localStorage에 데이터가 없거나 빈 배열이면 IndexedDB에서 시도
        console.log('📦 IndexedDB에서 메모 로드 시도...');
        try {
            const success = await loadMemosFromIndexedDB();
            if (!success) {
                // IndexedDB에도 없으면 빈 배열 설정
                if (!MemoSystem.data || MemoSystem.data.length === 0) {
                    MemoSystem.data = [];
                    console.log('📭 저장된 메모가 없습니다');
                }
                
                // 전역 변수 동기화
                window.memos = MemoSystem.data;
                window.allMemos = MemoSystem.data;
                window.stickyMemos = MemoSystem.data;
            }
        } catch (error) {
            console.error('❌ IndexedDB 로드 오류:', error);
            // 오류 발생 시에도 기존 데이터 유지
            if (!MemoSystem.data) {
                MemoSystem.data = [];
            }
            
            // 전역 변수 동기화
            window.memos = MemoSystem.data;
            window.allMemos = MemoSystem.data;
            window.stickyMemos = MemoSystem.data;
        }
    }

    // localStorage에서 메모 로드 (기존 방식)
    function loadMemosFromLocalStorage() {
        try {
            const stored = localStorage.getItem('calendarMemos');
            if (stored) {
                MemoSystem.data = JSON.parse(stored);
                console.log(`✅ 메모 로드 완료 (localStorage): ${MemoSystem.data.length}개`);
            } else {
                MemoSystem.data = [];
                console.log('📭 저장된 메모가 없습니다');
            }
        } catch (error) {
            console.error('❌ 메모 로드 실패:', error);
            MemoSystem.data = [];
        }
        
        // 전역 변수 동기화
        window.memos = MemoSystem.data;
        window.allMemos = MemoSystem.data;
        window.stickyMemos = MemoSystem.data;
    }

    // IndexedDB에서 메모 로드
    function loadMemosFromIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('MemoDatabase', 3);
            
            request.onsuccess = function(event) {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('memos')) {
                    resolve(false);
                    return;
                }
                
                const transaction = db.transaction(['memos'], 'readonly');
                const store = transaction.objectStore('memos');
                const getAllRequest = store.getAll();
                
                getAllRequest.onsuccess = function() {
                    const memos = getAllRequest.result;
                    if (memos && memos.length > 0) {
                        MemoSystem.data = memos;
                        
                        // 전역 변수 동기화
                        window.memos = MemoSystem.data;
                        window.allMemos = MemoSystem.data;
                        window.stickyMemos = MemoSystem.data;
                        
                        console.log(`✅ 메모 로드 완료 (IndexedDB): ${MemoSystem.data.length}개`);
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                };
                
                getAllRequest.onerror = function() {
                    resolve(false);
                };
            };
            
            request.onerror = function() {
                resolve(false);
            };
        });
    }

    // localStorage에 메모 저장
    function saveMemosToStorage() {
        try {
            // 큰 첨부파일이 있는지 확인
            const hasLargeFiles = MemoSystem.data.some(memo => 
                memo.attachments && memo.attachments.some(file => 
                    file.data && file.data.length > 2000000 // 2MB 이상의 Base64 데이터 (더 큰 파일도 localStorage 시도)
                )
            );

            if (hasLargeFiles) {
                // 큰 파일이 있으면 IndexedDB 사용
                saveMemosToIndexedDB();
            } else {
                // 작은 파일만 있으면 localStorage 사용
                localStorage.setItem('calendarMemos', JSON.stringify(MemoSystem.data));
                
                // 전역 변수 동기화
                window.memos = MemoSystem.data;
                window.allMemos = MemoSystem.data;
                window.stickyMemos = MemoSystem.data;
                
                console.log(`✅ 메모 저장 완료 (localStorage): ${MemoSystem.data.length}개`);
            }
            return true;
        } catch (error) {
            console.error('❌ 메모 저장 실패:', error);
            
            // 저장 실패 시 IndexedDB로 대체 시도
            if (error.name === 'QuotaExceededError') {
                console.log('📦 localStorage 용량 초과 - IndexedDB로 대체 저장 시도');
                saveMemosToIndexedDB();
                return true;
            }
            return false;
        }
    }

    // IndexedDB를 사용한 메모 저장
    function saveMemosToIndexedDB() {
        // 버전 3으로 증가하여 업그레이드 강제 실행 (큰 파일 지원 개선)
        const request = indexedDB.open('MemoDatabase', 3);
        
        request.onupgradeneeded = function(event) {
            const db = event.target.result;
            console.log(`🔄 IndexedDB 업그레이드 시작... (v${event.oldVersion} → v${event.newVersion})`);
            
            // 기존 객체 스토어가 있다면 삭제
            if (db.objectStoreNames.contains('memos')) {
                db.deleteObjectStore('memos');
                console.log('🗑️ 기존 memos 객체 스토어 삭제됨');
            }
            
            // 새 객체 스토어 생성 (큰 파일 지원 개선)
            const objectStore = db.createObjectStore('memos', { 
                keyPath: 'id',
                autoIncrement: false
            });
            
            // 인덱스 생성 (검색 성능 향상)
            objectStore.createIndex('date', 'date', { unique: false });
            objectStore.createIndex('timestamp', 'timestamp', { unique: false });
            
            console.log('✅ 새 memos 객체 스토어 생성됨 (v3 - 큰 파일 지원)');
        };
        
        request.onsuccess = function(event) {
            const db = event.target.result;
            console.log('🔄 IndexedDB 연결 성공, 버전:', db.version);
            
            // 객체 스토어가 존재하는지 확인
            if (!db.objectStoreNames.contains('memos')) {
                console.error('❌ 메모 객체 스토어를 찾을 수 없습니다');
                // localStorage로 폴백
                localStorage.setItem('calendarMemos', JSON.stringify(MemoSystem.data));
                console.log('📦 localStorage로 폴백 저장 완료');
                return;
            }
            
            try {
                const transaction = db.transaction(['memos'], 'readwrite');
                const store = transaction.objectStore('memos');
                
                // 기존 데이터 삭제 후 새로 저장
                store.clear().onsuccess = function() {
                    let addCount = 0;
                    let failCount = 0;
                    const totalMemos = MemoSystem.data.length;
                    
                    console.log(`📦 IndexedDB 저장 시작: ${totalMemos}개 메모`);
                    
                    MemoSystem.data.forEach((memo, index) => {
                        try {
                            const addRequest = store.add(memo);
                            
                            addRequest.onsuccess = function() {
                                addCount++;
                                console.log(`✅ 메모 ${index + 1}/${totalMemos} 저장 완료: ${memo.title} (첨부파일: ${memo.attachments ? memo.attachments.length : 0}개)`);
                                
                                if (addCount + failCount === totalMemos) {
                                    console.log(`📊 IndexedDB 저장 완료: 성공 ${addCount}개, 실패 ${failCount}개`);
                                }
                            };
                            
                            addRequest.onerror = function(error) {
                                failCount++;
                                console.error(`❌ 메모 ${index + 1} 저장 실패:`, memo.title, error);
                                
                                // 큰 파일이 있는 메모인지 확인
                                if (memo.attachments && memo.attachments.length > 0) {
                                    const totalSize = memo.attachments.reduce((sum, file) => 
                                        sum + (file.data ? file.data.length : 0), 0
                                    );
                                    console.error(`   첨부파일 총 크기: ${Math.round(totalSize / 1024 / 1024 * 100) / 100}MB`);
                                }
                                
                                if (addCount + failCount === totalMemos) {
                                    console.log(`📊 IndexedDB 저장 완료: 성공 ${addCount}개, 실패 ${failCount}개`);
                                }
                            };
                        } catch (error) {
                            failCount++;
                            console.error(`❌ 메모 ${index + 1} 저장 중 예외:`, memo.title, error);
                        }
                    });
                    
                    // 메모가 없는 경우 처리
                    if (totalMemos === 0) {
                        console.log('📦 저장할 메모가 없습니다');
                    }
                };
                
                transaction.oncomplete = function() {
                    // 전역 변수 동기화
                    window.memos = MemoSystem.data;
                    window.allMemos = MemoSystem.data;
                    window.stickyMemos = MemoSystem.data;
                    
                    console.log(`✅ 메모 저장 완료 (IndexedDB): ${MemoSystem.data.length}개`);
                    // 안전성을 위해 localStorage 데이터는 백업으로 유지
                };
                
                transaction.onerror = function(error) {
                    console.error('❌ IndexedDB 트랜잭션 저장 실패:', error);
                    
                    // IndexedDB 실패 시 localStorage로 폴백 시도
                    console.log('🔄 localStorage로 폴백 저장 시도...');
                    try {
                        localStorage.setItem('calendarMemos', JSON.stringify(MemoSystem.data));
                        console.log(`✅ localStorage 폴백 저장 완료: ${MemoSystem.data.length}개`);
                        
                        // 전역 변수 동기화
                        window.memos = MemoSystem.data;
                        window.allMemos = MemoSystem.data;
                        window.stickyMemos = MemoSystem.data;
                    } catch (localError) {
                        console.error('❌ localStorage 폴백도 실패:', localError);
                        alert('메모 저장에 실패했습니다. 파일 크기가 너무 클 수 있습니다.');
                    }
                };
            } catch (error) {
                console.error('❌ IndexedDB 트랜잭션 생성 실패:', error);
                alert('데이터베이스 연결 오류가 발생했습니다.');
            }
        };
        
        request.onerror = function(error) {
            console.error('❌ IndexedDB 열기 실패:', error);
            alert('메모 저장 중 오류가 발생했습니다.');
        };
    }

    // ===== 메모 CRUD 함수 =====
    
    // 메모 추가
    function addMemo(title, content, date = null, attachments = []) {
        const memo = {
            id: Date.now(),
            title: title,
            content: content,
            date: date || new Date().toISOString().split('T')[0], // YYYY-MM-DD 형식
            timestamp: new Date().toISOString(),
            attachments: attachments || [] // 첨부 파일 배열
        };
        
        MemoSystem.data.unshift(memo);
        console.log('📝 메모 추가됨:', memo);
        console.log(`📊 현재 메모 개수: ${MemoSystem.data.length}`);
        
        // 먼저 저장 후 UI 업데이트 (skipReload = true로 데이터 덮어쓰기 방지)
        saveMemosToStorage();
        refreshAllUI(true);
        
        return memo;
    }

    // 메모 삭제 (확인창 없이 즉시, 중복 방지)
    const deletingMemos = new Set();
    function deleteMemoById(id) {
        // 이미 삭제 중인 메모면 무시
        if (deletingMemos.has(id)) {
            console.warn(`⚠️ 이미 삭제 처리 중인 메모: ${id}`);
            return false;
        }
        
        // 잠금 상태 확인
        if (MemoSystem.locks.dateMemos) {
            console.warn(`🔒 날짜별 메모가 잠겨있어 삭제가 차단됨: ${id}`);
            alert('🔒 메모 삭제가 잠겨있습니다!\n\n먼저 🔓 잠금을 해제하세요.');
            return false;
        }
        
        // 삭제 중 표시
        deletingMemos.add(id);
        
        const beforeCount = MemoSystem.data.length;
        MemoSystem.data = MemoSystem.data.filter(m => m.id != id);
        const afterCount = MemoSystem.data.length;
        
        if (beforeCount === afterCount) {
            console.warn(`⚠️ 삭제할 메모를 찾을 수 없음: ${id}`);
            deletingMemos.delete(id);
            return false;
        }
        
        saveMemosToStorage();
        
        console.log(`✅ 메모 삭제됨: ${id} (${beforeCount} → ${afterCount})`);
        
        // UI 업데이트 (약간의 지연으로 안정화)
        setTimeout(() => {
            refreshAllUI(true); // skipReload = true로 데이터 덮어쓰기 방지
            deletingMemos.delete(id);
            
            // 모든 processing 플래그 정리 (삭제 후 혹시 남아있을 수 있는 플래그들)
            const allMemoItems = document.querySelectorAll('.memo-item');
            allMemoItems.forEach(item => {
                if (item.dataset.processing === 'true') {
                    item.dataset.processing = 'false';
                }
            });
            
            // 모든 삭제 버튼 processing 플래그도 정리
            const allDeleteBtns = document.querySelectorAll('.memo-item-delete');
            allDeleteBtns.forEach(btn => {
                if (btn.dataset.processing === 'true') {
                    btn.dataset.processing = 'false';
                }
            });
            
            console.log(`🧹 메모 삭제 완료 후 모든 processing 플래그 정리됨`);
        }, 100); // 약간 더 긴 지연으로 안정성 확보
        
        return true;
    }

    // 메모 찾기
    function findMemoById(id) {
        return MemoSystem.data.find(m => m.id == id);
    }

    // ===== UI 업데이트 함수 =====
    
    // 모든 UI 새로고침 (중복 방지)
    let refreshInProgress = false;
    async function refreshAllUI(skipReload = false) {
        // 이미 새로고침 중이면 건너뛰기
        if (refreshInProgress) {
            console.log('⚠️ 이미 새로고침 중 - 건너뛰기');
            return;
        }
        
        refreshInProgress = true;
        console.log('🔄 전체 UI 새로고침 시작');
        
        try {
            // skipReload가 false일 때만 데이터 재로드 (새로 추가된 메모 보호)
            if (!skipReload) {
                await loadMemosFromStorage();
            }
            
            // 각 리스트 업데이트 (스티키 메모는 HTML에서 처리)
            refreshMemoList();
            // refreshStickyMemoList(); // HTML loadStickyMemos()가 처리
            refreshDateMemoList();
            
            // 달력 업데이트
            if (window.updateCalendarDisplay) {
                try { 
                    window.updateCalendarDisplay(); 
                } catch (e) {
                    console.error('달력 업데이트 오류:', e);
                }
            }
            
            console.log('✅ 전체 UI 새로고침 완료');
        } catch (error) {
            console.error('❌ UI 새로고침 오류:', error);
        } finally {
            // 새로고침 완료 후 플래그 해제 (약간의 지연)
            setTimeout(() => {
                refreshInProgress = false;
            }, 100);
        }
    }

    // 일반 메모 리스트 새로고침 (memoList 요소가 없으므로 빈 함수)
    function refreshMemoList() {
        console.log('📝 일반 메모 리스트: HTML에 memoList 요소가 없음 - 스티키 메모로 통합됨');
        // HTML에 memoList 요소가 없으므로 스티키 메모 리스트로 대체
        // 실제 동작은 refreshStickyMemoList()에서 모든 메모를 처리
    }

    // 스티커 메모 리스트 새로고침 (HTML 함수 사용으로 비활성화)
    function refreshStickyMemoList() {
        console.log('📝 스티키 메모 리스트: HTML loadStickyMemos() 함수에서 처리 - unified 시스템 건너뜀');
        // HTML의 loadStickyMemos() 함수가 처리하므로 여기서는 아무것도 하지 않음
        // 이렇게 해서 메모장과 메모 리스트 충돌 방지
    }

    // 날짜별 메모 리스트 새로고침
    function refreshDateMemoList() {
        const element = document.getElementById('dateMemoList');
        if (!element) return;
        
        if (!MemoSystem.selectedDate) return;
        
        const dateMemos = MemoSystem.data.filter(m => m.date === MemoSystem.selectedDate);
        
        if (dateMemos.length === 0) {
            element.innerHTML = '<div style="text-align: center; color: #999; padding: 20px;">이 날짜에 저장된 메모가 없습니다</div>';
            return;
        }
        
        const isUnlocked = !MemoSystem.locks.dateMemos;
        element.innerHTML = dateMemos.map(memo => {
            const attachmentCount = memo.attachments ? memo.attachments.length : 0;
            const attachmentInfo = attachmentCount > 0 ? `📎 ${attachmentCount}개` : '';
            
            return `
            <div class="memo-item ${isUnlocked ? 'unlocked' : ''}" onclick="${isUnlocked ? '' : `openMemoDetail(${memo.id})`}">
                <div class="memo-item-header">
                    <div class="memo-item-title">${memo.title || '제목 없음'}</div>
                    ${attachmentInfo ? `<div class="memo-item-attachment-info">${attachmentInfo}</div>` : ''}
                </div>
                <div class="memo-item-content">${(memo.content || '').substring(0, 100)}${(memo.content || '').length > 100 ? '...' : ''}</div>
                <div class="memo-item-date">${memo.date || '날짜 없음'}</div>
                <div class="memo-item-preview">${isUnlocked ? '편집하려면 클릭' : '클릭하여 보기'}</div>
                ${isUnlocked ? `
                    <div class="memo-item-actions">
                        <button class="memo-item-edit visible" onclick="event.stopPropagation(); editMemoFromList(${memo.id})" title="편집">✏️</button>
                        <button class="memo-item-delete visible" onclick="event.stopPropagation(); deleteMemoFromList(${memo.id})" title="삭제">✕</button>
                    </div>
                ` : ''}
            </div>
            `;
        }).join('');
        
        // 디버깅: 생성된 메모 아이템 개수 확인
        const memoItems = element.querySelectorAll('.memo-item');
        console.log(`📋 날짜별 메모 리스트 렌더링 완료: ${memoItems.length}개 메모, 잠금상태: ${MemoSystem.locks.dateMemos ? '잠김' : '해제'}`);
        
        // onclick 이벤트가 제대로 설정되었는지 확인
        memoItems.forEach((item, index) => {
            const onclickAttr = item.getAttribute('onclick');
            console.log(`  메모 ${index + 1}: onclick="${onclickAttr}"`);
            
            // 백업 이벤트 리스너 추가
            if (!item.dataset.backupListener) {
                item.addEventListener('click', function(e) {
                    // 버튼 클릭이 아닌 경우에만 실행
                    if (!e.target.classList.contains('memo-item-delete') && 
                        !e.target.classList.contains('memo-item-edit') &&
                        !e.target.closest('.memo-item-actions')) {
                        
                        const memoIdMatch = this.innerHTML.match(/editMemoFromList\((\d+)\)|openMemoDetail\((\d+)\)/);
                        const memoId = memoIdMatch ? (memoIdMatch[1] || memoIdMatch[2]) : null;
                        
                        if (memoId) {
                            if (isUnlocked) {
                                console.log(`🔄 백업 이벤트 리스너로 메모 편집 모드 호출: ${memoId}`);
                                window.editMemoFromList(parseInt(memoId));
                            } else {
                                console.log(`🔄 백업 이벤트 리스너로 메모 상세보기 호출: ${memoId}`);
                                window.openMemoDetail(parseInt(memoId));
                            }
                        }
                    }
                });
                item.dataset.backupListener = 'true';
            }
        });
    }

    // ===== 이벤트 바인딩 =====
    
    function bindMemoListEvents(container) {
        // 이미 바인딩된 경우 중복 방지
        if (container.dataset.eventsBinding === 'true') {
            return;
        }
        
        // 이벤트 위임 사용 (중복 방지)
        container.addEventListener('click', function(e) {
            const memoItem = e.target.closest('.memo-item[data-clickable="true"]');
            const deleteBtn = e.target.closest('.memo-item-delete[data-action="delete"]');
            
            if (deleteBtn) {
                // 삭제 버튼 클릭 처리
                e.stopPropagation();
                e.preventDefault();
                
                const memoId = deleteBtn.dataset.memoId;
                if (!memoId) return;
                
                // 중복 클릭 방지
                if (deleteBtn.dataset.processing === 'true') {
                    console.log(`⚠️ 이미 삭제 처리 중: ${memoId}`);
                    return;
                }
                deleteBtn.dataset.processing = 'true';
                
                // 잠금 상태 확인
                const listId = container.id;
                let isLocked = true;
                
                if (listId === 'memoList') {
                    isLocked = MemoSystem.locks.memos;
                } else if (listId === 'stickyMemoList') {
                    isLocked = MemoSystem.locks.stickyMemos;
                } else if (listId === 'dateMemoList') {
                    isLocked = MemoSystem.locks.dateMemos;
                }
                
                if (isLocked) {
                    alert('🔒 메모 삭제가 잠겨있습니다!\n\n먼저 🔓 잠금을 해제하세요.');
                    deleteBtn.dataset.processing = 'false';
                    return;
                }
                
                console.log(`🗑️ 메모 삭제 시도: ${memoId} (${listId})`);
                
                // 삭제 실행
                const success = deleteMemoById(memoId);
                
                // 처리 완료 (약간의 지연 후)
                setTimeout(() => {
                    if (deleteBtn && deleteBtn.parentElement) {
                        deleteBtn.dataset.processing = 'false';
                    }
                }, 100);
                
            } else if (memoItem) {
                // 메모 아이템 클릭 처리
                e.preventDefault();
                e.stopPropagation(); // 이벤트 버블링 방지
                
                const memoId = memoItem.dataset.memoId;
                if (memoId && memoItem.dataset.processing !== 'true') {
                    memoItem.dataset.processing = 'true';
                    
                    console.log(`📋 메모 상세보기 요청: ${memoId}`);
                    showMemoDetail(memoId);
                    
                    setTimeout(() => {
                        if (memoItem && memoItem.parentElement) {
                            memoItem.dataset.processing = 'false';
                        }
                    }, 350);
                } else {
                    console.log(`⚠️ 메모 클릭 무시: ${memoId} (processing: ${memoItem.dataset.processing})`);
                }
            }
        });
        
        // 바인딩 완료 표시
        container.dataset.eventsBinding = 'true';
        console.log(`✅ ${container.id} 이벤트 바인딩 완료`);
    }

    // ===== 메모 상세보기 =====
    
    let showingDetail = false; // 중복 호출 방지
    
    function showMemoDetail(id) {
        console.log(`🔍 메모 상세보기 시도: ${id} (현재: ${MemoSystem.currentDetailId}, showingDetail: ${showingDetail})`);
        
        // 이미 상세보기가 진행 중이면 무시
        if (showingDetail) {
            console.log('⚠️ 메모 상세보기 이미 진행 중, 무시:', id);
            return;
        }
        
        // 현재 표시 중인 메모와 같으면 새로고침만
        if (MemoSystem.currentDetailId === id) {
            console.log('🔄 동일한 메모 새로고침:', id);
            // 동일한 메모라도 새로고침 허용 (내용이 바뀔 수 있음)
        }
        
        showingDetail = true;
        
        const memo = findMemoById(id);
        if (!memo) {
            console.error(`❌ 메모를 찾을 수 없음: ${id}`);
            alert('메모를 찾을 수 없습니다.');
            refreshAllUI(); // UI 정리
            showingDetail = false;
            return;
        }
        
        MemoSystem.currentDetailId = id;
        
        // 상세 모달에 내용 채우기
        const titleEl = document.getElementById('memoDetailTitle');
        const dateEl = document.getElementById('memoDetailDate');
        const bodyEl = document.getElementById('memoDetailBody');
        
        if (titleEl) titleEl.textContent = memo.title;
        if (dateEl) dateEl.textContent = `📅 ${memo.date}`;
        if (bodyEl) bodyEl.textContent = memo.content;
        
        // 모달 표시
        const modal = document.getElementById('memoDetailModal');
        if (modal) {
            modal.style.display = 'block';
        }
        
        console.log('📋 메모 상세보기:', memo.title);
        
        // 처리 완료 플래그 해제 (약간의 지연으로)
        setTimeout(() => {
            showingDetail = false;
        }, 300);
    }

    // ===== 잠금 시스템 =====
    
    function toggleLock(type) {
        // 첨부 파일이 있는 상태에서 잠금 시 경고
        if (type === 'dateMemos' && window.currentMemoFiles && window.currentMemoFiles.length > 0 && !MemoSystem.locks[type]) {
            const fileCount = window.currentMemoFiles.length;
            console.log(`⚠️ 첨부 파일 ${fileCount}개가 있는 상태에서 잠금 시도 - 파일 보존`);
        }
        
        MemoSystem.locks[type] = !MemoSystem.locks[type];
        
        // UI 업데이트
        let toggleEl = null;
        if (type === 'memos') {
            toggleEl = document.getElementById('memoLockToggle');
        } else if (type === 'stickyMemos') {
            toggleEl = document.getElementById('stickyMemoLockToggle');
        } else if (type === 'dateMemos') {
            toggleEl = document.getElementById('dateMemoLockToggle');
        }
        
        if (toggleEl) {
            const icon = toggleEl.querySelector('.lock-icon');
            const text = toggleEl.querySelector('.lock-text');
            
            if (MemoSystem.locks[type]) {
                toggleEl.classList.remove('unlocked');
                if (icon) icon.textContent = '🔒';
                if (text) text.textContent = '잠금';
            } else {
                toggleEl.classList.add('unlocked');
                if (icon) icon.textContent = '🔓';
                if (text) text.textContent = '해제됨';
            }
        }
        
        // 리스트 새로고침 (데이터 다시 로드하지 않음 - 편집 중인 파일 보호)
        refreshAllUI(true);
        
        console.log(`🔐 ${type} 잠금 상태: ${MemoSystem.locks[type] ? '잠김' : '해제'}`);
        
        // 첨부 파일 보존 확인
        if (type === 'dateMemos' && window.currentMemoFiles) {
            console.log(`📎 잠금 토글 후 첨부 파일 상태: ${window.currentMemoFiles.length}개`);
        }
    }

    // ===== 기존 함수 대체 =====
    
    function replaceGlobalFunctions() {
        // 메모 로드 함수들 (스티키 메모는 HTML 함수 사용)
        window.loadMemos = refreshMemoList;
        // window.displayStickyMemos는 HTML loadStickyMemos로 처리
        window.displayDateMemos = refreshDateMemoList;
        
        // 메모 삭제 함수
        window.deleteMemo = deleteMemoById;
        window.deleteMemoFromList = deleteMemoById;
        
        // 메모 상세보기 함수 (통합 메모 시스템용)
        window.openMemoDetail = function(id) {
            console.log('🔍 openMemoDetail 호출됨:', id);
            const memo = MemoSystem.data.find(m => m.id === id);
            console.log('찾은 메모:', memo);
            console.log('전체 메모:', MemoSystem.data);
            
            if (!memo) {
                console.error('메모를 찾을 수 없습니다:', id);
                return;
            }

            // currentMemoId는 HTML에서 사용하는 전역 변수
            if (typeof window.currentMemoId !== 'undefined') {
                window.currentMemoId = id;
            }
            
            // 상세 모달에 내용 채우기
            const titleEl = document.getElementById('memoDetailTitle');
            const dateEl = document.getElementById('memoDetailDate');
            const bodyEl = document.getElementById('memoDetailBody');
            
            if (titleEl) titleEl.textContent = memo.title;
            if (dateEl) dateEl.textContent = `📅 ${memo.date}`;
            if (bodyEl) bodyEl.textContent = memo.content || '(내용 없음)';
            
            // 첨부 파일 섹션 표시
            const attachmentsSection = document.getElementById('memoDetailAttachments');
            const attachmentsList = document.getElementById('memoDetailAttachmentsList');
            
            if (memo.attachments && memo.attachments.length > 0) {
                if (attachmentsSection) attachmentsSection.style.display = 'block';
                if (attachmentsList) {
                    attachmentsList.innerHTML = memo.attachments.map((file, index) => {
                        const fileIcon = getFileIconForDetail(file.type);
                        const fileSize = formatFileSizeForDetail(file.size);
                        
                        return `
                            <div class="memo-detail-attachment-item" onclick="openAttachmentFile(${id}, ${index})">
                                <div class="memo-detail-attachment-icon">${fileIcon}</div>
                                <div class="memo-detail-attachment-info">
                                    <div class="memo-detail-attachment-name">${file.name}</div>
                                    <div class="memo-detail-attachment-size">${fileSize}</div>
                                </div>
                                <button class="memo-detail-attachment-download" onclick="event.stopPropagation(); downloadAttachmentFile(${id}, ${index})" title="다운로드">💾</button>
                            </div>
                        `;
                    }).join('');
                }
            } else {
                if (attachmentsSection) attachmentsSection.style.display = 'none';
            }
            
            // 상세 모달 위치 설정
            const memoDetailModal = document.getElementById('memoDetailModal');
            const modalContent = memoDetailModal ? memoDetailModal.querySelector('.memo-modal-content') : null;
            
            if (memoDetailModal && modalContent) {
                // 달력 컨테이너 위치 계산
                const calendarContainer = document.querySelector('.calendar-container');
                if (calendarContainer) {
                    const containerRect = calendarContainer.getBoundingClientRect();
                    
                    // 모달을 달력 중앙에 배치
                    const modalWidth = 500;
                    const modalHeight = 400;
                    
                    const centerX = containerRect.left + (containerRect.width - modalWidth) / 2;
                    const centerY = containerRect.top + (containerRect.height - modalHeight) / 2;
                    
                    // 화면 경계 확인
                    const maxX = window.innerWidth - modalWidth - 20;
                    const maxY = window.innerHeight - modalHeight - 20;
                    
                    const constrainedX = Math.max(20, Math.min(centerX, maxX));
                    const constrainedY = Math.max(20, Math.min(centerY, maxY));
                    
                    // 모달 스타일 설정
                    modalContent.style.position = 'absolute';
                    modalContent.style.left = constrainedX + 'px';
                    modalContent.style.top = constrainedY + 'px';
                    modalContent.style.margin = '0';
                    
                    // z-index를 높게 설정하여 다른 모달보다 앞에 표시
                    memoDetailModal.style.zIndex = '10000';
                }
                
                // 상세 모달 표시
                memoDetailModal.style.display = 'block';
                console.log('✅ 메모 상세 모달 표시됨');
            } else {
                console.error('메모 상세 모달 요소를 찾을 수 없습니다');
            }
        };
        
        // 메모 편집 기능
        window.editMemo = function() {
            console.log('✏️ editMemo 함수 실행됨 (통합 시스템)');
            
            if (typeof window.currentMemoId === 'undefined' || !window.currentMemoId) {
                console.error('편집할 메모 ID가 없습니다');
                return;
            }
            
            const memo = MemoSystem.data.find(m => m.id === window.currentMemoId);
            console.log('편집할 메모:', memo);
            
            if (!memo) {
                console.error('메모를 찾을 수 없습니다:', window.currentMemoId);
                return;
            }
            
            // 상세 모달 닫기
            const memoDetailModal = document.getElementById('memoDetailModal');
            if (memoDetailModal) {
                memoDetailModal.style.display = 'none';
            }
            
            // 날짜별 메모 모달 열기
            if (window.openDateMemoModal) {
                const date = new Date(memo.date);
                window.openDateMemoModal(date.getFullYear(), date.getMonth() + 1, date.getDate());
                
                // 입력창에 기존 내용 채우기
                setTimeout(() => {
                    const dateUnifiedInput = document.getElementById('dateMemoUnifiedInput');
                    if (dateUnifiedInput) {
                        // 제목과 내용을 통합하여 입력창에 설정
                        const unifiedContent = memo.content ? `${memo.title}\n${memo.content}` : memo.title;
                        dateUnifiedInput.value = unifiedContent;
                        
                        // 기존 메모 삭제 (새로 저장할 것이므로)
                        deleteMemoById(window.currentMemoId);
                        
                        // 입력창에 포커스
                        dateUnifiedInput.focus();
                        
                        console.log('✅ 편집 모드로 전환됨');
                    } else {
                        console.error('날짜별 입력창을 찾을 수 없습니다');
                    }
                }, 200);
            } else {
                console.error('openDateMemoModal 함수를 찾을 수 없습니다');
            }
        };
        
        // 리스트에서 직접 메모 편집
        window.editMemoFromList = function(id) {
            console.log('✏️ editMemoFromList 함수 실행됨:', id);
            
            // 편집 중인 메모 ID를 가장 먼저 설정
            const wasAlreadyEditing = window.editingMemoId === id;
            window.editingMemoId = id;
            
            const memo = MemoSystem.data.find(m => m.id === id);
            if (!memo) {
                console.error('메모를 찾을 수 없습니다:', id);
                return;
            }
            
            console.log('편집할 메모:', memo);
            
            // 새로운 폼 필드들에 기존 내용 채우기
            const titleInput = document.getElementById('dateMemoTitleInput');
            const contentInput = document.getElementById('dateMemoContentInput');
            const dateUnifiedInput = document.getElementById('dateMemoUnifiedInput');
            
            if (titleInput && contentInput) {
                // 새로운 분리된 폼 사용
                titleInput.value = memo.title || '';
                contentInput.value = memo.content || '';
                
                // 항상 첨부 파일 복원 (편집 모드 진입 시 기존 파일 유지)
                // 첨부 파일 복원 (각 파일에 고유 ID 보장)
                if (memo.attachments && memo.attachments.length > 0) {
                    window.currentMemoFiles = memo.attachments.map(file => ({
                        ...file,
                        id: file.id || Date.now() + Math.random().toString(36).substr(2, 9)
                    }));
                    console.log(`📎 기존 첨부파일 복원: ${memo.attachments.length}개`);
                } else {
                    window.currentMemoFiles = [];
                    console.log('📎 첨부파일 없음 - 빈 배열로 초기화');
                }
                
                if (window.updateFileList) {
                    window.updateFileList();
                }
                
                titleInput.focus();
                console.log('✅ 새로운 폼 구조로 편집 모드 전환됨');
            } else if (dateUnifiedInput) {
                // 기존 통합 입력창 사용 (호환성)
                const unifiedContent = memo.content ? `${memo.title}\n${memo.content}` : memo.title;
                dateUnifiedInput.value = unifiedContent;
                dateUnifiedInput.focus();
                console.log('✅ 통합 입력창으로 편집 모드 전환됨 (호환성)');
            } else {
                console.error('입력창을 찾을 수 없습니다');
            }
            
            console.log('✅ 리스트에서 편집 모드로 전환됨 (메모 보존)');
        };
        
        // 메모 저장 (일반 메모)
        window.saveMemo = function() {
            const title = document.getElementById('memoTitleInput')?.value?.trim();
            const content = document.getElementById('memoContentInput')?.value?.trim();
            
            if (!title) {
                alert('메모 제목을 입력해주세요!');
                return;
            }
            
            const memo = addMemo(title, content);
            
            // 입력창 초기화
            const titleInput = document.getElementById('memoTitleInput');
            const contentInput = document.getElementById('memoContentInput');
            if (titleInput) titleInput.value = '';
            if (contentInput) contentInput.value = '';
            
            console.log('💾 일반 메모 저장:', memo.title);
        };
        
        // 스티커 메모 저장
        window.saveStickyMemo = function() {
            console.log('🗒️ saveStickyMemo 함수 실행됨 (unified-memo-system)');
            
            // 리치 텍스트 에디터와 일반 텍스트 입력창 모두 지원
            const editorElement = document.getElementById('stickyMemoEditor');
            const inputElement = document.getElementById('stickyMemoUnifiedInput');
            
            let unifiedInput = '';
            
            if (editorElement && editorElement.innerHTML.trim() && editorElement.innerHTML !== '<br>') {
                // 리치 텍스트 에디터에서 HTML을 텍스트로 변환
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = editorElement.innerHTML;
                unifiedInput = tempDiv.textContent || tempDiv.innerText || '';
                console.log('리치 텍스트 에디터 내용 사용:', unifiedInput);
            } else if (inputElement && inputElement.value.trim()) {
                // 일반 텍스트 입력창 사용
                unifiedInput = inputElement.value.trim();
                console.log('일반 텍스트 입력창 내용 사용:', unifiedInput);
            }
            
            if (!unifiedInput) {
                alert('메모 내용을 입력해주세요!');
                return;
            }

            // 첫 번째 줄을 제목으로, 나머지를 내용으로 분리
            const lines = unifiedInput.split('\n');
            let title = lines[0].trim();
            const content = lines.slice(1).join('\n').trim();
            console.log('분리된 제목:', title);
            console.log('분리된 내용:', content);

            // 제목이 비어있으면 첫 20자로 자동 생성
            if (!title) {
                title = unifiedInput.length > 20 ? unifiedInput.substring(0, 20) + '...' : unifiedInput;
                console.log('자동 생성된 제목:', title);
            }

            const today = new Date();
            const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

            const memo = {
                id: Date.now(),
                title: title,
                content: content,
                date: todayString,
                timestamp: new Date().toISOString()
            };

            // MemoSystem을 통해 저장
            addMemo(title, content, todayString);
            
            // 입력창 초기화
            if (editorElement) {
                editorElement.innerHTML = '';
            }
            if (inputElement) {
                inputElement.value = '';
            }
            
            console.log('💾 스티커 메모 저장 완료:', memo);
            alert(`스티커 메모가 오늘(${todayString}) 메모장에 저장되었습니다!`);
        };
        
        // 날짜별 메모 저장
        window.saveDateMemo = function() {
            if (!MemoSystem.selectedDate) {
                alert('날짜가 선택되지 않았습니다!');
                return;
            }
            
            console.log('📅 saveDateMemo 함수 실행됨 (unified-memo-system)');
            
            // 새로운 폼 필드들에서 데이터 가져오기
            const titleInput = document.getElementById('dateMemoTitleInput');
            const contentInput = document.getElementById('dateMemoContentInput');
            let title = titleInput ? titleInput.value.trim() : '';
            let content = contentInput ? contentInput.value.trim() : '';
            
            // 기존 통합 입력창도 지원 (호환성)
            const unifiedInputElement = document.getElementById('dateMemoUnifiedInput');
            const unifiedInput = unifiedInputElement ? unifiedInputElement.value.trim() : '';
            
            // 새로운 폼이 비어있고 통합 입력창에 내용이 있다면 통합 입력창 사용
            if (!title && !content && unifiedInput) {
                const lines = unifiedInput.split('\n');
                title = lines[0].trim();
                content = lines.slice(1).join('\n').trim();
                console.log('통합 입력창 사용 - 제목:', title, '내용:', content);
            }
            
            console.log('최종 제목:', title);
            console.log('최종 내용:', content);
            
            // 제목이나 내용 중 하나는 있어야 함
            if (!title && !content) {
                alert('제목 또는 내용을 입력해주세요!');
                return;
            }
            
            // 제목이 없으면 내용의 첫 20자로 자동 생성
            if (!title) {
                title = content.length > 20 ? content.substring(0, 20) + '...' : content;
                console.log('자동 생성된 제목:', title);
            }
            
            // 첨부 파일 정보 가져오기
            const attachedFiles = window.currentMemoFiles || [];
            console.log('첨부 파일:', attachedFiles.length, '개');
            console.log('첨부 파일 목록:', attachedFiles.map(f => `${f.name} (ID: ${f.id})`));
            
            let memo;
            
            // 편집 모드인지 확인
            if (window.editingMemoId) {
                console.log('✏️ 편집 모드: 기존 메모 업데이트', window.editingMemoId);
                // 기존 메모 찾기
                const existingMemo = MemoSystem.data.find(m => m.id === window.editingMemoId);
                if (existingMemo) {
                    // 기존 메모 업데이트
                    existingMemo.title = title;
                    existingMemo.content = content;
                    existingMemo.date = MemoSystem.selectedDate;
                    existingMemo.timestamp = new Date().toISOString();
                    existingMemo.attachments = attachedFiles; // 첨부 파일 업데이트
                    
                    memo = existingMemo;
                    saveMemosToStorage();
                    refreshAllUI(true); // skipReload = true로 데이터 덮어쓰기 방지
                    
                    console.log('📝 메모 업데이트됨:', memo);
                } else {
                    console.error('편집할 메모를 찾을 수 없습니다:', window.editingMemoId);
                    // 편집할 메모가 없으면 편집 모드만 해제하고 저장하지 않음
                    window.editingMemoId = null;
                    refreshUI();
                    return;
                }
                
                // 편집 모드 해제
                window.editingMemoId = null;
            } else {
                // 새 메모 추가
                memo = addMemo(title, content, MemoSystem.selectedDate, attachedFiles);
            }
            
            // 입력창 초기화
            const titleInputEl = document.getElementById('dateMemoTitleInput');
            const contentInputEl = document.getElementById('dateMemoContentInput');
            const unifiedInputEl = document.getElementById('dateMemoUnifiedInput');
            const fileInputEl = document.getElementById('dateMemoFileInput');
            const fileListEl = document.getElementById('dateMemoFileList');
            
            if (titleInputEl) titleInputEl.value = '';
            if (contentInputEl) contentInputEl.value = '';
            if (unifiedInputEl) unifiedInputEl.value = '';
            if (fileInputEl) fileInputEl.value = '';
            if (fileListEl) fileListEl.innerHTML = '<div style="color: #718096; font-size: 14px; text-align: center; padding: 10px;">첨부된 파일이 없습니다</div>';
            
            // 첨부 파일 데이터 초기화
            window.currentMemoFiles = [];
            
            console.log('💾 날짜별 메모 저장 완료:', memo.title, '(날짜:', MemoSystem.selectedDate, ')');
        };
        
        // 날짜별 메모 모달 열기
        window.openDateMemoModal = function(year, month, date) {
            const selectedDate = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
            MemoSystem.selectedDate = selectedDate;
            
            const titleEl = document.getElementById('dateMemoTitle');
            if (titleEl) titleEl.textContent = `📅 ${selectedDate} 메모`;
            
            const modal = document.getElementById('dateMemoModal');
            if (modal) modal.style.display = 'block';
            
            // 잠금 상태를 기본 잠김으로 설정 (보안상 안전)
            MemoSystem.locks.dateMemos = true;
            
            // UI도 잠금 상태로 업데이트
            const toggle = document.getElementById('dateMemoLockToggle');
            if (toggle) {
                const icon = toggle.querySelector('.lock-icon');
                const text = toggle.querySelector('.lock-text');
                
                toggle.classList.remove('unlocked');
                if (icon) icon.textContent = '🔒';
                if (text) text.textContent = '잠금';
            }
            
            refreshDateMemoList();
            
            console.log('📅 날짜별 메모 모달 열기 (기본 잠김 상태):', selectedDate);
        };
        
        // 날짜별 메모 모달 닫기 (HTML 함수가 우선 처리하므로 호환성 유지)
        window.closeDateMemoModal = function() {
            const modal = document.getElementById('dateMemoModal');
            if (modal) modal.style.display = 'none';
            
            // 입력창 초기화
            const titleInput = document.getElementById('dateMemoTitleInput');
            const contentInput = document.getElementById('dateMemoContentInput');
            if (titleInput) titleInput.value = '';
            if (contentInput) contentInput.value = '';
            
            // unified 시스템 상태 동기화
            MemoSystem.locks.dateMemos = true;
            MemoSystem.selectedDate = null;
            
            console.log('📅 날짜별 메모 모달 닫기 (HTML 자동 잠금과 동기화)');
        };
        
        // 스티커 메모 관련 함수들은 HTML에서 처리 (덮어쓰지 않음)
        // HTML의 openStickyMemo, closeStickyMemo, createStickyMemo, loadStickyMemos 등을 그대로 사용
        
        // 달력 표시 업데이트
        window.updateCalendarDisplay = function() {
            // 달력을 다시 그려서 메모 표시를 업데이트
            if (window.createCalendar) {
                try { 
                    window.createCalendar(); 
                } catch (e) {
                    console.error('달력 업데이트 오류:', e);
                }
            }
        };
        
        // 잠금 토글
        window.toggleMemoLock = () => toggleLock('memos');
        window.toggleStickyMemoLock = () => toggleLock('stickyMemos');
        window.toggleDateMemoLock = () => toggleLock('dateMemos');
        
        // 날짜 선택
        window.selectedDate = null;
        Object.defineProperty(window, 'selectedDate', {
            get: () => MemoSystem.selectedDate,
            set: (value) => {
                MemoSystem.selectedDate = value;
                refreshDateMemoList();
            }
        });
        
        // 잠금 상태
        window.isMemosUnlocked = false;
        Object.defineProperty(window, 'isMemosUnlocked', {
            get: () => !MemoSystem.locks.memos,
            set: (value) => {
                MemoSystem.locks.memos = !value;
                refreshAllUI(true); // 편집 중인 파일 보호
            }
        });
        
        window.isDateMemosUnlocked = false;
        Object.defineProperty(window, 'isDateMemosUnlocked', {
            get: () => !MemoSystem.locks.dateMemos,
            set: (value) => {
                MemoSystem.locks.dateMemos = !value;
                refreshDateMemoList();
            }
        });
        
        console.log('✅ 전역 함수 대체 완료');
    }

    // ===== 디버깅 도구 =====
    
    function addDebugTools() {
        // 시스템 상태 확인
        window.memoSystemStatus = function() {
            console.log('=== 📊 메모 시스템 상태 ===');
            console.log('메모 개수:', MemoSystem.data.length);
            console.log('잠금 상태:', MemoSystem.locks);
            console.log('선택된 날짜:', MemoSystem.selectedDate);
            console.log('현재 상세보기 ID:', MemoSystem.currentDetailId);
            
            // UI 요소 확인
            ['memoList', 'stickyMemoList', 'dateMemoList'].forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    const items = el.querySelectorAll('.memo-item').length;
                    console.log(`${id}: ${items}개 표시됨`);
                }
            });
            
            return MemoSystem;
        };
        
        // 강제 새로고침
        window.memoSystemRefresh = function() {
            console.log('🔄 메모 시스템 강제 새로고침');
            loadMemosFromStorage();
            refreshAllUI();
            return '✅ 새로고침 완료';
        };
        
        // 메모 전체 삭제 (테스트용)
        window.memoSystemClear = function() {
            if (confirm('⚠️ 정말로 모든 메모를 삭제하시겠습니까?')) {
                MemoSystem.data = [];
                saveMemosToStorage();
                refreshAllUI();
                return '✅ 모든 메모 삭제됨';
            }
            return '❌ 취소됨';
        };
        
        console.log('✅ 디버깅 도구 추가');
        console.log('🛠️ 사용 가능: memoSystemStatus(), memoSystemRefresh(), memoSystemClear()');
    }

    // ===== 초기화 =====
    
    async function initialize() {
        // 이미 초기화되었으면 건너뛰기
        if (MemoSystem.initialized) {
            console.warn('⚠️ 메모 시스템이 이미 초기화되었습니다');
            return;
        }
        
        console.log('🚀 통합 메모 관리 시스템 초기화');
        
        // 데이터 로드 (비동기 처리)
        await loadMemosFromStorage();
        
        // 기존 함수 강제 덮어쓰기 (충돌 방지)
        forceReplaceConflictingFunctions();
        
        // 기존 함수 대체
        replaceGlobalFunctions();
        
        // UI 초기화
        await refreshAllUI();
        
        // 디버깅 도구
        addDebugTools();
        
        // 초기화 완료 표시
        MemoSystem.initialized = true;
        
        console.log('✅ 통합 메모 관리 시스템 초기화 완료');
        console.log('📊 현재 메모:', MemoSystem.data.length, '개');
    }

    // 충돌하는 함수들 강제 덮어쓰기
    function forceReplaceConflictingFunctions() {
        // HTML 내부의 메모 관련 전역 변수들 초기화
        window.memos = MemoSystem.data;
        window.allMemos = MemoSystem.data;
        window.stickyMemos = MemoSystem.data;
        window.selectedDate = MemoSystem.selectedDate;
        window.currentMemoId = MemoSystem.currentDetailId;
        
        // 잠금 상태 초기화
        window.isMemosUnlocked = !MemoSystem.locks.memos;
        window.isDateMemosUnlocked = !MemoSystem.locks.dateMemos;
        
        console.log('⚡ 충돌 함수 강제 덮어쓰기 완료');
    }

    // DOM 로드 완료 후 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        // 약간의 지연을 주어 다른 스크립트들이 먼저 로드되도록 함
        setTimeout(initialize, 100);
    }
    
    // 주기적 충돌 복구는 비활성화 (과도한 새로고침 방지)
    // 필요시에만 수동으로 호출하도록 변경
    
    // 데이터 불일치 감지 시에만 복구 실행
    window.addEventListener('focus', () => {
        if (MemoSystem.initialized) {
            // 페이지가 포커스를 얻을 때만 동기화 체크
            const storedCount = JSON.parse(localStorage.getItem('calendarMemos') || '[]').length;
            if (storedCount !== MemoSystem.data.length) {
                console.log('🔄 데이터 불일치 감지 - 동기화 실행');
                forceReplaceConflictingFunctions();
                loadMemosFromStorage();
                refreshAllUI();
            }
        }
    });

    // 상세 모달에서 편집하는 함수 (메모 상세 창용)
    window.editMemoFromDetail = function() {
        console.log('✏️ editMemoFromDetail 함수 실행됨');
        
        if (typeof window.currentMemoId === 'undefined' || !window.currentMemoId) {
            console.error('편집할 메모 ID가 없습니다');
            return;
        }
        
        const memo = MemoSystem.data.find(m => m.id === window.currentMemoId);
        if (!memo) {
            console.error('메모를 찾을 수 없습니다:', window.currentMemoId);
            return;
        }
        
        console.log('상세 모달에서 편집할 메모:', memo);
        
        // 상세 모달 닫기
        const memoDetailModal = document.getElementById('memoDetailModal');
        if (memoDetailModal) {
            memoDetailModal.style.display = 'none';
        }
        
        // 날짜별 메모 모달 열기
        if (window.openDateMemoModal) {
            const date = new Date(memo.date);
            window.openDateMemoModal(date.getFullYear(), date.getMonth() + 1, date.getDate());
            
            // 입력창에 기존 내용 채우기
            setTimeout(() => {
                const dateUnifiedInput = document.getElementById('dateMemoUnifiedInput');
                if (dateUnifiedInput) {
                    // 제목과 내용을 통합하여 입력창에 설정
                    const unifiedContent = memo.content ? `${memo.title}\n${memo.content}` : memo.title;
                    dateUnifiedInput.value = unifiedContent;
                    
                    // 편집 중인 메모 ID 저장 (삭제하지 않고 덮어쓰기용)
                    window.editingMemoId = window.currentMemoId;
                    
                    // 입력창에 포커스
                    dateUnifiedInput.focus();
                    
                    console.log('✅ 상세 모달에서 편집 모드로 전환됨 (메모 보존)');
                } else {
                    console.error('날짜별 입력창을 찾을 수 없습니다');
                }
            }, 100);
        } else {
            console.error('openDateMemoModal 함수를 찾을 수 없습니다');
        }
    };

    // 첨부 파일 관련 유틸리티 함수들
    window.getFileIconForDetail = function(fileType) {
        if (fileType.startsWith('image/')) return '🖼️';
        if (fileType === 'application/pdf') return '📄';
        if (fileType.includes('word')) return '📝';
        if (fileType === 'text/plain') return '📄';
        return '📎';
    };

    window.formatFileSizeForDetail = function(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // 첨부 파일 열기 함수
    window.openAttachmentFile = function(memoId, fileIndex) {
        console.log('📎 첨부 파일 열기 시도:', memoId, fileIndex);
        
        const memo = MemoSystem.data.find(m => m.id === memoId);
        if (!memo || !memo.attachments || !memo.attachments[fileIndex]) {
            console.error('첨부 파일을 찾을 수 없습니다');
            alert('첨부 파일을 찾을 수 없습니다.');
            return;
        }
        
        const file = memo.attachments[fileIndex];
        console.log('열려는 파일:', file.name, file.type);
        
        try {
            // 이미지 파일인 경우 새 창에서 미리보기
            if (file.type.startsWith('image/')) {
                const newWindow = window.open();
                newWindow.document.write(`
                    <html>
                        <head>
                            <title>${file.name}</title>
                            <style>
                                body { 
                                    margin: 0; 
                                    padding: 20px; 
                                    background: #f5f5f5; 
                                    display: flex; 
                                    justify-content: center; 
                                    align-items: center; 
                                    min-height: 100vh; 
                                }
                                img { 
                                    max-width: 100%; 
                                    max-height: 100vh; 
                                    box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
                                }
                            </style>
                        </head>
                        <body>
                            <img src="${file.data}" alt="${file.name}" />
                        </body>
                    </html>
                `);
            } 
            // PDF 파일인 경우 새 창에서 열기
            else if (file.type === 'application/pdf') {
                const newWindow = window.open();
                newWindow.document.write(`
                    <html>
                        <head>
                            <title>${file.name}</title>
                            <style>
                                body { margin: 0; padding: 0; }
                                embed { width: 100%; height: 100vh; }
                            </style>
                        </head>
                        <body>
                            <embed src="${file.data}" type="application/pdf" />
                        </body>
                    </html>
                `);
            } 
            // 텍스트 파일인 경우
            else if (file.type === 'text/plain') {
                // Base64 디코딩하여 텍스트 내용 표시
                const base64Data = file.data.split(',')[1];
                const textContent = atob(base64Data);
                
                const newWindow = window.open();
                newWindow.document.write(`
                    <html>
                        <head>
                            <title>${file.name}</title>
                            <style>
                                body { 
                                    font-family: monospace; 
                                    margin: 20px; 
                                    line-height: 1.6; 
                                    background: #f8f9fa; 
                                }
                                pre { 
                                    background: white; 
                                    padding: 20px; 
                                    border-radius: 8px; 
                                    box-shadow: 0 2px 8px rgba(0,0,0,0.1); 
                                }
                            </style>
                        </head>
                        <body>
                            <h2>${file.name}</h2>
                            <pre>${textContent}</pre>
                        </body>
                    </html>
                `);
            }
            // 기타 파일은 다운로드
            else {
                downloadAttachmentFile(memoId, fileIndex);
            }
        } catch (error) {
            console.error('파일 열기 오류:', error);
            alert('파일을 열 수 없습니다. 다운로드를 시도해보세요.');
            downloadAttachmentFile(memoId, fileIndex);
        }
    };

    // 첨부 파일 다운로드 함수
    window.downloadAttachmentFile = function(memoId, fileIndex) {
        console.log('💾 첨부 파일 다운로드 시도:', memoId, fileIndex);
        
        const memo = MemoSystem.data.find(m => m.id === memoId);
        if (!memo || !memo.attachments || !memo.attachments[fileIndex]) {
            console.error('첨부 파일을 찾을 수 없습니다');
            alert('첨부 파일을 찾을 수 없습니다.');
            return;
        }
        
        const file = memo.attachments[fileIndex];
        console.log('다운로드할 파일:', file.name, file.type);
        
        try {
            // Base64 데이터를 Blob으로 변환
            const base64Data = file.data.split(',')[1];
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: file.type });
            
            // 다운로드 링크 생성 및 클릭
            const downloadUrl = URL.createObjectURL(blob);
            const downloadLink = document.createElement('a');
            downloadLink.href = downloadUrl;
            downloadLink.download = file.name;
            downloadLink.style.display = 'none';
            
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            // URL 정리
            URL.revokeObjectURL(downloadUrl);
            
            console.log('✅ 파일 다운로드 완료:', file.name);
        } catch (error) {
            console.error('파일 다운로드 오류:', error);
            alert('파일 다운로드 중 오류가 발생했습니다.');
        }
    };

})();