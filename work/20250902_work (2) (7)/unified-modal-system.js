/**
 * 통합 모달 시스템
 * 모든 모달 관련 기능을 하나로 통합한 깔끔한 시스템
 */

class UnifiedModalSystem {
    constructor() {
        this.modals = new Map();
        this.activeModal = null;
        this.overlay = null;
        this.init();
    }

    init() {
        console.log('🚀 통합 모달 시스템 초기화...');

        // 오버레이 생성
        this.createOverlay();

        // 이벤트 리스너 설정
        this.setupEventListeners();

        // CSS 주입
        this.injectStyles();

        // 기존 함수 덮어쓰기
        this.overrideGlobalFunctions();

        console.log('✅ 통합 모달 시스템 초기화 완료');
    }

    // ===== 오버레이 관리 =====
    createOverlay() {
        if (!this.overlay) {
            this.overlay = document.createElement('div');
            this.overlay.id = 'unified-modal-overlay';
            this.overlay.className = 'modal-overlay';
            document.body.appendChild(this.overlay);

            this.overlay.addEventListener('click', () => this.closeActiveModal());
        }
    }

    showOverlay() {
        if (this.overlay) {
            this.overlay.style.display = 'block';
        }
    }

    hideOverlay() {
        if (this.overlay) {
            this.overlay.style.display = 'none';
        }
    }

