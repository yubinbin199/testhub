import React, { useCallback, useEffect } from 'react';
import ReactFlow, { 
  Background, useNodesState, useEdgesState, addEdge, Handle, Position, useReactFlow,
  MiniMap,
  type Node, type NodeProps, type Connection, type Edge 
} from 'reactflow';
import 'reactflow/dist/style.css';
import { MousePointer2, RefreshCw, Plus, CheckCircle2, GitBranch } from 'lucide-react';
import clsx from 'clsx';

// --- 自定义节点定义 ---

const SetupNode: React.FC<NodeProps> = ({ data }) => {
  return (
    <div className={clsx(
      "px-2 py-1.5 shadow-xl rounded-lg border-2 transition-all duration-500 min-w-[100px] relative",
      data.isExecuting ? "bg-success/20 border-success shadow-[0_0_15px_rgba(16,185,129,0.4)]" : 
      data.isRecording ? "bg-primary/20 border-primary animate-[pulse_2s_infinite] shadow-[0_0_10px_rgba(93,95,239,0.3)]" : "bg-[#1e202e] border-white/20"
    )}>
      <div className="space-y-1 relative z-10">
        <div className="flex items-center gap-1.5 mb-0.5">
          <div className="px-1 py-0.5 bg-primary/20 rounded border border-white/30 flex items-center justify-center">
            <span className="text-[7px] font-black text-primary uppercase leading-none">CASE</span>
          </div>
          <div className="text-[9px] font-black uppercase tracking-widest text-white truncate max-w-[70px]">
            {data.label || '游戏启动'}
          </div>
          {data.isExecuting && <CheckCircle2 className="w-2.5 h-2.5 text-success ml-auto animate-in zoom-in" />}
        </div>
      </div>
      <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 z-20 scale-90">
        <Handle type="source" position={Position.Right} className="!relative !right-0 !translate-y-0 w-1 h-1 bg-white border border-white shadow-none" />
        <button onClick={() => data.onInsertAfter('node-setup')} title="插入步骤" className="w-3 h-3 bg-white rounded-sm flex items-center justify-center shadow-sm border border-white/20 hover:bg-primary/5 transition-colors">
          <Plus className="w-2 h-2 text-primary" />
        </button>
        <button onClick={() => data.onAddBranch('node-setup')} title="开启分支" className="w-3 h-3 bg-primary rounded-sm flex items-center justify-center shadow-sm border border-white/20 hover:brightness-110 transition-all">
          <GitBranch className="w-2 h-2 text-white" />
        </button>
      </div>
    </div>
  );
};

