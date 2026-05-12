'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Task, Column, BoardData, Priority } from '@/lib/types';
import { DEFAULT_COLUMNS, PRIORITY_CONFIG } from '@/lib/types';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import FilterBar from './FilterBar';

export interface Filters {
  search: string;
  priorities: Priority[];
  labels: string[];
}

export default function Board() {
  const [board, setBoard] = useState<BoardData>({ tasks: [], columns: DEFAULT_COLUMNS });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [targetColumn, setTargetColumn] = useState<string>('todo');
  const [filters, setFilters] = useState<Filters>({ search: '', priorities: [], labels: [] });
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchBoard = useCallback(async () => {
    try {
      const res = await fetch('/api/tasks');
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setBoard(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBoard(); }, [fetchBoard]);

  const persistBoard = useCallback((updated: BoardData) => {
    setBoard(updated);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      try {
        await fetch('/api/tasks', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        });
      } catch {}
    }, 300);
  }, []);

  const handleCreateTask = async (task: Partial<Task>) => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...task, columnId: targetColumn }),
    });
    if (res.ok) {
      await fetchBoard();
      setModalOpen(false);
    }
  };

  const handleUpdateTask = async (task: Partial<Task> & { id: string }) => {
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    if (res.ok) {
      await fetchBoard();
      setModalOpen(false);
      setEditingTask(null);
    }
  };

  const handleDeleteTask = async (id: string) => {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    await fetchBoard();
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    setDraggedTaskId(null);
    setDragOverColumn(null);

    const updated = { ...board, tasks: board.tasks.map(t => t) };
    const task = updated.tasks.find(t => t.id === taskId);
    if (!task || task.columnId === columnId) return;

    const columnTasks = updated.tasks.filter(t => t.columnId === columnId);
    const maxOrder = columnTasks.reduce((max, t) => Math.max(max, t.order), -1);
    task.columnId = columnId;
    task.order = maxOrder + 1;
    task.updatedAt = new Date().toISOString();

    persistBoard(updated);
  };

  const filteredTasks = board.tasks.filter(t => {
    if (filters.search && !t.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !t.description.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.priorities.length && !filters.priorities.includes(t.priority)) return false;
    if (filters.labels.length && !filters.labels.some(l => t.labels.includes(l))) return false;
    return true;
  });

  const allLabels = [...new Set(board.tasks.flatMap(t => t.labels))].sort();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-400">Loading board...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="text-red-400 text-lg">Failed to load board</div>
        <div className="text-sm text-gray-500">{error}</div>
        <button data-id="retry-load" onClick={fetchBoard}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 cursor-pointer">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-gray-100">
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <h1 className="text-xl font-semibold tracking-tight">Task Manager</h1>
        <button
          data-id="add-task-header"
          onClick={() => { setEditingTask(null); setTargetColumn('todo'); setModalOpen(true); }}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 cursor-pointer transition-colors"
        >
          + New Task
        </button>
      </header>

      <FilterBar filters={filters} onChange={setFilters} allLabels={allLabels} />

      <div className="flex-1 flex gap-4 p-4 overflow-x-auto">
        {board.columns.sort((a, b) => a.order - b.order).map(column => {
          const columnTasks = filteredTasks
            .filter(t => t.columnId === column.id)
            .sort((a, b) => a.order - b.order);
          const isDragOver = dragOverColumn === column.id;

          return (
            <div
              key={column.id}
              className={`flex flex-col w-80 min-w-80 rounded-xl transition-colors ${
                isDragOver ? 'bg-gray-800/80 ring-2 ring-blue-500/40' : 'bg-gray-900/60'
              }`}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: column.color }} />
                  <span className="text-sm font-medium text-gray-300">{column.title}</span>
                  <span className="text-xs text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>
                <button
                  data-id={`add-task-${column.id}`}
                  onClick={() => { setEditingTask(null); setTargetColumn(column.id); setModalOpen(true); }}
                  className="text-gray-500 hover:text-gray-300 text-lg leading-none cursor-pointer transition-colors"
                >
                  +
                </button>
              </div>

              <div className="flex-1 flex flex-col gap-2 px-3 pb-3 overflow-y-auto">
                {columnTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    isDragging={draggedTaskId === task.id}
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onEdit={() => { setEditingTask(task); setModalOpen(true); }}
                    onDelete={() => handleDeleteTask(task.id)}
                  />
                ))}
                {columnTasks.length === 0 && (
                  <div className="text-center text-gray-600 text-sm py-8">
                    {isDragOver ? 'Drop here' : 'No tasks'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {modalOpen && (
        <TaskModal
          task={editingTask}
          columns={board.columns}
          targetColumn={targetColumn}
          allLabels={allLabels}
          onSave={editingTask ? (t) => handleUpdateTask({ ...t, id: editingTask.id }) : handleCreateTask}
          onClose={() => { setModalOpen(false); setEditingTask(null); }}
        />
      )}
    </div>
  );
}