    // ===== 모달 표시/숨김 =====
    showModal(modalId, options = {}) {
        // 이전 모달 닫기
        if (this.activeModal && this.activeModal !== modalId) {
            this.hideModal(this.activeModal);
        }

        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`❌ 모달을 찾을 수 없음: ${modalId}`);
            return false;
        }

        // 모달 표시 (!important 사용)
        const forceStyles = `
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            ${options.styles ? Object.entries(options.styles).map(([key, value]) =>
                `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value} !important;`
            ).join(' ') : ''}
        `;
        modal.style.cssText += forceStyles;

        // 오버레이 표시
        this.showOverlay();

        // 활성 모달 설정
        this.activeModal = modalId;

        // 포커스 설정
        if (options.focusElement) {
            const element = modal.querySelector(options.focusElement);
            if (element) {
                setTimeout(() => element.focus(), 100);
            }
        }

        console.log(`✅ 모달 표시: ${modalId}`);
        return true;
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return false;

        // 모달 숨김
        this.applyModalStyles(modal, {
            display: 'none',
            visibility: 'hidden',
            opacity: '0'
        });

        // 활성 모달이면 오버레이도 숨김
        if (this.activeModal === modalId) {
            this.hideOverlay();
            this.activeModal = null;
        }

        console.log(`✅ 모달 숨김: ${modalId}`);
        return true;
    }

    closeActiveModal() {
        if (this.activeModal) {
            this.hideModal(this.activeModal);
        }
    }

    // ===== 스타일 적용 =====
    applyModalStyles(modal, styles) {
        Object.assign(modal.style, styles);
    }

    // ===== 날짜 메모 모달 특별 처리 =====
    showDateMemoModal(year, month, date) {
        console.log(`📅 날짜 메모 모달 열기: ${year}-${month}-${date}`);

        // 날짜 설정
        const targetDate = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
        window.selectedDate = targetDate;

        // 제목 업데이트
        const titleElement = document.getElementById('dateMemoTitle');
        if (titleElement) {
            titleElement.textContent = `📅 ${targetDate} 메모`;
        }

        // 모달 표시 (강제 스타일 적용)
        const modal = document.getElementById('dateMemoModal');
        if (modal) {
            // 모든 CSS를 !important로 강제 적용
            modal.style.cssText = `
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                position: fixed !important;
                top: 50% !important;
                left: 50% !important;
                transform: translate(-50%, -50%) !important;
                z-index: 2147483647 !important;
                background-color: white !important;
                border-radius: 12px !important;
                box-shadow: 0 10px 40px rgba(0,0,0,0.3) !important;
                padding: 20px !important;
                min-width: 500px !important;
                max-width: 90vw !important;
                max-height: 90vh !important;
                overflow: auto !important;
            `;

            modal.classList.add('force-show');
            this.showOverlay();
            this.activeModal = 'dateMemoModal';

            // 포커스 설정
            const input = modal.querySelector('input[type="text"], textarea');
            if (input) {
                setTimeout(() => input.focus(), 100);
            }
        }

        // 메모 리스트 렌더링
        if (window.MemoSystem?.renderDateMemoList) {
            window.MemoSystem.renderDateMemoList(targetDate);
        }
    }

    // ===== 이벤트 리스너 =====
    setupEventListeners() {
        // 날짜 클릭 이벤트 가로채기
        document.addEventListener('click', (e) => {
            const dayCell = e.target.closest('.day:not(.other-month)');
            if (!dayCell) return;

            const dayNumber = dayCell.querySelector('.day-number');
            if (!dayNumber) return;

            const date = parseInt(dayNumber.textContent);
            const currentYear = window.currentYear || new Date().getFullYear();
            const currentMonth = window.currentMonth || (new Date().getMonth() + 1);

            console.log(`🎯 날짜 ${date}일 클릭`);

            e.stopPropagation();
            e.preventDefault();

            this.showDateMemoModal(currentYear, currentMonth, date);
        }, true);

        // ESC 키로 모달 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeActiveModal();
            }
        });
    }

    // ===== 기존 함수 덮어쓰기 =====
    overrideGlobalFunctions() {
        const self = this;

        // openDateMemoModal 덮어쓰기
        window.openDateMemoModal = function(year, month, date) {
            self.showDateMemoModal(year, month, date);
        };

        // closeDateMemoModal 덮어쓰기
        window.closeDateMemoModal = function() {
            self.hideModal('dateMemoModal');
        };

        // closeModal 덮어쓰기
        const originalCloseModal = window.closeModal;
        window.closeModal = function(modalId) {
            if (!self.hideModal(modalId) && originalCloseModal) {
                originalCloseModal.call(this, modalId);
            }
        };

        // 전역 차단 변수 초기화
        window.modalJustClosed = false;
        window.lastClosedModalDate = '';
    }

    // ===== CSS 스타일 주입 =====
    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* 오버레이 스타일 */
            #unified-modal-overlay {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: 100% !important;
                background-color: rgba(0, 0, 0, 0.7) !important;
                z-index: 999998 !important;
                display: none;
                animation: fadeIn 0.2s ease-in-out;
            }

            /* 모달 기본 스타일 */
            .modal {
                animation: modalSlideIn 0.3s ease-out;
            }

            /* 날짜 셀 호버 효과 */
            .day:not(.other-month) {
                cursor: pointer !important;
                transition: all 0.2s ease;
            }

            .day:not(.other-month):hover {
                background-color: #e3f2fd !important;
                transform: scale(1.02);
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }

            /* 애니메이션 */
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            @keyframes modalSlideIn {
                from {
                    transform: translate(-50%, -50%) scale(0.9);
                    opacity: 0;
                }
                to {
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 1;
                }
            }

            /* 강제 표시 클래스 */
            .force-show {
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
            }
        `;
        document.head.appendChild(style);
    }

    // ===== 유틸리티 메서드 =====
    isModalOpen(modalId) {
        return this.activeModal === modalId;
    }

    getActiveModal() {
        return this.activeModal;
    }

    getAllModals() {
        return Array.from(document.querySelectorAll('.modal'));
    }

    // ===== 디버깅 =====
    debug() {
        console.group('🔍 모달 시스템 디버그');
        console.log('활성 모달:', this.activeModal);
        console.log('전체 모달:', this.getAllModals().map(m => m.id));
        console.log('오버레이 상태:', this.overlay?.style.display);
        console.groupEnd();
    }
}

// ===== 초기화 =====
(function() {
    'use strict';

    console.log('📦 통합 모달 시스템 로딩...');

    // 전역 인스턴스 생성
    window.ModalSystem = null;

    function initialize() {
        // 기존 인스턴스가 있으면 제거
        if (window.ModalSystem) {
            console.log('🔄 기존 모달 시스템 교체');
        }

        // 새 인스턴스 생성
        window.ModalSystem = new UnifiedModalSystem();

        // 전역 함수로 노출 (디버깅용)
        window.debugModal = () => window.ModalSystem.debug();
        window.showModal = (id, options) => window.ModalSystem.showModal(id, options);
        window.hideModal = (id) => window.ModalSystem.hideModal(id);

        console.log('✅ 통합 모달 시스템 로딩 완료');
        console.log('💡 디버깅: debugModal() 호출로 상태 확인');
    }

    // DOM 준비 확인
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    // 백업: 1초 후 재실행
    setTimeout(initialize, 1000);
})();