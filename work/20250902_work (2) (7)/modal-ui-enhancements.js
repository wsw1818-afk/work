// 모달 UI 개선 스크립트 (기능 보존하며 UI만 개선)
(function() {
    'use strict';
    
    console.log('🎨 모달 UI 개선 시스템 시작');
    
    // 엑셀 모달 기능 보존 및 UI 개선
    function enhanceExcelModal() {
        console.log('📊 엑셀 모달 UI 개선 시작');
        
        // 엑셀 모달 스타일 개선
        const style = document.createElement('style');
        style.textContent = `
            /* 엑셀 모달 UI 개선 */
            #excelModal .modal-content {
                max-width: 700px !important;
                max-height: 800px !important;
            }
            
            #excelModal .modal-body {
                padding: 30px !important;
                max-height: 700px !important;
                overflow-y: auto !important;
            }
            
            #excelModal .export-section {
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                padding: 20px;
                margin-bottom: 20px;
                border-radius: 12px;
                border-left: 4px solid #0d6efd;
                transition: all 0.3s ease;
            }
            
            #excelModal .export-section:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            }
            
            #excelModal .section-title {
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 16px;
                font-weight: 600;
                color: #2c3e50;
                margin-bottom: 15px;
            }
            
            #excelModal .section-icon {
                font-size: 20px;
            }
            
            #excelModal .form-select {
                width: 100%;
                padding: 12px 16px;
                border: 2px solid #e9ecef;
                border-radius: 8px;
                font-size: 14px;
                transition: all 0.3s ease;
                background: white;
            }
            
            #excelModal .form-select:focus {
                border-color: #0d6efd;
                box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
                outline: none;
            }
            
            #excelModal .checkbox-group {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 12px;
            }
            
            #excelModal .checkbox-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 10px;
                background: white;
                border-radius: 6px;
                transition: all 0.2s ease;
            }
            
            #excelModal .checkbox-item:hover {
                background: #f8f9fa;
                transform: translateX(5px);
            }
            
            #excelModal .checkbox-item input[type="checkbox"] {
                width: 18px;
                height: 18px;
                cursor: pointer;
            }
            
            #excelModal .checkbox-item label {
                cursor: pointer;
                user-select: none;
                font-size: 14px;
                color: #495057;
            }
            
            #excelModal .date-range {
                display: flex;
                align-items: center;
                gap: 15px;
                margin-top: 15px;
                padding: 15px;
                background: white;
                border-radius: 8px;
                border: 2px dashed #dee2e6;
            }
            
            #excelModal .date-range input[type="date"] {
                padding: 10px 12px;
                border: 2px solid #e9ecef;
                border-radius: 6px;
                font-size: 14px;
                min-width: 150px;
                transition: border-color 0.3s ease;
            }
            
            #excelModal .date-range input[type="date"]:focus {
                border-color: #0d6efd;
                box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
                outline: none;
            }
            
            #excelModal .date-separator {
                font-size: 18px;
                font-weight: bold;
                color: #6c757d;
            }
            
            #excelModal .modal-footer {
                padding: 20px 30px !important;
                border-top: 2px solid #f8f9fa;
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
            }
            
            #excelModal .btn-info {
                background: linear-gradient(135deg, #17a2b8, #138496);
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                font-weight: 600;
                transition: all 0.3s ease;
            }
            
            #excelModal .btn-info:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(23, 162, 184, 0.3);
            }
            
            #excelModal .btn-primary {
                background: linear-gradient(135deg, #0d6efd, #0b5ed7);
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 6px;
                font-weight: 600;
                font-size: 15px;
                transition: all 0.3s ease;
            }
            
            #excelModal .btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(13, 110, 253, 0.4);
            }
            
            #excelModal .btn-secondary {
                background: #6c757d;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 6px;
                font-weight: 600;
                transition: all 0.3s ease;
            }
            
            #excelModal .btn-secondary:hover {
                background: #5c636a;
                transform: translateY(-1px);
            }
            
            /* 커스텀 기간 애니메이션 */
            #customPeriod {
                transition: all 0.4s ease;
                overflow: hidden;
            }
            
            #customPeriod[style*="display: none"] {
                max-height: 0;
                opacity: 0;
                margin-top: 0;
            }
            
            #customPeriod[style*="display: block"] {
                max-height: 200px;
                opacity: 1;
                margin-top: 15px;
            }
        `;
        
        document.head.appendChild(style);
        console.log('✅ 엑셀 모달 스타일 적용 완료');
    }
    
    // 설정 모달 UI 개선
    function enhanceSettingsModal() {
        console.log('⚙️ 설정 모달 UI 개선 시작');
        
        const style = document.createElement('style');
        style.textContent = `
            /* 설정 모달 UI 개선 */
            #settingsModal .modal-content {
                max-width: 700px !important;
                max-height: 800px !important;
            }
            
            #settingsModal .modal-body {
                padding: 30px !important;
                max-height: 700px !important;
                overflow-y: auto !important;
            }
            
            #settingsModal .settings-section {
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                padding: 25px;
                margin-bottom: 20px;
                border-radius: 12px;
                border-left: 4px solid #28a745;
                transition: all 0.3s ease;
            }
            
            #settingsModal .settings-section:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            }
            
            #settingsModal .settings-section h3 {
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 16px;
                font-weight: 600;
                color: #2c3e50;
                margin-bottom: 15px;
            }
            
            #settingsModal .form-group {
                margin-bottom: 20px;
            }
            
            #settingsModal .form-group label {
                display: block;
                margin-bottom: 8px;
                font-weight: 600;
                color: #495057;
            }
            
            #settingsModal .form-control {
                width: 100%;
                padding: 12px 16px;
                border: 2px solid #e9ecef;
                border-radius: 8px;
                font-size: 14px;
                transition: all 0.3s ease;
                background: white;
            }
            
            #settingsModal .form-control:focus {
                border-color: #28a745;
                box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.1);
                outline: none;
            }
            
            #settingsModal .color-preset {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
                gap: 10px;
                margin-top: 10px;
            }
            
            #settingsModal .color-preset button {
                padding: 8px 12px;
                border: 2px solid #e9ecef;
                border-radius: 6px;
                background: white;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 12px;
            }
            
            #settingsModal .color-preset button:hover {
                border-color: #28a745;
                transform: translateY(-1px);
            }
        `;
        
        document.head.appendChild(style);
        console.log('✅ 설정 모달 스타일 적용 완료');
    }
    
    // 저장소 모달 UI 개선
    function enhanceStorageModal() {
        console.log('🗄️ 저장소 모달 UI 개선 시작');
        
        const style = document.createElement('style');
        style.textContent = `
            /* 저장소 모달 UI 개선 */
            #storageModal .modal-content {
                max-width: 650px !important;
                max-height: 700px !important;
            }
            
            #storageModal .modal-body {
                padding: 30px !important;
                max-height: 600px !important;
                overflow-y: auto !important;
            }
            
            #storageModal .storage-section {
                background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
                padding: 20px;
                margin-bottom: 20px;
                border-radius: 12px;
                border-left: 4px solid #ffc107;
                transition: all 0.3s ease;
            }
            
            #storageModal .storage-section:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            }
            
            #storageModal .storage-info {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 15px;
                margin-bottom: 15px;
            }
            
            #storageModal .storage-item {
                background: white;
                padding: 15px;
                border-radius: 8px;
                text-align: center;
                border: 2px solid #e9ecef;
                transition: all 0.3s ease;
            }
            
            #storageModal .storage-item:hover {
                border-color: #ffc107;
                transform: scale(1.05);
            }
            
            #storageModal .storage-value {
                font-size: 24px;
                font-weight: bold;
                color: #856404;
                display: block;
            }
            
            #storageModal .storage-label {
                font-size: 12px;
                color: #6c757d;
                text-transform: uppercase;
                margin-top: 5px;
            }
        `;
        
        document.head.appendChild(style);
        console.log('✅ 저장소 모달 스타일 적용 완료');
    }
    
    // 생성 모달 UI 개선
    function enhanceCreateModal() {
        console.log('🆕 생성 모달 UI 개선 시작');
        
        const style = document.createElement('style');
        style.textContent = `
            /* 생성 모달 UI 개선 */
            #createModal .modal-content {
                max-width: 600px !important;
                max-height: 700px !important;
            }
            
            #createModal .modal-body {
                padding: 30px !important;
                max-height: 600px !important;
                overflow-y: auto !important;
            }
            
            #createModal .form-group {
                margin-bottom: 20px;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 8px;
                border-left: 4px solid #6f42c1;
            }
            
            #createModal .form-label {
                display: block;
                margin-bottom: 8px;
                font-weight: 600;
                color: #495057;
                font-size: 14px;
            }
            
            #createModal .form-input {
                width: 100%;
                padding: 12px 16px;
                border: 2px solid #e9ecef;
                border-radius: 6px;
                font-size: 14px;
                transition: all 0.3s ease;
                background: white;
            }
            
            #createModal .form-input:focus {
                border-color: #6f42c1;
                box-shadow: 0 0 0 3px rgba(111, 66, 193, 0.1);
                outline: none;
            }
            
            #createModal .form-textarea {
                min-height: 100px;
                resize: vertical;
            }
            
            #createModal .datetime-group {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
            }
            
            #createModal .attachment-section {
                background: white;
                padding: 15px;
                border: 2px dashed #dee2e6;
                border-radius: 8px;
                text-align: center;
                transition: all 0.3s ease;
            }
            
            #createModal .attachment-section:hover {
                border-color: #6f42c1;
                background: #f8f9fa;
            }
            
            #createModal .btn-attachment {
                background: linear-gradient(135deg, #6f42c1, #563d7c);
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            #createModal .btn-attachment:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(111, 66, 193, 0.3);
            }
        `;
        
        document.head.appendChild(style);
        console.log('✅ 생성 모달 스타일 적용 완료');
    }
    
    // 엑셀 모달의 날짜 지정 기능 강화
    function enhanceExcelDatePicker() {
        console.log('📅 엑셀 모달 날짜 지정 기능 강화');
        
        // 엑셀 모달이 열릴 때마다 기능 확인
        const originalOpenModal = window.openModal;
        if (originalOpenModal) {
            window.openModal = function(modalId) {
                originalOpenModal.call(this, modalId);
                
                if (modalId === 'excelModal') {
                    setTimeout(() => {
                        setupExcelDateFunctionality();
                    }, 100);
                }
            };
        }
        
        // modalManager가 있는 경우에도 처리
        if (window.modalManager && window.modalManager.open) {
            const originalModalManagerOpen = window.modalManager.open;
            
            window.modalManager.open = function(modalId) {
                const result = originalModalManagerOpen.call(this, modalId);
                
                if (modalId === 'excelModal') {
                    setTimeout(() => {
                        setupExcelDateFunctionality();
                    }, 100);
                }
                
                return result;
            };
        }
    }
    
    // 엑셀 날짜 기능 설정
    function setupExcelDateFunctionality() {
        const periodSelect = document.getElementById('exportPeriod');
        const customPeriod = document.getElementById('customPeriod');
        const startDate = document.getElementById('startDate');
        const endDate = document.getElementById('endDate');
        
        if (!periodSelect || !customPeriod) {
            console.warn('⚠️ 엑셀 모달 요소를 찾을 수 없음');
            return;
        }
        
        // 기간 선택 변경 이벤트 재설정
        periodSelect.addEventListener('change', function() {
            if (this.value === 'custom') {
                customPeriod.style.display = 'block';
                customPeriod.style.maxHeight = '200px';
                customPeriod.style.opacity = '1';
                console.log('✅ 사용자 지정 날짜 기간 활성화');
            } else {
                customPeriod.style.display = 'none';
                customPeriod.style.maxHeight = '0';
                customPeriod.style.opacity = '0';
                console.log('📅 기본 기간 모드로 변경');
            }
        });
        
        // 현재 날짜로 기본값 설정
        if (startDate && endDate) {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            
            startDate.value = `${year}-${month}-01`;
            endDate.value = `${year}-${month}-${new Date(year, today.getMonth() + 1, 0).getDate()}`;
            
            console.log('📅 기본 날짜 설정 완료:', startDate.value, '~', endDate.value);
        }
        
        // 초기 상태 설정
        if (periodSelect.value === 'custom') {
            customPeriod.style.display = 'block';
        } else {
            customPeriod.style.display = 'none';
        }
        
        console.log('✅ 엑셀 날짜 기능 설정 완료');
    }
    
    // 초기화
    function initialize() {
        console.log('🎨 모달 UI 개선 시스템 초기화');
        
        // 각 모달 UI 개선
        enhanceExcelModal();
        enhanceSettingsModal(); 
        enhanceStorageModal();
        enhanceCreateModal();
        
        // 엑셀 모달 날짜 기능 강화
        enhanceExcelDatePicker();
        
        // DOM이 준비되면 날짜 기능 설정
        if (document.readyState === 'complete') {
            setTimeout(setupExcelDateFunctionality, 500);
        } else {
            window.addEventListener('load', () => {
                setTimeout(setupExcelDateFunctionality, 500);
            });
        }
        
        console.log('✅ 모달 UI 개선 시스템 초기화 완료');
    }
    
    // DOM 준비 시 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
    // 페이지 로드 후 재초기화
    window.addEventListener('load', function() {
        setTimeout(initialize, 300);
    });
    
    console.log('🎨 모달 UI 개선 스크립트 로드 완료');
    
})();