import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Upload, UserCheck, Play, Trash2, List as ListIcon, Settings, Languages, RotateCcw, Sparkles, CheckCircle2, Edit3, X, Maximize, Minimize } from 'lucide-react';
import confetti from 'canvas-confetti';

type Language = 'en' | 'zh-TW';

const translations = {
  'en': {
    title: 'Classroom Picker',
    toggleSettings: 'Toggle Settings',
    list: (count: number) => `List (${count})`,
    clear: 'Clear',
    placeholder: 'Enter names, one per line...',
    disclaimer: '* Modifying names replaces the current state.',
    importFile: 'Import File',
    setList: 'Set List',
    lucky: 'LUCKY!',
    awaiting: 'Awaiting students...',
    draw: 'DRAW!',
    done: 'DONE!',
    reset: 'Restart Round',
    clickToSelect: 'Click to randomly select a lucky student',
    drawnList: 'Drawn List',
    noStudents: 'No students drawn',
    next: '(Next)',
    progress: (drawn: number, total: number) => `Progress: ${drawn} / ${total} Students`,
    resetConfirm: 'Round reset successfully!',
    clearConfirm: 'List cleared successfully!',
    loadExample: 'Load Example',
    exampleList: 'Alice\nBob\nCharlie\nDiana\nEthan\nFiona\nGeorge\nHannah\nIan\nJulia\nKevin\nLuna',
    editList: 'Edit List',
    closeList: 'Close Panel',
    fullscreen: 'Fullscreen',
    exitFullscreen: 'Exit Fullscreen',
    switchLangText: 'EN'
  },
  'zh-TW': {
    title: '課堂隨機抽籤',
    toggleSettings: '切換設定',
    list: (count: number) => `學生名單 (${count})`,
    clear: '清空',
    placeholder: '請輸入名字，每行一個...',
    disclaimer: '* 修改名單將替換目前狀態',
    importFile: '匯入名單',
    setList: '設定名單',
    lucky: 'LUCKY!',
    awaiting: '等待加入學生...',
    draw: '點我抽籤！',
    done: '抽籤結束！',
    reset: '重置本回合 (名單放回籤筒)',
    clickToSelect: '點擊按鈕隨機挑選一位幸運同學',
    drawnList: '已抽中名單',
    noStudents: '尚未抽出任何學生',
    next: '(待抽)',
    progress: (drawn: number, total: number) => `進度：${drawn} / ${total} 位同學`,
    resetConfirm: '回合已重置！',
    clearConfirm: '名單已清空！',
    loadExample: '載入範例',
    exampleList: '王大明\n李小美\n張書豪\n陳冠宇\n林雅婷\n黃品嘉\n曾子軒\n周曉雲\n吳奇峰\n許佳穎\n葉天龍\n徐郁涵',
    editList: '修改 / 重新輸入名單',
    closeList: '收起名單',
    fullscreen: '全螢幕顯示',
    exitFullscreen: '離開全螢幕',
    switchLangText: '中文'
  }
};

