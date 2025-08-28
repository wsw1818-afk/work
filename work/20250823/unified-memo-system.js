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
    
    // localStorage에서 메모 로드 (단일 소스)
    function loadMemosFromStorage() {
        try {
            const stored = localStorage.getItem('calendarMemos');
            if (stored) {
                MemoSystem.data = JSON.parse(stored);
                console.log(`✅ 메모 로드 완료: ${MemoSystem.data.length}개`);
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
        
        return MemoSystem.data;
    }

    // localStorage에 메모 저장
    function saveMemosToStorage() {
        try {
            localStorage.setItem('calendarMemos', JSON.stringify(MemoSystem.data));
            
            // 전역 변수 동기화
            window.memos = MemoSystem.data;
            window.allMemos = MemoSystem.data;
            window.stickyMemos = MemoSystem.data;
            
            console.log(`✅ 메모 저장 완료: ${MemoSystem.data.length}개`);
            return true;
        } catch (error) {
            console.error('❌ 메모 저장 실패:', error);
            return false;
        }
    }

    // ===== 메모 CRUD 함수 =====
    
    // 메모 추가
    function addMemo(title, content, date = null) {
        const memo = {
            id: Date.now(),
            title: title,
            content: content,
            date: date || new Date().toISOString().split('T')[0], // YYYY-MM-DD 형식
            timestamp: new Date().toISOString()
        };
        
        MemoSystem.data.unshift(memo);
        saveMemosToStorage();
        refreshAllUI();
        
        console.log('📝 메모 추가됨:', memo);
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
            refreshAllUI();
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
    function refreshAllUI() {
        // 이미 새로고침 중이면 건너뛰기
        if (refreshInProgress) {
            console.log('⚠️ 이미 새로고침 중 - 건너뛰기');
            return;
        }
        
        refreshInProgress = true;
        console.log('🔄 전체 UI 새로고침 시작');
        
        try {
            // 먼저 데이터 재로드
            loadMemosFromStorage();
            
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
        element.innerHTML = dateMemos.map(memo => `
            <div class="memo-item ${isUnlocked ? 'unlocked' : ''}" onclick="openMemoDetail(${memo.id})">
                <div class="memo-item-title">${memo.title || '제목 없음'}</div>
                <div class="memo-item-content">${(memo.content || '').substring(0, 100)}${(memo.content || '').length > 100 ? '...' : ''}</div>
                <div class="memo-item-date">${memo.date || '날짜 없음'}</div>
                <div class="memo-item-preview">클릭하여 보기</div>
                ${isUnlocked ? `<button class="memo-item-delete visible" onclick="event.stopPropagation(); deleteMemoFromList(${memo.id})">✕</button>` : ''}
            </div>
        `).join('');
        
        // 디버깅: 생성된 메모 아이템 개수 확인
        const memoItems = element.querySelectorAll('.memo-item');
        console.log(`📋 날짜별 메모 리스트 렌더링 완료: ${memoItems.length}개 메모, 잠금상태: ${MemoSystem.locks.dateMemos ? '잠김' : '해제'}`);
        
        // onclick 이벤트가 제대로 설정되었는지 확인
        memoItems.forEach((item, index) => {
            const onclickAttr = item.getAttribute('onclick');
            console.log(`  메모 ${index + 1}: onclick="${onclickAttr}"`);
            
            // 백업 이벤트 리스너 추가 (onclick이 작동하지 않을 경우 대비)
            if (!item.dataset.backupListener) {
                item.addEventListener('click', function(e) {
                    // 삭제 버튼 클릭이 아닌 경우에만 상세보기 열기
                    if (!e.target.classList.contains('memo-item-delete')) {
                        const memoId = this.getAttribute('onclick')?.match(/openMemoDetail\((\d+)\)/)?.[1];
                        if (memoId && window.openMemoDetail) {
                            console.log(`🔄 백업 이벤트 리스너로 메모 상세보기 호출: ${memoId}`);
                            window.openMemoDetail(parseInt(memoId));
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
        
        // 리스트 새로고침
        refreshAllUI();
        
        console.log(`🔐 ${type} 잠금 상태: ${MemoSystem.locks[type] ? '잠김' : '해제'}`);
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
        
        // 메모 상세보기는 HTML 함수 사용 (덮어쓰지 않음)
        // HTML의 openMemoDetail 함수를 그대로 사용
        
        // 메모 상세보기 관련 함수들은 HTML에서 처리 (덮어쓰지 않음)
        // HTML의 closeMemoDetail, editMemo, deleteMemoFromDetail 함수들을 그대로 사용
        
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
            const title = document.getElementById('stickyMemoTitleInput')?.value?.trim();
            const content = document.getElementById('stickyMemoContentInput')?.value?.trim();
            
            if (!title) {
                alert('메모 제목을 입력해주세요!');
                return;
            }
            
            const memo = addMemo(title, content);
            
            // 입력창 초기화
            const titleInput = document.getElementById('stickyMemoTitleInput');
            const contentInput = document.getElementById('stickyMemoContentInput');
            if (titleInput) titleInput.value = '';
            if (contentInput) contentInput.value = '';
            
            console.log('💾 스티커 메모 저장:', memo.title);
        };
        
        // 날짜별 메모 저장
        window.saveDateMemo = function() {
            if (!MemoSystem.selectedDate) {
                alert('날짜가 선택되지 않았습니다!');
                return;
            }
            
            const title = document.getElementById('dateMemoTitleInput')?.value?.trim();
            const content = document.getElementById('dateMemoContentInput')?.value?.trim();
            
            if (!title) {
                alert('메모 제목을 입력해주세요!');
                return;
            }
            
            const memo = addMemo(title, content, MemoSystem.selectedDate);
            
            // 입력창 초기화
            const titleInput = document.getElementById('dateMemoTitleInput');
            const contentInput = document.getElementById('dateMemoContentInput');
            if (titleInput) titleInput.value = '';
            if (contentInput) contentInput.value = '';
            
            console.log('💾 날짜별 메모 저장:', memo.title, '(날짜:', MemoSystem.selectedDate, ')');
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
                refreshAllUI();
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
    
    function initialize() {
        // 이미 초기화되었으면 건너뛰기
        if (MemoSystem.initialized) {
            console.warn('⚠️ 메모 시스템이 이미 초기화되었습니다');
            return;
        }
        
        console.log('🚀 통합 메모 관리 시스템 초기화');
        
        // 데이터 로드
        loadMemosFromStorage();
        
        // 기존 함수 강제 덮어쓰기 (충돌 방지)
        forceReplaceConflictingFunctions();
        
        // 기존 함수 대체
        replaceGlobalFunctions();
        
        // UI 초기화
        refreshAllUI();
        
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

})();