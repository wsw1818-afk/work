const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const chokidar = require('chokidar');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('.'));

// 요청 로깅 미들웨어
app.use('/api', (req, res, next) => {
    console.log(`📨 API 요청: ${req.method} ${req.originalUrl}`);
    console.log('파라미터:', req.params);
    console.log('바디:', req.body);
    next();
});

// 기본 폴더 경로
const BASE_PATH = path.join(__dirname, 'media');
const DOWNLOAD_PATH = path.join(BASE_PATH, '다운로드');
const CATEGORIES_PATH = path.join(BASE_PATH, '카테고리');
const DELETED_CATEGORIES_FILE = path.join(__dirname, 'deleted-categories.json');

// 삭제된 카테고리 관리 함수들
async function getDeletedCategories() {
    try {
        const data = await fs.readFile(DELETED_CATEGORIES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // 파일이 없거나 읽기 오류 시 빈 배열 반환
        return [];
    }
}

async function addDeletedCategory(categoryName) {
    try {
        const deletedCategories = await getDeletedCategories();
        if (!deletedCategories.includes(categoryName)) {
            deletedCategories.push(categoryName);
            await fs.writeFile(DELETED_CATEGORIES_FILE, JSON.stringify(deletedCategories, null, 2));
            console.log(`📝 삭제된 카테고리 목록에 추가: ${categoryName}`);
        }
    } catch (error) {
        console.error('삭제된 카테고리 기록 오류:', error);
    }
}

async function removeDeletedCategory(categoryName) {
    try {
        const deletedCategories = await getDeletedCategories();
        const index = deletedCategories.indexOf(categoryName);
        if (index > -1) {
            deletedCategories.splice(index, 1);
            await fs.writeFile(DELETED_CATEGORIES_FILE, JSON.stringify(deletedCategories, null, 2));
            console.log(`📝 삭제된 카테고리 목록에서 제거: ${categoryName}`);
        }
    } catch (error) {
        console.error('삭제된 카테고리 기록 제거 오류:', error);
    }
}

// 폴더 구조 초기화
async function initializeFolders() {
    try {
        // 기본 미디어 폴더 생성
        await fs.mkdir(BASE_PATH, { recursive: true });
        await fs.mkdir(DOWNLOAD_PATH, { recursive: true });
        await fs.mkdir(CATEGORIES_PATH, { recursive: true });
        console.log('📁 폴더 구조가 초기화되었습니다.');
        
        // 기본 카테고리 폴더 생성 (삭제된 카테고리 제외)
        const defaultCategories = ['여행', '요리', '게임', '교육', '라이프', '기술', '운동', '음악', '예술', '동물', '패션', '뷰티'];
        const deletedCategories = await getDeletedCategories();
        
        console.log(`📋 기본 카테고리 목록:`, defaultCategories);
        console.log(`🗑️ 삭제된 카테고리 목록:`, deletedCategories);
        
        let createdCount = 0;
        let skippedCount = 0;
        
        for (const category of defaultCategories) {
            const categoryPath = path.join(CATEGORIES_PATH, category);
            
            if (deletedCategories.includes(category)) {
                // 삭제된 카테고리인 경우 - 물리적으로도 삭제 확인
                try {
                    await fs.access(categoryPath);
                    // 폴더가 존재한다면 삭제
                    console.log(`🗑️ 삭제된 카테고리 '${category}' 폴더를 물리적으로 제거합니다.`);
                    await fs.rmdir(categoryPath, { recursive: true });
                } catch (error) {
                    // 폴더가 이미 없으면 OK
                }
                skippedCount++;
                console.log(`🚫 카테고리 '${category}' 건너뜀 (삭제된 카테고리)`);
            } else {
                // 삭제되지 않은 카테고리인 경우 - 존재하지 않으면 생성
                try {
                    await fs.access(categoryPath);
                    console.log(`✅ 카테고리 '${category}' 이미 존재함`);
                } catch (error) {
                    // 폴더가 없으면 생성
                    await fs.mkdir(categoryPath, { recursive: true });
                    createdCount++;
                    console.log(`📁 카테고리 '${category}' 생성됨`);
                }
            }
        }
        
        console.log(`\n📊 초기화 결과:`);
        console.log(`   ✅ 생성된 카테고리: ${createdCount}개`);
        console.log(`   🚫 건너뛴 카테고리: ${skippedCount}개`);
        console.log(`   📂 총 기본 카테고리: ${defaultCategories.length}개\n`);
        
        // 다운로드 폴더 자동 감시 시작
        await ensureDownloadFolderExists();
    } catch (error) {
        console.error('폴더 초기화 오류:', error);
    }
}

// 다운로드 폴더 존재 확인 및 생성
async function ensureDownloadFolderExists() {
    try {
        await fs.access(DOWNLOAD_PATH);
        console.log('✅ 다운로드 폴더 확인됨');
    } catch (error) {
        console.log('📥 다운로드 폴더를 생성합니다...');
        await fs.mkdir(DOWNLOAD_PATH, { recursive: true });
        console.log('✅ 다운로드 폴더가 생성되었습니다.');
    }
}

// 주기적으로 다운로드 폴더 확인 (5초마다)
function startDownloadFolderCheck() {
    setInterval(async () => {
        try {
            await fs.access(DOWNLOAD_PATH);
        } catch (error) {
            console.log('⚠️ 다운로드 폴더가 삭제됨. 재생성합니다...');
            await ensureDownloadFolderExists();
            
            // 클라이언트에 알림
            io.emit('downloadFolderRecreated', {
                message: '다운로드 폴더가 재생성되었습니다.',
                path: DOWNLOAD_PATH
            });
        }
    }, 5000);
}

// 다운로드 폴더 감시
function watchDownloadFolder() {
    const watcher = chokidar.watch(DOWNLOAD_PATH, {
        ignored: /(^|[\/\\])\../, // 숨김 파일 무시
        persistent: true,
        awaitWriteFinish: {
            stabilityThreshold: 2000,
            pollInterval: 100
        }
    });

    watcher.on('add', async (filePath) => {
        console.log(`📥 새 파일 감지: ${path.basename(filePath)}`);
        // 클라이언트에 새 파일 알림
        io.emit('newFileDetected', {
            fileName: path.basename(filePath),
            filePath: filePath
        });
    });
}

// Socket.io 설정 (실시간 통신)
const http = require('http');
const socketIo = require('socket.io');
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('✅ 클라이언트 연결됨');
    
    socket.on('disconnect', () => {
        console.log('❌ 클라이언트 연결 해제됨');
    });
});

