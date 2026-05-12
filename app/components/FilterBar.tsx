'use client';

import type { Priority } from '@/lib/types';
import { PRIORITY_CONFIG } from '@/lib/types';
import type { Filters } from './Board';

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
  allLabels: string[];
}

export default function FilterBar({ filters, onChange, allLabels }: Props) {
  const hasFilters = filters.search || filters.priorities.length > 0 || filters.labels.length > 0;

  const togglePriority = (p: Priority) => {
    const next = filters.priorities.includes(p)
      ? filters.priorities.filter(x => x !== p)
      : [...filters.priorities, p];
    onChange({ ...filters, priorities: next });
  };

  const toggleLabel = (l: string) => {
    const next = filters.labels.includes(l)
      ? filters.labels.filter(x => x !== l)
      : [...filters.labels, l];
    onChange({ ...filters, labels: next });
  };

  return (
    <div className="flex items-center gap-3 px-6 py-2 border-b border-gray-800/50 flex-wrap">
      <input
        data-id="search-tasks"
        value={filters.search}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        placeholder="Search tasks..."
        className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-100 placeholder-gray-500 w-56 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
      />

      <div className="flex gap-1">
        {(Object.keys(PRIORITY_CONFIG) as Priority[]).map(p => (
          <button
            key={p}
            data-id={`filter-priority-${p}`}
            onClick={() => togglePriority(p)}
            className={`text-[11px] px-2 py-1 rounded-md cursor-pointer transition-all ${
              filters.priorities.includes(p)
                ? 'ring-1 ring-offset-1 ring-offset-gray-950'
                : 'opacity-40 hover:opacity-70'
            }`}
            style={{
              color: PRIORITY_CONFIG[p].color,
              backgroundColor: PRIORITY_CONFIG[p].color + '15',
            }}
          >
            {PRIORITY_CONFIG[p].label}
          </button>
        ))}
      </div>

      {allLabels.length > 0 && (
        <div className="flex gap-1">
          {allLabels.slice(0, 8).map(label => (
            <button
              key={label}
              data-id={`filter-label-${label}`}
              onClick={() => toggleLabel(label)}
              className={`text-[11px] px-2 py-1 rounded-md cursor-pointer transition-all ${
                filters.labels.includes(label)
                  ? 'bg-gray-600 text-gray-100'
                  : 'bg-gray-800/50 text-gray-500 hover:text-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {hasFilters && (
        <button
          data-id="clear-filters"
          onClick={() => onChange({ search: '', priorities: [], labels: [] })}
          className="text-[11px] text-gray-500 hover:text-gray-300 cursor-pointer transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
