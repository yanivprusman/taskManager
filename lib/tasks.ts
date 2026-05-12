import { sendToDaemon } from './daemon-connection';
import type { BoardData } from './types';
import { DEFAULT_COLUMNS } from './types';

export type { Task, Column, BoardData, Priority } from './types';
export { DEFAULT_COLUMNS, PRIORITY_CONFIG } from './types';

const DATA_KEY = 'taskManager:data';

export async function loadBoard(): Promise<BoardData> {
  const result = await sendToDaemon({ command: 'getEntry', key: DATA_KEY });
  const trimmed = result.trim();
  if (!trimmed) return { tasks: [], columns: DEFAULT_COLUMNS };
  const data = JSON.parse(trimmed) as BoardData;
  if (!data.columns?.length) data.columns = DEFAULT_COLUMNS;
  return data;
}

export async function saveBoard(data: BoardData): Promise<void> {
  await sendToDaemon({
    command: 'upsertEntry',
    key: DATA_KEY,
    value: JSON.stringify(data),
  });
}
