'use client';

import { useState, useRef, useEffect } from 'react';
import type { BoardMeta } from '@/lib/types';

interface Props {
  boards: BoardMeta[];
  activeBoardId: string;
  onSwitch: (id: string) => void;
  onCreate: (name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

export default function BoardSwitcher({ boards, activeBoardId, onSwitch, onCreate, onRename, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeBoard = boards.find(b => b.id === activeBoardId);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setCreating(false);
        setRenamingId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if ((creating || renamingId) && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [creating, renamingId]);

  const handleCreate = () => {
    const name = inputValue.trim();
    if (!name) return;
    onCreate(name);
    setInputValue('');
    setCreating(false);
  };

  const handleRename = (id: string) => {
    const name = inputValue.trim();
    if (!name) return;
    onRename(id, name);
    setInputValue('');
    setRenamingId(null);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        data-id="board-switcher"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-xl font-semibold tracking-tight hover:text-white transition-colors cursor-pointer"
      >
        <span>{activeBoard?.name || 'Select Board'}</span>
        <svg className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="py-1">
            {boards.map(board => (
              <div key={board.id} className="group flex items-center">
                {renamingId === board.id ? (
                  <div className="flex-1 flex items-center gap-1 px-3 py-2">
                    <input
                      ref={inputRef}
                      data-id="rename-board-input"
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleRename(board.id);
                        if (e.key === 'Escape') { setRenamingId(null); setInputValue(''); }
                      }}
                      className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-0.5 text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      data-id="confirm-rename"
                      onClick={() => handleRename(board.id)}
                      className="text-xs text-green-400 hover:text-green-300 cursor-pointer px-1"
                    >
                      ok
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      data-id={`switch-board-${board.id}`}
                      onClick={() => { onSwitch(board.id); setOpen(false); }}
                      className={`flex-1 text-left px-4 py-2 text-sm cursor-pointer transition-colors ${
                        board.id === activeBoardId
                          ? 'text-blue-400 bg-blue-500/10'
                          : 'text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      {board.name}
                    </button>
                    <div className="flex gap-1 pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        data-id={`rename-board-${board.id}`}
                        onClick={() => { setRenamingId(board.id); setInputValue(board.name); }}
                        className="text-[10px] text-gray-500 hover:text-gray-300 cursor-pointer"
                      >
                        rename
                      </button>
                      {boards.length > 1 && (
                        <button
                          data-id={`delete-board-${board.id}`}
                          onClick={() => { onDelete(board.id); }}
                          className="text-[10px] text-gray-500 hover:text-red-400 cursor-pointer"
                        >
                          del
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 p-2">
            {creating ? (
              <div className="flex items-center gap-1">
                <input
                  ref={inputRef}
                  data-id="new-board-input"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleCreate();
                    if (e.key === 'Escape') { setCreating(false); setInputValue(''); }
                  }}
                  placeholder="Board name..."
                  className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  data-id="confirm-create-board"
                  onClick={handleCreate}
                  className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-500 cursor-pointer"
                >
                  Add
                </button>
              </div>
            ) : (
              <button
                data-id="create-board"
                onClick={() => { setCreating(true); setInputValue(''); }}
                className="w-full text-left px-2 py-1.5 text-sm text-gray-400 hover:text-gray-200 cursor-pointer transition-colors"
              >
                + New Board
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
