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
    line: "城中冈垅无平地",
    explanation: "黄州城内山冈起伏，几乎没有平坦的道路。模型中可见地势高低错落。",
    source: "《初到黄州》",
    locationId: "hilly"
  },
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
    <div className="absolute inset-0 pointer-events-none p-8 flex flex-col justify-between z-10">
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
              <p className="text-[#8b3a3a] font-serif text-sm mt-1 tracking-widest">—— 寻迹《记承天寺夜游》</p>
            </div>
          </div>
          <p className="text-[#5c4d43] text-sm leading-relaxed font-serif text-justify font-medium">
            通过交互式3D地形，直观感受苏轼笔下的黄州地貌。定慧院地势低平，承天寺高居冈垄，其间有黄泥长坂相连。点击下方诗句可定位于相应景观。
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
        className="flex justify-between items-end"
      >
        <div className="flex gap-4 pointer-events-auto">
          {POEMS.map((poem, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ scale: 1.05 }}
              onClick={() => onPoemSelect?.(poem.locationId)}
              className="group relative bg-[#f5f0e6]/90 backdrop-blur-md px-4 py-6 rounded-sm border border-[#d4c4a8] shadow-lg hover:bg-[#fffdf8] hover:border-[#8b3a3a] transition-all cursor-pointer"
            >
              {/* Vertical Text for Poem */}
              <div className="font-serif text-[#4a3b32] text-xl font-bold tracking-[0.3em] group-hover:text-[#8b3a3a] transition-colors" style={{ writingMode: 'vertical-rl' }}>
                {poem.line}
              </div>
              
              {/* Tooltip */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onPoemSelect?.(poem.locationId);
                }}
                className="absolute bottom-full left-0 mb-4 w-52 p-4 bg-[#4a3b32] text-[#f5f0e6] text-xs rounded shadow-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-auto font-serif leading-relaxed border border-[#d4b88c]/30 z-20"
              >
                <div className="text-[#d4b88c] mb-2 font-bold border-b border-[#d4b88c]/30 pb-1">{poem.source}</div>
                {poem.explanation}
                <div className="mt-2 text-[#d4b88c] font-bold text-[10px] italic">点击前往此地</div>
                <div className="absolute -bottom-2 left-6 w-4 h-4 bg-[#4a3b32] rotate-45 border-r border-b border-[#d4b88c]/30" />
              </motion.div>
            </motion.div>
          ))}
        </div>
        
        <div className="flex flex-col items-end gap-2">
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
