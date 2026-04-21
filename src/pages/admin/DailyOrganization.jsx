import React, { useState, useRef, useEffect } from 'react';
import { Download, CalendarIcon, Plus, Trash2, Edit3, CheckCircle, MapPin, Trophy, RotateCcw } from 'lucide-react';
import { toJpeg } from 'html-to-image';
import { useData } from '../../context/DataContext';
import DailyActuals from '../../components/DailyActuals';

const ROLES = [
  { id: '', label: 'Görev Yok' },
  { id: 'AK', label: 'Açılış Kaptanı (AK)' },
  { id: 'AA', label: 'Açılış Aprantisi (AA)' },
  { id: 'KK', label: 'Kapanış Kaptanı (KK)' },
  { id: 'KA', label: 'Kapanış Aprantisi (KA)' },
  { id: 'Destek', label: 'Destek' },
];

const TIME_OPTIONS = [];
for (let h = 0; h < 24; h++) {
  const hh = h.toString().padStart(2, '0');
  ['00', '15', '30', '45'].forEach(mm => TIME_OPTIONS.push(`${hh}:${mm}`));
}

const addTenHours = (timeStr) => {
  if (!timeStr) return '';
  let [h, m] = timeStr.split(':').map(Number);
  h = (h + 10) % 24;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

const addOneHour = (timeStr) => {
  if (!timeStr) return '';
  let [h, m] = timeStr.split(':').map(Number);
  h = (h + 1) % 24;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

// Helper to format number with spaces
const formatRekor = (value) => {
  const rawValue = value.replace(/\D/g, '').substring(0, 10);
  return rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

// Calculate net hours for an employee
const calculateNetHours = (shiftStart, shiftEnd, breakStart, breakEnd) => {
  if (!shiftStart || !shiftEnd) return 0;
  
  const parseTime = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h + m / 60;
  };

  let shiftHours = parseTime(shiftEnd) - parseTime(shiftStart);
  if (shiftHours < 0) shiftHours += 24; // Crosses midnight

  let breakHours = 0;
  if (breakStart && breakEnd) {
    breakHours = parseTime(breakEnd) - parseTime(breakStart);
    if (breakHours < 0) breakHours += 24;
  }

  const net = shiftHours - breakHours;
  return net > 0 ? net : 0;
};

export default function DailyOrganization() {
  const { 
    departments, users, captainSchedule, rekor, setRekor,
    allDailyShifts, updateDailyShifts,
    allDailySales, updateDailySales
  } = useData();
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  });
  
  // Date specific state
  const shifts = allDailyShifts[selectedDate] || [];
  const manualDeptSales = allDailySales[selectedDate] || {};
  
  const setShifts = (newShiftsOrFn) => updateDailyShifts(selectedDate, newShiftsOrFn);
  const setManualDeptSales = (newSalesOrFn) => updateDailySales(selectedDate, newSalesOrFn);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [isRekorEditMode, setIsRekorEditMode] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const captureRef = useRef(null);

  // We should ideally load 'shifts' from the backend for the selected date.
  // We'll mock that by resetting them (or keeping them for now).
  
  const handleShiftChange = (shiftId, field, value) => {
    // Yetkili (Kaptan) kontrolü
    const isCaptainRole = (role) => ['AK', 'AA', 'KK', 'KA'].includes(role);
    
    let targetUserId = null;
    let targetRole = null;
    
    const currentShift = shifts.find(s => s.id === shiftId);
    
    if (field === 'role') {
      targetRole = value;
      targetUserId = currentShift ? currentShift.userId : null;
    } else if (field === 'userId') {
      targetUserId = value;
      targetRole = currentShift ? currentShift.role : null;
    }

    if (targetUserId && targetRole && isCaptainRole(targetRole)) {
      const user = users.find(u => u.id === targetUserId);
      if (user && user.isCaptain !== 1) {
        alert('Lütfen yetkili kişi seçiniz');
        return; // İşlemi iptal et
      }
    }

    setShifts(prev => {
      let nextPrev = [...prev];
      const exists = nextPrev.find(s => s.id === shiftId);
      
      let updatedShift;

      if (exists) {
        updatedShift = { ...exists, [field]: value };
      } else if (shiftId.startsWith('empty-')) {
        const parts = shiftId.split('-');
        const deptId = parts.slice(1, -1).join('-'); 
        updatedShift = {
          id: shiftId,
          deptId,
          userId: '',
          shiftStart: '',
          shiftEnd: '',
          breakStart: '',
          breakEnd: '',
          role: '',
          [field]: value
        };
      } else {
        return prev;
      }

      const applyAutoBreaks = (shift) => {
        const start = shift.shiftStart;
        if (!start) return;
        if (start >= '07:00' && start < '09:00') {
          shift.breakStart = '13:00';
          shift.breakEnd = '14:00';
        } else if (start >= '09:00' && start <= '10:00') {
          shift.breakStart = '14:00';
          shift.breakEnd = '15:00';
        } else if (start === '12:00' || start === '12:15') {
          shift.breakStart = '16:00';
          shift.breakEnd = '17:00';
        } else if (start === '12:30' || start === '13:00' || start === '14:00') {
          shift.breakStart = '17:00';
          shift.breakEnd = '18:00';
        }
      };

      // Kullanıcı seçildiğinde otomatik 09:30 - 19:30 yap
      if (field === 'userId' && value && !updatedShift.shiftStart) {
        updatedShift.shiftStart = '09:30';
        updatedShift.shiftEnd = '19:30';
        applyAutoBreaks(updatedShift);
      }

      // Başlangıç saati değiştiğinde otomatik 10 saat sonrasını bitiş olarak ayarla ve molayı ayarla
      if (field === 'shiftStart' && value) {
        updatedShift.shiftEnd = addTenHours(value);
        applyAutoBreaks(updatedShift);
      }
      
      // Mola başlangıç değiştiğinde mola bitişini 1 saat sonrası yap
      if (field === 'breakStart' && value) {
        updatedShift.breakEnd = addOneHour(value);
      }

      if (exists) {
        return nextPrev.map(s => s.id === shiftId ? updatedShift : s);
      } else {
        return [...nextPrev, updatedShift];
      }
    });
  };

  const addShift = (deptId) => {
    const newId = Date.now().toString();
    setShifts([...shifts, {
      id: newId, deptId, userId: '', shiftStart: '09:30', shiftEnd: '19:30', breakStart: '14:00', breakEnd: '15:00', role: ''
    }]);
  };

  const deleteShift = (id) => {
    setShifts(prev => prev.filter(s => s.id !== id));
  };

  const resetShifts = () => {
    if (window.confirm(`${formattedDate} tarihli tüm shift ve mola organizasyonunu sıfırlamak istediğinize emin misiniz?`)) {
      setShifts([]);
    }
  };

  const formattedDate = new Date(selectedDate).toLocaleDateString('tr-TR', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

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
        link.download = `Magaza-Organizasyonu-${selectedDate}.jpg`;
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

  // Get users for a dept
  const getDeptUsers = (deptId) => users.filter(u => u.deptId === deptId);

  // Get name for role (from CaptainSchedule or from specific manual role overrides)
  const getDailyRoleName = (roleCode) => {
    // First check if anyone manually assigned this role in the shift
    const manualShift = shifts.find(s => s.role === roleCode);
    if (manualShift && manualShift.userId) {
      const u = users.find(user => user.id === manualShift.userId);
      if (u) return u.name;
    }
    
    // Otherwise check the schedule table for this date
    const daySchedule = captainSchedule[selectedDate];
    if (daySchedule && daySchedule[roleCode]) {
      const u = users.find(user => user.id === daySchedule[roleCode]);
      if (u) return u.name;
    }
    
    return '-';
  };

  let totalStoreRevenue = 0;
  let totalStoreHours = 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end mb-2 mt-4 md:mt-0">
        <h2 className="text-xl font-bold text-gray-700 flex items-center gap-2">
          Günün Organizasyonu
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
            onClick={resetShifts}
            className="flex items-center space-x-2 bg-white text-red-600 hover:bg-red-50 border border-red-200 px-4 py-2 rounded-lg font-bold shadow-sm transition-all active:scale-95"
          >
            <RotateCcw size={16} />
            <span>Sıfırla</span>
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
                  Mağaza Organizasyonu
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
                        onChange={(e) => setRekor(formatRekor(e.target.value))}
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

            <div className="grid grid-cols-4 gap-4 mb-8">
              <RoleCard title="Açılış Kaptanı" name={getDailyRoleName('AK')} color="text-amber-300" />
              <RoleCard title="Açılış Aprantisi" name={getDailyRoleName('AA')} color="text-yellow-200" />
              <RoleCard title="Kapanış Kaptanı" name={getDailyRoleName('KK')} color="text-blue-300" />
              <RoleCard title="Kapanış Aprantisi" name={getDailyRoleName('KA')} color="text-indigo-300" />
            </div>

            <div className="bg-[#2b3e94] rounded shadow-sm border border-white/20 overflow-hidden flex flex-col text-sm w-full">
              <div className="flex bg-[#1e2b6e] text-[#c2ff00] font-bold uppercase tracking-wider p-3">
                <div className="w-[20%] px-2">Departman</div>
                <div className="w-[55%] flex">
                  <div className="w-[45.45%] px-2">Takım Arkadaşı</div>
                  <div className="w-[27.27%] text-center">Shift</div>
                  <div className="w-[27.27%] text-center">Mola</div>
                </div>
                <div className="w-[25%] flex">
                  <div className="w-[40%] text-center">Toplam Saat</div>
                  <div className="w-[60%] text-center">Hedef Ciro</div>
                </div>
              </div>

              {departments.map(dept => {
                let deptShifts = [...shifts.filter(s => s.deptId === dept.id)];
                
                // Pad to show at least 2 empty rows
                const minRows = 2;
                if (deptShifts.length < minRows) {
                  const paddingCount = minRows - deptShifts.length;
                  for (let i = 0; i < paddingCount; i++) {
                    let suffix = 0;
                    while (deptShifts.find(s => s.id === `empty-${dept.id}-${suffix}`)) {
                      suffix++;
                    }
                    deptShifts.push({
                      id: `empty-${dept.id}-${suffix}`,
                      deptId: dept.id,
                      userId: '',
                      shiftStart: '',
                      shiftEnd: '',
                      breakStart: '',
                      breakEnd: '',
                      role: ''
                    });
                  }
                }

                let deptTotalNet = 0;
                deptShifts.forEach(s => {
                  deptTotalNet += calculateNetHours(s.shiftStart, s.shiftEnd, s.breakStart, s.breakEnd);
                });
                
                totalStoreHours += deptTotalNet;
                
                const manualRev = manualDeptSales[dept.id];
                const deptHedefCiro = manualRev !== undefined && manualRev !== '' ? Number(manualRev) : deptTotalNet * dept.targetProductivity;
                
                totalStoreRevenue += deptHedefCiro;

                return (
                  <div key={dept.id} className="flex relative border-t border-white/20 min-h-[75px] overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-[20%] z-0 bg-cover bg-center opacity-60" style={{ backgroundImage: `url("${dept.bgImage}")` }} />
                    <div className="absolute left-0 top-0 bottom-0 w-[20%] z-0 bg-gradient-to-r from-[#1e2b6e] via-[#1e2b6e]/40 to-[#1e2b6e]/0 pointer-events-none" />

                    <div className="w-[20%] border-r border-white/20 p-4 relative z-10 flex flex-col items-start justify-center font-black text-[#c2ff00] uppercase tracking-widest break-words leading-tight">
                      <span>{dept.name}</span>
                      {isEditMode && (
                        <button onClick={() => addShift(dept.id)} className="mt-2 flex items-center gap-1 text-xs bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded transition-colors w-max">
                          <Plus size={14} /> Ekle
                        </button>
                      )}
                    </div>

                    <div className="w-[55%] relative z-10 flex flex-col border-r border-white/20">
                      {deptShifts.length === 0 ? (
                        <div className="flex w-full items-center justify-center p-4 text-white/50 italic font-medium">Shift bulunmuyor</div>
                      ) : (
                        deptShifts.map((shift, idx) => {
                          const userObj = users.find(u => u.id === shift.userId) || {};
                          const isLast = idx === deptShifts.length - 1;

                          return (
                            <div key={shift.id} className={`flex w-full hover:bg-white/5 transition-colors ${!isLast ? 'border-b border-white/10' : ''}`}>
                              <div className="w-[45.45%] p-2 border-r border-white/20 flex flex-col justify-center">
                                {isEditMode ? (
                                  <div className="flex flex-col gap-2">
                                    <select 
                                      value={shift.userId} 
                                      onChange={(e) => handleShiftChange(shift.id, 'userId', e.target.value)}
                                      className="bg-black/30 text-white border border-white/20 rounded px-2 py-1.5 outline-none focus:border-[#c2ff00]"
                                    >
                                      <option value="">Seçiniz...</option>
                                      {getDeptUsers(dept.id).map(u => (
                                        <option key={u.id} value={u.id}>{u.name} {u.isCaptain===1?'(K)':''}</option>
                                      ))}
                                    </select>
                                    <div className="flex items-center justify-between">
                                      <select value={shift.role} onChange={(e) => handleShiftChange(shift.id, 'role', e.target.value)} className="bg-[#1e2b6e] text-[10px] text-white border border-white/20 rounded px-1 flex-1 mr-2 appearance-none">
                                        {ROLES.map(r => <option key={r.id} value={r.id}>{r.id ? r.id : 'Rol'}</option>)}
                                      </select>
                                      <button onClick={() => deleteShift(shift.id)} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={14} /></button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="font-bold tracking-wide flex items-center">
                                    <span>{userObj.name || '-'}</span>
                                    {shift.role && <span className={`ml-1.5 text-[10px] uppercase font-black px-1.5 py-0.5 rounded ${shift.role === 'Destek' ? 'bg-pink-500/30 text-pink-300' : 'bg-[#c2ff00]/20 text-[#c2ff00]'}`}>{shift.role}</span>}
                                  </div>
                                )}
                              </div>
                              <div className="w-[27.27%] p-2 border-r border-white/20 flex items-center justify-center font-medium">
                                {isEditMode ? (
                                  <div className="flex flex-col items-center gap-1 w-full px-2">
                                    <select value={shift.shiftStart} onChange={(e) => handleShiftChange(shift.id, 'shiftStart', e.target.value)} className="bg-black/30 text-white px-1 py-1 rounded text-xs outline-none w-full text-center appearance-none">
                                      <option value="">-</option>
                                      {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                    <select value={shift.shiftEnd} onChange={(e) => handleShiftChange(shift.id, 'shiftEnd', e.target.value)} className="bg-black/30 text-white px-1 py-1 rounded text-xs outline-none w-full text-center appearance-none">
                                      <option value="">-</option>
                                      {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                  </div>
                                ) : <span>{shift.shiftStart} - {shift.shiftEnd}</span>}
                              </div>
                              <div className="w-[27.27%] p-2 flex items-center justify-center font-medium">
                                {isEditMode ? (
                                  <div className="flex flex-col items-center gap-1 w-full px-2">
                                    <select value={shift.breakStart} onChange={(e) => handleShiftChange(shift.id, 'breakStart', e.target.value)} className="bg-black/30 text-white px-1 py-1 rounded text-xs outline-none w-full text-center appearance-none">
                                      <option value="">-</option>
                                      {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                    <select value={shift.breakEnd} onChange={(e) => handleShiftChange(shift.id, 'breakEnd', e.target.value)} className="bg-black/30 text-white px-1 py-1 rounded text-xs outline-none w-full text-center appearance-none">
                                      <option value="">-</option>
                                      {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                  </div>
                                ) : <span>{shift.breakStart} - {shift.breakEnd}</span>}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="w-[25%] relative z-10 flex items-stretch">
                      <div className="w-[40%] border-r border-white/20 p-2 flex flex-col items-center justify-center">
                        <span className="font-bold text-[#c2ff00]/90 text-[16px]">{deptTotalNet.toFixed(1)} h</span>
                      </div>
                      <div className="w-[60%] p-2 flex items-center justify-end">
                        {isEditMode ? (
                          <input 
                            type="number" 
                            value={manualDeptSales[dept.id] !== undefined ? manualDeptSales[dept.id] : ''} 
                            placeholder={Math.round(deptTotalNet * dept.targetProductivity)}
                            onChange={(e) => setManualDeptSales(prev => ({...prev, [dept.id]: e.target.value}))}
                            className="bg-black/30 text-white px-2 py-2 rounded outline-none w-full text-right font-black tracking-wider"
                          />
                        ) : (
                          <span className="font-black text-lg tracking-wider text-right pr-4">
                            {Math.round(deptHedefCiro).toLocaleString('tr-TR')} ₺
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Mağaza Toplam Satırı */}
              <div className="flex bg-[#1e2b6e] border-t-2 border-[#c2ff00] text-white p-3 font-black text-lg shadow-inner">
                <div className="w-[66%] text-right pr-4 tracking-widest text-[#c2ff00] uppercase">Mağaza Toplam:</div>
                <div className="w-[15.25%] text-left pr-2 text-[#c2ff00]/80">
                  {totalStoreHours.toFixed(1)} h
                </div>
                <div className="w-[18.75%] text-right pr-2">
                   {Math.round(totalStoreRevenue).toLocaleString('tr-TR')} ₺
                </div>
              </div>

            </div>
            
            <div className="mt-8 flex justify-end w-full">
              <div className="text-2xl font-black italic text-white tracking-tighter" style={{ transform: 'skewX(-2deg)' }}>
                DECATHLON
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gunun Gerceklesenleri (Actuals & MVPs) Table */}
      <DailyActuals selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
    </div>
  );
}

function RoleCard({ title, name, color }) {
  return (
    <div className="bg-[#1e2b6e]/80 border border-white/10 rounded-lg p-3 flex items-center space-x-3 backdrop-blur-sm shadow-sm flex-row h-full">
      <div className={`p-2 rounded-full bg-white/5 ${color} shrink-0`}>
        <div className="w-4 h-4 rounded-full bg-current opacity-80" />
      </div>
      <div className="flex flex-col justify-center h-full">
        <p className="text-[10px] text-white/70 uppercase tracking-widest font-bold leading-tight">{title}</p>
        <p className={`font-black text-sm mt-0.5 ${name === '-' ? 'text-white/30 italic' : 'text-white'}`}>{name}</p>
      </div>
    </div>
  );
}
