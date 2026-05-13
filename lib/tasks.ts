import { sendToDaemon } from './daemon-connection';
import type { BoardData, BoardMeta } from './types';
import { DEFAULT_COLUMNS } from './types';

export type { Task, Column, BoardData, Priority, BoardMeta } from './types';
export { DEFAULT_COLUMNS, PRIORITY_CONFIG } from './types';

const BOARDS_INDEX_KEY = 'taskManager:boards';
const BOARD_PREFIX = 'taskManager:board:';
const LEGACY_DATA_KEY = 'taskManager:data';

export async function loadBoards(): Promise<BoardMeta[]> {
  const result = await sendToDaemon({ command: 'getEntry', key: BOARDS_INDEX_KEY });
  const trimmed = result.trim();
  if (trimmed) return JSON.parse(trimmed) as BoardMeta[];

  const legacy = await sendToDaemon({ command: 'getEntry', key: LEGACY_DATA_KEY });
  const legacyTrimmed = legacy.trim();
  if (legacyTrimmed) {
    const defaultBoard: BoardMeta = { id: 'default', name: 'My Board' };
    await sendToDaemon({
      command: 'upsertEntry',
      key: BOARD_PREFIX + 'default',
      value: legacyTrimmed,
    });
    await saveBoards([defaultBoard]);
    return [defaultBoard];
  }

  return [];
}

export async function saveBoards(boards: BoardMeta[]): Promise<void> {
  await sendToDaemon({
    command: 'upsertEntry',
    key: BOARDS_INDEX_KEY,
    value: JSON.stringify(boards),
  });
}

export async function loadBoard(boardId: string): Promise<BoardData> {
  const result = await sendToDaemon({ command: 'getEntry', key: BOARD_PREFIX + boardId });
  const trimmed = result.trim();
  if (!trimmed) return { tasks: [], columns: DEFAULT_COLUMNS };
  const data = JSON.parse(trimmed) as BoardData;
  if (!data.columns?.length) data.columns = DEFAULT_COLUMNS;
  return data;
}

export async function saveBoard(boardId: string, data: BoardData): Promise<void> {
  await sendToDaemon({
    command: 'upsertEntry',
    key: BOARD_PREFIX + boardId,
    value: JSON.stringify(data),
  });
}

export async function deleteBoard(boardId: string): Promise<void> {
  await sendToDaemon({ command: 'deleteEntry', key: BOARD_PREFIX + boardId });
}
