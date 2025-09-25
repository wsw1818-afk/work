/**
 * 최종 메모 저장 문제 해결 스크립트
 * 모든 외부 스크립트 로드 후 실행되어 올바른 함수로 덮어씀
 */

(function() {
    'use strict';

    console.log('🔧 최종 메모 저장 문제 해결 시작');

    // 페이지 로드 완료 후 실행
    function initializeFinalFix() {

        // ========== 표준화된 openDateMemoModal 함수 ==========
        function openDateMemoModal(...args) {
            console.log('📅 [FINAL] openDateMemoModal 호출됨:', args);

            let dateString;

            // 다양한 호출 방식 처리
            if (args.length === 1) {
                // openDateMemoModal("2025-09-25") 또는 openDateMemoModal("2025-09-25-undefined-undefined")
                dateString = args[0];
                // undefined 부분 제거
                if (dateString && typeof dateString === 'string') {
                    dateString = dateString.split('-').slice(0, 3).join('-');
                    // 잘못된 형식 수정 (예: "2025-09-25-undefined-undefined")
                    dateString = dateString.replace(/-undefined/g, '');
                }
            } else if (args.length >= 3) {
                // openDateMemoModal(2025, 9, 25)
                const [year, month, day] = args;
                dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            } else {
                console.error('❌ [FINAL] openDateMemoModal: 잘못된 매개변수:', args);
                return;
            }

            // 날짜 유효성 검사
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateString || !dateRegex.test(dateString)) {
                console.error('❌ [FINAL] 잘못된 날짜 형식:', dateString);
                return;
            }

            console.log('✅ [FINAL] 정규화된 날짜:', dateString);

            // 직접 모달 열기 구현
            openMemoModalDirect(dateString);
        }

        // ========== 직접 모달 열기 함수 ==========
        function openMemoModalDirect(dateString) {
            const [year, month, day] = dateString.split('-').map(Number);
            const targetDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            console.log('🚀 [FINAL] 직접 모달 열기:', targetDate);

            // 전역 변수 설정
            window.selectedDate = targetDate;
            if (window.selectedDate !== undefined) {
                selectedDate = targetDate;  // 전역 변수도 설정
            }

            // 모달 요소 가져오기
            const modal = document.getElementById('dateMemoModal');
            if (!modal) {
                console.error('❌ [FINAL] dateMemoModal을 찾을 수 없습니다');
                return;
            }

            // 제목 설정
            const titleElement = document.getElementById('dateMemoTitle');
            if (titleElement) {
                titleElement.textContent = `📅 ${targetDate} 메모`;
            }

            // 메모 리스트 로드
            loadMemosForDateDirect(targetDate);

            // 입력 필드 초기화
            const titleInput = document.getElementById('dateMemoTitleInput');
            const contentInput = document.getElementById('dateMemoContentInput');

            if (titleInput) titleInput.value = '';
            if (contentInput) contentInput.value = '';

            // 저장 버튼 설정
            const saveBtn = document.getElementById('saveDateMemo');
            if (saveBtn) {
                saveBtn.textContent = '💾 저장';
                // 기존 이벤트 제거하고 새로 등록
                saveBtn.onclick = (e) => {
                    e.preventDefault();
                    console.log('🔥 [FINAL] 저장 버튼 클릭 - saveMemoFinal 호출');
                    saveMemoFinal();
                };
            }

            // 모달 표시
            modal.style.display = 'flex';
            modal.classList.remove('force-hidden');
            modal.classList.add('show-modal');

            console.log('✅ [FINAL] 모달 열기 완료');
        }

        // ========== 메모 로드 함수 ==========
        function loadMemosForDateDirect(date) {
            const memoList = document.getElementById('dateMemoList');
            if (!memoList) {
                console.error('❌ [FINAL] dateMemoList를 찾을 수 없습니다');
                return;
            }

            const memos = JSON.parse(localStorage.getItem('calendarMemos') || '[]');
            const dateMemos = memos.filter(memo => memo.date === date);

            console.log(`📋 [FINAL] ${date} 날짜의 메모: ${dateMemos.length}개`);

            if (dateMemos.length === 0) {
                memoList.innerHTML = '<div class="no-memos">이 날짜에 저장된 메모가 없습니다</div>';
                return;
            }

            memoList.innerHTML = dateMemos.map(memo => `
                <div class="memo-item" data-memo-id="${memo.id}">
                    <div class="memo-header">
                        <span class="memo-title">📝 ${memo.title}</span>
                        <div class="memo-actions">
                            <button onclick="editMemoFinal('${memo.id}')">✏️</button>
                            <button onclick="deleteMemoFinal('${memo.id}')">🗑️</button>
                        </div>
                    </div>
                    <div class="memo-content">${memo.content}</div>
                    <div class="memo-date">📅 ${memo.date}</div>
                </div>
            `).join('');
        }

        // ========== 메모 저장 함수 ==========
        function saveMemoFinal() {
            const titleInput = document.getElementById('dateMemoTitleInput');
            const contentInput = document.getElementById('dateMemoContentInput');

            const title = titleInput ? titleInput.value.trim() : '';
            const content = contentInput ? contentInput.value.trim() : '';

            if (!title && !content) {
                alert('제목이나 내용을 입력해주세요.');
                return;
            }

            // 날짜 정규화
            let normalizedDate = window.selectedDate || selectedDate;
            if (normalizedDate && typeof normalizedDate === 'string') {
                normalizedDate = normalizedDate.split('-').slice(0, 3).join('-');
                normalizedDate = normalizedDate.replace(/-undefined/g, '');
            }

            // 날짜 유효성 검사
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!normalizedDate || !dateRegex.test(normalizedDate)) {
                console.error('❌ [FINAL] 잘못된 날짜 형식, 오늘 날짜 사용:', normalizedDate);
                const today = new Date();
                normalizedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            }

            console.log('💾 [FINAL] 메모 저장 - 정규화된 날짜:', normalizedDate);

            const memos = JSON.parse(localStorage.getItem('calendarMemos') || '[]');

            // 새 메모 추가
            const newMemo = {
                id: Date.now(),
                date: normalizedDate,  // 정규화된 날짜 사용
                title: title || '제목 없음',
                content: content,
                attachments: [],
                timestamp: new Date().toISOString()
            };
            memos.push(newMemo);

            console.log('✅ [FINAL] 새 메모 추가됨:', newMemo);

            // 저장
            localStorage.setItem('calendarMemos', JSON.stringify(memos));

            // 선택된 날짜도 정규화해서 업데이트
            window.selectedDate = normalizedDate;
            if (typeof selectedDate !== 'undefined') {
                selectedDate = normalizedDate;
            }

            // UI 업데이트
            loadMemosForDateDirect(normalizedDate);

            // 통합 시스템이 있다면 함께 업데이트
            if (window.displayDateMemos) {
                window.displayDateMemos();
            }

            // 달력 표시 강제 업데이트 - 메모 인디케이터 표시
            console.log('🔄 [FINAL] 달력 표시 업데이트 시작');
            if (typeof window.updateCalendarDisplay === 'function') {
                setTimeout(() => {
                    window.updateCalendarDisplay();
                    console.log('✅ [FINAL] 달력 표시 업데이트 완료');
                }, 100);
            }

            // 달력 강제 새로고침 (다른 방법)
            if (typeof window.createCalendar === 'function') {
                setTimeout(() => {
                    const now = new Date();
                    window.createCalendar(now.getFullYear(), now.getMonth());
                    console.log('🔄 [FINAL] 달력 강제 재생성 완료');
                }, 200);
            }

            // 메모 인디케이터 직접 추가
            setTimeout(() => {
                addMemoIndicatorToDate(normalizedDate);
            }, 300);

            // 입력 필드 초기화
            titleInput.value = '';
            contentInput.value = '';

            console.log('✅ [FINAL] 메모가 저장되었습니다.');

            // 성공 알림
            if (typeof alert !== 'undefined') {
                alert('메모가 저장되었습니다!');
            }
        }

        // ========== 메모 삭제 함수 ==========
        function deleteMemoFinal(memoId) {
            if (!confirm('정말로 이 메모를 삭제하시겠습니까?')) {
                return;
            }

            const memos = JSON.parse(localStorage.getItem('calendarMemos') || '[]');
            const updatedMemos = memos.filter(memo => memo.id != memoId);

            localStorage.setItem('calendarMemos', JSON.stringify(updatedMemos));

            // UI 업데이트
            const currentDate = window.selectedDate || selectedDate;
            if (currentDate) {
                loadMemosForDateDirect(currentDate);
            }

            console.log('🗑️ [FINAL] 메모 삭제됨:', memoId);
        }

        // ========== 메모 인디케이터 추가 함수 ==========
        function addMemoIndicatorToDate(dateString) {
            console.log('🎯 [FINAL] 메모 인디케이터 추가 시도:', dateString);

            // 해당 날짜 요소 찾기
            const dayElement = document.querySelector(`[data-date="${dateString}"]`);
            if (!dayElement) {
                console.error('❌ [FINAL] 날짜 요소를 찾을 수 없습니다:', dateString);
                return;
            }

            // 이미 인디케이터가 있는지 확인
            let indicator = dayElement.querySelector('.memo-indicator, .memo-dot, .has-memo');

            if (!indicator) {
                // 해당 날짜에 메모가 실제로 있는지 확인
                const memos = JSON.parse(localStorage.getItem('calendarMemos') || '[]');
                const dateMemos = memos.filter(memo => memo.date === dateString);

                if (dateMemos.length > 0) {
                    // 인디케이터 생성 및 추가
                    indicator = document.createElement('div');
                    indicator.className = 'memo-dot';
                    indicator.style.cssText = `
                        width: 6px;
                        height: 6px;
                        background-color: #ff4757;
                        border-radius: 50%;
                        position: absolute;
                        top: 2px;
                        right: 2px;
                        z-index: 10;
                    `;

                    // 부모 요소를 relative position으로 설정
                    dayElement.style.position = 'relative';
                    dayElement.appendChild(indicator);

                    console.log(`✅ [FINAL] 메모 인디케이터 추가됨: ${dateString} (메모 ${dateMemos.length}개)`);
                } else {
                    console.log(`ℹ️ [FINAL] ${dateString}에는 메모가 없어서 인디케이터를 추가하지 않음`);
                }
            } else {
                console.log(`ℹ️ [FINAL] ${dateString}에 이미 메모 인디케이터 존재함`);
            }
        }

        // ========== 전역 함수 등록 ==========
        window.openDateMemoModal = openDateMemoModal;
        window.saveMemoFinal = saveMemoFinal;
        window.deleteMemoFinal = deleteMemoFinal;
        window.loadMemosForDateDirect = loadMemosForDateDirect;
        window.addMemoIndicatorToDate = addMemoIndicatorToDate;

        console.log('✅ [FINAL] 최종 메모 시스템 초기화 완료');
    }

    // DOM 로드 완료 후 약간의 지연을 두고 실행 (다른 스크립트들이 로드된 후)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initializeFinalFix, 1000); // 1초 지연
        });
    } else {
        setTimeout(initializeFinalFix, 1000); // 1초 지연
    }

    console.log('🔧 최종 메모 저장 문제 해결 스크립트 로드됨');
})();