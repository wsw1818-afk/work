(function () {
    'use strict';

    function ensureMemoDetailModalVisible() {
        const modal = document.getElementById('memoDetailModal');
        if (!modal) {
            return;
        }
        modal.classList.remove('closing');
        modal.classList.add('show', 'visible', 'active', 'open');
        modal.style.setProperty('display', 'block', 'important');
        modal.style.setProperty('opacity', '1', 'important');
        modal.style.setProperty('visibility', 'visible', 'important');
        modal.style.setProperty('pointer-events', 'auto', 'important');
        modal.style.setProperty('z-index', '999999', 'important');
        modal.setAttribute('aria-hidden', 'false');
        modal.setAttribute('aria-modal', 'true');
    }

    function ensureMemoDetailModalHidden() {
        const modal = document.getElementById('memoDetailModal');
        if (!modal) {
            return;
        }
        modal.classList.remove('show', 'visible', 'active', 'open', 'opening', 'closing');
        modal.style.setProperty('display', 'none', 'important');
        modal.style.setProperty('opacity', '0', 'important');
        modal.style.setProperty('visibility', 'hidden', 'important');
        modal.style.setProperty('pointer-events', 'none', 'important');
        modal.style.removeProperty('z-index');
        modal.setAttribute('aria-hidden', 'true');
        modal.removeAttribute('aria-modal');
    }

    if (typeof window.openMemoDetail === 'function') {
        const originalOpenMemoDetail = window.openMemoDetail;
        window.openMemoDetail = function (id) {
            const result = originalOpenMemoDetail.call(this, id);
            ensureMemoDetailModalVisible();
            return result;
        };
    }

    if (typeof window.closeMemoDetail === 'function') {
        const originalCloseMemoDetail = window.closeMemoDetail;
        window.closeMemoDetail = function () {
            const result = originalCloseMemoDetail.call(this);
            ensureMemoDetailModalHidden();
            return result;
        };
    }
})();
