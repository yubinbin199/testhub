import React from 'react';
import { ChevronsUpDown } from 'lucide-react';

interface ProjectHeaderProps {
  projectInfo: { appId: string; env: string; lang: string };
  setProjectInfo: (info: any) => void;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({ projectInfo, setProjectInfo }) => {
  return (
    <header className="h-16 bg-[#0d0d1a] border-b border-white/5 flex items-center justify-between px-6 z-30 shrink-0 shadow-lg">
      <div className="flex items-center gap-10">
        {/* 1. APP ID 选择器 */}
        <div className="relative group">
          <div className="flex items-center gap-3 bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl px-4 py-2.5 transition-all cursor-pointer min-w-[120px]">
            <div className="flex flex-col flex-1">
              <span className="text-base font-black text-white uppercase tracking-widest leading-none">{projectInfo.appId}</span>
            </div>
            
            <ChevronsUpDown className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
          </div>
          
          <select 
            value={projectInfo.appId}
            onChange={(e) => setProjectInfo({ ...projectInfo, appId: e.target.value })}
            className="absolute inset-0 opacity-0 cursor-pointer z-10"
          >
            <option value="hotd">hotd</option>
            <option value="ossan">ossan</option>
            <option value="kumo">kumo</option>
            <option value="shinchan">shinchan</option>
          </select>
        </div>
      </div>

      {/* 2. 右上角展示 TestHub 标题 */}
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-end">
          <span className="font-black text-lg tracking-[0.2em] text-white uppercase italic leading-none">TestHub</span>
          <span className="text-[9px] text-primary font-black uppercase tracking-widest mt-1 opacity-80">Automation Platform</span>
        </div>
      </div>
    </header>
  );
};
