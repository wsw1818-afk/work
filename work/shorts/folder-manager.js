class FolderMediaManager {
    constructor() {
        this.socket = null;
        this.currentFile = null;
        this.categories = [];
        this.downloadFiles = [];
        this.autoSortRules = JSON.parse(localStorage.getItem('autoSortRules')) || [];
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
        this.socket = io('http://localhost:3000');
        
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
            this.loadDownloadFiles();
            
            // 자동 분류 규칙 확인
            this.checkAutoSort(data.fileName);
        });

        this.socket.on('fileMoved', (data) => {
            console.log('📁 파일 이동됨:', data);
            this.loadDownloadFiles();
            this.loadCategories();
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

        // 모달 닫기
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal, .preview-modal').style.display = 'none';
            });
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

        // 드래그 앤 드롭 설정
        this.setupDragAndDrop();
    }

    setupDragAndDrop() {
        // 드래그 시작
        document.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('download-file')) {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('fileName', e.target.dataset.fileName);
                e.target.classList.add('dragging');
                
                // 드래그 오버레이 표시
                document.getElementById('dragOverlay').style.display = 'flex';
            }
        });

        // 드래그 종료
        document.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('download-file')) {
                e.target.classList.remove('dragging');
                document.getElementById('dragOverlay').style.display = 'none';
            }
        });

        // 카테고리에 드롭
        document.addEventListener('dragover', (e) => {
            if (e.target.closest('.category-folder')) {
                e.preventDefault();
                e.target.closest('.category-folder').classList.add('drag-over');
            }
        });

        document.addEventListener('dragleave', (e) => {
            if (e.target.closest('.category-folder')) {
                e.target.closest('.category-folder').classList.remove('drag-over');
            }
        });

        document.addEventListener('drop', async (e) => {
            const categoryFolder = e.target.closest('.category-folder');
            if (categoryFolder) {
                e.preventDefault();
                categoryFolder.classList.remove('drag-over');
                
                const fileName = e.dataTransfer.getData('fileName');
                const category = categoryFolder.dataset.category;
                
                await this.moveFile(fileName, category);
            }
        });
    }

    async loadCategories() {
        try {
            const response = await fetch('http://localhost:3000/api/categories');
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

        this.categories.forEach(category => {
            const folderDiv = document.createElement('div');
            folderDiv.className = 'category-folder';
            folderDiv.dataset.category = category.name;
            
            folderDiv.innerHTML = `
                <div class="folder-icon">📁</div>
                <div class="folder-name">${category.name}</div>
                <div class="folder-count">${category.fileCount}개 파일</div>
                <button class="folder-open" data-category="${category.name}">열기</button>
                <button class="folder-delete" data-category="${category.name}">🗑️</button>
            `;

            // 폴더 열기
            folderDiv.querySelector('.folder-open').addEventListener('click', (e) => {
                this.openCategoryFolder(e.target.dataset.category);
            });

            // 폴더 삭제
            folderDiv.querySelector('.folder-delete').addEventListener('click', async (e) => {
                if (confirm(`'${category.name}' 카테고리를 삭제하시겠습니까?`)) {
                    await this.deleteCategory(category.name);
                }
            });

            grid.appendChild(folderDiv);
        });
    }

    async loadDownloadFiles() {
        try {
            const response = await fetch('http://localhost:3000/api/downloads');
            this.downloadFiles = await response.json();
            this.displayDownloadFiles();
            
            // 파일 개수 업데이트
            document.getElementById('downloadCount').textContent = 
                `파일 ${this.downloadFiles.length}개 대기 중`;
        } catch (error) {
            console.error('다운로드 파일 로드 오류:', error);
        }
    }

    displayDownloadFiles() {
        const container = document.getElementById('downloadFiles');
        container.innerHTML = '';

        if (this.downloadFiles.length === 0) {
            container.innerHTML = '<p class="no-files">다운로드 폴더가 비어있습니다</p>';
            return;
        }

        this.downloadFiles.forEach(file => {
            const fileDiv = document.createElement('div');
            fileDiv.className = 'download-file';
            fileDiv.draggable = true;
            fileDiv.dataset.fileName = file.name;
            
            const icon = file.type === 'image' ? '🖼️' : '🎥';
            
            fileDiv.innerHTML = `
                <span class="file-icon">${icon}</span>
                <span class="file-name">${file.name}</span>
                <span class="file-size">${this.formatFileSize(file.size)}</span>
                <button class="file-preview" data-file='${JSON.stringify(file)}'>👁️</button>
            `;

            // 미리보기 버튼
            fileDiv.querySelector('.file-preview').addEventListener('click', (e) => {
                const fileData = JSON.parse(e.target.dataset.file);
                this.showPreview(fileData);
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
        
        modal.style.display = 'flex';
    }

    async moveFile(fileName, category) {
        try {
            const response = await fetch('http://localhost:3000/api/move-file', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileName, category })
            });

            const result = await response.json();
            if (result.success) {
                this.showNotification(`✅ ${fileName}을(를) ${category}로 이동했습니다`);
                this.loadDownloadFiles();
                this.loadCategories();
            }
        } catch (error) {
            console.error('파일 이동 오류:', error);
            this.showNotification('❌ 파일 이동 실패', 'error');
        }
    }

    async moveFileToCategory() {
        const category = document.getElementById('categorySelect').value;
        if (!category || !this.currentFile) {
            alert('카테고리를 선택하세요');
            return;
        }

        await this.moveFile(this.currentFile.name, category);
        document.getElementById('previewModal').style.display = 'none';
    }

    async createCategory() {
        const name = document.getElementById('categoryName').value;
        if (!name) return;

        try {
            const response = await fetch('http://localhost:3000/api/categories', {
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
            const response = await fetch(`http://localhost:3000/api/categories/${name}`, {
                method: 'DELETE'
            });

            const result = await response.json();
            if (result.success) {
                this.showNotification(`✅ 카테고리 '${name}' 삭제됨`);
                this.loadCategories();
                this.loadDownloadFiles();
            }
        } catch (error) {
            console.error('카테고리 삭제 오류:', error);
        }
    }

    async openCategoryFolder(category) {
        try {
            const response = await fetch(`http://localhost:3000/api/categories/${category}/files`);
            const files = await response.json();
            
            // 여기에 카테고리 내용 표시 로직 추가
            console.log(`${category} 폴더의 파일:`, files);
            
            // 간단한 알림으로 표시 (추후 모달로 개선 가능)
            alert(`${category} 폴더에 ${files.length}개의 파일이 있습니다`);
        } catch (error) {
            console.error('폴더 열기 오류:', error);
        }
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
        const lowerFileName = fileName.toLowerCase();
        
        for (const rule of this.autoSortRules) {
            if (lowerFileName.includes(rule.keyword.toLowerCase())) {
                await this.moveFile(fileName, rule.category);
                this.showNotification(`🤖 자동 분류: ${fileName} → ${rule.category}`);
                return;
            }
        }
    }

    async executeAutoSort() {
        let movedCount = 0;
        
        for (const file of this.downloadFiles) {
            const lowerFileName = file.name.toLowerCase();
            
            for (const rule of this.autoSortRules) {
                if (lowerFileName.includes(rule.keyword.toLowerCase())) {
                    await this.moveFile(file.name, rule.category);
                    movedCount++;
                    break;
                }
            }
        }
        
        if (movedCount > 0) {
            this.showNotification(`🤖 ${movedCount}개 파일이 자동으로 분류되었습니다`);
        } else {
            this.showNotification('📂 분류할 파일이 없습니다');
        }
    }

    showCategoryModal() {
        document.getElementById('categoryModal').style.display = 'flex';
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
}

// 앱 시작
document.addEventListener('DOMContentLoaded', () => {
    new FolderMediaManager();
});