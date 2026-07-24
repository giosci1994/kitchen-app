"use client";

import { useEffect, useState } from 'react';
import { CheckSquare, Plus, Trash2, ChevronDown, ChevronRight, Check, Repeat, Calendar, Users, UserCircle } from 'lucide-react';

const DAYS = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];

// Colori avatar per utenti
const COLORS = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a29bfe', '#fd79a8', '#00b894', '#e17055', '#0984e3'];

export default function PrepListPage() {
  const [lists, setLists] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newListTitle, setNewListTitle] = useState('');
  const [newListDate, setNewListDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDay, setRecurringDay] = useState(1);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [newTaskValues, setNewTaskValues] = useState<Record<string, string>>({});
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [showTab, setShowTab] = useState<'all' | 'recurring'>('all');
  const [userRole, setUserRole] = useState('USER');

  const fetchLists = () => {
    setLoading(true);
    fetch('/api/preplist').then(r => r.json()).then(data => { setLists(Array.isArray(data) ? data : []); setLoading(false); });
  };

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => { if (d.ruolo) setUserRole(d.ruolo); });
    fetchLists();
    fetch('/api/users').then(r => r.json()).then(d => setUsers(Array.isArray(d) ? d : []));
  }, []);

  const toggleMember = (userId: string) => {
    setSelectedMembers(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle) return;
    await fetch('/api/preplist', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newListTitle, date: isRecurring ? new Date().toISOString() : newListDate, isRecurring, recurringDay: isRecurring ? recurringDay : null, memberIds: selectedMembers })
    });
    setNewListTitle(''); setIsRecurring(false); setSelectedMembers([]);
    fetchLists();
  };

  const handleDeleteList = async (listId: string) => {
    if (!confirm('Eliminare intera Prep List?')) return;
    await fetch(`/api/preplist/${listId}`, { method: 'DELETE' });
    fetchLists();
  };

  const handleCreateTask = async (prepListId: string, parentTaskId: string | null) => {
    const key = parentTaskId || prepListId;
    const title = newTaskValues[key];
    if (!title) return;
    await fetch('/api/preplist/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, prepListId, parentTaskId }) });
    setNewTaskValues({ ...newTaskValues, [key]: '' });
    if (parentTaskId) setExpandedTasks({ ...expandedTasks, [parentTaskId]: true });
    fetchLists();
  };

  const handleToggleTask = async (taskId: string, isCompleted: boolean) => {
    setLists(lists.map(list => ({
      ...list,
      tasks: list.tasks.map((t: any) => {
        if (t.id === taskId) return { ...t, isCompleted };
        if (t.subTasks) return { ...t, subTasks: t.subTasks.map((st: any) => st.id === taskId ? { ...st, isCompleted } : st) };
        return t;
      })
    })));
    await fetch('/api/preplist/tasks', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ taskId, isCompleted }) });
  };

  const handleAssignTask = async (taskId: string, assignedToId: string) => {
    // Aggiornamento ottimistico
    const assignedUser = assignedToId ? users.find(u => u.id === assignedToId) : null;
    setLists(lists.map(list => ({
      ...list,
      tasks: list.tasks.map((t: any) => {
        if (t.id === taskId) return { ...t, assignedToId, assignedTo: assignedUser };
        if (t.subTasks) return { ...t, subTasks: t.subTasks.map((st: any) => st.id === taskId ? { ...st, assignedToId, assignedTo: assignedUser } : st) };
        return t;
      })
    })));
    await fetch('/api/preplist/tasks', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ taskId, assignedToId: assignedToId || null }) });
  };

  const handleDeleteTask = async (taskId: string) => {
    await fetch(`/api/preplist/tasks?taskId=${taskId}`, { method: 'DELETE' });
    fetchLists();
  };

  const toggleExpand = (taskId: string) => setExpandedTasks({ ...expandedTasks, [taskId]: !expandedTasks[taskId] });

  const getUserColor = (userId: string) => COLORS[userId.charCodeAt(0) % COLORS.length];

  const regularLists = lists.filter(l => !l.isRecurring);
  const recurringLists = lists.filter(l => l.isRecurring);
  const visibleLists = showTab === 'recurring' ? recurringLists : regularLists;

  const renderAssignSelect = (task: any, listMembers: any[]) => {
    const availableUsers = listMembers.length > 0 ? listMembers.map((m: any) => m.user) : users;
    return (
      <select
        value={task.assignedToId || ''}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => handleAssignTask(task.id, e.target.value)}
        style={{ background: task.assignedTo ? getUserColor(task.assignedToId) + '33' : 'rgba(0,0,0,0.3)', color: task.assignedTo ? getUserColor(task.assignedToId) : 'var(--text-muted)', border: `1px solid ${task.assignedTo ? getUserColor(task.assignedToId) + '55' : 'var(--border)'}`, padding: '0.25rem 0.4rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: task.assignedTo ? 600 : 400, maxWidth: '110px' }}>
        <option value="">— Nessuno</option>
        {availableUsers.map((u: any) => <option key={u.id} value={u.id}>{u.nome}</option>)}
      </select>
    );
  };

  const renderTask = (task: any, list: any, isSub: boolean = false) => {
    const size = isSub ? { check: 20, text: '0.9rem', pad: '0.5rem 0.7rem' } : { check: 26, text: '1.05rem', pad: '0.9rem 1rem' };
    return (
      <div key={task.id} style={{ ...(isSub ? { display: 'flex', alignItems: 'center', gap: '0.6rem', padding: size.pad, background: 'rgba(255,255,255,0.02)', borderRadius: '6px' } : { background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-lg)', border: `1px solid ${task.isCompleted ? 'rgba(52,199,89,0.2)' : 'var(--border)'}`, overflow: 'hidden' }) }}>
        {isSub ? (
          <>
            <button onClick={() => handleToggleTask(task.id, !task.isCompleted)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: `${size.check}px`, height: `${size.check}px`, minWidth: `${size.check}px`, borderRadius: '5px', border: `1.5px solid ${task.isCompleted ? 'var(--primary)' : 'var(--border)'}`, background: task.isCompleted ? 'var(--primary)' : 'transparent', cursor: 'pointer', color: 'white' }}>
              {task.isCompleted && <Check size={12} strokeWidth={3} />}
            </button>
            <span style={{ flex: 1, fontSize: size.text, textDecoration: task.isCompleted ? 'line-through' : 'none', color: task.isCompleted ? 'var(--text-muted)' : 'var(--text-main)' }}>{task.title}</span>
            {userRole !== 'USER' && renderAssignSelect(task, list.members)}
            {userRole !== 'USER' && (
              <button onClick={() => handleDeleteTask(task.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', opacity: 0.4, cursor: 'pointer' }}><Trash2 size={14} /></button>
            )}
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', padding: size.pad, gap: '0.8rem' }}>
              <button onClick={() => handleToggleTask(task.id, !task.isCompleted)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: `${size.check}px`, height: `${size.check}px`, minWidth: `${size.check}px`, borderRadius: '7px', border: `2px solid ${task.isCompleted ? 'var(--success)' : 'var(--border)'}`, background: task.isCompleted ? 'var(--success)' : 'rgba(0,0,0,0.4)', cursor: 'pointer', color: 'white' }}>
                {task.isCompleted && <Check size={16} strokeWidth={3} />}
              </button>
              <span style={{ flex: 1, fontSize: size.text, fontWeight: 500, textDecoration: task.isCompleted ? 'line-through' : 'none', color: task.isCompleted ? 'var(--text-muted)' : 'white' }}>{task.title}</span>
              {userRole !== 'USER' ? renderAssignSelect(task, list.members) : (
                task.assignedTo && <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '6px', background: getUserColor(task.assignedToId) + '25', color: getUserColor(task.assignedToId), fontWeight: 600 }}>{task.assignedTo.nome}</span>
              )}
              {userRole !== 'USER' && (
                <button onClick={() => handleDeleteTask(task.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', opacity: 0.6 }}><Trash2 size={16} /></button>
              )}
              <button onClick={() => toggleExpand(task.id)} className="btn btn-secondary" style={{ width: 'auto', padding: '0.3rem' }}>
                {expandedTasks[task.id] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </button>
            </div>
            {expandedTasks[task.id] && (
              <div style={{ padding: '0 1rem 1.2rem 3.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ padding: '0.8rem 0 0.3rem 0', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sotto-attività</div>
                {task.subTasks?.length === 0 && <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, fontStyle: 'italic' }}>Nessuna.</p>}
                {task.subTasks?.map((sub: any) => renderTask(sub, list, true))}
                {userRole !== 'USER' && (
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
                    <input type="text" className="input-field" style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem', flex: 1, background: 'rgba(0,0,0,0.3)', borderStyle: 'dashed' }}
                      placeholder="Aggiungi sotto-attività..." value={newTaskValues[task.id] || ''}
                      onChange={(e) => setNewTaskValues({ ...newTaskValues, [task.id]: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateTask(list.id, task.id)} />
                    <button onClick={() => handleCreateTask(list.id, task.id)} className="btn btn-secondary" style={{ width: 'auto', padding: '0.5rem' }}><Plus size={14} /></button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const renderList = (list: any) => (
    <div key={list.id} className="glass-panel" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.7rem', fontSize: '1.4rem' }}>
            <CheckSquare size={20} color="var(--primary)" /> {list.title}
          </h2>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginTop: '0.3rem', flexWrap: 'wrap' }}>
            {list.isRecurring ? (
              <span style={{ fontSize: '0.78rem', color: '#ff9f0a', display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(255,159,10,0.1)', padding: '0.15rem 0.5rem', borderRadius: '5px' }}>
                <Repeat size={11} /> Ogni {DAYS[list.recurringDay]}
              </span>
            ) : (
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Calendar size={12} /> {new Date(list.date).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'long' })}
              </span>
            )}
            {list.members?.length > 0 && (
              <div style={{ display: 'flex', gap: '0.2rem', alignItems: 'center' }}>
                <Users size={12} style={{ color: 'var(--text-muted)' }} />
                {list.members.map((m: any) => (
                  <span key={m.user.id} style={{ fontSize: '0.72rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: getUserColor(m.user.id) + '25', color: getUserColor(m.user.id), fontWeight: 600 }}>
                    {m.user.nome}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        {userRole !== 'USER' && (
          <button onClick={() => handleDeleteList(list.id)} className="btn" style={{ padding: '0.35rem 0.7rem', width: 'auto', background: 'rgba(255,59,48,0.1)', color: 'var(--danger)', border: '1px solid rgba(255,59,48,0.3)', fontSize: '0.8rem' }}>Elimina</button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
        {list.tasks.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Nessun task.</p>}
        {list.tasks.map((task: any) => renderTask(task, list))}
      </div>

      {userRole !== 'USER' && (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.2rem', background: 'rgba(0,0,0,0.1)', padding: '0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <input type="text" className="input-field" style={{ paddingLeft: '1rem', flex: 1 }}
            placeholder="Nuova preparazione..." value={newTaskValues[list.id] || ''}
            onChange={(e) => setNewTaskValues({ ...newTaskValues, [list.id]: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateTask(list.id, null)} />
          <button onClick={() => handleCreateTask(list.id, null)} className="btn btn-primary" style={{ width: 'auto', padding: '0.7rem 1rem' }}><Plus size={18} /> Aggiungi</button>
        </div>
      )}
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1>Prep List & Mise en Place</h1>
        <p>Organizza il lavoro quotidiano, assegna task e gestisci le attività ricorrenti.</p>
      </div>

      <div className="responsive-flex-col" style={{ gap: '2rem', alignItems: 'flex-start' }}>
        <div className="preplist-sidebar" style={{ flex: '1 1 320px', display: userRole === 'USER' ? 'none' : 'block' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Nuova Prep List</h3>
            <form onSubmit={handleCreateList} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <input type="text" className="input-field" style={{ paddingLeft: '1rem' }} placeholder="Es. Pulizia Generale"
                value={newListTitle} onChange={e => setNewListTitle(e.target.value)} />
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <button type="button" onClick={() => setIsRecurring(!isRecurring)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.8rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem',
                    background: isRecurring ? 'rgba(255,159,10,0.15)' : 'rgba(255,255,255,0.05)', color: isRecurring ? '#ff9f0a' : 'var(--text-muted)' }}>
                  <Repeat size={14} /> {isRecurring ? 'Ricorrente' : 'Una tantum'}
                </button>
              </div>

              {isRecurring ? (
                <select className="input-field" style={{ paddingLeft: '1rem' }} value={recurringDay} onChange={(e) => setRecurringDay(Number(e.target.value))}>
                  {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                </select>
              ) : (
                <input type="date" className="input-field" style={{ paddingLeft: '1rem' }} value={newListDate} onChange={e => setNewListDate(e.target.value)} />
              )}

              {/* Selezione Utenti */}
              {users.length > 0 && (
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                    <Users size={12} style={{ verticalAlign: 'middle' }} /> Personale presente:
                  </label>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {users.map(u => {
                      const selected = selectedMembers.includes(u.id);
                      return (
                        <button key={u.id} type="button" onClick={() => toggleMember(u.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.6rem', borderRadius: '6px', border: `1.5px solid ${selected ? getUserColor(u.id) : 'var(--border)'}`, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem',
                            background: selected ? getUserColor(u.id) + '25' : 'transparent', color: selected ? getUserColor(u.id) : 'var(--text-muted)', fontWeight: selected ? 600 : 400, transition: 'all 0.2s' }}>
                          <UserCircle size={14} /> {u.nome}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <button type="submit" className="btn btn-primary"><Plus size={18} /> Crea Lista</button>
            </form>
          </div>

          <div style={{ display: 'flex', gap: '0', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <button onClick={() => setShowTab('all')}
              style={{ flex: 1, padding: '0.7rem', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: 600,
                background: showTab === 'all' ? 'var(--primary)' : 'transparent', color: showTab === 'all' ? 'white' : 'var(--text-muted)' }}>
              📋 Per Data ({regularLists.length})
            </button>
            <button onClick={() => setShowTab('recurring')}
              style={{ flex: 1, padding: '0.7rem', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: 600,
                background: showTab === 'recurring' ? '#ff9f0a' : 'transparent', color: showTab === 'recurring' ? 'white' : 'var(--text-muted)' }}>
              🔄 Ricorrenti ({recurringLists.length})
            </button>
          </div>
        </div>

        <div className="preplist-main" style={{ flex: '3 1 500px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {loading ? <div>Caricamento...</div> : visibleLists.length === 0 ? (
            <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <CheckSquare size={50} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <h3 style={{ color: 'var(--text-main)' }}>{showTab === 'recurring' ? 'Nessuna attività ricorrente' : 'Nessuna prep list'}</h3>
              <p>Usa il form a sinistra per creare una nuova lista.</p>
            </div>
          ) : visibleLists.map(renderList)}
        </div>
      </div>
    </div>
  );
}
