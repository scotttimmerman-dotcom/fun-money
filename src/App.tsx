// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Plus, Wallet, History, Settings, Trash2, TrendingUp, Calendar, User, CreditCard, ChevronRight, X, ArrowRight, AlertCircle, Loader2, LogIn } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, collection, doc, onSnapshot, setDoc, addDoc, deleteDoc, updateDoc } from 'firebase/firestore';

// --- PASTE YOUR FIREBASE CONFIG HERE ---
// 1. Delete the line below.
// 2. Paste the "const firebaseConfig = { ... }" block from your Firebase screen.
const firebaseConfig = {
  apiKey: "AIzaSyC3fSwC2ztIWHzb1KWLJTqY0kBKAsBtzXk",
  authDomain: "fun-money-budget-tracker.firebaseapp.com",
  projectId: "fun-money-budget-tracker",
  storageBucket: "fun-money-budget-tracker.firebasestorage.app",
  messagingSenderId: "113441290367",
  appId: "1:113441290367:web:ab8dada90f4d3afb15a74a",
  measurementId: "G-2SP5MJ3YHN"
};

// --- Initialize Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Use a fixed App ID for the public database so you both share data
// You can keep this as is.
const appId = 'fun-money-shared-app'; 

// --- Components ---
const LoginScreen = ({ onLogin }) => (
  <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
      <Wallet size={32} />
    </div>
    <h1 className="text-2xl font-bold text-slate-800 mb-2">Fun Money Tracker</h1>
    <p className="text-slate-500 mb-8 text-center max-w-xs">Sync your budget with your partner in real-time.</p>
    
    <button 
      onClick={onLogin}
      className="flex items-center gap-3 bg-white border border-slate-200 text-slate-700 font-semibold py-4 px-8 rounded-xl shadow-sm hover:bg-slate-50 active:scale-95 transition-all"
    >
      <div className="w-5 h-5">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
      </div>
      Sign in with Google
    </button>
  </div>
);

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-5 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = "primary", className = "", icon: Icon, disabled = false }) => {
  const baseStyle = "flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    primary: "bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    danger: "bg-rose-50 text-rose-600 hover:bg-rose-100",
    ghost: "bg-transparent text-slate-500 hover:bg-slate-50"
  };

  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

