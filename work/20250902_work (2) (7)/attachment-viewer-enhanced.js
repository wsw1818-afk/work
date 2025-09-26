/**
 * Context7 MCP 기반 첨부파일 뷰어 - 메모의 첨부파일을 바로 열어서 확인
 * 이미지, PDF, 텍스트, 비디오, 오디오 등 다양한 파일 형식 지원
 */

(function() {
    'use strict';
    
    console.log('🔍 Context7 첨부파일 뷰어 초기화 - 스크립트 로드됨!');
    console.log('📍 현재 DOM 상태:', document.readyState);
    console.log('📍 기존 첨부파일 다운로드 버튼 개수:', document.querySelectorAll('button[onclick*="downloadAttachment"]').length);

    // ========== 뷰어 설정 ==========
    const viewerConfig = {
        supportedTypes: {
            image: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'],
            video: ['mp4', 'webm', 'ogg', 'mov', 'avi'],
            audio: ['mp3', 'wav', 'ogg', 'aac', 'm4a'],
            document: ['pdf'],
            text: ['txt', 'json', 'xml', 'csv', 'md', 'js', 'css', 'html'],
            office: ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'],
            archive: ['zip', 'rar', '7z', 'tar', 'gz']
        },
        maxPreviewSize: 50 * 1024 * 1024, // 50MB
        thumbnailSize: 150
    };

    // ========== 첨부파일 뷰어 UI 생성 ==========
    function createAttachmentViewer() {
        // 기존 뷰어 제거
        const existingViewer = document.getElementById('attachmentViewer');
        if (existingViewer) {
            existingViewer.remove();
        }

        const viewer = document.createElement('div');
        viewer.id = 'attachmentViewer';
        viewer.className = 'attachment-viewer-modal';
        viewer.style.display = 'none';

        viewer.innerHTML = `
            <div class="attachment-viewer-backdrop" id="viewerBackdrop"></div>
            <div class="attachment-viewer-container">
                <div class="attachment-viewer-header">
                    <div class="file-info">
                        <span class="file-name" id="viewerFileName">파일명</span>
                        <span class="file-details" id="viewerFileDetails">크기: 0KB</span>
                    </div>
                    <div class="viewer-controls">
                        <button id="downloadBtn" class="viewer-btn download-btn" title="다운로드">
                            💾
                        </button>
                        <button id="prevBtn" class="viewer-btn nav-btn" title="이전">
                            ◀
                        </button>
                        <button id="nextBtn" class="viewer-btn nav-btn" title="다음">
                            ▶
                        </button>
                        <button id="fullscreenBtn" class="viewer-btn fullscreen-btn" title="전체화면">
                            ⛶
                        </button>
                        <button id="closeBtn" class="viewer-btn close-btn" title="닫기">
                            ✕
                        </button>
                    </div>
                </div>
                <div class="attachment-viewer-content" id="viewerContent">
                    <div class="loading-indicator">로딩 중...</div>
                </div>
            </div>
        `;

        // CSS 스타일 추가
        const existingStyles = document.getElementById('attachmentViewerStyles');
        if (existingStyles) {
            existingStyles.remove();
        }

        const style = document.createElement('style');
        style.id = 'attachmentViewerStyles';
        style.textContent = `
            .attachment-viewer-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                z-index: 999999;
                display: flex;
                align-items: center;
                justify-content: center;
                background: transparent;
            }

            .attachment-viewer-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(5px);
            }

            .attachment-viewer-container {
                position: relative;
                width: 90vw;
                height: 90vh;
                max-width: 1200px;
                max-height: 800px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                display: flex;
                flex-direction: column;
                overflow: hidden;
                animation: slideIn 0.3s ease-out;
            }

            @keyframes slideIn {
                from { transform: scale(0.9); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }

            .attachment-viewer-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px 24px;
                background: #f8f9fa;
                border-bottom: 1px solid #dee2e6;
            }

            .file-info {
                display: flex;
                flex-direction: column;
                gap: 4px;
            }

            .file-name {
                font-weight: bold;
                font-size: 18px;
                color: #2c3e50;
                max-width: 300px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .file-details {
                font-size: 14px;
                color: #6c757d;
            }

            .viewer-controls {
                display: flex;
                gap: 8px;
            }

            .viewer-btn {
                padding: 10px 12px;
                border: none;
                background: #ffffff;
                border-radius: 8px;
                cursor: pointer;
                font-size: 16px;
                transition: all 0.2s;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                min-width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .viewer-btn:hover {
                background: #f8f9fa;
                transform: translateY(-1px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
            }

            .close-btn:hover {
                background: #dc3545;
                color: white;
            }

            .download-btn:hover {
                background: #28a745;
                color: white;
            }

            .nav-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
                transform: none;
            }

            .attachment-viewer-content {
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                background: #f8f9fa;
                position: relative;
            }

            .loading-indicator {
                font-size: 18px;
                color: #6c757d;
                animation: pulse 1.5s ease-in-out infinite;
            }

            @keyframes pulse {
                0%, 100% { opacity: 0.7; }
                50% { opacity: 1; }
            }

            .viewer-image {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }

            .viewer-video,
            .viewer-audio {
                max-width: 100%;
                max-height: 100%;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }

            .viewer-iframe {
                width: 95%;
                height: 95%;
                border: none;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }

            .viewer-text {
                width: 90%;
                height: 90%;
                padding: 24px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                overflow: auto;
                font-family: 'Consolas', 'Monaco', monospace;
                font-size: 14px;
                line-height: 1.6;
                white-space: pre-wrap;
                word-wrap: break-word;
            }

            .unsupported-file {
                text-align: center;
                padding: 40px;
                color: #6c757d;
            }

            .unsupported-file-icon {
                font-size: 48px;
                margin-bottom: 16px;
                display: block;
            }

            .file-icon {
                font-size: 24px;
                margin-right: 8px;
            }

            /* 다크모드 지원 */
            [data-theme="dark"] .attachment-viewer-container {
                background: #2d3748;
                color: #e2e8f0;
            }

            [data-theme="dark"] .attachment-viewer-header {
                background: #1a202c;
                border-color: #4a5568;
            }

            [data-theme="dark"] .file-name {
                color: #e2e8f0;
            }

            [data-theme="dark"] .viewer-btn {
                background: #4a5568;
                color: #e2e8f0;
            }

            [data-theme="dark"] .viewer-btn:hover {
                background: #2d3748;
            }

            [data-theme="dark"] .attachment-viewer-content {
                background: #2d3748;
            }

            [data-theme="dark"] .viewer-text {
                background: #1a202c;
                color: #e2e8f0;
            }

            /* 파일 형식별 아이콘 */
            .file-icon-image { color: #28a745; }
            .file-icon-video { color: #dc3545; }
            .file-icon-audio { color: #fd7e14; }
            .file-icon-document { color: #6f42c1; }
            .file-icon-text { color: #20c997; }
            .file-icon-office { color: #007bff; }
            .file-icon-archive { color: #6c757d; }
            .file-icon-unknown { color: #adb5bd; }

            /* 반응형 디자인 */
            @media (max-width: 768px) {
                .attachment-viewer-container {
                    width: 95vw;
                    height: 95vh;
                }
                
                .attachment-viewer-header {
                    padding: 12px 16px;
                }
                
                .file-name {
                    font-size: 16px;
                    max-width: 200px;
                }
                
                .viewer-btn {
                    padding: 8px 10px;
                    font-size: 14px;
                    min-width: 36px;
                    height: 36px;
                }
                
                .viewer-controls {
                    gap: 6px;
                }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(viewer);

        // 이벤트 리스너 등록
        setupViewerEvents(viewer);
        
        console.log('✅ 첨부파일 뷰어 UI 생성 완료');
    }

    // ========== 파일 타입 감지 ==========
    function getFileType(fileName) {
        const extension = fileName.split('.').pop().toLowerCase();
        for (const [type, extensions] of Object.entries(viewerConfig.supportedTypes)) {
            if (extensions.includes(extension)) {
                return { type, extension };
            }
        }
        return { type: 'unknown', extension };
    }

    // ========== 파일 크기 포맷팅 ==========
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // ========== 파일 아이콘 ==========
    function getFileIcon(fileType) {
        const icons = {
            image: '🖼️',
            video: '🎬',
            audio: '🎵',
            document: '📄',
            text: '📝',
            office: '📊',
            archive: '📦',
            unknown: '📄'
        };
        return icons[fileType] || icons.unknown;
    }

    // ========== IndexedDB에서 첨부파일 가져오기 ==========
    async function getAttachmentFromDB(attachmentId) {
        return new Promise((resolve, reject) => {
            console.log('📂 IndexedDB에서 첨부파일 로드 시작:', attachmentId);
            
            const request = indexedDB.open('CalendarApp', 1);
            
            request.onerror = () => {
                console.error('❌ IndexedDB 열기 실패');
                reject(new Error('데이터베이스를 열 수 없습니다'));
            };
            
            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(['attachments'], 'readonly');
                const store = transaction.objectStore('attachments');
                const getRequest = store.get(parseInt(attachmentId));
                
                getRequest.onsuccess = () => {
                    const result = getRequest.result;
                    console.log('📁 첨부파일 로드 결과:', result);
                    
                    if (result) {
                        resolve({
                            id: attachmentId,
                            fileName: result.fileName,
                            data: result.data,
                            size: result.size,
                            type: result.type
                        });
                    } else {
                        reject(new Error('첨부파일을 찾을 수 없습니다'));
                    }
                };
                
                getRequest.onerror = () => {
                    console.error('❌ 첨부파일 로드 실패');
                    reject(new Error('첨부파일 로드에 실패했습니다'));
                };
            };
        });
    }

    // ========== 메모 ID로 모든 첨부파일 가져오기 ==========
    async function getAttachmentsByMemoId(memoId) {
        // 간단한 구현 - 현재 첨부파일만 반환
        // 실제로는 메모 ID와 연결된 모든 첨부파일을 가져와야 함
        return [];
    }

    // ========== 첨부파일 뷰어 열기 ==========
    let currentAttachments = [];
    let currentIndex = 0;

    async function openAttachmentViewer(attachment, allAttachments = [], index = 0) {
        console.log('👁️ 첨부파일 뷰어 열기:', attachment);
        
        try {
            const viewer = document.getElementById('attachmentViewer');
            if (!viewer) {
                console.error('❌ 뷰어가 초기화되지 않음');
                return;
            }

            // 전역 상태 설정
            currentAttachments = allAttachments.length > 0 ? allAttachments : [attachment];
            currentIndex = index;

            // 파일 정보 표시
            const fileName = document.getElementById('viewerFileName');
            const fileDetails = document.getElementById('viewerFileDetails');
            const content = document.getElementById('viewerContent');

            if (fileName) fileName.textContent = attachment.fileName;
            if (fileDetails) {
                const fileType = getFileType(attachment.fileName);
                fileDetails.textContent = `${formatFileSize(attachment.size)} • ${fileType.type.toUpperCase()}`;
            }

            // 네비게이션 버튼 상태 업데이트
            updateNavigationButtons();

            // 파일 내용 로드
            await loadFileContent(attachment, content);

            // 뷰어 표시
            viewer.style.display = 'flex';
            
            console.log('✅ 첨부파일 뷰어 열기 완료');

        } catch (error) {
            console.error('❌ 첨부파일 뷰어 열기 실패:', error);
            alert('파일을 열 수 없습니다: ' + error.message);
        }
    }

    // ========== 파일 내용 로드 ==========
    async function loadFileContent(attachment, container) {
        if (!container) return;

        container.innerHTML = '<div class="loading-indicator">로딩 중...</div>';

        try {
            const fileType = getFileType(attachment.fileName);
            const blob = new Blob([attachment.data], { type: attachment.type });
            const url = URL.createObjectURL(blob);

            let content = '';

            switch (fileType.type) {
                case 'image':
                    content = `<img src="${url}" alt="${attachment.fileName}" class="viewer-image" />`;
                    break;

                case 'video':
                    content = `
                        <video controls class="viewer-video">
                            <source src="${url}" type="${attachment.type}">
                            비디오를 재생할 수 없습니다.
                        </video>
                    `;
                    break;

                case 'audio':
                    content = `
                        <audio controls class="viewer-audio">
                            <source src="${url}" type="${attachment.type}">
                            오디오를 재생할 수 없습니다.
                        </audio>
                    `;
                    break;

                case 'document':
                    if (fileType.extension === 'pdf') {
                        content = `<iframe src="${url}" class="viewer-iframe"></iframe>`;
                    } else {
                        content = getUnsupportedContent(attachment.fileName, fileType.type);
                    }
                    break;

                case 'text':
                    try {
                        const text = await blob.text();
                        content = `<div class="viewer-text">${text}</div>`;
                    } catch (error) {
                        content = getUnsupportedContent(attachment.fileName, fileType.type);
                    }
                    break;

                default:
                    content = getUnsupportedContent(attachment.fileName, fileType.type);
                    break;
            }

            container.innerHTML = content;

            // URL 정리는 약간의 지연 후에 실행
            setTimeout(() => URL.revokeObjectURL(url), 1000);

        } catch (error) {
            console.error('❌ 파일 내용 로드 실패:', error);
            container.innerHTML = getUnsupportedContent(attachment.fileName, 'unknown');
        }
    }

    // ========== 지원하지 않는 파일 형식 표시 ==========
    function getUnsupportedContent(fileName, fileType) {
        const icon = getFileIcon(fileType);
        return `
            <div class="unsupported-file">
                <span class="unsupported-file-icon">${icon}</span>
                <h3>미리보기를 지원하지 않는 형식입니다</h3>
                <p>${fileName}</p>
                <p>다운로드 버튼을 클릭하여 파일을 다운로드할 수 있습니다.</p>
            </div>
        `;
    }

    // ========== 네비게이션 버튼 업데이트 ==========
    function updateNavigationButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        if (prevBtn) {
            prevBtn.disabled = currentIndex <= 0;
        }
        
        if (nextBtn) {
            nextBtn.disabled = currentIndex >= currentAttachments.length - 1;
        }
    }

    // ========== 이벤트 리스너 설정 ==========
    function setupViewerEvents(viewer) {
        const backdrop = viewer.querySelector('#viewerBackdrop');
        const closeBtn = viewer.querySelector('#closeBtn');
        const downloadBtn = viewer.querySelector('#downloadBtn');
        const prevBtn = viewer.querySelector('#prevBtn');
        const nextBtn = viewer.querySelector('#nextBtn');
        const fullscreenBtn = viewer.querySelector('#fullscreenBtn');

        // 뷰어 닫기
        const closeViewer = () => {
            viewer.style.display = 'none';
            currentAttachments = [];
            currentIndex = 0;
        };

        if (backdrop) backdrop.onclick = closeViewer;
        if (closeBtn) closeBtn.onclick = closeViewer;

        // ESC 키로 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && viewer.style.display !== 'none') {
                closeViewer();
            }
        });

        // 다운로드
        if (downloadBtn) {
            downloadBtn.onclick = () => {
                if (currentAttachments[currentIndex]) {
                    const attachment = currentAttachments[currentIndex];
                    const blob = new Blob([attachment.data], { type: attachment.type });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = attachment.fileName;
                    a.click();
                    URL.revokeObjectURL(url);
                }
            };
        }

        // 이전/다음 네비게이션
        if (prevBtn) {
            prevBtn.onclick = () => {
                if (currentIndex > 0) {
                    currentIndex--;
                    const attachment = currentAttachments[currentIndex];
                    openAttachmentViewer(attachment, currentAttachments, currentIndex);
                }
            };
        }

        if (nextBtn) {
            nextBtn.onclick = () => {
                if (currentIndex < currentAttachments.length - 1) {
                    currentIndex++;
                    const attachment = currentAttachments[currentIndex];
                    openAttachmentViewer(attachment, currentAttachments, currentIndex);
                }
            };
        }

        // 전체화면
        if (fullscreenBtn) {
            fullscreenBtn.onclick = () => {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                    fullscreenBtn.innerHTML = '⛶';
                    fullscreenBtn.title = '전체화면';
                } else {
                    viewer.requestFullscreen();
                    fullscreenBtn.innerHTML = '⛶';
                    fullscreenBtn.title = '전체화면 해제';
                }
            };
        }
    }

    // ========== 메모 상세보기에 첨부파일 뷰어 버튼 추가 ==========
    function enhanceMemoDetailWithViewer() {
        // 기존 첨부파일 표시 영역에 뷰어 버튼 추가
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // 첨부파일 버튼 찾기
                        const attachmentButtons = node.querySelectorAll('button[onclick*="downloadAttachment"]');
                        attachmentButtons.forEach(addViewerButton);
                        console.log('🔍 새로 추가된 첨부파일 버튼:', attachmentButtons.length);
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // 기존 첨부파일 버튼에도 뷰어 버튼 추가
        const existingButtons = document.querySelectorAll('button[onclick*="downloadAttachment"]');
        console.log('🔍 기존 첨부파일 버튼:', existingButtons.length);
        existingButtons.forEach(addViewerButton);
    }

    // ========== 첨부파일 버튼에 뷰어 버튼 추가 ==========
    function addViewerButton(downloadBtn) {
        // 이미 뷰어 버튼이 있으면 건너뛰기
        if (downloadBtn.parentNode.querySelector('.view-attachment-btn')) {
            console.log('🔍 뷰어 버튼이 이미 존재:', downloadBtn);
            return;
        }
        
        console.log('🔍 뷰어 버튼 추가 중:', downloadBtn);

        const viewBtn = document.createElement('button');
        viewBtn.className = 'view-attachment-btn';
        viewBtn.innerHTML = '👁️';
        viewBtn.title = '파일 미리보기';
        viewBtn.style.cssText = `
            margin-left: 8px;
            padding: 4px 8px;
            border: 1px solid #dee2e6;
            background: #f8f9fa;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s;
        `;

        viewBtn.onmouseover = () => {
            viewBtn.style.background = '#e9ecef';
            viewBtn.style.borderColor = '#007bff';
        };

        viewBtn.onmouseout = () => {
            viewBtn.style.background = '#f8f9fa';
            viewBtn.style.borderColor = '#dee2e6';
        };

        // 첨부파일 ID 추출
        const onclickAttr = downloadBtn.getAttribute('onclick');
        const match = onclickAttr.match(/downloadAttachment\('([^']+)'/);
        if (match) {
            const attachmentId = match[1];
            console.log('🔍 첨부파일 ID:', attachmentId);
            
            viewBtn.onclick = async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                console.log('👁️ 뷰어 버튼 클릭됨:', attachmentId);
                
                try {
                    const fileData = await getAttachmentFromDB(attachmentId);
                    if (fileData) {
                        console.log('📁 첨부파일 데이터 로드됨:', fileData);
                        // 현재 메모의 모든 첨부파일 가져오기
                        const memoId = getCurrentMemoId();
                        const allAttachments = memoId ? await getAttachmentsByMemoId(memoId) : [fileData];
                        const currentIndex = allAttachments.findIndex(att => att.id === attachmentId);
                        
                        openAttachmentViewer(fileData, allAttachments, Math.max(0, currentIndex));
                    } else {
                        alert('첨부파일을 찾을 수 없습니다.');
                    }
                } catch (error) {
                    console.error('첨부파일 뷰어 열기 실패:', error);
                    alert('파일을 열 수 없습니다: ' + error.message);
                }
            };
        } else {
            console.warn('⚠️ downloadAttachment 함수 호출을 찾을 수 없음:', onclickAttr);
        }

        downloadBtn.parentNode.insertBefore(viewBtn, downloadBtn.nextSibling);
        console.log('✅ 뷰어 버튼 추가 완료');
    }

    // ========== 현재 메모 ID 가져오기 ==========
    function getCurrentMemoId() {
        // 메모 상세 모달에서 현재 메모 ID 찾기
        const modal = document.getElementById('memoDetailModal');
        if (modal && modal.style.display !== 'none') {
            const memoTitle = modal.querySelector('.modal-title');
            if (memoTitle && memoTitle.textContent.includes('메모 상세')) {
                // 메모 목록에서 현재 선택된 메모 찾기 (임시 방법)
                const selectedMemo = document.querySelector('.memo-item.selected');
                return selectedMemo ? selectedMemo.dataset.memoId : null;
            }
        }
        return null;
    }

    // ========== Context7 연동 - 메모 컨텍스트 추적 ==========
    function initializeContext7Integration() {
        // Context7이 있는 경우 메모 컨텍스트 저장
        if (window.context7 && typeof window.context7.saveContext === 'function') {
            console.log('🔄 Context7과 연동하여 첨부파일 뷰 기록');
            
            // 원본 뷰어 열기 함수를 래핑
            const originalOpenViewer = openAttachmentViewer;
            openAttachmentViewer = async function(attachment, allAttachments, currentIndex) {
                try {
                    // Context7에 뷰어 사용 기록 저장
                    await window.context7.saveContext({
                        type: 'attachment_view',
                        fileName: attachment.fileName,
                        fileType: getFileType(attachment.fileName).type,
                        timestamp: Date.now(),
                        memoId: getCurrentMemoId()
                    });
                } catch (error) {
                    console.warn('Context7 연동 실패:', error);
                }
                
                return originalOpenViewer(attachment, allAttachments, currentIndex);
            };
        }
    }

    // ========== 초기화 ==========
    function initializeAttachmentViewer() {
        // DOM이 로드된 후 실행
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(initializeAttachmentViewer, 100);
            });
            return;
        }

        createAttachmentViewer();
        enhanceMemoDetailWithViewer();
        initializeContext7Integration();

        console.log('🎯 Context7 첨부파일 뷰어 초기화 완료');
        
        // 5초 후 추가 스캔 (동적 로딩된 콘텐츠 대응)
        setTimeout(() => {
            console.log('🔄 지연 스캔 시작...');
            const buttons = document.querySelectorAll('button[onclick*="downloadAttachment"]');
            console.log('📍 지연 스캔 결과 - 첨부파일 버튼:', buttons.length);
            buttons.forEach(addViewerButton);
            
            // 수동으로도 한번 더 확인 (btn-attachment 클래스 사용)
            const attachmentButtons = document.querySelectorAll('button.btn-attachment');
            console.log('📍 btn-attachment 클래스 버튼:', attachmentButtons.length);
            attachmentButtons.forEach(addViewerButton);
        }, 5000);
        
        // 10초 후에도 한번 더 스캔 (확실하게)
        setTimeout(() => {
            console.log('🔄 최종 스캔 시작...');
            const allButtons = document.querySelectorAll('button');
            const downloadButtons = Array.from(allButtons).filter(btn => {
                const onclick = btn.getAttribute('onclick');
                return onclick && onclick.includes('downloadAttachment');
            });
            console.log('📍 최종 스캔 - 다운로드 버튼:', downloadButtons.length);
            downloadButtons.forEach(addViewerButton);
        }, 10000);
    }

    // ========== 전역 함수 등록 ==========
    window.openAttachmentViewer = openAttachmentViewer;
    window.attachmentViewerUtils = {
        getFileType,
        formatFileSize,
        getFileIcon
    };

    // 초기화 실행
    try {
        initializeAttachmentViewer();
        console.log('✅ 첨부파일 뷰어 초기화 성공');
    } catch (error) {
        console.error('❌ 첨부파일 뷰어 초기화 실패:', error);
    }

})();