import { motion } from 'motion/react';
import { Map as MapIcon, Compass } from 'lucide-react';

interface Poem {
  line: string;
  explanation: string;
  source: string;
  locationId: string;
}

const POEMS: Poem[] = [
  {
    line: "莫嫌荦确坡头路",
    explanation: "荦确（luò què）：形容石头多而险峻。指黄州多陡坡，道路崎岖不平。",
    source: "《赠潘谷》",
    locationId: "slope"
  },
  {
    line: "历黄泥之长坂",
    explanation: "黄泥坂是连接东坡与城区的一段长长的陡坡，苏轼常由此往返。",
    source: "《后赤壁赋》",
    locationId: "huangniban"
  },
  {
    line: "乱山环合水侵门",
    explanation: "黄州被丘陵环绕，长江水势浩大，直逼城门。模型西南可见长江水域。",
    source: "《正月二十日与潘郭二生出郊寻春》",
    locationId: "river"
  }
];

interface OverlayProps {
  onPoemSelect?: (id: string) => void;
}

export function Overlay({ onPoemSelect }: OverlayProps) {
  return (
    <div className="absolute inset-0 pointer-events-none p-12 flex flex-col justify-between z-10">
      {/* Header */}
      <div className="flex justify-between items-start">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="bg-[#f5f0e6]/90 backdrop-blur-md p-6 rounded-sm border border-[#d4c4a8] shadow-xl max-w-md pointer-events-auto"
        >
          <div className="flex items-center gap-3 mb-4 border-b border-[#d4c4a8] pb-4">
            <Compass className="text-[#8b3a3a]" size={28} />
            <div>
              <h1 className="text-3xl font-serif font-bold text-[#4a3b32] tracking-widest">东坡黄州山河志</h1>
              <p className="text-[#8b3a3a] font-serif text-sm mt-1 tracking-widest">—— 寻迹苏轼黄州诗文</p>
            </div>
          </div>
          <p className="text-[#5c4d43] text-sm leading-relaxed font-serif text-justify font-medium">
            通过交互式3D地形，直观感受苏轼笔下的黄州地势。点击下方的诗句卡片，视角将直接飞越山河，带您寻访诗文中的地理原点。
          </p>
        </motion.div>

        {/* Legend */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="bg-[#f5f0e6]/90 backdrop-blur-md p-4 rounded-sm border border-[#d4c4a8] shadow-xl pointer-events-auto"
        >
          <h3 className="text-[#4a3b32] font-serif font-bold mb-3 border-b border-[#d4c4a8] pb-2 text-sm">地形图例</h3>
          <div className="flex flex-col gap-3 text-[#5c4d43] text-xs font-serif font-medium">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-sm bg-[#5c8a6b] shadow-inner" />
              <span>平缓地带 (青绿)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-sm bg-[#a67c52] shadow-inner" />
              <span>高坡/山脊 (赭石)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-sm bg-[#3b6b7a] shadow-inner" />
              <span>长江水域</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer / Poems */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.4 }}
        className="flex justify-start items-end"
      >
        <div className="flex gap-10 pointer-events-auto items-end pb-4 ml-16">
          {POEMS.map((poem, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
              onClick={() => onPoemSelect?.(poem.locationId)}
              className="group relative bg-[#fdfaf5] backdrop-blur-md px-6 rounded-sm border border-[#d4c4a8] shadow-2xl hover:border-[#8b3a3a] transition-all cursor-pointer min-w-[110px] h-[260px] flex flex-col items-center justify-center"
            >
              {/* Traditional Chinese Index - Adds "rhythm" and elegance */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 font-serif text-[#8b3a3a] text-sm font-bold bg-[#fdfaf5] px-2 py-1 border border-[#d4c4a8] rounded-full z-10 shadow-sm">
                {['壹', '贰', '叁'][idx]}
              </div>

              {/* Vertical Text for Poem */}
              <div className="font-serif text-[#4a3b32] text-2xl font-bold tracking-[0.2em] group-hover:text-[#8b3a3a] transition-colors leading-relaxed" style={{ writingMode: 'vertical-rl' }}>
                {poem.line}
              </div>
              
              {/* Decorations inside card */}
              <div className="absolute left-2 top-8 bottom-8 w-[1px] bg-[#d4c4a8]/30" />
              <div className="absolute right-2 top-8 bottom-8 w-[1px] bg-[#d4c4a8]/30" />
              
              {/* Tooltip */}
              <motion.div 
                onClick={(e) => {
                  e.stopPropagation();
                  onPoemSelect?.(poem.locationId);
                }}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-8 w-64 p-6 bg-gradient-to-br from-[#544439] to-[#3d2b1f] text-[#f5f0e6] text-xs rounded shadow-[0_25px_60px_rgba(0,0,0,0.6)] opacity-0 translate-y-4 scale-90 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 transition-all duration-400 ease-out pointer-events-auto font-serif leading-relaxed border border-[#d4b88c]/20 z-20"
              >
                <div className="text-[#d4b88c] mb-3 font-bold border-b border-[#d4b88c]/20 pb-2 text-sm tracking-widest">{poem.source}</div>
                <p className="text-justify text-xs opacity-90 leading-loose">{poem.explanation}</p>
                <div className="mt-4 pt-3 border-t border-[#d4b88c]/10 text-[#d4b88c] font-bold text-[10px] italic flex items-center justify-between">
                  <span>点击前往此地</span>
                  <MapIcon size={10} />
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#3d2b1f] rotate-45 border-r border-b border-[#d4b88c]/20" />
              </motion.div>
            </motion.div>
          ))}
        </div>
        
        <div className="absolute right-8 bottom-8 flex flex-col items-end gap-3">
          <div className="flex items-center gap-3 text-[#5c4d43] text-xs font-serif bg-[#f5f0e6]/80 px-4 py-2 rounded-sm border border-[#d4c4a8] pointer-events-auto">
            <Compass className="animate-spin-slow text-[#8b3a3a]" size={14} />
            <span>定慧院 (低) → 承天寺 (高)</span>
          </div>
          <div className="flex items-center gap-3 text-[#5c4d43] text-xs font-serif bg-[#f5f0e6]/80 px-4 py-2 rounded-sm border border-[#d4c4a8] pointer-events-auto">
            <MapIcon size={14} />
            <span>左旋视 / 滚缩 / 悬浮测坡</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
