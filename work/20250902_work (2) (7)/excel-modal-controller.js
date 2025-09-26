// Excel Modal Controller - 엑셀 모달 컨트롤러
(function() {
    'use strict';
    
    document.addEventListener('DOMContentLoaded', function() {
        console.log('📊 Excel Modal Controller 초기화 시작');
        
        // 모달 초기화
        initExcelModal();
        
        // 이벤트 리스너 설정
        setupEventListeners();
        
        console.log('✅ Excel Modal Controller 초기화 완료');
    });
    
    function initExcelModal() {
        const modal = document.getElementById('excelModal');
        if (!modal) return;
        
        // 모달에 클래스 추가 (애니메이션 및 스타일링용)
        modal.classList.add('excel-modal-redesigned');
        
        // 현재 날짜로 기본값 설정
        updateDateDefaults();
        
        // 체크박스 아이템 클릭 이벤트 설정
        setupCheckboxItems();
    }
    
    function setupEventListeners() {
        // 기간 선택 변경 이벤트
        const periodSelect = document.getElementById('exportPeriod');
        if (periodSelect) {
            periodSelect.addEventListener('change', handlePeriodChange);
        }
        
        // 모든 체크박스 변경 이벤트
        const checkboxes = document.querySelectorAll('#excelModal input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', handleCheckboxChange);
        });
        
        // 파일 형식 변경 이벤트
        const formatSelect = document.getElementById('fileFormat');
        if (formatSelect) {
            formatSelect.addEventListener('change', handleFormatChange);
        }
        
        // 모달 열림/닫힘 이벤트
        const modal = document.getElementById('excelModal');
        if (modal) {
            // MutationObserver로 모달 표시 상태 감지
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        const isVisible = modal.style.display === 'block';
                        if (isVisible) {
                            handleModalOpen();
                        } else {
                            handleModalClose();
                        }
                    }
                });
            });
            
            observer.observe(modal, {
                attributes: true,
                attributeFilter: ['style']
            });
        }
    }
    
    function updateDateDefaults() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        
        // 시작일: 이번 달 1일
        const startDate = document.getElementById('startDate');
        if (startDate) {
            startDate.value = `${year}-${month}-01`;
        }
        
        // 종료일: 이번 달 마지막 날
        const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
        const endDate = document.getElementById('endDate');
        if (endDate) {
            endDate.value = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;
        }
        
        // 기간 선택 옵션 텍스트 업데이트
        const periodSelect = document.getElementById('exportPeriod');
        if (periodSelect) {
            const options = periodSelect.options;
            const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', 
                              '7월', '8월', '9월', '10월', '11월', '12월'];
            
            options[0].text = `현재 월 (${year}년 ${monthNames[now.getMonth()]})`;
            
            const quarter = Math.floor(now.getMonth() / 3) + 1;
            options[1].text = `현재 분기 (${year}년 ${quarter}분기)`;
            
            const half = now.getMonth() < 6 ? '상반기' : '하반기';
            options[2].text = `현재 반기 (${year}년 ${half})`;
            
            options[3].text = `현재 년도 (${year}년 전체)`;
        }
    }
    
    function setupCheckboxItems() {
        const checkboxItems = document.querySelectorAll('#excelModal .checkbox-item');
        
        checkboxItems.forEach(item => {
            // 클릭 시 체크박스 토글
            item.addEventListener('click', function(e) {
                if (e.target.type !== 'checkbox') {
                    const checkbox = item.querySelector('input[type="checkbox"]');
                    if (checkbox) {
                        checkbox.checked = !checkbox.checked;
                        checkbox.dispatchEvent(new Event('change'));
                    }
                }
            });
            
            // 호버 효과 개선
            item.addEventListener('mouseenter', function() {
                item.style.transform = 'translateY(-1px)';
            });
            
            item.addEventListener('mouseleave', function() {
                item.style.transform = '';
            });
        });
    }
    
    function handlePeriodChange() {
        const periodSelect = document.getElementById('exportPeriod');
        const customPeriod = document.getElementById('customPeriod');
        
        if (periodSelect && customPeriod) {
            if (periodSelect.value === 'custom') {
                customPeriod.style.display = 'block';
                customPeriod.style.opacity = '0';
                customPeriod.style.transform = 'translateY(-10px)';
                
                // 애니메이션
                requestAnimationFrame(() => {
                    customPeriod.style.transition = 'all 0.3s ease';
                    customPeriod.style.opacity = '1';
                    customPeriod.style.transform = 'translateY(0)';
                });
            } else {
                customPeriod.style.opacity = '0';
                customPeriod.style.transform = 'translateY(-10px)';
                
                setTimeout(() => {
                    customPeriod.style.display = 'none';
                }, 300);
                
                // 기본 날짜 설정
                updatePredefinedDates(periodSelect.value);
            }
        }
    }
    
    function updatePredefinedDates(period) {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        
        const startDate = document.getElementById('startDate');
        const endDate = document.getElementById('endDate');
        
        if (!startDate || !endDate) return;
        
        switch (period) {
            case 'current':
                // 현재 월
                startDate.value = `${year}-${String(month + 1).padStart(2, '0')}-01`;
                endDate.value = `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`;
                break;
                
            case 'quarter':
                // 현재 분기
                const quarterStart = Math.floor(month / 3) * 3;
                const quarterEnd = quarterStart + 2;
                startDate.value = `${year}-${String(quarterStart + 1).padStart(2, '0')}-01`;
                endDate.value = `${year}-${String(quarterEnd + 1).padStart(2, '0')}-${new Date(year, quarterEnd + 1, 0).getDate()}`;
                break;
                
            case 'half':
                // 현재 반기
                if (month < 6) {
                    startDate.value = `${year}-01-01`;
                    endDate.value = `${year}-06-30`;
                } else {
                    startDate.value = `${year}-07-01`;
                    endDate.value = `${year}-12-31`;
                }
                break;
                
            case 'year':
                // 현재 년도
                startDate.value = `${year}-01-01`;
                endDate.value = `${year}-12-31`;
                break;
        }
    }
    
    function handleCheckboxChange(e) {
        const checkbox = e.target;
        const item = checkbox.closest('.checkbox-item');
        
        if (item) {
            // 체크 상태에 따른 시각적 피드백
            if (checkbox.checked) {
                item.style.background = 'rgba(102, 126, 234, 0.1)';
                item.style.borderColor = 'rgba(102, 126, 234, 0.3)';
            } else {
                item.style.background = '';
                item.style.borderColor = '';
            }
        }
        
        // 종속성 체크 (예: 메모를 선택하면 자동으로 헤더도 체크)
        handleCheckboxDependencies(checkbox);
    }
    
    function handleCheckboxDependencies(checkbox) {
        const id = checkbox.id;
        
        // 메모나 일정을 선택하면 헤더도 자동으로 선택
        if ((id === 'includeMemos' || id === 'includeSchedules') && checkbox.checked) {
            const headerCheckbox = document.getElementById('includeHeader');
            if (headerCheckbox && !headerCheckbox.checked) {
                headerCheckbox.checked = true;
                headerCheckbox.dispatchEvent(new Event('change'));
            }
        }
        
        // 색상 코딩을 선택하면 주말 표시도 자동으로 선택
        if (id === 'colorCoding' && checkbox.checked) {
            const weekendCheckbox = document.getElementById('includeWeekends');
            if (weekendCheckbox && !weekendCheckbox.checked) {
                weekendCheckbox.checked = true;
                weekendCheckbox.dispatchEvent(new Event('change'));
            }
        }
    }
    
    function handleFormatChange() {
        const formatSelect = document.getElementById('fileFormat');
        if (!formatSelect) return;
        
        const format = formatSelect.value;
        
        // 형식에 따른 설정 안내
        showFormatInfo(format);
        
        // 일부 옵션은 특정 형식에서만 지원
        updateOptionsAvailability(format);
    }
    
    function showFormatInfo(format) {
        // 간단한 툴팁 표시 (기존 툴팁이 있다면 제거)
        const existingTooltip = document.querySelector('.format-tooltip');
        if (existingTooltip) {
            existingTooltip.remove();
        }
        
        let message = '';
        switch (format) {
            case 'csv':
                message = '엑셀에서 바로 열 수 있는 형식';
                break;
            case 'xlsx':
                message = '엑셀 네이티브 형식 (서식 지원)';
                break;
            case 'json':
                message = '프로그램에서 사용하기 좋은 데이터 형식';
                break;
            case 'ics':
                message = '구글 캘린더 등에서 가져오기 가능';
                break;
        }
        
        if (message) {
            const formatSelect = document.getElementById('fileFormat');
            const tooltip = document.createElement('div');
            tooltip.className = 'format-tooltip';
            tooltip.textContent = message;
            tooltip.style.cssText = `
                position: absolute;
                top: 100%;
                left: 0;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                white-space: nowrap;
                z-index: 1000;
                margin-top: 4px;
                opacity: 0;
                transform: translateY(-5px);
                transition: all 0.2s ease;
            `;
            
            const section = formatSelect.closest('.export-section');
            section.style.position = 'relative';
            section.appendChild(tooltip);
            
            // 애니메이션으로 표시
            requestAnimationFrame(() => {
                tooltip.style.opacity = '1';
                tooltip.style.transform = 'translateY(0)';
            });
            
            // 3초 후 제거
            setTimeout(() => {
                tooltip.style.opacity = '0';
                tooltip.style.transform = 'translateY(-5px)';
                setTimeout(() => tooltip.remove(), 200);
            }, 3000);
        }
    }
    
    function updateOptionsAvailability(format) {
        // ICS 형식에서는 일부 옵션이 의미가 없음
        const colorCoding = document.getElementById('colorCoding');
        const includeSummary = document.getElementById('includeSummary');
        
        if (format === 'ics') {
            if (colorCoding) {
                colorCoding.disabled = true;
                colorCoding.closest('.checkbox-item').style.opacity = '0.5';
            }
            if (includeSummary) {
                includeSummary.disabled = true;
                includeSummary.closest('.checkbox-item').style.opacity = '0.5';
            }
        } else {
            if (colorCoding) {
                colorCoding.disabled = false;
                colorCoding.closest('.checkbox-item').style.opacity = '1';
            }
            if (includeSummary) {
                includeSummary.disabled = false;
                includeSummary.closest('.checkbox-item').style.opacity = '1';
            }
        }
    }
    
    function handleModalOpen() {
        // 모달이 열릴 때마다 설정 초기화
        updateDateDefaults();
        
        // 포커스를 기간 선택으로 이동
        setTimeout(() => {
            const periodSelect = document.getElementById('exportPeriod');
            if (periodSelect) {
                periodSelect.focus();
            }
        }, 100);
        
        // 모달에 show 클래스 추가 (애니메이션용)
        const modal = document.getElementById('excelModal');
        if (modal) {
            modal.classList.add('show');
        }
    }
    
    function handleModalClose() {
        // 모달에서 show 클래스 제거
        const modal = document.getElementById('excelModal');
        if (modal) {
            modal.classList.remove('show');
        }
        
        // 사용자 지정 기간 숨기기
        const customPeriod = document.getElementById('customPeriod');
        if (customPeriod) {
            customPeriod.style.display = 'none';
        }
        
        // 모든 툴팁 제거
        const tooltips = document.querySelectorAll('.format-tooltip');
        tooltips.forEach(tooltip => tooltip.remove());
    }
    
    // 전역 함수로 내보내기 (기존 코드와의 호환성을 위해)
    window.ExcelModalController = {
        init: initExcelModal,
        updateDates: updateDateDefaults
    };
    
})();