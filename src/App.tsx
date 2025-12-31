import { useState, useCallback } from 'react';
import { ProjectHeader } from './components/ProjectHeader';
import { SidebarManager, type HistoryItem } from './components/SidebarManager';
import { ValidationCenter } from './components/ValidationCenter';
import { AutomationCenter } from './components/AutomationCenter';
import { GameTerminal } from './components/GameTerminal';
import { ChecklistManager, type ChecklistItem } from './components/ChecklistManager';
import type { Node, Edge } from 'reactflow';

// 定义主要的功能模块类型
export type ModuleMode = 'validation' | 'automation' | 'checklist';

export type AutomationCase = {
  id: string;
  name: string;
  nodes: number;
  lastRun: string;
  isReady: boolean;
  status?: 'pass' | 'fail' | 'running'; // 执行状态
  linkedChecklistId?: string; // 关联的 checklist ID
};

function App() {
  // 核心状态：当前处于哪个模块（默认展示自动化测试）
  const [mode, setMode] = useState<ModuleMode>('automation');
  
  // Checklist 状态
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([
    { id: 'cli_01', item: '公共主机漏洞扫描/游戏运行容器镜像扫描', department: 'Tech', assignee: '陈国', testHistory: '12/23 17:48', status: 'passed', linkedCaseId: '1605' },
    { id: 'cli_02', item: '虚拟机/POD 安全配置检查', department: 'Tech', assignee: '陈国', testHistory: '12/23 17:48', status: 'passed' },
    { id: 'cli_03', item: '游戏对外接口安全测试/安全扫描', department: 'Tech', assignee: '陈国', testHistory: '12/23 17:48', status: 'passed' },
    { id: 'cli_04', item: '正式环境控制台日志禁止中文', department: 'Tech', assignee: '陈国', testHistory: '12/23 17:48', status: 'passed' },
  ]);

  // 关联 Case 到 Checklist 的逻辑
  const handleLinkCaseToChecklist = (itemId: string, caseId: string) => {
    setChecklistItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, linkedCaseId: caseId } : item
    ));
    
    setAutoCases(prev => prev.map(c => 
      c.id === caseId ? { ...c, linkedChecklistId: itemId } : c
    ));
  };
  
  // 校验历史状态提升至 App 层
  const [history, setHistory] = useState<HistoryItem[]>([
    { id: '1', name: 'hotd-stg-ja-1225-001', date: '12-25 10:45', status: 'pass', isNew: true, currentStep: 0, isCompleted: false },
  ]);
  const [selectedId, setSelectedId] = useState<string>('1');

  // 自动化 Case 列表，默认展示一个 Case
  const [autoCases, setAutoCases] = useState<AutomationCase[]>([
    {
      id: '1605',
      name: 'case001',
      nodes: 0,
      lastRun: '-',
      isReady: false,
      linkedChecklistId: 'cli_01'
    }
  ]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>('1605');
  const [isRecording, setIsRecording] = useState(false); // 录制状态
  const [triggerNodeAdd, setTriggerNodeAdd] = useState(0); // 用于触发子组件添加节点
  
  const [executingNodeIndex, setExecutingNodeIndex] = useState<number | null>(null); // 当前正在执行的节点索引

  // 持久化存储每个 Case 的流程数据
  const [caseFlows, setCaseFlows] = useState<Record<string, { nodes: Node[], edges: Edge[] }>>({});

  // 更新指定 Case 的流程数据
  const updateCaseFlow = useCallback((caseId: string, nodes: Node[], edges: Edge[]) => {
    setCaseFlows(prev => ({
      ...prev,
      [caseId]: { nodes, edges }
    }));
  }, []);

  // 项目级状态
  const [projectInfo, setProjectInfo] = useState({
    appId: 'hotd',
    env: 'Staging',
    lang: '日本語 (ja)'
  });

  // 获取当前选中的校验项
  const selectedItem = history.find(h => h.id === selectedId);

  const advanceStep = useCallback(() => {
    if (mode === 'validation' && selectedItem && selectedItem.currentStep < 6) {
      const nextStep = selectedItem.currentStep + 1;
      setHistory(prev => prev.map(item => 
        item.id === selectedId 
          ? { ...item, currentStep: nextStep, isCompleted: nextStep === 6 } 
          : item
      ));
    }
  }, [mode, selectedItem, selectedId]);

  const updateHistoryName = (id: string, newName: string) => {
    setHistory(prev => prev.map(item => item.id === id ? { ...item, name: newName } : item));
  };

  // 执行单个 Case 的逻辑
  const runSingleCase = async (caseId: string) => {
    setAutoCases(prev => prev.map(c => c.id === caseId ? { ...c, status: 'running' } : c));
    setSelectedCaseId(caseId);

    const targetCase = autoCases.find(c => c.id === caseId);
    if (!targetCase) return 'fail';

    for (let i = 0; i < targetCase.nodes; i++) {
      setExecutingNodeIndex(i);
      await new Promise(resolve => setTimeout(resolve, 1200));
    }
    
    setExecutingNodeIndex(null);

    const finalStatus = Math.random() > 0.1 ? ('pass' as const) : ('fail' as const);
    setAutoCases(prev => prev.map(c => c.id === caseId ? { ...c, status: finalStatus, lastRun: '刚刚' } : c));
    return finalStatus;
  };

  // 处理游戏点击逻辑
  const handleGameClick = useCallback(() => {
    if (mode === 'validation') {
      advanceStep();
    } else if (mode === 'automation' && isRecording) {
      let targetId = selectedCaseId;
      
      // 如果处于录制模式但未选中 Case，自动尝试选中第一个 Case
      if (!targetId && autoCases.length > 0) {
        targetId = autoCases[0].id;
        setSelectedCaseId(targetId);
      }

      if (targetId) {
        setAutoCases(prev => prev.map(c => 
          c.id === targetId 
            ? { ...c, nodes: (c.nodes || 0) + 1, isReady: true } 
            : c
        ));
        setTriggerNodeAdd(prev => prev + 1);
      }
    }
  }, [mode, isRecording, selectedCaseId, autoCases, advanceStep]);

  return (
    // 统一界面容器
    <div className="h-screen w-screen flex flex-col bg-background text-text font-sans selection:bg-primary/30 overflow-hidden">
      
      {mode !== 'checklist' && (
        <ProjectHeader 
          projectInfo={projectInfo} 
          setProjectInfo={setProjectInfo} 
        />
      )}
      
      <div className="flex-1 flex overflow-hidden">
        
        {mode === 'checklist' ? (
          <ChecklistManager 
            items={checklistItems} 
            availableCases={autoCases}
            onLinkCase={handleLinkCaseToChecklist}
            onBack={() => setMode('automation')}
          />
        ) : (
          <>
            {/* 左侧：Case 列表 */}
            <SidebarManager 
              mode={mode} 
              projectInfo={projectInfo}
              history={history}
              setHistory={setHistory}
              selectedId={selectedId}
              setSelectedId={setSelectedId}
              autoCases={autoCases}
              setAutoCases={setAutoCases}
              selectedCaseId={selectedCaseId}
              setSelectedCaseId={setSelectedCaseId}
              onRunSingle={runSingleCase}
              onGoToChecklist={() => setMode('checklist')}
            />
            
            {/* 中间：游戏画面 (PRD: 游戏画面换到中间) */}
            <GameTerminal 
              mode={mode} 
              onGameClick={handleGameClick} 
              className="flex-1 border-x border-white/10"
              isRecording={isRecording}
              setIsRecording={setIsRecording}
            />
            
            {/* 右侧：工作区/流程编辑 (PRD: 中间画面换到右边) */}
            <main className="w-[600px] flex flex-col shrink-0 bg-panel/30 overflow-hidden">
              {mode === 'validation' ? (
                <ValidationCenter 
                  currentStep={selectedItem?.currentStep || 0} 
                  isCompleted={selectedItem?.isCompleted || false}
                  selectedName={selectedItem?.name || ''}
                  onNameChange={(newName) => updateHistoryName(selectedId, newName)}
                  onSkip={advanceStep}
                />
              ) : (
                <AutomationCenter 
                  selectedCaseId={selectedCaseId} 
                  selectedCaseName={autoCases.find(c => c.id === selectedCaseId)?.name || ''}
                  isRecording={isRecording}
                  setIsRecording={setIsRecording}
                  triggerNodeAdd={triggerNodeAdd}
                  executingNodeIndex={executingNodeIndex}
                  caseFlows={caseFlows}
                  onUpdateCaseFlow={updateCaseFlow}
                />
              )}
            </main>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
