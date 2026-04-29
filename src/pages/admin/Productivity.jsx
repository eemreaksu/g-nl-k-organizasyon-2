import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { Activity } from 'lucide-react';

export default function Productivity() {
  const { departments, setDepartments } = useData();
  
  // Local state to prevent cursor jumping and input lag
  const [localTargets, setLocalTargets] = useState({});
  const activeInputs = useRef(new Set());
  const debounceTimers = useRef({});

  useEffect(() => {
    setLocalTargets(prev => {
      const merged = { ...prev };
      departments.forEach(dept => {
        if (!activeInputs.current.has(dept.id)) {
          merged[dept.id] = dept.targetProductivity;
        }
      });
      return merged;
    });
  }, [departments]);

  const handleProductivityChange = (id, newTarget) => {
    setLocalTargets(prev => ({ ...prev, [id]: newTarget }));
    activeInputs.current.add(id);
    
    if (debounceTimers.current[id]) clearTimeout(debounceTimers.current[id]);
    
    debounceTimers.current[id] = setTimeout(() => {
      setDepartments(prevDepts => 
        prevDepts.map(dept => 
          dept.id === id ? { ...dept, targetProductivity: Number(newTarget) } : dept
        )
      );
      activeInputs.current.delete(id);
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b pb-4">
        <h2 className="text-2xl font-black text-[#1e2b6e] uppercase tracking-tighter flex items-center gap-2">
          <Activity size={28} className="text-blue-600"/> 
          Productivity Hedefleri
        </h2>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-6 font-medium">
            Bu değerler Günlük Organizasyon tablosundaki "Hedef Ciro" hesaplamasında (Net Çalışma Saati × Hedef) kullanılır. Değiştirdiğiniz anda günlük hedef cirolar otomatik olarak güncellenecektir.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <div key={dept.id} className="relative bg-gray-50 border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <Activity size={40} />
                </div>
                
                <h3 className="text-lg font-black text-[#1e2b6e] uppercase mb-4">{dept.name}</h3>
                
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Saatlik Ciro Hedefi (₺)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={localTargets[dept.id] !== undefined ? localTargets[dept.id] : dept.targetProductivity}
                      onChange={(e) => handleProductivityChange(dept.id, e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg p-3 text-lg font-black text-gray-800 focus:ring-2 focus:ring-[#c2ff00] focus:border-[#1e2b6e] transition-all"
                      placeholder="Örn: 1500"
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400 font-bold">
                      ₺ / Saat
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
