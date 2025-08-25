import os
import sys
import subprocess
import shutil

def build_exe():
    """PyInstaller를 사용하여 실행 파일 생성"""
    
    print("=" * 50)
    print("메일 백업 관리자 실행 파일 생성")
    print("=" * 50)
    
    # PyInstaller 설치 확인
    try:
        import PyInstaller
    except ImportError:
        print("\nPyInstaller를 설치합니다...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pyinstaller"])
        print("PyInstaller 설치 완료")
    
    # 필요한 패키지 설치
    packages = ["chardet", "extract-msg"]
    for package in packages:
        try:
            __import__(package.replace("-", "_"))
        except ImportError:
            print(f"\n{package}를 설치합니다...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])
    
    # PyInstaller 명령어 구성
    script_name = "mail_backup_manager.py"
    exe_name = "MailBackupManager"
    
    pyinstaller_args = [
        "--onefile",  # 단일 실행 파일로 생성
        "--windowed",  # 콘솔 창 숨기기
        "--name", exe_name,  # 실행 파일 이름
        "--icon", "NONE",  # 아이콘 (없으면 기본값)
        "--add-data", f"attachments;attachments",  # 첨부파일 폴더 포함
        "--hidden-import", "email",
        "--hidden-import", "sqlite3",
        "--hidden-import", "tkinter",
        "--hidden-import", "extract_msg",
        "--clean",  # 빌드 전 캐시 정리
        script_name
    ]
    
    print(f"\n실행 파일을 생성합니다...")
    print(f"파일명: {exe_name}.exe")
    
    try:
        # PyInstaller 실행
        subprocess.check_call(["pyinstaller"] + pyinstaller_args)
        
        # dist 폴더에서 실행 파일 찾기
        exe_path = os.path.join("dist", f"{exe_name}.exe")
        
        if os.path.exists(exe_path):
            # 실행 파일을 현재 폴더로 복사
            shutil.copy2(exe_path, f"{exe_name}.exe")
            print(f"\n✅ 실행 파일 생성 완료: {exe_name}.exe")
            print(f"파일 크기: {os.path.getsize(f'{exe_name}.exe') / (1024*1024):.2f} MB")
            
            # 정리
            print("\n임시 파일을 정리합니다...")
            if os.path.exists("build"):
                shutil.rmtree("build")
            if os.path.exists("dist"):
                shutil.rmtree("dist")
            if os.path.exists(f"{exe_name}.spec"):
                os.remove(f"{exe_name}.spec")
            
            print("\n실행 파일 생성이 완료되었습니다!")
            print(f"'{exe_name}.exe'를 더블클릭하여 실행하세요.")
            
            return True
        else:
            print("\n❌ 실행 파일 생성 실패")
            return False
            
    except subprocess.CalledProcessError as e:
        print(f"\n❌ 오류 발생: {e}")
        return False
    except Exception as e:
        print(f"\n❌ 예기치 않은 오류: {e}")
        return False

if __name__ == "__main__":
    success = build_exe()
    
    if not success:
        print("\n문제 해결 방법:")
        print("1. Python이 최신 버전인지 확인하세요")
        print("2. 관리자 권한으로 실행해보세요")
        print("3. 바이러스 백신이 차단하지 않는지 확인하세요")
    
    input("\n엔터 키를 눌러 종료...")