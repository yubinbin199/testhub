import React from 'react';
import { Maximize } from 'lucide-react';
import type { ModuleMode } from '../App';
import clsx from 'clsx';

interface GameTerminalProps {
  mode?: ModuleMode;
  onGameClick?: () => void;
  className?: string; // 支持外部传入布局类名
  isRecording?: boolean;
  setIsRecording?: (recording: boolean) => void;
}

export const GameTerminal: React.FC<GameTerminalProps> = ({ onGameClick, className, isRecording, setIsRecording }) => {
  const [deviceType] = React.useState<'mobile' | 'desktop'>('mobile');

  return (
    <div className={clsx(
      "bg-black flex flex-col relative overflow-hidden group min-w-0", 
      className
    )}>
      
      {/* 游戏主体画面 */}
      <div 
        className="flex-1 overflow-hidden flex flex-col items-center justify-center p-4 bg-[radial-gradient(circle_at_center,_#1a1b3d_0%,_#05050a_100%)] cursor-pointer active:brightness-90 transition-all"
        onClick={() => onGameClick?.()}
      >
        <div className={clsx(
          "transition-all duration-500 bg-gray-900 rounded-2xl border-[6px] border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)] relative overflow-hidden",
          deviceType === 'mobile' ? "w-[320px] h-[560px]" : "w-[460px] h-[345px]"
        )}>
           <img 
             src={deviceType === 'mobile' ? "/input_file_0.png" : "/input_file_1.png"} 
             alt="Game Screen" 
             className="w-full h-full object-cover"
           />
           
           <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-colors"></div>
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-700">
              <div className="w-24 h-24 rounded-full border-2 border-primary/40 animate-ping"></div>
           </div>
        </div>
      </div>

      {/* 全局比例切换 */}
      <div className="absolute right-4 bottom-24 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
         <button className="p-2 bg-black/60 border border-white/10 rounded-full text-white/40 hover:text-white shadow-xl backdrop-blur-md">
            <Maximize className="w-4 h-4" />
         </button>
      </div>

      {/* 底部操作区 */}
      <div className="bg-[#0d0d1a] border-t border-white/10 p-4 shrink-0 flex justify-center items-center">
        <button 
          onClick={() => setIsRecording?.(!isRecording)}
          className={clsx(
            "px-10 py-3 rounded-xl font-black uppercase tracking-widest text-sm flex items-center gap-3 transition-all active:scale-95 shadow-lg",
            isRecording 
              ? "bg-danger text-white shadow-danger/20 hover:brightness-110" 
              : "bg-primary text-white shadow-primary/20 hover:brightness-110"
          )}
        >
          <div className={clsx("w-2 h-2 rounded-full", isRecording ? "bg-white animate-ping" : "bg-white/40")}></div>
          {isRecording ? '结束录制' : '开启录制'}
        </button>
      </div>
    </div>
  );
};
