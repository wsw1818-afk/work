' 메일 백업 관리자 바로가기 생성 스크립트
Option Explicit

Dim objShell, objDesktop, objShortcut
Dim strDesktopPath, strProgramPath, strShortcutPath

' WScript.Shell 객체 생성
Set objShell = CreateObject("WScript.Shell")

' 바탕화면 경로 가져오기
strDesktopPath = objShell.SpecialFolders("Desktop")

' 프로그램 경로 설정 (현재 스크립트 위치)
Dim objFSO
Set objFSO = CreateObject("Scripting.FileSystemObject")
strProgramPath = objFSO.GetParentFolderName(WScript.ScriptFullName)

' 바로가기 경로 설정
strShortcutPath = strDesktopPath & "\메일 백업 관리자.lnk"

' 바로가기 생성
Set objShortcut = objShell.CreateShortcut(strShortcutPath)

With objShortcut
    .TargetPath = strProgramPath & "\run_mail_manager.bat"
    .WorkingDirectory = strProgramPath
    .WindowStyle = 1
    .IconLocation = "shell32.dll, 21"
    .Description = "메일 백업 관리자 - EML/MSG 파일 관리 프로그램"
    .Save
End With

' 성공 메시지
MsgBox "바탕화면에 '메일 백업 관리자' 바로가기가 생성되었습니다!", vbInformation, "바로가기 생성 완료"

' 객체 해제
Set objShortcut = Nothing
Set objShell = Nothing
Set objFSO = Nothing