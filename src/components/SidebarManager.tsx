import React, { useState } from 'react';
import { History, List, Plus, Search, CloudUpload, Play, Trash2, X, ChevronRight, ChevronDown, Copy, Check, Loader2, Gamepad2, Edit2, Link2 } from 'lucide-react';
import type { ModuleMode, AutomationCase } from '../App';
import clsx from 'clsx';

export type HistoryItem = {
  id: string;
  name: string;
  date: string;
  status: 'pass' | 'fail';
  isNew: boolean;
  currentStep: number;
  isCompleted: boolean;
};

interface SidebarManagerProps {
  mode: ModuleMode;
  projectInfo: { appId: string; env: string; lang: string };
  history: HistoryItem[];
  setHistory: React.Dispatch<React.SetStateAction<HistoryItem[]>>;
  selectedId: string;
  setSelectedId: (id: string) => void;
  autoCases: AutomationCase[];
  setAutoCases: React.Dispatch<React.SetStateAction<AutomationCase[]>>;
  selectedCaseId: string | null;
  setSelectedCaseId: (id: string | null) => void;
  onRunSingle?: (id: string) => Promise<'pass' | 'fail'>;
  onGoToChecklist?: () => void;
}

const LANGUAGES = [
  { label: '繁体中文', value: 'tw' }, { label: '日语', value: 'jp' }, { label: '韩语', value: 'kr' }, { label: '英语', value: 'en' }, { label: '法语', value: 'fr' }, { label: '德语', value: 'de' }, { label: '意大利语', value: 'it' }, { label: '荷兰语', value: 'nl' }, { label: '印尼语', value: 'id' }, { label: '泰语', value: 'th' }, { label: '越南语', value: 'vi' }, { label: '葡萄牙语', value: 'pt' }, { label: '丹麦语', value: 'da' }, { label: '瑞典语', value: 'sv' }, { label: '土耳其语', value: 'tr' }
];

const REGIONS = [
  { flag: '🌍', name: '当前地区', code: '' }, { flag: '🇯🇵', name: '日本', code: 'JP' }, { flag: '🇰🇷', name: '韩国', code: 'KR' }, { flag: '🇺🇸', name: '美国', code: 'US' }, { flag: '🇹🇼', name: '台湾', code: 'TW' }, { flag: '🇫🇷', name: '法国', code: 'FR' }, { flag: '🇮🇳', name: '印度', code: 'IN' }, { flag: '🇮🇩', name: '印尼', code: 'ID' }, { flag: '🇸🇬', name: '新加坡', code: 'SG' }, { flag: '🇭🇰', name: '香港', code: 'HK' }, { flag: '🇮🇷', name: '伊朗', code: 'IR' }, { flag: '🇦🇺', name: '澳洲', code: 'AU' }, { flag: '🇬🇷', name: '希腊', code: 'GR' }, { flag: '🇫🇮', name: '芬兰', code: 'FI' }, { flag: '🇵🇭', name: '菲律宾', code: 'PH' },
];

