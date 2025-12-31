import React, { useState } from 'react';
import { Link2, CheckCircle2, Clock, ListTodo, Search, X, ChevronRight, Hash, RefreshCw, AlertTriangle, Trash2 } from 'lucide-react';
import type { AutomationCase } from '../App';
import clsx from 'clsx';

export type ChecklistItem = {
  id: string;
  item: string;
  department: string;
  assignee: string;
  testHistory: string;
  status: 'passed' | 'failed' | 'pending';
  linkedCaseId?: string;
};

interface ChecklistManagerProps {
  items: ChecklistItem[];
  availableCases: AutomationCase[];
  onLinkCase: (itemId: string, caseId: string) => void;
  onBack: () => void;
}

interface CaseDropdownProps {
  availableCases: AutomationCase[];
  linkedCaseId?: string;
  onSelect: (caseId: string) => void;
}

const CaseDropdown: React.FC<CaseDropdownProps> = ({ availableCases, linkedCaseId, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = availableCases
    .filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.id.includes(search))
    .sort((a, b) => a.id.localeCompare(b.id));

  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border shadow-sm min-w-[140px] justify-between",
          linkedCaseId 
            ? "bg-emerald-50 text-emerald-600 border-emerald-200 shadow-emerald-100" 
            : "bg-white text-gray-500 border-gray-200 hover:border-primary hover:text-primary"
        )}
      >
        <div className="flex items-center gap-2">
          <Link2 className="w-3.5 h-3.5" />
          <span>{linkedCaseId ? `已关联: ${linkedCaseId}` : '关联 Case'}</span>
        </div>
        <ChevronRight className={clsx("w-3.5 h-3.5 transition-transform", isOpen ? "rotate-90" : "")} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-3 border-b border-gray-50 bg-gray-50/50">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within:text-primary" />
              <input 
                autoFocus
                type="text" 
                placeholder="搜索 Case..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-xs text-gray-700 outline-none focus:border-primary transition-all shadow-inner"
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
            {filtered.length > 0 ? (
              filtered.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => {
                    onSelect(c.id);
                    setIsOpen(false);
                  }}
                  className={clsx(
                    "flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all group/item",
                    linkedCaseId === c.id ? "bg-primary/5 text-primary" : "hover:bg-gray-50"
                  )}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-700 group-hover/item:text-primary transition-colors">{c.name}</span>
                    <span className="text-[9px] text-gray-400 font-black uppercase">ID: {c.id}</span>
                  </div>
                  {linkedCaseId === c.id && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                未找到相关 Case
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const ChecklistManager: React.FC<ChecklistManagerProps> = ({ 
  items, availableCases, onLinkCase, onBack 
}) => {
  return (
    <div className="flex-1 flex flex-col bg-[#f8f9fa] overflow-hidden relative">
      {/* Header */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <ListTodo className="w-5 h-5 text-primary" />
          </div>
          <h1 className="font-bold text-gray-800 text-lg">Checklist 管理</h1>
        </div>
        <button 
          onClick={onBack}
          className="px-4 py-1.5 bg-primary text-white rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
        >
          返回 TestHub
        </button>
      </div>

      {/* Table Area */}
      <div className="flex-1 p-6 overflow-auto bg-gray-50/50">
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200">
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] w-1/3">Check Item</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Department</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Assignee</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Test history</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Operation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-black text-blue-500">CBT</span>
                      </div>
                      <span className="text-sm text-gray-700 font-semibold">{item.item}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-2.5 py-1 bg-blue-50/50 text-blue-600 border border-blue-100 rounded-md text-[10px] font-black uppercase tracking-wider">{item.department}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.assignee}`} alt="avatar" />
                      </div>
                      <span className="text-sm text-gray-600 font-medium">{item.assignee}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {item.testHistory}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className={clsx(
                      "flex items-center gap-1.5 font-bold",
                      item.status === 'passed' ? "text-emerald-500" : "text-amber-500"
                    )}>
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-xs uppercase tracking-wider">{item.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-4">
                      <button className="flex items-center gap-1.5 text-gray-500 hover:text-primary transition-colors">
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold">Re-test</span>
                      </button>
                      <button className="p-1 text-amber-500 hover:bg-amber-50 rounded transition-colors">
                        <AlertTriangle className="w-4 h-4 fill-current" />
                      </button>
                      
                      <div className="flex items-center gap-3">
                        <CaseDropdown 
                          availableCases={availableCases} 
                          linkedCaseId={item.linkedCaseId}
                          onSelect={(caseId) => onLinkCase(item.id, caseId)}
                        />
                        <button className="p-1 text-red-400 hover:bg-red-50 rounded transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

