import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, Calendar, Plus, Trash2, Edit3, CheckCircle, 
  Sun, Moon, Star, MapPin, Store, CreditCard
} from 'lucide-react';
import { toJpeg } from 'html-to-image';

const DEPARTMENTS = [
  { id: 'quechua', name: 'Quechua', bgImage: 'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { id: 'kosu', name: 'Koşu/Fitness', bgImage: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { id: 'su', name: 'Su Sporları', bgImage: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { id: 'takim', name: 'Takım Sporları', bgImage: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { id: 'bisiklet', name: 'Bisiklet', bgImage: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
];

const ROLES = [
  { id: '', label: 'Görev Yok' },
  { id: 'AK', label: 'Açılış Kaptanı (AK)' },
  { id: 'AA', label: 'Açılış Aprantisi (AA)' },
  { id: 'KK', label: 'Kapanış Kaptanı (KK)' },
  { id: 'KA', label: 'Kapanış Aprantisi (KA)' },
  { id: 'Destek', label: 'Destek' },
];

const CHECKOUT_ROLES = [
  'Açılış Danışma',
  'Kapanış Danışma',
  'Açılış Kasa',
  'Kapanış Kasa',
  'Ara Kasa',
  'Kabin/Kasa'
];

const INITIAL_EMPLOYEES = [
  { id: 1, deptId: 'quechua', name: 'Pelin', shiftStart: '09:30', shiftEnd: '19:30', breakStart: '14:00', breakEnd: '15:00', role: 'AA' },
  { id: 2, deptId: 'quechua', name: 'Melda', shiftStart: '09:30', shiftEnd: '19:30', breakStart: '14:00', breakEnd: '15:00', role: '' },
  { id: 3, deptId: 'quechua', name: 'Ahmet', shiftStart: '12:15', shiftEnd: '22:15', breakStart: '16:00', breakEnd: '17:00', role: '' },
  
  { id: 4, deptId: 'kosu', name: 'Damla', shiftStart: '07:00', shiftEnd: '17:00', breakStart: '13:00', breakEnd: '14:00', role: '' },
  { id: 5, deptId: 'kosu', name: 'Selin', shiftStart: '08:00', shiftEnd: '18:00', breakStart: '13:00', breakEnd: '14:00', role: '' },
  { id: 6, deptId: 'kosu', name: 'Ahmet Çevik', shiftStart: '12:30', shiftEnd: '22:30', breakStart: '17:00', breakEnd: '18:00', role: 'KA' },

  { id: 7, deptId: 'su', name: 'Bahar', shiftStart: '08:00', shiftEnd: '18:00', breakStart: '13:00', breakEnd: '14:00', role: '' },
  { id: 8, deptId: 'su', name: 'Gülper', shiftStart: '09:30', shiftEnd: '19:30', breakStart: '14:00', breakEnd: '15:00', role: '' },
  { id: 9, deptId: 'su', name: 'Deniz', shiftStart: '12:15', shiftEnd: '22:15', breakStart: '16:00', breakEnd: '17:00', role: '' },

  { id: 10, deptId: 'takim', name: 'Mert Can', shiftStart: '09:30', shiftEnd: '19:30', breakStart: '14:00', breakEnd: '15:00', role: 'AK' },
  { id: 11, deptId: 'takim', name: 'Kerem', shiftStart: '12:15', shiftEnd: '22:15', breakStart: '16:00', breakEnd: '17:00', role: '' },
  { id: 12, deptId: 'takim', name: 'Zeynep', shiftStart: '12:15', shiftEnd: '22:15', breakStart: '17:00', breakEnd: '18:00', role: '' },

  { id: 13, deptId: 'bisiklet', name: 'Görkem', shiftStart: '09:30', shiftEnd: '19:30', breakStart: '14:00', breakEnd: '15:00', role: '' },
  { id: 14, deptId: 'bisiklet', name: 'Eyyüp', shiftStart: '12:15', shiftEnd: '22:15', breakStart: '16:00', breakEnd: '17:00', role: '' },
  { id: 15, deptId: 'bisiklet', name: 'Mustafa', shiftStart: '12:15', shiftEnd: '22:15', breakStart: '17:00', breakEnd: '18:00', role: 'KK' },
];

const INITIAL_CHECKOUT_EMPLOYEES = [
  { id: 101, role: 'Açılış Danışma', name: 'Aslıhan', shiftStart: '09:30', shiftEnd: '18:00', breakStart: '14:00', breakEnd: '15:00' },
  { id: 102, role: 'Kapanış Danışma', name: 'Ergün', shiftStart: '14:00', shiftEnd: '22:30', breakStart: '17:00', breakEnd: '18:00' },
  { id: 103, role: 'Kapanış Kasa', name: 'Damla', shiftStart: '13:00', shiftEnd: '22:00', breakStart: '16:00', breakEnd: '17:00' },
  { id: 104, role: 'Kapanış Kasa', name: 'Yusuf', shiftStart: '14:00', shiftEnd: '22:30', breakStart: '18:00', breakEnd: '19:00' },
];

export default function App() {
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [checkoutEmployees, setCheckoutEmployees] = useState(INITIAL_CHECKOUT_EMPLOYEES);
  
  const [isExportingStore, setIsExportingStore] = useState(false);
  const [isExportingCheckout, setIsExportingCheckout] = useState(false);
  
  const [isEditModeStore, setIsEditModeStore] = useState(false);
  const [isEditModeCheckout, setIsEditModeCheckout] = useState(false);
  
  const storeCaptureRef = useRef(null);
  const checkoutCaptureRef = useRef(null);
  const dateInputRefStore = useRef(null);
  const dateInputRefCheckout = useRef(null);
  
  const today = new Date();
  const localDate = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(localDate);



  const handleChange = (id, field, value) => {
    setEmployees(prev => prev.map(emp => {
      if (field === 'role' && value !== '' && ['AK', 'AA', 'KK', 'KA'].includes(value)) {
        if (emp.id !== id && emp.role === value) return { ...emp, role: '' };
      }
      return emp.id === id ? { ...emp, [field]: value } : emp;
    }));
  };

  const addEmployee = (deptId) => {
    const newId = employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1;
    setEmployees([...employees, {
      id: newId, deptId, name: '', shiftStart: '09:00', shiftEnd: '18:00', breakStart: '13:00', breakEnd: '14:00', role: ''
    }]);
  };

  const deleteEmployee = (id) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id));
  };

  const handleCheckoutChange = (id, field, value) => {
    setCheckoutEmployees(prev => prev.map(emp => 
      emp.id === id ? { ...emp, [field]: value } : emp
    ));
  };

  const addCheckoutEmployee = () => {
    const newId = checkoutEmployees.length > 0 ? Math.max(...checkoutEmployees.map(e => e.id)) + 1 : 100;
    setCheckoutEmployees([...checkoutEmployees, {
      id: newId, role: 'Açılış Kasa', name: '', shiftStart: '09:30', shiftEnd: '18:00', breakStart: '14:00', breakEnd: '15:00'
    }]);
  };

  const deleteCheckoutEmployee = (id) => {
    setCheckoutEmployees(prev => prev.filter(emp => emp.id !== id));
  };

  const getRoleEmployee = (roleId) => {
    const emp = employees.find(e => e.role === roleId);
    return emp ? emp.name : '-';
  };



  const formattedDate = new Date(selectedDate).toLocaleDateString('tr-TR', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  const exportImage = async (type) => {
    const targetRef = type === 'store' ? storeCaptureRef : checkoutCaptureRef;
    if (!targetRef.current) return;
    
    const wasEditModeStore = isEditModeStore;
    const wasEditModeCheckout = isEditModeCheckout;
    
    if (type === 'store') {
      setIsEditModeStore(false);
      setIsExportingStore(true);
    } else {
      setIsEditModeCheckout(false);
      setIsExportingCheckout(true);
    }
    
    setTimeout(async () => {
      try {
        const image = await toJpeg(targetRef.current, {
          quality: 1.0,
          backgroundColor: '#2b3e94',
          pixelRatio: 2
        });
        
        const link = document.createElement('a');
        const fileNamePrefix = type === 'store' ? 'Magaza-Organizasyonu' : 'Kasa-Organizasyonu';
        link.download = `${fileNamePrefix}-${selectedDate}.jpg`;
        link.href = image;
        link.click();
      } catch (err) {
        console.error('İndirme hatası:', err);
        alert("Resim indirilirken bir hata oluştu.");
      } finally {
        if (type === 'store') {
          setIsExportingStore(false);
          if (wasEditModeStore) setIsEditModeStore(true);
        } else {
          setIsExportingCheckout(false);
          if (wasEditModeCheckout) setIsEditModeCheckout(true);
        }
      }
    }, 300); 
  };

  return (
    <div className="min-h-screen bg-gray-100 p-2 md:p-8 font-sans flex flex-col items-center relative gap-8 pb-20 text-gray-900">
      
      <div className="w-full max-w-5xl space-y-4">
        
        {/* BÖLÜM 1: MAĞAZA EKİBİ ORGANİZASYONU */}
        <div className="flex justify-between items-end mb-2 px-2 mt-4 md:mt-0">
          <h2 className="text-lg md:text-xl font-bold text-gray-700 flex items-center gap-2">
            <Store className="text-blue-600"/> 
            <span className="hidden sm:inline">Mağaza Ekibi Tablosu</span>
            <span className="sm:hidden">Mağaza Ekibi</span>
          </h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsEditModeStore(!isEditModeStore)}
              className={`flex items-center space-x-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-bold transition-all shadow-sm ${isEditModeStore ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-300' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'}`}
            >
              {isEditModeStore ? <CheckCircle size={16} /> : <Edit3 size={16} />}
              <span className="text-sm md:text-base">{isEditModeStore ? 'Bitir' : 'Düzenle'}</span>
            </button>
            <button 
              onClick={() => exportImage('store')}
              disabled={isExportingStore}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 md:px-5 md:py-2 rounded-lg font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <Download size={16} />
              <span className="text-sm md:text-base">{isExportingStore ? 'Çekiliyor...' : 'İndir'}</span>
            </button>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <div 
            ref={storeCaptureRef} 
            className="bg-[#2b3e94] p-4 md:p-10 rounded-xl shadow-2xl relative overflow-hidden text-white min-w-[800px] w-full"
          >
            <div 
              className="absolute inset-0 z-0 opacity-5 mix-blend-overlay"
              style={{ 
                backgroundImage: 'url("https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                pointerEvents: 'none'
              }}
            />

            <div className="relative z-10">
              <div className="flex justify-between items-end mb-8 border-b border-white/20 pb-4 gap-4">
                <div className="w-auto">
                  <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase leading-none m-0 italic drop-shadow-md">
                    Mağaza Organizasyonu
                  </h1>
                  
                  <div className="mt-4 flex items-center space-x-2">
                    <div className="inline-flex items-center h-full align-middle">
                        <MapPin size={18} color="#c2ff00" className="mt-[2px]" />
                    </div>
                    <div className="inline-flex items-center h-full align-middle">
                        <span className="text-[#c2ff00] font-bold tracking-widest text-[14px] md:text-[16px] leading-none">
                          843 - MERSİN TURKSPORT
                        </span>
                    </div>
                  </div>
                </div>
                
                <div className="relative cursor-pointer hover:opacity-80 transition-opacity ml-auto">
                  <div className="flex items-center space-x-2 pb-1">
                    <div className="inline-flex items-center h-full align-middle">
                        <Calendar size={20} color="#c2ff00" className="mt-[1px]" />
                    </div>
                    <div className="inline-flex items-center h-full align-middle">
                        <span className="text-[#c2ff00] font-bold text-[14px] md:text-[18px] leading-none uppercase tracking-wide">
                          {formattedDate}
                        </span>
                    </div>
                  </div>
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 m-0 p-0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 md:gap-4 mb-8">
                <RoleCard title="Açılış Kaptanı" name={getRoleEmployee('AK')} icon={Sun} color="text-amber-300" />
                <RoleCard title="Açılış Aprantisi" name={getRoleEmployee('AA')} icon={Star} color="text-yellow-200" />
                <RoleCard title="Kapanış Kaptanı" name={getRoleEmployee('KK')} icon={Moon} color="text-blue-300" />
                <RoleCard title="Kapanış Aprantisi" name={getRoleEmployee('KA')} icon={Star} color="text-indigo-300" />
              </div>

              <div className="bg-[#2b3e94] rounded shadow-sm border border-white/20 overflow-hidden flex flex-col text-sm md:text-base w-full">
                <div className="flex bg-[#1e2b6e] text-[#c2ff00] font-bold uppercase tracking-wider p-3">
                  <div className="w-[25%] px-2">Departman</div>
                  <div className="w-[35%] px-2">Takım Arkadaşı</div>
                  <div className="w-[20%] text-center">Shift</div>
                  <div className="w-[20%] text-center">Mola</div>
                </div>

                {DEPARTMENTS.map(dept => {
                  const deptEmployees = employees.filter(e => e.deptId === dept.id);
                  if (deptEmployees.length === 0 && !isEditModeStore) return null;

                  return (
                    <div key={dept.id} className="flex relative border-t border-white/20 min-h-[75px] overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-[60%] z-0 bg-cover bg-center opacity-60" style={{ backgroundImage: `url("${dept.bgImage}")` }} />
                      <div className="absolute left-0 top-0 bottom-0 w-[60%] z-0 bg-gradient-to-r from-[#1e2b6e] via-[#1e2b6e]/50 to-[#1e2b6e]/0 pointer-events-none" />

                      <div className="w-[25%] border-r border-white/20 p-4 relative z-10 flex flex-col items-start justify-center font-black text-[#c2ff00] uppercase tracking-widest break-words text-sm md:text-base leading-tight">
                        <span>{dept.name}</span>
                        {isEditModeStore && (
                          <button onClick={() => addEmployee(dept.id)} className="mt-2 flex items-center gap-1 text-xs bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded transition-colors w-max">
                            <Plus size={14} /> Kişi Ekle
                          </button>
                        )}
                      </div>

                      <div className="w-[75%] relative z-10 flex flex-col">
                        {deptEmployees.length === 0 ? (
                          <div className="flex w-full items-center justify-center p-4 text-white/50 italic">Personel bulunmuyor</div>
                        ) : (
                          deptEmployees.map(emp => (
                            <div key={emp.id} className="flex w-full border-b border-white/20 last:border-b-0 hover:bg-white/5 transition-colors">
                              <div className="w-[46.66%] p-3 border-r border-white/20 flex flex-col justify-center">
                                {isEditModeStore ? (
                                  <div className="flex flex-col gap-2 w-full">
                                    <input type="text" value={emp.name} onChange={(e) => handleChange(emp.id, 'name', e.target.value)} placeholder="İsim Girin" className="bg-black/20 border border-white/20 rounded px-2 py-1 text-white outline-none focus:border-[#c2ff00] w-full" />
                                    <div className="flex items-center justify-between">
                                      <select value={emp.role} onChange={(e) => handleChange(emp.id, 'role', e.target.value)} className="bg-[#1e2b6e] text-xs text-white border border-white/20 rounded px-1 py-1 outline-none w-3/4">
                                        {ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                                      </select>
                                      <button onClick={() => deleteEmployee(emp.id)} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={16} /></button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="font-bold tracking-wide flex flex-wrap items-center">
                                    <span>{emp.name}</span>
                                    {emp.role && <span className={`ml-1 font-semibold ${emp.role === 'Destek' ? 'text-pink-400' : 'text-[#c2ff00]'}`}>({emp.role})</span>}
                                  </div>
                                )}
                              </div>
                              <div className="w-[26.66%] p-3 border-r border-white/20 flex items-center justify-center text-center font-medium">
                                {isEditModeStore ? (
                                  <div className="flex items-center justify-center gap-1 flex-wrap">
                                    <input type="time" value={emp.shiftStart} onChange={(e) => handleChange(emp.id, 'shiftStart', e.target.value)} className="bg-black/20 text-white px-1 py-1 rounded text-xs outline-none" />
                                    <span className="text-xs">-</span>
                                    <input type="time" value={emp.shiftEnd} onChange={(e) => handleChange(emp.id, 'shiftEnd', e.target.value)} className="bg-black/20 text-white px-1 py-1 rounded text-xs outline-none" />
                                  </div>
                                ) : <span>{emp.shiftStart} - {emp.shiftEnd}</span>}
                              </div>
                              <div className="w-[26.66%] p-3 flex items-center justify-center text-center font-medium">
                                {isEditModeStore ? (
                                  <div className="flex items-center justify-center gap-1 flex-wrap">
                                    <input type="time" value={emp.breakStart} onChange={(e) => handleChange(emp.id, 'breakStart', e.target.value)} className="bg-black/20 text-white px-1 py-1 rounded text-xs outline-none" />
                                    <span className="text-xs">-</span>
                                    <input type="time" value={emp.breakEnd} onChange={(e) => handleChange(emp.id, 'breakEnd', e.target.value)} className="bg-black/20 text-white px-1 py-1 rounded text-xs outline-none" />
                                  </div>
                                ) : <span>{emp.breakStart} - {emp.breakEnd}</span>}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-10 flex justify-end w-full">
                <DecathlonLogo />
              </div>
            </div>
          </div>
        </div>


        {/* BÖLÜM 2: DANIŞMA & KASA ORGANİZASYONU */}
        <div className="flex justify-between items-end mt-12 mb-2 px-2">
          <h2 className="text-lg md:text-xl font-bold text-gray-700 flex items-center gap-2">
            <CreditCard className="text-blue-600"/> 
            <span className="hidden sm:inline">Danışma & Kasa Tablosu</span>
            <span className="sm:hidden">Danışma & Kasa</span>
          </h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsEditModeCheckout(!isEditModeCheckout)}
              className={`flex items-center space-x-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-bold transition-all shadow-sm ${isEditModeCheckout ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-300' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'}`}
            >
              {isEditModeCheckout ? <CheckCircle size={16} /> : <Edit3 size={16} />}
              <span className="text-sm md:text-base">{isEditModeCheckout ? 'Bitir' : 'Düzenle'}</span>
            </button>
            <button 
              onClick={() => exportImage('checkout')}
              disabled={isExportingCheckout}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 md:px-5 md:py-2 rounded-lg font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <Download size={16} />
              <span className="text-sm md:text-base">{isExportingCheckout ? 'Çekiliyor...' : 'İndir'}</span>
            </button>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <div 
            ref={checkoutCaptureRef} 
            className="bg-[#2b3e94] p-4 md:p-10 rounded-xl shadow-2xl relative overflow-hidden text-white min-w-[800px] w-full"
          >
            <div 
              className="absolute inset-0 z-0 bg-cover md:bg-contain bg-center bg-no-repeat opacity-10 mix-blend-screen"
              style={{ backgroundImage: 'url("https://halklailiskiler.co/wp-content/uploads/2024/03/1710483324_BRAND_ID.png")' }}
            />

            <div className="relative z-10">
              <div className="flex justify-between items-end mb-8 border-b border-white/20 pb-4 gap-4">
                <div className="w-auto">
                  <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase leading-none m-0 italic drop-shadow-md">
                    Kasa Organizasyonu
                  </h1>
                  
                  <div className="mt-4 flex items-center space-x-2">
                    <div className="inline-flex items-center h-full align-middle">
                        <MapPin size={18} color="#c2ff00" className="mt-[2px]" />
                    </div>
                    <div className="inline-flex items-center h-full align-middle">
                        <span className="text-[#c2ff00] font-bold tracking-widest text-[14px] md:text-[16px] leading-none">
                          843 - MERSİN TURKSPORT
                        </span>
                    </div>
                  </div>
                </div>
                
                <div className="relative cursor-pointer hover:opacity-80 transition-opacity ml-auto">
                  <div className="flex items-center space-x-2 pb-1">
                    <div className="inline-flex items-center h-full align-middle">
                        <Calendar size={20} color="#c2ff00" className="mt-[1px]" />
                    </div>
                    <div className="inline-flex items-center h-full align-middle">
                        <span className="text-[#c2ff00] font-bold text-[14px] md:text-[18px] leading-none uppercase tracking-wide">
                          {formattedDate}
                        </span>
                    </div>
                  </div>
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 m-0 p-0"
                  />
                </div>
              </div>

              <div className="relative bg-[#2b3e94] rounded shadow-sm border border-white/20 overflow-hidden flex flex-col text-sm md:text-base w-full">
                
                <div className="relative z-10 flex bg-[#1e2b6e]/80 text-[#c2ff00] font-bold uppercase tracking-wider p-3 border-b border-white/20">
                  <div className="w-[25%] px-2">Görev</div>
                  <div className="w-[35%] px-2">Takım Arkadaşı</div>
                  <div className="w-[20%] text-center">Shift</div>
                  <div className="w-[20%] text-center">Mola</div>
                </div>

                <div className="relative z-10 flex flex-col bg-black/10 backdrop-blur-sm">
                  {checkoutEmployees.length === 0 && !isEditModeCheckout ? (
                    <div className="p-4 text-center text-white/50 italic">Kasa personeli bulunmuyor</div>
                  ) : (
                    checkoutEmployees.map((emp) => (
                      <div key={emp.id} className="flex w-full border-b border-white/20 last:border-b-0 hover:bg-white/5 transition-colors items-center min-h-[60px]">
                        
                        <div className="w-[25%] p-3 border-r border-white/20 font-black text-[#c2ff00] uppercase tracking-wide text-xs md:text-sm">
                          {isEditModeCheckout ? (
                            <select value={emp.role} onChange={(e) => handleCheckoutChange(emp.id, 'role', e.target.value)} className="bg-[#1e2b6e] text-xs text-white border border-white/20 rounded px-1 py-1 outline-none w-full">
                              <option value="">Görev Seç...</option>
                              {CHECKOUT_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                          ) : <span>{emp.role}</span>}
                        </div>
                        
                        <div className="w-[35%] p-3 border-r border-white/20">
                          {isEditModeCheckout ? (
                            <div className="flex items-center justify-between gap-2">
                              <input type="text" value={emp.name} onChange={(e) => handleCheckoutChange(emp.id, 'name', e.target.value)} placeholder="İsim Girin" className="bg-black/20 border border-white/20 rounded px-2 py-1 text-white outline-none focus:border-[#c2ff00] w-full" />
                              <button onClick={() => deleteCheckoutEmployee(emp.id)} className="text-red-400 hover:text-red-300 p-1 min-w-max"><Trash2 size={16} /></button>
                            </div>
                          ) : <span className="font-bold tracking-wide text-white">{emp.name}</span>}
                        </div>

                        <div className="w-[20%] p-3 border-r border-white/20 flex items-center justify-center text-center font-medium">
                          {isEditModeCheckout ? (
                            <div className="flex items-center justify-center gap-1 flex-wrap">
                              <input type="time" value={emp.shiftStart} onChange={(e) => handleCheckoutChange(emp.id, 'shiftStart', e.target.value)} className="bg-black/20 text-white px-1 py-1 rounded text-xs outline-none w-full md:w-auto" />
                              <span className="text-xs hidden md:inline">-</span>
                              <input type="time" value={emp.shiftEnd} onChange={(e) => handleCheckoutChange(emp.id, 'shiftEnd', e.target.value)} className="bg-black/20 text-white px-1 py-1 rounded text-xs outline-none w-full md:w-auto" />
                            </div>
                          ) : <span>{emp.shiftStart} - {emp.shiftEnd}</span>}
                        </div>

                        <div className="w-[20%] p-3 flex items-center justify-center text-center font-medium">
                          {isEditModeCheckout ? (
                            <div className="flex items-center justify-center gap-1 flex-wrap">
                              <input type="time" value={emp.breakStart} onChange={(e) => handleCheckoutChange(emp.id, 'breakStart', e.target.value)} className="bg-black/20 text-white px-1 py-1 rounded text-xs outline-none w-full md:w-auto" />
                              <span className="text-xs hidden md:inline">-</span>
                              <input type="time" value={emp.breakEnd} onChange={(e) => handleCheckoutChange(emp.id, 'breakEnd', e.target.value)} className="bg-black/20 text-white px-1 py-1 rounded text-xs outline-none w-full md:w-auto" />
                            </div>
                          ) : <span>{emp.breakStart} - {emp.breakEnd}</span>}
                        </div>

                      </div>
                    ))
                  )}
                  
                  {isEditModeCheckout && (
                    <div className="p-3 border-t border-white/20 flex justify-center bg-white/5">
                      <button onClick={addCheckoutEmployee} className="flex items-center gap-2 text-sm bg-white/10 hover:bg-white/20 text-[#c2ff00] px-4 py-2 rounded transition-colors font-bold tracking-wider">
                        <Plus size={16} /> Yeni Kasa Görevi Ekle
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-10 flex justify-end w-full">
                <DecathlonLogo />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function RoleCard({ title, name, icon: Icon, color }) {
  return (
    <div className="bg-[#1e2b6e]/80 border border-white/10 rounded-lg p-2 md:p-3 flex items-center space-x-2 md:space-x-3 backdrop-blur-sm shadow-sm transition-transform hover:scale-[1.02] flex-col md:flex-row text-center md:text-left h-full">
      <div className={`p-1.5 md:p-2 rounded-full bg-white/5 ${color} shrink-0 mb-1 md:mb-0`}>
        <Icon size={18} className="md:w-5 md:h-5" />
      </div>
      <div className="flex flex-col justify-center h-full">
        <p className="text-[9px] md:text-xs text-white/70 uppercase tracking-wider font-semibold leading-tight">{title}</p>
        <p className={`font-bold text-xs md:text-base mt-0.5 leading-tight ${name === '-' ? 'text-white/40 italic' : 'text-white'}`}>{name}</p>
      </div>
    </div>
  );
}

function DecathlonLogo() {
  return (
    <div className="select-none flex flex-col items-end">
        <span 
          style={{ 
            fontFamily: '"Arial Black", "Inter", sans-serif',
            letterSpacing: '-0.04em',
            transform: 'skewX(-2deg)' 
          }}
          className="text-2xl md:text-3xl font-black italic text-white tracking-tighter leading-none"
        >
          DECATHLON
        </span>
    </div>
  );
}
