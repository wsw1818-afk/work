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
app.use(express.json());
app.use(express.static('.'));

// 기본 폴더 경로
const BASE_PATH = path.join(__dirname, 'media');
const DOWNLOAD_PATH = path.join(BASE_PATH, '다운로드');
const CATEGORIES_PATH = path.join(BASE_PATH, '카테고리');

// 폴더 구조 초기화
async function initializeFolders() {
    try {
        // 기본 미디어 폴더 생성
        await fs.mkdir(BASE_PATH, { recursive: true });
        await fs.mkdir(DOWNLOAD_PATH, { recursive: true });
        await fs.mkdir(CATEGORIES_PATH, { recursive: true });
        console.log('📁 폴더 구조가 초기화되었습니다.');
        
        // 기본 카테고리 폴더 생성
        const defaultCategories = ['여행', '요리', '게임', '교육', '라이프', '기술', '운동', '음악', '예술', '동물', '패션', '뷰티'];
        for (const category of defaultCategories) {
            const categoryPath = path.join(CATEGORIES_PATH, category);
            await fs.mkdir(categoryPath, { recursive: true });
        }
        console.log('📂 기본 카테고리 폴더가 생성되었습니다.');
        
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
        
        res.json({ success: true, message: `카테고리 '${name}' 생성됨` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 카테고리 삭제
app.delete('/api/categories/:name', async (req, res) => {
    try {
        const { name } = req.params;
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
        const { fileName, category } = req.body;
        const oldPath = path.join(DOWNLOAD_PATH, fileName);
        const newPath = path.join(CATEGORIES_PATH, category, fileName);
        
        await fs.rename(oldPath, newPath);
        console.log(`📁 파일 이동: ${fileName} → ${category}`);
        
        io.emit('fileMoved', { fileName, category });
        res.json({ success: true, message: `파일이 '${category}' 카테고리로 이동됨` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 카테고리의 파일 목록
app.get('/api/categories/:name/files', async (req, res) => {
    try {
        const { name } = req.params;
        const categoryPath = path.join(CATEGORIES_PATH, name);
        const files = await fs.readdir(categoryPath);
        const fileInfo = [];
        
        for (const file of files) {
            const filePath = path.join(categoryPath, file);
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
                        path: `/media/카테고리/${name}/${file}`
                    });
                }
            }
        }
        
        res.json(fileInfo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 파일 제공 (미디어 파일 직접 제공)
app.use('/media', express.static(BASE_PATH));

// 서버 시작
server.listen(PORT, async () => {
    console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`);
    await initializeFolders();
    watchDownloadFolder();
});