const BudgetCard = ({ name, color, stats, icon: Icon }) => {
  const isGreen = color === 'emerald';
  const isOverBudget = stats.remaining < 0;
  
  const bgGradient = isGreen 
    ? (isOverBudget ? 'from-emerald-800 to-rose-900' : 'from-emerald-600 to-teal-800')
    : (isOverBudget ? 'from-purple-800 to-rose-900' : 'from-purple-600 to-indigo-800');

  const shadowColor = isGreen ? 'shadow-emerald-200' : 'shadow-purple-200';

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${bgGradient} rounded-3xl p-6 text-white shadow-xl ${shadowColor} mb-4 transition-all duration-500`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl opacity-10 -mr-10 -mt-10 pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
              {isOverBudget ? <AlertCircle size={16} className="text-white animate-pulse" /> : <Icon size={16} className="text-white" />}
            </div>
            <span className="font-bold text-lg">{name}</span>
          </div>
          <div className="text-right">
             <span className={`text-xs uppercase tracking-wider block ${isOverBudget ? 'text-rose-200 font-bold' : 'text-white/70'}`}>
               {isOverBudget ? 'Over Budget' : 'Remaining'}
             </span>
             <span className="font-bold text-xl">${stats.remaining.toFixed(2)}</span>
          </div>
        </div>

        <div className="w-full bg-black/20 rounded-full h-2 mb-4 overflow-hidden backdrop-blur-sm">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-rose-500 w-full' : 'bg-white'}`} 
            style={{ width: isOverBudget ? '100%' : `${Math.max(0, stats.progress)}%` }}
          ></div>
        </div>

        <div className="flex justify-between text-xs text-white/80 font-medium">
          <span>Spent: ${stats.spent.toFixed(2)}</span>
          <span>Pool: ${stats.totalPool.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);
  const [config, setConfig] = useState(null); 
  const [transactions, setTransactions] = useState([]);
  const [newExpense, setNewExpense] = useState({ title: "", amount: "", user: "user1" });
  const [isProcessing, setIsProcessing] = useState(false);

  // --- Auth ---
  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  // --- Firestore Listeners ---
  useEffect(() => {
    if (!user) return;

    // Listen to Shared Config
    const configRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'shared_config');
    const unsubConfig = onSnapshot(configRef, (docSnap) => {
      if (docSnap.exists()) {
        setConfig(docSnap.data());
      } else {
        const defaultConfig = {
          user1: { name: "Scott", budget: 200, rollover: 0 },
          user2: { name: "Sara", budget: 200, rollover: 0 }
        };
        setDoc(configRef, defaultConfig);
        setConfig(defaultConfig);
      }
    }, (err) => console.error("Config Error:", err));

    // Listen to Transactions
    const txRef = collection(db, 'artifacts', appId, 'public', 'data', 'transactions');
    const unsubTx = onSnapshot(txRef, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setTransactions(data);
    }, (err) => console.error("Tx Error:", err));

    return () => {
      unsubConfig();
      unsubTx();
    };
  }, [user]);

  // --- Stats ---
  const calculateStats = (userId) => {
    if (!config) return { totalPool: 0, spent: 0, remaining: 0, progress: 0 };
    
    const userConfig = config[userId];
    const totalPool = userConfig.budget + userConfig.rollover;
    const spent = transactions
      .filter(t => t.user === userId)
      .reduce((acc, curr) => acc + curr.amount, 0);
    const remaining = totalPool - spent;
    const progress = totalPool > 0 ? (remaining / totalPool) * 100 : 0;
    
    return { totalPool, spent, remaining, progress };
  };

  const user1Stats = calculateStats('user1');
  const user2Stats = calculateStats('user2');

  // --- Handlers ---
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
      alert("Login failed. Check that you added your StackBlitz domain to Firebase 'Authorized Domains'!");
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!user || !newExpense.title || !newExpense.amount) return;
    setIsProcessing(true);

    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'), {
        title: newExpense.title,
        amount: parseFloat(newExpense.amount),
        user: newExpense.user,
        date: new Date().toISOString(),
        createdBy: user.uid
      });
      setNewExpense({ title: "", amount: "", user: "user1" });
      setShowAddModal(false);
    } catch (err) {
      console.error("Error adding expense:", err);
      alert("Failed to add expense.");
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteTransaction = async (id) => {
    if (!user) return;
    if (confirm("Delete this expense?")) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'transactions', id));
      } catch (err) {
        console.error("Error deleting:", err);
      }
    }
  };

  const handleUpdateConfig = async (newConfig) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'shared_config'), newConfig);
    } catch (err) {
      console.error("Error updating config:", err);
    }
  };

  const startNewMonth = async () => {
    if (!user) return;
    if (confirm("Are you sure? This will calculate rollover for BOTH users and DELETE all expenses.")) {
      setIsProcessing(true);
      try {
        const newRollovers = {
          user1: user1Stats.remaining,
          user2: user2Stats.remaining
        };

        const newConfig = {
          ...config,
          user1: { ...config.user1, rollover: newRollovers.user1 },
          user2: { ...config.user2, rollover: newRollovers.user2 }
        };
        
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'shared_config'), newConfig);

        const deletePromises = transactions.map(t => 
          deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'transactions', t.id))
        );
        
        await Promise.all(deletePromises);
        alert(`New month started!`);
        setActiveTab('dashboard');
      } catch (err) {
        console.error("Error starting new month:", err);
        alert("Error starting new month.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  if (!user) return <LoginScreen onLogin={handleGoogleLogin} />;

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="animate-spin" size={32} />
          <p>Loading your budget...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24 md:pb-0">
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <Wallet size={18} />
          </div>
          <h1 className="font-bold text-lg text-slate-800">Fun Money</h1>
        </div>
        <div className="text-xs font-medium px-2 py-1 bg-slate-100 rounded-lg text-slate-500">
          {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        
        {activeTab === 'dashboard' && (
          <>
            <div>
              <div className="flex justify-between items-end mb-3 px-1">
                <h3 className="font-bold text-slate-700">Budgets</h3>
              </div>
              <BudgetCard name={config.user1.name} color="emerald" stats={user1Stats} icon={User} />
              <BudgetCard name={config.user2.name} color="purple" stats={user2Stats} icon={User} />
            </div>

            <div>
              <div className="flex justify-between items-center mb-3 px-1">
                <h3 className="font-bold text-slate-700">Recent Activity</h3>
                <button onClick={() => setActiveTab('history')} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center">
                  View All <ChevronRight size={14} />
                </button>
              </div>
              
              <div className="space-y-3">
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">No expenses yet this month!</div>
                ) : (
                  transactions.slice(0, 4).map(t => (
                    <div key={t.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${t.user === 'user1' ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'}`}>
                          {t.user === 'user1' ? config.user1.name[0] : config.user2.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{t.title}</p>
                          <p className="text-xs text-slate-500">{new Date(t.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className="font-bold text-slate-800">-${t.amount.toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800 px-1">Full History</h2>
            {transactions.map(t => (
              <div key={t.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${t.user === 'user1' ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'}`}>
                    {t.user === 'user1' ? config.user1.name[0] : config.user2.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{t.title}</p>
                    <p className="text-xs text-slate-500">{new Date(t.date).toLocaleDateString()} • {t.user === 'user1' ? config.user1.name : config.user2.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                   <span className="font-bold text-slate-800">-${t.amount.toFixed(2)}</span>
                   <button onClick={() => deleteTransaction(t.id)} className="text-slate-400 hover:text-rose-500">
                     <Trash2 size={16} />
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800 px-1">Settings</h2>
            <Card>
              <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                <CreditCard size={18} className="text-emerald-600"/> Monthly Budgets
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="text-xs font-semibold text-slate-500 uppercase">{config.user1.name}'s Base</label>
                   <input type="number" value={config.user1.budget} onChange={(e) => handleUpdateConfig({...config, user1: {...config.user1, budget: Number(e.target.value)}})} className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800" />
                </div>
                <div>
                   <label className="text-xs font-semibold text-slate-500 uppercase">{config.user2.name}'s Base</label>
                   <input type="number" value={config.user2.budget} onChange={(e) => handleUpdateConfig({...config, user2: {...config.user2, budget: Number(e.target.value)}})} className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800" />
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                <ArrowRight size={18} className="text-blue-600"/> Current Rollovers
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="text-xs font-semibold text-slate-500 uppercase">{config.user1.name}'s Rollover</label>
                   <input type="number" value={config.user1.rollover} onChange={(e) => handleUpdateConfig({...config, user1: {...config.user1, rollover: Number(e.target.value)}})} className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800" />
                </div>
                <div>
                   <label className="text-xs font-semibold text-slate-500 uppercase">{config.user2.name}'s Rollover</label>
                   <input type="number" value={config.user2.rollover} onChange={(e) => handleUpdateConfig({...config, user2: {...config.user2, rollover: Number(e.target.value)}})} className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800" />
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><User size={18} className="text-emerald-600"/> Names</h3>
              <div className="space-y-3">
                <div><label className="text-xs font-semibold text-slate-500 uppercase">User 1</label><input type="text" value={config.user1.name} onChange={(e) => handleUpdateConfig({...config, user1: {...config.user1, name: e.target.value}})} className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800" /></div>
                <div><label className="text-xs font-semibold text-slate-500 uppercase">User 2</label><input type="text" value={config.user2.name} onChange={(e) => handleUpdateConfig({...config, user2: {...config.user2, name: e.target.value}})} className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800" /></div>
              </div>
            </Card>

            <Card className="border-emerald-100 bg-emerald-50/50">
               <h3 className="font-bold text-emerald-800 mb-2">End of Month?</h3>
               <p className="text-sm text-emerald-700/80 mb-4">Calculate remaining balances, clear all expenses, and update rollovers.</p>
               <Button onClick={startNewMonth} disabled={isProcessing} variant="primary" className="w-full bg-emerald-600 text-white">
                 {isProcessing ? <Loader2 className="animate-spin" /> : <Calendar size={18} />} {isProcessing ? "Processing..." : "Start New Month"}
               </Button>
            </Card>
          </div>
        )}
      </div>

      <button onClick={() => setShowAddModal(true)} className="fixed bottom-24 right-4 sm:right-1/2 sm:translate-x-48 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-lg shadow-emerald-300 flex items-center justify-center hover:bg-emerald-700 transition-all active:scale-90 z-40"><Plus size={28} /></button>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-40 md:hidden">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-emerald-600' : 'text-slate-400'}`}><TrendingUp size={24} /><span className="text-[10px] font-bold">Tracker</span></button>
        <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center gap-1 ${activeTab === 'history' ? 'text-emerald-600' : 'text-slate-400'}`}><History size={24} /><span className="text-[10px] font-bold">History</span></button>
        <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center gap-1 ${activeTab === 'settings' ? 'text-emerald-600' : 'text-slate-400'}`}><Settings size={24} /><span className="text-[10px] font-bold">Settings</span></button>
      </div>

      <div className="hidden md:flex fixed top-0 right-0 h-screen w-64 bg-white border-l border-slate-200 p-6 flex-col gap-4">
         <h2 className="font-bold text-xl mb-4">Menu</h2>
         <Button variant={activeTab === 'dashboard' ? 'primary' : 'ghost'} onClick={() => setActiveTab('dashboard')} className="justify-start"><TrendingUp size={20} /> Tracker</Button>
         <Button variant={activeTab === 'history' ? 'primary' : 'ghost'} onClick={() => setActiveTab('history')} className="justify-start"><History size={20} /> History</Button>
         <Button variant={activeTab === 'settings' ? 'primary' : 'ghost'} onClick={() => setActiveTab('settings')} className="justify-start"><Settings size={20} /> Settings</Button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 animate-in slide-in-from-bottom-10 duration-200 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Add Expense</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"><X size={20} className="text-slate-600" /></button>
            </div>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">$</span>
                  <input type="number" step="0.01" placeholder="0.00" disabled={isProcessing} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-10 pr-4 text-2xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })} autoFocus />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Description</label>
                <input type="text" placeholder="What was it for?" disabled={isProcessing} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" value={newExpense.title} onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Who Paid?</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" disabled={isProcessing} onClick={() => setNewExpense({...newExpense, user: 'user1'})} className={`py-3 px-4 rounded-xl font-semibold border-2 transition-all flex flex-col items-center gap-1 ${newExpense.user === 'user1' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm' : 'border-slate-100 text-slate-500 hover:border-slate-200 hover:bg-slate-50'}`}><span>{config.user1.name}</span><span className="text-[10px] opacity-70">Budget: ${user1Stats.remaining.toFixed(0)} left</span></button>
                  <button type="button" disabled={isProcessing} onClick={() => setNewExpense({...newExpense, user: 'user2'})} className={`py-3 px-4 rounded-xl font-semibold border-2 transition-all flex flex-col items-center gap-1 ${newExpense.user === 'user2' ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm' : 'border-slate-100 text-slate-500 hover:border-slate-200 hover:bg-slate-50'}`}><span>{config.user2.name}</span><span className="text-[10px] opacity-70">Budget: ${user2Stats.remaining.toFixed(0)} left</span></button>
                </div>
              </div>
              <Button variant="primary" disabled={isProcessing} className="w-full mt-6 py-4 text-lg shadow-xl shadow-emerald-200/50">{isProcessing ? <Loader2 className="animate-spin" /> : "Save Expense"}</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}