// API 엔드포인트

// 카테고리 목록 가져오기
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await fs.readdir(CATEGORIES_PATH);
        const categoryInfo = [];
        
        for (const category of categories) {
            const categoryPath = path.join(CATEGORIES_PATH, category);
            const stats = await fs.stat(categoryPath);
            
            if (stats.isDirectory()) {
                const files = await fs.readdir(categoryPath);
                categoryInfo.push({
                    name: category,
                    fileCount: files.length,
                    path: categoryPath
                });
            }
        }
        
        res.json(categoryInfo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 새 카테고리 생성
app.post('/api/categories', async (req, res) => {
    try {
        const { name } = req.body;
        const categoryPath = path.join(CATEGORIES_PATH, name);
        
        await fs.mkdir(categoryPath, { recursive: true });
        console.log(`📁 새 카테고리 생성: ${name}`);
        
        // 삭제된 카테고리 목록에서 제거 (재생성된 경우)
        await removeDeletedCategory(name);
        
        res.json({ success: true, message: `카테고리 '${name}' 생성됨` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 카테고리 삭제
app.delete('/api/categories/:name', async (req, res) => {
    try {
        const name = decodeURIComponent(req.params.name);
        const categoryPath = path.join(CATEGORIES_PATH, name);
        
        // 카테고리 폴더의 파일들을 다운로드 폴더로 이동
        const files = await fs.readdir(categoryPath);
        for (const file of files) {
            const oldPath = path.join(categoryPath, file);
            const newPath = path.join(DOWNLOAD_PATH, file);
            await fs.rename(oldPath, newPath);
        }
        
        // 빈 폴더 삭제
        await fs.rmdir(categoryPath);
        console.log(`🗑️ 카테고리 삭제: ${name}`);
        
        // 삭제된 카테고리 목록에 추가
        await addDeletedCategory(name);
        
        res.json({ success: true, message: `카테고리 '${name}' 삭제됨` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 다운로드 폴더의 파일 목록
app.get('/api/downloads', async (req, res) => {
    try {
        const files = await fs.readdir(DOWNLOAD_PATH);
        const fileInfo = [];
        
        for (const file of files) {
            const filePath = path.join(DOWNLOAD_PATH, file);
            const stats = await fs.stat(filePath);
            
            if (stats.isFile()) {
                const ext = path.extname(file).toLowerCase();
                const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
                const isVideo = ['.mp4', '.webm', '.mov', '.avi'].includes(ext);
                
                if (isImage || isVideo) {
                    fileInfo.push({
                        name: file,
                        type: isImage ? 'image' : 'video',
                        size: stats.size,
                        modified: stats.mtime,
                        path: filePath
                    });
                }
            }
        }
        
        res.json(fileInfo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 파일을 카테고리로 이동
app.post('/api/move-file', async (req, res) => {
    try {
        // 다운로드 폴더 존재 확인
        await ensureDownloadFolderExists();
        
        const { fileName, category } = req.body;
        const oldPath = path.join(DOWNLOAD_PATH, fileName);
        const newPath = path.join(CATEGORIES_PATH, category, fileName);
        
        // 삭제된 카테고리인지 확인
        const deletedCategories = await getDeletedCategories();
        if (deletedCategories.includes(category)) {
            console.log(`🚫 삭제된 카테고리로 파일 이동 거부: ${fileName} → ${category}`);
            return res.status(400).json({ 
                error: `'${category}' 카테고리는 삭제되었습니다. 파일을 이동할 수 없습니다.`,
                isDeletedCategory: true
            });
        }
        
        // 대상 카테고리 폴더 확인 및 생성
        const categoryPath = path.join(CATEGORIES_PATH, category);
        await fs.mkdir(categoryPath, { recursive: true });
        
        await fs.rename(oldPath, newPath);
        console.log(`📁 파일 이동: ${fileName} → ${category}`);
        
        io.emit('fileMoved', { fileName, category, success: true, from: 'download' });
        res.json({ success: true, message: `파일이 '${category}' 카테고리로 이동됨` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 카테고리 간 파일 이동 API
app.post('/api/move-category-file', async (req, res) => {
    try {
        const { fileName, sourceCategory, targetCategory } = req.body;
        const oldPath = path.join(CATEGORIES_PATH, sourceCategory, fileName);
        const newPath = path.join(CATEGORIES_PATH, targetCategory, fileName);
        
        // 소스 파일 존재 확인
        try {
            await fs.access(oldPath);
        } catch {
            return res.status(404).json({ error: '파일을 찾을 수 없습니다.' });
        }
        
        // 대상 카테고리 폴더 확인 및 생성
        const targetCategoryPath = path.join(CATEGORIES_PATH, targetCategory);
        await fs.mkdir(targetCategoryPath, { recursive: true });
        
        // 파일 이동
        await fs.rename(oldPath, newPath);
        console.log(`📁 카테고리 간 파일 이동: ${fileName} (${sourceCategory} → ${targetCategory})`);
        
        io.emit('fileMoved', { fileName, category: targetCategory, from: sourceCategory, success: true });
        res.json({ success: true, message: `파일이 '${sourceCategory}'에서 '${targetCategory}'로 이동됨` });
    } catch (error) {
        console.error('카테고리 파일 이동 오류:', error);
        res.status(500).json({ error: error.message });
    }
});

// 카테고리에서 다운로드 폴더로 파일 이동 API
app.post('/api/move-to-download', async (req, res) => {
    try {
        const { fileName, sourceCategory } = req.body;
        const oldPath = path.join(CATEGORIES_PATH, sourceCategory, fileName);
        const newPath = path.join(DOWNLOAD_PATH, fileName);
        
        // 소스 파일 존재 확인
        try {
            await fs.access(oldPath);
        } catch {
            return res.status(404).json({ error: '파일을 찾을 수 없습니다.' });
        }
        
        // 다운로드 폴더 확인 및 생성
        await ensureDownloadFolderExists();
        
        // 파일 이동
        await fs.rename(oldPath, newPath);
        console.log(`📥 파일을 다운로드 폴더로 이동: ${fileName} (${sourceCategory} → 다운로드)`);
        
        io.emit('fileMoved', { fileName, category: 'download', from: sourceCategory, success: true });
        res.json({ success: true, message: `파일이 '${sourceCategory}'에서 다운로드 폴더로 이동됨` });
    } catch (error) {
        console.error('다운로드 폴더 이동 오류:', error);
        res.status(500).json({ error: error.message });
    }
});

// 다운로드 폴더 수동 생성 API
app.post('/api/create-download-folder', async (req, res) => {
    try {
        await ensureDownloadFolderExists();
        
        // 클라이언트에 알림
        io.emit('downloadFolderCreated', {
            message: '다운로드 폴더가 생성되었습니다.',
            path: DOWNLOAD_PATH
        });
        
        res.json({ 
            success: true, 
            message: '다운로드 폴더가 생성되었습니다.',
            path: DOWNLOAD_PATH 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 폴더 상태 확인 API
app.get('/api/folder-status', async (req, res) => {
    try {
        const status = {
            baseFolder: false,
            downloadFolder: false,
            categoriesFolder: false,
            categories: []
        };
        
        // 기본 폴더 확인
        try {
            await fs.access(BASE_PATH);
            status.baseFolder = true;
        } catch {}
        
        // 다운로드 폴더 확인
        try {
            await fs.access(DOWNLOAD_PATH);
            status.downloadFolder = true;
        } catch {}
        
        // 카테고리 폴더 확인
        try {
            await fs.access(CATEGORIES_PATH);
            status.categoriesFolder = true;
            
            const categories = await fs.readdir(CATEGORIES_PATH);
            status.categories = categories.filter(async (cat) => {
                const catPath = path.join(CATEGORIES_PATH, cat);
                const stats = await fs.stat(catPath);
                return stats.isDirectory();
            });
        } catch {}
        
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 카테고리의 파일 목록과 하위 폴더 목록
app.get('/api/categories/:name/files', async (req, res) => {
    try {
        const name = decodeURIComponent(req.params.name);
        const categoryPath = path.join(CATEGORIES_PATH, name);
        const items = await fs.readdir(categoryPath);
        const fileInfo = [];
        const subfolders = [];
        
        for (const item of items) {
            const itemPath = path.join(categoryPath, item);
            const stats = await fs.stat(itemPath);
            
            if (stats.isDirectory()) {
                // 하위 폴더
                const subFolderFiles = await fs.readdir(itemPath);
                const fileCount = subFolderFiles.filter(async (subFile) => {
                    const subFilePath = path.join(itemPath, subFile);
                    const subStats = await fs.stat(subFilePath);
                    return subStats.isFile();
                }).length;
                
                subfolders.push({
                    name: item,
                    type: 'folder',
                    fileCount: fileCount,
                    path: itemPath
                });
            } else if (stats.isFile()) {
                const ext = path.extname(item).toLowerCase();
                const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
                const isVideo = ['.mp4', '.webm', '.mov', '.avi'].includes(ext);
                
                if (isImage || isVideo) {
                    fileInfo.push({
                        name: item,
                        type: isImage ? 'image' : 'video',
                        size: stats.size,
                        modified: stats.mtime,
                        path: `/media/카테고리/${name}/${item}`
                    });
                }
            }
        }
        
        res.json({
            files: fileInfo,
            subfolders: subfolders
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 하위 폴더의 파일 목록
app.get('/api/categories/:categoryName/subfolders/:subfolderName/files', async (req, res) => {
    try {
        const categoryName = decodeURIComponent(req.params.categoryName);
        const subfolderName = decodeURIComponent(req.params.subfolderName);
        const subfolderPath = path.join(CATEGORIES_PATH, categoryName, subfolderName);
        const files = await fs.readdir(subfolderPath);
        const fileInfo = [];
        
        for (const file of files) {
            const filePath = path.join(subfolderPath, file);
            const stats = await fs.stat(filePath);
            
            if (stats.isFile()) {
                const ext = path.extname(file).toLowerCase();
                const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
                const isVideo = ['.mp4', '.webm', '.mov', '.avi'].includes(ext);
                
                if (isImage || isVideo) {
                    fileInfo.push({
                        name: file,
                        type: isImage ? 'image' : 'video',
                        size: stats.size,
                        modified: stats.mtime,
                        path: `/media/카테고리/${categoryName}/${subfolderName}/${file}`
                    });
                }
            }
        }
        
        res.json(fileInfo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 하위 폴더 열기 API (Windows에서만 작동)
app.post('/api/open-subfolder', async (req, res) => {
    try {
        const { exec } = require('child_process');
        const { categoryName, subfolderName } = req.body;
        
        if (!categoryName || !subfolderName) {
            return res.status(400).json({ error: '카테고리 이름과 하위 폴더 이름이 필요합니다' });
        }
        
        const subfolderPath = path.join(CATEGORIES_PATH, categoryName, subfolderName);
        
        // 폴더 존재 확인
        try {
            await fs.access(subfolderPath);
        } catch (error) {
            return res.status(404).json({ error: '하위 폴더가 존재하지 않습니다' });
        }
        
        // Windows에서 탐색기로 폴더 열기
        if (process.platform === 'win32') {
            console.log(`하위 폴더 열기 시도: ${subfolderPath}`);
            
            // Windows 경로를 백슬래시로 변환
            const windowsPath = subfolderPath.replace(/\//g, '\\');
            
            exec(`start "" "${windowsPath}"`, (error, stdout, stderr) => {
                if (error) {
                    console.error('하위 폴더 열기 오류:', error);
                    console.error('stderr:', stderr);
                    if (!res.headersSent) {
                        return res.status(500).json({ error: '폴더를 열 수 없습니다', details: error.message });
                    }
                } else {
                    console.log(`📂 하위 폴더 열림: ${categoryName}/${subfolderName}`);
                    if (!res.headersSent) {
                        return res.json({ success: true, message: `${subfolderName} 폴더가 열렸습니다` });
                    }
                }
            });
            
            // 비동기 콜백이므로 여기서 타임아웃을 설정하여 응답 보장
            setTimeout(() => {
                if (!res.headersSent) {
                    res.json({ success: true, message: `${subfolderName} 폴더 열기 요청이 처리되었습니다` });
                }
            }, 1000);
            
        } else {
            res.status(400).json({ error: 'Windows에서만 지원됩니다' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 하위 폴더 이름 변경 API
app.put('/api/categories/:categoryName/subfolders/:subfolderName/rename', async (req, res) => {
    try {
        const categoryName = decodeURIComponent(req.params.categoryName);
        const subfolderName = decodeURIComponent(req.params.subfolderName);
        const { newName } = req.body;
        
        if (!newName || newName.trim() === '') {
            return res.status(400).json({ error: '새 폴더 이름이 필요합니다' });
        }
        
        const oldPath = path.join(CATEGORIES_PATH, categoryName, subfolderName);
        const newPath = path.join(CATEGORIES_PATH, categoryName, newName.trim());
        
        // 기존 폴더 존재 확인
        try {
            await fs.access(oldPath);
        } catch (error) {
            return res.status(404).json({ error: '변경할 폴더가 존재하지 않습니다' });
        }
        
        // 새 이름의 폴더가 이미 존재하는지 확인
        try {
            await fs.access(newPath);
            return res.status(409).json({ error: '같은 이름의 폴더가 이미 존재합니다' });
        } catch (error) {
            // 새 폴더가 존재하지 않으면 계속 진행
        }
        
        // 폴더 이름 변경
        await fs.rename(oldPath, newPath);
        console.log(`📁 하위 폴더 이름 변경: ${categoryName}/${subfolderName} → ${newName}`);
        
        res.json({ 
            success: true, 
            message: `폴더 이름이 '${newName}'으로 변경되었습니다`,
            oldName: subfolderName,
            newName: newName.trim()
        });
        
    } catch (error) {
        console.error('하위 폴더 이름 변경 오류:', error);
        res.status(500).json({ error: error.message });
    }
});

// 카테고리 폴더 이름 변경 API
app.put('/api/categories/:categoryName/rename', async (req, res) => {
    console.log('📝 카테고리 이름 변경 요청:', {
        원본: req.params.categoryName,
        디코딩후: decodeURIComponent(req.params.categoryName),
        새이름: req.body.newName
    });
    
    try {
        const categoryName = decodeURIComponent(req.params.categoryName);
        const { newName } = req.body;
        
        if (!newName || newName.trim() === '') {
            return res.status(400).json({ error: '새 카테고리 이름이 필요합니다' });
        }
        
        const oldPath = path.join(CATEGORIES_PATH, categoryName);
        const newPath = path.join(CATEGORIES_PATH, newName.trim());
        
        // 기존 카테고리 존재 확인
        try {
            await fs.access(oldPath);
        } catch (error) {
            return res.status(404).json({ error: '변경할 카테고리가 존재하지 않습니다' });
        }
        
        // 새 이름의 카테고리가 이미 존재하는지 확인
        try {
            await fs.access(newPath);
            return res.status(409).json({ error: '같은 이름의 카테고리가 이미 존재합니다' });
        } catch (error) {
            // 새 카테고리가 존재하지 않으면 계속 진행
        }
        
        // 카테고리 폴더 이름 변경
        await fs.rename(oldPath, newPath);
        console.log(`📁 카테고리 이름 변경: ${categoryName} → ${newName}`);
        
        // 삭제된 카테고리 목록 업데이트
        await removeDeletedCategory(newName.trim()); // 새 이름이 삭제 목록에 있다면 제거
        // 기본 카테고리가 변경된 경우 이전 이름을 삭제 목록에 추가할 필요는 없음 (사용자가 직접 변경한 것이므로)
        
        res.json({ 
            success: true, 
            message: `카테고리 이름이 '${newName}'으로 변경되었습니다`,
            oldName: categoryName,
            newName: newName.trim()
        });
        
    } catch (error) {
        console.error('카테고리 이름 변경 오류:', error);
        res.status(500).json({ error: error.message });
    }
});

// 다운로드 폴더 파일 이름 변경 API
app.put('/api/downloads/:fileName/rename', async (req, res) => {
    try {
        const fileName = decodeURIComponent(req.params.fileName);
        const { newName } = req.body;
        
        if (!newName || newName.trim() === '') {
            return res.status(400).json({ error: '새 파일 이름이 필요합니다' });
        }
        
        const oldPath = path.join(DOWNLOAD_PATH, fileName);
        const fileExt = path.extname(fileName);
        const newFileName = newName.trim().endsWith(fileExt) ? newName.trim() : newName.trim() + fileExt;
        const newPath = path.join(DOWNLOAD_PATH, newFileName);
        
        // 기존 파일 존재 확인
        try {
            await fs.access(oldPath);
        } catch (error) {
            return res.status(404).json({ error: '변경할 파일이 존재하지 않습니다' });
        }
        
        // 새 이름의 파일이 이미 존재하는지 확인
        try {
            await fs.access(newPath);
            return res.status(409).json({ error: '같은 이름의 파일이 이미 존재합니다' });
        } catch (error) {
            // 새 파일이 존재하지 않으면 계속 진행
        }
        
        // 파일 이름 변경
        await fs.rename(oldPath, newPath);
        console.log(`📁 다운로드 파일 이름 변경: ${fileName} → ${newFileName}`);
        
        res.json({ 
            success: true, 
            message: `파일 이름이 '${newFileName}'으로 변경되었습니다`,
            oldName: fileName,
            newName: newFileName
        });
        
    } catch (error) {
        console.error('파일 이름 변경 오류:', error);
        res.status(500).json({ error: error.message });
    }
});

// 미디어 폴더 열기 API (Windows에서만 작동)
app.post('/api/open-media-folder', async (req, res) => {
    try {
        const { exec } = require('child_process');
        
        // 폴더 존재 확인
        try {
            await fs.access(BASE_PATH);
        } catch (error) {
            return res.status(404).json({ error: '미디어 폴더가 존재하지 않습니다' });
        }
        
        // Windows에서 탐색기로 폴더 열기
        if (process.platform === 'win32') {
            console.log(`폴더 열기 시도: ${BASE_PATH}`);
            
            // Windows 경로를 백슬래시로 변환
            const windowsPath = BASE_PATH.replace(/\//g, '\\');
            
            exec(`start "" "${windowsPath}"`, (error, stdout, stderr) => {
                if (error) {
                    console.error('폴더 열기 오류:', error);
                    console.error('stderr:', stderr);
                    if (!res.headersSent) {
                        return res.status(500).json({ error: '폴더를 열 수 없습니다', details: error.message });
                    }
                } else {
                    console.log('폴더 열기 성공');
                    if (!res.headersSent) {
                        return res.json({ success: true, message: '폴더가 열렸습니다' });
                    }
                }
            });
            
            // 비동기 콜백이므로 여기서 타임아웃을 설정하여 응답 보장
            setTimeout(() => {
                if (!res.headersSent) {
                    res.json({ success: true, message: '폴더 열기 요청이 처리되었습니다' });
                }
            }, 1000);
            
        } else {
            res.status(400).json({ error: 'Windows에서만 지원됩니다' });
        }
    } catch (error) {
        console.error('API 오류:', error);
        res.status(500).json({ error: error.message });
    }
});

// 카테고리 폴더 열기 API (Windows에서만 작동)
app.post('/api/open-category-folder', async (req, res) => {
    try {
        const { exec } = require('child_process');
        const { categoryName } = req.body;
        
        if (!categoryName) {
            return res.status(400).json({ error: '카테고리 이름이 필요합니다' });
        }
        
        const categoryPath = path.join(CATEGORIES_PATH, categoryName);
        
        // 폴더 존재 확인
        try {
            await fs.access(categoryPath);
        } catch (error) {
            return res.status(404).json({ error: '카테고리 폴더가 존재하지 않습니다' });
        }
        
        // Windows에서 탐색기로 폴더 열기
        if (process.platform === 'win32') {
            console.log(`카테고리 폴더 열기 시도: ${categoryPath}`);
            
            // Windows 경로를 백슬래시로 변환
            const windowsPath = categoryPath.replace(/\//g, '\\');
            
            exec(`start "" "${windowsPath}"`, (error, stdout, stderr) => {
                if (error) {
                    console.error('카테고리 폴더 열기 오류:', error);
                    console.error('stderr:', stderr);
                    if (!res.headersSent) {
                        return res.status(500).json({ error: '폴더를 열 수 없습니다', details: error.message });
                    }
                } else {
                    console.log(`📂 카테고리 폴더 열림: ${categoryName}`);
                    if (!res.headersSent) {
                        return res.json({ success: true, message: `${categoryName} 폴더가 열렸습니다` });
                    }
                }
            });
            
            // 비동기 콜백이므로 여기서 타임아웃을 설정하여 응답 보장
            setTimeout(() => {
                if (!res.headersSent) {
                    res.json({ success: true, message: `${categoryName} 폴더 열기 요청이 처리되었습니다` });
                }
            }, 1000);
            
        } else {
            res.status(400).json({ error: 'Windows에서만 지원됩니다' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 파일 제공 (미디어 파일 직접 제공)
app.use('/media', express.static(BASE_PATH));

// 서버 시작
server.listen(PORT, async () => {
    console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`);
    console.log(`📁 미디어 폴더: ${BASE_PATH}`);
    console.log(`📥 다운로드 폴더: ${DOWNLOAD_PATH}`);
    console.log(`📂 카테고리 폴더: ${CATEGORIES_PATH}`);
    console.log(`\n🔗 사용 가능한 API 엔드포인트:`);
    console.log(`   GET  /api/categories`);
    console.log(`   POST /api/categories`);
    console.log(`   DELETE /api/categories/:name`);
    console.log(`   GET  /api/categories/:name/files`);
    console.log(`   PUT  /api/categories/:categoryName/rename`);
    console.log(`   PUT  /api/categories/:categoryName/subfolders/:subfolderName/rename`);
    console.log(`   GET  /api/downloads`);
    console.log(`   POST /api/move-file`);
    console.log(`   POST /api/move-category-file`);
    console.log(`   POST /api/move-to-download`);
    console.log(`   POST /api/open-category-folder`);
    console.log(`   POST /api/open-subfolder\n`);
    
    await initializeFolders();
    watchDownloadFolder();
    startDownloadFolderCheck(); // 주기적 다운로드 폴더 확인 시작
    
    console.log('✅ 모든 시스템이 준비되었습니다.');
    console.log('🌐 웹 인터페이스: http://localhost:3000/folder-manager.html');
});