"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useDashboardStore, RoadmapItem, Roadmap } from '@/store/dashboardStore';

// --- Helper Functions ---
const generateId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2, 15);

const getFormattedTimeLeft = (targetDate?: string) => {
  if (!targetDate) return null;
  const diffTime = new Date(targetDate).getTime() - new Date().getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return '0 Days';
  if (diffDays > 30) {
    const months = Math.floor(diffDays / 30);
    const days = diffDays % 30;
    return `${months}M : ${days}D`;
  }
  return `${diffDays} Days`;
};

// --- Sub-Component ---
interface TreeNodeProps {
  item: RoadmapItem;
  depth: number;
  index: number;
  expandedNodes: Set<string>;
  toggleExpand: (id: string, e: React.MouseEvent) => void;
  activeMenuId: string | null;
  setActiveMenuId: (id: string | null) => void;
  handleAdd: (parentId: string | null) => void;
  handleDeleteNode: (node: RoadmapItem) => void;
  setEditingNode: (node: RoadmapItem | null) => void;
  toggleStatus: (item: RoadmapItem, e: React.MouseEvent) => void;
}

const TreeNode = ({
  item,
  depth = 0,
  index = 0,
  expandedNodes,
  toggleExpand,
  activeMenuId,
  setActiveMenuId,
  handleAdd,
  handleDeleteNode,
  setEditingNode,
  toggleStatus
}: TreeNodeProps) => {
  const isExpanded = expandedNodes.has(item.id);
  const hasChildren = item.subItems && item.subItems.length > 0;
  const isRoot = depth === 0;
  const isRight = isRoot && index % 2 === 1;

  const isMenuPath = (node: RoadmapItem): boolean => {
    if (node.id === activeMenuId) return true;
    if (node.subItems) return node.subItems.some(isMenuPath);
    return false;
  };
  const activePath = isMenuPath(item);

  const borderColors = {
    'pending': 'border-white/10',
    'in-progress': 'border-blue-500/80 shadow-[0_0_10px_rgba(59,130,246,0.2)]',
    'completed': 'border-green-500/80'
  };

  const nodeContentJsx = (
    <div className="w-full relative">
      <div className={`flex flex-col p-2.5 bg-slate-800/90 backdrop-blur-md border ${borderColors[item.status]} rounded-lg shadow-md transition-all w-full relative ${activeMenuId === item.id ? 'z-[10000]' : activePath ? 'z-[9999]' : 'z-10'}`}>
        <div className="flex items-start justify-between gap-1.5">

          <div
            onClick={(e) => {
              if (hasChildren) toggleExpand(item.id, e);
              else setEditingNode(item);
            }}
            className="flex-1 min-w-0 cursor-pointer flex gap-1.5 items-start"
          >
            <span className="text-white/40 font-bold w-3 flex justify-center text-[10px] mt-0.5 shrink-0">
              {hasChildren ? (isExpanded ? '▼' : '▶') : '•'}
            </span>
            <div className="min-w-0">
              <div className={`font-medium text-xs sm:text-sm break-words leading-tight ${item.status === 'completed' ? 'text-green-400 line-through opacity-50' : 'text-white'}`}>
                {item.title}
              </div>
              {item.description && <div className="text-white/50 text-[11px] mt-0.5 break-words leading-tight">{item.description}</div>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-1 items-center shrink-0 ml-1 relative">
            <button onClick={(e) => toggleStatus(item, e)} className="w-6 h-6 flex items-center justify-center bg-slate-700/60 rounded text-[11px] hover:bg-slate-600 transition-colors text-white">
              {item.status === 'pending' ? '⚪' : item.status === 'in-progress' ? '🔵' : '✅'}
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === item.id ? null : item.id); }}
              className="w-6 h-6 flex items-center justify-center bg-white/5 rounded hover:bg-white/10 text-white text-xs font-bold transition-colors"
            >
              ⋮
            </button>

            {activeMenuId === item.id && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-7 mt-0.5 w-28 bg-slate-900 border border-white/10 rounded-md shadow-xl z-999 flex flex-col overflow-hidden"
              >
                {depth < 3 && (
                  <button onClick={() => handleAdd(item.id)} className="px-3 py-1.5 text-left text-[11px] text-white hover:bg-white/10 flex items-center gap-1.5">
                    <span>➕</span> Subtopic
                  </button>
                )}
                <button onClick={() => { setEditingNode(item); setActiveMenuId(null); }} className="px-3 py-1.5 text-left text-[11px] text-white hover:bg-white/10 flex items-center gap-1.5">
                  <span>✎</span> Edit
                </button>
                <button onClick={() => handleDeleteNode(item)} className="px-3 py-1.5 text-left text-[11px] text-red-400 hover:bg-white/10 flex items-center gap-1.5 border-t border-white/5">
                  <span>✕</span> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {item.links && item.links.length > 0 && (
          <div className="mt-1.5 ml-4 flex flex-wrap gap-1">
            {item.links.map(link => (
              <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="text-[10px] px-1.5 py-0.5 bg-blue-950/40 text-blue-300 rounded hover:bg-blue-900/50 transition-colors">
                🔗 {link.label}
              </a>
            ))}
          </div>
        )}
      </div>

      {isExpanded && hasChildren && (
        <div className={`ml-2 sm:ml-3 border-l border-white/10 pl-2 sm:pl-3 relative mt-1.5 space-y-1.5 pb-0.5 ${activePath ? 'z-[9999]' : 'z-50'}`}>
          {item.subItems!.map((child, i) => (
            <div key={child.id} className={`relative ${activeMenuId && isMenuPath(child) ? 'z-[9999]' : 'z-10'}`}>
              <div className="absolute -left-2 sm:-left-3 top-4 w-2 sm:w-3 border-t border-white/10" />
              <TreeNode
                item={child}
                depth={depth + 1}
                index={i}
                expandedNodes={expandedNodes}
                toggleExpand={toggleExpand}
                activeMenuId={activeMenuId}
                setActiveMenuId={setActiveMenuId}
                handleAdd={handleAdd}
                handleDeleteNode={handleDeleteNode}
                setEditingNode={setEditingNode}
                toggleStatus={toggleStatus}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (isRoot) {
    return (
      <div className={`relative w-full md:w-1/2 pb-5 ${isRight
        ? 'md:ml-auto md:pl-5 pl-8 pr-2'
        : 'md:mr-auto md:pr-5 pl-8 md:pl-0 pr-2'
        } ${activePath ? 'z-[9999]' : 'z-10'}`}>
        {/* Connector Dot */}
        <div className={`absolute top-4 w-2 h-2 rounded-full bg-teal-400 z-20 transform -translate-y-1/2 
          left-4 -translate-x-[3px] 
          md:-translate-x-0 
          ${isRight ? 'md:left-[-4px] md:right-auto' : 'md:left-auto md:right-[-4px]'} 
        `} />
        {nodeContentJsx}
      </div>
    );
  }
  return nodeContentJsx;
};

// --- Main Layout Export ---
export default function RoadmapManager() {
  const { roadmaps, setRoadmaps, syntheticDeadlines, setSyntheticDeadline, isPlansOpen, togglePlans } = useDashboardStore();

  const [activeRoadmapId, setActiveRoadmapId] = useState<string>(roadmaps && roadmaps.length > 0 ? roadmaps[0].id : '');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [editingNode, setEditingNode] = useState<RoadmapItem | null>(null);

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isRoadmapSwitcherOpen, setIsRoadmapSwitcherOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'in-progress' | 'completed' | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartY(e.pageY - scrollRef.current.offsetTop);
    setScrollTop(scrollRef.current.scrollTop);
  };
  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const y = e.pageY - scrollRef.current.offsetTop;
    const walk = (y - startY) * 1.5;
    scrollRef.current.scrollTop = scrollTop - walk;
  };

  // If no roadmaps exist or active is broken, reset
  useEffect(() => {
    if (!roadmaps || roadmaps.length === 0) {
      const defaultRoadmap: Roadmap = {
        id: 'default-roadmap-id',
        name: 'My Personal Goals',
        nodes: []
      };
      setRoadmaps([defaultRoadmap]);
      setActiveRoadmapId(defaultRoadmap.id);
    } else if (!roadmaps.find(r => r.id === activeRoadmapId)) {
      setActiveRoadmapId(roadmaps[0].id);
    }
  }, [roadmaps, activeRoadmapId, setRoadmaps]);

  const syntheticRoadmap = React.useMemo(() => {
    if (!statusFilter) return null;
    
    const filterNodeByStatus = (node: RoadmapItem): RoadmapItem | null => {
      let newSubItems: RoadmapItem[] = [];
      let keep = node.status === statusFilter;

      if (node.subItems) {
        for (const child of node.subItems) {
          const filteredChild = filterNodeByStatus(child);
          if (filteredChild) {
            newSubItems.push(filteredChild);
            keep = true;
          }
        }
      }

      if (keep) {
        return { ...node, subItems: newSubItems.length > 0 ? newSubItems : undefined };
      }
      return null;
    };

    const syntheticNodes: RoadmapItem[] = [];
    roadmaps.forEach(r => {
      r.nodes.forEach(n => {
        const filtered = filterNodeByStatus(n);
        if (filtered) {
          syntheticNodes.push(filtered);
        }
      });
    });

    return {
      id: `synthetic-${statusFilter}`,
      name: `All ${statusFilter === 'pending' ? 'Pending' : statusFilter === 'in-progress' ? 'In Progress' : 'Completed'}`,
      targetDate: syntheticDeadlines?.[statusFilter] || undefined,
      nodes: syntheticNodes
    } as Roadmap;
  }, [statusFilter, roadmaps, syntheticDeadlines]);

  const activeRoadmap = syntheticRoadmap || roadmaps?.find(r => r.id === activeRoadmapId) || roadmaps?.[0];
  const daysLeft = activeRoadmap ? getFormattedTimeLeft(activeRoadmap.targetDate) : null;

  useEffect(() => {
    // Replaced document listener with container onClick to avoid React event bubbling conflicts
  }, []);

  if (!isPlansOpen) return null;
  if (!activeRoadmap) return null;

  const createNewRoadmap = () => {
    const name = prompt("Enter new roadmap name:");
    if (!name) return;
    const newRoadmap: Roadmap = { id: generateId(), name, nodes: [] };
    setRoadmaps([...roadmaps, newRoadmap]);
    setActiveRoadmapId(newRoadmap.id);
  };

  const deleteActiveRoadmap = () => {
    if (roadmaps.length === 1) return alert("You must have at least one roadmap.");
    const input = prompt(`Type "DELETE" to confirm removal of "${activeRoadmap.name}":`);
    if (input === "DELETE") {
      const filtered = roadmaps.filter(r => r.id !== activeRoadmapId);
      setRoadmaps(filtered);
      setActiveRoadmapId(filtered[0].id);
    }
  };

  const updateTargetDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (statusFilter) {
      setSyntheticDeadline(statusFilter, e.target.value);
    } else {
      setRoadmaps(roadmaps.map(r =>
        r.id === activeRoadmapId ? { ...r, targetDate: e.target.value } : r
      ));
    }
  };

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedNodes(newExpanded);
  };

  const updateActiveRoadmapNodes = (newNodes: RoadmapItem[]) => {
    if (statusFilter) return; // Disallow manual root-level changes to synthetic active roadmap directly
    setRoadmaps(roadmaps.map(r =>
      r.id === activeRoadmapId ? { ...r, nodes: newNodes } : r
    ));
  };

  const handleAdd = (parentId: string | null) => {
    if (statusFilter && !parentId) return; // Disallow adding root nodes in synthetic view
    const newNode: RoadmapItem = { id: generateId(), title: 'New Topic', status: 'pending', subItems: [] };
    if (!parentId) return updateActiveRoadmapNodes([...activeRoadmap.nodes, newNode]);

    const addGlobalNode = (nodes: RoadmapItem[]): RoadmapItem[] => {
      return nodes.map(node => {
        if (node.id === parentId) return { ...node, subItems: [...(node.subItems || []), newNode] };
        if (node.subItems) return { ...node, subItems: addGlobalNode(node.subItems) };
        return node;
      });
    };
    setRoadmaps(roadmaps.map(r => ({ ...r, nodes: addGlobalNode(r.nodes) })));
    setExpandedNodes(new Set([...expandedNodes, parentId]));
    setActiveMenuId(null);
  };

  const handleDeleteNode = (node: RoadmapItem) => {
    const input = prompt(`Type "DELETE" to remove "${node.title}":`);
    if (input !== "DELETE") return;

    const deleteGlobalNode = (nodes: RoadmapItem[]): RoadmapItem[] => {
      return nodes
        .filter(n => n.id !== node.id)
        .map(n => {
          if (n.subItems) return { ...n, subItems: deleteGlobalNode(n.subItems) };
          return n;
        });
    };
    setRoadmaps(roadmaps.map(r => ({ ...r, nodes: deleteGlobalNode(r.nodes) })));
    setActiveMenuId(null);
  };

  const handleSaveNode = (updatedItem: RoadmapItem) => {
    const updateGlobalTree = (nodes: RoadmapItem[]): RoadmapItem[] => {
      return nodes.map((node) => {
        if (node.id === updatedItem.id) return updatedItem;
        if (node.subItems) return { ...node, subItems: updateGlobalTree(node.subItems) };
        return node;
      });
    };
    setRoadmaps(roadmaps.map(r => ({ ...r, nodes: updateGlobalTree(r.nodes) })));
    setEditingNode(null);
  };

  const toggleStatus = (item: RoadmapItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus = item.status === 'pending' ? 'in-progress' : item.status === 'in-progress' ? 'completed' : 'pending';
    handleSaveNode({ ...item, status: nextStatus });
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-2 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300 pointer-events-auto text-white">
      <div className="absolute inset-0" onClick={togglePlans} />
      <div className="relative w-full max-w-5xl h-[80vh] flex flex-col rounded-2xl sm:rounded-3xl bg-[#0f172a] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300 border border-white/20 font-sans">

        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-white/10 flex justify-between items-center bg-black/40 shrink-0">
          <h1 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
            Roadmap Master
          </h1>
          <button
            onClick={togglePlans}
            className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-white/20"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div
          ref={scrollRef}
          className={`flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 flex flex-col items-center ${isDragging ? 'cursor-grabbing select-none' : ''}`}
          onClick={() => setActiveMenuId(null)}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {/* Legend */}
          <div className="w-full max-w-2xl flex justify-end mb-2 px-2">
            <div className="text-[10px] text-white/50 flex gap-3 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
              <span 
                onClick={() => setStatusFilter(statusFilter === 'pending' ? null : 'pending')} 
                className={`flex items-center gap-1 cursor-pointer hover:text-white transition-colors ${statusFilter === 'pending' ? 'text-white font-bold scale-110' : ''}`}
              >⚪ Pending</span>
              <span 
                onClick={() => setStatusFilter(statusFilter === 'in-progress' ? null : 'in-progress')} 
                className={`flex items-center gap-1 cursor-pointer hover:text-blue-400 transition-colors ${statusFilter === 'in-progress' ? 'text-blue-400 font-bold scale-110' : ''}`}
              >🔵 In Progress</span>
              <span 
                onClick={() => setStatusFilter(statusFilter === 'completed' ? null : 'completed')} 
                className={`flex items-center gap-1 cursor-pointer hover:text-green-400 transition-colors ${statusFilter === 'completed' ? 'text-green-400 font-bold scale-110' : ''}`}
              >✅ Completed</span>
            </div>
          </div>

          {/* Switcher Trigger */}
          <div className="w-full max-w-2xl flex justify-center mb-8">
            <button
              onClick={() => setIsRoadmapSwitcherOpen(true)}
              className="px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-medium flex items-center gap-2 transition-colors shadow-sm text-white"
            >
              <span>{activeRoadmap.name}</span>
              <span className="text-teal-400 bg-teal-400/10 rounded-full w-4 h-4 flex items-center justify-center text-[9px]">▼</span>
            </button>
          </div>

          {/* Switcher Overlay Modal */}
          {isRoadmapSwitcherOpen && (
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs"
              onClick={() => setIsRoadmapSwitcherOpen(false)}
            >
              <div
                className="bg-slate-800 border border-white/10 rounded-xl p-4 w-full max-w-xs shadow-xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-sm font-semibold text-white">Select Roadmap</h2>
                  <button onClick={() => setIsRoadmapSwitcherOpen(false)} className="text-white/40 hover:text-white text-xs">✕</button>
                </div>

                <div className="flex flex-col gap-1.5 max-h-[50vh] overflow-y-auto pr-0.5">
                  {roadmaps.map(r => (
                    <button
                      key={r.id}
                      onClick={() => { setActiveRoadmapId(r.id); setIsRoadmapSwitcherOpen(false); setStatusFilter(null); }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex justify-between items-center ${activeRoadmapId === r.id
                        ? 'bg-teal-500/10 border border-teal-500/30 text-teal-300'
                        : 'bg-white/5 text-white/80 hover:bg-white/10 border border-transparent'
                        }`}
                    >
                      {r.name}
                      {activeRoadmapId === r.id && <span className="text-teal-400 text-sm">✓</span>}
                    </button>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-white/5">
                  <button onClick={() => { createNewRoadmap(); setIsRoadmapSwitcherOpen(false); }} className="w-full px-3 py-2 rounded-lg text-xs font-medium bg-teal-600 hover:bg-teal-500 text-white transition-colors flex items-center justify-center gap-1">
                    <span>+</span> Create Roadmap
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Central Area Tree Container */}
          <div className="w-full max-w-2xl relative mt-4">

            {/* Tracker Deadline */}
            {statusFilter !== 'pending' && statusFilter !== 'completed' && (
              <div className="absolute top-[-38px] left-4 md:left-1/2 transform md:-translate-x-1/2 flex flex-row md:flex-col items-center md:items-center z-30">
                <div className="hidden md:block w-[1px] h-[14px] bg-teal-500 mt-0.5 order-2" />
                <div className="md:hidden w-[16px] h-[1px] bg-teal-500 order-1" />
                <div className="bg-slate-800 border border-teal-500 rounded-full px-2.5 py-1 shadow-md text-center flex flex-col relative w-[110px] hover:bg-slate-700 transition-colors order-2 md:order-1">
                  <span className="text-teal-400 font-semibold text-[10px] uppercase pointer-events-none relative z-0">
                    {daysLeft !== null ? `${daysLeft} Left` : 'Set Deadline'}
                  </span>
                  <input
                    type="date"
                    value={activeRoadmap.targetDate || ''}
                    onChange={updateTargetDate}
                    onClick={(e) => {
                      try {
                        if ('showPicker' in HTMLInputElement.prototype) {
                          e.currentTarget.showPicker();
                        }
                      } catch (err) { }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />
                </div>
              </div>
            )}

            {/* Dynamic Central Alignment Vector */}
            <div className="relative w-full">
              {/* Desktop Central Divider */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/10 transform -translate-x-1/2" />
              {/* Mobile Left-aligned Divider */}
              <div className="md:hidden absolute left-4 top-0 bottom-0 w-[1px] bg-white/10 transform -translate-x-1/2" />

              {activeRoadmap.nodes.map((node, index) => (
                <TreeNode
                  key={node.id}
                  item={node}
                  index={index}
                  depth={0}
                  expandedNodes={expandedNodes}
                  toggleExpand={toggleExpand}
                  activeMenuId={activeMenuId}
                  setActiveMenuId={setActiveMenuId}
                  handleAdd={handleAdd}
                  handleDeleteNode={handleDeleteNode}
                  setEditingNode={setEditingNode}
                  toggleStatus={toggleStatus}
                />
              ))}
            </div>

            {/* Add Main Item Action */}
            <div className="flex justify-center mt-4">
              <button onClick={() => handleAdd(null)} className="px-5 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-medium hover:bg-white/10 shadow-md flex items-center gap-2 transition-colors text-white">
                <span className="text-sm bg-teal-500 rounded-full w-4 h-4 flex items-center justify-center">+</span>
                Add Main Topic
              </button>
            </div>

            {/* Core Destruct Action */}
            <div className="flex justify-center mt-10 mb-4">
              <button onClick={deleteActiveRoadmap} className="px-3 py-1.5 text-[11px] text-red-500/50 hover:text-red-400 hover:bg-red-500/5 rounded-md transition-colors">
                Delete Entire Roadmap
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Minimal Node Editor Modal */}
      {editingNode && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-800 border border-white/10 rounded-xl p-4 w-full max-w-sm shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-white">Edit Topic</h2>
              <button onClick={() => setEditingNode(null)} className="text-white/40 hover:text-white text-xs">✕</button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-white/60 text-[11px] font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={editingNode.title}
                  onChange={(e) => setEditingNode({ ...editingNode, title: e.target.value })}
                  className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-teal-400 transition-colors"
                  placeholder="e.g., Learn Fundamentals"
                />
              </div>
              <div>
                <label className="block text-white/60 text-[11px] font-medium mb-1">Description (Optional)</label>
                <textarea
                  value={editingNode.description || ''}
                  onChange={(e) => setEditingNode({ ...editingNode, description: e.target.value })}
                  className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-xs text-white h-16 outline-none focus:border-teal-400 transition-colors resize-none"
                  placeholder="Add notes..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setEditingNode(null)} className="px-3 py-1.5 rounded-lg text-white/60 hover:bg-white/5 text-xs font-medium transition-colors">
                Cancel
              </button>
              <button onClick={() => handleSaveNode(editingNode)} className="px-3 py-1.5 bg-teal-600 rounded-lg text-white hover:bg-teal-500 text-xs font-medium transition-colors shadow-sm">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}