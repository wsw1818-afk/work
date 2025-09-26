(function() {
    'use strict';

    function ensureDateMemoListVisible() {
        const list = document.getElementById('dateMemoList');
        if (!list) {
            return;
        }

        list.style.setProperty('display', 'block', 'important');
        list.style.removeProperty('visibility');
        list.style.removeProperty('height');
    }

    function patchDateMemoRenderers() {
        if (window._dateMemoVisibilityPatched) {
            ensureDateMemoListVisible();
            return;
        }

        window._dateMemoVisibilityPatched = true;

        const originalRender = typeof window.renderDateMemoList === 'function'
            ? window.renderDateMemoList
            : null;
        if (originalRender) {
            window.renderDateMemoList = function() {
                const result = originalRender.apply(this, arguments);
                ensureDateMemoListVisible();
                return result;
            };
        }

        const originalDisplay = typeof window.displayDateMemos === 'function'
            ? window.displayDateMemos
            : null;
        if (originalDisplay) {
            window.displayDateMemos = function() {
                const result = originalDisplay.apply(this, arguments);
                ensureDateMemoListVisible();
                return result;
            };
        }

        const modal = document.getElementById('dateMemoModal');
        if (modal) {
            const observer = new MutationObserver(() => {
                const isVisible = modal.style.display === 'block'
                    || modal.style.visibility === 'visible'
                    || modal.classList.contains('show')
                    || modal.classList.contains('visible');

                if (isVisible) {
                    ensureDateMemoListVisible();
                }
            });

            observer.observe(modal, { attributes: true, attributeFilter: ['style', 'class'] });
        }

        ensureDateMemoListVisible();
    }

    function initialize() {
        ensureDateMemoListVisible();

        const attemptPatch = () => {
            patchDateMemoRenderers();
        };

        attemptPatch();
        setTimeout(attemptPatch, 100);
        setTimeout(attemptPatch, 300);

        document.addEventListener('showDateMemoModal', ensureDateMemoListVisible);

        const calendarContainer = document.querySelector('.calendar-container');
        if (calendarContainer) {
            calendarContainer.addEventListener('click', (event) => {
                if (event.target.closest('.day')) {
                    setTimeout(ensureDateMemoListVisible, 0);
                }
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
})();