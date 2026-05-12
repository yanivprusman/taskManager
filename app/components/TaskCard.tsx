'use client';

import type { Task } from '@/lib/types';
import { PRIORITY_CONFIG } from '@/lib/types';

interface Props {
  task: Task;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function TaskCard({ task, isDragging, onDragStart, onEdit, onDelete }: Props) {
  const priority = PRIORITY_CONFIG[task.priority];
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={(e) => e.currentTarget.style.opacity = '1'}
      className={`group relative bg-gray-800 rounded-lg p-3 cursor-grab active:cursor-grabbing border border-gray-700/50 hover:border-gray-600 transition-all ${
        isDragging ? 'opacity-40 scale-95' : 'opacity-100'
      }`}
      data-id={`task-card-${task.id.slice(0, 8)}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3
          data-id={`task-title-${task.id.slice(0, 8)}`}
          onClick={onEdit}
          className="text-sm font-medium text-gray-200 hover:text-white cursor-pointer flex-1 leading-snug"
        >
          {task.title}
        </h3>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            data-id={`edit-task-${task.id.slice(0, 8)}`}
            onClick={onEdit}
            className="text-gray-500 hover:text-blue-400 text-xs cursor-pointer"
          >
            edit
          </button>
          <button
            data-id={`delete-task-${task.id.slice(0, 8)}`}
            onClick={onDelete}
            className="text-gray-500 hover:text-red-400 text-xs cursor-pointer"
          >
            del
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      <div className="flex items-center gap-2 mt-2 flex-wrap">
        <span
          className="text-[10px] font-bold px-1.5 py-0.5 rounded"
          style={{ color: priority.color, backgroundColor: priority.color + '18' }}
        >
          {priority.icon} {priority.label}
        </span>

        {task.labels.map(label => (
          <span key={label} className="text-[10px] text-gray-400 bg-gray-700/60 px-1.5 py-0.5 rounded">
            {label}
          </span>
        ))}

        {task.dueDate && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${
            isOverdue ? 'text-red-400 bg-red-400/10' : 'text-gray-400 bg-gray-700/60'
          }`}>
            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
    </div>
  );
}
