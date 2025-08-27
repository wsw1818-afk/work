/**
 * 설정 모달 기능 강제 수정 스크립트
 * 모든 설정 기능들이 확실히 작동하도록 보장
 */

(function() {
    'use strict';
    
    console.log('⚙️ 설정 모달 기능 강제 수정 시작');
    
    // 중복 실행 방지
    if (window.settingsFixApplied) {
        console.log('설정 수정이 이미 적용됨');
        return;
    }
    
    // DOM 준비될 때까지 대기
    function waitForDOM(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            setTimeout(callback, 100);
        }
    }
    
    // 강제 설정 저장 함수
    window.saveSettingsForce = function() {
        console.log('💾 강제 설정 저장 실행');
        try {
            // 테마 설정 저장
            const themeSelect = document.getElementById('themeSelect');
            if (themeSelect) {
                const themeValue = themeSelect.value;
                document.documentElement.setAttribute('data-theme', themeValue);
                localStorage.setItem('theme', themeValue);
                console.log('테마 저장:', themeValue);
            }
            
            // 글꼴 크기 저장
            const fontSizeSlider = document.getElementById('fontSizeSlider');
            if (fontSizeSlider) {
                const fontSize = fontSizeSlider.value;
                document.documentElement.style.setProperty('--font-scale', fontSize);
                localStorage.setItem('fontSize', fontSize);
                console.log('글꼴 크기 저장:', fontSize);
            }
            
            // 달력 크기 저장
            const widthSlider = document.getElementById('widthSlider');
            const heightSlider = document.getElementById('heightSlider');
            
            if (widthSlider) {
                const widthScale = widthSlider.value;
                document.documentElement.style.setProperty('--width-scale', widthScale);
                localStorage.setItem('widthScale', widthScale);
                console.log('가로 크기 저장:', widthScale);
            } else {
                console.warn('widthSlider를 찾을 수 없음');
            }
            
            if (heightSlider) {
                const heightScale = heightSlider.value;
                console.log('🔧 세로 크기 저장 시도:', heightScale);
                
                // CSS 변수 설정 (여러 방법으로 시도)
                document.documentElement.style.setProperty('--height-scale', heightScale);
                document.documentElement.style.setProperty('--height-scale', heightScale, 'important');
                
                // localStorage에 저장
                localStorage.setItem('heightScale', heightScale);
                
                // 확인
                const applied = getComputedStyle(document.documentElement).getPropertyValue('--height-scale').trim();
                console.log('세로 크기 저장 완료:', heightScale, '(적용된 값:', applied + ')');
                
                // 즉시 달력에 적용
                const days = document.querySelectorAll('.day');
                console.log(`${days.length}개 날짜 셀에 세로 크기 적용`);
                
            } else {
                console.warn('heightSlider를 찾을 수 없음');
            }
            
            // 주 시작일 저장
            const weekStartSelect = document.querySelector('#settingsModal .form-select');
            if (weekStartSelect && weekStartSelect.parentElement.querySelector('label').textContent.includes('주 시작일')) {
                const weekStart = weekStartSelect.value;
                localStorage.setItem('weekStart', weekStart);
                console.log('주 시작일 저장:', weekStart);
            }
            
            alert('설정이 저장되었습니다! ⚙️');
            closeModalForce('settingsModal');
            
            // 달력 새로고침
            if (typeof createCalendar === 'function') {
                createCalendar();
            }
            
        } catch (error) {
            console.error('설정 저장 중 오류:', error);
            alert('설정 저장 중 오류가 발생했습니다: ' + error.message);
        }
    };
    
    // 강제 설정 취소 함수 (원본 설정으로 완전 복원)
    window.cancelSettingsForce = function() {
        console.log('❌ 강제 설정 취소 실행 - 원본 설정으로 복원');
        try {
            // localStorage에서 저장된 원본 설정 로드
            const savedTheme = localStorage.getItem('theme') || 'light';
            const savedFontSize = localStorage.getItem('fontSize') || '1.0';
            const savedWidthScale = localStorage.getItem('widthScale') || '1.0';
            const savedHeightScale = localStorage.getItem('heightScale') || '1.0';
            
            console.log('복원할 원본 설정:', {
                theme: savedTheme,
                fontSize: savedFontSize,
                widthScale: savedWidthScale,
                heightScale: savedHeightScale
            });
            
            // CSS 변수 원본으로 복원
            document.documentElement.setAttribute('data-theme', savedTheme);
            document.documentElement.style.setProperty('--font-scale', savedFontSize, 'important');
            document.documentElement.style.setProperty('--width-scale', savedWidthScale, 'important');
            document.documentElement.style.setProperty('--height-scale', savedHeightScale, 'important');
            
            // 세로 크기의 경우 .day 요소들도 직접 복원
            const days = document.querySelectorAll('.day');
            const isMobile = window.innerWidth <= 768;
            const baseHeight = isMobile ? 80 : 120;
            const originalHeight = baseHeight * parseFloat(savedHeightScale);
            
            days.forEach(day => {
                day.style.minHeight = `${originalHeight}px`;
            });
            
            console.log(`📏 ${days.length}개 날짜 셀을 원본 세로 크기로 복원: ${originalHeight}px`);
            
            // 모달의 슬라이더들도 원본 값으로 복원
            const themeSelect = document.getElementById('themeSelect');
            const fontSizeSlider = document.getElementById('fontSizeSlider');
            const widthSlider = document.getElementById('widthSlider');
            const heightSlider = document.getElementById('heightSlider');
            
            if (themeSelect) themeSelect.value = savedTheme;
            if (fontSizeSlider) {
                fontSizeSlider.value = savedFontSize;
                updateFontSizeDisplayForce(savedFontSize);
            }
            if (widthSlider) {
                widthSlider.value = savedWidthScale;
                updateSizeDisplayForce('width', savedWidthScale);
            }
            if (heightSlider) {
                heightSlider.value = savedHeightScale;
                updateSizeDisplayForce('height', savedHeightScale);
            }
            
            // 취소 피드백 표시
            addCancelFeedback();
            
            closeModalForce('settingsModal');
            console.log('✅ 설정이 원본으로 완전 복원되었습니다');
            
        } catch (error) {
            console.error('설정 취소 중 오류:', error);
        }
    };
    
    // 취소 피드백
    function addCancelFeedback() {
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            center: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #FF9800;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 10000;
            font-weight: bold;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
        `;
        feedback.textContent = '⚙️ 설정이 원래대로 복원되었습니다';
        
        document.body.appendChild(feedback);
        
        // 2초 후 제거
        setTimeout(() => {
            feedback.style.opacity = '0';
            feedback.style.transform = 'translateX(-50%) translateY(-20px)';
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.parentNode.removeChild(feedback);
                }
            }, 300);
        }, 2000);
    }
    
    // 강제 모달 닫기 함수
    function closeModalForce(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            console.log(`모달 닫힌: ${modalId}`);
        }
    }
    
    // 글꼴 크기 조절 강제 함수 (실시간 미리보기 포함)
    window.adjustFontSizeForce = function(delta) {
        console.log(`🔤 글꼴 크기 조절 시도:`, delta);
        
        const slider = document.getElementById('fontSizeSlider');
        if (slider) {
            const currentValue = parseFloat(slider.value);
            const newValue = Math.max(0.7, Math.min(1.5, currentValue + delta));
            
            console.log(`글꼴 크기 조절: ${currentValue} → ${newValue}`);
            
            // 슬라이더 값 설정
            slider.value = newValue;
            
            // CSS 변수 즉시 적용 (미리보기)
            document.documentElement.style.setProperty('--font-scale', newValue, 'important');
            
            // 디스플레이 업데이트
            updateFontSizeDisplayForce(newValue);
            
            // 시각적 피드백 추가
            addFontSizeFeedback(newValue);
            
            console.log(`✅ 글꼴 크기가 ${newValue}배로 즉시 변경됨 (미리보기)`);
            
        } else {
            console.error('fontSizeSlider를 찾을 수 없음');
        }
    };
    
    // 글꼴 크기 시각적 피드백
    function addFontSizeFeedback(value) {
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background: #2196F3;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 10000;
            font-weight: bold;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
        `;
        feedback.textContent = `글꼴 크기: ${Math.round(value * 100)}%`;
        
        document.body.appendChild(feedback);
        
        // 2초 후 제거
        setTimeout(() => {
            feedback.style.opacity = '0';
            feedback.style.transform = 'translateX(-100px)';
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.parentNode.removeChild(feedback);
                }
            }, 300);
        }, 1500);
    }
    
    // 달력 크기 조절 강제 함수 (실시간 미리보기 포함)
    window.adjustCalendarSizeForce = function(type, delta) {
        console.log(`🔧 달력 ${type} 크기 조절 시도:`, delta);
        
        const slider = document.getElementById(type + 'Slider');
        if (slider) {
            const currentValue = parseFloat(slider.value);
            const newValue = Math.max(0.5, Math.min(2.0, currentValue + delta));
            
            console.log(`${type} 크기 조절: ${currentValue} → ${newValue}`);
            
            // 슬라이더 값 설정
            slider.value = newValue;
            
            // CSS 변수 즉시 적용 (미리보기)
            document.documentElement.style.setProperty(`--${type}-scale`, newValue, 'important');
            
            // 디스플레이 업데이트
            updateSizeDisplayForce(type, newValue);
            
            // 시각적 피드백 추가
            addVisualFeedback(type, newValue);
            
            // 특히 height의 경우 추가 처리
            if (type === 'height') {
                const applied = getComputedStyle(document.documentElement).getPropertyValue('--height-scale').trim();
                console.log('세로 크기 적용 확인:', applied);
                
                // 모든 .day 요소에 즉시 적용
                applyHeightToAllDays(newValue);
            }
            
            // width의 경우도 즉시 적용
            if (type === 'width') {
                const applied = getComputedStyle(document.documentElement).getPropertyValue('--width-scale').trim();
                console.log('가로 크기 적용 확인:', applied);
            }
            
            console.log(`✅ ${type} 크기가 ${newValue}배로 즉시 변경됨 (미리보기)`);
            
        } else {
            console.error(`${type}Slider를 찾을 수 없음`);
        }
    };
    
    // 모든 날짜 셀에 세로 크기 즉시 적용
    function applyHeightToAllDays(scale) {
        const days = document.querySelectorAll('.day');
        const isMobile = window.innerWidth <= 768;
        const baseHeight = isMobile ? 80 : 120;
        const newHeight = baseHeight * parseFloat(scale);
        
        days.forEach((day, index) => {
            day.style.minHeight = `${newHeight}px`;
            if (index < 3) { // 처음 3개만 로그
                console.log(`Day ${index + 1} 세로 크기 적용: ${newHeight}px`);
            }
        });
        
        console.log(`📏 ${days.length}개 날짜 셀에 세로 크기 ${scale}배 (${newHeight}px) 즉시 적용`);
    }
    
    // 시각적 피드백 함수
    function addVisualFeedback(type, value) {
        // 임시 알림 표시
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 10000;
            font-weight: bold;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
        `;
        feedback.textContent = `${type === 'width' ? '가로' : '세로'} 크기: ${Math.round(value * 100)}%`;
        
        document.body.appendChild(feedback);
        
        // 2초 후 제거
        setTimeout(() => {
            feedback.style.opacity = '0';
            feedback.style.transform = 'translateX(100px)';
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.parentNode.removeChild(feedback);
                }
            }, 300);
        }, 1500);
    }
    
    // 표시 업데이트 강제 함수
    function updateFontSizeDisplayForce(value) {
        const display = document.getElementById('fontSizeDisplay');
        if (display) {
            display.textContent = Math.round(value * 100) + '%';
        }
    }
    
    function updateSizeDisplayForce(type, value) {
        const display = document.getElementById(type + 'Display');
        if (display) {
            display.textContent = Math.round(value * 100) + '%';
        }
    }
    
    // 설정 모달 이벤트 강제 초기화
    function initializeSettingsEventsForce() {
        console.log('⚙️ 설정 모달 이벤트 강제 초기화');
        
        // 테마 선택 이벤트
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.addEventListener('change', function() {
                document.documentElement.setAttribute('data-theme', this.value);
                console.log('테마 실시간 변경:', this.value);
            });
        }
        
        // 슬라이더 이벤트들
        const fontSizeSlider = document.getElementById('fontSizeSlider');
        if (fontSizeSlider) {
            // 모든 기존 이벤트 완전 제거
            const newFontSlider = fontSizeSlider.cloneNode(true);
            fontSizeSlider.parentNode.replaceChild(newFontSlider, fontSizeSlider);
            
            // 새로운 강력한 이벤트 핸들러
            const fontHandler = function() {
                const value = parseFloat(this.value);
                console.log('🔤 글꼴 크기 슬라이더 실시간 변경:', value);
                
                // CSS 변수 설정 (여러 방법으로 시도)
                document.documentElement.style.setProperty('--font-scale', value, 'important');
                document.documentElement.style.cssText += `--font-scale: ${value} !important;`;
                
                // 디스플레이 업데이트
                updateFontSizeDisplayForce(value);
                
                // 시각적 피드백
                addFontSizeFeedback(value);
                
                // 확인
                const applied = getComputedStyle(document.documentElement).getPropertyValue('--font-scale').trim();
                console.log(`🔤 글꼴 크기 즉시 적용: ${value} (CSS: ${applied})`);
            };
            
            // 여러 이벤트 타입에 등록
            ['input', 'change', 'mouseup', 'touchend'].forEach(eventType => {
                newFontSlider.addEventListener(eventType, fontHandler);
            });
            
            console.log('✅ fontSizeSlider 완전 재생성 및 강력한 이벤트 등록 완료');
        } else {
            console.error('❌ fontSizeSlider를 찾을 수 없음');
        }
        
        const widthSlider = document.getElementById('widthSlider');
        if (widthSlider) {
            // 모든 기존 이벤트 완전 제거
            const newWidthSlider = widthSlider.cloneNode(true);
            widthSlider.parentNode.replaceChild(newWidthSlider, widthSlider);
            
            // 새로운 강력한 이벤트 핸들러
            const widthHandler = function() {
                const value = parseFloat(this.value);
                console.log('🔧 가로 크기 슬라이더 실시간 변경:', value);
                
                // CSS 변수 설정 (여러 방법으로 시도)
                document.documentElement.style.setProperty('--width-scale', value, 'important');
                document.documentElement.style.cssText += `--width-scale: ${value} !important;`;
                
                // 디스플레이 업데이트
                updateSizeDisplayForce('width', value);
                
                // 시각적 피드백
                addVisualFeedback('width', value);
                
                // 확인
                const applied = getComputedStyle(document.documentElement).getPropertyValue('--width-scale').trim();
                console.log(`📏 가로 크기 즉시 적용: ${value} (CSS: ${applied})`);
            };
            
            // 여러 이벤트 타입에 등록
            ['input', 'change', 'mouseup', 'touchend'].forEach(eventType => {
                newWidthSlider.addEventListener(eventType, widthHandler);
            });
            
            console.log('✅ widthSlider 완전 재생성 및 강력한 이벤트 등록 완료');
        } else {
            console.error('❌ widthSlider를 찾을 수 없음');
        }
        
        const heightSlider = document.getElementById('heightSlider');
        if (heightSlider) {
            // 모든 기존 이벤트 완전 제거
            const newHeightSlider = heightSlider.cloneNode(true);
            heightSlider.parentNode.replaceChild(newHeightSlider, heightSlider);
            
            // 새로운 강력한 이벤트 핸들러
            const heightHandler = function() {
                const value = parseFloat(this.value);
                console.log('🔧 세로 크기 슬라이더 실시간 변경:', value);
                
                // CSS 변수 설정 (여러 방법으로 시도)
                document.documentElement.style.setProperty('--height-scale', value, 'important');
                document.documentElement.style.cssText += `--height-scale: ${value} !important;`;
                
                // 즉시 모든 .day 요소에 직접 적용 (더 확실한 방법)
                const days = document.querySelectorAll('.day');
                const isMobile = window.innerWidth <= 768;
                const baseHeight = isMobile ? 80 : 120;
                const newHeight = baseHeight * value;
                
                days.forEach((day, index) => {
                    day.style.minHeight = `${newHeight}px`;
                    day.style.height = 'auto'; // 내용에 따라 확장 허용
                    if (index < 2) { // 처음 2개만 로그
                        console.log(`Day ${index + 1} 즉시 적용: ${newHeight}px`);
                    }
                });
                
                // 디스플레이 업데이트
                updateSizeDisplayForce('height', value);
                
                // 시각적 피드백
                addVisualFeedback('height', value);
                
                // 확인
                const applied = getComputedStyle(document.documentElement).getPropertyValue('--height-scale').trim();
                console.log(`📏 세로 크기 즉시 적용: ${value} (CSS: ${applied}) - ${days.length}개 셀 ${newHeight}px`);
            };
            
            // 여러 이벤트 타입에 등록
            ['input', 'change', 'mouseup', 'touchend'].forEach(eventType => {
                newHeightSlider.addEventListener(eventType, heightHandler);
            });
            
            console.log('✅ heightSlider 완전 재생성 및 강력한 이벤트 등록 완료');
        } else {
            console.error('❌ heightSlider를 찾을 수 없음');
        }
        
        console.log('✅ 설정 모달 이벤트 초기화 완료');
    }
    
    // 설정 버튼 강제 수정
    function fixSettingsButton() {
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            // 기존 이벤트 제거
            const newBtn = settingsBtn.cloneNode(true);
            settingsBtn.parentNode.replaceChild(newBtn, settingsBtn);
            
            // 새 이벤트 등록
            newBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('⚙️ 설정 버튼 클릭됨 (강제 수정)');
                
                const settingsModal = document.getElementById('settingsModal');
                if (settingsModal) {
                    settingsModal.style.display = 'block';
                    
                    // 현재 설정 값을 모달에 로드
                    loadCurrentSettingsForce();
                    
                    // 슬라이더 이벤트 재등록 (모달이 열릴 때마다)
                    setTimeout(() => {
                        initializeSettingsEventsForce();
                        console.log('🔄 설정 모달 열림 후 이벤트 재등록 완료');
                    }, 100);
                    
                    console.log('✅ 설정 모달 열림');
                } else {
                    console.error('❌ 설정 모달을 찾을 수 없음');
                }
            });
            
            console.log('✅ 설정 버튼 강제 수정 완료');
        }
    }
    
    // 현재 설정을 모달에 로드하는 강제 함수
    function loadCurrentSettingsForce() {
        try {
            // 테마 로드
            const savedTheme = localStorage.getItem('theme') || 'light';
            const themeSelect = document.getElementById('themeSelect');
            if (themeSelect) {
                themeSelect.value = savedTheme;
            }
            
            // 글꼴 크기 로드
            const savedFontSize = localStorage.getItem('fontSize') || '1.0';
            const fontSizeSlider = document.getElementById('fontSizeSlider');
            if (fontSizeSlider) {
                fontSizeSlider.value = savedFontSize;
                updateFontSizeDisplayForce(savedFontSize);
            }
            
            // 달력 크기 로드
            const savedWidthScale = localStorage.getItem('widthScale') || '1.0';
            const savedHeightScale = localStorage.getItem('heightScale') || '1.0';
            
            const widthSlider = document.getElementById('widthSlider');
            if (widthSlider) {
                widthSlider.value = savedWidthScale;
                updateSizeDisplayForce('width', savedWidthScale);
            }
            
            const heightSlider = document.getElementById('heightSlider');
            if (heightSlider) {
                heightSlider.value = savedHeightScale;
                updateSizeDisplayForce('height', savedHeightScale);
            }
            
            // 주 시작일 로드
            const savedWeekStart = localStorage.getItem('weekStart') || '일요일';
            const weekStartSelect = document.querySelector('#settingsModal .form-select');
            if (weekStartSelect && weekStartSelect.parentElement.querySelector('label').textContent.includes('주 시작일')) {
                weekStartSelect.value = savedWeekStart;
            }
            
            console.log('✅ 현재 설정 로드 완료');
            
        } catch (error) {
            console.error('설정 로드 중 오류:', error);
        }
    }
    
    // 세로 크기 테스트 함수
    window.testHeightScale = function(value) {
        console.log('🧪 세로 크기 테스트:', value);
        
        // CSS 변수 직접 설정
        document.documentElement.style.setProperty('--height-scale', value, 'important');
        
        // 확인
        const applied = getComputedStyle(document.documentElement).getPropertyValue('--height-scale').trim();
        console.log('적용된 값:', applied);
        
        // 모든 .day 요소에 강제 적용
        const days = document.querySelectorAll('.day');
        days.forEach((day, index) => {
            const currentHeight = getComputedStyle(day).minHeight;
            console.log(`Day ${index + 1} min-height:`, currentHeight);
            
            // 강제로 스타일 적용
            day.style.minHeight = `${120 * parseFloat(value)}px`;
        });
        
        alert(`세로 크기를 ${value}배로 테스트했습니다. 콘솔을 확인하세요.`);
    };
    
    // 기존 함수들 덮어쓰기
    function overrideExistingFunctions() {
        window.saveSettings = window.saveSettingsForce;
        window.cancelSettings = window.cancelSettingsForce;
        window.adjustFontSize = window.adjustFontSizeForce;
        window.adjustCalendarSize = window.adjustCalendarSizeForce;
        
        console.log('✅ 기존 함수들 덮어쓰기 완료');
    }
    
    // 초기화
    function init() {
        console.log('⚙️ 설정 모달 강제 수정 초기화 시작');
        
        // 기존 함수들 덮어쓰기
        overrideExistingFunctions();
        
        // 설정 버튼 수정
        fixSettingsButton();
        
        // 이벤트 초기화
        initializeSettingsEventsForce();
        
        // 중복 실행 방지
        window.settingsFixApplied = true;
        
        console.log('✅ 설정 모달 강제 수정 완료');
    }
    
    // 실행
    waitForDOM(() => {
        setTimeout(init, 1000);
    });
    
})();