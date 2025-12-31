import React, { useState, useEffect } from 'react';
import { ChevronRight, RefreshCw, Download, CloudUpload, Loader2, Check, XCircle, Edit3 } from 'lucide-react';
import clsx from 'clsx';

// PRD 5.2 定义的 6 个固定步骤
const VALIDATION_STEPS = [
  { id: 1, name: '创角' },
  { id: 2, name: '完成第一个任务' },
  { id: 3, name: '升级' },
  { id: 4, name: '支付' },
  { id: 5, name: '刷新' },
  { id: 6, name: '切换服' }
];

interface ValidationCenterProps {
  currentStep: number;
  isCompleted: boolean;
  selectedName: string;
  onNameChange: (newName: string) => void;
  onSkip: () => void;
}

export const ValidationCenter: React.FC<ValidationCenterProps> = ({ 
  currentStep, 
  isCompleted, 
  selectedName, 
  onNameChange,
  onSkip
}) => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState<'content' | 'log' | 'network' | 'performance' | 'report'>('content');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(selectedName);

  useEffect(() => {
    setTempName(selectedName);
  }, [selectedName]);

  const handleUpload = () => {
    setUploadStatus('uploading');
    setTimeout(() => {
      setUploadStatus('success');
      setTimeout(() => setUploadStatus('idle'), 2000);
    }, 1500);
  };

  const saveName = () => {
    onNameChange(tempName);
    setIsEditingName(false);
  };

  const mockEvents = [
    { id: '1', name: 'g_login', time: '10:45:01', status: 'success', data: { account: 'test_01', type: 'login' } },
    { id: '2', name: 'g_character_create', time: '10:45:15', status: 'success', data: { role: 'warrior', id: 'char_88' } },
    { id: '3', name: 'g_click', time: '10:46:22', status: 'success', data: { target: 'btn_pay', amount: 648 } },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      
      {/* 5.2 校验流程进度条 (PRD 5.2) */}
      <div className="bg-black/20 border-b border-white/10 p-5 shrink-0">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-4 group">
            {isEditingName ? (
              <div className="flex items-center gap-3">
                <input 
                  autoFocus
                  type="text" 
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onBlur={saveName}
                  onKeyDown={(e) => e.key === 'Enter' && saveName()}
                  className="bg-white/5 border border-primary/50 rounded-xl px-3 py-1.5 text-xs font-black uppercase tracking-widest text-white outline-none w-64 shadow-inner"
                />
              </div>
            ) : (
              <div 
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setIsEditingName(true)}
              >
                <span className="text-xs font-black uppercase tracking-[0.2em] text-white/70">{selectedName}</span>
                <Edit3 className="w-4 h-4 text-white/40 group-hover:text-primary transition-colors" />
              </div>
            )}
          </div>
          <div className="flex gap-3 min-h-[32px]">
             {isCompleted && (
               <>
                 <button className="flex items-center gap-2 px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-black uppercase tracking-widest transition-all border border-white/10 text-white">
                    <Download className="w-4 h-4" /> 导出报告
                 </button>
                 <button 
                    onClick={handleUpload}
                    disabled={uploadStatus === 'uploading'}
                    className={clsx(
                      "flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all border border-white/10",
                      uploadStatus === 'idle' && "bg-primary/20 text-primary hover:bg-primary/30 border-primary/20",
                      uploadStatus === 'uploading' && "bg-white/5 text-white/40 cursor-not-allowed",
                      uploadStatus === 'success' && "bg-success/20 text-success border-success/20",
                      uploadStatus === 'error' && "bg-danger/20 text-danger border-danger/20"
                    )}
                 >
                    {uploadStatus === 'idle' && <><CloudUpload className="w-4 h-4" /> 上传报告</>}
                    {uploadStatus === 'uploading' && <><Loader2 className="w-4 h-4 animate-spin" /> 上传中...</>}
                    {uploadStatus === 'success' && <><Check className="w-4 h-4" /> 上传成功</>}
                    {uploadStatus === 'error' && <><XCircle className="w-4 h-4" /> 上传失败</>}
                 </button>
               </>
             )}
          </div>
        </div>
        <div className="flex gap-3">
          {VALIDATION_STEPS.map((step) => (
            <div key={step.id} className="flex-1 relative group">
              <div className={clsx(
                "h-2 rounded-full mb-3 transition-all duration-500 shadow-[0_0_10px_rgba(0,0,0,0.3)]",
                (step.id < currentStep || isCompleted) ? "bg-success shadow-[0_0_15px_rgba(16,185,129,0.3)]" : 
                step.id === currentStep ? "bg-primary animate-pulse shadow-[0_0_15px_rgba(124,58,237,0.5)]" : 
                "bg-white/10"
              )} />
              
              {/* Skip 按钮 */}
              {step.id === currentStep && !isCompleted && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onSkip();
                  }}
                  className="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary hover:brightness-110 text-white text-[10px] rounded-lg border border-primary/20 transition-all uppercase font-black tracking-widest z-10 shadow-lg shadow-primary/20"
                >
                  Skip
                </button>
              )}

              <div className={clsx(
                "text-[11px] font-black text-center truncate uppercase tracking-tighter transition-colors",
                (step.id > 0 && step.id <= currentStep) || isCompleted ? "text-white" : "text-white/30"
              )}>
                {step.id}. {step.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5.3.2 埋点展示区 (PRD 5.3.2) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* 左侧：实时事件列表 - 缩小宽度以展示更多右侧内容 */}
        <div className="w-56 border-r border-white/10 flex flex-col bg-[#1a1b2e]">
          <div className="p-4 border-b border-white/10 bg-black/10 flex justify-between items-center shrink-0">
            <span className="text-[11px] font-black text-white/60 uppercase tracking-widest">实时捕获</span>
            <RefreshCw className="w-4 h-4 text-white/40 animate-spin-slow" />
          </div>
          <div className="flex-1 overflow-y-auto">
            {mockEvents.map(event => (
              <div key={event.id} className="p-3 border-b border-white/5 hover:bg-white/10 cursor-pointer group transition-all">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                    <span className="text-[12px] font-bold text-white truncate max-w-[120px]">{event.name}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-white/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                <div className="text-[10px] text-white/60 font-mono flex justify-between">
                  <span>{event.time}</span>
                  <span className="text-success font-black opacity-80">OK</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 右侧：打点内容 + 更多数据 */}
        <div className="flex-1 flex flex-col bg-[#0f101a] overflow-hidden">
          <div className="flex bg-[#1a1b2e] border-b border-white/10 shrink-0 px-1 py-1.5 gap-1 text-nowrap">
             <button 
                onClick={() => setActiveTab('content')}
                className={clsx(
                  "flex-1 flex items-center justify-center py-2 rounded-md text-[11px] font-black uppercase tracking-tight transition-all border",
                  activeTab === 'content' ? "bg-primary/10 text-primary border-primary/30 shadow-sm" : "text-white/50 hover:text-white hover:bg-white/5 border-transparent"
                )}
             >
                打点内容
             </button>
             <button 
                onClick={() => setActiveTab('log')}
                className={clsx(
                  "flex-1 flex items-center justify-center py-2 rounded-md text-[11px] font-black uppercase tracking-tight transition-all border",
                  activeTab === 'log' ? "bg-primary/10 text-primary border-primary/30 shadow-sm" : "text-white/50 hover:text-white hover:bg-white/5 border-transparent"
                )}
             >
                日志回溯
             </button>
             <button 
                onClick={() => setActiveTab('network')}
                className={clsx(
                  "flex-1 flex items-center justify-center py-2 rounded-md text-[11px] font-black uppercase tracking-tight transition-all border",
                  activeTab === 'network' ? "bg-primary/10 text-primary border-primary/30 shadow-sm" : "text-white/50 hover:text-white hover:bg-white/5 border-transparent"
                )}
             >
                网络分析
             </button>
             <button 
                onClick={() => setActiveTab('performance')}
                className={clsx(
                  "flex-1 flex items-center justify-center py-2 rounded-md text-[11px] font-black uppercase tracking-tight transition-all border",
                  activeTab === 'performance' ? "bg-primary/10 text-primary border-primary/30 shadow-sm" : "text-white/50 hover:text-white hover:bg-white/5 border-transparent"
                )}
             >
                性能管理
             </button>
             <button 
                onClick={() => setActiveTab('report')}
                className={clsx(
                  "flex-1 flex items-center justify-center py-2 rounded-md text-[11px] font-black uppercase tracking-tight transition-all border",
                  activeTab === 'report' ? "bg-primary/10 text-primary border-primary/30 shadow-sm" : "text-white/50 hover:text-white hover:bg-white/5 border-transparent"
                )}
             >
                报告管理
             </button>
          </div>
          <div className="flex-1 overflow-auto p-5 font-mono text-[12px] leading-relaxed text-green-400 custom-scrollbar">
            {activeTab === 'content' && (
              <>
                <div className="mb-4 text-white/40 italic">// Captured Event Payload</div>
                <pre className="bg-black/20 p-5 rounded-xl border border-white/10 shadow-inner leading-relaxed">
                  {JSON.stringify(mockEvents[2].data, null, 2)}
                </pre>
              </>
            )}
            {activeTab !== 'content' && (
              <div className="h-full flex flex-col items-center justify-center text-white/30">
                <Loader2 className="w-10 h-10 animate-spin mb-5 opacity-20" />
                <span className="uppercase tracking-[0.2em] font-black italic text-sm">Loading {activeTab} Data...</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
