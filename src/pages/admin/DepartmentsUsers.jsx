import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Users, Plus, Trash2, Key } from 'lucide-react';

export default function DepartmentsUsers() {
  const { departments, users, setUsers } = useData();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [newUser, setNewUser] = useState({
    name: '',
    deptId: departments[0]?.id || '',
    isCaptain: 0,
    workType: 'Full Time',
    password: ''
  });

  const generateUserCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const generateRandomPassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUser.name) return;
    
    if (editingId) {
      setUsers(users.map(u => u.id === editingId ? {
        ...u,
        name: newUser.name,
        deptId: newUser.deptId,
        isCaptain: Number(newUser.isCaptain),
        workType: newUser.workType,
        password: newUser.password || u.password
      } : u));
    } else {
      const userCode = generateUserCode();
      const newEntry = {
        id: Date.now().toString(),
        name: newUser.name,
        deptId: newUser.deptId,
        isCaptain: Number(newUser.isCaptain),
        workType: newUser.workType,
        userCode,
        password: newUser.password || generateRandomPassword()
      };
      setUsers([...users, newEntry]);
    }
    
    setIsAdding(false);
    setEditingId(null);
    setNewUser({ name: '', deptId: departments[0]?.id || '', isCaptain: 0, workType: 'Full Time', password: '' });
  };

  const handleDelete = (id) => {
    setUsers(users.filter(u => u.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b pb-4">
        <h2 className="text-2xl font-black text-[#1e2b6e] uppercase tracking-tighter flex items-center gap-2">
          <Users size={28} className="text-blue-600"/> 
          Departmanlar & Kişiler
        </h2>
        <button 
          onClick={() => {
            setIsAdding(!isAdding);
            if (!isAdding) {
              setEditingId(null);
              setNewUser({ name: '', deptId: departments[0]?.id || '', isCaptain: 0, workType: 'Full Time', password: '' });
            }
          }}
          className="flex items-center space-x-2 bg-[#c2ff00] hover:bg-[#a8e600] text-[#1e2b6e] px-4 py-2 rounded-lg font-bold shadow-md transition-all active:scale-95"
        >
          <Plus size={16} />
          <span>Yeni Kişi Ekle</span>
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <h3 className="text-lg font-bold mb-4">{editingId ? 'Kişi Düzenle' : 'Yeni Takım Arkadaşı'}</h3>
          <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cinsiyet/İsim Soyisim</label>
              <input 
                type="text" 
                required
                value={newUser.name}
                onChange={e => setNewUser({...newUser, name: e.target.value})}
                className="w-full border border-gray-300 rounded p-2 focus:ring-[#c2ff00] focus:border-blue-500"
                placeholder="Örn: Ahmet Yılmaz"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Departman</label>
              <select 
                value={newUser.deptId}
                onChange={e => setNewUser({...newUser, deptId: e.target.value})}
                className="w-full border border-gray-300 rounded p-2"
              >
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <select 
                value={newUser.isCaptain}
                onChange={e => setNewUser({...newUser, isCaptain: e.target.value})}
                className="w-full border border-gray-300 rounded p-2"
              >
                <option value={0}>Takım Arkadaşı</option>
                <option value={1}>Kaptan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Çalışma Türü</label>
              <select 
                value={newUser.workType}
                onChange={e => setNewUser({...newUser, workType: e.target.value})}
                className="w-full border border-gray-300 rounded p-2"
              >
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
              <input 
                type="text" 
                value={newUser.password}
                onChange={e => setNewUser({...newUser, password: e.target.value})}
                className="w-full border border-gray-300 rounded p-2"
                placeholder={editingId ? 'Boş bırakırsanız değişmez' : 'Boş bırakırsanız 6 haneli rastgele'}
              />
            </div>
            <div>
              <button type="submit" className="w-full bg-[#1e2b6e] text-white p-2 text-sm rounded font-bold hover:bg-blue-800 transition-colors">
                {editingId ? 'Kaydet' : 'Oluştur'}
              </button>
            </div>
          </form>
          <div className="text-xs text-gray-500 mt-2">Not: Kullanıcı Kodu (5 harfli) otomatik oluşturulacaktır.</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map(dept => {
          const deptUsers = users.filter(u => u.deptId === dept.id);
          
          return (
            <div key={dept.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div 
                className="h-20 bg-cover bg-center flex items-end p-3 relative"
                style={{ backgroundImage: `url("${dept.bgImage}")` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#1e2b6e] to-transparent" />
                <h3 className="relative z-10 text-[#c2ff00] font-black uppercase tracking-widest text-lg drop-shadow-md">
                  {dept.name}
                </h3>
              </div>
              
              <ul className="divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
                {deptUsers.length === 0 ? (
                  <li className="p-4 text-center text-gray-400 italic text-sm">Kişi bulunamadı.</li>
                ) : (
                  deptUsers.map(user => (
                    <li key={user.id} className="p-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div>
                        <div className="font-bold text-gray-800 flex items-center gap-2">
                          {user.name} 
                          <span className="text-[10px] text-gray-500 font-normal px-1 border border-gray-300 rounded">
                            {user.workType || 'Full Time'}
                          </span>
                          {user.isCaptain === 1 && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] rounded uppercase font-black">Kaptan</span>}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 font-mono">
                          <Key size={12} className="text-gray-400"/> {user.userCode || 'N/A'}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setEditingId(user.id);
                            setNewUser({
                              name: user.name,
                              deptId: user.deptId,
                              isCaptain: user.isCaptain,
                              workType: user.workType || 'Full Time',
                              password: ''
                            });
                            setIsAdding(true);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
