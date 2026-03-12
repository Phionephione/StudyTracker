import React, { useState, useEffect } from 'react';
import { Activity, Clock, Target, Shield, Zap, BarChart3, History, LayoutDashboard, Timer, RotateCcw, UserCircle2, Lock, LogOut, Sun, Moon, Sparkles } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import axios from 'axios';

const COLORS = ['#00ffff', '#ff00ff', '#bc13fe', '#ffcc00', '#00ff00', '#ff4d4d'];
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

function App() {
  const [view, setView] = useState('landing'); 
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('cyber_user')) || null);
  const [theme, setTheme] = useState(localStorage.getItem('cyber_theme') || 'neon');
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
    // eslint-disable-next-line
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/get-data/${user.user_id}`);
      setData(res.data);
    } catch (err) { console.error(err); }
  };

  const handleAuth = async () => {
    try {
        const endpoint = authData.isLogin ? 'login' : 'register';
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
      await axios.post(`${API_BASE_URL}/add-log`, { user_id: user.user_id, subject, hours });
      setSubject(''); setHours(''); fetchData();
      setStatusMsg('UPLOADED');
      setTimeout(() => setStatusMsg('READY'), 3000);
    } catch { setStatusMsg('FAILED'); }
  };

  const logout = () => { localStorage.removeItem('cyber_user'); setUser(null); setView('landing'); };
  const cycleTheme = () => theme === 'light' ? setTheme('dark') : theme === 'dark' ? setTheme('neon') : setTheme('light');

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) { interval = setInterval(() => setTimeLeft(t => t - 1), 1000); }
    else if (timeLeft === 0) { setIsActive(false); alert("FOCUS_COMPLETE"); }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const isNeon = theme === 'neon';
  const isLight = theme === 'light';
  const bgMain = isLight ? 'bg-slate-50' : (isNeon ? 'bg-black' : 'bg-slate-900');
  const txtMain = isLight ? 'text-slate-900' : 'text-white';
  const cardBase = isLight ? 'bg-white border-slate-200 shadow-sm' : (isNeon ? 'bg-black/80 border-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.15)]' : 'bg-slate-800 border-slate-700');
  const accentColor = isLight ? 'text-blue-600' : (isNeon ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]' : 'text-indigo-400');
  const btnPrimary = isLight ? 'bg-slate-900 text-white' : (isNeon ? 'bg-cyan-400 text-black shadow-[0_0_15px_rgba(0,255,255,0.5)]' : 'bg-indigo-600 text-white');

  if (view === 'landing' && !user) {
    return (
      <div className={`min-h-screen w-full ${bgMain} ${txtMain} flex flex-col items-center justify-center font-mono p-4 text-center transition-all duration-700`}>
        <Activity className={`w-16 h-16 md:w-24 md:h-24 ${accentColor} mb-6 animate-bounce`} />
        <h1 className={`text-5xl md:text-9xl font-black italic mb-8 tracking-tighter ${isNeon ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500' : ''}`}>STUDY_TRACKER</h1>
        <button onClick={() => setView('auth')} className={`px-10 py-5 md:px-20 md:py-8 font-black uppercase tracking-[0.3em] skew-x-[-15deg] transition-all hover:scale-105 active:scale-95 ${btnPrimary}`}>Initiate_Link</button>
      </div>
    );
  }

  if (view === 'auth') {
    return (
        <div className={`min-h-screen ${bgMain} ${txtMain} flex items-center justify-center font-mono p-4`}>
            <div className={`w-full max-w-sm border-2 p-8 ${cardBase}`}>
                <h2 className="text-xl font-black mb-6 italic uppercase border-b border-black/10 pb-2">{authData.isLogin ? 'Access' : 'Create'}</h2>
                <div className="space-y-4">
                    <div className="relative">
                        <UserCircle2 className="absolute left-4 top-4 opacity-20" size={20} />
                        <input type="text" placeholder="USERNAME" onChange={(e) => setAuthData({...authData, username: e.target.value})} className={`w-full border p-4 pl-12 font-bold text-sm uppercase ${isLight ? 'bg-white' : 'bg-black/40 text-white border-white/10'}`} />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-4 opacity-20" size={20} />
                        <input type="password" placeholder="PASSWORD" onChange={(e) => setAuthData({...authData, password: e.target.value})} className={`w-full border p-4 pl-12 font-bold text-sm ${isLight ? 'bg-white' : 'bg-black/40 text-white border-white/10'}`} />
                    </div>
                    <button onClick={handleAuth} className={`w-full font-black py-4 uppercase text-sm ${btnPrimary}`}>Confirm</button>
                    <button onClick={() => setAuthData({...authData, isLogin: !authData.isLogin})} className="w-full text-[10px] opacity-40 uppercase tracking-widest mt-2">Switch_Mode</button>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgMain} ${txtMain} font-mono flex flex-col md:flex-row transition-all duration-500`}>
      <nav className={`w-full md:w-72 border-b md:border-b-0 md:border-r flex md:flex-col items-center p-4 md:py-10 gap-4 justify-between md:justify-start ${isLight ? 'bg-white' : 'bg-black'} z-50`}>
        <Shield className={`${accentColor} w-8 h-8 md:w-12 md:h-12 animate-pulse`} />
        <div className="hidden md:flex flex-col w-full gap-2 mt-12">
            {['overview', 'analytics', 'focus', 'history'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`flex items-center gap-4 w-full px-8 py-5 text-[11px] font-black tracking-[0.2em] transition-all ${activeTab === tab ? `text-cyan-400 bg-white/5 border-r-4 border-cyan-400` : 'opacity-30 hover:opacity-100'}`}>
                {tab.toUpperCase()}
              </button>
            ))}
        </div>
        <div className="flex md:flex-col gap-2 md:mt-auto md:w-full md:px-4">
            <button onClick={cycleTheme} className={`flex items-center justify-center gap-3 p-2 md:py-4 border border-white/10 text-[10px] font-black uppercase transition-all hover:bg-white/5 w-full`}>
                <Sparkles size={16}/> <span className="hidden md:block">Theme: {theme}</span>
            </button>
            <button onClick={logout} className="flex items-center justify-center gap-3 p-2 md:py-4 border border-red-500/20 text-red-500 text-[10px] font-black uppercase transition-all hover:bg-red-500/5 w-full">
                <LogOut size={16}/> <span className="hidden md:block">Logout</span>
            </button>
        </div>
      </nav>

      {/* MOBILE NAV */}
      <div className={`md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around p-4 border-t backdrop-blur-xl ${isLight ? 'bg-white/90' : 'bg-black/90'}`}>
        {[{id:'overview',icon:<LayoutDashboard size={24}/>},{id:'analytics',icon:<BarChart3 size={24}/>},{id:'focus',icon:<Timer size={24}/>},{id:'history',icon:<History size={24}/>}].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={activeTab === item.id ? accentColor : 'opacity-30'}>{item.icon}</button>
        ))}
      </div>

      <main className="flex-1 p-6 md:p-16 pb-28 md:pb-16 overflow-x-hidden">
         <header className="mb-10 md:mb-16 border-b border-black/5 pb-6 flex justify-between items-end">
            <h1 className={`text-3xl md:text-5xl font-black italic tracking-tighter uppercase ${accentColor}`}>{activeTab}</h1>
            <span className="hidden md:block text-[10px] opacity-20 font-black uppercase">User: {user?.username}</span>
         </header>

         {activeTab === 'overview' && (
            <div className="space-y-6 md:space-y-12 animate-in fade-in duration-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
                    <div className={`p-8 md:p-10 border-2 ${cardBase}`}><h2 className="text-[10px] font-black mb-4 opacity-30 uppercase">Time</h2><p className="text-5xl md:text-8xl font-black italic">{data.total_hours.toFixed(1)}</p></div>
                    <div className={`p-8 md:p-10 border-2 ${cardBase}`}><h2 className="text-[10px] font-black mb-4 opacity-30 uppercase">Streak</h2><p className={`text-5xl md:text-8xl font-black italic ${accentColor}`}>{data.streak}D</p></div>
                    <div className={`p-8 md:p-10 border-2 ${cardBase}`}><h2 className="text-[10px] font-black mb-4 opacity-30 uppercase">Efficiency</h2><p className="text-5xl md:text-8xl font-black italic">{data.efficiency}%</p></div>
                </div>
                <div className={`p-8 md:p-12 border-2 ${cardBase}`}>
                    <div className="flex flex-col md:flex-row gap-6">
                        <input value={subject} onChange={(e) => setSubject(e.target.value)} type="text" placeholder="SUBJECT" className={`flex-1 border p-6 font-bold uppercase ${isLight ? 'bg-slate-100' : 'bg-black/60 border-white/10'}`} />
                        <input value={hours} onChange={(e) => setHours(e.target.value)} type="number" placeholder="HRS" className={`w-full md:w-48 border p-6 font-bold ${isLight ? 'bg-slate-100' : 'bg-black/60 border-white/10'}`} />
                        <button onClick={handleUpload} className={`py-6 px-12 font-black uppercase text-xs ${btnPrimary}`}>Transmit</button>
                    </div>
                </div>
            </div>
         )}

         {activeTab === 'analytics' && (
            <div className={`p-6 md:p-16 border-2 h-[500px] md:h-[650px] flex flex-col items-center ${cardBase}`}>
                <h2 className={`text-xs font-black mb-10 uppercase tracking-[0.5em] italic ${isNeon ? 'text-fuchsia-500' : 'opacity-40'}`}>Analyses</h2>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={data.chartData} innerRadius={100} outerRadius={180} paddingAngle={8} dataKey="value" stroke="none">
                            {data.chartData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{backgroundColor: isLight ? '#fff' : '#000', fontSize: '12px'}} />
                        <Legend verticalAlign="bottom" height={36} wrapperStyle={{paddingTop: '20px', fontSize: '10px', fontWeight: 'bold'}} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
         )}

         {activeTab === 'focus' && (
            <div className="flex flex-col items-center justify-center h-[500px] animate-in zoom-in-95">
                <div className={`text-8xl md:text-[16rem] font-black italic tracking-tighter mb-12`}>
                    {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,'0')}
                </div>
                <div className="flex gap-8">
                    <button onClick={() => setIsActive(!isActive)} className={`px-12 py-6 md:px-20 md:py-10 font-black uppercase skew-x-[-15deg] transition-all ${btnPrimary}`}>
                        {isActive ? 'Pause' : 'Start'}
                    </button>
                    <button onClick={() => {setIsActive(false); setTimeLeft(25 * 60)}} className={`w-16 h-16 md:w-24 md:h-24 rounded-full border-2 flex items-center justify-center transition-all ${isLight ? 'border-slate-200 text-slate-300' : 'border-white/10 text-white/20'}`}><RotateCcw size={32}/></button>
                </div>
            </div>
         )}

         {activeTab === 'history' && (
            <div className={`p-6 md:p-12 border-2 overflow-x-auto ${cardBase}`}>
                <table className="w-full text-left min-w-[600px]">
                    <thead className="text-[10px] uppercase opacity-30 border-b border-black/10">
                        <tr><th className="py-6">TIME_STAMP</th><th className="py-6">MODULE_ID</th><th className="py-6">UNITS</th></tr>
                    </thead>
                    <tbody className="text-sm font-black">
                        {data.history.map(log => (
                            <tr key={log.id} className="border-b border-black/5 hover:bg-cyan-400/5 transition-all">
                                <td className="py-8 opacity-30">{log.date}</td>
                                <td className="py-8 uppercase italic">{log.subject}</td>
                                <td className={`py-8 text-xl font-black ${isNeon ? 'text-fuchsia-500' : ''}`}>{log.hours} HRS</td>
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