/**
 * 메모 모달 강제 표시 수정 스크립트
 * openDateMemoModal이 호출되어도 모달이 보이지 않는 문제 해결
 */

(function() {
    'use strict';

    console.log('📝 메모 모달 강제 표시 수정 시작...');

    // ===== openDateMemoModal 함수 보강 =====
    function enhanceOpenDateMemoModal() {
        const originalFunction = window.openDateMemoModal;

        if (typeof originalFunction === 'function') {
            window.openDateMemoModal = function(year, month, date) {
                console.log(`📝 openDateMemoModal 호출: ${year}-${month}-${date}`);

                // 원래 함수 먼저 실행
                try {
                    const result = originalFunction.apply(this, arguments);
                    console.log('✅ 원본 openDateMemoModal 실행 완료');
                } catch (error) {
                    console.warn('⚠️ 원본 openDateMemoModal 실행 중 오류:', error);
                }

                // 모달 강제 표시 처리
                setTimeout(() => {
                    const dateMemoModal = document.getElementById('dateMemoModal');

                    if (dateMemoModal) {
                        console.log('📝 dateMemoModal 강제 표시 처리...');

                        // 다른 모달들 먼저 닫기
                        const otherModals = document.querySelectorAll('.modal:not(#dateMemoModal)');
                        otherModals.forEach(modal => {
                            modal.style.display = 'none';
                            modal.style.visibility = 'hidden';
                            modal.style.opacity = '0';
                        });

                        // 메모 모달 강제 표시
                        dateMemoModal.style.display = 'block';
                        dateMemoModal.style.visibility = 'visible';
                        dateMemoModal.style.opacity = '1';

                        // 위치 및 스타일 보정
                        dateMemoModal.style.position = 'fixed';
                        dateMemoModal.style.top = '50%';
                        dateMemoModal.style.left = '50%';
                        dateMemoModal.style.transform = 'translate(-50%, -50%)';
                        dateMemoModal.style.zIndex = '999999';
                        dateMemoModal.style.backgroundColor = '#ffffff';
                        dateMemoModal.style.borderRadius = '8px';
                        dateMemoModal.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
                        dateMemoModal.style.border = '1px solid #e0e0e0';
                        dateMemoModal.style.maxWidth = '90vw';
                        dateMemoModal.style.maxHeight = '90vh';
                        dateMemoModal.style.overflow = 'auto';

                        // 배경 오버레이 추가/수정
                        let overlay = document.querySelector('.modal-overlay');
                        if (!overlay) {
                            overlay = document.createElement('div');
                            overlay.className = 'modal-overlay';
                            document.body.appendChild(overlay);
                        }

                        overlay.style.position = 'fixed';
                        overlay.style.top = '0';
                        overlay.style.left = '0';
                        overlay.style.width = '100%';
                        overlay.style.height = '100%';
                        overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
                        overlay.style.zIndex = '999998';
                        overlay.style.display = 'block';
                        overlay.style.pointerEvents = 'auto';

                        // 오버레이 클릭 시 모달 닫기
                        overlay.onclick = function() {
                            if (typeof window.closeDateMemoModal === 'function') {
                                window.closeDateMemoModal();
                            } else {
                                dateMemoModal.style.display = 'none';
                            }
                            overlay.style.display = 'none';
                            overlay.style.pointerEvents = 'none';
                            overlay.style.opacity = '0';
                        };

                        console.log('✅ dateMemoModal 강제 표시 완료!');

                        // 포커스 설정 (입력 필드가 있다면)
                        const titleInput = dateMemoModal.querySelector('input[type="text"], textarea');
                        if (titleInput) {
                            setTimeout(() => {
                                titleInput.focus();
                            }, 100);
                        }

                    } else {
                        console.error('❌ dateMemoModal 요소를 찾을 수 없습니다');
                    }
                }, 100);

                return arguments;
            };

            console.log('✅ openDateMemoModal 함수 보강 완료');
        } else {
            console.warn('⚠️ openDateMemoModal 함수를 찾을 수 없습니다');
        }
    }

    // ===== 모든 모달 닫기 함수 개선 =====
    function enhanceCloseModal() {
        const originalCloseModal = window.closeModal;

        window.closeModal = function(modalId) {
            console.log(`🔒 모달 닫기: ${modalId}`);

            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'none';
                modal.style.visibility = 'hidden';
                modal.style.opacity = '0';
            }

            // 배경 오버레이도 닫기
            const overlay = document.querySelector('.modal-overlay');
            if (overlay) {
                overlay.style.display = 'none';
            }

            // 원본 함수도 호출 (있다면)
            if (originalCloseModal && originalCloseModal !== window.closeModal) {
                try {
                    originalCloseModal.call(this, modalId);
                } catch (e) {
                    console.warn('원본 closeModal 실행 오류:', e);
                }
            }

            console.log(`✅ 모달 닫기 완료: ${modalId}`);
        };

        console.log('✅ closeModal 함수 개선 완료');
    }

    // ===== closeDateMemoModal 패치 =====
    function patchCloseDateMemoModal() {
        const applyPatch = () => {
            const original = window.closeDateMemoModal;
            if (typeof original !== 'function' || original._overlayPatched) {
                return;
            }

            window.closeDateMemoModal = function(...args) {
                try {
                    return original.apply(this, args);
                } finally {
                    const overlay = document.querySelector('.modal-overlay');
                    if (overlay) {
                        overlay.style.display = 'none';
                        overlay.style.pointerEvents = 'none';
                        overlay.style.opacity = '0';
                    }
                }
            };

            window.closeDateMemoModal._overlayPatched = true;
            console.log('✅ closeDateMemoModal 오버레이 정리 패치 적용');
        };

        applyPatch();
        document.addEventListener('DOMContentLoaded', applyPatch, { once: true });
    }

    // ===== ESC 키로 모달 닫기 =====
    function setupKeyboardClose() {
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const dateMemoModal = document.getElementById('dateMemoModal');
                if (dateMemoModal && dateMemoModal.style.display === 'block') {
                    window.closeModal('dateMemoModal');
                    console.log('🔑 ESC 키로 메모 모달 닫음');
                }
            }
        });

        console.log('✅ ESC 키 모달 닫기 설정 완료');
    }

    // ===== 날짜 클릭 시 직접 모달 표시 =====
    function addDirectModalShow() {
        // 날짜 클릭 이벤트에 백업 핸들러 추가
        document.addEventListener('click', function(e) {
            const dayCell = e.target.closest('.day:not(.other-month)');
            if (dayCell) {
                const dayNumber = dayCell.querySelector('.day-number');
                if (dayNumber) {
                    const date = parseInt(dayNumber.textContent);

                    // 잠시 후 모달이 열렸는지 확인
                    setTimeout(() => {
                        const dateMemoModal = document.getElementById('dateMemoModal');
                        if (dateMemoModal && dateMemoModal.style.display !== 'block') {
                            console.log('🔄 모달이 열리지 않았음 - 강제 표시 시도');

                            const currentYear = window.currentYear || new Date().getFullYear();
                            const currentMonth = window.currentMonth || (new Date().getMonth() + 1);

                            // 강제로 모달 열기
                            if (typeof window.openDateMemoModal === 'function') {
                                window.openDateMemoModal(currentYear, currentMonth, date);
                            }
                        }
                    }, 500);
                }
            }
        });

        console.log('✅ 날짜 클릭 백업 모달 표시 설정 완료');
    }

    // ===== 초기화 =====
    function initialize() {
        console.log('🚀 메모 모달 강제 표시 초기화...');

        enhanceOpenDateMemoModal();
        enhanceCloseModal();
        patchCloseDateMemoModal();
        setupKeyboardClose();
        addDirectModalShow();

        console.log('✅ 메모 모달 강제 표시 초기화 완료!');
    }

    // DOM이 준비되면 실행
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        setTimeout(initialize, 100);
    }

})();
