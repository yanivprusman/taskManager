'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Task, Subtask } from '@/lib/types';
import { PRIORITY_CONFIG } from '@/lib/types';
import { randomId } from '@/lib/utils';

interface Props {
  task: Task;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onEdit: () => void;
  onDelete: () => void;
  onUpdate: (updates: Partial<Task>) => void;
}

export default function TaskCard({ task, isDragging, onDragStart, onEdit, onDelete, onUpdate }: Props) {
  const priority = PRIORITY_CONFIG[task.priority];
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [subtaskContextMenu, setSubtaskContextMenu] = useState<{ x: number; y: number; subtaskId: string } | null>(null);
  const [addingSubtask, setAddingSubtask] = useState(false);
  const [subtaskTitle, setSubtaskTitle] = useState('');
  const [editingSubtask, setEditingSubtask] = useState<{ id: string; title: string } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const subtaskMenuRef = useRef<HTMLDivElement>(null);
  const subtaskInputRef = useRef<HTMLTextAreaElement>(null);
  const editSubtaskInputRef = useRef<HTMLTextAreaElement>(null);

  const closeMenu = useCallback(() => setContextMenu(null), []);
  const closeSubtaskMenu = useCallback(() => setSubtaskContextMenu(null), []);

  useEffect(() => {
    if (!contextMenu && !subtaskContextMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (contextMenu && menuRef.current && !menuRef.current.contains(e.target as Node)) closeMenu();
      if (subtaskContextMenu && subtaskMenuRef.current && !subtaskMenuRef.current.contains(e.target as Node)) closeSubtaskMenu();
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { closeMenu(); closeSubtaskMenu(); }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [contextMenu, subtaskContextMenu, closeMenu, closeSubtaskMenu]);

  useEffect(() => {
    if (addingSubtask) subtaskInputRef.current?.focus();
  }, [addingSubtask]);

  useEffect(() => {
    if (editingSubtask) editSubtaskInputRef.current?.focus();
  }, [editingSubtask]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleDestruct = () => {
    closeMenu();
    onUpdate({ isDestructed: true, subtasks: task.subtasks || [] });
  };

  const handleUndestruct = () => {
    closeMenu();
    onUpdate({ isDestructed: false });
  };

  const addSubtask = () => {
    const trimmed = subtaskTitle.trim();
    if (!trimmed) return;
    const newSubtask: Subtask = { id: randomId(), title: trimmed, completed: false };
    onUpdate({ subtasks: [...(task.subtasks || []), newSubtask] });
    setSubtaskTitle('');
  };

  const toggleSubtask = (subtaskId: string) => {
    const updated = (task.subtasks || []).map(s =>
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );
    onUpdate({ subtasks: updated });
  };

  const deleteSubtask = (subtaskId: string) => {
    onUpdate({ subtasks: (task.subtasks || []).filter(s => s.id !== subtaskId) });
  };

  const handleSubtaskContextMenu = (e: React.MouseEvent, subtaskId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSubtaskContextMenu({ x: e.clientX, y: e.clientY, subtaskId });
  };

  const startEditSubtask = (subtaskId: string) => {
    closeSubtaskMenu();
    const subtask = subtasks.find(s => s.id === subtaskId);
    if (subtask) setEditingSubtask({ id: subtaskId, title: subtask.title });
  };

  const saveEditSubtask = () => {
    if (!editingSubtask) return;
    const trimmed = editingSubtask.title.trim();
    if (trimmed) {
      const updated = (task.subtasks || []).map(s =>
        s.id === editingSubtask.id ? { ...s, title: trimmed } : s
      );
      onUpdate({ subtasks: updated });
    }
    setEditingSubtask(null);
  };

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  };

  const renderSubtaskInput = (props: {
    inputRef: React.RefObject<HTMLTextAreaElement | null>;
    dataId: string;
    value: string;
    onChange: (val: string) => void;
    onSubmit: () => void;
    onCancel: () => void;
    confirmDataId: string;
    confirmLabel: string;
  }) => (
    <div className="flex gap-1 items-start">
      <textarea
        ref={props.inputRef}
        data-id={props.dataId}
        value={props.value}
        onChange={e => { props.onChange(e.target.value); autoResize(e.target); }}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); props.onSubmit(); }
          if (e.key === 'Escape') props.onCancel();
        }}
        onBlur={props.onSubmit}
        onFocus={e => autoResize(e.target)}
        placeholder="Subtask title..."
        rows={1}
        className="flex-1 min-w-0 bg-gray-700/50 border border-gray-600 rounded px-1.5 py-0.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-amber-500/50 resize-none overflow-hidden"
      />
      <button
        data-id={props.confirmDataId}
        onMouseDown={e => e.preventDefault()}
        onClick={props.onSubmit}
        className="text-amber-400 hover:text-amber-300 text-xs cursor-pointer px-1 mt-0.5"
      >
        {props.confirmLabel}
      </button>
    </div>
  );

  const subtasks = task.subtasks || [];
  const completedCount = subtasks.filter(s => s.completed).length;

  return (
    <>
      <div
        draggable
        onDragStart={onDragStart}
        onDragEnd={(e) => e.currentTarget.style.opacity = '1'}
        onContextMenu={handleContextMenu}
        className={`group relative bg-gray-800 rounded-lg p-3 cursor-grab active:cursor-grabbing border transition-all ${
          task.movedToCalendar
            ? 'border-purple-500/40 bg-gray-800/80'
            : task.isDestructed
              ? 'border-amber-500/40 bg-gray-800/90'
              : 'border-gray-700/50 hover:border-gray-600'
        } ${isDragging ? 'opacity-40 scale-95' : 'opacity-100'}`}
        data-id={`task-card-${task.id.slice(0, 8)}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            {task.movedToCalendar && (
              <span className="text-purple-400 text-xs shrink-0" title="Moved to calendar">📅</span>
            )}
            {task.isDestructed && (
              <span className="text-amber-400 text-xs shrink-0" title="Destructed to subtasks">⚡</span>
            )}
            <h3
              data-id={`task-title-${task.id.slice(0, 8)}`}
              onClick={onEdit}
              className="text-sm font-medium text-gray-200 hover:text-white cursor-pointer flex-1 leading-snug truncate"
            >
              {task.title}
            </h3>
          </div>
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

        {task.description && !task.isDestructed && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        {task.isDestructed && (
          <div className="mt-2 space-y-1" data-id={`subtasks-${task.id.slice(0, 8)}`}>
            {subtasks.length > 0 && (
              <div className="text-[10px] text-gray-500 mb-1">
                {completedCount}/{subtasks.length} done
              </div>
            )}
            {subtasks.map(s => (
              <div
                key={s.id}
                className="flex items-center gap-1.5 group/sub"
                onContextMenu={(e) => handleSubtaskContextMenu(e, s.id)}
                data-id={`subtask-row-${s.id.slice(0, 8)}`}
              >
                <button
                  data-id={`toggle-subtask-${s.id.slice(0, 8)}`}
                  onClick={() => toggleSubtask(s.id)}
                  className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                    s.completed
                      ? 'bg-green-500/20 border-green-500/50 text-green-400'
                      : 'border-gray-600 hover:border-gray-400'
                  }`}
                >
                  {s.completed && <span className="text-[8px]">✓</span>}
                </button>
                {editingSubtask?.id === s.id ? (
                  <div className="flex-1 min-w-0">
                    {renderSubtaskInput({
                      inputRef: editSubtaskInputRef,
                      dataId: `edit-subtask-input-${s.id.slice(0, 8)}`,
                      value: editingSubtask.title,
                      onChange: val => setEditingSubtask({ ...editingSubtask, title: val }),
                      onSubmit: saveEditSubtask,
                      onCancel: () => setEditingSubtask(null),
                      confirmDataId: `confirm-edit-subtask-${s.id.slice(0, 8)}`,
                      confirmLabel: '✓',
                    })}
                  </div>
                ) : (
                  <>
                    <span className={`text-xs flex-1 leading-tight ${
                      s.completed ? 'text-gray-600 line-through' : 'text-gray-300'
                    }`}>
                      {s.title}
                    </span>
                    <button
                      data-id={`delete-subtask-${s.id.slice(0, 8)}`}
                      onClick={() => deleteSubtask(s.id)}
                      className="text-gray-600 hover:text-red-400 text-[10px] opacity-0 group-hover/sub:opacity-100 cursor-pointer transition-opacity"
                    >
                      ×
                    </button>
                  </>
                )}
              </div>
            ))}
            {addingSubtask ? (
              <div className="mt-1">
                {renderSubtaskInput({
                  inputRef: subtaskInputRef,
                  dataId: `subtask-input-${task.id.slice(0, 8)}`,
                  value: subtaskTitle,
                  onChange: val => setSubtaskTitle(val),
                  onSubmit: addSubtask,
                  onCancel: () => { setAddingSubtask(false); setSubtaskTitle(''); },
                  confirmDataId: `confirm-subtask-${task.id.slice(0, 8)}`,
                  confirmLabel: '+',
                })}
              </div>
            ) : (
              <button
                data-id={`add-subtask-${task.id.slice(0, 8)}`}
                onClick={() => setAddingSubtask(true)}
                className="text-[10px] text-gray-600 hover:text-amber-400 cursor-pointer transition-colors mt-0.5"
              >
                + Add subtask
              </button>
            )}
          </div>
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

      {contextMenu && (
        <div
          ref={menuRef}
          className="fixed z-[100] bg-gray-800 border border-gray-600 rounded-lg shadow-xl py-1 min-w-[200px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          data-id={`context-menu-${task.id.slice(0, 8)}`}
        >
          {task.isDestructed ? (
            <button
              data-id={`undestruct-${task.id.slice(0, 8)}`}
              onClick={handleUndestruct}
              className="w-full text-left px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer transition-colors flex items-center gap-2"
            >
              <span className="text-gray-500">🔄</span>
              Remove subtask view
            </button>
          ) : (
            <button
              data-id={`destruct-${task.id.slice(0, 8)}`}
              onClick={handleDestruct}
              className="w-full text-left px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-amber-300 cursor-pointer transition-colors flex items-center gap-2"
            >
              <span className="text-amber-400">⚡</span>
              Destruct to subtasks
            </button>
          )}
          <button
            data-id={`ctx-calendar-${task.id.slice(0, 8)}`}
            onClick={() => { closeMenu(); onUpdate({ movedToCalendar: !task.movedToCalendar }); }}
            className={`w-full text-left px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 cursor-pointer transition-colors flex items-center gap-2 ${
              task.movedToCalendar ? 'hover:text-gray-100' : 'hover:text-purple-300'
            }`}
          >
            <span className={task.movedToCalendar ? 'text-purple-400' : 'text-gray-500'}>📅</span>
            {task.movedToCalendar ? 'Remove from calendar' : 'Moved to calendar'}
          </button>
          <button
            data-id={`ctx-edit-${task.id.slice(0, 8)}`}
            onClick={() => { closeMenu(); onEdit(); }}
            className="w-full text-left px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer transition-colors flex items-center gap-2"
          >
            <span className="text-gray-500">✏️</span>
            Edit task
          </button>
          <button
            data-id={`ctx-delete-${task.id.slice(0, 8)}`}
            onClick={() => { closeMenu(); onDelete(); }}
            className="w-full text-left px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-red-400 cursor-pointer transition-colors flex items-center gap-2"
          >
            <span className="text-gray-500">🗑️</span>
            Delete task
          </button>
        </div>
      )}

      {subtaskContextMenu && (
        <div
          ref={subtaskMenuRef}
          className="fixed z-[100] bg-gray-800 border border-gray-600 rounded-lg shadow-xl py-1 min-w-[180px]"
          style={{ left: subtaskContextMenu.x, top: subtaskContextMenu.y }}
          data-id={`subtask-context-menu-${subtaskContextMenu.subtaskId.slice(0, 8)}`}
        >
          <button
            data-id={`ctx-edit-subtask-${subtaskContextMenu.subtaskId.slice(0, 8)}`}
            onClick={() => startEditSubtask(subtaskContextMenu.subtaskId)}
            className="w-full text-left px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer transition-colors flex items-center gap-2"
          >
            <span className="text-gray-500">✏️</span>
            Edit sub-task
          </button>
          <button
            data-id={`ctx-delete-subtask-${subtaskContextMenu.subtaskId.slice(0, 8)}`}
            onClick={() => { closeSubtaskMenu(); deleteSubtask(subtaskContextMenu.subtaskId); }}
            className="w-full text-left px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-red-400 cursor-pointer transition-colors flex items-center gap-2"
          >
            <span className="text-gray-500">🗑️</span>
            Delete sub-task
          </button>
        </div>
      )}
    </>
  );
}
