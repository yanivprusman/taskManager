export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description: string;
  columnId: string;
  priority: Priority;
  labels: string[];
  dueDate: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  title: string;
  color: string;
  order: number;
}

export interface BoardData {
  tasks: Task[];
  columns: Column[];
}

export interface BoardMeta {
  id: string;
  name: string;
}

export const DEFAULT_COLUMNS: Column[] = [
  { id: 'backlog', title: 'Backlog', color: '#6b7280', order: 0 },
  { id: 'todo', title: 'To Do', color: '#3b82f6', order: 1 },
  { id: 'in-progress', title: 'In Progress', color: '#f59e0b', order: 2 },
  { id: 'done', title: 'Done', color: '#10b981', order: 3 },
];

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; icon: string }> = {
  urgent: { label: 'Urgent', color: '#ef4444', icon: '!!!' },
  high: { label: 'High', color: '#f97316', icon: '!!' },
  medium: { label: 'Medium', color: '#eab308', icon: '!' },
  low: { label: 'Low', color: '#6b7280', icon: '-' },
};
