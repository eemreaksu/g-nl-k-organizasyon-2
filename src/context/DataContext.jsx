import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { doc, collection, setDoc, onSnapshot } from 'firebase/firestore';
import { useAuth } from './AuthContext';

const DataContext = createContext();

const INITIAL_DEPARTMENTS = [
  { id: 'quechua', name: 'Quechua', targetProductivity: 1500, bgImage: 'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { id: 'kosu', name: 'Koşu/Fitness', targetProductivity: 2000, bgImage: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { id: 'su', name: 'Su Sporları', targetProductivity: 1800, bgImage: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { id: 'takim', name: 'Takım Sporları', targetProductivity: 1200, bgImage: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
  { id: 'bisiklet', name: 'Bisiklet', targetProductivity: 2500, bgImage: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
];

const INITIAL_USERS = [
  { id: 'u1', name: 'Pelin', deptId: 'quechua', isCaptain: 0 },
  { id: 'u2', name: 'Melda', deptId: 'quechua', isCaptain: 0 },
  { id: 'u3', name: 'Ahmet', deptId: 'quechua', isCaptain: 1 },
  { id: 'u4', name: 'Damla', deptId: 'kosu', isCaptain: 0 },
  { id: 'u5', name: 'Selin', deptId: 'kosu', isCaptain: 1 },
  { id: 'u6', name: 'Ahmet Çevik', deptId: 'kosu', isCaptain: 0 },
  { id: 'u7', name: 'Bahar', deptId: 'su', isCaptain: 0 },
  { id: 'u8', name: 'Gülper', deptId: 'su', isCaptain: 1 },
  { id: 'u9', name: 'Deniz', deptId: 'su', isCaptain: 0 },
  { id: 'u10', name: 'Mert Can', deptId: 'takim', isCaptain: 1 },
  { id: 'u11', name: 'Kerem', deptId: 'takim', isCaptain: 0 },
  { id: 'u12', name: 'Zeynep', deptId: 'takim', isCaptain: 0 },
  { id: 'u13', name: 'Görkem', deptId: 'bisiklet', isCaptain: 0 },
  { id: 'u14', name: 'Eyyüp', deptId: 'bisiklet', isCaptain: 0 },
  { id: 'u15', name: 'Mustafa', deptId: 'bisiklet', isCaptain: 1 },
];

export function DataProvider({ children }) {
  const [departments, setDepartmentsLocal] = useState(INITIAL_DEPARTMENTS);
  const [users, setUsersLocal] = useState(INITIAL_USERS);
  const [captainSchedule, setCaptainScheduleLocal] = useState({}); 
  const [rekor, setRekorLocal] = useState('2 292 000');
  
  const [allDailyShifts, setAllDailyShiftsLocal] = useState({});
  const [allDailySales, setAllDailySalesLocal] = useState({});
  const [allDailyActualSales, setAllDailyActualSalesLocal] = useState({});
  const [allDailyMVPs, setAllDailyMVPsLocal] = useState({});
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 1. Subscribe to Global config
    const unsubscribeGlobal = onSnapshot(doc(db, 'config', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        let depts = data.departments || [];
        if (!depts.find(d => d.id === 'triathlon')) {
          depts.push({ id: 'triathlon', name: 'TRIATHLON//CRL', targetProductivity: 1500, bgImage: 'https://images.unsplash.com/photo-1541252878129-bdf3114aabd5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' });
          setDoc(doc(db, 'config', 'global'), { departments: depts }, { merge: true });
        }
        
        setDepartmentsLocal(depts);
        if (data.users) setUsersLocal(data.users);
        if (data.captainSchedule) setCaptainScheduleLocal(data.captainSchedule);
        if (data.rekor) setRekorLocal(data.rekor);
        setIsReady(true);
      } else {
        // SEED from localStorage if it exists, otherwise use INITIAL
        const lsDepts = JSON.parse(window.localStorage.getItem('decathlon_departments') || "null");
        const lsUsers = JSON.parse(window.localStorage.getItem('decathlon_users') || "null");
        const lsCapt = JSON.parse(window.localStorage.getItem('decathlon_captain_schedule') || "null");
        const lsRekor = JSON.parse(window.localStorage.getItem('decathlon_rekor') || "null");
        
        setDoc(doc(db, 'config', 'global'), {
          departments: lsDepts || INITIAL_DEPARTMENTS,
          users: lsUsers || INITIAL_USERS,
          captainSchedule: lsCapt || {},
          rekor: lsRekor || '2 292 000'
        });

        // Seed daily data from localStorage
        const lsShifts = JSON.parse(window.localStorage.getItem('decathlon_daily_shifts') || "{}");
        const lsSales = JSON.parse(window.localStorage.getItem('decathlon_daily_sales') || "{}");
        const allDates = new Set([...Object.keys(lsShifts), ...Object.keys(lsSales)]);
        allDates.forEach(date => {
          setDoc(doc(db, 'dailyData', date), {
            shifts: lsShifts[date] || [],
            manualSales: lsSales[date] || {}
          }, { merge: true });
        });
      }
    });

    // 2. Subscribe to Daily Data collection
    const unsubscribeDaily = onSnapshot(collection(db, 'dailyData'), (snapshot) => {
      const newShifts = {};
      const newSales = {};
      const newActualSales = {};
      const newMVPs = {};
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        newShifts[docSnap.id] = data.shifts || [];
        newSales[docSnap.id] = data.manualSales || {};
        newActualSales[docSnap.id] = data.actualSales || {};
        newMVPs[docSnap.id] = data.mvps || [];
      });
      setAllDailyShiftsLocal(newShifts);
      setAllDailySalesLocal(newSales);
      setAllDailyActualSalesLocal(newActualSales);
      setAllDailyMVPsLocal(newMVPs);
    });

    return () => {
      unsubscribeGlobal();
      unsubscribeDaily();
    };
  }, []);

  // Setters wrap Firestore writes
  const setDepartments = (val) => {
    const newVal = typeof val === 'function' ? val(departments) : val;
    setDoc(doc(db, 'config', 'global'), { departments: newVal }, { merge: true });
  };
  const setUsers = (val) => {
    const newVal = typeof val === 'function' ? val(users) : val;
    setDoc(doc(db, 'config', 'global'), { users: newVal }, { merge: true });
  };
  const setCaptainSchedule = (val) => {
    const newVal = typeof val === 'function' ? val(captainSchedule) : val;
    setDoc(doc(db, 'config', 'global'), { captainSchedule: newVal }, { merge: true });
  };
  const setRekor = (val) => {
    const newVal = typeof val === 'function' ? val(rekor) : val;
    setDoc(doc(db, 'config', 'global'), { rekor: newVal }, { merge: true });
  };

  const updateDailyShifts = (date, nextShiftsOrFn) => {
    setAllDailyShiftsLocal(prev => {
      const current = prev[date] || [];
      const next = typeof nextShiftsOrFn === 'function' ? nextShiftsOrFn(current) : nextShiftsOrFn;
      setDoc(doc(db, 'dailyData', date), { shifts: next }, { merge: true });
      return { ...prev, [date]: next };
    });
  };
  
  const updateDailySales = (date, nextSalesOrFn) => {
    setAllDailySalesLocal(prev => {
      const current = prev[date] || {};
      const next = typeof nextSalesOrFn === 'function' ? nextSalesOrFn(current) : nextSalesOrFn;
      setDoc(doc(db, 'dailyData', date), { manualSales: next }, { merge: true });
      return { ...prev, [date]: next };
    });
  };

  const updateDailyActualSales = (date, nextSalesOrFn) => {
    setAllDailyActualSalesLocal(prev => {
      const current = prev[date] || {};
      const next = typeof nextSalesOrFn === 'function' ? nextSalesOrFn(current) : nextSalesOrFn;
      setDoc(doc(db, 'dailyData', date), { actualSales: next }, { merge: true });
      return { ...prev, [date]: next };
    });
  };

  const updateDailyMVPs = (date, nextMVPsOrFn) => {
    setAllDailyMVPsLocal(prev => {
      const current = prev[date] || [];
      const next = typeof nextMVPsOrFn === 'function' ? nextMVPsOrFn(current) : nextMVPsOrFn;
      setDoc(doc(db, 'dailyData', date), { mvps: next }, { merge: true });
      return { ...prev, [date]: next };
    });
  };

  const value = {
    departments, setDepartments,
    users, setUsers,
    captainSchedule, setCaptainSchedule,
    rekor, setRekor,
    allDailyShifts, updateDailyShifts,
    allDailySales, updateDailySales,
    allDailyActualSales, updateDailyActualSales,
    allDailyMVPs, updateDailyMVPs
  };

  const { currentUser, loading: authLoading } = useAuth();

  if (authLoading || (currentUser && !isReady)) {
    return <div className="min-h-screen flex items-center justify-center bg-[#1e2b6e] text-white font-bold text-xl uppercase tracking-widest">Sistem Yükleniyor...</div>;
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  return useContext(DataContext);
}
