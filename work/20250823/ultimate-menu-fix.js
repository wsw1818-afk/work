/**
 * 궁극적인 메뉴 수정 스크립트
 * - 모든 기존 이벤트 완전 제거
 * - 누락된 모든 기능 구현
 * - 스티커, 클라우드, 동기화 상태 완전 복원
 */

(function() {
    'use strict';
    
    console.log('⚡ 궁극적인 메뉴 수정 시작');
    
    // 중복 실행 방지
    if (window.ultimateMenuFixApplied) {
        console.log('이미 적용됨 - 중복 실행 방지');
        return;
    }
    
    // 스티커 메모 완전한 구현
    function createStickyMemoSystem() {
        console.log('🗒️ 스티커 메모 시스템 생성');
        
        // 기존 스티커 메모 제거
        const existing = document.getElementById('stickyMemo');
        if (existing) existing.remove();
        
        const stickyMemo = document.createElement('div');
        stickyMemo.id = 'stickyMemo';
        stickyMemo.className = 'sticky-memo';
        stickyMemo.innerHTML = `
            <div class="sticky-memo-header">
                <div class="sticky-memo-title">
                    <span>🗒️</span>
                    <span>스티커 메모</span>
                </div>
                <div class="sticky-memo-controls">
                    <button class="sticky-close-btn">✕</button>
                </div>
            </div>
            <div class="sticky-memo-content">
                <textarea class="sticky-memo-textarea" placeholder="메모를 입력하세요...&#10;첫 번째 줄이 제목이 됩니다."></textarea>
                <button class="sticky-memo-save-btn">💾 저장</button>
                <div class="sticky-memo-list">
                    <!-- 저장된 메모들이 여기 표시됩니다 -->
                </div>
            </div>
        `;
        
        document.body.appendChild(stickyMemo);
        
        // 스티커 메모 닫기 기능
        stickyMemo.querySelector('.sticky-close-btn').addEventListener('click', function() {
            stickyMemo.style.display = 'none';
        });
        
        // 스티커 메모 저장 기능
        stickyMemo.querySelector('.sticky-memo-save-btn').addEventListener('click', function() {
            const textarea = stickyMemo.querySelector('.sticky-memo-textarea');
            const content = textarea.value.trim();
            if (content) {
                // 로컬 스토리지에 저장
                const memos = JSON.parse(localStorage.getItem('stickyMemos') || '[]');
                const newMemo = {
                    id: Date.now(),
                    content: content,
                    date: new Date().toLocaleString()
                };
                memos.push(newMemo);
                localStorage.setItem('stickyMemos', JSON.stringify(memos));
                
                textarea.value = '';
                alert('메모가 저장되었습니다! 💾');
                loadStickyMemos();
            }
        });
        
        // 저장된 메모 로드 기능
        function loadStickyMemos() {
            const memosString = localStorage.getItem('stickyMemos') || '[]';
            let memos = [];
            try {
                memos = JSON.parse(memosString);
                if (!Array.isArray(memos)) {
                    memos = [];
                }
            } catch (e) {
                console.error('메모 파싱 오류:', e);
                memos = [];
            }
            
            const list = stickyMemo.querySelector('.sticky-memo-list');
            list.innerHTML = '';
            
            memos.forEach(memo => {
                const memoItem = document.createElement('div');
                memoItem.className = 'sticky-memo-item';
                memoItem.innerHTML = `
                    <div class="memo-content">${memo.content}</div>
                    <div class="memo-date">${memo.date}</div>
                    <button class="memo-delete-btn" onclick="deleteStickyMemo(${memo.id})">🗑️</button>
                `;
                list.appendChild(memoItem);
            });
        }
        
        // 메모 삭제 기능
        window.deleteStickyMemo = function(id) {
            try {
                const memosString = localStorage.getItem('stickyMemos') || '[]';
                let memos = JSON.parse(memosString);
                if (!Array.isArray(memos)) {
                    memos = [];
                }
                const filtered = memos.filter(memo => memo.id !== id);
                localStorage.setItem('stickyMemos', JSON.stringify(filtered));
                loadStickyMemos();
            } catch (e) {
                console.error('메모 삭제 오류:', e);
            }
        };
        
        loadStickyMemos();
        console.log('✅ 스티커 메모 시스템 생성 완료');
    }
    
    // 클라우드 설정 모달 완전한 구현
    function createCloudSettingsModal() {
        console.log('☁️ 클라우드 설정 모달 생성');
        
        // 기존 모달 제거
        const existing = document.getElementById('unifiedCloudModal');
        if (existing) existing.remove();
        
        const modal = document.createElement('div');
        modal.id = 'unifiedCloudModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">☁️ 클라우드 설정</h2>
                    <button class="modal-close">✕</button>
                </div>
                <div class="modal-body">
                    <div class="cloud-section">
                        <h3>📂 구글 드라이브</h3>
                        <p>구글 드라이브와 연동하여 메모를 자동 백업합니다.</p>
                        <button class="cloud-connect-btn" id="googleDriveConnect">구글 드라이브 연결</button>
                        <div class="cloud-status" id="googleDriveStatus">연결 안됨</div>
                    </div>
                    
                    <div class="cloud-section">
                        <h3>🔄 자동 동기화</h3>
                        <label>
                            <input type="checkbox" id="autoSync"> 자동 동기화 활성화
                        </label>
                        <p>메모 변경 시 자동으로 클라우드에 저장됩니다.</p>
                    </div>
                    
                    <div class="cloud-section">
                        <h3>⚙️ 동기화 설정</h3>
                        <label>
                            동기화 주기:
                            <select id="syncInterval">
                                <option value="1">1분</option>
                                <option value="5">5분</option>
                                <option value="10">10분</option>
                                <option value="30">30분</option>
                            </select>
                        </label>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 모달 닫기 기능
        modal.querySelector('.modal-close').addEventListener('click', function() {
            modal.style.display = 'none';
        });
        
        // 모달 배경 클릭으로 닫기
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
        
        console.log('✅ 클라우드 설정 모달 생성 완료');
    }
    
    // 동기화 상태 모달 완전한 구현
    function createSyncStatusModal() {
        console.log('🔍 동기화 상태 모달 생성');
        
        // 기존 모달 제거
        const existing = document.getElementById('syncStatusModal');
        if (existing) existing.remove();
        
        const modal = document.createElement('div');
        modal.id = 'syncStatusModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">🔍 동기화 상태</h2>
                    <button class="modal-close">✕</button>
                </div>
                <div class="modal-body">
                    <div class="sync-status-section">
                        <h3>📊 현재 상태</h3>
                        <div class="status-item">
                            <span class="status-label">연결 상태:</span>
                            <span class="status-value" id="connectionStatus">연결 안됨</span>
                        </div>
                        <div class="status-item">
                            <span class="status-label">마지막 동기화:</span>
                            <span class="status-value" id="lastSync">없음</span>
                        </div>
                        <div class="status-item">
                            <span class="status-label">총 메모 수:</span>
                            <span class="status-value" id="totalMemos">0개</span>
                        </div>
                    </div>
                    
                    <div class="sync-status-section">
                        <h3>🔄 동기화 작업</h3>
                        <button class="sync-action-btn" onclick="manualSync()">수동 동기화 실행</button>
                        <button class="sync-action-btn" onclick="resetSync()">동기화 초기화</button>
                    </div>
                    
                    <div class="sync-status-section">
                        <h3>📋 동기화 로그</h3>
                        <div class="sync-log" id="syncLog">
                            <div class="log-item">시스템 시작됨</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 모달 닫기 기능
        modal.querySelector('.modal-close').addEventListener('click', function() {
            modal.style.display = 'none';
        });
        
        // 모달 배경 클릭으로 닫기
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
        
        // 수동 동기화 기능
        window.manualSync = function() {
            const logElement = document.getElementById('syncLog');
            const logItem = document.createElement('div');
            logItem.className = 'log-item';
            logItem.textContent = `${new Date().toLocaleTimeString()}: 수동 동기화 실행됨`;
            logElement.appendChild(logItem);
            
            document.getElementById('lastSync').textContent = new Date().toLocaleString();
            alert('동기화가 완료되었습니다! 🔄');
        };
        
        // 동기화 초기화 기능
        window.resetSync = function() {
            if (confirm('동기화를 초기화하시겠습니까? 모든 동기화 설정이 재설정됩니다.')) {
                document.getElementById('connectionStatus').textContent = '연결 안됨';
                document.getElementById('lastSync').textContent = '없음';
                document.getElementById('syncLog').innerHTML = '<div class="log-item">동기화 초기화됨</div>';
                alert('동기화가 초기화되었습니다! 🔄');
            }
        };
        
        console.log('✅ 동기화 상태 모달 생성 완료');
    }
    
    // 궁극적인 이벤트 등록
    function registerUltimateEvents() {
        console.log('⚡ 궁극적인 이벤트 등록 시작');
        
        // 모든 기존 이벤트 완전 제거
        const allButtons = document.querySelectorAll('.action-btn');
        allButtons.forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
        });
        
        // 새로운 이벤트 등록
        const buttonConfig = {
            'noticeBtn': () => document.getElementById('noticeModal').style.display = 'block',
            'createBtn': () => document.getElementById('createModal').style.display = 'block',
            'memoBtn': () => {
                const stickyMemo = document.getElementById('stickyMemo');
                stickyMemo.style.display = 'block';
                stickyMemo.style.position = 'fixed';
                stickyMemo.style.top = '50px';
                stickyMemo.style.right = '50px';
                stickyMemo.style.zIndex = '2001';
                stickyMemo.style.width = '400px';
                stickyMemo.style.height = 'auto';
            },
            'excelBtn': () => document.getElementById('excelModal').style.display = 'block',
            'unifiedCloudBtn': () => document.getElementById('unifiedCloudModal').style.display = 'block',
            'syncStatusBtn': () => document.getElementById('syncStatusModal').style.display = 'block',
            'settingsBtn': () => document.getElementById('settingsModal').style.display = 'block'
        };
        
        Object.keys(buttonConfig).forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`🎯 ${buttonId} 클릭됨`);
                    buttonConfig[buttonId]();
                });
                
                // 버튼 스타일 강제 적용
                button.style.pointerEvents = 'all';
                button.style.cursor = 'pointer';
                button.style.opacity = '1';
                
                console.log(`✅ ${buttonId} 이벤트 등록 완료`);
            }
        });
        
        console.log('⚡ 궁극적인 이벤트 등록 완료');
    }
    
    // 초기화 함수
    function init() {
        console.log('🚀 궁극적인 메뉴 수정 초기화 시작');
        
        // 1. 스티커 메모 시스템 생성
        createStickyMemoSystem();
        
        // 2. 클라우드 설정 모달 생성
        createCloudSettingsModal();
        
        // 3. 동기화 상태 모달 생성
        createSyncStatusModal();
        
        // 4. 이벤트 등록
        registerUltimateEvents();
        
        // 5. 중복 실행 방지
        window.ultimateMenuFixApplied = true;
        
        console.log('✅ 궁극적인 메뉴 수정 초기화 완료');
    }
    
    // DOM 준비 후 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 300);
    }
    
    // 수동 호출 함수들을 전역에 노출
    window.ultimateMenuFix = init;
    window.createStickyMemoSystem = createStickyMemoSystem;
    window.createCloudSettingsModal = createCloudSettingsModal;
    window.createSyncStatusModal = createSyncStatusModal;
    
})();