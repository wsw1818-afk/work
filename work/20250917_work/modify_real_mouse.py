# -*- coding: utf-8 -*-
from pathlib import Path

path = Path("real-mouse-click-fix.js")
text = path.read_text(encoding="utf-8")

helper = """
// Utility to safely derive the clicked calendar date
function resolveDateFromDayElement(dayElement) {
    if (!dayElement) {
        return null;
    }

    const iso = dayElement.dataset?.date;
    if (iso && /^\\d{4}-\\d{2}-\\d{2}$/.test(iso)) {
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
    const isoDate = ${year}--;

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

"""

if "function resolveDateFromDayElement" not in text:
    start = text.find("function setupModalProtection() {")
    if start == -1:
        raise SystemExit("setupModalProtection not found")
    end = text.find("}\n\n//", start)
    if end == -1:
        raise SystemExit("insertion point not found")
    end += 1
    text = text[:end] + "\n" + helper + text[end:]

block_start = text.find("if (target && e.isTrusted) { //")
if block_start == -1:
    raise SystemExit("target block start not found")
closing_marker = "        }\n    }, true); // capture 단계에서 처리\n"
block_end = text.find(closing_marker, block_start)
if block_end == -1:
    raise SystemExit("closing marker not found")

new_block = """if (target && e.isTrusted) { // 실제 사용자 클릭만 처리\n            const opened = openDateMemoModalSafely(target);\n\n            if (!opened) {\n                console.warn('[real-mouse-click-fix] Falling back to forced modal display.');\n            }\n\n            removeAllHidingClasses();\n\n            const dateMemoModal = document.getElementById('dateMemoModal');\n            if (dateMemoModal) {\n                dateMemoModal.classList.add('modal-force-show');\n                dateMemoModal.classList.remove('ultimate-hidden', 'hidden');\n                dateMemoModal.style.display = 'flex';\n                dateMemoModal.style.visibility = 'visible';\n                dateMemoModal.style.opacity = '1';\n                dateMemoModal.style.zIndex = '999999';\n\n                const modalDay = document.getElementById('modalDay');\n                if (modalDay && window.selectedDate) {\n                    const selectedParts = window.selectedDate.split('-');\n                    modalDay.value = selectedParts[selectedParts.length - 1];\n                }\n\n                const titleElement = document.getElementById('dateMemoTitle');\n                if (titleElement && window.selectedDate) {\n                    titleElement.textContent = '\uD83D\uDCC5 ' + window.selectedDate + ' \uBA54\uBAA8';\n                }\n            } else {\n                console.log('❌ dateMemoModal not found');\n            }\n        }\n"""

text = text[:block_start] + new_block + text[block_end:]

path.write_text(text, encoding="utf-8")
