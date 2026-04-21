import React, { useState, useRef } from 'react';
import { Download, CalendarIcon, Edit3, CheckCircle, MapPin, Trophy, Star, TrendingUp, Users, Medal, Flame, Plus, Trash2 } from 'lucide-react';
import { toJpeg } from 'html-to-image';
import { useData } from '../context/DataContext';

const formatGmv = (value) => {
  if (!value) return '';
  const rawValue = String(value).replace(/\D/g, '').substring(0, 9);
  return rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

const calculateNetHours = (shiftStart, shiftEnd, breakStart, breakEnd) => {
  if (!shiftStart || !shiftEnd) return 0;
  
  const parseTime = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h + m / 60;
  };

  let shiftHours = parseTime(shiftEnd) - parseTime(shiftStart);
  if (shiftHours < 0) shiftHours += 24; 

  let breakHours = 0;
  if (breakStart && breakEnd) {
    breakHours = parseTime(breakEnd) - parseTime(breakStart);
    if (breakHours < 0) breakHours += 24;
  }

  const net = shiftHours - breakHours;
  return net > 0 ? net : 0;
};

export default function DailyActuals({ selectedDate, setSelectedDate }) {
  const { 
    departments, users, rekor, setRekor,
    allDailyShifts, allDailySales, allDailyActualSales, updateDailyActualSales,
    allDailyMVPs, updateDailyMVPs
  } = useData();
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [isRekorEditMode, setIsRekorEditMode] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const captureRef = useRef(null);

  const shifts = allDailyShifts[selectedDate] || [];
  const manualDeptSales = allDailySales[selectedDate] || {};
  const actualSales = allDailyActualSales[selectedDate] || {};
  const mvps = allDailyMVPs[selectedDate] || [];
  
  const setActualSales = (deptId, value) => {
    updateDailyActualSales(selectedDate, prev => ({ ...prev, [deptId]: formatGmv(value).replace(/\s/g, '') }));
  };

  const handleMvpChange = (idx, userId) => {
    updateDailyMVPs(selectedDate, prev => {
      const newMvps = [...prev];
      if (userId) {
        newMvps[idx] = userId;
      } else {
        newMvps.splice(idx, 1);
      }
      return newMvps;
    });
  };

  const addMvp = () => {
    if (mvps.length < 3) {
      updateDailyMVPs(selectedDate, prev => [...prev, '']);
    }
  };

  // Extract unique users from today's shifts
  const todayUserIds = [...new Set(shifts.filter(s => s.userId).map(s => s.userId))];
  const todayUsers = users.filter(u => todayUserIds.includes(u.id));

  const exportImage = async () => {
    if (!captureRef.current) return;
    const wasEditMode = isEditMode;
    setIsEditMode(false);
    setIsExporting(true);
    
    setTimeout(async () => {
      try {
        const image = await toJpeg(captureRef.current, {
          quality: 1.0,
          backgroundColor: '#2b3e94',
          pixelRatio: 2
        });
        const link = document.createElement('a');
        link.download = `Gunun-Gerceklesenleri-${selectedDate}.jpg`;
        link.href = image;
        link.click();
      } catch (err) {
        console.error('İndirme hatası:', err);
      } finally {
        setIsExporting(false);
        if (wasEditMode) setIsEditMode(true);
      }
    }, 300); 
  };

  const formattedDate = new Date(selectedDate).toLocaleDateString('tr-TR', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  return (
    <div className="space-y-4 mt-16 md:mt-24 pb-10">
      {/* Decorative Non-Downloadable Component */}
      <div className="bg-gradient-to-r from-[#1e2b6e] via-blue-800 to-[#2b3e94] rounded-2xl p-6 md:p-8 shadow-xl text-white relative overflow-hidden border border-white/10 group">
        <div className="absolute -top-10 -right-10 opacity-10 pointer-events-none group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700">
          <Flame size={200} />
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#c2ff00] via-green-400 to-emerald-400"></div>
        <h3 className="text-2xl md:text-3xl font-black italic flex items-center gap-3 mb-3 tracking-wide" style={{ transform: 'skewX(-2deg)' }}>
          <Medal className="text-[#c2ff00] drop-shadow-[0_0_8px_rgba(194,255,0,0.5)]" size={32} />
          BİRLİKTE DAHA İLERİYE!
        </h3>
        <p className="opacity-90 font-medium text-blue-100 max-w-2xl leading-relaxed text-sm md:text-base">
          Günün organizasyonu bitti, şimdi sahanın kahramanlarını onurlandırma ve hedefleri ne kadar aştığımızı görme vakti. Başarılarımız takım ruhumuzdan gelir!
        </p>
      </div>

      <div className="flex justify-between items-end mb-2 mt-4 md:mt-6">
        <h2 className="text-xl font-bold text-gray-700 flex items-center gap-2">
          <TrendingUp className="text-blue-600" /> Günün Gerçekleşenleri
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-all shadow-sm ${isEditMode ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-300' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'}`}
          >
            {isEditMode ? <CheckCircle size={16} /> : <Edit3 size={16} />}
            <span>{isEditMode ? 'Bitir' : 'Düzenle'}</span>
          </button>
          <button 
            onClick={exportImage}
            disabled={isExporting}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            <Download size={16} />
            <span>{isExporting ? 'Çekiliyor...' : 'İndir'}</span>
          </button>
        </div>
      </div>

      <div className="w-full overflow-x-auto pb-10">
        <div ref={captureRef} className="bg-[#2b3e94] p-6 md:p-10 rounded-xl shadow-2xl relative overflow-hidden text-white min-w-[900px] w-full">
          <div 
            className="absolute inset-0 z-0 opacity-5 mix-blend-overlay pointer-events-none"
            style={{ 
              backgroundImage: 'url("https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")',
              backgroundSize: 'cover', backgroundPosition: 'center'
            }}
          />

          <div className="relative z-10 flex flex-col h-full">
            <div className="flex justify-between items-end mb-8 border-b border-white/20 pb-4 gap-4">
              <div className="w-auto">
                <h1 className="text-4xl font-black tracking-tight text-white uppercase leading-none m-0 italic drop-shadow-md">
                  Günün Gerçekleşenleri
                </h1>
                <div className="mt-4 flex items-center space-x-2">
                  <MapPin size={18} color="#c2ff00" className="mt-[2px]" />
                  <span className="text-[#c2ff00] font-bold tracking-widest text-[16px] leading-none">
                    843 - MERSİN TURKSPORT
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-3 ml-auto">
                <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-lg border border-[#c2ff00]/30 shadow-[0_0_10px_rgba(194,255,0,0.1)] group">
                  <Trophy size={16} className="text-[#c2ff00]" />
                  <span className="text-white/80 text-xs font-bold uppercase tracking-wider">Rekor:</span>
                  {isRekorEditMode ? (
                    <div className="flex items-center gap-1">
                      <input 
                        type="text" 
                        value={rekor} 
                        onChange={(e) => setRekor(formatGmv(e.target.value))}
                        className="bg-transparent border-b border-[#c2ff00]/50 text-[#c2ff00] font-black outline-none w-28 text-right text-lg placeholder-white/20 px-1"
                        placeholder="0"
                        autoFocus
                        onBlur={() => setIsRekorEditMode(false)}
                      />
                      <button onClick={() => setIsRekorEditMode(false)} className="text-green-400 hover:text-green-300"><CheckCircle size={14}/></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                       <span className="text-[#c2ff00] font-black text-lg min-w-[70px] text-right">{rekor || '0'}</span>
                       <button onClick={() => setIsRekorEditMode(true)} className="text-white/30 hover:text-white/80 opacity-0 group-hover:opacity-100 transition-opacity"><Edit3 size={14} /></button>
                    </div>
                  )}
                </div>

                <label className="relative block cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="flex items-center space-x-2 pb-1 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                    <CalendarIcon size={20} color="#c2ff00" className="mt-[1px]" />
                    <span className="text-[#c2ff00] font-bold text-[18px] leading-none uppercase tracking-wide">
                      {formattedDate}
                    </span>
                  </div>
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </label>
              </div>
            </div>

            {/* MVPs Section */}
            <div className="mb-8 border border-white/20 bg-black/20 rounded-xl p-5 backdrop-blur-sm shadow-inner relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#c2ff00] opacity-5 rounded-full blur-3xl"></div>
               <div className="flex items-center justify-between mb-4 relative z-10">
                  <h4 className="text-[#c2ff00] font-black uppercase flex items-center gap-2 text-lg tracking-wider">
                    <Star className="text-yellow-400 fill-yellow-400" size={20} /> 
                    Günün MVP'leri
                  </h4>
                  {isEditMode && mvps.length < 3 && (
                    <button onClick={addMvp} className="flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors font-bold tracking-wide">
                      <Plus size={14} /> Ekle
                    </button>
                  )}
               </div>
               
               <div className="grid grid-cols-3 gap-4 relative z-10">
                  {mvps.length === 0 && !isEditMode && (
                    <div className="col-span-3 text-white/50 italic font-medium">Henüz MVP seçilmedi.</div>
                  )}
                  {mvps.map((mvpId, idx) => {
                    const userObj = users.find(u => u.id === mvpId);
                    return (
                      <div key={idx} className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-lg p-3 flex flex-col items-center justify-center relative group">
                        {isEditMode ? (
                           <div className="w-full flex items-center gap-2">
                             <select 
                               value={mvpId} 
                               onChange={(e) => handleMvpChange(idx, e.target.value)}
                               className="bg-black/40 text-white border border-white/20 rounded px-2 py-2 outline-none focus:border-[#c2ff00] w-full text-sm font-bold"
                             >
                               <option value="">Seçiniz...</option>
                               {todayUsers.map(u => (
                                 <option key={u.id} value={u.id}>{u.name}</option>
                               ))}
                               {/* Add all users just in case they want someone not in schedule */}
                               {todayUsers.length === 0 && users.map(u => (
                                 <option key={u.id} value={u.id}>{u.name}</option>
                               ))}
                             </select>
                             <button onClick={() => handleMvpChange(idx, null)} className="text-red-400 hover:text-red-300 p-1.5 bg-black/20 rounded"><Trash2 size={16} /></button>
                           </div>
                        ) : (
                           <>
                             <div className="w-10 h-10 bg-[#c2ff00]/20 rounded-full flex items-center justify-center mb-2 shadow-inner border border-[#c2ff00]/30 shadow-[0_0_15px_rgba(194,255,0,0.1)]">
                                <Trophy size={18} className="text-[#c2ff00]" />
                             </div>
                             <span className="font-black text-lg text-white tracking-wide">{userObj ? userObj.name : '-'}</span>
                           </>
                        )}
                      </div>
                    )
                  })}
               </div>
            </div>

            <div className="bg-[#2b3e94] rounded shadow-sm border border-white/20 overflow-hidden flex flex-col text-sm w-full">
              <div className="flex bg-[#1e2b6e] text-[#c2ff00] font-bold uppercase tracking-wider p-3">
                <div className="w-[30%] px-2">Departman</div>
                <div className="w-[35%] text-center">Hedef Ciro</div>
                <div className="w-[35%] text-center">Gerçekleşen GMV</div>
              </div>

              {departments.map((dept, idx) => {
                let deptShifts = shifts.filter(s => s.deptId === dept.id);
                let deptTotalNet = 0;
                deptShifts.forEach(s => {
                  deptTotalNet += calculateNetHours(s.shiftStart, s.shiftEnd, s.breakStart, s.breakEnd);
                });
                
                const manualRev = manualDeptSales[dept.id];
                const deptHedefCiro = manualRev !== undefined && manualRev !== '' ? Number(manualRev) : deptTotalNet * dept.targetProductivity;

                const actSales = actualSales[dept.id] || '';

                return (
                  <div key={dept.id} className="flex relative border-t border-white/20 min-h-[60px] overflow-hidden hover:bg-white/5 transition-colors">
                    <div className="w-[30%] border-r border-white/20 p-4 relative z-10 flex flex-col items-start justify-center font-black text-white hover:text-[#c2ff00] uppercase tracking-widest break-words leading-tight transition-colors">
                      {dept.name}
                    </div>

                    <div className="w-[35%] relative z-10 flex border-r border-white/20 items-center justify-center p-3">
                       <span className="font-bold text-lg tracking-wider text-white/80">
                         {Math.round(deptHedefCiro).toLocaleString('tr-TR')} ₺
                       </span>
                    </div>

                    <div className="w-[35%] relative z-10 flex items-center justify-center p-3">
                        {isEditMode ? (
                          <div className="relative w-3/4">
                            <input 
                              type="text" 
                              value={formatGmv(actSales)} 
                              placeholder="0"
                              onChange={(e) => setActualSales(dept.id, e.target.value)}
                              className="bg-black/30 text-[#c2ff00] px-3 py-2 rounded-lg outline-none w-full text-center font-black tracking-widest border border-white/10 focus:border-[#c2ff00]/50 transition-colors"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 font-bold text-xs pointer-events-none">₺</span>
                          </div>
                        ) : (
                          <span className={`font-black text-2xl tracking-widest ${actSales && Number(actSales) >= deptHedefCiro ? 'text-[#c2ff00]' : 'text-white'}`}>
                            {actSales ? `${formatGmv(actSales)} ₺` : '-'}
                          </span>
                        )}
                    </div>
                  </div>
                );
              })}

            </div>
            
            <div className="mt-8 flex justify-end w-full">
              <div className="text-2xl font-black italic text-white tracking-tighter opacity-80" style={{ transform: 'skewX(-2deg)' }}>
                DECATHLON
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
