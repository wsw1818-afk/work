import asyncio
import json
import os
import shutil
from pathlib import Path
from typing import Optional

from mcp.server.fastmcp import FastMCP

MAX_LOG_CHARS = 200_000
DEFAULT_ROOT = Path(__file__).resolve().parent.parent


def resolve_root() -> Path:
    env_root = os.environ.get("TESTOPS_PROJECT_ROOT")
    if env_root:
        candidate = Path(env_root)
        if not candidate.is_absolute():
            candidate = DEFAULT_ROOT / candidate
        return candidate.resolve()
    return DEFAULT_ROOT


ROOT = resolve_root()
server = FastMCP("TestOps")


def trim_output(output: str) -> str:
    if len(output) > MAX_LOG_CHARS:
        return output[-MAX_LOG_CHARS:]
    return output


def detect_package_manager() -> str:
    if (ROOT / "pnpm-lock.yaml").exists():
        return "pnpm"
    if (ROOT / "yarn.lock").exists():
        return "yarn"
    return "npm"


def is_python_project() -> bool:
    markers = ["pyproject.toml", "pytest.ini", "requirements.txt", "requirements-dev.txt"]
    if any((ROOT / marker).exists() for marker in markers):
        return True
    return any(ROOT.rglob("*.py"))


def is_typescript_project() -> bool:
    if (ROOT / "tsconfig.json").exists():
        return True
    for directory in ("app", "src", "lib", "tests"):
        path = ROOT / directory
        if path.exists() and (any(path.rglob("*.ts")) or any(path.rglob("*.tsx"))):
            return True
    return False


def is_javascript_project() -> bool:
    return (ROOT / "package.json").exists()


async def run_command(cmd: list[str], timeout: int) -> dict:
    if os.name == "nt":
        executable = shutil.which(cmd[0]) or shutil.which(f"{cmd[0]}.cmd") or shutil.which(f"{cmd[0]}.exe")
        if executable:
            if executable.lower().endswith(".cmd"):
                cmd_exe = shutil.which("cmd.exe") or "cmd.exe"
                cmd = [cmd_exe, "/c", executable, *cmd[1:]]
            else:
                cmd = [executable, *cmd[1:]]
    process = await asyncio.create_subprocess_exec(
        *cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
        cwd=str(ROOT),
    )
    try:
        stdout_bytes, stderr_bytes = await asyncio.wait_for(process.communicate(), timeout=timeout)
    except asyncio.TimeoutError as exc:
        process.kill()
        stdout_bytes, stderr_bytes = await process.communicate()
        raise RuntimeError(f"Command timed out: {' '.join(cmd)}") from exc

    stdout = stdout_bytes.decode("utf-8", errors="replace")
    stderr = stderr_bytes.decode("utf-8", errors="replace")
    result = {
        "command": cmd,
        "returncode": process.returncode,
        "stdout": trim_output(stdout),
        "stderr": trim_output(stderr),
    }
    if process.returncode != 0:
        raise RuntimeError(json.dumps(result))
    return result


def build_js_command(base: list[str], pattern: Optional[str]) -> list[str]:
    if pattern:
        return [*base, "-t", pattern]
    return base


def build_pytest_command(pattern: Optional[str]) -> list[str]:
    command = ["pytest", "-q"]
    if pattern:
        command.extend(["-k", pattern])
    return command


def ensure_safe_diff(unified_diff: str) -> None:
    forbidden = ("infra/", "db/migrations/", "secrets")
    for line in unified_diff.splitlines():
        if line.startswith("+++") or line.startswith("---"):
            for token in forbidden:
                if token in line:
                    raise ValueError(f"Diff touches forbidden path: {token}")


@server.tool()
async def run_tests(pattern: Optional[str] = None, timeout_sec: int = 300) -> dict:
    if is_javascript_project():
        pkg = detect_package_manager()
        if pkg == "pnpm":
            command = build_js_command(["pnpm", "test"], pattern)
        elif pkg == "yarn":
            command = build_js_command(["yarn", "test"], pattern)
        else:
            command = build_js_command(["npm", "test"], pattern)
    elif is_python_project():
        command = build_pytest_command(pattern)
    else:
        raise RuntimeError("Unable to detect project type for tests")

    return await run_command(command, timeout_sec)


@server.tool()
async def run_lint(timeout_sec: int = 180) -> dict:
    if is_javascript_project():
        pkg = detect_package_manager()
        if pkg == "pnpm":
            command = ["pnpm", "exec", "eslint", "."]
        elif pkg == "yarn":
            command = ["yarn", "eslint", "."]
        else:
            command = ["npx", "eslint", "."]
    elif is_python_project():
        command = ["ruff", "check", "."]
    else:
        raise RuntimeError("Unable to detect project type for lint")

    return await run_command(command, timeout_sec)


@server.tool()
async def run_typecheck(timeout_sec: int = 300) -> dict:
    if is_typescript_project() and is_javascript_project():
        pkg = detect_package_manager()
        if pkg == "pnpm":
            command = ["pnpm", "exec", "tsc", "-p", "."]
        elif pkg == "yarn":
            command = ["yarn", "tsc", "-p", "."]
        else:
            command = ["npx", "tsc", "-p", "."]
    elif is_python_project():
        if shutil.which("pyright"):
            command = ["pyright"]
        else:
            command = ["mypy", "."]
    else:
        raise RuntimeError("Unable to detect project type for typecheck")

    return await run_command(command, timeout_sec)


@server.tool()
async def apply_patch(unified_diff: str, dry_run: bool = True) -> dict:
    ensure_safe_diff(unified_diff)
    diff_path = ROOT / ".testops.patch"
    diff_path.write_text(unified_diff, encoding="utf-8")
    try:
        await run_command(["git", "apply", "--check", str(diff_path)], timeout=30)
        if not dry_run:
            await run_command(["git", "apply", str(diff_path)], timeout=30)
    finally:
        if diff_path.exists():
            diff_path.unlink()
    return {"status": "ok", "applied": not dry_run}


@server.tool()
async def git_commit(message: str) -> dict:
    if not message.strip():
        raise ValueError("Commit message is required")
    await run_command(["git", "commit", "-m", message, "--no-verify"], timeout=30)
    return {"status": "committed", "message": message}


if __name__ == "__main__":
    server.run()
