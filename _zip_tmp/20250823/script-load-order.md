# 스크립트 로드 순서 정리

## 🚫 제거해야 할 스크립트들
HTML에서 다음 스크립트 태그들을 **삭제**하세요:

```html
<!-- 제거 -->
<script src="debug-font-modal.js"></script>
<script src="enhanced-debug-font-modal.js"></script>
<script src="fix-duplicate-modal.js"></script>
<script src="final-integration-fix.js"></script>
```

## ✅ 유지해야 할 필수 스크립트들 (순서대로)

```html
<!-- 1. 메인 시스템 -->
<script src="calendar-complete.js"></script>
<script src="unified-calendar-system.js"></script>

<!-- 2. UI 컨트롤 -->
<script src="theme-layout-menu.js"></script>
<script src="advanced-controls-modal.js"></script>

<!-- 3. 미리보기 시스템 -->
<script src="preview-control.js"></script>
<script src="preview-mode-fix.js"></script>

<!-- 4. 모달 관리 -->
<script src="modal-drag-system.js"></script>
<script src="global-esc-handler.js"></script>

<!-- 5. 에러 수정 (필수) -->
<script src="emergency-font-modal-fix.js"></script>

<!-- 6. 충돌 정리 (임시 실행 후 제거 가능) -->
<script src="conflict-cleanup.js"></script>
```

## 📋 체크리스트

### 1. HTML 수정
- [ ] 디버그 스크립트 4개 제거
- [ ] 필수 스크립트만 남김
- [ ] 로드 순서 확인

### 2. 브라우저 작업
- [ ] 캐시 클리어 (Ctrl+Shift+R)
- [ ] 콘솔 에러 확인
- [ ] 기능 테스트

### 3. 테스트
- [ ] 글자 크기 모달 열기
- [ ] 색상 모드 모달 열기
- [ ] 미리보기 모드 전환
- [ ] ESC 키로 모달 닫기
- [ ] 모달 드래그

## 🔍 문제 해결

### 증상별 해결책

1. **글자 크기 버튼 클릭 안됨**
   - emergency-font-modal-fix.js 확인
   - conflict-cleanup.js 실행

2. **미리보기에서 메뉴 클릭 안됨**
   - preview-mode-fix.js 확인
   - toggleSafePreview(true) 사용

3. **중복 모달 나타남**
   - conflict-cleanup.js 실행
   - conflictCleanup.removeModals() 호출

4. **콘솔에 에러 많음**
   - 디버그 스크립트 제거 확인
   - 캐시 클리어

## 💡 콘솔 명령어

```javascript
// 상태 확인
conflictCleanup.report()

// 수동 정리
conflictCleanup.run()

// 중복 모달만 제거
conflictCleanup.removeModals()

// 안전한 미리보기 토글
toggleSafePreview(true)  // 활성화
toggleSafePreview(false) // 비활성화
```