const ImageActionNode: React.FC<NodeProps> = ({ id, data }) => (
  <div className={clsx("px-0.5 py-0.5 shadow-lg rounded-md border transition-all duration-500 relative", data.isExecuting ? "bg-success/20 border-success shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-110" : "bg-primary border-white/30")}>
    <div className="px-1 py-0.5 border-b border-white/10 flex items-center justify-center relative">
       <div className="absolute -top-1.5 -left-1.5 flex gap-0.5"><div className="w-3.5 h-3.5 rounded-full bg-danger border border-white flex items-center justify-center shadow-md cursor-pointer"><X className="w-2 h-2 text-white" /></div><div className="w-3.5 h-3.5 rounded-full bg-success border border-white flex items-center justify-center shadow-md cursor-pointer"><RefreshCw className="w-2 h-2 text-white" /></div></div>
       <span className="text-[8px] font-black text-white uppercase tracking-wider flex items-center gap-1">{data.isExecuting && <Loader2 className="w-2 h-2 animate-spin" />}点击图片</span>
       {data.isExecuted && <CheckCircle2 className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 text-success bg-white rounded-full border border-success/20 shadow-lg" />}
    </div>
    <div className="relative w-12 h-12 rounded-sm overflow-hidden m-1 bg-black/20 border border-white/5"><img src={`https://api.dicebear.com/7.x/shapes/svg?seed=${data.label}&backgroundColor=ffffff`} alt="Captured UI" className="w-full h-full object-cover" /></div>
    <div className="px-1 py-0.5 flex items-center justify-between"><div className="flex items-center gap-1"><MousePointer2 className="w-2 h-2 text-white/60" /><span className="text-[7px] font-mono text-white/40 truncate max-w-[30px]">{data.label}</span></div></div>
    <Handle type="target" position={Position.Left} className="w-1.5 h-1.5 bg-white border border-white" /><div className="absolute -right-1.5 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 z-20 scale-90"><Handle type="source" position={Position.Right} className="!relative !right-0 !translate-y-0 w-1 h-1 bg-white border border-white shadow-none" /><button onClick={() => data.onInsertAfter(id)} title="插入步骤" className="w-3 h-3 bg-white rounded-sm flex items-center justify-center shadow-sm border border-white/20 hover:bg-primary/5 transition-colors"><Plus className="w-2 h-2 text-primary" /></button><button onClick={() => data.onAddBranch(id)} title="开启分支" className="w-3 h-3 bg-primary rounded-sm flex items-center justify-center shadow-sm border border-white/20 hover:brightness-110 transition-all"><GitBranch className="w-2 h-2 text-white" /></button></div>
  </div>
);

const nodeTypes = { setup: SetupNode, action: ImageActionNode };

interface FlowEditorProps {
  selectedCaseId: string | null;
  selectedCaseName: string;
  isRecording: boolean;
  triggerNodeAdd: number;
  executingNodeIndex: number | null;
  initialData?: { nodes: Node[], edges: Edge[] };
  onSave: (nodes: Node[], edges: Edge[]) => void;
}

export const FlowEditor: React.FC<FlowEditorProps> = ({ 
  selectedCaseId, selectedCaseName, isRecording, triggerNodeAdd, executingNodeIndex, initialData, onSave 
}) => {
  const { fitView } = useReactFlow();

  const handleAddBranch = useCallback((fromId: string) => {
    const newNodeId = `node-branch-${Date.now()}`;
    setNodes((nds) => {
      const sourceNode = nds.find(n => n.id === fromId);
      if (!sourceNode) return nds;
      const newNode: Node = { id: newNodeId, type: 'action', position: { x: sourceNode.position.x + 120, y: sourceNode.position.y + 100 }, data: { label: `BRANCH_${Math.floor(Math.random() * 1000)}`, onInsertAfter: handleInsert, onAddBranch: handleAddBranch } };
      setEdges((eds) => eds.concat({ id: `edge-${fromId}-${newNodeId}`, source: fromId, target: newNodeId, animated: false, style: { stroke: '#5d5fef', strokeWidth: 2 } }));
      return nds.concat(newNode);
    });
  }, [fitView]);

  const handleInsert = useCallback((afterId: string) => {
    const newNodeId = `node-insert-${Date.now()}`;
    setNodes((nds) => {
      const sourceNode = nds.find(n => n.id === afterId);
      if (!sourceNode) return nds;
      const newNode: Node = { id: newNodeId, type: 'action', position: { x: sourceNode.position.x + 120, y: sourceNode.position.y }, data: { label: `INSERT_${Math.floor(Math.random() * 1000)}`, onInsertAfter: handleInsert, onAddBranch: handleAddBranch } };
      setEdges((eds) => {
        const outEdge = eds.find(e => e.source === afterId && !e.id.includes('branch'));
        let newEds = eds.concat({ id: `edge-${afterId}-${newNodeId}`, source: afterId, target: newNodeId, animated: false, style: { stroke: '#5d5fef', strokeWidth: 2 } });
        if (outEdge) newEds = newEds.map(e => e.id === outEdge.id ? { ...e, id: `edge-${newNodeId}-${e.target}`, source: newNodeId } : e);
        return newEds;
      });
      return nds.concat(newNode).map(n => { if (n.id !== newNodeId && n.id !== afterId && n.position.x >= sourceNode.position.x + 120) return { ...n, position: { ...n.position, x: n.position.x + 120 } }; return n; });
    });
  }, [fitView, handleAddBranch]);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // 保存数据
  useEffect(() => {
    if (nodes.length > 0) onSave(nodes, edges);
  }, [nodes, edges]);

  // 加载数据
  useEffect(() => {
    if (initialData) {
      setNodes(initialData.nodes);
      setEdges(initialData.edges);
    } else {
      setNodes([{ id: 'node-setup', type: 'setup', position: { x: 50, y: 150 }, data: { isRecording: false, onInsertAfter: handleInsert, onAddBranch: handleAddBranch } }]);
      setEdges([]);
    }
  }, [selectedCaseId]);

  // 同步执行和录制状态到节点
  useEffect(() => {
    setNodes(nds => nds.map((n, i) => {
      const isSetupNode = n.id === 'node-setup';
      return { 
        ...n, 
        data: { 
          ...n.data, 
          label: isSetupNode ? selectedCaseName : n.data.label,
          isRecording, 
          isExecuting: executingNodeIndex === i, 
          isExecuted: executingNodeIndex !== null && i < executingNodeIndex, 
          onInsertAfter: handleInsert, 
          onAddBranch: handleAddBranch
        } 
      };
    }));
    if (executingNodeIndex !== null && nodes[executingNodeIndex]) fitView({ nodes: [{ id: nodes[executingNodeIndex].id }], duration: 600, padding: 0.5 });
  }, [executingNodeIndex, isRecording, selectedCaseName]);

  useEffect(() => {
    if (triggerNodeAdd > 0) {
      const newNodeId = `node-rec-${Date.now()}`;
      setNodes((nds) => {
        const lastNode = nds[nds.length - 1];
        const newNode: Node = { id: newNodeId, type: 'action', position: { x: lastNode.position.x + 120, y: lastNode.position.y }, data: { label: `REC_${Math.floor(Math.random() * 1000)}`, onInsertAfter: handleInsert, onAddBranch: handleAddBranch } };
                setEdges((eds) => eds.concat({ id: `edge-${lastNode.id}-${newNodeId}`, source: lastNode.id, target: newNodeId, animated: false, style: { stroke: '#5d5fef', strokeWidth: 2 } }));
        return nds.concat(newNode);
      });
      setTimeout(() => fitView({ nodes: [{ id: newNodeId }], duration: 800, padding: 0.5 }), 50);
    }
  }, [triggerNodeAdd]);

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <div className="w-full h-full bg-[#0d0d1a] relative group/editor">
      <ReactFlow 
        nodes={nodes} 
        edges={edges} 
        onNodesChange={onNodesChange} 
        onEdgesChange={onEdgesChange} 
        onConnect={onConnect} 
        nodeTypes={nodeTypes} 
        fitView 
        fitViewOptions={{ padding: 0.5 }} 
        style={{ width: '100%', height: '100%' }} 
        className="selection:bg-primary/20"
        edgesUpdatable={false}
        edgesFocusable={false}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
      >
        <Background color="rgba(255,255,255,0.03)" gap={20} size={1} />
        <MiniMap 
          nodeColor={(node) => {
            if (node.type === 'setup') return '#10b981'; // 绿色表示启动
            return '#5d5fef'; // 蓝色表示动作
          }}
          maskColor="rgba(255, 255, 255, 0.1)"
          className="!bg-white/10 !border !border-white/20 !rounded-lg !shadow-2xl backdrop-blur-md"
          style={{ 
            width: 140, 
            height: 90,
            bottom: 20,
            right: 20
          }}
        />
      </ReactFlow>
    </div>
  );
};

const X = ({ className }: { className?: string }) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={className}><path d="M18 6L6 18M6 6l12 12" /></svg>);
const Loader2 = ({ className }: { className?: string }) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={className} strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>);
