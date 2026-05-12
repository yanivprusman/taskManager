import net from 'net';
import { existsSync } from 'fs';

const UDS_PATH = '/run/automatelinux/automatelinux-daemon.sock';
const UDS_PATH_API = '/run/automatelinux/automatelinux-api.sock';

const API_COMMANDS = new Set([
  'upsertEntry', 'getEntry', 'deleteEntry', 'showEntriesByPrefix',
  'deleteEntriesByPrefix',
]);

function getSocketPath(cmd: string): string {
  if (API_COMMANDS.has(cmd) && existsSync(UDS_PATH_API)) return UDS_PATH_API;
  return UDS_PATH;
}

export function sendToDaemon(commandObj: Record<string, unknown>, timeoutMs = 5000): Promise<string> {
  const socketPath = getSocketPath(commandObj.command as string || '');
  return new Promise((resolve, reject) => {
    let response = '';
    let done = false;
    const client = net.createConnection(socketPath);

    const timer = setTimeout(() => {
      if (done) return;
      done = true;
      client.destroy();
      reject(new Error('Daemon connection timeout'));
    }, timeoutMs);

    const finish = (fn: (val: any) => void, val: any) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      client.destroy();
      fn(val);
    };

    client.on('connect', () => {
      client.write(JSON.stringify(commandObj) + '\n');
    });

    client.on('data', (data) => {
      response += data.toString();
      if (response.endsWith('\n')) {
        finish(resolve, response);
      }
    });

    client.on('error', (err) => finish(reject, err));
    client.on('close', () => finish(resolve, response));
  });
}
