import { NextResponse } from 'next/server';
import { loadBoard, saveBoard } from '@/lib/tasks';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const updates = await req.json();
    const board = await loadBoard();

    const idx = board.tasks.findIndex(t => t.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    board.tasks[idx] = {
      ...board.tasks[idx],
      ...updates,
      id,
      updatedAt: new Date().toISOString(),
    };

    await saveBoard(board);
    return NextResponse.json(board.tasks[idx]);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const board = await loadBoard();

    const idx = board.tasks.findIndex(t => t.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    board.tasks.splice(idx, 1);
    await saveBoard(board);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
