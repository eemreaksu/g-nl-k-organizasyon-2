import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Calendar as CalendarIcon, Save } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDaysInMonth, addMonths, subMonths } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function CaptainOrganization() {
  const { users, captainSchedule, setCaptainSchedule, allDailyShifts, updateDailyShifts } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const handleRoleChange = (dateStr, role, userId) => {
    setCaptainSchedule(prev => ({
      ...prev,
      [dateStr]: {
        ...prev[dateStr],
        [role]: userId
      }
    }));
    
    const currentShifts = allDailyShifts[dateStr] ? [...allDailyShifts[dateStr]] : [];
    
    const oldShiftIndex = currentShifts.findIndex(s => s.role === role);
    if (oldShiftIndex !== -1) {
       currentShifts[oldShiftIndex].role = '';
    }

    if (userId) {
       const userObj = users.find(u => u.id === userId);
       const userShiftIndex = currentShifts.findIndex(s => s.userId === userId);
       if (userShiftIndex !== -1) {
          currentShifts[userShiftIndex].role = role;
       } else if (userObj) {
          currentShifts.push({
             id: `auto-${Date.now()}-${role}`,
             deptId: userObj.deptId,
             userId: userObj.id,
             shiftStart: '09:00',
             shiftEnd: '18:00',
             breakStart: '13:00',
             breakEnd: '14:00',
             role: role
          });
       }
    }
    
    updateDailyShifts(dateStr, currentShifts);
  };

  const captains = users.filter(u => u.isCaptain === 1);
  const others = users.filter(u => u.isCaptain === 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <h2 className="text-2xl font-black text-[#1e2b6e] uppercase tracking-tighter flex items-center gap-2">
          <CalendarIcon size={28} className="text-blue-600"/> 
          Aylık Kaptan Çizelgesi
        </h2>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-[#1e2b6e] text-white p-4 flex justify-between items-center">
          <button onClick={prevMonth} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-bold">Önceki</button>
          <div className="text-xl font-black uppercase tracking-widest text-[#c2ff00]">
            {format(currentDate, 'MMMM yyyy', { locale: tr })}
          </div>
          <button onClick={nextMonth} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-bold">Sonraki</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
              <tr>
                <th scope="col" className="px-6 py-3 min-w-[120px]">Tarih</th>
                <th scope="col" className="px-6 py-3 min-w-[150px]">Açılış Kaptanı (AK)</th>
                <th scope="col" className="px-6 py-3 min-w-[150px]">Açılış Apranti (AA)</th>
                <th scope="col" className="px-6 py-3 min-w-[150px]">Kapanış Kaptanı (KK)</th>
                <th scope="col" className="px-6 py-3 min-w-[150px]">Kapanış Apranti (KA)</th>
              </tr>
            </thead>
            <tbody>
              {daysInMonth.map((day) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');
                const daySchedule = captainSchedule[dateStr] || {};
                
                const getAvailableCaptains = (currentRole) => {
                  return captains.filter(c => {
                    const assignedRole = Object.keys(daySchedule).find(r => daySchedule[r] === c.id);
                    return !assignedRole || assignedRole === currentRole;
                  });
                };
                
                return (
                  <tr key={dateStr} className={`border-b ${isToday ? 'bg-amber-100/50 outline outline-2 outline-amber-400' : 'bg-white hover:bg-gray-50'}`}>
                    <th scope="row" className={`px-6 py-4 font-bold whitespace-nowrap ${isToday ? 'text-amber-900' : 'text-gray-900'}`}>
                      {format(day, 'dd MMMM EEEE', { locale: tr })}
                      {isToday && <span className="ml-2 px-1.5 py-0.5 rounded bg-amber-500 text-white text-[10px] uppercase">Bugün</span>}
                    </th>
                    <td className="px-6 py-4">
                      <select 
                        value={daySchedule['AK'] || ''} 
                        onChange={(e) => handleRoleChange(dateStr, 'AK', e.target.value)}
                        className="bg-blue-50 border border-blue-200 text-blue-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 font-bold"
                      >
                        <option value="">Seçiniz...</option>
                        {getAvailableCaptains('AK').map(c => <option key={'ak'+c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={daySchedule['AA'] || ''} 
                        onChange={(e) => handleRoleChange(dateStr, 'AA', e.target.value)}
                        className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5"
                      >
                        <option value="">Seçiniz...</option>
                        {getAvailableCaptains('AA').map(c => <option key={'aa'+c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={daySchedule['KK'] || ''} 
                        onChange={(e) => handleRoleChange(dateStr, 'KK', e.target.value)}
                        className="bg-blue-50 border border-blue-200 text-blue-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 font-bold"
                      >
                        <option value="">Seçiniz...</option>
                        {getAvailableCaptains('KK').map(c => <option key={'kk'+c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={daySchedule['KA'] || ''} 
                        onChange={(e) => handleRoleChange(dateStr, 'KA', e.target.value)}
                        className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5"
                      >
                        <option value="">Seçiniz...</option>
                        {getAvailableCaptains('KA').map(c => <option key={'ka'+c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
