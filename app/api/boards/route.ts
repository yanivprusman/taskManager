import { NextResponse } from 'next/server';
import { loadBoards, saveBoards, DEFAULT_COLUMNS } from '@/lib/tasks';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const boards = await loadBoards();
    return NextResponse.json(boards);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    const boards = await loadBoards();
    const newBoard = { id: randomUUID().slice(0, 8), name: name || 'New Board' };
    boards.push(newBoard);
    await saveBoards(boards);
    const { saveBoard } = await import('@/lib/tasks');
    await saveBoard(newBoard.id, { tasks: [], columns: DEFAULT_COLUMNS });
    return NextResponse.json(newBoard, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
