/**
 * 메모 첨부파일 인라인 뷰어 - 직접 미리보기 기능
 */

(function() {
    'use strict';
    
    console.log('📎 메모 첨부파일 뷰어 시작');
    
    // 첨부파일 미리보기 함수
    window.showAttachmentPreview = function(fileName, fileType) {
        console.log('👁️ 첨부파일 미리보기 요청:', fileName, fileType);
        
        // IndexedDB에서 첨부파일 가져오기
        const request = indexedDB.open('DemoDatabase', 2);
        
        request.onsuccess = function(event) {
            const db = event.target.result;
            
            // attachments 테이블이 있는지 확인
            if (!db.objectStoreNames.contains('attachments')) {
                console.error('❌ attachments 테이블이 없습니다');
                return;
            }
            
            const transaction = db.transaction(['attachments'], 'readonly');
            const objectStore = transaction.objectStore('attachments');
            const getRequest = objectStore.get(fileName);
            
            getRequest.onsuccess = function(event) {
                const attachment = event.target.result;
                if (attachment && attachment.data) {
                    displayPreview(attachment);
                } else {
                    console.error('❌ 첨부파일을 찾을 수 없습니다:', fileName);
                    alert('첨부파일을 찾을 수 없습니다.');
                }
            };
            
            getRequest.onerror = function() {
                console.error('❌ 첨부파일 로드 실패');
                alert('첨부파일 로드에 실패했습니다.');
            };
        };
        
        request.onerror = function() {
            console.error('❌ IndexedDB 열기 실패');
        };
    };
    
    // 미리보기 표시 함수
    function displayPreview(attachment) {
        // 기존 미리보기 제거
        const existingPreview = document.getElementById('attachmentPreview');
        if (existingPreview) {
            existingPreview.remove();
        }
        
        // Blob 생성
        const blob = new Blob([attachment.data], { type: attachment.type });
        const url = URL.createObjectURL(blob);
        
        // 미리보기 모달 생성
        const modal = document.createElement('div');
        modal.id = 'attachmentPreview';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        // 파일 타입에 따라 다른 미리보기 생성
        let content = '';
        const fileType = attachment.type || '';
        const fileName = attachment.fileName || 'file';
        
        if (fileType.startsWith('image/')) {
            content = `<img src="${url}" style="max-width: 90%; max-height: 90%; object-fit: contain;">`;
        } else if (fileType.startsWith('video/')) {
            content = `<video src="${url}" controls style="max-width: 90%; max-height: 90%;"></video>`;
        } else if (fileType.startsWith('audio/')) {
            content = `<audio src="${url}" controls></audio>`;
        } else if (fileType === 'application/pdf') {
            content = `<iframe src="${url}" style="width: 90vw; height: 90vh; border: none;"></iframe>`;
        } else if (fileType.startsWith('text/') || fileType === 'application/json') {
            // 텍스트 파일은 내용을 직접 표시
            const reader = new FileReader();
            reader.onload = function(e) {
                const textContent = e.target.result;
                modal.innerHTML = `
                    <div style="background: white; padding: 20px; max-width: 90%; max-height: 90%; overflow: auto; border-radius: 8px;">
                        <h3 style="margin-top: 0;">${fileName}</h3>
                        <pre style="white-space: pre-wrap; word-wrap: break-word;">${escapeHtml(textContent)}</pre>
                        <button onclick="document.getElementById('attachmentPreview').remove()" style="margin-top: 10px; padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">닫기</button>
                    </div>
                `;
            };
            reader.readAsText(blob);
            modal.innerHTML = '<div style="color: white;">로딩 중...</div>';
            document.body.appendChild(modal);
            return;
        } else {
            // 지원하지 않는 파일 타입
            content = `
                <div style="background: white; padding: 20px; border-radius: 8px; text-align: center;">
                    <h3>${fileName}</h3>
                    <p>이 파일 타입은 미리보기를 지원하지 않습니다.</p>
                    <button onclick="window.downloadAttachment('${fileName}', '${fileType}')" style="margin: 10px; padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">다운로드</button>
                    <button onclick="document.getElementById('attachmentPreview').remove()" style="margin: 10px; padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">닫기</button>
                </div>
            `;
        }
        
        modal.innerHTML = `
            <div style="position: relative; max-width: 90%; max-height: 90%;">
                ${content}
                <button onclick="document.getElementById('attachmentPreview').remove()" style="position: absolute; top: -40px; right: 0; background: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 16px;">✕ 닫기</button>
            </div>
        `;
        
        // 모달 클릭 시 닫기
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        document.body.appendChild(modal);
    }
    
    // HTML 이스케이프 함수
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // 기존 다운로드 버튼을 미리보기 버튼으로 변경
    function convertToPreviewButtons() {
        const buttons = document.querySelectorAll('button[onclick*="downloadAttachment"]');
        console.log('🔄 변환할 버튼 개수:', buttons.length);
        
        buttons.forEach((button, index) => {
            const onclickStr = button.getAttribute('onclick');
            if (onclickStr) {
                // 파일명과 타입 추출
                const match = onclickStr.match(/downloadAttachment\('([^']+)',\s*'([^']*)'\)/);
                if (match) {
                    const fileName = match[1];
                    const fileType = match[2];
                    
                    // 미리보기 버튼으로 변경
                    button.setAttribute('onclick', `showAttachmentPreview('${fileName}', '${fileType}')`);
                    button.textContent = '👁️ 미리보기';
                    button.style.background = '#17a2b8';
                    console.log(`✅ 버튼 ${index + 1} 변환 완료:`, fileName);
                }
            }
        });
    }
    
    // DOM 변경 감지 및 자동 변환
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                // 새로운 첨부파일 버튼이 추가되었는지 확인
                const newButtons = Array.from(mutation.addedNodes)
                    .filter(node => node.nodeType === 1)
                    .flatMap(node => {
                        const buttons = [];
                        if (node.matches && node.matches('button[onclick*="downloadAttachment"]')) {
                            buttons.push(node);
                        }
                        if (node.querySelectorAll) {
                            buttons.push(...node.querySelectorAll('button[onclick*="downloadAttachment"]'));
                        }
                        return buttons;
                    });
                
                if (newButtons.length > 0) {
                    console.log('🆕 새로운 첨부파일 버튼 발견:', newButtons.length);
                    setTimeout(convertToPreviewButtons, 100);
                }
            }
        });
    });
    
    // DOM 감시 시작
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // 초기 변환 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', convertToPreviewButtons);
    } else {
        convertToPreviewButtons();
    }
    
    // 주기적으로 버튼 확인 및 변환
    setInterval(convertToPreviewButtons, 2000);
    
    console.log('✅ 메모 첨부파일 뷰어 초기화 완료');
})();