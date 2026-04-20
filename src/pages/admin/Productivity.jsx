import React from 'react';
import { useData } from '../../context/DataContext';
import { Activity } from 'lucide-react';

export default function Productivity() {
  const { departments, setDepartments } = useData();

  const handleProductivityChange = (id, newTarget) => {
    setDepartments(departments.map(dept => 
      dept.id === id ? { ...dept, targetProductivity: Number(newTarget) } : dept
    ));
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
                      value={dept.targetProductivity}
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
