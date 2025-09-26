// 클라우드 모달 강제 표시 시스템
(function() {
    'use strict';
    
    console.log('☁️ 클라우드 모달 강제 표시 시스템 시작');
    
    // 클라우드 모달 재정의 클래스
    class CloudModalOverride {
        constructor() {
            this.modalId = 'cloud-modal-override';
            this.isOpen = false;
            this.init();
        }
        
        init() {
            console.log('☁️ CloudModalOverride 초기화');
            this.createModal();
            this.setupEventListeners();
        }
        
        createModal() {
            // 기존 클라우드 모달들 제거
            const existingIds = ['unifiedCloudModal', 'cloudModal', 'cloud-modal'];
            existingIds.forEach(id => {
                const existing = document.getElementById(id);
                if (existing) existing.remove();
            });
            
            const modal = document.createElement('div');
            modal.id = this.modalId;
            modal.className = 'cloud-modal-override';
            modal.innerHTML = `
                <div class="cloud-modal-backdrop"></div>
                <div class="cloud-modal-container">
                    <div class="cloud-modal-header">
                        <h2>☁️ 클라우드 설정</h2>
                        <button class="cloud-modal-close">✕</button>
                    </div>
                    <div class="cloud-modal-body">
                        <div class="cloud-section">
                            <div class="cloud-icon">🌐</div>
                            <h3>구글 드라이브 연결</h3>
                            <p>메모와 일정을 구글 드라이브에 자동으로 백업합니다.</p>
                            <button class="cloud-btn connect-btn">
                                <span class="btn-icon">📡</span>
                                <span class="btn-text">연결 설정</span>
                            </button>
                        </div>
                        
                        <div class="cloud-section">
                            <div class="cloud-icon">🔄</div>
                            <h3>자동 동기화</h3>
                            <p>변경 사항을 실시간으로 클라우드에 동기화합니다.</p>
                            <button class="cloud-btn sync-btn">
                                <span class="btn-icon">⚡</span>
                                <span class="btn-text">동기화 시작</span>
                            </button>
                        </div>
                        
                        <div class="cloud-section">
                            <div class="cloud-icon">📊</div>
                            <h3>동기화 상태</h3>
                            <div class="sync-status">
                                <p>상태: <span class="status-text">연결 대기 중</span></p>
                                <p>마지막 동기화: <span class="last-sync">없음</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // 스타일 추가
            const style = document.createElement('style');
            style.textContent = `
                #${this.modalId} {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 2147483647;
                }
                
                #${this.modalId}.active {
                    display: block !important;
                }
                
                .cloud-modal-backdrop {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(8px);
                    animation: fadeIn 0.3s ease;
                }
                
                .cloud-modal-container {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
                    padding: 3px;
                    border-radius: 20px;
                    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.4);
                    animation: cloudSlideIn 0.4s ease;
                    width: 90%;
                    max-width: 600px;
                    min-height: 700px;
                }
                
                .cloud-modal-container::before {
                    content: '';
                    position: absolute;
                    top: -3px;
                    left: -3px;
                    right: -3px;
                    bottom: -3px;
                    background: linear-gradient(45deg, #74b9ff, #0984e3, #00cec9, #6c5ce7);
                    border-radius: 20px;
                    opacity: 0.8;
                    z-index: -1;
                    animation: cloudGradient 4s ease infinite;
                }
                
                .cloud-modal-header {
                    background: white;
                    padding: 25px;
                    border-radius: 17px 17px 0 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 3px solid #f8f9fa;
                }
                
                .cloud-modal-header h2 {
                    margin: 0;
                    font-size: 26px;
                    background: linear-gradient(135deg, #74b9ff, #0984e3);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    font-weight: bold;
                }
                
                .cloud-modal-close {
                    background: none;
                    border: none;
                    font-size: 30px;
                    cursor: pointer;
                    color: #999;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                }
                
                .cloud-modal-close:hover {
                    background: #f8f9fa;
                    color: #333;
                    transform: rotate(90deg) scale(1.1);
                }
                
                .cloud-modal-body {
                    background: white;
                    padding: 40px;
                    border-radius: 0 0 17px 17px;
                    min-height: 580px;
                    overflow-y: visible;
                }
                
                .cloud-section {
                    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                    padding: 35px;
                    border-radius: 16px;
                    margin-bottom: 25px;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                    min-height: 150px;
                }
                
                .cloud-section::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(116, 185, 255, 0.1), transparent);
                    animation: shimmer 3s ease infinite;
                }
                
                .cloud-icon {
                    font-size: 48px;
                    margin-bottom: 15px;
                    display: block;
                    animation: float 3s ease-in-out infinite;
                }
                
                .cloud-section h3 {
                    margin: 0 0 15px 0;
                    color: #2d3436;
                    font-size: 20px;
                    font-weight: 600;
                }
                
                .cloud-section p {
                    margin: 0 0 20px 0;
                    color: #636e72;
                    font-size: 15px;
                    line-height: 1.6;
                }
                
                .cloud-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    padding: 15px 30px;
                    border: none;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }
                
                .cloud-btn::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                    transition: left 0.6s ease;
                }
                
                .cloud-btn:hover::before {
                    left: 100%;
                }
                
                .connect-btn {
                    background: linear-gradient(135deg, #00b894, #00a085);
                    color: white;
                    box-shadow: 0 4px 15px rgba(0, 184, 148, 0.3);
                }
                
                .connect-btn:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 25px rgba(0, 184, 148, 0.4);
                }
                
                .sync-btn {
                    background: linear-gradient(135deg, #fdcb6e, #e17055);
                    color: white;
                    box-shadow: 0 4px 15px rgba(253, 203, 110, 0.3);
                }
                
                .sync-btn:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 25px rgba(253, 203, 110, 0.4);
                }
                
                .btn-icon {
                    font-size: 20px;
                }
                
                .sync-status {
                    background: #ffffff;
                    padding: 15px;
                    border-radius: 10px;
                    border: 2px solid #e9ecef;
                }
                
                .status-text {
                    color: #ffc107;
                    font-weight: 600;
                }
                
                .last-sync {
                    color: #6c757d;
                    font-style: italic;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes cloudSlideIn {
                    from {
                        transform: translate(-50%, -40%);
                        opacity: 0;
                        scale: 0.9;
                    }
                    to {
                        transform: translate(-50%, -50%);
                        opacity: 1;
                        scale: 1;
                    }
                }
                
                @keyframes cloudGradient {
                    0%, 100% { filter: hue-rotate(0deg); }
                    50% { filter: hue-rotate(180deg); }
                }
                
                @keyframes shimmer {
                    0% { left: -100%; }
                    100% { left: 100%; }
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
            `;
            
            document.head.appendChild(style);
            document.body.appendChild(modal);
            
            this.modal = modal;
        }
        
        setupEventListeners() {
            // 닫기 버튼 (강력한 이벤트 처리)
            const closeBtn = this.modal.querySelector('.cloud-modal-close');
            if (closeBtn) {
                // 기존 이벤트 제거 후 새로 설정
                const newCloseBtn = closeBtn.cloneNode(true);
                closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
                
                newCloseBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    console.log('☁️ 클라우드 모달 X 버튼 클릭');
                    this.close();
                }, true);
            }
            
            // 배경 클릭
            this.modal.querySelector('.cloud-modal-backdrop').addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('☁️ 클라우드 모달 배경 클릭');
                this.close();
            });
            
            // 모달 자체 클릭시에도 닫기 (안전장치)
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    console.log('☁️ 클라우드 모달 자체 클릭');
                    this.close();
                }
            });
            
            // 연결 버튼
            this.modal.querySelector('.connect-btn').addEventListener('click', () => {
                alert('🔗 클라우드 연결 기능을 준비 중입니다.\n곧 업데이트될 예정입니다!');
            });
            
            // 동기화 버튼
            this.modal.querySelector('.sync-btn').addEventListener('click', () => {
                alert('🔄 자동 동기화 기능을 준비 중입니다.\n곧 업데이트될 예정입니다!');
            });
            
            // ESC 키로 닫기 (강력한 처리)
            const escHandler = (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('☁️ 클라우드 모달 ESC 키 감지');
                    this.close();
                    document.removeEventListener('keydown', escHandler);
                }
            };
            document.addEventListener('keydown', escHandler);
            
            // 모든 버튼에서 Enter/Space 키 처리
            const allButtons = this.modal.querySelectorAll('button');
            allButtons.forEach(btn => {
                if (btn.classList.contains('cloud-modal-close')) {
                    btn.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            this.close();
                        }
                    });
                }
            });
        }
        
        open() {
            console.log('☁️ CloudModalOverride 열기');
            
            // 다른 모달 닫기
            document.querySelectorAll('.modal, .unified-modal, .backup-modal-override').forEach(m => {
                if (m.style.display !== 'none') {
                    m.style.display = 'none';
                }
            });
            
            this.modal.classList.add('active');
            this.isOpen = true;
            
            // body 스크롤 방지
            document.body.style.overflow = 'hidden';
        }
        
        close() {
            console.log('☁️ CloudModalOverride 닫기 시작');
            
            // 모달 상태 변경
            this.modal.classList.remove('active');
            this.modal.style.display = 'none';
            this.isOpen = false;
            
            // body 스크롤 복원
            document.body.style.overflow = '';
            document.body.classList.remove('modal-open');
            
            // 다른 시스템과 연동
            if (window.modalManager && window.modalManager.close) {
                try {
                    window.modalManager.close('unifiedCloudModal');
                } catch (error) {
                    console.log('modalManager 닫기 실패 (무시):', error);
                }
            }
            
            console.log('✅ CloudModalOverride 닫기 완료');
        }
    }
    
    // menu-click-guarantee.js의 클라우드 핸들러 재정의
    function overrideCloudHandler() {
        if (window.menuClickSystem && window.menuClickSystem.handlers) {
            window.menuClickSystem.handlers.unifiedCloudBtn = function(event) {
                console.log('☁️ 클라우드 버튼 클릭 - 재정의된 핸들러');
                if (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                }
                
                if (window.CloudModalOverride) {
                    window.CloudModalOverride.open();
                }
                return false;
            };
            console.log('✅ menuClickSystem 클라우드 핸들러 재정의 완료');
        }
    }
    
    // 클라우드 버튼 이벤트 재설정
    function overrideCloudButton() {
        const cloudBtn = document.getElementById('unifiedCloudBtn');
        if (cloudBtn) {
            // 기존 이벤트 리스너 제거
            const newBtn = cloudBtn.cloneNode(true);
            cloudBtn.parentNode.replaceChild(newBtn, cloudBtn);
            
            // 새 이벤트 리스너 추가
            newBtn.addEventListener('click', function(e) {
                console.log('☁️ 클라우드 버튼 직접 클릭');
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                if (window.CloudModalOverride) {
                    window.CloudModalOverride.open();
                }
                
                return false;
            }, true);
            
            console.log('✅ 클라우드 버튼 재설정 완료');
        }
    }
    
    // 초기화
    function initialize() {
        console.log('☁️ 클라우드 모달 재정의 시스템 초기화');
        
        // 1. 새 클라우드 모달 생성
        window.CloudModalOverride = new CloudModalOverride();
        
        // 2. menu-click-guarantee 핸들러 재정의
        setTimeout(() => {
            overrideCloudHandler();
        }, 100);
        
        // 3. 클라우드 버튼 재설정
        setTimeout(() => {
            overrideCloudButton();
        }, 200);
        
        // 4. 주기적으로 재설정
        setInterval(() => {
            overrideCloudHandler();
            overrideCloudButton();
        }, 2000);
        
        console.log('✅ 클라우드 모달 재정의 시스템 초기화 완료');
    }
    
    // DOM 준비 시 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
    // 페이지 로드 후 재초기화
    window.addEventListener('load', function() {
        setTimeout(initialize, 500);
    });
    
    console.log('☁️ 클라우드 모달 재정의 스크립트 로드 완료');
    
})();