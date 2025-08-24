class MediaManager {
    constructor() {
        this.mediaItems = JSON.parse(localStorage.getItem('mediaItems')) || [];
        this.currentTab = 'images';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadMediaItems();
        this.updateStats();
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // File upload
        const fileInput = document.getElementById('fileInput');
        fileInput.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
        });

        // Drag and drop
        const dragDropArea = document.getElementById('dragDropArea');
        dragDropArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            dragDropArea.classList.add('dragover');
        });

        dragDropArea.addEventListener('dragleave', () => {
            dragDropArea.classList.remove('dragover');
        });

        dragDropArea.addEventListener('drop', (e) => {
            e.preventDefault();
            dragDropArea.classList.remove('dragover');
            this.handleFileUpload(e.dataTransfer.files);
        });

        // Search and filter
        document.getElementById('searchBox').addEventListener('input', () => {
            this.filterAndDisplayMedia();
        });

        document.getElementById('sortBy').addEventListener('change', () => {
            this.filterAndDisplayMedia();
        });

        document.getElementById('filterType').addEventListener('change', () => {
            this.filterAndDisplayMedia();
        });

        // Settings
        document.getElementById('clearStorage').addEventListener('click', () => {
            if (confirm('정말로 모든 데이터를 삭제하시겠습니까?')) {
                this.clearAllData();
            }
        });

        document.getElementById('exportData').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('importData').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });

        document.getElementById('importFile').addEventListener('change', (e) => {
            this.importData(e.target.files[0]);
        });

        // Media viewer close
        document.querySelector('.close-viewer').addEventListener('click', () => {
            this.closeViewer();
        });

        // Viewer actions
        document.getElementById('markAsUpscaled').addEventListener('click', () => {
            this.markAsUpscaled();
        });

        document.getElementById('deleteMedia').addEventListener('click', () => {
            this.deleteCurrentMedia();
        });

        document.getElementById('downloadMedia').addEventListener('click', () => {
            this.downloadCurrentMedia();
        });
    }

    switchTab(tabName) {
        this.currentTab = tabName;
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });

        this.filterAndDisplayMedia();
    }

    handleFileUpload(files) {
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const mediaItem = {
                        id: Date.now() + Math.random(),
                        name: file.name,
                        type: file.type.startsWith('image/') ? 'image' : 'video',
                        size: file.size,
                        data: e.target.result,
                        dateAdded: new Date().toISOString(),
                        isUpscaled: false,
                        originalId: null
                    };
                    this.mediaItems.push(mediaItem);
                    this.saveToLocalStorage();
                    this.filterAndDisplayMedia();
                    this.updateStats();
                    this.showToast(`✅ ${file.name} 업로드 완료`);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    filterAndDisplayMedia() {
        const searchTerm = document.getElementById('searchBox').value.toLowerCase();
        const sortBy = document.getElementById('sortBy').value;
        const filterType = document.getElementById('filterType').value;

        let filteredItems = this.mediaItems.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm);
            const matchesFilter = filterType === 'all' || 
                (filterType === 'original' && !item.isUpscaled) ||
                (filterType === 'upscaled' && item.isUpscaled);
            return matchesSearch && matchesFilter;
        });

        // Sort items
        filteredItems.sort((a, b) => {
            switch(sortBy) {
                case 'date-desc':
                    return new Date(b.dateAdded) - new Date(a.dateAdded);
                case 'date-asc':
                    return new Date(a.dateAdded) - new Date(b.dateAdded);
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                case 'size-desc':
                    return b.size - a.size;
                case 'size-asc':
                    return a.size - b.size;
                default:
                    return 0;
            }
        });

        // Display based on current tab
        if (this.currentTab === 'images') {
            const images = filteredItems.filter(item => item.type === 'image');
            this.displayMedia(images, 'imagesGrid');
        } else if (this.currentTab === 'videos') {
            const videos = filteredItems.filter(item => item.type === 'video');
            this.displayMedia(videos, 'videosGrid');
        } else if (this.currentTab === 'upscale') {
            const originals = filteredItems.filter(item => !item.isUpscaled);
            const upscaled = filteredItems.filter(item => item.isUpscaled);
            this.displayMedia(originals, 'originalGrid');
            this.displayMedia(upscaled, 'upscaledGrid');
        }
    }

    displayMedia(items, gridId) {
        const grid = document.getElementById(gridId);
        if (!grid) return;

        grid.innerHTML = '';
        
        items.forEach(item => {
            const mediaElement = document.createElement('div');
            mediaElement.className = 'media-item';
            mediaElement.dataset.id = item.id;
            
            const mediaContent = item.type === 'image' 
                ? `<img src="${item.data}" alt="${item.name}">`
                : `<video src="${item.data}"></video>`;
            
            const badge = item.isUpscaled ? '<span class="media-badge">업스케일</span>' : '';
            
            mediaElement.innerHTML = `
                ${mediaContent}
                ${badge}
                <div class="media-info">
                    <div class="media-name">${item.name}</div>
                    <div class="media-meta">
                        <span>${this.formatFileSize(item.size)}</span>
                        <span>${new Date(item.dateAdded).toLocaleDateString()}</span>
                    </div>
                </div>
            `;
            
            mediaElement.addEventListener('click', () => {
                this.openViewer(item);
            });
            
            grid.appendChild(mediaElement);
        });
    }

    openViewer(item) {
        const viewer = document.getElementById('mediaViewer');
        const viewerImage = document.getElementById('viewerImage');
        const viewerVideo = document.getElementById('viewerVideo');
        const viewerTitle = document.getElementById('viewerTitle');
        const viewerDetails = document.getElementById('viewerDetails');
        
        this.currentViewingItem = item;
        
        if (item.type === 'image') {
            viewerImage.src = item.data;
            viewerImage.style.display = 'block';
            viewerVideo.style.display = 'none';
        } else {
            viewerVideo.src = item.data;
            viewerVideo.style.display = 'block';
            viewerImage.style.display = 'none';
        }
        
        viewerTitle.textContent = item.name;
        viewerDetails.textContent = `크기: ${this.formatFileSize(item.size)} | 추가일: ${new Date(item.dateAdded).toLocaleString()}`;
        
        viewer.style.display = 'flex';
    }

    closeViewer() {
        document.getElementById('mediaViewer').style.display = 'none';
        document.getElementById('viewerVideo').pause();
    }

    markAsUpscaled() {
        if (!this.currentViewingItem) return;
        
        this.currentViewingItem.isUpscaled = !this.currentViewingItem.isUpscaled;
        this.saveToLocalStorage();
        this.filterAndDisplayMedia();
        this.showToast(this.currentViewingItem.isUpscaled ? '✅ 업스케일로 표시됨' : '✅ 원본으로 표시됨');
        this.closeViewer();
    }

    deleteCurrentMedia() {
        if (!this.currentViewingItem) return;
        
        if (confirm('정말로 이 미디어를 삭제하시겠습니까?')) {
            const index = this.mediaItems.findIndex(item => item.id === this.currentViewingItem.id);
            if (index > -1) {
                this.mediaItems.splice(index, 1);
                this.saveToLocalStorage();
                this.filterAndDisplayMedia();
                this.updateStats();
                this.showToast('🗑️ 삭제되었습니다');
                this.closeViewer();
            }
        }
    }

    downloadCurrentMedia() {
        if (!this.currentViewingItem) return;
        
        const link = document.createElement('a');
        link.href = this.currentViewingItem.data;
        link.download = this.currentViewingItem.name;
        link.click();
        this.showToast('⬇️ 다운로드 시작');
    }

    updateStats() {
        const images = this.mediaItems.filter(item => item.type === 'image');
        const videos = this.mediaItems.filter(item => item.type === 'video');
        const totalSize = this.mediaItems.reduce((acc, item) => acc + item.size, 0);
        
        document.getElementById('totalImages').textContent = `이미지: ${images.length}`;
        document.getElementById('totalVideos').textContent = `영상: ${videos.length}`;
        document.getElementById('totalSize').textContent = `전체 용량: ${this.formatFileSize(totalSize)}`;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    saveToLocalStorage() {
        localStorage.setItem('mediaItems', JSON.stringify(this.mediaItems));
    }

    loadMediaItems() {
        this.filterAndDisplayMedia();
    }

    clearAllData() {
        this.mediaItems = [];
        localStorage.removeItem('mediaItems');
        this.filterAndDisplayMedia();
        this.updateStats();
        this.showToast('🗑️ 모든 데이터가 삭제되었습니다');
    }

    exportData() {
        const dataStr = JSON.stringify(this.mediaItems, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `media-manager-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        this.showToast('💾 데이터가 내보내졌습니다');
    }

    importData(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (Array.isArray(data)) {
                    this.mediaItems = data;
                    this.saveToLocalStorage();
                    this.filterAndDisplayMedia();
                    this.updateStats();
                    this.showToast('📂 데이터를 가져왔습니다');
                }
            } catch (error) {
                this.showToast('❌ 파일을 읽을 수 없습니다');
            }
        };
        reader.readAsText(file);
    }

    showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new MediaManager();
});