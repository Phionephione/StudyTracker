import React, { useState, useEffect } from 'react';
import { Activity, Clock, Target, Shield, Zap, BarChart3, History, LayoutDashboard, Timer, RotateCcw, UserCircle2, Lock, LogOut, Sun, Moon, Sparkles } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_URL || '${API_BASE_URL}';
const COLORS = ['#00ffff', '#ff00ff', '#bc13fe', '#ffcc00', '#00ff00', '#ff4d4d'];

function App() {
  const [view, setView] = useState('landing'); 
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('cyber_user')) || null);
  const [theme, setTheme] = useState(localStorage.getItem('cyber_theme') || 'neon'); // Default back to Neon!
  const [activeTab, setActiveTab] = useState('overview');
  
  const [authData, setAuthData] = useState({ username: '', password: '', isLogin: true });
  const [subject, setSubject] = useState('');
  const [hours, setHours] = useState('');
  const [statusMsg, setStatusMsg] = useState('SYSTEM_READY');
  const [data, setData] = useState({ total_hours: 0, streak: 0, efficiency: 0, chartData: [], history: [] });
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => { localStorage.setItem('cyber_theme', theme); }, [theme]);

  useEffect(() => {
    if (user) { setView('dashboard'); fetchData(); }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/get-data/${user.user_id}`);
      setData(res.data);
    } catch (err) { console.error(err); }
  };

  const handleAuth = async () => {
    const endpoint = authData.isLogin ? 'login' : 'register';
    try {
        const res = await axios.post(`${API_BASE_URL}/${endpoint}`, {
            username: authData.username, password: authData.password
        });
        localStorage.setItem('cyber_user', JSON.stringify(res.data));
        setUser(res.data);
    } catch (err) { alert("AUTH_FAILED"); }
  };

  const handleUpload = async () => {
    if (!subject || !hours) return;
    try {
      await axios.post('${API_BASE_URL}/add-log', { user_id: user.user_id, subject, hours });
      setSubject(''); setHours(''); fetchData();
      setStatusMsg('UPLOAD_SUCCESS');
      setTimeout(() => setStatusMsg('SYSTEM_READY'), 3000);
    } catch { setStatusMsg('UPLOAD_FAILED'); }
  };

  const logout = () => { localStorage.removeItem('cyber_user'); setUser(null); setView('landing'); };

  // 3-WAY THEME TOGGLE
  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('neon');
    else setTheme('light');
  };

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) { interval = setInterval(() => setTimeLeft(t => t - 1), 1000); }
    else if (timeLeft === 0) { setIsActive(false); alert("FOCUS_COMPLETE"); }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // --- STYLING LOGIC ---
  const isNeon = theme === 'neon';
  const isLight = theme === 'light';
  
  const bgMain = isLight ? 'bg-solar-white' : (isNeon ? 'bg-cyber-bg' : 'bg-slate-900');
  const txtMain = isLight ? 'text-solar-slate' : 'text-white';
  const cardBase = isLight ? 'bg-white border-slate-200 shadow-solar-soft' : (isNeon ? 'bg-black/80 border-neon-blue shadow-neon-blue' : 'bg-slate-800/50 border-slate-700');
  const accentColor = isLight ? 'text-sky-600' : (isNeon ? 'text-neon-blue drop-shadow-neon-blue' : 'text-indigo-400');
  const btnPrimary = isLight ? 'bg-solar-slate text-white' : (isNeon ? 'bg-neon-blue text-black shadow-neon-blue' : 'bg-indigo-600 text-white');

  if (view === 'landing' && !user) {
    return (
      <div className={`min-h-screen ${bgMain} ${txtMain} flex flex-col items-center justify-center font-mono p-6 transition-all duration-700`}>
        <Activity className={`w-24 h-24 ${accentColor} mb-10 animate-bounce`} />
        <h1 className={`text-7xl md:text-9xl font-black italic mb-12 text-center tracking-tighter ${isNeon ? 'text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-pink' : ''}`}>STUDY_TRACKER</h1>
        <button onClick={() => setView('auth')} className={`px-20 py-8 font-black uppercase tracking-[0.5em] skew-x-[-15deg] transition-all hover:scale-110 ${btnPrimary}`}>Initiate_Link</button>
      </div>
    );
  }

  if (view === 'auth') {
    return (
        <div className={`min-h-screen ${bgMain} ${txtMain} flex items-center justify-center font-mono p-6`}>
            <div className={`w-full max-w-md border-2 p-10 ${cardBase}`}>
                <h2 className="text-2xl font-black mb-8 italic uppercase border-b border-black/10 pb-4">{authData.isLogin ? 'Access_ID' : 'Create_ID'}</h2>
                <div className="space-y-6">
                    <input type="text" placeholder="USERNAME" onChange={(e) => setAuthData({...authData, username: e.target.value})} className={`w-full border p-4 font-bold outline-none uppercase ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/40 border-white/10 text-white'}`} />
                    <input type="password" placeholder="PASSWORD" onChange={(e) => setAuthData({...authData, password: e.target.value})} className={`w-full border p-4 font-bold outline-none ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/40 border-white/10 text-white'}`} />
                    <button onClick={handleAuth} className={`w-full font-black py-4 uppercase transition-all ${btnPrimary}`}>Confirm_Identity</button>
                    <p onClick={() => setAuthData({...authData, isLogin: !authData.isLogin})} className="text-center text-[10px] opacity-40 cursor-pointer uppercase tracking-widest mt-4">Switch_Mode</p>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgMain} ${txtMain} font-mono flex transition-all duration-500`}>
      {/* SIDEBAR */}
      <nav className={`w-64 border-r flex flex-col items-center py-8 gap-4 ${isLight ? 'bg-white border-slate-200' : 'bg-black/60 border-white/5'}`}>
        <Shield className={`${accentColor} w-12 h-12 mb-10 animate-pulse`} />
        {['overview', 'analytics', 'focus', 'history'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex items-center gap-4 w-full px-8 py-4 text-[10px] font-black tracking-widest transition-all ${activeTab === tab ? (isLight ? 'text-sky-600 bg-slate-50 border-r-4 border-sky-600' : `text-neon-blue bg-white/5 border-r-4 border-neon-blue`) : 'opacity-30 hover:opacity-100'}`}>
            {tab === 'overview' && <LayoutDashboard size={18}/>}
            {tab === 'analytics' && <BarChart3 size={18}/>}
            {tab === 'focus' && <Timer size={18}/>}
            {tab === 'history' && <History size={18}/>}
            {tab.toUpperCase()}
          </button>
        ))}
        
        <div className="mt-auto w-full px-6 flex flex-col gap-4">
            <button onClick={cycleTheme} className={`w-full py-4 flex items-center justify-center gap-2 text-[10px] font-black border transition-all ${isLight ? 'border-slate-200 text-slate-600' : 'border-white/10 text-white hover:bg-white/5'}`}>
                {theme === 'light' && <Sun size={16}/>}
                {theme === 'dark' && <Moon size={16}/>}
                {theme === 'neon' && <Sparkles size={16} className="text-neon-pink animate-spin"/>}
                THEME: {theme.toUpperCase()}
            </button>
            <button onClick={logout} className={`w-full py-4 text-[10px] font-black uppercase border transition-all ${isLight ? 'border-red-200 text-red-500' : 'border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-black'}`}>Logout</button>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className={`flex-1 p-12 overflow-y-auto ${isNeon ? "bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" : ""}`}>
         <header className="mb-12 flex justify-between items-center border-b border-black/5 pb-6">
            <h1 className={`text-4xl font-black italic tracking-tighter ${accentColor}`}>{activeTab.toUpperCase()}_INTERFACE</h1>
            <p className="text-[10px] opacity-30 font-bold uppercase">Neural_ID: {user?.username}</p>
         </header>

         {activeTab === 'overview' && (
            <div className="animate-in fade-in duration-700">
                <div className="grid grid-cols-3 gap-8 mb-12">
                    <div className={`p-8 border-2 ${cardBase} transition-all duration-500`}>
                        <h2 className="text-[10px] font-black mb-4 uppercase opacity-40">Total_Hours</h2>
                        <p className="text-7xl font-black italic tracking-tighter">{data.total_hours.toFixed(1)}</p>
                    </div>
                    <div className={`p-8 border-2 ${cardBase} transition-all duration-500`}>
                        <h2 className={`text-[10px] font-black mb-4 uppercase ${isLight ? 'opacity-40' : 'text-neon-blue'}`}>Streak</h2>
                        <p className={`text-7xl font-black italic tracking-tighter ${isNeon ? 'text-neon-blue' : ''}`}>{data.streak}D</p>
                    </div>
                    <div className={`p-8 border-2 ${cardBase} transition-all duration-500`}>
                        <h2 className={`text-[10px] font-black mb-4 uppercase ${isNeon ? 'text-neon-pink' : 'opacity-40'}`}>Efficiency</h2>
                        <p className={`text-7xl font-black italic tracking-tighter ${isNeon ? 'text-neon-pink' : ''}`}>{data.efficiency}%</p>
                    </div>
                </div>

                <div className={`p-10 border-2 ${cardBase}`}>
                    <h3 className="text-xs font-black mb-10 uppercase tracking-widest italic opacity-50">Upload_Neural_Log</h3>
                    <div className="grid grid-cols-5 gap-8">
                        <input value={subject} onChange={(e) => setSubject(e.target.value)} type="text" placeholder="SUBJECT" className={`col-span-2 border p-5 font-bold uppercase tracking-widest ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/40 border-white/10 text-white'}`} />
                        <input value={hours} onChange={(e) => setHours(e.target.value)} type="number" placeholder="HRS" className={`col-span-1 border p-5 font-bold ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/40 border-white/10 text-white'}`} />
                        <button onClick={handleUpload} className={`col-span-2 font-black py-5 uppercase text-sm transition-all shadow-xl ${btnPrimary}`}>Transmit_Data</button>
                    </div>
                </div>
            </div>
         )}

         {activeTab === 'analytics' && (
            <div className={`p-12 border-2 h-[550px] animate-in zoom-in-95 ${cardBase}`}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={data.chartData} innerRadius={100} outerRadius={160} paddingAngle={8} dataKey="value" stroke="none">
                            {data.chartData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{backgroundColor: isLight ? '#fff' : '#000', border: 'none'}} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
         )}

         {activeTab === 'focus' && (
            <div className="flex flex-col items-center justify-center h-[500px]">
                <div className={`text-[12rem] font-black italic tracking-tighter mb-12 ${isNeon ? 'text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]' : ''}`}>
                    {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}
                </div>
                <button onClick={() => setIsActive(!isActive)} className={`px-20 py-8 font-black uppercase skew-x-[-12deg] shadow-2xl transition-all ${btnPrimary}`}>
                    {isActive ? 'Pause_Focus' : 'Initiate_Focus'}
                </button>
            </div>
         )}

         {activeTab === 'history' && (
            <div className={`p-10 border-2 ${cardBase}`}>
                <table className="w-full text-left">
                    <thead className="text-[10px] uppercase tracking-widest border-b border-black/10 text-slate-400">
                        <tr><th className="py-6">TIME</th><th className="py-6">MODULE</th><th className="py-6">DURATION</th></tr>
                    </thead>
                    <tbody className="text-xs font-black">
                        {data.history.map(log => (
                            <tr key={log.id} className="border-b border-black/5 hover:bg-black/5">
                                <td className="py-8 opacity-40">{log.date}</td>
                                <td className="py-8 uppercase italic tracking-tighter text-sm">{log.subject}</td>
                                <td className={`py-8 text-xl font-black ${isNeon ? 'text-neon-pink' : ''}`}>{log.hours} HRS</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
         )}
      </main>
    </div>
  );
}

export default App;