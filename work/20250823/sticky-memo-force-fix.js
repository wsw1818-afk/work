/**
 * 스티커 메모 강제 수정 스크립트
 * 모든 이벤트 충돌을 해결하고 스티커 메모를 강제로 작동시킴
 */

(function() {
    'use strict';
    
    console.log('🔧 스티커 메모 강제 수정 시작');
    
    // DOM이 준비될 때까지 대기
    function waitForDOM(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            setTimeout(callback, 100);
        }
    }
    
    // 스티커 메모 강제 생성
    function createStickyMemo() {
        console.log('🗒️ 스티커 메모 강제 생성');
        
        // 기존 제거
        const existing = document.getElementById('stickyMemo');
        if (existing) existing.remove();
        
        const sticky = document.createElement('div');
        sticky.id = 'stickyMemo';
        sticky.className = 'sticky-memo';
        sticky.style.cssText = `
            display: none;
            position: fixed;
            top: 50px;
            right: 50px;
            width: 400px;
            min-height: 500px;
            z-index: 10001;
            background: #fff3cd;
            border: 2px solid #ffc107;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            font-family: 'Malgun Gothic', sans-serif;
        `;
        
        sticky.innerHTML = `
            <div style="background: #ffc107; color: #8b5a00; padding: 10px; border-radius: 8px 8px 0 0; display: flex; justify-content: space-between; align-items: center; cursor: move;">
                <span style="font-weight: bold;">🗒️ 스티커 메모</span>
                <button onclick="document.getElementById('stickyMemo').style.display='none'" style="background: transparent; border: none; color: #8b5a00; cursor: pointer; font-size: 20px; font-weight: bold;">✕</button>
            </div>
            <div style="padding: 15px;">
                <textarea id="stickyTextarea" placeholder="메모를 입력하세요..." style="width: 100%; height: 200px; margin-bottom: 10px; padding: 10px; border: 1px solid #ddd; border-radius: 5px; resize: vertical; box-sizing: border-box;"></textarea>
                <button onclick="saveStickyMemoForce()" style="background: #ffc107; color: #8b5a00; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold; margin-right: 10px;">💾 저장</button>
                <button onclick="clearStickyMemos()" style="background: #dc3545; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold;">🗑️ 전체삭제</button>
                <div id="stickyList" style="margin-top: 15px; max-height: 200px; overflow-y: auto;"></div>
            </div>
        `;
        
        document.body.appendChild(sticky);
        console.log('✅ 스티커 메모 생성 완료');
        
        return sticky;
    }
    
    // 스티커 메모 저장 함수 (강제)
    window.saveStickyMemoForce = function() {
        console.log('💾 스티커 메모 저장');
        const textarea = document.getElementById('stickyTextarea');
        const content = textarea ? textarea.value.trim() : '';
        
        if (content) {
            let memos = [];
            try {
                memos = JSON.parse(localStorage.getItem('stickyMemos') || '[]');
            } catch(e) {
                memos = [];
            }
            
            memos.push({
                id: Date.now(),
                content: content,
                date: new Date().toLocaleString()
            });
            
            localStorage.setItem('stickyMemos', JSON.stringify(memos));
            textarea.value = '';
            loadStickyMemos();
            alert('메모가 저장되었습니다! 💾');
        } else {
            alert('메모 내용을 입력해주세요.');
        }
    };
    
    // 스티커 메모 로드
    function loadStickyMemos() {
        const list = document.getElementById('stickyList');
        if (!list) return;
        
        let memos = [];
        try {
            memos = JSON.parse(localStorage.getItem('stickyMemos') || '[]');
        } catch(e) {
            memos = [];
        }
        
        list.innerHTML = '';
        memos.reverse().forEach((memo, index) => {
            const item = document.createElement('div');
            item.style.cssText = `
                background: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 5px;
                padding: 10px;
                margin-bottom: 10px;
                position: relative;
            `;
            item.innerHTML = `
                <div style="font-size: 14px; margin-bottom: 5px; white-space: pre-wrap;">${memo.content}</div>
                <div style="font-size: 11px; color: #666; margin-bottom: 5px;">${memo.date}</div>
                <button onclick="deleteStickyMemoForce(${memo.id})" style="background: #dc3545; color: white; border: none; padding: 2px 8px; border-radius: 3px; cursor: pointer; font-size: 11px;">🗑️ 삭제</button>
            `;
            list.appendChild(item);
        });
    }
    
    // 스티커 메모 삭제 (강제)
    window.deleteStickyMemoForce = function(id) {
        let memos = [];
        try {
            memos = JSON.parse(localStorage.getItem('stickyMemos') || '[]');
        } catch(e) {
            memos = [];
        }
        memos = memos.filter(m => m.id !== id);
        localStorage.setItem('stickyMemos', JSON.stringify(memos));
        loadStickyMemos();
    };
    
    // 전체 삭제
    window.clearStickyMemos = function() {
        if (confirm('모든 메모를 삭제하시겠습니까?')) {
            localStorage.removeItem('stickyMemos');
            loadStickyMemos();
            alert('모든 메모가 삭제되었습니다.');
        }
    };
    
    // 스티커 메모 강제 열기 함수
    window.openStickyMemoForce = function() {
        console.log('🗒️ 스티커 메모 강제 열기');
        
        // 모든 모달 닫기
        document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
        
        let sticky = document.getElementById('stickyMemo');
        if (!sticky) {
            sticky = createStickyMemo();
        }
        
        if (sticky) {
            sticky.style.display = 'block';
            sticky.style.visibility = 'visible';
            sticky.style.opacity = '1';
            sticky.style.zIndex = '10001';
            console.log('✅ 스티커 메모 표시 완료');
            loadStickyMemos();
        }
    };
    
    // 스티커 버튼 강제 이벤트 등록
    function setupStickyButton() {
        console.log('🔧 스티커 버튼 강제 이벤트 등록');
        
        const memoBtn = document.getElementById('memoBtn');
        if (!memoBtn) {
            console.error('❌ 스티커 버튼을 찾을 수 없음');
            return;
        }
        
        // 모든 기존 이벤트 완전 제거
        const newBtn = memoBtn.cloneNode(true);
        memoBtn.parentNode.replaceChild(newBtn, memoBtn);
        
        // 강력한 이벤트 등록 (캡처링과 버블링 둘다)
        ['click', 'mousedown', 'touchstart'].forEach(eventType => {
            // 캡처링 단계
            newBtn.addEventListener(eventType, function(e) {
                if (eventType === 'click') {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    console.log('🔥 스티커 버튼 클릭! (캡처링)');
                    window.openStickyMemoForce();
                    return false;
                }
            }, true);
            
            // 버블링 단계
            newBtn.addEventListener(eventType, function(e) {
                if (eventType === 'click') {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    console.log('🔥 스티커 버튼 클릭! (버블링)');
                    window.openStickyMemoForce();
                    return false;
                }
            }, false);
        });
        
        // CSS 강제 적용
        newBtn.style.cssText += `
            pointer-events: all !important;
            cursor: pointer !important;
            z-index: 9999 !important;
            position: relative !important;
            user-select: none !important;
        `;
        
        console.log('✅ 스티커 버튼 강제 이벤트 등록 완료');
    }
    
    // 초기화
    function init() {
        console.log('🚀 스티커 메모 강제 수정 초기화');
        
        // 스티커 메모 생성
        createStickyMemo();
        
        // 버튼 이벤트 등록
        setupStickyButton();
        
        console.log('✅ 스티커 메모 강제 수정 완료');
    }
    
    // 실행
    waitForDOM(() => {
        setTimeout(init, 500);
    });
    
})();