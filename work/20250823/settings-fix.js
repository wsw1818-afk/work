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
    
    // 강제 설정 취소 함수
    window.cancelSettingsForce = function() {
        console.log('❌ 강제 설정 취소 실행');
        try {
            // 원래 설정으로 되돌리기 (localStorage에서 로드)
            const savedTheme = localStorage.getItem('theme') || 'light';
            const savedFontSize = localStorage.getItem('fontSize') || '1.0';
            const savedWidthScale = localStorage.getItem('widthScale') || '1.0';
            const savedHeightScale = localStorage.getItem('heightScale') || '1.0';
            
            document.documentElement.setAttribute('data-theme', savedTheme);
            document.documentElement.style.setProperty('--font-scale', savedFontSize);
            document.documentElement.style.setProperty('--width-scale', savedWidthScale);
            document.documentElement.style.setProperty('--height-scale', savedHeightScale);
            
            closeModalForce('settingsModal');
            console.log('설정이 취소되었습니다');
            
        } catch (error) {
            console.error('설정 취소 중 오류:', error);
        }
    };
    
    // 강제 모달 닫기 함수
    function closeModalForce(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            console.log(`모달 닫힌: ${modalId}`);
        }
    }
    
    // 글꼴 크기 조절 강제 함수
    window.adjustFontSizeForce = function(delta) {
        const slider = document.getElementById('fontSizeSlider');
        if (slider) {
            const currentValue = parseFloat(slider.value);
            const newValue = Math.max(0.7, Math.min(1.5, currentValue + delta));
            slider.value = newValue;
            
            // 실시간 적용
            document.documentElement.style.setProperty('--font-scale', newValue);
            updateFontSizeDisplayForce(newValue);
            
            console.log(`글꼴 크기 조절: ${currentValue} → ${newValue}`);
        }
    };
    
    // 달력 크기 조절 강제 함수
    window.adjustCalendarSizeForce = function(type, delta) {
        console.log(`🔧 달력 ${type} 크기 조절 시도:`, delta);
        
        const slider = document.getElementById(type + 'Slider');
        if (slider) {
            const currentValue = parseFloat(slider.value);
            const newValue = Math.max(0.5, Math.min(2.0, currentValue + delta));
            
            console.log(`${type} 크기 조절: ${currentValue} → ${newValue}`);
            
            // 슬라이더 값 설정
            slider.value = newValue;
            
            // CSS 변수 직접 설정
            document.documentElement.style.setProperty(`--${type}-scale`, newValue);
            
            // 디스플레이 업데이트
            updateSizeDisplayForce(type, newValue);
            
            // 특히 height의 경우 추가 확인
            if (type === 'height') {
                const applied = getComputedStyle(document.documentElement).getPropertyValue('--height-scale').trim();
                console.log('세로 크기 적용 확인:', applied);
                
                // 달력 즉시 새로고침
                setTimeout(() => {
                    if (typeof createCalendar === 'function') {
                        console.log('세로 크기 변경으로 인한 달력 새로고침');
                        createCalendar();
                    }
                }, 50);
            }
            
        } else {
            console.error(`${type}Slider를 찾을 수 없음`);
        }
    };
    
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
            fontSizeSlider.addEventListener('input', function() {
                document.documentElement.style.setProperty('--font-scale', this.value);
                updateFontSizeDisplayForce(this.value);
            });
        }
        
        const widthSlider = document.getElementById('widthSlider');
        if (widthSlider) {
            widthSlider.addEventListener('input', function() {
                document.documentElement.style.setProperty('--width-scale', this.value);
                updateSizeDisplayForce('width', this.value);
            });
        }
        
        const heightSlider = document.getElementById('heightSlider');
        if (heightSlider) {
            // 기존 이벤트 제거
            heightSlider.removeEventListener('input', heightSlider._heightHandler);
            
            // 새 이벤트 핸들러
            heightSlider._heightHandler = function() {
                const value = this.value;
                console.log('🔧 세로 크기 슬라이더 변경:', value);
                
                // CSS 변수 설정
                document.documentElement.style.setProperty('--height-scale', value);
                
                // 디스플레이 업데이트
                updateSizeDisplayForce('height', value);
                
                // 확인
                const applied = getComputedStyle(document.documentElement).getPropertyValue('--height-scale').trim();
                console.log('적용된 세로 크기:', applied);
                
                // 달력 새로고침 (필요시)
                setTimeout(() => {
                    if (typeof createCalendar === 'function') {
                        console.log('달력 새로고침 실행');
                        createCalendar();
                    }
                }, 100);
            };
            
            heightSlider.addEventListener('input', heightSlider._heightHandler);
            heightSlider.addEventListener('change', heightSlider._heightHandler); // change 이벤트도 추가
            
            console.log('✅ heightSlider 이벤트 강화 완료');
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