export const SidebarManager: React.FC<SidebarManagerProps> = ({ 
  mode, projectInfo, history, setHistory, selectedId, setSelectedId, autoCases, setAutoCases, selectedCaseId, setSelectedCaseId, onRunSingle, onGoToChecklist
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showAddCaseModal, setShowAddCaseModal] = useState(false);
  const [editingCaseId, setEditingCaseId] = useState<string | null>(null);
  const [addCaseMode, setAddCaseMode] = useState<'manual' | 'cloud'>('manual');
  
  const [newCaseName, setNewCaseName] = useState('');
  const [newCaseData, setNewCaseData] = useState({ env: 'stg', lang: 'jp' });
  const [selectedCloudCaseId, setSelectedCloudCaseId] = useState<string | null>(null);
  const [cloudSearchQuery, setCloudSearchQuery] = useState('');
  const [deletingCaseId, setDeletingCaseId] = useState<string | null>(null);

  const mockCloudCases = [
    { id: '9901', name: 'Cloud_Login_Flow', env: 'pro', lang: 'en', nodes: 12 },
    { id: '9902', name: 'Cloud_Shop_Purchase', env: 'stg', lang: 'jp', nodes: 8 },
    { id: '9903', name: 'Cloud_Daily_Quest', env: 'pro', lang: 'kr', nodes: 15 },
    { id: '9904', name: 'Cloud_Inventory_Sync', env: 'stg', lang: 'en', nodes: 20 },
    { id: '9905', name: 'Cloud_Battle_System', env: 'pro', lang: 'jp', nodes: 25 },
  ];

  const filteredCloudCases = mockCloudCases.filter(c => 
    c.name.toLowerCase().includes(cloudSearchQuery.toLowerCase())
  );
  
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [uploadStatusMap, setUploadStatusMap] = useState<Record<string, 'idle' | 'uploading' | 'success'>>({});
  
  const [formData, setFormData] = useState({ env: 'stg', lang: 'jp', region: '日本' });

  const handleSingleUpload = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setUploadStatusMap(prev => ({ ...prev, [id]: 'uploading' }));
    setTimeout(() => {
      setUploadStatusMap(prev => ({ ...prev, [id]: 'success' }));
      setTimeout(() => setUploadStatusMap(prev => ({ ...prev, [id]: 'idle' })), 2000);
    }, 1500);
  };

  const handleCreateNew = () => {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const datePrefix = `${projectInfo.appId}-${formData.env}-${formData.lang}-${month}${day}`;
    const todayCount = history.filter(h => h.name.startsWith(datePrefix)).length + 1;
    const countStr = String(todayCount).padStart(3, '0');
    const nameStr = `${datePrefix}-${countStr}`;
    const newId = Date.now().toString();
    const newEntry: HistoryItem = { id: newId, name: nameStr, date: `${month}-${day} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`, status: 'pass', isNew: true, currentStep: 0, isCompleted: false };
    setHistory([newEntry, ...history]);
    setSelectedId(newId);
    setShowModal(false);
  };

  const handleOpenAddModal = () => {
    setEditingCaseId(null);
    setAddCaseMode('manual');
    setNewCaseName('');
    setNewCaseData({ env: 'stg', lang: 'jp' });
    setSelectedCloudCaseId(null);
    setShowAddCaseModal(true);
  };

  const handleOpenEditModal = (e: React.MouseEvent, item: AutomationCase) => {
    e.stopPropagation();
    setEditingCaseId(item.id);
    setAddCaseMode('manual');
    setNewCaseName(item.name);
    setShowAddCaseModal(true);
  };

  const handleSaveCase = () => {
    if (addCaseMode === 'manual') {
      if (!newCaseName.trim()) return;

      if (editingCaseId) {
        setAutoCases(prev => prev.map(c => 
          c.id === editingCaseId ? { ...c, name: newCaseName } : c
        ));
      } else {
        const newCase: AutomationCase = { 
          id: `${Math.floor(1000 + Math.random() * 9000)}`, 
          name: newCaseName, 
          nodes: 0, 
          lastRun: '未执行', 
          isReady: false 
        };
        setAutoCases([newCase, ...autoCases]);
        setSelectedCaseId(newCase.id);
      }
    } else {
      if (!selectedCloudCaseId) return;
      const cloudCase = mockCloudCases.find(c => c.id === selectedCloudCaseId);
      if (cloudCase) {
        const newCase: AutomationCase = {
          id: cloudCase.id,
          name: cloudCase.name,
          nodes: cloudCase.nodes,
          lastRun: '来自云端',
          isReady: true
        };
        if (!autoCases.find(c => c.id === cloudCase.id)) {
          setAutoCases([newCase, ...autoCases]);
        }
        setSelectedCaseId(newCase.id);
      }
    }
    
    setNewCaseName('');
    setShowAddCaseModal(false);
    setEditingCaseId(null);
    setSelectedCloudCaseId(null);
  };

  const copyToClipboard = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteCase = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingCaseId(id);
  };

  const confirmDelete = () => {
    if (deletingCaseId) {
      const newCases = autoCases.filter(item => item.id !== deletingCaseId);
      setAutoCases(newCases);
      if (selectedCaseId === deletingCaseId) setSelectedCaseId(newCases.length > 0 ? newCases[0].id : null);
      setDeletingCaseId(null);
    }
  };

  return (
    <aside className="w-72 bg-[#0d0d1a] border-r border-white/5 flex flex-col shrink-0 relative overflow-hidden">
      {/* 操作区置顶 */}
      <div className="p-4 bg-black/40 border-b border-white/10 shrink-0">
        <button 
          onClick={() => mode === 'validation' ? setShowModal(true) : handleOpenAddModal()} 
          className="w-full py-2.5 bg-primary text-white hover:brightness-110 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20 active:scale-95 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> {mode === 'validation' ? '新建打点' : '添加 Case'}
        </button>
      </div>

      {/* 搜索区域 */}
      <div className="p-4 border-b border-white/5 flex items-center gap-4 bg-black/20 shrink-0 overflow-hidden">
        <div className="flex items-center gap-2 shrink-0">
          {mode === 'validation' ? <History className="w-5 h-5 text-primary" /> : <List className="w-5 h-5 text-primary" />}
          <span className="text-sm font-black uppercase tracking-widest text-white whitespace-nowrap">
            {mode === 'validation' ? '校验历史' : 'Case 列表'}
          </span>
        </div>

        <div className="flex-1 bg-black/40 rounded-lg flex items-center px-3 py-1.5 border border-white/20 group focus-within:border-primary transition-all min-w-0">
          <Search className="w-3.5 h-3.5 text-white/70 mr-2 shrink-0" />
          <input 
            type="text" 
            placeholder={mode === 'validation' ? "搜索历史..." : "搜索 Case..."} 
            className="bg-transparent border-none outline-none text-[12px] text-white w-full placeholder:text-white/50 min-w-0" 
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-[#1a1b2e] custom-scrollbar">
        {mode === 'validation' ? (
          history.map(item => (
            <div key={item.id} onClick={() => setSelectedId(item.id)} className={clsx(
              "p-4 rounded-lg border transition-all cursor-pointer group shadow-sm relative overflow-hidden",
              selectedId === item.id 
                ? "bg-primary/20 border-primary ring-1 ring-primary shadow-[0_0_20px_rgba(93,95,239,0.2)]" 
                : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20"
            )}>
              {selectedId === item.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[2px_0_10px_rgba(93,95,239,0.5)]"></div>
              )}
              
              <div className="flex justify-between items-start mb-2">
                <span className={clsx(
                  "text-sm font-bold truncate pr-14 transition-colors", 
                  selectedId === item.id ? "text-white" : "text-white/80"
                )}>{item.name}</span>
                <div className="flex items-center gap-2 absolute right-4 top-4">{(item.isCompleted || (!item.isNew && !item.isCompleted)) && <span className={clsx("text-[11px] font-black px-2 py-0.5 rounded-sm uppercase", item.status === 'pass' ? "bg-success/20 text-success" : "bg-danger/20 text-danger")}>{item.status === 'pass' ? 'PASS' : 'FAIL'}</span>}<button onClick={(e) => {e.stopPropagation(); setHistory(h => h.filter(i => i.id !== item.id));}} className="p-1.5 text-white/40 hover:text-danger hover:bg-danger/10 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button></div>
              </div>
              <div className="flex justify-between items-center text-[11px] text-white/60 font-mono"><span>{item.date}</span></div>
            </div>
          ))
        ) : (
          autoCases.map(item => (
            <div key={item.id} onClick={() => setSelectedCaseId(item.id)} className={clsx(
              "p-4 rounded-lg border transition-all cursor-pointer group shadow-sm relative overflow-hidden",
              selectedCaseId === item.id 
                ? "bg-primary/20 border-primary ring-1 ring-primary shadow-[0_0_20px_rgba(93,95,239,0.2)]" 
                : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20"
            )}>
              {selectedCaseId === item.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[2px_0_10px_rgba(93,95,239,0.5)]"></div>
              )}
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col gap-1 min-w-0">
                  <span className={clsx(
                    "text-sm font-bold truncate transition-colors", 
                    selectedCaseId === item.id ? "text-white" : "text-white/80"
                  )}>{item.name}</span>
                  <span onClick={(e) => copyToClipboard(e, item.id)} className="flex items-center gap-1.5 text-[10px] text-white/50 hover:text-primary transition-colors cursor-pointer group/id">
                    <div className="w-1 h-1 rounded-full bg-primary/60 group-hover/id:bg-primary transition-colors"></div>
                    ID: {item.id}
                    {copiedId === item.id ? (
                      <Check className="w-3 h-3 text-success animate-in zoom-in" />
                    ) : (
                      <Copy className="w-3 h-3 text-white/30 group-hover/id:text-primary transition-colors" />
                    )}
                  </span>
                  {item.linkedChecklistId && (
                    <div 
                      onClick={(e) => { e.stopPropagation(); onGoToChecklist?.(); }}
                      className="mt-1 flex items-center gap-1 px-1.5 py-0.5 bg-success/10 border border-success/20 rounded text-[9px] text-success font-black uppercase tracking-tighter hover:bg-success/20 transition-all cursor-pointer w-fit"
                    >
                      <Link2 className="w-2.5 h-2.5" />
                      已关联 Checklist
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                   {item.status && <span className={clsx("text-[9px] font-black px-1.5 py-0.5 rounded-sm uppercase flex items-center gap-1", item.status === 'pass' && "bg-success/20 text-success", item.status === 'fail' && "bg-danger/20 text-danger", item.status === 'running' && "bg-primary/20 text-primary animate-pulse")}>{item.status === 'running' && <Loader2 className="w-2.5 h-2.5 animate-spin" />}{item.status}</span>}
                   <button 
                     onClick={(e) => handleDeleteCase(e, item.id)} 
                     title="删除 Case"
                     className="p-1.5 text-white/20 hover:text-danger hover:bg-danger/10 rounded-lg transition-all"
                   >
                     <Trash2 className="w-3.5 h-3.5" />
                   </button>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2 pt-3 border-t border-white/5">
                <button onClick={(e) => handleOpenEditModal(e, item)} className="flex-1 py-1.5 bg-white/10 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors border border-white/10 flex items-center justify-center gap-2">
                  <Edit2 className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">编辑</span>
                </button>

                <button 
                  onClick={(e) => { e.stopPropagation(); if (item.status !== 'running' && item.nodes > 0) onRunSingle?.(item.id); }} 
                  disabled={item.status === 'running' || item.nodes === 0}
                  className={clsx(
                    "flex-1 py-2 rounded-lg transition-all border flex items-center justify-center gap-2 shadow-lg active:scale-95",
                    (item.status === 'running' || item.nodes === 0)
                      ? "bg-white/5 text-white/20 border-white/5 cursor-not-allowed shadow-none" 
                      : "bg-primary text-white border-primary shadow-primary/20 hover:brightness-110"
                  )}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span className="text-[10px] font-black uppercase tracking-widest">执行</span>
                </button>
                
                <button 
                  onClick={(e) => handleSingleUpload(e, item.id)} 
                  className={clsx(
                    "flex-[1.5] py-1.5 rounded-lg border transition-all flex items-center justify-center gap-2 group/cloud", 
                    uploadStatusMap[item.id] === 'success' ? "text-success bg-success/10 border-success/20" : "text-white bg-white/10 border-white/10 hover:bg-white/20 hover:text-primary"
                  )}
                >
                  {uploadStatusMap[item.id] === 'uploading' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CloudUpload className="w-3.5 h-3.5 transition-transform group-hover/cloud:-translate-y-0.5" />}
                  <span className="text-[10px] font-black tracking-wider uppercase">{uploadStatusMap[item.id] === 'success' ? '已同步' : '上传云端'}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {deletingCaseId && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1e202e] w-full rounded-2xl border border-white/10 shadow-2xl p-6 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
            <div className="w-14 h-14 bg-danger/10 rounded-full flex items-center justify-center mb-4 border border-danger/20">
              <Trash2 className="w-7 h-7 text-danger" />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2">确认删除 Case？</h3>
            <p className="text-[11px] text-white/40 font-bold leading-relaxed mb-6">
              您正在尝试删除 ID 为 <span className="text-white/80">#{deletingCaseId}</span> 的测试用例。<br/>此操作不可撤销。
            </p>
            <div className="flex flex-col w-full gap-2">
              <button 
                onClick={confirmDelete}
                className="w-full py-3 bg-danger hover:brightness-110 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-danger/20 active:scale-95 transition-all"
              >
                确定删除
              </button>
              <button 
                onClick={() => setDeletingCaseId(null)}
                className="w-full py-3 bg-white/5 hover:bg-white/10 text-white/60 text-xs font-black uppercase tracking-widest rounded-xl transition-all"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="absolute inset-0 z-50 flex flex-col p-3 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-[#1e202e] w-full rounded-2xl border border-white/20 shadow-2xl flex flex-col animate-in slide-in-from-top-4 duration-300 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/10 flex justify-between items-center bg-black/40"><h2 className="text-xs font-black uppercase tracking-widest text-primary">新建打点任务</h2><button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-white/5 rounded-lg text-white/60 hover:text-white transition-colors"><X className="w-4.5 h-4.5" /></button></div>
            <div className="p-5 space-y-5 bg-[#1e202e]"><div className="space-y-2"><label className="text-[11px] font-black uppercase tracking-widest text-white/60">运行环境 (ENV)</label><div className="relative"><select value={formData.env} onChange={(e) => setFormData({ ...formData, env: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white appearance-none outline-none focus:border-primary transition-all cursor-pointer shadow-inner"><option value="stg">STG (Testing)</option><option value="pro">PRO (Production)</option></select><ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" /></div></div><div className="space-y-2"><label className="text-[11px] font-black uppercase tracking-widest text-white/60">选择语言 (LANG)</label><div className="relative"><select value={formData.lang} onChange={(e) => setFormData({ ...formData, lang: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white appearance-none outline-none focus:border-primary transition-all cursor-pointer shadow-inner">{LANGUAGES.map(lang => <option key={lang.value} value={lang.value}>{lang.label}</option>)}</select><ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" /></div></div><div className="space-y-2"><label className="text-[11px] font-black uppercase tracking-widest text-white/60">测试地区/币种 (REGION)</label><div className="relative"><select value={formData.region} onChange={(e) => setFormData({ ...formData, region: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white appearance-none outline-none focus:border-primary transition-all cursor-pointer shadow-inner">{REGIONS.map(reg => <option key={reg.name} value={reg.name}>{reg.flag} {reg.name} {reg.code && `(${reg.code})`}</option>)}</select><ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" /></div></div><button onClick={handleCreateNew} className="w-full py-4 bg-primary hover:brightness-110 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 mt-4 active:scale-95">确认并开启任务 <ChevronRight className="w-4 h-4" /></button></div>
          </div>
        </div>
      )}

      {showAddCaseModal && (
        <div className="absolute inset-0 z-50 flex flex-col p-3 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-[#1e202e] w-full rounded-2xl border border-white/20 shadow-2xl flex flex-col animate-in slide-in-from-top-4 duration-300 overflow-hidden">
            <div className="px-5 py-5 border-b border-white/10 flex justify-between items-center bg-black/40">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">
                {editingCaseId ? '编辑 Case' : '添加新 Case'}
              </h2>
              <button onClick={() => setShowAddCaseModal(false)} className="p-1.5 hover:bg-white/5 rounded-lg text-white/60 hover:text-white transition-colors">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            
            <div className="p-5 space-y-5 bg-[#1e202e]">
              {!editingCaseId && (
                <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                  <button 
                    onClick={() => setAddCaseMode('manual')}
                    className={clsx(
                      "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                      addCaseMode === 'manual' ? "bg-primary text-white shadow-lg" : "text-white/40 hover:text-white/60"
                    )}
                  >
                    手动新建
                  </button>
                  <button 
                    onClick={() => setAddCaseMode('cloud')}
                    className={clsx(
                      "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                      addCaseMode === 'cloud' ? "bg-primary text-white shadow-lg" : "text-white/40 hover:text-white/60"
                    )}
                  >
                    从云端导入
                  </button>
                </div>
              )}

              {addCaseMode === 'manual' ? (
                <>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-white/60">Case 名称</label>
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="请输入 Case 名称..." 
                      value={newCaseName} 
                      onChange={(e) => setNewCaseName(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary transition-all shadow-inner"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-white/60">Case 游戏</label>
                    <div className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm text-white/40 flex items-center gap-2 cursor-not-allowed">
                      <Gamepad2 className="w-4 h-4" />
                      <span className="font-bold uppercase tracking-wider">{projectInfo.appId}</span>
                      <span className="text-[10px] ml-auto opacity-50">(不可更改)</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-white/60">运行环境</label>
                    <div className="relative">
                      <select 
                        value={newCaseData.env} 
                        onChange={(e) => setNewCaseData({ ...newCaseData, env: e.target.value })} 
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white appearance-none outline-none focus:border-primary transition-all cursor-pointer shadow-inner"
                      >
                        <option value="stg">STG (Testing)</option>
                        <option value="pro">PRO (Production)</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-white/60">选择语言</label>
                    <div className="relative">
                      <select 
                        value={newCaseData.lang} 
                        onChange={(e) => setNewCaseData({ ...newCaseData, lang: e.target.value })} 
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white appearance-none outline-none focus:border-primary transition-all cursor-pointer shadow-inner"
                      >
                        {LANGUAGES.map(lang => (
                          <option key={lang.value} value={lang.value}>{lang.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-black uppercase tracking-widest text-white/60">选择云端 Case</label>
                      <span className="text-[10px] text-primary/60 font-bold">{filteredCloudCases.length} 个结果</span>
                    </div>
                    
                    <div className="bg-black/40 rounded-xl flex items-center px-3 py-2 border border-white/10 group focus-within:border-primary transition-all shadow-inner">
                      <Search className="w-3.5 h-3.5 text-white/30 mr-2 shrink-0" />
                      <input 
                        type="text" 
                        placeholder="搜索云端 Case..." 
                        value={cloudSearchQuery}
                        onChange={(e) => setCloudSearchQuery(e.target.value)}
                        className="bg-transparent border-none outline-none text-[12px] text-white w-full placeholder:text-white/20 min-w-0" 
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-2 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
                      {filteredCloudCases.length > 0 ? (
                        filteredCloudCases.map(c => (
                          <div 
                            key={c.id} 
                            onClick={() => setSelectedCloudCaseId(c.id)}
                            className={clsx(
                              "p-3 rounded-xl border transition-all cursor-pointer flex justify-between items-center group/cloud-item",
                              selectedCloudCaseId === c.id ? "bg-primary/20 border-primary shadow-lg" : "bg-black/20 border-white/5 hover:border-white/20"
                            )}
                          >
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm font-bold text-white">{c.name}</span>
                              <div className="flex items-center gap-2 text-[10px] text-white/40">
                                <span className="uppercase">{c.env}</span>
                                <span className="w-1 h-1 rounded-full bg-white/20"></span>
                                <span className="uppercase">{c.lang}</span>
                                <span className="w-1 h-1 rounded-full bg-white/20"></span>
                                <span>{c.nodes} 节点</span>
                              </div>
                            </div>
                            {selectedCloudCaseId === c.id && <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(93,95,239,0.8)]"></div>}
                          </div>
                        ))
                      ) : (
                        <div className="py-10 text-center space-y-2 opacity-20">
                          <Search className="w-8 h-8 mx-auto" />
                          <p className="text-[11px] font-black uppercase tracking-widest">未找到相关 Case</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <button 
                onClick={handleSaveCase} 
                className="w-full py-4 bg-primary hover:brightness-110 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 mt-4 active:scale-95"
              >
                {editingCaseId ? '保存修改' : addCaseMode === 'manual' ? '确认创建 Case' : '导入选中的 Case'} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
