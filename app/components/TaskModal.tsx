'use client';

import { useState, useEffect, useRef } from 'react';
import type { Task, Column, Priority } from '@/lib/types';
import { PRIORITY_CONFIG } from '@/lib/types';

interface Props {
  task: Task | null;
  columns: Column[];
  targetColumn: string;
  allLabels: string[];
  onSave: (task: Partial<Task>) => void;
  onClose: () => void;
}

export default function TaskModal({ task, columns, targetColumn, allLabels, onSave, onClose }: Props) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState<Priority>(task?.priority || 'medium');
  const [columnId, setColumnId] = useState(task?.columnId || targetColumn);
  const [dueDate, setDueDate] = useState(task?.dueDate?.split('T')[0] || '');
  const [labels, setLabels] = useState<string[]>(task?.labels || []);
  const [newLabel, setNewLabel] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => { titleRef.current?.focus(); }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim(),
      priority,
      columnId,
      dueDate: dueDate || null,
      labels,
    });
  };

  const addLabel = () => {
    const trimmed = newLabel.trim().toLowerCase();
    if (trimmed && !labels.includes(trimmed)) {
      setLabels([...labels, trimmed]);
    }
    setNewLabel('');
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg shadow-2xl"
      >
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-gray-100">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
        </div>

        <div className="px-6 py-4 flex flex-col gap-4">
          <input
            ref={titleRef}
            data-id="task-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          />

          <textarea
            data-id="task-description-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Priority</label>
              <div className="flex gap-1">
                {(Object.keys(PRIORITY_CONFIG) as Priority[]).map(p => (
                  <button
                    key={p}
                    type="button"
                    data-id={`priority-${p}`}
                    onClick={() => setPriority(p)}
                    className={`flex-1 text-[11px] py-1.5 rounded-md font-medium cursor-pointer transition-all ${
                      priority === p
                        ? 'ring-2 ring-offset-1 ring-offset-gray-900'
                        : 'opacity-50 hover:opacity-80'
                    }`}
                    style={{
                      color: PRIORITY_CONFIG[p].color,
                      backgroundColor: PRIORITY_CONFIG[p].color + '18',
                      ...(priority === p ? { ringColor: PRIORITY_CONFIG[p].color } : {}),
                    }}
                  >
                    {PRIORITY_CONFIG[p].label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Column</label>
              <select
                data-id="task-column-select"
                value={columnId}
                onChange={(e) => setColumnId(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                {columns.sort((a, b) => a.order - b.order).map(col => (
                  <option key={col.id} value={col.id}>{col.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Due Date</label>
            <input
              type="date"
              data-id="task-due-date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">Labels</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {labels.map(label => (
                <span
                  key={label}
                  className="text-xs text-gray-300 bg-gray-700 px-2 py-0.5 rounded-full flex items-center gap-1"
                >
                  {label}
                  <button
                    type="button"
                    data-id={`remove-label-${label}`}
                    onClick={() => setLabels(labels.filter(l => l !== label))}
                    className="text-gray-500 hover:text-red-400 cursor-pointer"
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                data-id="new-label-input"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLabel(); } }}
                placeholder="Add label..."
                list="label-suggestions"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
              <datalist id="label-suggestions">
                {allLabels.filter(l => !labels.includes(l)).map(l => (
                  <option key={l} value={l} />
                ))}
              </datalist>
              <button
                type="button"
                data-id="add-label-btn"
                onClick={addLabel}
                className="px-3 py-1.5 bg-gray-700 text-gray-300 text-sm rounded-lg hover:bg-gray-600 cursor-pointer transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-800">
          <button
            type="button"
            data-id="cancel-task"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-gray-200 cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            data-id="save-task"
            disabled={!title.trim()}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            {task ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
}
