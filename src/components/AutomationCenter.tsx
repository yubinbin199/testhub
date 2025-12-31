import React, { useState } from 'react';
import { FlowEditor } from './FlowEditor';
import { Terminal, Database, Code } from 'lucide-react';
import { ReactFlowProvider, type Node, type Edge } from 'reactflow';
import clsx from 'clsx';

interface AutomationCenterProps {
  selectedCaseId: string | null;
  selectedCaseName: string;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
  triggerNodeAdd: number;
  executingNodeIndex: number | null;
  caseFlows: Record<string, { nodes: Node[], edges: Edge[] }>;
  onUpdateCaseFlow: (caseId: string, nodes: Node[], edges: Edge[]) => void;
}

export const AutomationCenter: React.FC<AutomationCenterProps> = ({ 
  selectedCaseId, selectedCaseName, isRecording, triggerNodeAdd, executingNodeIndex, caseFlows, onUpdateCaseFlow 
}) => {
  const [activeTab, setActiveTab] = useState<'logs' | 'response'>('logs');

  // 监听执行状态，执行结束后自动切换到 Response 标签
  React.useEffect(() => {
    if (executingNodeIndex !== null) {
      // 开始执行时，确保切回日志标签
      setActiveTab('logs');
    }
  }, [executingNodeIndex]);

  // 使用一个状态来记录上一次的执行索引，从而判断是否执行完成
  const [wasExecuting, setWasExecuting] = React.useState(false);
  React.useEffect(() => {
    if (executingNodeIndex !== null) {
      setWasExecuting(true);
    } else if (wasExecuting) {
      // 从正在执行变为不再执行，说明执行结束了
      setActiveTab('response');
      setWasExecuting(false);
    }
  }, [executingNodeIndex, wasExecuting]);

  const mockResponse = {
    status: "success",
    timestamp: "2025-12-25T10:45:07Z",
    case_id: selectedCaseId,
    execution_time: "4.2s",
    steps: [
      { id: "node-setup", result: "ok", env: "stg", lang: "ja" },
      { id: "node-rec-1", result: "ok", target: "IMG_291", duration: "1.2s" }
    ]
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      <div className="flex-1 relative">
        {/* 主要工作区 */}
        <div className="absolute inset-0">
          {!selectedCaseId ? (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[1px]">
              <div className="p-8 rounded-3xl bg-[#1e202e] border border-white/5 shadow-2xl flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                  <Database className="w-8 h-8 text-primary animate-pulse" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-black text-white uppercase tracking-[0.2em]">待命中 (Standby)</h3>
                  <p className="text-xs text-white/40 font-bold max-w-[200px] leading-relaxed">请在左侧点击或创建一个 Case <br/> 以开始自动化流程编辑</p>
                </div>
              </div>
            </div>
          ) : (
            <ReactFlowProvider>
              <div className="w-full h-full">
                <FlowEditor 
                  selectedCaseId={selectedCaseId} 
                  selectedCaseName={selectedCaseName}
                  isRecording={isRecording}
                  triggerNodeAdd={triggerNodeAdd}
                  executingNodeIndex={executingNodeIndex}
                  initialData={caseFlows[selectedCaseId]}
                  onSave={(nodes, edges) => onUpdateCaseFlow(selectedCaseId, nodes, edges)}
                />
              </div>
            </ReactFlowProvider>
          )}
        </div>
      </div>

      <div className="h-56 bg-[#1a1b2e] border-t border-white/10 flex flex-col shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
        <div className="px-4 border-b border-white/5 flex items-center justify-between bg-black/20 shrink-0">
           <div className="flex gap-4">
              <button onClick={() => setActiveTab('logs')} className={clsx("py-3 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border-b-2", activeTab === 'logs' ? "text-primary border-primary" : "text-white/40 border-transparent hover:text-white/60")}><Terminal className="w-4 h-4" /> 执行日志</button>
              <button onClick={() => setActiveTab('response')} className={clsx("py-3 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border-b-2", activeTab === 'response' ? "text-primary border-primary" : "text-white/40 border-transparent hover:text-white/60")}><Code className="w-4 h-4" /> Response</button>
           </div>
           <div className="flex items-center gap-4">
              {executingNodeIndex !== null && <div className="text-[10px] text-success font-black flex items-center gap-2 uppercase tracking-tighter"><Loader2 className="w-3 h-3 animate-spin" /> Node {executingNodeIndex + 1} Executing...</div>}
           </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 font-mono text-[13px] leading-relaxed custom-scrollbar">
           {!selectedCaseId ? <div className="text-white/20 italic">Waiting for case selection...</div> : activeTab === 'logs' ? <div className="space-y-1.5"><div className="flex gap-3 text-white/40"><span className="shrink-0">[10:45:01]</span> <span className="text-white/60">Initializing automation engine...</span></div>{executingNodeIndex !== null ? <div className="flex gap-3 text-success font-bold animate-in fade-in slide-in-from-left-2"><span className="opacity-50 shrink-0">[{new Date().toLocaleTimeString()}]</span> <span>Executing Node {executingNodeIndex + 1}... Visual matching in progress.</span></div> : <div className="flex gap-3 text-white/40"><span className="shrink-0">[10:45:03]</span> <span className="text-white/60">Automation engine standby. Ready for execution.</span></div>}</div> : <pre className="text-green-400 text-[12px] bg-black/20 p-3 rounded-lg border border-white/5">{JSON.stringify(mockResponse, null, 2)}</pre>}
        </div>
      </div>
    </div>
  );
};

const Loader2 = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={className} strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);
