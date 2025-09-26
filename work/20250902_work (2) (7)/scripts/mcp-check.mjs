import path from 'node:path';
import fs from 'node:fs/promises';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const workspace = process.cwd();
const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const projectRoot = path.resolve(workspace, '..', '..');
const processServerPath = path.join(projectRoot, 'mcp-servers', 'packages', 'process-server', 'dist', 'index.js');
const gitServerPath = path.join(projectRoot, 'mcp-servers', 'packages', 'git-server', 'dist', 'index.js');

function errorToJson(error) {
  if (!error) return null;
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  return { message: String(error) };
}

async function withClient(serverParams, run) {
  const client = new Client({ name: 'codex-mcp-checker', version: '1.0.0' });
  client.registerCapabilities({ tools: {} });
  const transport = new StdioClientTransport(serverParams);
  await client.connect(transport, { timeout: 10000 });
  try {
    return await run(client);
  } finally {
    await client.close().catch(() => {});
  }
}

async function checkFilesystem() {
  const targetPath = path.join(workspace, 'mcp_probe.txt');
  const movedPath = `${targetPath}.deleted`;
  await fs.rm(targetPath, { force: true }).catch(() => {});
  await fs.rm(movedPath, { force: true }).catch(() => {});

  try {
    const result = await withClient({
      command: npxCommand,
      args: ['-y', '@modelcontextprotocol/server-filesystem', workspace],
    }, async (client) => {
      const write = await client.callTool({
        name: 'write_file',
        arguments: { path: targetPath, content: 'ok' },
      });

      const read = await client.callTool({
        name: 'read_text_file',
        arguments: { path: targetPath },
      });

      const move = await client.callTool({
        name: 'move_file',
        arguments: { source: targetPath, destination: movedPath },
      });

      return {
        ok: true,
        write,
        read,
        move,
      };
    });

    return { server: 'filesystem', ...result, movedPath };
  } catch (error) {
    return { server: 'filesystem', ok: false, error: errorToJson(error) };
  } finally {
    await fs.rm(targetPath, { force: true }).catch(() => {});
    await fs.rm(movedPath, { force: true }).catch(() => {});
  }
}

async function checkProcess() {
  try {
    const result = await withClient({
      command: 'node',
      args: [processServerPath],
    }, async (client) => {
      const list = await client.listTools();
      const runNode = await client.callTool({
        name: 'run_command',
        arguments: {
          command: 'node',
          args: ['-v'],
          cwd: workspace,
        },
      });

      return {
        ok: true,
        tools: list.tools,
        commandResult: runNode,
      };
    });
    return { server: 'process', ...result };
  } catch (error) {
    return { server: 'process', ok: false, error: errorToJson(error) };
  }
}

async function checkGit() {
  try {
    const result = await withClient({
      command: 'node',
      args: [gitServerPath],
    }, async (client) => {
      const list = await client.listTools();
      const branch = await client.callTool({
        name: 'git_current_branch',
        arguments: { repoPath: workspace },
      });
      const commit = await client.callTool({
        name: 'git_latest_commit',
        arguments: { repoPath: workspace },
      });

      return {
        ok: true,
        tools: list.tools,
        branch,
        commit,
      };
    });
    return { server: 'git', ...result };
  } catch (error) {
    return { server: 'git', ok: false, error: errorToJson(error) };
  }
}

async function main() {
  const results = [];
  results.push(await checkFilesystem());
  results.push(await checkProcess());
  results.push(await checkGit());
  console.log(JSON.stringify(results, null, 2));
}

main().catch((error) => {
  console.error(JSON.stringify({ fatal: errorToJson(error) }, null, 2));
  process.exit(1);
});
