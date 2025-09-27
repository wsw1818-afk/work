# VS Code 한글 깨짐 해결 설정 가이드

## 설정 방법

1. **VS Code에서 설정 파일 열기**
   - `Ctrl + Shift + P` → `Preferences: Open User Settings (JSON)` 입력
   - 또는 `Ctrl + ,` → 우상단 파일 아이콘 클릭

2. **아래 설정을 기존 settings.json에 추가/수정**

```json
{
  // 한글 깨짐 방지 및 폰트 설정
  "editor.fontFamily": "Consolas, 'D2 Coding', 'NanumGothicCoding', monospace",
  "editor.fontSize": 14,
  "editor.fontLigatures": false,
  "editor.unicodeHighlight.ambiguousCharacters": false,
  "editor.unicodeHighlight.invisibleCharacters": false,
  
  // 파일 인코딩 UTF-8 강제 설정
  "files.encoding": "utf8",
  "files.autoGuessEncoding": false,
  "files.defaultLanguage": "",
  
  // 터미널 설정 (GPU 가속 끄기, 한글 깨짐 방지)
  "terminal.integrated.fontFamily": "Consolas, 'D2 Coding', 'NanumGothicCoding', monospace",
  "terminal.integrated.fontSize": 14,
  "terminal.integrated.gpuAcceleration": "off",
  "terminal.integrated.unicodeVersion": "11",
  
  // Claude Code 확장 관련 설정
  "workbench.editor.enablePreview": false,
  "editor.wordWrap": "on",
  "editor.renderWhitespace": "boundary",
  
  // 추가 한글 지원 설정
  "editor.acceptSuggestionOnEnter": "smart",
  "editor.suggestSelection": "first",
  "editor.tabCompletion": "on"
}
```

## 주요 설정 설명

- **fontFamily**: Consolas → D2 Coding → NanumGothicCoding 순서로 폰트 적용
- **fontLigatures**: false로 설정하여 리가처 비활성화
- **unicodeHighlight**: 한글 문자 하이라이트 비활성화로 깨짐 방지
- **files.encoding**: UTF-8 강제 사용
- **terminal.integrated.gpuAcceleration**: GPU 가속 비활성화로 터미널 한글 깨짐 방지

## 적용 후 재시작

설정 적용 후 VS Code를 완전히 종료했다가 다시 시작하세요.