export default function App() {
  const [lang, setLang] = useState<Language>('zh-TW');
  const t = translations[lang];

  const [inputText, setInputText] = useState('');
  const [allStudents, setAllStudents] = useState<string[]>([]);
  const [remaining, setRemaining] = useState<string[]>([]);
  const [drawn, setDrawn] = useState<string[]>([]);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const isDrawingRef = useRef(false);
  const [currentDraw, setCurrentDraw] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.error("Error attempting to enable fullscreen:", err);
      showToast('全螢幕模式可能遭到瀏覽器封鎖 / Fullscreen might be blocked by browser');
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Parse input list
  const handleUpdateList = () => {
    const parsed = inputText.split(/[\n,;\t]+/).map(s => s.trim()).filter(s => s.length > 0);
    const unique = Array.from(new Set(parsed));
    setAllStudents(unique);
    setRemaining(unique);
    setDrawn([]);
    setCurrentDraw(null);
    if (unique.length > 0) {
      setShowSettings(false);
      showToast(lang === 'en' ? 'List successfully updated!' : '名單設定成功！');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setInputText(prev => prev + (prev.trim() ? '\n' : '') + text);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const fireConfetti = () => {
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#4CC9F0', '#FF4D6D', '#FFB703', '#ffffff']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#4CC9F0', '#FF4D6D', '#FFB703', '#ffffff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const drawStudent = () => {
    if (remaining.length === 0 || isDrawingRef.current) return;
    isDrawingRef.current = true;
    setIsDrawing(true);
    setCurrentDraw(null);

    let rolls = 0;
    const maxRolls = 25;
    const intervalTime = 60;
    const currentRemaining = [...remaining];

    const rollInterval = setInterval(() => {
      const randomPreview = currentRemaining[Math.floor(Math.random() * currentRemaining.length)];
      setCurrentDraw(randomPreview);
      rolls++;

      if (rolls >= maxRolls) {
        clearInterval(rollInterval);
        
        // Final Pick
        const randomIndex = Math.floor(Math.random() * currentRemaining.length);
        const picked = currentRemaining[randomIndex];

        setCurrentDraw(picked);
        setDrawn(prev => [picked, ...prev]);
        setRemaining(prev => prev.filter(s => s !== picked));
        setIsDrawing(false);
        isDrawingRef.current = false;
        fireConfetti();
      }
    }, intervalTime);
  };

  const resetDraw = () => {
    // In iframe environments, window.confirm might be blocked.
    // For a smoother experience, we can skip the native confirm and just reset.
    setRemaining([...allStudents]);
    setDrawn([]);
    setCurrentDraw(null);
    showToast(t.resetConfirm);
  };

  const clearList = () => {
    setAllStudents([]);
    setRemaining([]);
    setDrawn([]);
    setCurrentDraw(null);
    setInputText('');
    setShowSettings(true);
    showToast(t.clearConfirm);
  };

  const toggleLanguage = () => {
    setLang(prev => prev === 'en' ? 'zh-TW' : 'en');
  };

  const loadExampleData = () => {
    setInputText(t.exampleList);
  };

  return (
    <div className={`bg-[#FFF9E6] text-[#2B2D42] font-sans flex flex-col items-center transition-all duration-300 ${isFullscreen ? 'h-screen w-screen overflow-hidden' : 'min-h-screen overflow-x-hidden'}`}>
      {/* Header */}
      <header className={`w-full bg-white flex items-center justify-between px-6 lg:px-10 shadow-[0_4px_0_rgba(0,0,0,0.05)] border-b-[4px] border-[#FFB703] shrink-0 sticky top-0 z-50 transition-all ${isFullscreen ? 'h-[100px] border-b-[6px]' : 'h-[80px] border-b-[4px]'}`}>
        <div className="flex items-center gap-4">
          <div className={`bg-[#4CC9F0] rounded-[10px] flex items-center justify-center text-white font-bold border-2 border-[#2B2D42] shadow-[2px_2px_0_#2B2D42] transition-all ${isFullscreen ? 'w-[56px] h-[56px] text-4xl' : 'w-[40px] h-[40px] text-2xl'}`}>
            ?
          </div>
          <h1 className={`font-bold tracking-wide text-[#2B2D42] truncate transition-all ${isFullscreen ? 'text-2xl md:text-[36px]' : 'text-xl md:text-[28px]'}`}>{t.title}</h1>
        </div>
        
        <div className={`flex ${isFullscreen ? 'gap-6' : 'gap-4'}`}>
          <button 
            onClick={toggleLanguage}
            className={`flex items-center gap-2 rounded-xl hover:bg-slate-100 transition-colors bg-white border-2 border-[#2B2D42] text-[#2B2D42] font-bold shadow-[2px_2px_0_#2B2D42] outline-none ${isFullscreen ? 'px-6 py-3 text-xl' : 'px-3 py-2 text-base'}`}
            title="Switch Language"
          >
            <Languages size={isFullscreen ? 24 : 18} />
            {lang === 'en' ? '中文' : 'EN'}
          </button>
          <button 
            onClick={toggleFullscreen}
            className={`flex items-center gap-2 rounded-xl transition-colors bg-[#4CC9F0] text-[#2B2D42] border-2 border-[#2B2D42] font-bold shadow-[2px_2px_0_#2B2D42] outline-none hover:bg-[#3bb1d6] ${isFullscreen ? 'px-6 py-3 text-xl' : 'px-4 py-2 text-base'}`}
            title={isFullscreen ? t.exitFullscreen : t.fullscreen}
          >
             {isFullscreen ? <Minimize size={isFullscreen ? 24 : 18} strokeWidth={2.5} /> : <Maximize size={isFullscreen ? 24 : 18} strokeWidth={2.5} />}
             <span className="hidden sm:inline">{isFullscreen ? t.exitFullscreen : t.fullscreen}</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className={`p-4 md:p-8 flex-1 grid grid-cols-1 ${
        showSettings 
          ? (isFullscreen ? 'lg:grid-cols-[450px_1fr_400px]' : 'lg:grid-cols-[300px_1fr_280px]') 
          : (isFullscreen ? 'lg:grid-cols-[1fr_400px]' : 'lg:grid-cols-[1fr_280px]')
      } gap-5 md:gap-8 w-full ${isFullscreen ? 'max-w-full px-4 md:px-8 xl:px-12 lg:h-[calc(100vh-100px)] overflow-y-auto lg:overflow-hidden items-stretch content-stretch pb-12' : 'max-w-[1400px] content-start'} transition-all duration-300`}>
        
        {/* Settings Sidebar */}
        <AnimatePresence>
          {showSettings && (
            <motion.div 
              initial={{ opacity: 0, x: -20, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 'auto' }}
              exit={{ opacity: 0, x: -20, width: 0 }}
              className={`lg:col-start-1 h-full min-h-0 min-w-0 flex flex-col`}
            >
              <div className={`bg-white border-[3px] border-[#2B2D42] flex flex-col overflow-hidden h-full flex-1 transition-all ${isFullscreen ? 'rounded-[36px] shadow-[8px_8px_0_#2B2D42]' : 'rounded-[24px] shadow-[6px_6px_0_#2B2D42] max-h-[800px]'}`}>
                <div className={`border-b-[3px] border-[#2B2D42] font-bold flex justify-between items-center bg-[#f0f0f0] ${isFullscreen ? 'p-[24px] text-xl' : 'p-[15px] text-base'}`}>
                  <span className="flex items-center gap-2">
                    <ListIcon size={isFullscreen ? 24 : 18} />
                    {t.list(allStudents.length)}
                  </span>
                  {(allStudents.length > 0) && (
                     <button onClick={clearList} className={`bg-[#FF4D6D] hover:bg-[#e03a58] text-white rounded-lg border-2 border-[#2B2D42] flex items-center gap-1 font-bold shadow-[2px_2px_0_#2B2D42] active:translate-y-[2px] active:shadow-none transition-all ${isFullscreen ? 'px-4 py-2 text-lg' : 'px-2 py-1 text-sm'}`}>
                       <Trash2 size={isFullscreen ? 20 : 14} /> {t.clear}
                     </button>
                  )}
                </div>

                <div className={`flex-1 flex flex-col ${isFullscreen ? 'p-[24px] gap-[16px]' : 'p-[15px] gap-[10px]'}`}>
                  <textarea 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={t.placeholder}
                    className={`w-full flex-1 bg-[#fafafa] border-[2px] border-[#ddd] focus:border-[#4CC9F0] focus:ring-0 transition-colors outline-none resize-none shadow-inner ${isFullscreen ? 'p-[16px] text-xl rounded-[16px] min-h-[300px]' : 'p-[10px] text-base rounded-[12px] min-h-[150px]'}`}
                  />
                  
                  <div className={`text-[#666] italic font-medium shrink-0 ${isFullscreen ? 'text-[16px]' : 'text-[12px]'}`}>
                    {t.disclaimer}
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <div className="flex gap-2 w-full">
                      <button 
                        onClick={loadExampleData}
                        className={`flex-1 flex items-center justify-center gap-2 bg-[#FFB703] border-2 border-[#2B2D42] shadow-[2px_2px_0_#2B2D42] text-[#2B2D42] font-bold hover:brightness-110 transition-colors active:translate-y-[2px] active:shadow-none ${isFullscreen ? 'p-[16px] text-lg rounded-2xl' : 'p-[10px] text-sm rounded-xl'}`}
                      >
                        <Sparkles size={isFullscreen ? 20 : 16} />
                        {t.loadExample}
                      </button>
                      <div className="relative overflow-hidden flex-1 group">
                        <button className={`w-full flex items-center justify-center gap-2 bg-white border-2 border-[#2B2D42] shadow-[2px_2px_0_#2B2D42] text-[#2B2D42] font-bold hover:bg-slate-100 transition-colors active:translate-y-[2px] active:shadow-none ${isFullscreen ? 'p-[16px] text-lg rounded-2xl' : 'p-[10px] text-sm rounded-xl'}`}>
                          <Upload size={isFullscreen ? 20 : 16} />
                          {t.importFile}
                        </button>
                        <input 
                          type="file" 
                          accept=".txt,.csv"
                          onChange={handleFileUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          title="Upload a text or CSV file"
                        />
                      </div>
                    </div>
                    <button 
                      onClick={handleUpdateList}
                      disabled={inputText.trim() === ''}
                      className={`w-full flex items-center justify-center gap-2 bg-[#4CC9F0] text-white border-[3px] border-[#2B2D42] shadow-[3px_3px_0_#2B2D42] font-bold hover:bg-[#3bb1d6] active:translate-y-[3px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isFullscreen ? 'p-[16px] text-xl rounded-2xl' : 'p-[10px] text-sm rounded-xl'}`}
                    >
                      <UserCheck size={isFullscreen ? 24 : 16} />
                      {t.setList}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Stage */}
        <div className={`flex flex-col h-full min-h-0 min-w-0`}>
          <div className={`bg-[radial-gradient(circle,#fff_0%,#ffefba_100%)] border-[3px] border-[#2B2D42] flex flex-col items-center justify-center relative overflow-hidden h-full flex-1 w-full transition-all ${isFullscreen ? 'rounded-[36px] shadow-[8px_8px_0_#2B2D42] p-12' : 'rounded-[24px] shadow-[6px_6px_0_#2B2D42] p-8'}`}>
            
            {/* TOAST MESSAGE */}
            <AnimatePresence>
              {toastMsg && (
                <motion.div 
                  initial={{ opacity: 0, y: -50, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  className={`absolute left-1/2 -translate-x-1/2 z-50 flex items-center bg-[#4CC9F0] text-[#2B2D42] font-black rounded-full border-[3px] border-[#2B2D42] shadow-[4px_4px_0_#2B2D42] ${isFullscreen ? 'top-8 px-10 py-5 text-2xl gap-4' : 'top-4 px-6 py-3 text-base gap-2'}`}
                >
                  <CheckCircle2 size={isFullscreen ? 32 : 20} strokeWidth={3} />
                  {toastMsg}
                </motion.div>
              )}
            </AnimatePresence>

            <div className={`relative flex items-center justify-center w-full bg-white border-[#2B2D42] mx-auto transition-all ${isFullscreen ? 'max-w-[700px] flex-1 min-h-[150px] max-h-[400px] shrink border-[8px] rounded-[36px] md:rounded-[48px] shadow-[16px_16px_0_#FF4D6D] mb-12' : 'max-w-[380px] h-[220px] shrink-0 border-[5px] rounded-[30px] shadow-[12px_12px_0_#FF4D6D] mb-10'} ${isDrawing ? 'animate-pulse' : ''}`}>
              <div className={`absolute left-1/2 -translate-x-1/2 bg-[#FFB703] text-[#2B2D42] border-[#2B2D42] font-black tracking-wider uppercase z-10 transition-all ${isFullscreen ? '-top-5 md:-top-6 px-6 md:px-10 py-1 md:py-2 border-[3px] md:border-[4px] text-lg md:text-2xl whitespace-nowrap' : '-top-5 px-5 py-1 border-[3px] text-sm md:text-base whitespace-nowrap'}`}>
                {t.lucky}
              </div>

              {allStudents.length === 0 ? (
                <div className={`text-slate-300 font-bold flex flex-col items-center gap-2 ${isFullscreen ? 'text-2xl md:text-4xl' : 'text-lg'}`}>
                  <Users size={isFullscreen ? 64 : 48} className="opacity-50 md:w-[96px] md:h-[96px]" />
                  <span className="text-[#2B2D42] opacity-60 text-center">{t.awaiting}</span>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center overflow-hidden px-2 md:px-6">
                  {isDrawing ? (
                    <div className={`text-center font-black text-[#FF4D6D]/40 italic leading-tight w-full break-words ${isFullscreen ? 'text-[50px] sm:text-[72px] md:text-[96px]' : 'text-[36px] md:text-[46px]'}`}>
                      {currentDraw}
                    </div>
                  ) : (
                    <AnimatePresence mode="wait">
                      {currentDraw ? (
                        <motion.div
                          key={currentDraw}
                          initial={{ opacity: 0, scale: 0.5, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ type: 'spring', bounce: 0.5, duration: 0.5 }}
                          className={`text-center font-black text-[#FF4D6D] leading-snug w-full break-words max-h-full overflow-hidden ${isFullscreen ? 'text-[56px] sm:text-[80px] md:text-[110px]' : 'text-[40px] md:text-[56px]'}`}
                          style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}
                        >
                          {currentDraw}
                        </motion.div>
                      ) : (
                        <div className={`text-slate-200 font-black ${isFullscreen ? 'text-[80px] md:text-[150px]' : 'text-6xl'}`}>?</div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              )}
            </div>

            <div className={`flex flex-col items-center relative z-10 w-full px-2 md:px-0 transition-all ${isFullscreen ? 'gap-[16px] md:gap-[24px] max-w-[600px]' : 'gap-[16px] max-w-[400px]'}`}>
              <motion.button
                animate={(!isDrawing && remaining.length > 0 && allStudents.length > 0) ? { 
                  y: [0, -6, 0],
                } : {}}
                transition={{ 
                  y: { repeat: Infinity, duration: 2, ease: "easeInOut" },
                }}
                onClick={drawStudent}
                disabled={isDrawing || remaining.length === 0 || allStudents.length === 0}
                className={`w-full font-black text-white bg-[#FF4D6D] border-[#2B2D42] flex items-center justify-center transition-all ${
                  isDrawing || allStudents.length === 0 || remaining.length === 0 
                    ? 'opacity-50 cursor-not-allowed translate-y-[10px] shadow-none bg-[#999]' 
                    : `active:translate-y-[10px] active:shadow-none hover:brightness-110 ${isFullscreen ? 'shadow-[0_10px_0_#9d1c33] md:shadow-[0_14px_0_#9d1c33]' : 'shadow-[0_10px_0_#9d1c33]'}`
                } ${isFullscreen ? 'py-[24px] md:py-[32px] text-[32px] md:text-[48px] border-[5px] md:border-[6px] rounded-[60px] md:rounded-[80px] gap-3 md:gap-5' : 'py-[20px] md:py-[24px] text-[28px] md:text-[32px] border-[4px] rounded-[50px] gap-3'}`}
              >
                {!isDrawing && <Play size={isFullscreen ? 40 : 36} fill="currentColor" className={`md:w-[56px] md:h-[56px] ${allStudents.length > 0 && remaining.length > 0 ? "animate-pulse" : ""}`} />}
                <span className="tracking-widest uppercase truncate">{allStudents.length === 0 ? t.draw : remaining.length === 0 ? t.done : t.draw}</span>
              </motion.button>

              <div className="flex flex-col items-center gap-4 w-full mt-2 md:mt-4">
                <div className={`text-[#2B2D42]/60 font-black flex items-center justify-center gap-2 -mt-1 tracking-wider ${isFullscreen ? 'text-[16px] md:text-[20px] text-center' : 'text-[14px]'}`}>
                  <span className={`animate-bounce ${isFullscreen ? 'text-2xl md:text-4xl' : 'text-xl'}`}>↑</span> {t.clickToSelect}
                </div>
                <div className={`flex flex-col sm:flex-row items-center justify-center w-full transition-all ${isFullscreen ? 'gap-4 md:gap-8 mt-2 md:mt-6' : 'gap-4 mt-4'}`}>
                  <button 
                    onClick={() => setShowSettings(!showSettings)}
                    className={`w-full sm:w-auto flex items-center justify-center gap-2 rounded-[50px] transition-all border-[#2B2D42] font-bold outline-none active:translate-y-[4px] active:shadow-none bg-[#FFB703] text-[#2B2D42] hover:bg-[#ffc633] ${isFullscreen ? 'px-6 md:px-10 py-[14px] md:py-[18px] text-[18px] md:text-[24px] border-[3px] md:border-[4px] shadow-[0_4px_0_#2B2D42] md:shadow-[0_6px_0_#2B2D42] whitespace-nowrap' : 'px-6 py-[12px] text-[16px] border-[3px] shadow-[0_4px_0_#2B2D42]'}`}
                    title={t.toggleSettings}
                  >
                     {showSettings ? <X size={isFullscreen ? 24 : 18} strokeWidth={2.5} className="md:w-[28px] md:h-[28px]" /> : <Edit3 size={isFullscreen ? 24 : 18} strokeWidth={2.5} className="md:w-[28px] md:h-[28px]" />}
                     <span>{showSettings ? t.closeList : t.editList}</span>
                  </button>
                  <button 
                      onClick={resetDraw}
                      disabled={isDrawing || drawn.length === 0}
                      className={`w-full sm:w-auto font-bold bg-[#f0f0f0] text-[#2B2D42] border-[#2B2D42] rounded-[50px] hover:bg-white active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${isFullscreen ? 'px-6 md:px-10 py-[14px] md:py-[18px] text-[18px] md:text-[24px] border-[3px] md:border-[4px] shadow-[0_4px_0_#2B2D42] md:shadow-[0_6px_0_#2B2D42] whitespace-nowrap' : 'px-6 py-[12px] text-[16px] border-[3px] shadow-[0_4px_0_#2B2D42]'}`}
                      title={t.reset}
                  >
                    <RotateCcw size={isFullscreen ? 24 : 18} strokeWidth={2.5} className="md:w-[28px] md:h-[28px]" />
                    {t.reset}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* History Section */}
        <div className={`flex flex-col h-full min-h-0 min-w-0`}>
          <div className={`bg-white border-[3px] border-[#2B2D42] flex flex-col overflow-hidden h-full flex-1 transition-all ${isFullscreen ? 'rounded-[36px] shadow-[8px_8px_0_#2B2D42]' : 'rounded-[24px] shadow-[6px_6px_0_#2B2D42] max-h-[800px]'}`}>
            <div className={`border-b-[3px] border-[#2B2D42] font-bold flex justify-between items-center bg-[#f0f0f0] shrink-0 text-[#2B2D42] ${isFullscreen ? 'p-[24px] text-[22px]' : 'p-[15px] text-[16px]'}`}>
              <span>{t.drawnList}</span>
            </div>
            
            <div className={`flex-1 overflow-y-auto ${isFullscreen ? 'p-[16px]' : 'p-[10px]'}`}>
              {drawn.length === 0 ? (
                <div className={`text-center text-slate-400 font-bold ${isFullscreen ? 'py-12 text-[20px]' : 'py-8 text-[14px]'}`}>{t.noStudents}</div>
              ) : (
                <div className="flex flex-col">
                  <AnimatePresence>
                    {drawn.map((student, i) => (
                      <motion.div
                        key={`${student}-${i}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex items-center border-b border-dashed border-[#ccc] ${isFullscreen ? 'gap-[16px] p-[16px]' : 'gap-[12px] p-[10px]'}`}
                      >
                        <div className={`bg-[#FFB703] border-[#2B2D42] rounded-full flex items-center justify-center font-bold text-[#2B2D42] shrink-0 shadow-[1px_1px_0_#2B2D42] ${isFullscreen ? 'w-[44px] h-[44px] border-[3px] text-[20px]' : 'w-[28px] h-[28px] border-[2px] text-[14px]'}`}>
                          {drawn.length - i}
                        </div>
                        <div className={`font-bold text-[#2B2D42] truncate flex-1 ${isFullscreen ? 'text-[24px]' : 'text-[16px]'}`} title={student}>{student}</div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {remaining.length > 0 && (
                    <div className={`flex items-center opacity-50 ${isFullscreen ? 'gap-[16px] p-[16px]' : 'gap-[12px] p-[10px]'}`}>
                      <div className={`bg-slate-200 border-slate-400 rounded-full flex items-center justify-center font-bold text-slate-500 shrink-0 ${isFullscreen ? 'w-[44px] h-[44px] border-[3px] text-[20px]' : 'w-[28px] h-[28px] border-[2px] text-[14px]'}`}>
                        {drawn.length + 1}
                      </div>
                      <div className={`font-bold text-slate-500 truncate flex-1 ${isFullscreen ? 'text-[24px]' : 'text-[16px]'}`}>{t.next}</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className={`bg-[#4CC9F0] border-t-[3px] border-[#2B2D42] text-white font-bold text-center shrink-0 ${isFullscreen ? 'p-[24px] text-[22px]' : 'p-[15px] text-[14px]'}`}>
              {t.progress(drawn.length, allStudents.length)}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
