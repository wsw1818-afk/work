import asyncio
import sys
from pathlib import Path

from agents.agent import Agent
from agents.mcp import MCPServerStdio
from agents.run import Runner

INSTRUCTIONS = """Run tests, lint, and typecheck in that order. Quote failing log excerpts, retry up to three cycles with minimal unified diffs, block infra/, db/migrations/, and secrets paths, validate diffs with git apply --check, and finish with git commit --no-verify. Report in SUMMARY, PLAN, PATCH, COMMANDS_RAN, RESULTS, CHECKS, NEXT_STEPS order."""

PROJECT_ROOT = Path("Calendar/work/20250917_work")


async def main() -> None:
    env = {"PYTHONUNBUFFERED": "1"}
    if PROJECT_ROOT.exists():
        env["TESTOPS_PROJECT_ROOT"] = str(PROJECT_ROOT.resolve())
    server = MCPServerStdio(
        {
            "command": sys.executable,
            "args": ["-u", "mcp_servers/testops_server.py"],
            "env": env,
        }
    )
    async with server:
        agent = Agent(name="TestOpsAgent", instructions=INSTRUCTIONS, mcp_servers=[server])
        result = await Runner.run(
            agent,
            "Run the project's full test suite and, if anything fails, fix it with minimal patches so all checks pass.",
        )
        print(result.output)


if __name__ == "__main__":
    asyncio.run(main())
