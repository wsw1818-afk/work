(function () {
    'use strict';

    const HIDDEN_SELECTORS = '.ultimate-hidden, .hidden, [style*="display: none"], [style*="visibility: hidden"]';

    function removeAllHidingClasses() {
        document.querySelectorAll(HIDDEN_SELECTORS).forEach((element) => {
            element.classList.remove('ultimate-hidden', 'hidden');
            element.style.display = 'block';
            element.style.visibility = 'visible';
            element.style.opacity = '1';
        });
    }

    function resolveDateFromDayElement(dayElement) {
        if (!dayElement) {
            return null;
        }

        const iso = dayElement.dataset?.date;
        if (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso)) {
            const [year, month, day] = iso.split('-').map(Number);
            if ([year, month, day].every(Number.isFinite)) {
                return { year, month, day };
            }
        }

        const textValue = dayElement.textContent?.trim() || '';
        const day = parseInt(textValue, 10);
        if (!Number.isFinite(day)) {
            return null;
        }

        const now = new Date();
        const fallbackYear = Number.parseInt(window.currentYear, 10);
        let fallbackMonth = Number.parseInt(window.currentMonth, 10);

        if (!Number.isFinite(fallbackMonth)) {
            if (typeof window.currentMonth === 'number' && Number.isFinite(window.currentMonth)) {
                fallbackMonth = window.currentMonth;
            } else {
                fallbackMonth = now.getMonth() + 1;
            }
        }

        const year = Number.isFinite(fallbackYear) ? fallbackYear : now.getFullYear();
        const month = Number.isFinite(fallbackMonth) ? fallbackMonth : now.getMonth() + 1;

        return { year, month, day };
    }

    function openDateMemoModalSafely(dayElement) {
        const dateInfo = resolveDateFromDayElement(dayElement);
        if (!dateInfo) {
            console.warn('[real-mouse-click-fix] Unable to resolve date for clicked element.', dayElement);
            return false;
        }

        const { year, month, day } = dateInfo;
        const isoDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        try {
            window.selectedDate = isoDate;
        } catch (error) {
            window.selectedDate = isoDate;
        }

        const openers = [];
        if (typeof window.openDateMemoModal === 'function') {
            openers.push(window.openDateMemoModal);
        }
        if (typeof window._originalOpenDateMemoModal === 'function') {
            openers.push(window._originalOpenDateMemoModal);
        }
        if (typeof window.modalManager?.openDateMemo === 'function') {
            openers.push(window.modalManager.openDateMemo.bind(window.modalManager));
        }

        let invoked = false;
        for (const openFn of openers) {
            try {
                openFn(year, month, day);
                invoked = true;
                break;
            } catch (error) {
                console.error('[real-mouse-click-fix] openDateMemoModal failed.', error);
            }
        }

        if (!invoked) {
            const titleElement = document.getElementById('dateMemoTitle');
            if (titleElement) {
                titleElement.textContent = '\uD83D\uDCC5 ' + isoDate + ' \uBA54\uBAA8';
            }
        }

        return true;
    }

    function ensureModalVisible(modal) {
        if (!modal) {
            return;
        }

        modal.classList.add('modal-force-show');
        modal.classList.remove('ultimate-hidden', 'hidden');
        modal.style.display = 'flex';
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        modal.style.zIndex = '999999';

        const modalDay = document.getElementById('modalDay');
        if (modalDay && window.selectedDate) {
            const selectedParts = window.selectedDate.split('-');
            modalDay.value = selectedParts[selectedParts.length - 1];
        }

        const titleElement = document.getElementById('dateMemoTitle');
        if (titleElement && window.selectedDate) {
            titleElement.textContent = '\uD83D\uDCC5 ' + window.selectedDate + ' \uBA54\uBAA8';
        }
    }

    document.addEventListener('click', (event) => {
        const dayElement = event.target.closest('.day');
        if (!dayElement || !event.isTrusted) {
            return;
        }

        const opened = openDateMemoModalSafely(dayElement);
        if (!opened) {
            console.warn('[real-mouse-click-fix] Falling back to forced modal display.');
        }

        removeAllHidingClasses();
        ensureModalVisible(document.getElementById('dateMemoModal'));
    }, true);

    window.realMouseClickFix = {
        removeAllHidingClasses,
        resolveDateFromDayElement,
        openDateMemoModalSafely
    };
})();
