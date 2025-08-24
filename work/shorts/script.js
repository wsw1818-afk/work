class MediaManager {
    constructor() {
        this.mediaItems = JSON.parse(localStorage.getItem('mediaItems')) || [];
        this.categories = JSON.parse(localStorage.getItem('categories')) || this.getDefaultCategories();
        this.currentTab = 'images';
        this.currentViewingItem = null;
        this.currentWorkspaceCategory = null;
        this.init();
    }

    getDefaultCategories() {
        return [
            { id: 'travel', name: '여행', icon: '✈️', color: '#3498db', description: '여행 관련 콘텐츠' },
            { id: 'food', name: '요리', icon: '🍳', color: '#e74c3c', description: '음식 및 요리 관련' },
            { id: 'gaming', name: '게임', icon: '🎮', color: '#9b59b6', description: '게임 플레이 및 리뷰' },
            { id: 'education', name: '교육', icon: '📚', color: '#f39c12', description: '교육 및 학습 자료' },
            { id: 'lifestyle', name: '라이프', icon: '🌱', color: '#27ae60', description: '일상 및 라이프스타일' },
            { id: 'tech', name: '기술', icon: '💻', color: '#34495e', description: 'IT 및 기술 관련' }
        ];
    }

    init() {
        this.setupEventListeners();
        this.loadMediaItems();
        this.updateStats();
        this.loadCategories();
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // File upload for workspace
        const workspaceFileInput = document.getElementById('workspaceFileInput');
        if (workspaceFileInput) {
            workspaceFileInput.addEventListener('change', (e) => {
                this.handleWorkspaceFileUpload(e.target.files);
            });
        }

        // Drag and drop for workspace
        const workspaceDragArea = document.getElementById('workspaceDragArea');
        if (workspaceDragArea) {
            workspaceDragArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                workspaceDragArea.classList.add('dragover');
            });

            workspaceDragArea.addEventListener('dragleave', () => {
                workspaceDragArea.classList.remove('dragover');
            });

            workspaceDragArea.addEventListener('drop', (e) => {
                e.preventDefault();
                workspaceDragArea.classList.remove('dragover');
                this.handleWorkspaceFileUpload(e.dataTransfer.files);
            });
        }

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

        document.getElementById('filterCategory').addEventListener('change', () => {
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
        document.querySelector('.close-viewer')?.addEventListener('click', () => {
            this.closeViewer();
        });
        
        // Close viewer by clicking outside content
        document.getElementById('mediaViewer')?.addEventListener('click', (e) => {
            if (e.target.id === 'mediaViewer') {
                this.closeViewer();
            }
        });
        
        // Close viewer with ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isViewerOpen()) {
                this.closeViewer();
            }
        });

        // Viewer actions
        document.getElementById('markAsUpscaled').addEventListener('click', () => {
            this.markAsUpscaled();
        });

        document.getElementById('changeCategoryBtn').addEventListener('click', () => {
            this.showChangeCategoryDialog();
        });

        document.getElementById('deleteMedia').addEventListener('click', () => {
            this.deleteCurrentMedia();
        });

        document.getElementById('downloadMedia').addEventListener('click', () => {
            this.downloadCurrentMedia();
        });

        // Category management
        document.getElementById('addCategoryBtn')?.addEventListener('click', () => {
            this.showCategoryModal();
        });
        
        // Back button in workspace
        document.getElementById('backBtn')?.addEventListener('click', () => {
            this.exitCategoryWorkspace();
        });

        document.querySelector('.modal-close')?.addEventListener('click', () => {
            this.hideCategoryModal();
        });

        document.getElementById('cancelCategory')?.addEventListener('click', () => {
            this.hideCategoryModal();
        });

        document.getElementById('categoryForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addNewCategory();
        });

        // Workspace search and sort
        document.getElementById('workspaceSearch')?.addEventListener('input', () => {
            this.filterWorkspaceMedia();
        });
        
        document.getElementById('workspaceSort')?.addEventListener('change', () => {
            this.filterWorkspaceMedia();
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
        
        // Load categories tab if selected
        if (tabName === 'categories') {
            this.displayCategories();
        }
        
        // Reset category filter when switching tabs
        if (tabName === 'images' || tabName === 'videos') {
            const filterCategory = document.getElementById('filterCategory');
            if (filterCategory && filterCategory.value !== 'all') {
                // Keep the category filter if it was set
            }
        }
    }

    handleWorkspaceFileUpload(files) {
        if (!this.currentWorkspaceCategory) {
            return;
        }
        
        const category = this.categories.find(cat => cat.id === this.currentWorkspaceCategory);
        let uploadCount = 0;
        
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
                        originalId: null,
                        category: this.currentWorkspaceCategory
                    };
                    this.mediaItems.push(mediaItem);
                    this.saveToLocalStorage();
                    this.filterWorkspaceMedia();
                    this.updateWorkspaceStats();
                    uploadCount++;
                    
                    if (uploadCount === files.length) {
                        this.showToast(`✅ ${uploadCount}개 파일이 '${category.name}' 카테고리에 추가되었습니다`);
                    }
                };
                reader.readAsDataURL(file);
            }
        });
        
        // Reset file input
        document.getElementById('workspaceFileInput').value = '';
    }

    filterAndDisplayMedia() {
        const searchTerm = (document.getElementById('searchBox')?.value || '').toLowerCase();
        const sortBy = document.getElementById('sortBy')?.value || 'date-desc';
        const filterType = document.getElementById('filterType')?.value || 'all';

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
            const categoryBadge = item.category ? this.getCategoryBadge(item.category) : '';
            
            mediaElement.innerHTML = `
                ${mediaContent}
                ${badge}
                ${categoryBadge}
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
        const viewer = document.getElementById('mediaViewer');
        const video = document.getElementById('viewerVideo');
        
        if (viewer) {
            viewer.style.display = 'none';
        }
        if (video) {
            video.pause();
        }
        
        this.currentViewingItem = null;
    }
    
    isViewerOpen() {
        const viewer = document.getElementById('mediaViewer');
        return viewer && viewer.style.display !== 'none';
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
        localStorage.setItem('categories', JSON.stringify(this.categories));
    }

    loadMediaItems() {
        this.filterAndDisplayMedia();
    }

    clearAllData() {
        this.mediaItems = [];
        this.categories = this.getDefaultCategories();
        localStorage.removeItem('mediaItems');
        localStorage.removeItem('categories');
        this.filterAndDisplayMedia();
        this.updateStats();
        this.updateCategoryFilters();
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

    // Category management methods

    getCategoryName(categoryId) {
        const category = this.categories.find(cat => cat.id === categoryId);
        return category ? category.name : null;
    }

    getCategoryBadge(categoryId) {
        const category = this.categories.find(cat => cat.id === categoryId);
        if (!category) return '';
        return `<span class="category-badge" style="background-color: ${category.color}">${category.icon} ${category.name}</span>`;
    }

    displayCategories() {
        const grid = document.getElementById('categoriesGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        this.categories.forEach(category => {
            const itemsInCategory = this.mediaItems.filter(item => item.category === category.id);
            const categoryCard = document.createElement('div');
            categoryCard.className = 'category-card';
            categoryCard.style.borderColor = category.color;
            
            const preview = this.getCategoryPreview(itemsInCategory);
            
            categoryCard.innerHTML = `
                <div class="category-header" style="background-color: ${category.color}">
                    <span class="category-icon">${category.icon}</span>
                    <span class="category-name">${category.name}</span>
                    <button class="category-menu-btn" data-category="${category.id}">⋮</button>
                </div>
                <div class="category-preview">
                    ${preview}
                </div>
                <div class="category-info">
                    <p class="category-description">${category.description || ''}</p>
                    <div class="category-stats">
                        <span>📷 ${itemsInCategory.filter(i => i.type === 'image').length}</span>
                        <span>🎥 ${itemsInCategory.filter(i => i.type === 'video').length}</span>
                        <span>💾 ${this.formatFileSize(itemsInCategory.reduce((acc, i) => acc + i.size, 0))}</span>
                    </div>
                </div>
            `;
            
            categoryCard.addEventListener('click', (e) => {
                if (!e.target.classList.contains('category-menu-btn')) {
                    this.enterCategoryWorkspace(category.id);
                }
            });
            
            categoryCard.querySelector('.category-menu-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.showCategoryMenu(category.id, e.target);
            });
            
            grid.appendChild(categoryCard);
        });
    }

    getCategoryPreview(items) {
        if (items.length === 0) {
            return '<div class="empty-preview">아직 콘텐츠가 없습니다</div>';
        }
        
        const previewItems = items.slice(0, 4);
        const previews = previewItems.map(item => {
            if (item.type === 'image') {
                return `<img src="${item.data}" alt="${item.name}">`;
            } else {
                return `<video src="${item.data}"></video>`;
            }
        }).join('');
        
        return `<div class="preview-grid">${previews}</div>`;
    }

    enterCategoryWorkspace(categoryId) {
        this.currentWorkspaceCategory = categoryId;
        const category = this.categories.find(cat => cat.id === categoryId);
        
        if (!category) return;
        
        // Hide categories grid, show workspace
        document.getElementById('categoriesManager').style.display = 'none';
        document.getElementById('categoryWorkspace').style.display = 'block';
        
        // Update workspace header
        document.getElementById('workspaceCategoryName').textContent = `${category.icon} ${category.name}`;
        
        // Set workspace drag area color
        const workspaceDragArea = document.getElementById('workspaceDragArea');
        if (workspaceDragArea) {
            workspaceDragArea.style.borderColor = category.color;
        }
        
        // Load media for this category
        this.filterWorkspaceMedia();
        this.updateWorkspaceStats();
    }
    
    exitCategoryWorkspace() {
        this.currentWorkspaceCategory = null;
        document.getElementById('categoryWorkspace').style.display = 'none';
        document.getElementById('categoriesManager').style.display = 'block';
        this.displayCategories();
    }
    
    filterWorkspaceMedia() {
        if (!this.currentWorkspaceCategory) return;
        
        const searchTerm = (document.getElementById('workspaceSearch')?.value || '').toLowerCase();
        const sortBy = document.getElementById('workspaceSort')?.value || 'date-desc';
        
        let filteredItems = this.mediaItems.filter(item => {
            return item.category === this.currentWorkspaceCategory &&
                   item.name.toLowerCase().includes(searchTerm);
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
                case 'size-desc':
                    return b.size - a.size;
                default:
                    return 0;
            }
        });
        
        this.displayWorkspaceMedia(filteredItems);
    }
    
    displayWorkspaceMedia(items) {
        const grid = document.getElementById('workspaceMediaGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        if (items.length === 0) {
            grid.innerHTML = '<div class="empty-workspace">아직 이 카테고리에 콘텐츠가 없습니다. 파일을 추가해보세요!</div>';
            return;
        }
        
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
    
    updateWorkspaceStats() {
        if (!this.currentWorkspaceCategory) return;
        
        const categoryItems = this.mediaItems.filter(item => item.category === this.currentWorkspaceCategory);
        const images = categoryItems.filter(item => item.type === 'image');
        const videos = categoryItems.filter(item => item.type === 'video');
        const totalSize = categoryItems.reduce((acc, item) => acc + item.size, 0);
        
        document.getElementById('workspaceImageCount').textContent = `📷 ${images.length}`;
        document.getElementById('workspaceVideoCount').textContent = `🎥 ${videos.length}`;
        document.getElementById('workspaceSize').textContent = `💾 ${this.formatFileSize(totalSize)}`;
    }

    showCategoryMenu(categoryId, targetElement) {
        // Simple implementation - you can enhance this with a proper context menu
        const action = confirm('이 카테고리를 삭제하시겠습니까?');
        if (action) {
            this.deleteCategory(categoryId);
        }
    }

    deleteCategory(categoryId) {
        if (confirm('정말로 이 카테고리를 삭제하시겠습니까? 콘텐츠는 유지됩니다.')) {
            this.categories = this.categories.filter(cat => cat.id !== categoryId);
            // Remove category from all media items
            this.mediaItems.forEach(item => {
                if (item.category === categoryId) {
                    item.category = null;
                }
            });
            this.saveToLocalStorage();
            this.updateCategoryFilters();
            this.displayCategories();
            this.showToast('🗑️ 카테고리가 삭제되었습니다');
        }
    }

    showCategoryModal() {
        document.getElementById('categoryModal').style.display = 'flex';
    }

    hideCategoryModal() {
        document.getElementById('categoryModal').style.display = 'none';
        document.getElementById('categoryForm').reset();
    }

    addNewCategory() {
        const name = document.getElementById('categoryName').value;
        const description = document.getElementById('categoryDescription').value;
        const color = document.getElementById('categoryColor').value;
        const icon = document.getElementById('categoryIcon').value;
        
        const newCategory = {
            id: Date.now().toString(),
            name: name,
            description: description,
            color: color,
            icon: icon
        };
        
        this.categories.push(newCategory);
        this.saveToLocalStorage();
        this.updateCategoryFilters();
        
        if (this.currentTab === 'categories') {
            this.displayCategories();
        }
        
        this.hideCategoryModal();
        this.showToast(`✅ '${name}' 카테고리가 추가되었습니다`);
    }


    showChangeCategoryDialog() {
        if (!this.currentViewingItem) return;
        
        const categories = this.categories.map(cat => `${cat.icon} ${cat.name}`).join('\n');
        const selectedIndex = prompt(`카테고리를 선택하세요 (번호 입력):\n\n${categories.split('\n').map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\n0. 카테고리 없음`);
        
        if (selectedIndex !== null) {
            const index = parseInt(selectedIndex) - 1;
            if (index === -1) {
                this.currentViewingItem.category = null;
            } else if (index >= 0 && index < this.categories.length) {
                this.currentViewingItem.category = this.categories[index].id;
            }
            this.saveToLocalStorage();
            this.filterAndDisplayMedia();
            const categoryName = index === -1 ? '카테고리 없음' : this.categories[index].name;
            this.showToast(`✅ 카테고리가 '${categoryName}'으로 변경되었습니다`);
        }
    }

    loadCategories() {
        if (this.currentTab === 'categories') {
            this.displayCategories();
        }
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new MediaManager();
});