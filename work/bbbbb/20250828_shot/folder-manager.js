class FolderMediaManager {
    constructor() {
        this.socket = null;
        this.currentFile = null;
        this.categories = [];
        this.downloadFiles = [];
        this.filteredFiles = []; // 필터링된 파일들
        this.autoSortRules = JSON.parse(localStorage.getItem('autoSortRules')) || [];
        
        // 테스트용 기본 규칙 추가 (규칙이 없을 경우)
        if (this.autoSortRules.length === 0) {
            this.autoSortRules = [
                { keyword: '게임', category: '1' },
                { keyword: '하이', category: '2' }
            ];
            localStorage.setItem('autoSortRules', JSON.stringify(this.autoSortRules));
            console.log('🔧 기본 자동 분류 규칙 추가됨:', this.autoSortRules);
        }
        this.selectedFiles = new Set(); // 선택된 파일들 관리 (다운로드 폴더)
        this.selectedCategoryFiles = new Set(); // 선택된 카테고리 파일들 관리
        this.currentCategory = ''; // 현재 열린 카테고리
        this.baseURL = 'http://localhost:3000'; // 기본 URL 설정
        this.sortBy = 'name'; // 기본 정렬: 이름순
        this.filterText = ''; // 필터 텍스트
        this.filterType = 'all'; // 파일 타입 필터
        this.init();
    }

    init() {
        this.connectSocket();
        this.setupEventListeners();
        this.loadCategories();
        this.loadDownloadFiles();
        this.loadAutoSortRules();
    }

    connectSocket() {
        this.socket = io(this.baseURL);
        
        this.socket.on('connect', () => {
            console.log('✅ 서버 연결됨');
            this.updateConnectionStatus(true);
        });

        this.socket.on('disconnect', () => {
            console.log('❌ 서버 연결 끊김');
            this.updateConnectionStatus(false);
        });

        this.socket.on('newFileDetected', (data) => {
            console.log('📥 새 파일 감지:', data.fileName);
            this.showNotification(`새 파일: ${data.fileName}`);
            
            // 파일을 로컬 배열에 직접 추가하여 불필요한 서버 호출 방지
            if (!this.downloadFiles.some(f => f.name === data.fileName)) {
                this.downloadFiles.push({ 
                    name: data.fileName,
                    size: data.size || 0,
                    modified: data.modified || new Date().toISOString()
                });
                this.displayDownloadFiles();
                this.updateDownloadFileCount();
            }
            
            // 자동 분류 규칙 확인 (약간의 지연을 두어 파일 로딩 완료 대기)
            setTimeout(() => {
                this.checkAutoSort(data.fileName);
            }, 500);
        });

        this.socket.on('fileMoved', (data) => {
            console.log('📁 파일 이동됨:', data);
            
            // 서버가 파일 이동을 성공했을 때만 UI 동기화 수행
            // data.success가 명시적으로 true일 때만 처리
            if (data.success !== true) {
                console.log('⚠️ 파일 이동 미확인 - UI 동기화 스킵:', data);
                return;
            }
            
            // 서버에서 확실히 파일이 이동되었으므로 다운로드 폴더 동기화
            if (data.from === 'download') {
                // 다운로드 폴더에서 파일이 나간 경우, 로컬 데이터와 UI 동기화
                const fileIndex = this.downloadFiles.findIndex(f => f.name === data.fileName);
                if (fileIndex !== -1) {
                    this.downloadFiles.splice(fileIndex, 1);
                    this.selectedFiles.delete(data.fileName);
                    this.displayDownloadFiles();
                    this.updateDownloadFileCount();
                    console.log(`🔄 다운로드 폴더 동기화: ${data.fileName} 제거됨`);
                } else {
                    console.log(`⚠️ 다운로드 폴더에서 ${data.fileName} 파일을 찾을 수 없음 - 전체 새로고침 실행`);
                    // 파일을 찾지 못한 경우 전체 새로고침으로 동기화
                    this.loadDownloadFiles();
                }
            }
            
            // 다운로드 폴더로 파일이 이동된 경우 (카테고리에서 → 다운로드 폴더로)
            if (data.category === 'download' && data.from !== 'download') {
                // 다운로드 폴더 새로고침
                this.loadDownloadFiles();
                console.log(`🔄 다운로드 폴더 동기화: ${data.fileName} 파일 추가됨 (${data.from} → 다운로드)`);
                // 소스 카테고리 개수 감소는 하단 통합 로직에서 처리
            }
            
            // 카테고리 모달이 열려있는 경우 파일 이동에 따른 UI 즉시 업데이트
            const modal = document.getElementById('categoryContentModal');
            if (modal && modal.style.display === 'flex') {
                const currentCategory = document.getElementById('categoryContentTitle').textContent.replace('📂 ', '').split(' (')[0];
                
                // 현재 표시중인 카테고리에서 파일이 나간 경우 즉시 UI 제거
                if (data.from && data.from !== 'download' && currentCategory === data.from) {
                    const fileElement = document.querySelector(`.file-item[data-filename="${data.fileName}"]`);
                    if (fileElement) {
                        fileElement.remove();
                        console.log(`🔄 카테고리 모달 UI 동기화: ${data.fileName} 파일 요소 제거됨 (${data.from} → ${data.category})`);
                    }
                    
                    // 하위 폴더가 열려있는 경우 해당 폴더에서도 파일 제거
                    const subfolderElements = document.querySelectorAll(`.file-item[data-filename="${data.fileName}"]`);
                    subfolderElements.forEach(element => {
                        element.remove();
                        console.log(`🔄 하위 폴더 UI 동기화: ${data.fileName} 파일 요소 제거됨`);
                    });
                }
                
                // 현재 표시중인 카테고리로 파일이 들어온 경우 즉시 UI 추가
                if (data.category && data.category !== 'download' && currentCategory === data.category) {
                    // 파일이 이미 존재하는지 확인
                    const existingElement = document.querySelector(`.file-item[data-filename="${data.fileName}"]`);
                    if (!existingElement) {
                        this.addFileToCurrentModal(data.fileName);
                        console.log(`🔄 카테고리 모달 UI 동기화: ${data.fileName} 파일 요소 추가됨 (${data.from || '다운로드'} → ${data.category})`);
                    }
                }
            }
            
            // 파일 개수 업데이트 (중복 제거된 통합 로직)
            if (data.category && data.category !== 'download') {
                // 다운로드 → 카테고리 이동: 대상 카테고리 증가
                if (data.from === 'download') {
                    this.updateCategoryFileCount(data.category, 1);
                    // 새로 생성된 카테고리 가능성이 있으므로 잠깐 후 카테고리 목록 새로고침
                    setTimeout(() => {
                        this.loadCategories();
                    }, 200);
                } 
                // 카테고리 간 이동: 대상 증가
                else if (data.from && data.from !== 'download') {
                    this.updateCategoryFileCount(data.category, 1);
                }
            }
            
            // 소스 카테고리 파일 개수 감소 (카테고리 → 카테고리/다운로드)
            if (data.from && data.from !== 'download') {
                this.updateCategoryFileCount(data.from, -1);
            }
        });

        this.socket.on('downloadFolderRecreated', (data) => {
            console.log('📁 다운로드 폴더 재생성됨:', data);
            this.showNotification(data.message);
            this.loadDownloadFiles();
        });

        this.socket.on('downloadFolderCreated', (data) => {
            console.log('📁 다운로드 폴더 생성됨:', data);
            this.showNotification(data.message);
            this.loadDownloadFiles();
        });
    }

    updateConnectionStatus(connected) {
        const status = document.getElementById('connectionStatus');
        if (connected) {
            status.textContent = '● 연결됨';
            status.className = 'status-connected';
        } else {
            status.textContent = '● 연결 안됨';
            status.className = 'status-disconnected';
        }
    }

    setupEventListeners() {
        // 새로고침 버튼
        document.getElementById('refreshDownloads').addEventListener('click', () => {
            this.loadDownloadFiles();
        });

        // 새 카테고리 버튼
        document.getElementById('addCategoryBtn').addEventListener('click', () => {
            this.showCategoryModal();
        });

        // 카테고리 폼
        document.getElementById('categoryForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createCategory();
        });

        // 폴더 이름 변경 폼
        document.getElementById('renameFolderForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.renameSubfolder();
        });

        // 폴더 이름 변경 모달 취소 버튼
        document.querySelector('#renameFolderModal .cancel-btn').addEventListener('click', () => {
            document.getElementById('renameFolderModal').style.display = 'none';
        });

        // 모달 닫기 - X 버튼
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal, .preview-modal').style.display = 'none';
            });
        });

        // 모달 닫기 - 모달 외부 클릭 (배경에서 충분히 떨어진 곳만)
        document.addEventListener('click', (e) => {
            // 모달 또는 preview-modal을 클릭한 경우
            const modal = e.target.closest('.modal') || e.target.closest('.preview-modal');
            if (modal && e.target === modal) {
                const modalContent = modal.querySelector('.modal-content');
                if (modalContent) {
                    const rect = modalContent.getBoundingClientRect();
                    const clickX = e.clientX;
                    const clickY = e.clientY;
                    
                    // 모달 내용 영역에서 200px 이상 떨어진 곳을 클릭한 경우에만 닫기
                    const margin = 200;
                    const isOutsideModal = (
                        clickX < rect.left - margin || 
                        clickX > rect.right + margin ||
                        clickY < rect.top - margin || 
                        clickY > rect.bottom + margin
                    );
                    
                    if (isOutsideModal) {
                        modal.style.display = 'none';
                    }
                } else {
                    // modalContent가 없는 경우 기본 동작
                    modal.style.display = 'none';
                }
            }
        });

        // 파일 이동 버튼
        document.getElementById('moveFileBtn').addEventListener('click', () => {
            this.moveFileToCategory();
        });

        // 자동 분류 버튼
        document.getElementById('autoSortBtn').addEventListener('click', () => {
            this.executeAutoSort();
        });

        // 규칙 추가 버튼
        document.getElementById('addRuleBtn').addEventListener('click', () => {
            this.addAutoSortRule();
        });

        // 자동 분류 설정 메뉴 토글
        document.getElementById('autoSortSettingsBtn').addEventListener('click', () => {
            this.toggleAutoSortSettings();
        });

        // 설정 메뉴 닫기
        document.getElementById('closeSettingsBtn').addEventListener('click', () => {
            this.closeAutoSortSettings();
        });

        // 설정 저장
        document.getElementById('saveSettingsBtn').addEventListener('click', () => {
            this.saveAutoSortSettings();
        });

        // 일괄 선택 기능
        document.getElementById('selectAllBtn').addEventListener('click', () => {
            this.toggleSelectAll();
        });

        // 일괄 이름 변경
        document.getElementById('batchRenameBtn').addEventListener('click', () => {
            this.showBatchRenameModal();
        });

        // 일괄 이름 변경 적용
        document.getElementById('applyBatchRename').addEventListener('click', () => {
            this.applyBatchRename();
        });

        // 일괄 이동 버튼
        document.getElementById('batchMoveBtn').addEventListener('click', () => {
            this.showDownloadBatchMoveModal();
        });

        // 일괄 이동 적용
        document.getElementById('applyDownloadBatchMove').addEventListener('click', () => {
            this.applyDownloadBatchMove();
        });

        // 정렬 컨트롤
        document.getElementById('sortSelect').addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.displayDownloadFiles(); // 새로고침과 함께 정렬 적용
        });

        // 필터 입력
        document.getElementById('filterInput').addEventListener('input', (e) => {
            this.filterText = e.target.value.toLowerCase();
            this.displayDownloadFiles(); // 새로고침과 함께 필터 적용
        });

        // 타입 필터
        document.getElementById('typeFilter').addEventListener('change', (e) => {
            this.filterType = e.target.value;
            this.displayDownloadFiles(); // 새로고침과 함께 필터 적용
        });

        // 카테고리 파일 선택 기능
        document.getElementById('categorySelectAllBtn').addEventListener('click', () => {
            this.toggleCategorySelectAll();
        });

        // 카테고리 일괄 이름 변경
        document.getElementById('categoryBatchRenameBtn').addEventListener('click', () => {
            this.showCategoryBatchRenameModal();
        });

        // 카테고리 일괄 이동
        document.getElementById('categoryBatchMoveBtn').addEventListener('click', () => {
            this.showCategoryBatchMoveModal();
        });

        // 카테고리 일괄 이동 적용
        document.getElementById('applyCategoryBatchMove').addEventListener('click', () => {
            this.applyCategoryBatchMove();
        });

        // 카테고리 이동 목적지 라디오 버튼
        document.querySelectorAll('input[name="moveDestination"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const categorySelect = document.getElementById('categoryMoveSelect');
                if (e.target.value === 'category') {
                    categorySelect.style.display = 'block';
                    this.updateCategoryMoveSelect();
                } else {
                    categorySelect.style.display = 'none';
                }
            });
        });

        // 드래그 앤 드롭 설정
        this.setupDragAndDrop();
        this.setupDownloadDropZone();
    }

    setupDragAndDrop() {
        // 헬퍼 함수: closest 대체
        const findParentElement = (element, className) => {
            let current = element;
            while (current && current.parentElement) {
                if (current.classList && current.classList.contains(className)) {
                    return current;
                }
                current = current.parentElement;
            }
            return null;
        };

        // 전역 드래그 시작 이벤트
        document.addEventListener('dragstart', (e) => {
            const downloadFile = findParentElement(e.target, 'download-file');
            const categoryFile = findParentElement(e.target, 'category-file-item');
            
            if (downloadFile) {
                console.log('🎯 다운로드 파일 드래그 시작:', downloadFile.dataset.fileName);
                console.log('📋 선택된 파일 상태:', {
                    totalSelected: this.selectedFiles.size,
                    selectedFiles: Array.from(this.selectedFiles),
                    isDraggedFileSelected: this.selectedFiles.has(downloadFile.dataset.fileName)
                });
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', downloadFile.dataset.fileName);
                e.dataTransfer.setData('fileName', downloadFile.dataset.fileName);
                e.dataTransfer.setData('source', 'download');
                downloadFile.classList.add('dragging');
                document.getElementById('dragOverlay').style.display = 'flex';
            } else if (categoryFile && categoryFile.dataset.fileName) {
                console.log('🎯 카테고리 파일 드래그 시작:', categoryFile.dataset.fileName);
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', categoryFile.dataset.fileName);
                e.dataTransfer.setData('fileName', categoryFile.dataset.fileName);
                e.dataTransfer.setData('source', 'category');
                e.dataTransfer.setData('sourceCategory', categoryFile.dataset.sourceCategory);
                categoryFile.classList.add('dragging');
                document.getElementById('dragOverlay').style.display = 'flex';
            }
        });

        // 전역 드래그 종료 이벤트
        document.addEventListener('dragend', (e) => {
            const downloadFile = findParentElement(e.target, 'download-file');
            const categoryFile = findParentElement(e.target, 'category-file-item');
            
            if (downloadFile) {
                downloadFile.classList.remove('dragging');
                document.getElementById('dragOverlay').style.display = 'none';
            } else if (categoryFile) {
                categoryFile.classList.remove('dragging');
                document.getElementById('dragOverlay').style.display = 'none';
            }
        });

        // 전역 드롭 이벤트 (빈 공간에 드롭 방지)
        document.addEventListener('dragover', (e) => {
            // 카테고리 폴더나 다운로드 섹션이 아닌 곳에서는 드롭 방지
            const categoryFolder = findParentElement(e.target, 'category-folder');
            const downloadSection = findParentElement(e.target, 'download-section');
            if (!categoryFolder && !downloadSection) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'none';
            }
        });

        document.addEventListener('drop', (e) => {
            // 카테고리 폴더나 다운로드 섹션이 아닌 곳에서는 드롭 방지
            const categoryFolder = findParentElement(e.target, 'category-folder');
            const downloadSection = findParentElement(e.target, 'download-section');
            if (!categoryFolder && !downloadSection) {
                console.log('잘못된 위치에 드롭 시도');
                e.preventDefault();
            }
        });
    }

    setupDownloadDropZone() {
        const downloadSection = document.querySelector('.download-section');
        
        downloadSection.addEventListener('dragover', (e) => {
            // 모든 드래그를 허용 (카테고리 파일만)
            const source = e.dataTransfer.types.includes('text/plain') ? 'category' : null;
            if (source) {
                console.log('다운로드 폴더 위로 드래그');
                e.preventDefault();
                downloadSection.classList.add('drag-over-download');
            }
        });

        downloadSection.addEventListener('dragleave', (e) => {
            console.log('다운로드 폴더에서 드래그 벗어남');
            if (!downloadSection.contains(e.relatedTarget)) {
                downloadSection.classList.remove('drag-over-download');
            }
        });

        downloadSection.addEventListener('drop', async (e) => {
            console.log('다운로드 폴더에 드롭');
            e.preventDefault();
            e.stopPropagation();
            downloadSection.classList.remove('drag-over-download');
            
            const source = e.dataTransfer.getData('source');
            const fileName = e.dataTransfer.getData('fileName');
            const sourceCategory = e.dataTransfer.getData('sourceCategory');
            
            console.log(`다운로드 폴더 드롭: ${fileName} (${source}) 출처: ${sourceCategory}`);
            
            if (source === 'category' && sourceCategory) {
                // Socket.IO 이벤트에서 UI 동기화 처리 - 드래그앤드롭에서는 즉시 제거하지 않음
                await this.moveToDownload(fileName, sourceCategory);
            } else {
                console.log('다운로드 폴더로 이동할 수 없는 파일 타입');
            }
        });

        // 헬퍼 함수 재사용을 위해 전역 스코프로 이동
        const findParentElement = (element, className) => {
            let current = element;
            while (current && current.parentElement) {
                if (current.classList && current.classList.contains(className)) {
                    return current;
                }
                current = current.parentElement;
            }
            return null;
        };
    }

    async loadCategories() {
        try {
            const response = await fetch(`${this.baseURL}/api/categories`);
            this.categories = await response.json();
            this.displayCategories();
            this.updateCategorySelects();
        } catch (error) {
            console.error('카테고리 로드 오류:', error);
        }
    }

    displayCategories() {
        const grid = document.getElementById('categoriesGrid');
        grid.innerHTML = '';

        console.log('카테고리 표시 중:', this.categories.length + '개');

        this.categories.forEach(category => {
            console.log('카테고리 생성:', category.name);
            const folderDiv = document.createElement('div');
            folderDiv.className = 'category-folder';
            folderDiv.dataset.category = category.name;
            
            folderDiv.innerHTML = `
                <div class="folder-icon">📁</div>
                <div class="folder-name">${category.name}</div>
                <div class="folder-count">${category.fileCount}개 파일</div>
                <div class="category-hover-actions">
                    <button class="folder-rename hover-btn" data-category="${category.name}" title="이름변경">✏️</button>
                    <button class="folder-delete hover-btn" data-category="${category.name}" title="삭제">🗑️</button>
                </div>
                <button class="folder-open main-action" data-category="${category.name}">👁️ 열기</button>
            `;

            // 폴더 열기
            folderDiv.querySelector('.folder-open').addEventListener('click', (e) => {
                this.openCategoryFolder(e.target.dataset.category);
            });

            // 폴더 이름변경
            folderDiv.querySelector('.folder-rename').addEventListener('click', (e) => {
                console.log('카테고리 이름변경 버튼 클릭됨');
                const categoryName = e.target.dataset.category;
                console.log('변경할 카테고리:', categoryName);
                this.showCategoryRenameModal(categoryName);
            });

            // 폴더 삭제
            folderDiv.querySelector('.folder-delete').addEventListener('click', async (e) => {
                const confirmed = await this.showConfirm(
                    '카테고리 삭제', 
                    `'${category.name}' 카테고리를 삭제하시겠습니까?\n\n카테고리 내 모든 파일이 다운로드 폴더로 이동됩니다.`
                );
                if (confirmed) {
                    await this.deleteCategory(category.name);
                }
            });

            // 드래그 앤 드롭 이벤트 리스너 추가
            console.log(`${category.name} 카테고리에 드래그 이벤트 리스너 추가`);
            
            folderDiv.addEventListener('dragover', (e) => {
                console.log('카테고리 위로 드래그:', category.name);
                e.preventDefault();
                folderDiv.classList.add('drag-over');
            });

            folderDiv.addEventListener('dragleave', (e) => {
                console.log('카테고리에서 드래그 벗어남:', category.name);
                // 자식 요소로의 이동은 무시
                if (!folderDiv.contains(e.relatedTarget)) {
                    folderDiv.classList.remove('drag-over');
                }
            });

            folderDiv.addEventListener('drop', async (e) => {
                console.log('카테고리에 드롭:', category.name);
                e.preventDefault();
                e.stopPropagation();
                folderDiv.classList.remove('drag-over');
                
                const fileName = e.dataTransfer.getData('fileName');
                const source = e.dataTransfer.getData('source');
                const sourceCategory = e.dataTransfer.getData('sourceCategory');
                
                if (source === 'download') {
                    // 선택된 파일들이 있고 드래그한 파일이 선택된 파일 중 하나인 경우
                    if (this.selectedFiles.size >= 1 && this.selectedFiles.has(fileName)) {
                        console.log(`🎯 다중 선택 드래그: ${this.selectedFiles.size}개 파일을 ${category.name}로 이동`);
                        
                        const filesToMove = Array.from(this.selectedFiles);
                        let successCount = 0;
                        let failCount = 0;
                        
                        // 드롭 즉시 시각적 피드백 - 선택된 파일들을 임시로 숨김
                        const filesToHide = [];
                        for (const selectedFileName of filesToMove) {
                            const fileElement = document.querySelector(`[data-filename="${selectedFileName}"]`);
                            if (fileElement) {
                                fileElement.style.opacity = '0.3';
                                fileElement.style.pointerEvents = 'none';
                                filesToHide.push({ element: fileElement, fileName: selectedFileName });
                            }
                        }
                        
                        // 선택된 모든 파일 이동
                        for (const selectedFileName of filesToMove) {
                            // 파일이 여전히 다운로드 폴더에 존재하는지 확인
                            const fileExists = this.downloadFiles.some(f => f.name === selectedFileName);
                            if (!fileExists) {
                                console.log(`⚠️ 파일이 이미 이동됨: ${selectedFileName}`);
                                // 이미 이동된 파일의 요소를 복원하지 않음
                                continue;
                            }
                            
                            try {
                                console.log(`📁 파일 이동 중: ${selectedFileName} → ${category.name}`);
                                await this.moveFile(selectedFileName, category.name);
                                
                                // 서버 이동 성공 - Socket.IO 이벤트에서 UI 업데이트 처리
                                successCount++;
                            } catch (error) {
                                console.error(`❌ 파일 이동 실패: ${selectedFileName}`, error);
                                failCount++;
                                
                                // 실패한 파일의 시각적 상태를 복원
                                const failedFileInfo = filesToHide.find(f => f.fileName === selectedFileName);
                                if (failedFileInfo) {
                                    failedFileInfo.element.style.opacity = '1';
                                    failedFileInfo.element.style.pointerEvents = 'auto';
                                }
                            }
                        }
                        
                        console.log(`🎯 다중 이동 완료: 성공 ${successCount}개, 실패 ${failCount}개`);
                        
                        // 이동 완료 후 다운로드 폴더 강제 새로고침 (Socket.IO 이벤트 보장)
                        if (successCount > 0) {
                            setTimeout(() => {
                                console.log('🔄 드래그앤드롭 완료 후 다운로드 폴더 강제 새로고침');
                                this.loadDownloadFiles();
                            }, 100);
                        }
                        
                        // 결과 알림
                        if (successCount > 0 && failCount === 0) {
                            this.showNotification(`✅ ${successCount}개 파일이 성공적으로 이동되었습니다`);
                        } else if (successCount > 0 && failCount > 0) {
                            this.showNotification(`⚠️ ${successCount}개 파일 이동 성공, ${failCount}개 파일 실패`, 'warning');
                        } else {
                            this.showNotification(`❌ 파일 이동에 실패했습니다`, 'error');
                        }
                        
                        // UI 업데이트
                        this.updateSelectionUI();
                        
                    } else {
                        // 단일 파일 이동 (기존 로직)
                        console.log(`파일 이동 시작: ${fileName} (${source}) → ${category.name}`);
                        await this.moveFile(fileName, category.name);
                        
                        // 단일 파일 이동 완료 후 다운로드 폴더 강제 새로고침 (Socket.IO 이벤트 보장)
                        setTimeout(() => {
                            console.log('🔄 단일 파일 이동 완료 후 다운로드 폴더 강제 새로고침');
                            this.loadDownloadFiles();
                        }, 100);
                        
                        // 서버 이동 성공 - Socket.IO 이벤트에서 UI 업데이트 처리
                        console.log(`✅ 단일 파일 이동 성공: ${fileName} → ${category.name}`);
                    }
                    
                } else if (source === 'category') {
                    // 카테고리 간 파일 이동 (기존 로직 유지)
                    if (sourceCategory !== category.name) {
                        console.log(`파일 이동 시작: ${fileName} (${source}) → ${category.name}`);
                        
                        // Socket.IO 이벤트에서 UI 동기화 처리 - 드래그앤드롭에서는 즉시 제거하지 않음
                        await this.moveCategoryFile(fileName, sourceCategory, category.name);
                        this.selectedCategoryFiles.delete(fileName);
                        
                        // 카테고리 간 이동 완료 후 보장 새로고침 (Socket.IO 이벤트 보장)
                        setTimeout(() => {
                            console.log('🔄 카테고리 간 이동 완료 후 현재 모달 새로고침');
                            // 현재 열린 카테고리 모달이 소스 카테고리인 경우 새로고침
                            const modal = document.getElementById('categoryContentModal');
                            if (modal && modal.style.display === 'flex') {
                                const currentCategory = document.getElementById('categoryContentTitle').textContent.replace('📂 ', '').split(' (')[0];
                                if (currentCategory === sourceCategory) {
                                    this.openCategoryFolder(sourceCategory);
                                }
                            }
                        }, 100);
                        
                        // 서버 이동 성공 - Socket.IO 이벤트에서 카테고리 개수 업데이트 처리
                        console.log(`✅ 카테고리 간 이동 성공: ${fileName} (${sourceCategory} → ${category.name})`);
                    } else {
                        console.log('같은 카테고리로 이동 시도 - 무시됨');
                    }
                }
            });

            grid.appendChild(folderDiv);
        });
    }

    async forceReloadDownloadFiles() {
        console.log('🔄 강제 다운로드 폴더 새로고침 시작');
        this.downloadFiles = [];
        this.selectedFiles.clear();
        this.displayDownloadFiles();
        await this.loadDownloadFiles();
        console.log('✅ 강제 다운로드 폴더 새로고침 완료');
    }

    async loadDownloadFiles() {
        try {
            const response = await fetch(`${this.baseURL}/api/downloads`);
            if (response.ok) {
                this.downloadFiles = await response.json();
                
                // 현재 존재하지 않는 파일들을 선택 목록에서 제거
                const currentFileNames = new Set(this.downloadFiles.map(f => f.name));
                const selectedFiles = Array.from(this.selectedFiles);
                let removedCount = 0;
                
                selectedFiles.forEach(fileName => {
                    if (!currentFileNames.has(fileName)) {
                        this.selectedFiles.delete(fileName);
                        removedCount++;
                    }
                });
                
                if (removedCount > 0) {
                    console.log(`🗑️ 존재하지 않는 파일 ${removedCount}개를 선택 목록에서 제거`);
                    console.log('🔄 선택 상태 정리 완료:', {
                        totalFiles: this.downloadFiles.length,
                        selectedFiles: this.selectedFiles.size,
                        remainingSelected: Array.from(this.selectedFiles)
                    });
                    // UI 업데이트
                    this.updateSelectionUI();
                }
                
                this.displayDownloadFiles();
                
                // 파일 개수 업데이트
                this.updateDownloadFileCount();
            } else {
                // 다운로드 폴더가 없을 경우
                this.displayDownloadFolderMissing();
            }
        } catch (error) {
            console.error('다운로드 파일 로드 오류:', error);
            this.displayDownloadFolderMissing();
        }
    }

    displayDownloadFolderMissing() {
        const container = document.getElementById('downloadFiles');
        container.innerHTML = `
            <div class="folder-missing">
                <div class="missing-icon">📁❌</div>
                <h3>다운로드 폴더를 찾을 수 없습니다</h3>
                <p>다운로드 폴더가 삭제되었거나 접근할 수 없습니다.</p>
                <button id="createDownloadFolderBtn" class="create-folder-btn">
                    📁 다운로드 폴더 생성
                </button>
                <button id="openDownloadFolderBtn" class="open-folder-btn">
                    📂 폴더 위치 열기
                </button>
            </div>
        `;

        // 다운로드 폴더 생성 버튼
        document.getElementById('createDownloadFolderBtn').addEventListener('click', async () => {
            await this.createDownloadFolder();
        });

        // 폴더 위치 열기 버튼 (Windows에서만 작동)
        document.getElementById('openDownloadFolderBtn').addEventListener('click', () => {
            // 부모 폴더 열기 요청
            this.openMediaFolder();
        });

        // 파일 개수 업데이트
        document.getElementById('downloadCount').textContent = '다운로드 폴더 없음';
    }

    // 다운로드 파일 개수 실시간 업데이트
    updateDownloadFileCount() {
        const downloadCount = document.getElementById('downloadCount');
        if (downloadCount && this.downloadFiles) {
            downloadCount.textContent = `파일 ${this.downloadFiles.length}개 대기 중`;
            console.log(`📊 다운로드 파일 개수 업데이트: ${this.downloadFiles.length}개`);
        }
    }

    // 카테고리별 파일 개수 실시간 업데이트
    updateCategoryFileCount(categoryName, increment = 0) {
        // increment가 0이면 서버에서 실제 파일 개수를 가져와서 동기화
        if (increment === 0) {
            this.fetchAndUpdateCategoryCount(categoryName);
            return;
        }
        
        // 로컬 categories 배열에서 파일 개수 업데이트
        const category = this.categories.find(c => c.name === categoryName);
        if (!category) {
            console.log(`⚠️ 카테고리를 찾을 수 없음: ${categoryName} - 서버에서 실제 개수 가져오기`);
            // 카테고리를 찾지 못한 경우 서버에서 실제 개수를 가져와서 동기화
            this.fetchAndUpdateCategoryCount(categoryName);
            return;
        }
        
        category.fileCount = Math.max(0, category.fileCount + increment);
        console.log(`📊 카테고리 ${categoryName} 파일 개수 업데이트: ${category.fileCount}개`);

        // DOM에서 해당 카테고리의 파일 개수 표시 업데이트
        const categoryFolders = document.querySelectorAll(`[data-category="${categoryName}"]`);
        categoryFolders.forEach(folder => {
            const countElement = folder.querySelector('.folder-count');
            if (countElement) {
                countElement.textContent = `${category.fileCount}개 파일`;
            }
        });

        // 현재 열린 카테고리 모달의 파일 개수도 업데이트
        const modal = document.getElementById('categoryContentModal');
        if (modal && modal.style.display === 'flex') {
            const titleElement = document.getElementById('categoryContentTitle');
            if (titleElement && titleElement.textContent.includes(categoryName) && category) {
                titleElement.textContent = `📂 ${categoryName} (${category.fileCount}개 파일)`;
            }
        }
    }

    // 현재 열린 카테고리 모달에 파일을 추가
    async addFileToCurrentModal(fileName) {
        try {
            // 현재 모달의 카테고리 이름 가져오기
            const titleElement = document.getElementById('categoryContentTitle');
            if (!titleElement) return;
            
            const currentCategory = titleElement.textContent.replace('📂 ', '').split(' (')[0];
            
            // 서버에서 파일 정보 가져오기
            const response = await fetch(`${this.baseURL}/api/categories/${encodeURIComponent(currentCategory)}/files`);
            if (!response.ok) return;
            
            const files = await response.json();
            const fileInfo = files.find(f => f.name === fileName);
            if (!fileInfo) return;
            
            // 파일 요소 생성
            const categoryContent = document.getElementById('categoryContent');
            if (!categoryContent) return;
            
            const fileDiv = document.createElement('div');
            fileDiv.className = 'file-item';
            fileDiv.setAttribute('data-filename', fileName);
            fileDiv.draggable = true;
            
            fileDiv.innerHTML = `
                <div class="file-info">
                    <span class="file-name">${fileName}</span>
                    <span class="file-size">${this.formatFileSize(fileInfo.size)}</span>
                </div>
                <div class="file-actions">
                    <button onclick="fileManager.showRenameModal('${fileName}', '${currentCategory}')" title="파일명 수정">✏️</button>
                    <button onclick="fileManager.moveToDownload('${fileName}', '${currentCategory}')" title="다운로드 폴더로 이동">📥</button>
                    <button onclick="fileManager.showDeleteConfirm('${fileName}', '${currentCategory}')" title="삭제">🗑️</button>
                </div>
            `;
            
            // 드래그 이벤트 리스너 추가
            fileDiv.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('fileName', fileName);
                e.dataTransfer.setData('source', 'category');
                e.dataTransfer.setData('sourceCategory', currentCategory);
            });
            
            // 카테고리 내용에 파일 추가 (맨 앞에 추가)
            categoryContent.insertBefore(fileDiv, categoryContent.firstChild);
            
        } catch (error) {
            console.error('파일 추가 오류:', error);
        }
    }

    // 서버에서 실제 파일 개수를 가져와서 동기화
    async fetchAndUpdateCategoryCount(categoryName) {
        try {
            const response = await fetch(`${this.baseURL}/api/categories/${encodeURIComponent(categoryName)}/files`);
            if (response.ok) {
                const files = await response.json();
                const actualCount = files.length;
                
                // 로컬 categories 배열 업데이트
                let category = this.categories.find(c => c.name === categoryName);
                if (category) {
                    category.fileCount = actualCount;
                    console.log(`📊 카테고리 ${categoryName} 파일 개수 동기화: ${actualCount}개`);
                } else {
                    // 카테고리가 로컬 배열에 없으면 추가 (새로 생성된 카테고리일 수 있음)
                    console.log(`📋 새 카테고리 ${categoryName} 로컬 배열에 추가: ${actualCount}개 파일`);
                    this.categories.push({
                        name: categoryName,
                        fileCount: actualCount
                    });
                    category = this.categories[this.categories.length - 1];
                    
                    // 새 카테고리가 추가되었으므로 카테고리 목록 UI 새로고침
                    this.displayCategories();
                }

                // DOM에서 파일 개수 표시 업데이트
                const categoryFolders = document.querySelectorAll(`[data-category="${categoryName}"]`);
                categoryFolders.forEach(folder => {
                    const countElement = folder.querySelector('.folder-count');
                    if (countElement) {
                        countElement.textContent = `${actualCount}개 파일`;
                    }
                });
            }
        } catch (error) {
            console.error(`카테고리 ${categoryName} 파일 개수 동기화 오류:`, error);
        }
    }

    async createDownloadFolder() {
        try {
            const response = await fetch(`${this.baseURL}/api/create-download-folder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            const result = await response.json();
            if (result.success) {
                this.showNotification('✅ 다운로드 폴더가 생성되었습니다');
                await this.loadDownloadFiles();
            }
        } catch (error) {
            console.error('다운로드 폴더 생성 오류:', error);
            this.showNotification('❌ 다운로드 폴더 생성 실패', 'error');
        }
    }

    async checkFolderStatus() {
        try {
            const response = await fetch(`${this.baseURL}/api/folder-status`);
            const status = await response.json();
            
            if (!status.downloadFolder) {
                this.displayDownloadFolderMissing();
            }
            
            return status;
        } catch (error) {
            console.error('폴더 상태 확인 오류:', error);
            return null;
        }
    }

    openMediaFolder() {
        // 서버에 폴더 열기 요청 (Windows 환경에서만 작동)
        fetch(`${this.baseURL}/api/open-media-folder`, {
            method: 'POST'
        }).catch(error => {
            console.log('폴더 열기 기능은 Windows에서만 지원됩니다.');
            this.showNotification('폴더를 수동으로 열어주세요: media/다운로드', 'info');
        });
    }

    displayDownloadFiles() {
        // 필터링과 정렬 적용 (UI 새로고침은 하지 않음)
        this.applyFiltersAndSortOnly();
        
        const container = document.getElementById('downloadFiles');
        container.innerHTML = '';

        if (this.downloadFiles.length === 0) {
            container.innerHTML = '<p class="no-files">다운로드 폴더가 비어있습니다</p>';
            return;
        }

        if (this.filteredFiles.length === 0) {
            container.innerHTML = '<p class="no-files">검색 조건에 맞는 파일이 없습니다</p>';
            return;
        }

        console.log('🔄 렌더링할 파일 수:', this.filteredFiles.length);
        this.filteredFiles.forEach(file => {
            const fileDiv = document.createElement('div');
            fileDiv.className = 'download-file file-item';
            fileDiv.draggable = true;
            fileDiv.dataset.fileName = file.name;
            console.log('📁 파일 요소 생성:', file.name, 'draggable:', fileDiv.draggable);
            
            const icon = file.type === 'image' ? '🖼️' : '🎥';
            
            fileDiv.innerHTML = `
                <input type="checkbox" class="file-checkbox" data-filename="${file.name}">
                <span class="file-icon">${icon}</span>
                <span class="file-name">${file.name}</span>
                <span class="file-size">${this.formatFileSize(file.size)}</span>
                <div class="file-actions">
                    <button class="file-rename" data-filename="${file.name}" title="이름변경">✏️</button>
                    <button class="file-preview" data-file='${JSON.stringify(file)}' title="미리보기">👁️</button>
                </div>
            `;

            // 이름변경 버튼
            fileDiv.querySelector('.file-rename').addEventListener('click', (e) => {
                const fileName = e.target.dataset.filename;
                this.showFileRenameModal(fileName);
            });

            // 미리보기 버튼
            fileDiv.querySelector('.file-preview').addEventListener('click', (e) => {
                const fileData = JSON.parse(e.target.dataset.file);
                this.showPreview(fileData);
            });

            // 체크박스 이벤트
            const checkbox = fileDiv.querySelector('.file-checkbox');
            checkbox.addEventListener('change', (e) => {
                const fileName = e.target.dataset.filename;
                if (e.target.checked) {
                    this.selectedFiles.add(fileName);
                    fileDiv.classList.add('selected');
                } else {
                    this.selectedFiles.delete(fileName);
                    fileDiv.classList.remove('selected');
                }
                this.updateSelectionUI();
            });

            // 드래그 이벤트는 전역에서 처리됨

            // 파일 div 클릭으로 선택/해제
            fileDiv.addEventListener('click', (e) => {
                // 체크박스, 버튼, 링크 클릭 시에는 무시
                if (e.target.type === 'checkbox' || 
                    e.target.tagName === 'BUTTON' || 
                    e.target.closest('button') ||
                    e.target.closest('.file-actions')) {
                    return;
                }
                
                const fileName = fileDiv.dataset.fileName;
                const isSelected = this.selectedFiles.has(fileName);
                
                if (isSelected) {
                    this.selectedFiles.delete(fileName);
                    fileDiv.classList.remove('selected');
                    checkbox.checked = false;
                } else {
                    this.selectedFiles.add(fileName);
                    fileDiv.classList.add('selected');
                    checkbox.checked = true;
                }
                
                this.updateSelectionUI();
            });

            container.appendChild(fileDiv);
        });
    }

    showPreview(file) {
        this.currentFile = file;
        const modal = document.getElementById('previewModal');
        const img = document.getElementById('previewImage');
        const video = document.getElementById('previewVideo');
        
        if (file.type === 'image') {
            img.src = `/media/다운로드/${file.name}`;
            img.style.display = 'block';
            video.style.display = 'none';
        } else {
            video.src = `/media/다운로드/${file.name}`;
            video.style.display = 'block';
            img.style.display = 'none';
        }

        document.getElementById('fileName').textContent = file.name;
        document.getElementById('fileDetails').textContent = 
            `크기: ${this.formatFileSize(file.size)} | 수정일: ${new Date(file.modified).toLocaleString()}`;
        
        // 다운로드 폴더 파일은 이동 버튼을 표시
        const moveBtn = document.getElementById('moveFileBtn');
        if (moveBtn) {
            moveBtn.style.display = 'inline-block';
        }
        
        // 이름변경 버튼 이벤트 설정
        this.setupPreviewRenameButton(file.name);
        
        modal.style.display = 'flex';
    }

    // 미리보기 모달의 이름변경 버튼 설정
    setupPreviewRenameButton(fileName) {
        const renameBtn = document.getElementById('renameFileBtn');
        if (!renameBtn) return;
        
        // 기존 이벤트 리스너 제거
        const newBtn = renameBtn.cloneNode(true);
        renameBtn.parentNode.replaceChild(newBtn, renameBtn);
        
        // 새로운 이벤트 리스너 추가
        newBtn.addEventListener('click', () => {
            // 미리보기 모달 닫기
            document.getElementById('previewModal').style.display = 'none';
            
            // 이름변경 모달 열기
            this.showFileRenameModal(fileName);
        });
    }

    // 필터링과 정렬만 적용 (UI 업데이트 없음)
    applyFiltersAndSortOnly() {
        if (!this.downloadFiles || this.downloadFiles.length === 0) {
            this.filteredFiles = [];
            this.updateFileCount();
            return;
        }

        // 필터링
        this.filteredFiles = this.downloadFiles.filter(file => {
            // 텍스트 필터
            const nameMatch = !this.filterText || 
                file.name.toLowerCase().includes(this.filterText);
            
            // 타입 필터
            const typeMatch = this.filterType === 'all' || 
                file.type === this.filterType;
            
            return nameMatch && typeMatch;
        });

        // 정렬
        this.sortFiles();
        
        // 파일 개수 업데이트
        this.updateFileCount();
    }

    // 필터링과 정렬 적용 후 UI 새로고침
    applyFiltersAndSort() {
        this.applyFiltersAndSortOnly();
        // displayDownloadFiles는 호출하지 않음 (무한루프 방지)
    }

    // 파일 정렬
    sortFiles() {
        this.filteredFiles.sort((a, b) => {
            switch (this.sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name, 'ko', { sensitivity: 'base' });
                
                case 'date':
                    return new Date(b.modified) - new Date(a.modified); // 최신순
                
                case 'date-old':
                    return new Date(a.modified) - new Date(b.modified); // 오래된순
                
                case 'size':
                    return b.size - a.size; // 큰 파일부터
                
                default:
                    return a.name.localeCompare(b.name, 'ko', { sensitivity: 'base' });
            }
        });
    }

    // 파일 개수 업데이트
    updateFileCount() {
        const totalFiles = this.downloadFiles.length;
        const filteredFiles = this.filteredFiles.length;
        
        const downloadCount = document.getElementById('downloadCount');
        if (downloadCount) {
            if (this.filterText || this.filterType !== 'all') {
                downloadCount.textContent = `파일 ${filteredFiles}/${totalFiles}개 (필터링됨)`;
            } else {
                downloadCount.textContent = `파일 ${totalFiles}개 대기 중`;
            }
        }
    }

    async moveFile(fileName, category) {
        try {
            const response = await fetch(`${this.baseURL}/api/move-file`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileName, category })
            });

            const result = await response.json();
            
            if (response.ok && result.success) {
                this.showNotification(`✅ ${fileName}을(를) ${category}로 이동했습니다`);
                // 실시간 업데이트는 드래그앤드롭 핸들러와 Socket.IO 이벤트에서 처리됨
                
                // 추가 보장: 500ms 후 다운로드 폴더 상태 확인 및 새로고침
                setTimeout(() => {
                    const stillExists = this.downloadFiles.some(f => f.name === fileName);
                    if (stillExists) {
                        console.log(`🔄 ${fileName} 아직 다운로드 폴더에 존재 - 강제 새로고침 실행`);
                        this.loadDownloadFiles();
                    }
                }, 500);
            } else if (result.isDeletedCategory) {
                // 삭제된 카테고리로 이동 시도
                console.log(`🚫 삭제된 카테고리로 이동 시도: ${fileName} → ${category}`);
                this.showNotification(`⚠️ ${result.error}`, 'warning');
                throw new Error(`삭제된 카테고리: ${result.error}`);
            } else {
                this.showNotification(`❌ ${result.error || '파일 이동 실패'}`, 'error');
                throw new Error(`서버 에러: ${result.error || '파일 이동 실패'}`);
            }
        } catch (error) {
            console.error('파일 이동 오류:', error);
            this.showNotification('❌ 파일 이동 실패', 'error');
            throw error; // 호출자에게 에러를 전달
        }
    }

    async moveCategoryFile(fileName, sourceCategory, targetCategory) {
        try {
            const response = await fetch(`${this.baseURL}/api/move-category-file`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileName, sourceCategory, targetCategory })
            });

            const result = await response.json();
            if (result.success) {
                this.showNotification(`✅ ${fileName}을(를) ${sourceCategory}에서 ${targetCategory}로 이동했습니다`);
                
                // Socket.IO 이벤트에서 UI 동기화 처리됨
                
                // 추가 보장: 500ms 후 현재 모달이 소스 카테고리이면 상태 확인 및 새로고침
                setTimeout(() => {
                    const modal = document.getElementById('categoryContentModal');
                    if (modal && modal.style.display === 'flex') {
                        const currentCategory = document.getElementById('categoryContentTitle').textContent.replace('📂 ', '').split(' (')[0];
                        if (currentCategory === sourceCategory) {
                            // 해당 파일이 아직 카테고리에 존재하는지 확인
                            const fileElement = document.querySelector(`.file-item[data-filename="${fileName}"]`);
                            if (fileElement) {
                                console.log(`🔄 ${fileName} 아직 ${sourceCategory}에 존재 - 강제 새로고침 실행`);
                                this.openCategoryFolder(sourceCategory);
                            }
                        }
                    }
                }, 500);
            }
        } catch (error) {
            console.error('카테고리 파일 이동 오류:', error);
            this.showNotification('❌ 파일 이동 실패', 'error');
        }
    }

    async moveToDownload(fileName, sourceCategory) {
        try {
            const response = await fetch(`${this.baseURL}/api/move-to-download`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileName, sourceCategory })
            });

            const result = await response.json();
            if (result.success) {
                this.showNotification(`✅ ${fileName}을(를) ${sourceCategory}에서 다운로드 폴더로 이동했습니다`);
                
                // Socket.IO 이벤트에서 UI 동기화 처리됨
                
                // 카테고리에서 다운로드 폴더로 이동 완료 후 보장 새로고침
                setTimeout(() => {
                    console.log('🔄 카테고리에서 다운로드 폴더 이동 완료 후 현재 모달 새로고침');
                    const modal = document.getElementById('categoryContentModal');
                    if (modal && modal.style.display === 'flex') {
                        const currentCategory = document.getElementById('categoryContentTitle').textContent.replace('📂 ', '').split(' (')[0];
                        if (currentCategory === sourceCategory) {
                            this.openCategoryFolder(sourceCategory);
                        }
                    }
                }, 100);
                
                // 추가 보장: 500ms 후 상태 확인 및 새로고침
                setTimeout(() => {
                    const modal = document.getElementById('categoryContentModal');
                    if (modal && modal.style.display === 'flex') {
                        const currentCategory = document.getElementById('categoryContentTitle').textContent.replace('📂 ', '').split(' (')[0];
                        if (currentCategory === sourceCategory) {
                            const fileElement = document.querySelector(`.file-item[data-filename="${fileName}"]`);
                            if (fileElement) {
                                console.log(`🔄 ${fileName} 아직 ${sourceCategory}에 존재 - 강제 새로고침 실행`);
                                this.openCategoryFolder(sourceCategory);
                            }
                        }
                    }
                }, 500);
            }
        } catch (error) {
            console.error('다운로드 폴더 이동 오류:', error);
            this.showNotification('❌ 다운로드 폴더로 이동 실패', 'error');
        }
    }

    async moveFileToCategory() {
        const category = document.getElementById('categorySelect').value;
        if (!category || !this.currentFile) {
            await this.showAlert('알림', '이동할 위치를 선택하세요');
            return;
        }

        if (this.currentFile.category) {
            // 카테고리에서 이동
            if (category === '다운로드') {
                // 카테고리에서 다운로드 폴더로 이동
                await this.moveToDownload(this.currentFile.name, this.currentFile.category);
            } else {
                // 카테고리 간 파일 이동
                await this.moveCategoryFile(this.currentFile.name, this.currentFile.category, category);
            }
        } else {
            // 다운로드 폴더에서 카테고리로 이동
            await this.moveFile(this.currentFile.name, category);
        }
        
        document.getElementById('previewModal').style.display = 'none';
        
        // 카테고리 모달이 열려있다면 즉시 새로고침
        const modal = document.getElementById('categoryContentModal');
        if (modal && modal.style.display === 'flex') {
            const currentCategory = document.getElementById('categoryContentTitle').textContent.replace('📂 ', '');
            
            // 하위 폴더 모달인지 확인
            if (modal.dataset.currentSubfolder) {
                // 하위 폴더 모달 새로고침
                const subfolderName = modal.dataset.currentSubfolder;
                const categoryName = modal.dataset.currentCategory;
                console.log(`🔄 하위 폴더 UI 새로고침: ${categoryName}/${subfolderName}`);
                this.openSubfolder(categoryName, subfolderName);
            } else if (currentCategory) {
                // 일반 카테고리 모달 새로고침
                console.log(`🔄 카테고리 UI 새로고침: ${currentCategory}`);
                this.openCategoryFolder(currentCategory);
            }
        }
    }

    async createCategory() {
        const name = document.getElementById('categoryName').value;
        if (!name) return;

        try {
            const response = await fetch(`${this.baseURL}/api/categories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });

            const result = await response.json();
            if (result.success) {
                this.showNotification(`✅ 카테고리 '${name}' 생성됨`);
                this.loadCategories();
                document.getElementById('categoryModal').style.display = 'none';
                document.getElementById('categoryForm').reset();
            }
        } catch (error) {
            console.error('카테고리 생성 오류:', error);
        }
    }

    async deleteCategory(name) {
        try {
            const response = await fetch(`${this.baseURL}/api/categories/${encodeURIComponent(name)}`, {
                method: 'DELETE'
            });

            const result = await response.json();
            if (result.success) {
                this.showNotification(`✅ 카테고리 '${name}' 삭제됨`);
                this.loadCategories();
                // 카테고리 삭제 시 파일이 다운로드 폴더로 이동되므로 새로고침 필요
                this.loadDownloadFiles();
            }
        } catch (error) {
            console.error('카테고리 삭제 오류:', error);
        }
    }

    async openCategoryFolder(category) {
        try {
            const response = await fetch(`${this.baseURL}/api/categories/${encodeURIComponent(category)}/files`);
            const data = await response.json();
            
            this.showCategoryContent(category, data.files || data, data.subfolders || []);
        } catch (error) {
            console.error('폴더 열기 오류:', error);
            this.showNotification('❌ 폴더를 불러올 수 없습니다', 'error');
        }
    }

    showCategoryContent(categoryName, files, subfolders = []) {
        const modal = document.getElementById('categoryContentModal');
        const title = document.getElementById('categoryContentTitle');
        const fileCount = document.getElementById('categoryFileCount');
        const filesGrid = document.getElementById('categoryFilesGrid');
        
        // 하위 폴더 데이터 속성 제거 (일반 카테고리 모달로 변경)
        delete modal.dataset.currentCategory;
        delete modal.dataset.currentSubfolder;
        
        // 현재 카테고리와 선택 상태 초기화
        this.currentCategory = categoryName;
        this.selectedCategoryFiles.clear();
        this.updateCategorySelectionUI();
        
        title.textContent = `📂 ${categoryName}`;
        const totalItems = files.length + subfolders.length;
        fileCount.textContent = `${files.length}개 파일, ${subfolders.length}개 폴더`;
        
        // 카테고리 폴더 열기 버튼 이벤트 설정
        this.setupCategoryFolderButton(categoryName);
        
        filesGrid.innerHTML = '';
        
        if (totalItems === 0) {
            filesGrid.innerHTML = `
                <div class="category-no-files">
                    <div class="empty-icon">📁</div>
                    <p>이 카테고리에는 파일이나 폴더가 없습니다</p>
                </div>
            `;
        } else {
            // 하위 폴더 먼저 표시
            subfolders.forEach(subfolder => {
                const folderDiv = document.createElement('div');
                folderDiv.className = 'category-file-item subfolder-item';
                
                folderDiv.innerHTML = `
                    <div class="subfolder-icon">📁</div>
                    <div class="category-file-name">${subfolder.name}</div>
                    <div class="category-file-info">
                        ${subfolder.fileCount}개 파일 | 폴더
                    </div>
                    <div class="subfolder-actions">
                        <button class="subfolder-open-btn" data-category="${categoryName}" data-subfolder="${subfolder.name}">📂 열기</button>
                        <button class="subfolder-view-btn" data-category="${categoryName}" data-subfolder="${subfolder.name}">👁️ 보기</button>
                        <button class="subfolder-rename-btn" data-category="${categoryName}" data-subfolder="${subfolder.name}">✏️ 이름변경</button>
                    </div>
                `;
                
                // 하위 폴더 열기 버튼
                folderDiv.querySelector('.subfolder-open-btn').addEventListener('click', (e) => {
                    const category = e.target.dataset.category;
                    const subfolder = e.target.dataset.subfolder;
                    this.openSubfolderInExplorer(category, subfolder);
                });
                
                // 하위 폴더 내용 보기 버튼
                folderDiv.querySelector('.subfolder-view-btn').addEventListener('click', (e) => {
                    const category = e.target.dataset.category;
                    const subfolder = e.target.dataset.subfolder;
                    this.openSubfolder(category, subfolder);
                });

                // 하위 폴더 이름 변경 버튼
                folderDiv.querySelector('.subfolder-rename-btn').addEventListener('click', (e) => {
                    console.log('이름변경 버튼 클릭됨');
                    const category = e.target.dataset.category;
                    const subfolder = e.target.dataset.subfolder;
                    console.log('카테고리:', category, '하위폴더:', subfolder);
                    this.showRenameModal(category, subfolder);
                });
                
                filesGrid.appendChild(folderDiv);
            });
            
            // 파일들 표시
            files.forEach(file => {
                const fileDiv = document.createElement('div');
                fileDiv.className = 'category-file-item';
                fileDiv.draggable = true;
                fileDiv.dataset.fileName = file.name;
                fileDiv.dataset.sourceCategory = categoryName;
                
                let previewElement = '';
                if (file.type === 'image') {
                    previewElement = `<img src="${file.path}" alt="${file.name}" class="category-file-preview">`;
                } else if (file.type === 'video') {
                    previewElement = `<video src="${file.path}" class="category-file-preview" muted></video>`;
                }
                
                fileDiv.innerHTML = `
                    <input type="checkbox" class="category-file-checkbox" data-filename="${file.name}">
                    ${previewElement}
                    <div class="category-file-name">${file.name}</div>
                    <div class="category-file-info">
                        ${this.formatFileSize(file.size)} | ${new Date(file.modified).toLocaleDateString()}
                    </div>
                `;
                
                // 체크박스 이벤트
                const checkbox = fileDiv.querySelector('.category-file-checkbox');
                checkbox.addEventListener('change', (e) => {
                    const fileName = e.target.dataset.filename;
                    if (e.target.checked) {
                        this.selectedCategoryFiles.add(fileName);
                        fileDiv.classList.add('selected');
                    } else {
                        this.selectedCategoryFiles.delete(fileName);
                        fileDiv.classList.remove('selected');
                    }
                    this.updateCategorySelectionUI();
                });

                // 드래그 이벤트는 전역에서 처리됨

                // 파일 div 클릭으로 선택/해제
                fileDiv.addEventListener('click', (e) => {
                    // 체크박스 클릭 시에는 무시
                    if (e.target.type === 'checkbox') {
                        return;
                    }
                    
                    // 드래그 중이거나 미리보기 이미지/비디오 클릭 시에는 미리보기 표시
                    if (fileDiv.classList.contains('dragging') || 
                        e.target.classList.contains('category-file-preview')) {
                        if (!fileDiv.classList.contains('dragging')) {
                            this.showCategoryFilePreview(file, categoryName);
                        }
                        return;
                    }
                    
                    // 파일 선택/해제
                    const fileName = file.name;
                    const isSelected = this.selectedCategoryFiles.has(fileName);
                    
                    if (isSelected) {
                        this.selectedCategoryFiles.delete(fileName);
                        fileDiv.classList.remove('selected');
                        checkbox.checked = false;
                    } else {
                        this.selectedCategoryFiles.add(fileName);
                        fileDiv.classList.add('selected');
                        checkbox.checked = true;
                    }
                    
                    this.updateCategorySelectionUI();
                });
                
                filesGrid.appendChild(fileDiv);
            });
        }
        
        modal.style.display = 'flex';
    }

    setupCategoryFolderButton(categoryName) {
        const btn = document.getElementById('openCategoryFolderBtn');
        if (!btn) return;
        
        // 기존 이벤트 리스너 제거
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        // 새로운 이벤트 리스너 추가
        newBtn.addEventListener('click', () => {
            this.openCategoryFolderInExplorer(categoryName);
        });
    }

    // 카테고리 선택 상태 UI 업데이트
    updateCategorySelectionUI() {
        const selectedCount = this.selectedCategoryFiles.size;
        const selectedCountEl = document.getElementById('categorySelectedCount');
        const batchRenameBtn = document.getElementById('categoryBatchRenameBtn');
        const batchMoveBtn = document.getElementById('categoryBatchMoveBtn');
        const selectAllBtn = document.getElementById('categorySelectAllBtn');
        
        // 현재 표시된 파일 개수 계산 (폴더 제외)
        const totalFiles = document.querySelectorAll('.category-file-item:not(.subfolder-item)').length;
        
        if (selectedCount > 0) {
            selectedCountEl.textContent = `선택된 파일: ${selectedCount}개`;
            selectedCountEl.style.display = 'inline-block';
            batchRenameBtn.style.display = 'inline-block';
            batchMoveBtn.style.display = 'inline-block';
            selectAllBtn.textContent = selectedCount === totalFiles ? '☑️ 전체해제' : '☑️ 전체선택';
        } else {
            selectedCountEl.style.display = 'none';
            batchRenameBtn.style.display = 'none';
            batchMoveBtn.style.display = 'none';
            selectAllBtn.textContent = '☑️ 전체선택';
        }
    }

    // 카테고리 전체 선택/해제
    toggleCategorySelectAll() {
        const checkboxes = document.querySelectorAll('.category-file-checkbox');
        const totalFiles = checkboxes.length;
        const allSelected = this.selectedCategoryFiles.size === totalFiles;
        
        checkboxes.forEach(checkbox => {
            const fileName = checkbox.dataset.filename;
            const fileDiv = checkbox.closest('.category-file-item');
            
            if (allSelected) {
                // 전체 해제
                checkbox.checked = false;
                this.selectedCategoryFiles.delete(fileName);
                fileDiv.classList.remove('selected');
            } else {
                // 전체 선택
                checkbox.checked = true;
                this.selectedCategoryFiles.add(fileName);
                fileDiv.classList.add('selected');
            }
        });
        
        this.updateCategorySelectionUI();
    }

    // 카테고리 일괄 이름 변경 모달 표시
    showCategoryBatchRenameModal() {
        if (this.selectedCategoryFiles.size === 0) {
            this.showNotification('⚠️ 파일을 먼저 선택해주세요', 'warning');
            return;
        }
        
        // 기존 일괄 이름 변경 모달 사용
        const modal = document.getElementById('batchRenameModal');
        const filesList = document.getElementById('selectedFilesList');
        
        // 선택된 파일 목록 표시
        filesList.innerHTML = '';
        Array.from(this.selectedCategoryFiles).forEach(fileName => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-name';
            fileItem.textContent = fileName;
            filesList.appendChild(fileItem);
        });
        
        modal.style.display = 'flex';
    }

    // 카테고리 일괄 이동 모달 표시
    showCategoryBatchMoveModal() {
        if (this.selectedCategoryFiles.size === 0) {
            this.showNotification('⚠️ 파일을 먼저 선택해주세요', 'warning');
            return;
        }
        
        const modal = document.getElementById('categoryBatchMoveModal');
        const filesList = document.getElementById('categorySelectedFilesList');
        
        // 선택된 파일 목록 표시
        filesList.innerHTML = '';
        Array.from(this.selectedCategoryFiles).forEach(fileName => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-name';
            fileItem.textContent = fileName;
            filesList.appendChild(fileItem);
        });
        
        // 카테고리 선택 옵션 업데이트
        this.updateCategoryMoveSelect();
        
        modal.style.display = 'flex';
    }

    // 카테고리 이동 선택 옵션 업데이트
    updateCategoryMoveSelect() {
        const select = document.getElementById('categoryMoveSelect');
        if (!select) return;
        
        select.innerHTML = '<option value="">카테고리 선택</option>';
        
        // 현재 카테고리를 제외한 다른 카테고리들 추가
        this.categories.forEach(category => {
            if (category.name !== this.currentCategory) {
                const option = document.createElement('option');
                option.value = category.name;
                option.textContent = category.name;
                select.appendChild(option);
            }
        });
    }

    async openCategoryFolderInExplorer(categoryName) {
        try {
            const response = await fetch(`${this.baseURL}/api/open-category-folder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ categoryName })
            });

            const result = await response.json();
            if (result.success) {
                this.showNotification(`📂 ${categoryName} 폴더가 열렸습니다`);
            } else {
                this.showNotification('❌ 폴더를 열 수 없습니다', 'error');
            }
        } catch (error) {
            console.error('폴더 열기 오류:', error);
            this.showNotification('❌ 폴더 열기 실패', 'error');
        }
    }

    async openSubfolderInExplorer(categoryName, subfolderName) {
        try {
            const response = await fetch(`${this.baseURL}/api/open-subfolder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ categoryName, subfolderName })
            });

            const result = await response.json();
            if (result.success) {
                this.showNotification(`📂 ${subfolderName} 폴더가 열렸습니다`);
            } else {
                this.showNotification('❌ 하위 폴더를 열 수 없습니다', 'error');
            }
        } catch (error) {
            console.error('하위 폴더 열기 오류:', error);
            this.showNotification('❌ 하위 폴더 열기 실패', 'error');
        }
    }

    async openSubfolder(categoryName, subfolderName) {
        try {
            const response = await fetch(`${this.baseURL}/api/categories/${encodeURIComponent(categoryName)}/subfolders/${encodeURIComponent(subfolderName)}/files`);
            const files = await response.json();
            
            this.showSubfolderContent(categoryName, subfolderName, files);
        } catch (error) {
            console.error('하위 폴더 내용 로드 오류:', error);
            this.showNotification('❌ 하위 폴더를 불러올 수 없습니다', 'error');
        }
    }

    showSubfolderContent(categoryName, subfolderName, files) {
        const modal = document.getElementById('categoryContentModal');
        const title = document.getElementById('categoryContentTitle');
        const fileCount = document.getElementById('categoryFileCount');
        const filesGrid = document.getElementById('categoryFilesGrid');
        
        // 현재 하위 폴더 정보를 모달에 저장
        modal.dataset.currentCategory = categoryName;
        modal.dataset.currentSubfolder = subfolderName;
        
        title.innerHTML = `📂 ${categoryName} / <span class="subfolder-name">${subfolderName}</span>`;
        fileCount.textContent = `${files.length}개 파일`;
        
        // 뒤로가기 버튼 추가
        this.setupSubfolderBackButton(categoryName);
        
        filesGrid.innerHTML = '';
        
        // 뒤로가기 버튼
        const backDiv = document.createElement('div');
        backDiv.className = 'category-file-item back-button-item';
        backDiv.innerHTML = `
            <div class="back-icon">↩️</div>
            <div class="category-file-name">상위 폴더로</div>
            <div class="category-file-info">뒤로가기</div>
        `;
        backDiv.addEventListener('click', () => {
            this.openCategoryFolder(categoryName);
        });
        filesGrid.appendChild(backDiv);
        
        if (files.length === 0) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'category-no-files';
            emptyDiv.innerHTML = `
                <div class="empty-icon">📁</div>
                <p>이 폴더에는 파일이 없습니다</p>
            `;
            filesGrid.appendChild(emptyDiv);
        } else {
            // 파일들 표시
            files.forEach(file => {
                const fileDiv = document.createElement('div');
                fileDiv.className = 'category-file-item';
                
                let previewElement = '';
                if (file.type === 'image') {
                    previewElement = `<img src="${file.path}" alt="${file.name}" class="category-file-preview">`;
                } else if (file.type === 'video') {
                    previewElement = `<video src="${file.path}" class="category-file-preview" muted></video>`;
                }
                
                fileDiv.innerHTML = `
                    ${previewElement}
                    <div class="category-file-name">${file.name}</div>
                    <div class="category-file-info">
                        ${this.formatFileSize(file.size)} | ${new Date(file.modified).toLocaleDateString()}
                    </div>
                `;
                
                // 파일 클릭 시 미리보기
                fileDiv.addEventListener('click', () => {
                    this.showSubfolderFilePreview(file, categoryName, subfolderName);
                });
                
                filesGrid.appendChild(fileDiv);
            });
        }
        
        modal.style.display = 'flex';
    }

    setupSubfolderBackButton(categoryName) {
        const btn = document.getElementById('openCategoryFolderBtn');
        if (!btn) return;
        
        // 임시로 텍스트 변경 (원래 버튼을 뒤로가기로 사용)
        btn.textContent = '↩️ 상위 폴더';
        
        // 기존 이벤트 리스너 제거
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        // 뒤로가기 이벤트 리스너 추가
        newBtn.addEventListener('click', () => {
            this.openCategoryFolder(categoryName);
        });
    }

    showSubfolderFilePreview(file, categoryName, subfolderName) {
        // 하위 폴더 파일 미리보기
        this.currentFile = { ...file, category: categoryName, subfolder: subfolderName };
        const modal = document.getElementById('previewModal');
        const img = document.getElementById('previewImage');
        const video = document.getElementById('previewVideo');
        
        if (file.type === 'image') {
            img.src = file.path;
            img.style.display = 'block';
            video.style.display = 'none';
        } else {
            video.src = file.path;
            video.style.display = 'block';
            img.style.display = 'none';
        }

        document.getElementById('fileName').textContent = file.name;
        document.getElementById('fileDetails').textContent = 
            `위치: ${categoryName}/${subfolderName} | 크기: ${this.formatFileSize(file.size)} | 수정일: ${new Date(file.modified).toLocaleString()}`;
        
        // 하위 폴더 내 파일은 이동 버튼을 숨김 (이미 분류된 상태)
        const moveBtn = document.getElementById('moveFileBtn');
        if (moveBtn) {
            moveBtn.style.display = 'none';
        }
        
        modal.style.display = 'flex';
        
        // 하위 폴더 내용 모달 닫기
        document.getElementById('categoryContentModal').style.display = 'none';
    }

    showCategoryFilePreview(file, categoryName) {
        // 카테고리 파일 미리보기 (기존 미리보기와 유사하지만 경로가 다름)
        this.currentFile = { ...file, category: categoryName };
        const modal = document.getElementById('previewModal');
        const img = document.getElementById('previewImage');
        const video = document.getElementById('previewVideo');
        
        if (file.type === 'image') {
            img.src = file.path;
            img.style.display = 'block';
            video.style.display = 'none';
        } else {
            video.src = file.path;
            video.style.display = 'block';
            img.style.display = 'none';
        }

        document.getElementById('fileName').textContent = file.name;
        document.getElementById('fileDetails').textContent = 
            `카테고리: ${categoryName} | 크기: ${this.formatFileSize(file.size)} | 수정일: ${new Date(file.modified).toLocaleString()}`;
        
        // 카테고리 간 이동을 위해 이동 버튼을 표시하고 카테고리 선택 업데이트
        const moveBtn = document.getElementById('moveFileBtn');
        const categorySelect = document.getElementById('categorySelect');
        if (moveBtn && categorySelect) {
            moveBtn.style.display = 'inline-block';
            
            // 현재 카테고리를 제외한 다른 카테고리들과 다운로드 폴더를 선택 옵션으로 표시
            categorySelect.innerHTML = '<option value="">다른 위치 선택</option>';
            
            // 다운로드 폴더 옵션 추가
            const downloadOption = document.createElement('option');
            downloadOption.value = '다운로드';
            downloadOption.textContent = '📥 다운로드 폴더';
            categorySelect.appendChild(downloadOption);
            
            // 다른 카테고리 옵션들 추가
            this.categories.forEach(cat => {
                if (cat.name !== categoryName) {
                    const option = document.createElement('option');
                    option.value = cat.name;
                    option.textContent = `📂 ${cat.name}`;
                    categorySelect.appendChild(option);
                }
            });
        }
        
        modal.style.display = 'flex';
        
        // 카테고리 내용 모달 닫기
        document.getElementById('categoryContentModal').style.display = 'none';
    }

    updateCategorySelects() {
        const selects = [
            document.getElementById('categorySelect'),
            ...document.querySelectorAll('.category-select')
        ];

        selects.forEach(select => {
            if (select) {
                const currentValue = select.value;
                select.innerHTML = '<option value="">선택하세요</option>';
                
                this.categories.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat.name;
                    option.textContent = cat.name;
                    select.appendChild(option);
                });
                
                select.value = currentValue;
            }
        });
    }

    // 자동 분류 기능
    loadAutoSortRules() {
        const container = document.getElementById('autoSortRules');
        container.innerHTML = '';
        
        this.autoSortRules.forEach((rule, index) => {
            this.addAutoSortRuleUI(rule.keyword, rule.category, index);
        });
    }

    addAutoSortRule() {
        this.addAutoSortRuleUI('', '');
    }

    addAutoSortRuleUI(keyword = '', category = '', index = null) {
        const container = document.getElementById('autoSortRules');
        const ruleDiv = document.createElement('div');
        ruleDiv.className = 'rule-item';
        
        ruleDiv.innerHTML = `
            <input type="text" placeholder="키워드 (예: 여행, travel)" class="keyword-input" value="${keyword}">
            <select class="category-select">
                <option value="">카테고리 선택</option>
            </select>
            <button class="remove-rule">❌</button>
        `;

        // 카테고리 옵션 추가
        const select = ruleDiv.querySelector('.category-select');
        this.categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.name;
            option.textContent = cat.name;
            if (cat.name === category) option.selected = true;
            select.appendChild(option);
        });

        // 삭제 버튼
        ruleDiv.querySelector('.remove-rule').addEventListener('click', () => {
            ruleDiv.remove();
            this.saveAutoSortRules();
        });

        // 변경 시 저장
        ruleDiv.querySelectorAll('input, select').forEach(el => {
            el.addEventListener('change', () => this.saveAutoSortRules());
        });

        container.appendChild(ruleDiv);
    }

    saveAutoSortRules() {
        const rules = [];
        document.querySelectorAll('.rule-item').forEach(item => {
            const keyword = item.querySelector('.keyword-input').value;
            const category = item.querySelector('.category-select').value;
            
            if (keyword && category) {
                rules.push({ keyword, category });
            }
        });
        
        this.autoSortRules = rules;
        localStorage.setItem('autoSortRules', JSON.stringify(rules));
    }

    async checkAutoSort(fileName) {
        console.log(`🔍 자동 분류 검사: ${fileName}`);
        console.log(`📋 규칙 개수: ${this.autoSortRules.length}`);
        console.log(`📋 규칙 목록:`, this.autoSortRules);
        
        const lowerFileName = fileName.toLowerCase();
        
        for (const rule of this.autoSortRules) {
            console.log(`🔍 규칙 검사: "${rule.keyword}" in "${fileName}"`);
            if (lowerFileName.includes(rule.keyword.toLowerCase())) {
                console.log(`✅ 자동 분류 매치: ${fileName} → ${rule.category}`);
                await this.moveFile(fileName, rule.category);
                this.showNotification(`🤖 자동 분류: ${fileName} → ${rule.category}`);
                return;
            }
        }
        console.log(`❌ 자동 분류 매치 없음: ${fileName}`);
    }

    async executeAutoSort() {
        let movedCount = 0;
        let skipCount = 0;
        
        for (const file of this.downloadFiles) {
            const lowerFileName = file.name.toLowerCase();
            
            for (const rule of this.autoSortRules) {
                if (lowerFileName.includes(rule.keyword.toLowerCase())) {
                    // 카테고리가 존재하는지 확인
                    const categoryExists = this.categories.some(cat => cat.name === rule.category);
                    if (categoryExists) {
                        await this.moveFile(file.name, rule.category);
                        movedCount++;
                    } else {
                        console.log(`🚫 삭제된 카테고리 규칙 건너뜀: ${file.name} → ${rule.category}`);
                        skipCount++;
                    }
                    break;
                }
            }
        }
        
        if (movedCount > 0 && skipCount > 0) {
            this.showNotification(`🤖 ${movedCount}개 파일이 자동 분류되었습니다 (${skipCount}개 파일은 삭제된 카테고리로 인해 건너뜀)`);
        } else if (movedCount > 0) {
            this.showNotification(`🤖 ${movedCount}개 파일이 자동으로 분류되었습니다`);
        } else if (skipCount > 0) {
            this.showNotification(`⚠️ ${skipCount}개 파일의 대상 카테고리가 삭제되어 분류를 건너뛰었습니다`);
        } else {
            this.showNotification('📂 분류할 파일이 없습니다');
        }
    }

    toggleAutoSortSettings() {
        const settings = document.getElementById('autoSortSettings');
        const isVisible = settings.style.display !== 'none';
        
        if (isVisible) {
            this.closeAutoSortSettings();
        } else {
            settings.style.display = 'block';
            settings.classList.add('settings-open');
        }
    }

    closeAutoSortSettings() {
        const settings = document.getElementById('autoSortSettings');
        settings.style.display = 'none';
        settings.classList.remove('settings-open');
    }

    saveAutoSortSettings() {
        // 현재 규칙들을 localStorage에 저장
        localStorage.setItem('autoSortRules', JSON.stringify(this.autoSortRules));
        this.showNotification('✅ 자동 분류 설정이 저장되었습니다');
        this.closeAutoSortSettings();
    }

    updateSelectionUI() {
        const selectedCount = this.selectedFiles.size;
        const selectedCountEl = document.getElementById('selectedCount');
        const batchRenameBtn = document.getElementById('batchRenameBtn');
        const selectAllBtn = document.getElementById('selectAllBtn');
        
        // 현재 표시된 파일 수 (필터링된 파일 기준)
        const visibleFilesCount = this.filteredFiles ? this.filteredFiles.length : this.downloadFiles.length;
        
        const batchMoveBtn = document.getElementById('batchMoveBtn');
        
        if (selectedCount > 0) {
            selectedCountEl.textContent = `선택된 파일: ${selectedCount}개`;
            selectedCountEl.style.display = 'block';
            batchRenameBtn.style.display = 'inline-block';
            if (batchMoveBtn) batchMoveBtn.style.display = 'inline-block';
            selectAllBtn.textContent = selectedCount === visibleFilesCount ? '☑️ 전체해제' : '☑️ 전체선택';
        } else {
            selectedCountEl.style.display = 'none';
            batchRenameBtn.style.display = 'none';
            if (batchMoveBtn) batchMoveBtn.style.display = 'none';
            selectAllBtn.textContent = '☑️ 전체선택';
        }
    }

    toggleSelectAll() {
        // 현재 표시된 파일들만 대상으로 함
        const visibleFiles = this.filteredFiles || this.downloadFiles || [];
        const visibleFilesCount = visibleFiles.length;
        const allSelected = this.selectedFiles.size === visibleFilesCount;
        
        console.log('🔄 전체선택 토글:', {
            visibleFilesCount,
            selectedCount: this.selectedFiles.size,
            allSelected,
            visibleFiles: visibleFiles.map(f => f.name)
        });

        visibleFiles.forEach(file => {
            const fileName = file.name;
            const checkbox = document.querySelector(`.file-checkbox[data-filename="${fileName}"]`);
            const fileDiv = checkbox ? checkbox.closest('.download-file') : null;
            
            if (checkbox && fileDiv) {
                if (allSelected) {
                    // 전체 해제
                    checkbox.checked = false;
                    this.selectedFiles.delete(fileName);
                    fileDiv.classList.remove('selected');
                } else {
                    // 전체 선택
                    checkbox.checked = true;
                    this.selectedFiles.add(fileName);
                    fileDiv.classList.add('selected');
                }
            }
        });
        
        console.log('🔄 전체선택 완료:', {
            finalSelectedCount: this.selectedFiles.size,
            selectedFiles: Array.from(this.selectedFiles)
        });
        
        this.updateSelectionUI();
    }

    showBatchRenameModal() {
        if (this.selectedFiles.size === 0) {
            this.showNotification('⚠️ 파일을 먼저 선택해주세요', 'warning');
            return;
        }
        
        const modal = document.getElementById('batchRenameModal');
        const filesList = document.getElementById('selectedFilesList');
        
        // 선택된 파일 목록 표시
        filesList.innerHTML = '';
        Array.from(this.selectedFiles).forEach(fileName => {
            const fileItem = document.createElement('div');
            fileItem.className = 'selected-file-item';
            fileItem.textContent = fileName;
            filesList.appendChild(fileItem);
        });
        
        modal.style.display = 'flex';
    }

    async applyBatchRename() {
        const renameType = document.querySelector('input[name="renameType"]:checked').value;
        let prefixText = document.getElementById('prefixText').value.trim();
        let suffixText = document.getElementById('suffixText').value.trim();
        let replaceFrom = document.getElementById('replaceFrom').value.trim();
        let replaceTo = document.getElementById('replaceTo').value.trim();
        
        if (renameType === 'prefix' && !prefixText) {
            this.showNotification('⚠️ 추가할 텍스트를 입력해주세요', 'warning');
            return;
        }
        
        if (renameType === 'suffix' && !suffixText) {
            this.showNotification('⚠️ 추가할 텍스트를 입력해주세요', 'warning');
            return;
        }
        
        if (renameType === 'replace' && !replaceFrom) {
            this.showNotification('⚠️ 바꿀 텍스트를 입력해주세요', 'warning');
            return;
        }
        
        // 현재 컨텍스트 확인 (카테고리 모달이 열려있는지)
        const isCategoryContext = document.getElementById('categoryContentModal').style.display === 'flex';
        const selectedFiles = isCategoryContext ? this.selectedCategoryFiles : this.selectedFiles;
        
        const confirmed = await this.showConfirm(
            '일괄 이름 변경', 
            `선택된 ${selectedFiles.size}개 파일의 이름을 변경하시겠습니까?`
        );
        
        if (!confirmed) return;
        
        let successCount = 0;
        let failCount = 0;
        
        for (const fileName of selectedFiles) {
            try {
                let newName = '';
                const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
                const extension = fileName.match(/\.[^/.]+$/)?.[0] || '';
                
                switch (renameType) {
                    case 'prefix':
                        newName = prefixText + fileName;
                        break;
                    case 'suffix':
                        newName = nameWithoutExt + suffixText + extension;
                        break;
                    case 'replace':
                        // 빈 문자열로 교체(삭제)하는 경우도 허용
                        if (replaceFrom) {
                            newName = fileName.replace(new RegExp(replaceFrom.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replaceTo || '');
                        } else {
                            newName = fileName; // 바꿀 텍스트가 없으면 변경하지 않음
                        }
                        break;
                }
                
                if (newName !== undefined && newName !== fileName) {
                    let response;
                    
                    if (isCategoryContext) {
                        // 카테고리 파일 이름 변경 - 임시로 파일 이동을 이용한 이름 변경
                        // 1. 다운로드 폴더로 이동
                        const moveToDownload = await fetch(`${this.baseURL}/api/move-to-download`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ 
                                fileName, 
                                sourceCategory: this.currentCategory 
                            })
                        });
                        
                        if (!moveToDownload.ok) {
                            throw new Error('다운로드 폴더로 이동 실패');
                        }
                        
                        // 2. 다운로드 폴더에서 이름 변경
                        const renameResponse = await fetch(`${this.baseURL}/api/downloads/${encodeURIComponent(fileName)}/rename`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ newName: newName.replace(/\.[^/.]+$/, '') })
                        });
                        
                        if (!renameResponse.ok) {
                            throw new Error('파일 이름 변경 실패');
                        }
                        
                        // 3. 다시 원래 카테고리로 이동
                        response = await fetch(`${this.baseURL}/api/move-file`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ 
                                fileName: newName, 
                                category: this.currentCategory 
                            })
                        });
                    } else {
                        // 다운로드 파일 이름 변경
                        response = await fetch(`${this.baseURL}/api/downloads/${encodeURIComponent(fileName)}/rename`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ newName: newName.replace(/\.[^/.]+$/, '') })
                        });
                    }
                    
                    if (response.ok) {
                        successCount++;
                    } else {
                        throw new Error(`Server error: ${response.status}`);
                    }
                } else {
                    failCount++;
                }
            } catch (error) {
                console.error(`파일 ${fileName} 이름 변경 실패:`, error);
                failCount++;
            }
        }
        
        // 선택 초기화 (컨텍스트에 따라)
        if (isCategoryContext) {
            this.selectedCategoryFiles.clear();
            this.updateCategorySelectionUI();
        } else {
            this.selectedFiles.clear();
            this.updateSelectionUI();
        }
        
        // 결과 알림
        if (successCount > 0 && failCount === 0) {
            this.showNotification(`✅ ${successCount}개 파일의 이름이 성공적으로 변경되었습니다`);
        } else if (successCount > 0 && failCount > 0) {
            this.showNotification(`⚠️ ${successCount}개 파일 성공, ${failCount}개 파일 실패`);
        } else {
            this.showNotification(`❌ 파일 이름 변경에 실패했습니다`, 'error');
        }
        
        // 모달 닫기
        document.getElementById('batchRenameModal').style.display = 'none';
        
        // 파일 목록 새로고침 (컨텍스트에 따라)
        if (isCategoryContext) {
            this.openCategoryFolder(this.currentCategory);
        } else {
            await this.loadDownloadFiles();
        }
    }

    showCategoryModal() {
        document.getElementById('categoryModal').style.display = 'flex';
    }

    showRenameModal(categoryName, subfolderName) {
        console.log('showRenameModal 호출:', categoryName, subfolderName);
        const modal = document.getElementById('renameFolderModal');
        
        if (!modal) {
            console.error('renameFolderModal 요소를 찾을 수 없습니다');
            return;
        }
        
        // 모달 정보 설정
        const currentFolderNameEl = document.getElementById('currentFolderName');
        const currentFolderPathEl = document.getElementById('currentFolderPath');
        const newFolderNameEl = document.getElementById('newFolderName');
        const renameCategoryEl = document.getElementById('renameCategory');
        const renameOldNameEl = document.getElementById('renameOldName');
        
        if (currentFolderNameEl) currentFolderNameEl.textContent = subfolderName;
        if (currentFolderPathEl) currentFolderPathEl.textContent = `${categoryName}/${subfolderName}`;
        if (newFolderNameEl) newFolderNameEl.value = subfolderName;
        if (renameCategoryEl) renameCategoryEl.value = categoryName;
        if (renameOldNameEl) renameOldNameEl.value = subfolderName;
        
        // 하위 폴더 모드로 설정
        modal.setAttribute('data-rename-type', 'subfolder');
        
        // 모달 표시
        console.log('모달 표시 중...');
        modal.style.display = 'flex';
        
        // 입력 필드 포커스 및 전체 선택
        setTimeout(() => {
            const input = document.getElementById('newFolderName');
            if (input) {
                input.focus();
                input.select();
            }
        }, 100);
    }

    showCategoryRenameModal(categoryName) {
        console.log('showCategoryRenameModal 호출:', categoryName);
        const modal = document.getElementById('renameFolderModal');
        
        if (!modal) {
            console.error('renameFolderModal 요소를 찾을 수 없습니다');
            return;
        }
        
        // 모달 정보 설정
        const currentFolderNameEl = document.getElementById('currentFolderName');
        const currentFolderPathEl = document.getElementById('currentFolderPath');
        const newFolderNameEl = document.getElementById('newFolderName');
        const renameCategoryEl = document.getElementById('renameCategory');
        const renameOldNameEl = document.getElementById('renameOldName');
        
        if (currentFolderNameEl) currentFolderNameEl.textContent = categoryName;
        if (currentFolderPathEl) currentFolderPathEl.textContent = `카테고리/${categoryName}`;
        if (newFolderNameEl) newFolderNameEl.value = categoryName;
        if (renameCategoryEl) renameCategoryEl.value = categoryName;
        if (renameOldNameEl) renameOldNameEl.value = categoryName;
        
        // 카테고리 모드로 설정
        modal.setAttribute('data-rename-type', 'category');
        
        // 모달 표시
        console.log('카테고리 모달 표시 중...');
        modal.style.display = 'flex';
        
        // 입력 필드 포커스 및 전체 선택
        setTimeout(() => {
            const input = document.getElementById('newFolderName');
            if (input) {
                input.focus();
                input.select();
            }
        }, 100);
    }

    // 다운로드 폴더 일괄 이동 모달 표시
    showDownloadBatchMoveModal() {
        console.log('📁 일괄이동 버튼 클릭:', {
            selectedFilesCount: this.selectedFiles.size,
            selectedFiles: Array.from(this.selectedFiles),
            totalDownloadFiles: this.downloadFiles.length
        });

        if (this.selectedFiles.size === 0) {
            this.showNotification('⚠️ 이동할 파일을 먼저 선택해주세요', 'warning');
            return;
        }

        const modal = document.getElementById('downloadBatchMoveModal');
        const filesList = document.getElementById('downloadSelectedFilesList');
        const categorySelect = document.getElementById('downloadMoveSelect');

        // 선택된 파일 목록 표시
        filesList.innerHTML = '';
        Array.from(this.selectedFiles).forEach(fileName => {
            const fileItem = document.createElement('div');
            fileItem.className = 'selected-file-item';
            fileItem.innerHTML = `
                <span class="file-icon">${fileName.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i) ? '🖼️' : '🎥'}</span>
                <span class="file-name">${fileName}</span>
            `;
            filesList.appendChild(fileItem);
        });

        // 카테고리 선택 옵션 업데이트
        this.updateCategorySelectOptions(categorySelect);

        modal.style.display = 'flex';
        console.log('📁 일괄이동 모달 표시 완료');
    }

    // 카테고리 선택 옵션 업데이트
    updateCategorySelectOptions(selectElement) {
        // 기존 옵션 제거 (첫 번째 옵션 제외)
        while (selectElement.children.length > 1) {
            selectElement.removeChild(selectElement.lastChild);
        }

        // 현재 카테고리들 추가
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = `📁 ${category.name}`;
            selectElement.appendChild(option);
        });
    }

    // 다운로드 폴더 일괄 이동 실행
    async applyDownloadBatchMove() {
        const categorySelect = document.getElementById('downloadMoveSelect');
        const targetCategory = categorySelect.value;

        if (!targetCategory) {
            this.showNotification('⚠️ 이동할 카테고리를 선택해주세요', 'warning');
            return;
        }

        if (this.selectedFiles.size === 0) {
            this.showNotification('⚠️ 이동할 파일이 선택되지 않았습니다', 'warning');
            return;
        }

        const filesToMove = Array.from(this.selectedFiles);
        console.log('🚀 일괄 이동 시작:', {
            targetCategory,
            selectedFilesCount: this.selectedFiles.size,
            filesToMove,
            allDownloadFiles: this.downloadFiles.map(f => f.name)
        });

        let successCount = 0;
        let failCount = 0;

        // 확인 메시지
        const confirmed = await this.showConfirm(
            '파일 일괄 이동',
            `선택된 ${filesToMove.length}개 파일을 '${targetCategory}' 카테고리로 이동하시겠습니까?`
        );

        if (!confirmed) return;

        // 모달 닫기
        document.getElementById('downloadBatchMoveModal').style.display = 'none';

        // 각 파일에 대해 이동 처리
        for (const fileName of filesToMove) {
            try {
                console.log(`📁 파일 이동 중: ${fileName} → ${targetCategory}`);
                await this.moveFile(fileName, targetCategory);
                
                // 로컬 데이터에서 이동된 파일 제거 (즉시 반영)
                this.downloadFiles = this.downloadFiles.filter(f => f.name !== fileName);
                successCount++;
                console.log(`✅ 파일 이동 성공: ${fileName}`);
                
                // 실시간 다운로드 개수 업데이트 (카테고리 개수는 socket 이벤트에서 처리)
                this.updateDownloadFileCount();
            } catch (error) {
                console.error(`❌ 파일 이동 실패: ${fileName}`, error);
                failCount++;
            }
        }

        console.log('🎯 일괄 이동 완료:', {
            successCount,
            failCount,
            totalAttempted: filesToMove.length
        });

        // 선택 초기화
        this.selectedFiles.clear();
        this.updateSelectionUI();

        // 결과 알림
        if (successCount > 0 && failCount === 0) {
            this.showNotification(`✅ ${successCount}개 파일이 성공적으로 이동되었습니다`);
        } else if (successCount > 0 && failCount > 0) {
            this.showNotification(`⚠️ ${successCount}개 파일 이동 성공, ${failCount}개 파일 실패`, 'warning');
        } else {
            this.showNotification(`❌ 파일 이동에 실패했습니다`, 'error');
        }

        // 화면 즉시 업데이트 (서버 재로드 없이)
        this.displayDownloadFiles();
        this.updateSelectionUI();
        
        // 카테고리 정보만 업데이트 (파일 개수 반영)
        await this.loadCategories();
    }

    async renameSubfolder() {
        const modal = document.getElementById('renameFolderModal');
        const renameType = modal.getAttribute('data-rename-type');
        const categoryName = document.getElementById('renameCategory').value;
        const oldName = document.getElementById('renameOldName').value;
        const newName = document.getElementById('newFolderName').value.trim();
        
        if (!newName) {
            await this.showAlert('알림', '새 이름을 입력하세요');
            return;
        }
        
        try {
            let response;
            
            if (renameType === 'file') {
                // 파일 이름 변경
                const fileExtension = modal.getAttribute('data-file-extension') || '';
                const fullNewName = newName + fileExtension;
                
                if (fullNewName === oldName) {
                    modal.style.display = 'none';
                    return;
                }
                
                response = await fetch(`${this.baseURL}/api/downloads/${encodeURIComponent(oldName)}/rename`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ newName: newName })
                });
            } else if (renameType === 'category') {
                // 카테고리 이름 변경
                if (newName === oldName) {
                    modal.style.display = 'none';
                    return;
                }
                
                response = await fetch(`${this.baseURL}/api/categories/${encodeURIComponent(categoryName)}/rename`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ newName })
                });
            } else {
                // 하위 폴더 이름 변경
                if (newName === oldName) {
                    modal.style.display = 'none';
                    return;
                }
                
                response = await fetch(`${this.baseURL}/api/categories/${encodeURIComponent(categoryName)}/subfolders/${encodeURIComponent(oldName)}/rename`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ newName })
                });
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
                if (renameType === 'file') {
                    this.showNotification(`✅ 파일 이름이 '${result.newName}'으로 변경되었습니다`);
                    modal.style.display = 'none';
                    
                    // 다운로드 파일 목록 새로고침
                    await this.loadDownloadFiles();
                } else if (renameType === 'category') {
                    this.showNotification(`✅ 카테고리 이름이 '${newName}'으로 변경되었습니다`);
                    modal.style.display = 'none';
                    
                    // 카테고리 목록 새로고침
                    await this.loadCategories();
                } else {
                    this.showNotification(`✅ 폴더 이름이 '${newName}'으로 변경되었습니다`);
                    modal.style.display = 'none';
                    
                    // 카테고리 내용 새로고침
                    await this.openCategoryFolder(categoryName);
                }
            } else {
                this.showNotification(`❌ ${result.error}`, 'error');
            }
            
        } catch (error) {
            console.error('이름 변경 오류:', error);
            this.showNotification('❌ 이름 변경 실패', 'error');
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    showNotification(message, type = 'success') {
        // 간단한 토스트 알림 (추후 개선 가능)
        const toast = document.createElement('div');
        toast.className = `notification ${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#4CAF50' : '#f44336'};
            color: white;
            border-radius: 5px;
            z-index: 10000;
            animation: slideIn 0.3s;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // 파일 이름 변경 모달 표시
    showFileRenameModal(fileName) {
        console.log('showFileRenameModal 호출:', fileName);
        const modal = document.getElementById('renameFolderModal');
        
        if (!modal) {
            console.error('renameFolderModal 요소를 찾을 수 없습니다');
            return;
        }
        
        // 파일명과 확장자 분리
        const lastDotIndex = fileName.lastIndexOf('.');
        const nameWithoutExt = lastDotIndex > 0 ? fileName.substring(0, lastDotIndex) : fileName;
        const extension = lastDotIndex > 0 ? fileName.substring(lastDotIndex) : '';
        
        // 모달 정보 설정
        const currentFolderNameEl = document.getElementById('currentFolderName');
        const currentFolderPathEl = document.getElementById('currentFolderPath');
        const newFolderNameEl = document.getElementById('newFolderName');
        const renameCategoryEl = document.getElementById('renameCategory');
        const renameOldNameEl = document.getElementById('renameOldName');
        
        if (currentFolderNameEl) currentFolderNameEl.textContent = fileName;
        if (currentFolderPathEl) currentFolderPathEl.textContent = `다운로드 폴더/${fileName}`;
        if (newFolderNameEl) {
            newFolderNameEl.value = nameWithoutExt; // 확장자 제외한 이름만
            newFolderNameEl.placeholder = '새 파일 이름 (확장자 제외)';
        }
        if (renameCategoryEl) renameCategoryEl.value = 'downloads'; // 다운로드 폴더 표시
        if (renameOldNameEl) renameOldNameEl.value = fileName;
        
        // 파일 모드로 설정
        modal.setAttribute('data-rename-type', 'file');
        modal.setAttribute('data-file-extension', extension);
        
        // 모달 제목 변경
        const modalTitle = modal.querySelector('h3');
        if (modalTitle) modalTitle.textContent = '파일 이름 변경';
        
        // 모달 표시
        console.log('파일 이름 변경 모달 표시 중...');
        modal.style.display = 'flex';
        
        // 입력 필드 포커스 및 전체 선택
        setTimeout(() => {
            const input = document.getElementById('newFolderName');
            if (input) {
                input.focus();
                input.select();
            }
        }, 100);
    }

    // 커스텀 확인 창 (스페이스바 지원)
    showConfirm(title, message) {
        return new Promise((resolve) => {
            const modal = document.getElementById('confirmModal');
            const titleEl = document.getElementById('confirmTitle');
            const messageEl = document.getElementById('confirmMessage');
            const cancelBtn = document.getElementById('confirmCancel');
            const okBtn = document.getElementById('confirmOk');
            
            titleEl.textContent = title;
            messageEl.textContent = message;
            
            // 취소 버튼 표시
            cancelBtn.style.display = 'inline-block';
            
            // 키보드 이벤트 핸들러
            const handleKeydown = (e) => {
                if (e.code === 'Space' || e.code === 'Enter') {
                    e.preventDefault();
                    cleanup();
                    resolve(true);
                } else if (e.code === 'Escape') {
                    e.preventDefault();
                    cleanup();
                    resolve(false);
                }
            };
            
            // 정리 함수
            const cleanup = () => {
                modal.style.display = 'none';
                document.removeEventListener('keydown', handleKeydown);
                cancelBtn.removeEventListener('click', handleCancel);
                okBtn.removeEventListener('click', handleOk);
            };
            
            const handleCancel = () => {
                cleanup();
                resolve(false);
            };
            
            const handleOk = () => {
                cleanup();
                resolve(true);
            };
            
            // 이벤트 리스너 등록
            cancelBtn.addEventListener('click', handleCancel);
            okBtn.addEventListener('click', handleOk);
            document.addEventListener('keydown', handleKeydown);
            
            // 모달 표시
            modal.style.display = 'flex';
            
            // 확인 버튼에 포커스
            setTimeout(() => okBtn.focus(), 100);
        });
    }

    // 커스텀 알림 창 (스페이스바로 확인)
    showAlert(title, message) {
        return new Promise((resolve) => {
            const modal = document.getElementById('confirmModal');
            const titleEl = document.getElementById('confirmTitle');
            const messageEl = document.getElementById('confirmMessage');
            const cancelBtn = document.getElementById('confirmCancel');
            const okBtn = document.getElementById('confirmOk');
            
            titleEl.textContent = title;
            messageEl.textContent = message;
            
            // 취소 버튼 숨김 (알림이므로 확인만)
            cancelBtn.style.display = 'none';
            
            // 키보드 이벤트 핸들러
            const handleKeydown = (e) => {
                if (e.code === 'Space' || e.code === 'Enter' || e.code === 'Escape') {
                    e.preventDefault();
                    cleanup();
                    resolve();
                }
            };
            
            // 정리 함수
            const cleanup = () => {
                modal.style.display = 'none';
                document.removeEventListener('keydown', handleKeydown);
                okBtn.removeEventListener('click', handleOk);
            };
            
            const handleOk = () => {
                cleanup();
                resolve();
            };
            
            // 이벤트 리스너 등록
            okBtn.addEventListener('click', handleOk);
            document.addEventListener('keydown', handleKeydown);
            
            // 모달 표시
            modal.style.display = 'flex';
            
            // 확인 버튼에 포커스
            setTimeout(() => okBtn.focus(), 100);
        });
    }

    // 카테고리 일괄 이동 실행
    async applyCategoryBatchMove() {
        const moveDestination = document.querySelector('input[name="moveDestination"]:checked').value;
        const categorySelect = document.getElementById('categoryMoveSelect');
        
        let targetCategory = '';
        if (moveDestination === 'category') {
            targetCategory = categorySelect.value;
            if (!targetCategory) {
                this.showNotification('⚠️ 이동할 카테고리를 선택해주세요', 'warning');
                return;
            }
        }
        
        const confirmed = await this.showConfirm(
            '파일 일괄 이동', 
            `선택된 ${this.selectedCategoryFiles.size}개 파일을 ${moveDestination === 'download' ? '다운로드 폴더' : targetCategory + ' 카테고리'}로 이동하시겠습니까?`
        );
        
        if (!confirmed) return;
        
        let successCount = 0;
        let failCount = 0;
        
        for (const fileName of this.selectedCategoryFiles) {
            try {
                let response;
                
                if (moveDestination === 'download') {
                    // 다운로드 폴더로 이동
                    response = await fetch(`${this.baseURL}/api/move-to-download`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            fileName, 
                            sourceCategory: this.currentCategory 
                        })
                    });
                } else {
                    // 다른 카테고리로 이동
                    response = await fetch(`${this.baseURL}/api/move-category-file`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            fileName, 
                            sourceCategory: this.currentCategory,
                            targetCategory 
                        })
                    });
                }
                
                if (response.ok) {
                    successCount++;
                    
                    // 즉시 UI에서 파일 제거
                    const fileElement = document.querySelector(`.file-item[data-filename="${fileName}"]`);
                    if (fileElement) {
                        fileElement.remove();
                        console.log(`🚀 일괄 이동 즉시 UI 업데이트: ${fileName} 파일 요소 제거됨`);
                    }
                    
                    // 파일 개수 업데이트는 socket 이벤트 핸들러에서 처리
                    if (moveDestination === 'download') {
                        console.log(`📥 다운로드 폴더로 이동: ${fileName}`);
                    } else {
                        console.log(`📁 카테고리 이동: ${fileName} (${this.currentCategory} → ${targetCategory})`);
                    }
                } else {
                    throw new Error(`Server error: ${response.status}`);
                }
            } catch (error) {
                console.error(`파일 ${fileName} 이동 실패:`, error);
                failCount++;
            }
        }
        
        // 선택 초기화
        this.selectedCategoryFiles.clear();
        this.updateCategorySelectionUI();
        
        // 일괄 이동 완료 후 보장 새로고침 (Socket.IO 이벤트 보장)
        if (successCount > 0) {
            setTimeout(() => {
                console.log('🔄 카테고리 일괄 이동 완료 후 현재 모달 새로고침');
                const modal = document.getElementById('categoryContentModal');
                if (modal && modal.style.display === 'flex') {
                    const currentCategory = document.getElementById('categoryContentTitle').textContent.replace('📂 ', '').split(' (')[0];
                    this.openCategoryFolder(currentCategory);
                }
            }, 100);
            
            // 추가 보장: 500ms 후 상태 확인 및 새로고침
            setTimeout(() => {
                const modal = document.getElementById('categoryContentModal');
                if (modal && modal.style.display === 'flex') {
                    const currentCategory = document.getElementById('categoryContentTitle').textContent.replace('📂 ', '').split(' (')[0];
                    // 이동된 파일 중 하나라도 아직 존재하는지 확인
                    const movedFiles = Array.from(this.selectedCategoryFiles);
                    const stillExists = movedFiles.some(fileName => {
                        return document.querySelector(`.file-item[data-filename="${fileName}"]`);
                    });
                    if (stillExists) {
                        console.log('🔄 일부 파일이 아직 존재 - 강제 새로고침 실행');
                        this.openCategoryFolder(currentCategory);
                    }
                }
            }, 500);
        }
        
        // 결과 알림
        if (successCount > 0 && failCount === 0) {
            this.showNotification(`✅ ${successCount}개 파일이 성공적으로 이동되었습니다`);
        } else if (successCount > 0 && failCount > 0) {
            this.showNotification(`⚠️ ${successCount}개 파일 성공, ${failCount}개 파일 실패`);
        } else {
            this.showNotification(`❌ 파일 이동에 실패했습니다`, 'error');
        }
        
        // 모달 닫기
        document.getElementById('categoryBatchMoveModal').style.display = 'none';
        
        // 현재 카테고리 새로고침 (실시간 업데이트로 대체 - 서버 호출 최소화)
        // this.openCategoryFolder(this.currentCategory);
    }
}

// 앱 시작
document.addEventListener('DOMContentLoaded', () => {
    const app = new FolderMediaManager();
    
    // 전역에서 테스트 가능하도록 설정
    window.testRenameModal = function() {
        console.log('테스트 하위폴더 모달 호출');
        app.showRenameModal('테스트카테고리', '테스트폴더');
    };
    
    window.testCategoryRenameModal = function() {
        console.log('테스트 카테고리 모달 호출');
        app.showCategoryRenameModal('테스트카테고리');
    };
    
    window.forceReloadDownloads = function() {
        console.log('강제 다운로드 폴더 새로고침');
        app.forceReloadDownloadFiles();
    };
    
    console.log('앱 초기화 완료. 테스트하려면 브라우저 콘솔에서 testRenameModal() 또는 forceReloadDownloads() 실행');
});

