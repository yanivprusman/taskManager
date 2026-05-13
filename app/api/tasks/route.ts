import { NextResponse } from 'next/server';
import { loadBoard, saveBoard, DEFAULT_COLUMNS, type Task } from '@/lib/tasks';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

function getBoardId(req: Request): string {
  return new URL(req.url).searchParams.get('boardId') || 'default';
}

export async function GET(req: Request) {
  try {
    const board = await loadBoard(getBoardId(req));
    return NextResponse.json(board);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const boardId = getBoardId(req);
    const body = await req.json();
    const board = await loadBoard(boardId);

    const columnTasks = board.tasks.filter(t => t.columnId === (body.columnId || 'todo'));
    const maxOrder = columnTasks.reduce((max, t) => Math.max(max, t.order), -1);

    const task: Task = {
      id: randomUUID(),
      title: body.title || 'Untitled',
      description: body.description || '',
      columnId: body.columnId || 'todo',
      priority: body.priority || 'medium',
      labels: body.labels || [],
      dueDate: body.dueDate || null,
      order: maxOrder + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    board.tasks.push(task);
    if (!board.columns.length) board.columns = DEFAULT_COLUMNS;
    await saveBoard(boardId, board);

    return NextResponse.json(task, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const boardId = getBoardId(req);
    const body = await req.json();
    const board = body as { tasks: Task[]; columns: typeof DEFAULT_COLUMNS };
    await saveBoard(boardId, board);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
