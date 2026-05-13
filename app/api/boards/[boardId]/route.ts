import { NextResponse } from 'next/server';
import { loadBoards, saveBoards, deleteBoard as deleteBoardData } from '@/lib/tasks';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request, { params }: { params: Promise<{ boardId: string }> }) {
  try {
    const { boardId } = await params;
    const { name } = await req.json();
    const boards = await loadBoards();
    const board = boards.find(b => b.id === boardId);
    if (!board) return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    board.name = name;
    await saveBoards(boards);
    return NextResponse.json(board);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ boardId: string }> }) {
  try {
    const { boardId } = await params;
    const boards = await loadBoards();
    const idx = boards.findIndex(b => b.id === boardId);
    if (idx === -1) return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    boards.splice(idx, 1);
    await saveBoards(boards);
    await deleteBoardData(boardId);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
