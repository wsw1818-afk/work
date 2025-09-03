// Clean Menu Controller - 깔끔한 메뉴 컨트롤러
(function() {
    'use strict';
    
    // DOM 로드 완료 시 실행
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🎨 Clean Menu Controller 초기화 시작');
        
        // 액션 바 요소 찾기
        const actionBar = document.querySelector('.action-bar');
        if (!actionBar) {
            console.warn('액션 바를 찾을 수 없습니다');
            return;
        }
        
        // 버튼 그룹이 없으면 재구성
        if (!actionBar.querySelector('.button-group')) {
            reorganizeActionBar();
        }
        
        // 상태 인디케이터 업데이트
        updateStatusIndicators();
        
        // 버튼 툴팁 개선
        enhanceButtonTooltips();
        
        // 반응형 레이아웃 처리
        handleResponsiveLayout();
        
        // 윈도우 리사이즈 이벤트
        window.addEventListener('resize', handleResponsiveLayout);
        
        console.log('✅ Clean Menu Controller 초기화 완료');
    });
    
    // 액션 바 재구성
    function reorganizeActionBar() {
        const actionBar = document.querySelector('.action-bar');
        if (!actionBar) return;
        
        const buttons = actionBar.querySelectorAll('.action-btn');
        const statusIndicators = actionBar.querySelector('.status-indicators');
        
        // 기존 내용 백업
        const buttonsArray = Array.from(buttons);
        
        // 액션 바 초기화
        actionBar.innerHTML = '';
        
        // 메인 액션 그룹 생성
        const mainGroup = document.createElement('div');
        mainGroup.className = 'button-group main-actions';
        
        // 버튼들을 메인 그룹에 추가
        buttonsArray.forEach(btn => {
            // 툴팁 추가
            if (!btn.hasAttribute('title')) {
                const text = btn.textContent.trim();
                if (text.includes('일정')) btn.setAttribute('title', '새 일정 추가');
                else if (text.includes('스티커')) btn.setAttribute('title', '스티커 메모');
                else if (text.includes('엑셀')) btn.setAttribute('title', '엑셀 내보내기');
                else if (text.includes('클라우드')) btn.setAttribute('title', '클라우드 설정');
                else if (text.includes('동기화')) btn.setAttribute('title', '동기화 상태');
                else if (text.includes('설정')) btn.setAttribute('title', '설정');
                else if (text.includes('저장소')) btn.setAttribute('title', '저장소 관리');
            }
            mainGroup.appendChild(btn);
        });
        
        // 액션 바에 추가
        actionBar.appendChild(mainGroup);
        
        // 상태 인디케이터 추가
        if (statusIndicators) {
            actionBar.appendChild(statusIndicators);
        } else {
            createStatusIndicators(actionBar);
        }
    }
    
    // 상태 인디케이터 생성
    function createStatusIndicators(parent) {
        const indicatorsDiv = document.createElement('div');
        indicatorsDiv.className = 'status-indicators';
        
        // 드라이브 상태
        const driveStatus = document.createElement('div');
        driveStatus.className = 'status-indicator';
        driveStatus.id = 'driveStatus';
        driveStatus.setAttribute('title', '구글 드라이브 연결 상태');
        driveStatus.innerHTML = `
            <span class="status-icon">❌</span>
            <span class="status-text">연결 안됨</span>
        `;
        
        // 동기화 상태
        const syncStatus = document.createElement('div');
        syncStatus.className = 'status-indicator';
        syncStatus.id = 'syncStatus';
        syncStatus.setAttribute('title', '동기화 상태');
        syncStatus.innerHTML = `
            <span class="status-icon">⏸️</span>
            <span class="status-text">대기중</span>
        `;
        
        indicatorsDiv.appendChild(driveStatus);
        indicatorsDiv.appendChild(syncStatus);
        parent.appendChild(indicatorsDiv);
    }
    
    // 상태 인디케이터 업데이트
    function updateStatusIndicators() {
        // 드라이브 상태 체크
        const driveStatus = document.getElementById('driveStatus');
        if (driveStatus) {
            const isConnected = localStorage.getItem('googleDriveConnected') === 'true';
            if (isConnected) {
                driveStatus.classList.add('connected');
                driveStatus.querySelector('.status-icon').textContent = '✅';
                driveStatus.querySelector('.status-text').textContent = '연결됨';
            }
        }
        
        // 동기화 상태 체크
        const syncStatus = document.getElementById('syncStatus');
        if (syncStatus) {
            const lastSync = localStorage.getItem('lastSyncTime');
            if (lastSync) {
                const syncTime = new Date(lastSync);
                const now = new Date();
                const diff = Math.floor((now - syncTime) / 60000); // 분 단위
                
                if (diff < 5) {
                    syncStatus.classList.add('connected');
                    syncStatus.querySelector('.status-icon').textContent = '✅';
                    syncStatus.querySelector('.status-text').textContent = '최근 동기화';
                } else if (diff < 60) {
                    syncStatus.querySelector('.status-icon').textContent = '🔄';
                    syncStatus.querySelector('.status-text').textContent = `${diff}분 전`;
                } else {
                    syncStatus.querySelector('.status-icon').textContent = '⚠️';
                    syncStatus.querySelector('.status-text').textContent = '동기화 필요';
                }
            }
        }
    }
    
    // 버튼 툴팁 개선
    function enhanceButtonTooltips() {
        const buttons = document.querySelectorAll('.action-btn');
        
        buttons.forEach(btn => {
            // 마우스 호버 시 툴팁 표시 딜레이
            let tooltipTimeout;
            
            btn.addEventListener('mouseenter', function() {
                tooltipTimeout = setTimeout(() => {
                    btn.classList.add('show-tooltip');
                }, 500);
            });
            
            btn.addEventListener('mouseleave', function() {
                clearTimeout(tooltipTimeout);
                btn.classList.remove('show-tooltip');
            });
            
            // 클릭 시 즉시 툴팁 숨기기
            btn.addEventListener('click', function() {
                clearTimeout(tooltipTimeout);
                btn.classList.remove('show-tooltip');
            });
        });
    }
    
    // 반응형 레이아웃 처리
    function handleResponsiveLayout() {
        const actionBar = document.querySelector('.action-bar');
        if (!actionBar) return;
        
        const width = window.innerWidth;
        const buttons = actionBar.querySelectorAll('.action-btn');
        
        if (width < 768) {
            // 모바일 뷰: 버튼 텍스트 간소화
            buttons.forEach(btn => {
                const text = btn.textContent;
                if (text.includes('일정 추가')) {
                    btn.innerHTML = '➕';
                } else if (text.includes('스티커')) {
                    btn.innerHTML = '📝';
                } else if (text.includes('엑셀')) {
                    btn.innerHTML = '📊';
                } else if (text.includes('클라우드')) {
                    btn.innerHTML = '☁️';
                } else if (text.includes('동기화')) {
                    btn.innerHTML = '🔍';
                } else if (text.includes('설정')) {
                    btn.innerHTML = '⚙️';
                } else if (text.includes('저장소')) {
                    btn.innerHTML = '🗄️';
                }
            });
            
            // 상태 인디케이터 텍스트 숨기기
            const statusTexts = actionBar.querySelectorAll('.status-text');
            statusTexts.forEach(text => {
                text.style.display = 'none';
            });
        } else {
            // 데스크톱 뷰: 전체 텍스트 표시
            const buttonTexts = {
                'createBtn': '➕ 일정 추가',
                'memoBtn': '📝 스티커',
                'excelBtn': '📊 엑셀',
                'unifiedCloudBtn': '☁️ 클라우드',
                'syncStatusBtn': '🔍 동기화',
                'settingsBtn': '⚙️ 설정',
                'storageBtn': '🗄️ 저장소'
            };
            
            buttons.forEach(btn => {
                if (buttonTexts[btn.id]) {
                    btn.innerHTML = buttonTexts[btn.id];
                }
            });
            
            // 상태 인디케이터 텍스트 표시
            const statusTexts = actionBar.querySelectorAll('.status-text');
            statusTexts.forEach(text => {
                text.style.display = '';
            });
        }
    }
    
    // 버튼 클릭 애니메이션
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('action-btn')) {
            // 리플 효과
            const btn = e.target;
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                btn.style.transform = '';
            }, 100);
        }
    });
    
    // 상태 인디케이터 자동 업데이트 (30초마다)
    setInterval(updateStatusIndicators, 30000);
    
})();