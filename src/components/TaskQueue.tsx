import React, { useState } from 'react';
import { CheckSquare, Square, Plus, Sparkles, AlertCircle } from 'lucide-react';
import { playAcousticCue } from '../utils/soundFx';

export interface TacticalTask {
  id: string;
  title: string;
  priority: 'P0' | 'P1' | 'P2';
  category: string;
  completed: boolean;
  directivePrompt: string;
}

const INITIAL_TASKS: TacticalTask[] = [
  {
    id: 't-1',
    title: 'Audit socket descriptors for lingering TLS connections',
    priority: 'P0',
    category: 'Security',
    completed: false,
    directivePrompt: 'Analyze potential socket descriptor leaks across edge proxies and provide automated reaper script.',
  },
  {
    id: 't-2',
    title: 'Implement Raft quorum partition failover test',
    priority: 'P1',
    category: 'Reliability',
    completed: false,
    directivePrompt: 'Formulate an automated chaos test for split-brain detection in 3-node Raft clusters.',
  },
  {
    id: 't-3',
    title: 'Profile ring-buffer allocator for event ingestion',
    priority: 'P1',
    category: 'Optimization',
    completed: true,
    directivePrompt: 'Design a lock-free circular ring buffer in TypeScript for 100k events/sec ingestion.',
  },
  {
    id: 't-4',
    title: 'Enforce client-side idempotency keys on payment RPCs',
    priority: 'P2',
    category: 'Architecture',
    completed: false,
    directivePrompt: 'Specify an RFC-compliant idempotency header standard and cache invalidation contract.',
  },
];

interface TaskQueueProps {
  onDispatchToArone: (prompt: string) => void;
}

export const TaskQueue: React.FC<TaskQueueProps> = ({ onDispatchToArone }) => {
  const [tasks, setTasks] = useState<TacticalTask[]>(INITIAL_TASKS);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'P0' | 'P1' | 'P2'>('P1');
  const [isAdding, setIsAdding] = useState(false);

  const toggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
    playAcousticCue('affirmative');
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: TacticalTask = {
      id: `t-${Date.now()}`,
      title: newTitle.trim(),
      priority: newPriority,
      category: 'Operations',
      completed: false,
      directivePrompt: `Assess risk and execution strategy for: ${newTitle.trim()}`,
    };

    setTasks(prev => [newTask, ...prev]);
    setNewTitle('');
    setIsAdding(false);
    playAcousticCue('affirmative');
  };

  const handleDispatch = (task: TacticalTask) => {
    playAcousticCue('chime');
    onDispatchToArone(task.directivePrompt);
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-sm font-semibold tracking-wide text-slate-100">
            Tactical Operations Queue
          </h2>
          <div className="text-xs text-slate-400 mt-0.5">
            {tasks.filter(t => t.completed).length} of {tasks.length} operations fulfilled
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-950/40 border border-cyan-500/40 rounded-lg hover:bg-cyan-900/50 transition-colors"
          aria-label="Add new operation"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="whitespace-nowrap">{isAdding ? 'Cancel' : 'New Directive'}</span>
        </button>
      </div>

      {/* Add task form */}
      {isAdding && (
        <form onSubmit={handleAddTask} className="my-3 p-3 bg-slate-950/80 border border-slate-800 rounded-lg">
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Operational directive title..."
            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
            autoFocus
          />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Priority:</span>
              {(['P0', 'P1', 'P2'] as const).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setNewPriority(p)}
                  className={`px-2 py-0.5 text-[11px] font-mono rounded ${
                    newPriority === p ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              type="submit"
              className="px-3 py-1 text-xs font-semibold bg-cyan-400 text-slate-950 rounded hover:bg-cyan-300"
            >
              Enlist
            </button>
          </div>
        </form>
      )}

      {/* Tasks List */}
      <div className="mt-3 divide-y divide-slate-800/60">
        {tasks.map(task => (
          <div
            key={task.id}
            className={`py-3 flex items-start justify-between gap-3 transition-colors ${
              task.completed ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-start gap-2.5">
              <button
                type="button"
                onClick={() => toggleTask(task.id)}
                className="mt-0.5 text-slate-400 hover:text-cyan-400 transition-colors"
                aria-label={`Toggle task: ${task.title}`}
              >
                {task.completed ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
              </button>
              <div>
                <div className={`text-xs font-medium text-slate-200 ${task.completed ? 'line-through' : ''}`}>
                  {task.title}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                  <span
                    className={`font-mono font-semibold ${
                      task.priority === 'P0'
                        ? 'text-rose-400'
                        : task.priority === 'P1'
                        ? 'text-amber-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {task.priority}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{task.category}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleDispatch(task)}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-cyan-300 bg-cyan-950/30 border border-cyan-800/50 rounded hover:bg-cyan-900/40 transition-colors shrink-0"
              title="Instruct ARONE to formulate execution strategy"
              aria-label={`Analyze with ARONE: ${task.title}`}
            >
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Analyze</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
