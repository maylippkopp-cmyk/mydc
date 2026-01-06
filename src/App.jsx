import React, { useState, useEffect } from 'react';
// Wir importieren die Firebase Module
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, setDoc, doc, deleteDoc } from "firebase/firestore";
import { 
  User, 
  CreditCard, 
  Calendar, 
  Clock, 
  LogOut, 
  ChevronRight, 
  ShieldCheck,
  TrendingUp,
  Settings,
  Plus,
  Save,
  Trash2,
  Mail,
  CheckCircle2,
  Info,
  X,
  Globe,
  Target,
  FileText,
  Layers,
  Camera,
  MapPin,
  Sparkles,
  MessageSquare,
  Lightbulb,
  UserPlus,
  Coins,
  Rocket,
  ArrowRight,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

// --- KONFIGURATION ---
// Deine Firebase Daten (Bleiben erhalten)
const firebaseConfig = {
  apiKey: "AIzaSyD5Tb2kC0uyZTvsh0vtjU-TXIADz5aTCmw",
  authDomain: "my-dc-dashboard.firebaseapp.com",
  projectId: "my-dc-dashboard",
  storageBucket: "my-dc-dashboard.firebasestorage.app",
  messagingSenderId: "1097386445910",
  appId: "1:1097386445910:web:80a8e70badbd4e5f3b7ff7"
};

// Initialisiere Firebase nur, wenn Config vorhanden ist (verhindert Absturz in Vorschau ohne Keys)
let db;
try {
  if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "DEIN_API_KEY_HIER") {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  }
} catch (e) {
  console.error("Firebase Init Error:", e);
}

const TARIFF_OPTIONS = [
  "Social Sphere Pro - Organisch",
  "Social Sphere Pro - Organisch inkl. Paid ADs",
  "Social Sphere Pro - ADs Kampagne",
  "Individueller Tarif"
];

const STRATEGY_OPTIONS = [
  "Personal Brand Push",
  "Product Push",
  "AD Kampagnen",
  "Test Reel Push",
  "Organic Only Push",
  "AD Only Push",
  "Sonstige Vereinbarung"
];

const PLATFORMS = ["Instagram", "TikTok", "Facebook", "LinkedIn", "YouTube", "Pinterest"];

const ADMIN_PASSWORD = "Philippundphilipp123!";
const LOGO_SRC = "Clean Cut 1x Scale Black.jpg"; 

const parsePrice = (priceVal) => {
  if (typeof priceVal === 'number') return priceVal;
  if (!priceVal || typeof priceVal !== 'string') return 0;
  const normalized = priceVal.replace(',', '.');
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
};

// Logo Komponente
const LogoImage = ({ className, style }) => {
  const [imgError, setImgError] = useState(false);
  if (imgError) {
    return (
      <div className={`${className} bg-slate-900 flex items-center justify-center text-white font-bold text-xs uppercase shadow-lg`} style={style}>
        MyDC
      </div>
    );
  }
  return (
    <img 
      src={LOGO_SRC} 
      alt="MyDC Logo" 
      className={`${className} object-contain`} 
      style={style}
      onError={() => setImgError(true)}
    />
  );
};

const App = () => {
  const [customerNumber, setCustomerNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); 
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // State für Kunden
  const [customers, setCustomers] = useState({});
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);

  // Daten laden (Firebase oder Fallback)
  useEffect(() => {
    const loadData = async () => {
      if (db) {
        try {
          const querySnapshot = await getDocs(collection(db, "customers"));
          const dbCustomers = {};
          querySnapshot.forEach((doc) => {
            dbCustomers[doc.id] = doc.data();
          });
          setCustomers(dbCustomers);
          setIsFirebaseReady(true);
        } catch (err) {
          console.error("Fehler beim Laden:", err);
          setError("Verbindung zur Datenbank fehlgeschlagen.");
        }
      } else {
        const saved = localStorage.getItem('mydc_customers_v14');
        if (saved) {
            setCustomers(JSON.parse(saved));
        } else {
            setCustomers({
                "KD-1001": {
                    name: "Max Mustermann",
                    company: "Muster GmbH",
                    password: "start123", 
                    tarif: "Social Sphere Pro - Organisch",
                    strategies: ["Personal Brand Push"],
                    managedAccounts: ["Instagram"],
                    preis: "499,00",
                    addons: [{ name: "Zusatz-Reel", preis: "89,00" }],
                    monat: "Januar 2024",
                    startDatum: "2023-05-15",
                    status: "Aktiv",
                    nextAppointment: "2024-02-15T10:00",
                    contentFocus: "Winter-Kollektion Shooting",
                    statusMessage: "",
                    internalNotes: ""
                }
            });
        }
      }
    };
    loadData();
  }, []);

  const [editCustomer, setEditCustomer] = useState({
    id: '',
    name: '',
    company: '',
    password: '',
    tarif: TARIFF_OPTIONS[0],
    strategies: [],
    managedAccounts: [],
    preis: '',
    addons: [],
    startDatum: new Date().toISOString().split('T')[0],
    status: 'Aktiv',
    nextAppointment: '',
    contentFocus: '',
    statusMessage: '',
    internalNotes: ''
  });

  const [newAddon, setNewAddon] = useState({ name: '', preis: '' });

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    setTimeout(() => {
      const inputId = customerNumber.trim();
      const inputPw = password.trim();

      if (inputId === 'ADMIN-MYDC') {
        if (inputPw === ADMIN_PASSWORD) {
          setIsAdmin(true);
          setUser({ name: 'Administrator' });
        } else {
          setError('Falsches Admin-Passwort.');
        }
      } else {
        const foundUser = customers[inputId];
        if (foundUser) {
          if (foundUser.password === inputPw) {
            setUser({ ...foundUser, id: inputId });
            setIsAdmin(false);
            setActiveTab('overview');
          } else {
            setError('Falsches Passwort.');
          }
        } else {
          setError('Kundennummer nicht gefunden.');
        }
      }
      setIsLoading(false);
    }, 800);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAdmin(false);
    setCustomerNumber('');
    setPassword('');
    setError('');
  };

  const saveCustomer = async (e) => {
    e.preventDefault();
    if (!editCustomer.id) { alert("Bitte eine Kundennummer vergeben!"); return; }
    if (!editCustomer.password) { alert("Bitte ein Passwort festlegen!"); return; }

    const updatedData = { 
        ...editCustomer, 
        monat: new Date().toLocaleString('de-DE', { month: 'long', year: 'numeric' }) 
    };

    const newCustomers = { ...customers, [editCustomer.id]: updatedData };
    setCustomers(newCustomers);

    if (db) {
        try {
            await setDoc(doc(db, "customers", editCustomer.id), updatedData);
        } catch (err) {
            alert("Fehler beim Speichern in der Cloud: " + err.message);
        }
    } else {
        localStorage.setItem('mydc_customers_v14', JSON.stringify(newCustomers));
    }
    
    resetForm();
  };

  const deleteCustomerData = async (id) => {
      if(confirm("Kunde wirklich löschen?")) {
          const newCustomers = { ...customers };
          delete newCustomers[id];
          setCustomers(newCustomers);

          if (db) {
              await deleteDoc(doc(db, "customers", id));
          } else {
              localStorage.setItem('mydc_customers_v14', JSON.stringify(newCustomers));
          }
      }
  };

  const resetForm = () => {
    setEditCustomer({ 
        id: '', name: '', company: '', password: '', tarif: TARIFF_OPTIONS[0], strategies: [], 
        managedAccounts: [], preis: '', addons: [], 
        startDatum: new Date().toISOString().split('T')[0], status: 'Aktiv', 
        nextAppointment: '', contentFocus: '', statusMessage: '', internalNotes: '' 
      });
    setNewAddon({ name: '', preis: '' });
  };

  const toggleSelection = (field, value) => {
    setEditCustomer(prev => {
      const current = prev[field] || [];
      return {
        ...prev,
        [field]: current.includes(value) ? current.filter(item => item !== value) : [...current, value]
      };
    });
  };

  const addAddon = () => {
    if (!newAddon.name || !newAddon.preis) return;
    setEditCustomer(prev => ({ ...prev, addons: [...(prev.addons || []), { ...newAddon }] }));
    setNewAddon({ name: '', preis: '' });
  };

  const removeAddon = (index) => {
    setEditCustomer(prev => ({ ...prev, addons: prev.addons.filter((_, i) => i !== index) }));
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "Kein Termin vereinbart";
    const dt = new Date(dateTimeStr);
    return dt.toLocaleString('de-DE', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + " Uhr";
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans text-slate-900">
        <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8 border border-slate-100">
          <div className="flex flex-col items-center mb-8">
            <LogoImage className="w-32 h-32 rounded-2xl mb-4" />
            <h1 className="text-2xl font-bold">Login</h1>
            <p className="text-slate-400 text-sm mt-2">Willkommen bei MyDC OG</p>
            {!db && <p className="text-[10px] text-red-400 mt-2 bg-red-50 p-2 rounded">Hinweis: Demo-Modus (keine Cloud-Verbindung)</p>}
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 mb-1 block">Benutzer-ID</label>
              <input type="text" className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none text-lg transition-all" placeholder="Kundennummer oder Admin-ID" value={customerNumber} onChange={(e) => setCustomerNumber(e.target.value)} />
            </div>
            <div className="relative">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 mb-1 block">Passwort</label>
              <input type={showPassword ? "text" : "password"} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none text-lg transition-all pr-12" placeholder="Ihr Passwort" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-[38px] text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
              </button>
            </div>
            {error && <p className="text-red-500 text-xs bg-red-50 p-3 rounded-xl font-bold text-center border border-red-100">{error}</p>}
            <button type="submit" disabled={isLoading} className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all flex justify-center items-center gap-2 hover:bg-slate-800 disabled:opacity-70 mt-2">
              {isLoading ? "Prüfe Daten..." : "Anmelden"} <ChevronRight size={20}/>
            </button>
          </form>
          <div className="mt-8 text-center border-t pt-6 border-slate-100">
            <p className="text-xs text-slate-400">Probleme beim Login?</p>
            <a href="mailto:office@my-dc.at" className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors">office@my-dc.at</a>
          </div>
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans pb-10 text-slate-800">
        <nav className="bg-white border-b p-4 sticky top-0 z-20 flex justify-between items-center px-4 md:px-8 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-lg"><Settings size={20}/> MyDC Admin {isFirebaseReady && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Cloud Aktiv</span>}</div>
          <button onClick={handleLogout} className="text-slate-500 flex items-center gap-1 font-medium hover:text-red-500 transition-colors"><LogOut size={18}/> Logout</button>
        </nav>
        <main className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 sticky top-24 max-h-[85vh] overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    {customers[editCustomer.id] ? <Settings size={18} className="text-blue-500"/> : <UserPlus size={18} className="text-emerald-500"/>}
                    {customers[editCustomer.id] ? "Kunde bearbeiten" : "Neuen Kunden anlegen"}
                </h3>
                {editCustomer.id && <button onClick={resetForm} className="text-[10px] bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-full font-bold uppercase tracking-wider transition-colors">Abbrechen / Neu</button>}
              </div>
              <div className="space-y-4 text-sm">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><User size={12}/> Account Zugangsdaten</p>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Kunden-ID</label>
                            <input className="w-full p-2.5 border rounded-xl bg-white font-mono font-bold" placeholder="z.B. KD-2000" value={editCustomer.id} onChange={e => setEditCustomer({...editCustomer, id: e.target.value})} disabled={!!customers[editCustomer.id] && editCustomer.id !== ""} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Passwort</label>
                            <input className="w-full p-2.5 border rounded-xl bg-white" placeholder="Passwort setzen" value={editCustomer.password} onChange={e => setEditCustomer({...editCustomer, password: e.target.value})} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Status</label>
                        <select className="w-full p-2.5 border rounded-xl bg-white" value={editCustomer.status} onChange={e => setEditCustomer({...editCustomer, status: e.target.value})}>
                            <option value="Aktiv">Aktiv</option>
                            <option value="Pause">Pause</option>
                            <option value="Beendet">Beendet</option>
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <input className="w-full p-3 border rounded-xl" placeholder="Firma" value={editCustomer.company} onChange={e => setEditCustomer({...editCustomer, company: e.target.value})} />
                    <input className="w-full p-3 border rounded-xl" placeholder="Name Ansprechp." value={editCustomer.name} onChange={e => setEditCustomer({...editCustomer, name: e.target.value})} />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Tarifmodell</label>
                    <select className="w-full p-3 border rounded-xl" value={editCustomer.tarif} onChange={e => setEditCustomer({...editCustomer, tarif: e.target.value})}>
                        {TARIFF_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Kanäle & Strategie</label>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {PLATFORMS.map(p => (<button key={p} onClick={() => toggleSelection('managedAccounts', p)} className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${editCustomer.managedAccounts?.includes(p) ? 'bg-slate-900 text-white' : 'bg-white text-slate-400 border-slate-200'}`}>{p}</button>))}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {STRATEGY_OPTIONS.map(s => (<button key={s} onClick={() => toggleSelection('strategies', s)} className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${editCustomer.strategies?.includes(s) ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 border-slate-200'}`}>{s}</button>))}
                    </div>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl text-white space-y-3">
                    <div className="flex items-center gap-2 mb-1"><Coins size={14} className="text-amber-400" /><label className="text-[10px] font-bold uppercase tracking-widest">Zusatzoptionen / Extras</label></div>
                    <div className="flex gap-1.5">
                        <input className="flex-1 p-2 bg-white/10 border border-white/20 rounded-lg text-xs" placeholder="Leistung" value={newAddon.name} onChange={e => setNewAddon({...newAddon, name: e.target.value})} />
                        <input className="w-16 p-2 bg-white/10 border border-white/20 rounded-lg text-xs" placeholder="€" value={newAddon.preis} onChange={e => setNewAddon({...newAddon, preis: e.target.value})} />
                        <button onClick={addAddon} className="p-2 bg-amber-500 text-slate-900 rounded-lg"><Plus size={16}/></button>
                    </div>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                        {editCustomer.addons?.map((a, i) => (
                            <div key={i} className="flex justify-between items-center bg-white/5 p-2 rounded-lg border border-white/5 text-[11px]">
                                <span className="truncate">{a.name}</span>
                                <div className="flex items-center gap-3"><span className="font-bold text-amber-400">{a.preis} €</span><button onClick={() => removeAddon(i)} className="text-white/30 hover:text-red-400"><X size={14}/></button></div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-3">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Dreh-Terminierung</p>
                    <input className="w-full p-2.5 border border-blue-200 rounded-xl bg-white text-xs" type="datetime-local" value={editCustomer.nextAppointment} onChange={e => setEditCustomer({...editCustomer, nextAppointment: e.target.value})} />
                    <input className="w-full p-2.5 border border-blue-200 rounded-xl bg-white text-xs" placeholder="Was wird heute gepusht?" value={editCustomer.contentFocus} onChange={e => setEditCustomer({...editCustomer, contentFocus: e.target.value})} />
                </div>
                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 space-y-3">
                    <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Dashboard News / Status</p>
                    <textarea rows="2" className="w-full p-2.5 border border-purple-200 rounded-xl bg-white text-xs" placeholder="Nachricht an den Kunden..." value={editCustomer.statusMessage} onChange={e => setEditCustomer({...editCustomer, statusMessage: e.target.value})} />
                    <textarea rows="1" className="w-full p-2.5 border border-purple-200 rounded-xl bg-white text-xs italic" placeholder="Interne Notiz..." value={editCustomer.internalNotes} onChange={e => setEditCustomer({...editCustomer, internalNotes: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Grundpreis Brutto</label><input className="w-full p-3 border rounded-xl" placeholder="499,00" value={editCustomer.preis} onChange={e => setEditCustomer({...editCustomer, preis: e.target.value})} /></div>
                    <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Startdatum</label><input className="w-full p-3 border rounded-xl" type="date" value={editCustomer.startDatum} onChange={e => setEditCustomer({...editCustomer, startDatum: e.target.value})} /></div>
                </div>
                <button onClick={saveCustomer} className={`w-full py-4 rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 ${customers[editCustomer.id] ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}><Save size={18}/> {customers[editCustomer.id] ? "Änderungen speichern" : "Neuen Kunden anlegen"}</button>
              </div>
            </div>
          </div>
          <div className="lg:col-span-7 space-y-6">
            <div className="flex justify-between items-end"><h3 className="font-bold text-xl">Kundenstamm <span className="text-slate-300 font-normal ml-2">{Object.keys(customers).length} Kontakte</span></h3><button onClick={resetForm} className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"><Plus size={16}/> Neuer Kunde</button></div>
            <div className="grid grid-cols-1 gap-3">
                {Object.entries(customers).map(([id, data]) => (
                <div key={id} className={`bg-white p-5 rounded-[2rem] border transition-all flex justify-between items-center group shadow-sm ${editCustomer.id === id ? 'border-blue-500 ring-2 ring-blue-50' : 'border-slate-200 hover:border-slate-400'}`}>
                    <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-2 mb-1"><span className={`w-2 h-2 rounded-full ${data.status === 'Aktiv' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span><span className="font-bold text-slate-900 truncate">{data.company || data.name}</span><span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-mono">#{id}</span></div>
                        <p className="text-[11px] text-slate-400 truncate font-medium">{data.tarif}</p>
                        <div className="flex gap-3 mt-2">
                            {data.nextAppointment && <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Dreh: {new Date(data.nextAppointment).toLocaleDateString()}</span>}
                            {data.preis && <span className="text-[9px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-md">{data.preis}€ {data.addons?.length > 0 ? `(+${data.addons.length} Extras)` : ''}</span>}
                        </div>
                    </div>
                    <div className="flex gap-2"><button onClick={() => setEditCustomer({id, ...data, addons: data.addons || []})} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-blue-600 hover:text-white transition-all"><Settings size={20}/></button><button onClick={() => deleteCustomerData(id)} className="p-3 bg-slate-50 text-slate-300 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all"><Trash2 size={20}/></button></div>
                </div>
                ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  const totalAddonsValue = (user.addons || []).reduce((sum, a) => sum + parsePrice(a.preis), 0);
  const totalBrutto = (parsePrice(user.preis) + totalAddonsValue).toFixed(2).replace('.', ',');

  const renderContent = () => {
    switch(activeTab) {
      case 'profile':
        return (
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
              <div><h3 className="text-2xl font-bold text-slate-900">Mein Profil</h3><p className="text-slate-500 text-sm">Stammdaten Ihres Unternehmens.</p></div>
              <div className="bg-slate-900 text-white px-6 py-2 rounded-2xl text-xs font-bold self-start uppercase tracking-widest">Status: {user.status}</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100"><label className="text-[10px] uppercase font-black text-slate-400 tracking-widest block mb-1">Unternehmen</label><p className="text-lg font-bold text-slate-900">{user.company || "Nicht hinterlegt"}</p></div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100"><label className="text-[10px] uppercase font-black text-slate-400 tracking-widest block mb-1">Ansprechpartner</label><p className="text-lg font-bold text-slate-900">{(user.name || "Kunde")}</p></div>
              </div>
              <div className="p-6 bg-slate-900 rounded-[2rem] text-white">
                <h4 className="font-bold mb-4 flex items-center gap-2"><Globe size={18} className="text-blue-400"/> Betreute Kanäle</h4>
                <div className="flex flex-wrap gap-2">{(user.managedAccounts || []).length > 0 ? (user.managedAccounts || []).map(acc => (<span key={acc} className="px-4 py-2 bg-white/10 rounded-xl text-sm font-semibold border border-white/10">{acc}</span>)) : (<p className="text-slate-400 text-sm italic">Aktuell keine Kanäle hinterlegt.</p>)}</div>
              </div>
            </div>
          </div>
        );
      case 'strategy':
        return (
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-4"><div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><Target size={24}/></div><div><h3 className="text-2xl font-bold text-slate-900">Strategie-Plan</h3><p className="text-slate-500 text-sm">Ihre aktuelle Marktausrichtung und Kampagnenfokus.</p></div></div>
            <div className="grid grid-cols-1 gap-3">
              {STRATEGY_OPTIONS.map((opt) => {
                const isActive = (user.strategies || []).includes(opt);
                return (
                  <div key={opt} className={`p-6 rounded-[2rem] border-2 transition-all flex justify-between items-center ${isActive ? 'border-blue-600 bg-blue-50/50' : 'border-slate-50 opacity-40'}`}>
                    <div className="flex items-center gap-4"><div className={`w-4 h-4 rounded-full ${isActive ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-slate-200'}`}></div><span className={`font-bold text-lg ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>{opt}</span></div>
                    {isActive && <CheckCircle2 className="text-blue-600" size={28}/>}
                  </div>
                );
              })}
            </div>
          </div>
        );
      case 'appointments':
        return (
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 border-b pb-6"><div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><Camera size={24}/></div><div><h3 className="text-2xl font-bold text-slate-900">Nächster persönlicher Termin</h3><p className="text-slate-500 text-sm">Produktion von neuem Content vor Ort.</p></div></div>
            {user.nextAppointment ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-emerald-600 text-white rounded-[2.5rem] p-10 relative overflow-hidden shadow-xl">
                  <div className="relative z-10">
                    <div className="bg-white/20 w-fit px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">Bestätigt</div>
                    <h4 className="text-4xl font-black mb-2">{new Date(user.nextAppointment).toLocaleDateString('de-DE', { weekday: 'long' })}</h4>
                    <p className="text-5xl font-light mb-8 opacity-90">{new Date(user.nextAppointment).toLocaleDateString('de-DE', { day: '2-digit', month: 'long' })}</p>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-sm"><Clock className="text-emerald-200" size={24}/><div><p className="text-[10px] uppercase font-bold text-emerald-200">Uhrzeit</p><p className="text-lg font-bold">{new Date(user.nextAppointment).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr</p></div></div>
                      <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-sm"><MapPin className="text-emerald-200" size={24}/><div><p className="text-[10px] uppercase font-bold text-emerald-200">Ort</p><p className="text-lg font-bold">Direkt bei Ihnen</p></div></div>
                    </div>
                  </div>
                  <Camera size={200} className="absolute -bottom-10 -right-10 text-white/5 rotate-12" />
                </div>
                <div className="space-y-6">
                  {user.contentFocus && (
                    <div className="p-6 bg-blue-600 text-white rounded-[2rem] shadow-lg relative overflow-hidden group">
                      <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Geplanter Content (Fokus)</p>
                        <h4 className="text-2xl font-black flex items-center gap-2"><Sparkles size={24} className="text-blue-200 group-hover:rotate-12 transition-transform"/>{user.contentFocus}</h4>
                      </div>
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-all"><Target size={120} /></div>
                    </div>
                  )}
                  <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <h5 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Info size={18} className="text-emerald-600"/> Vorbereitung</h5>
                    <ul className="space-y-3">
                      <li className="flex gap-3 text-sm text-slate-600"><div className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold">1</div>Bitte alle Produkte & Räumlichkeiten vorbereiten.</li>
                      <li className="flex gap-3 text-sm text-slate-600"><div className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold">2</div>Relevante Outfits oder Requisiten bereitlegen.</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-20 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200"><div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400"><Calendar size={32}/></div><h4 className="text-xl font-bold text-slate-900">Noch kein Termin geplant</h4><p className="text-slate-500 mt-2">Wir melden uns in Kürze für einen Drehtermin.</p></div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-12">
      <nav className="bg-white border-b px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-all"><span className="text-white font-bold text-xs">MyDC</span></div>
          <div className="flex flex-col"><span className="font-bold text-lg tracking-tight leading-none">MyDC Portal</span><span className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-0.5">High End Marketing</span></div>
        </div>
        <button onClick={() => setUser(null)} className="flex items-center gap-2 text-slate-500 text-sm font-bold bg-slate-50 px-3 py-2 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all active:scale-95"><LogOut size={18} /> <span className="hidden md:inline">Abmelden</span></button>
      </nav>
      <main className="max-w-6xl mx-auto p-4 md:p-8">
        {activeTab !== 'overview' && (
             <button onClick={() => setActiveTab('overview')} className="mb-6 text-sm font-bold text-slate-400 flex items-center gap-2 hover:text-slate-900 transition-colors animate-in slide-in-from-left duration-300"><ChevronRight size={18} className="rotate-180"/> Zurück zum Dashboard</button>
        )}
        {activeTab === 'overview' ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 leading-tight">Hallo, {(user.name || "Kunde").split(' ')[0]}</h2>
                    <div className="flex gap-2 mt-2">
                        <span className="text-[10px] font-black text-slate-400 px-3 py-1.5 bg-white rounded-lg border border-slate-200 uppercase tracking-widest">Kunden-ID: {user.id}</span>
                        {user.company && <span className="text-[10px] font-black text-blue-600 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100 uppercase tracking-widest">{user.company}</span>}
                    </div>
                </div>
                <div className="text-right flex flex-col items-end">
                    <LogoImage className="w-16 h-16 rounded-xl shadow-lg mb-2" />
                    <p className="text-xs text-slate-500 font-medium max-w-xs leading-relaxed">Herzlich willkommen in Ihrem persönlichen <br/><span className="text-slate-900 font-bold">My DC Social Media Dashboard</span></p>
                </div>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={<ShieldCheck size={24}/>} color="blue" label="Tarif" value={user.tarif || "Kein Tarif"} />
              <StatCard icon={<CreditCard size={24}/>} color="emerald" label="Monatspreis" value={`${totalBrutto} €`} />
              <StatCard icon={<Calendar size={24}/>} color="purple" label="Abrechnung" value={user.monat || "Aktuell"} />
              <StatCard icon={<Clock size={24}/>} color="amber" label="Partnerschaft" value={user.startDatum ? new Date(user.startDatum).getFullYear() : new Date().getFullYear()} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden shadow-xl">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4 text-blue-400"><MessageSquare size={16}/><h3 className="text-xl font-bold uppercase tracking-tight">Status & News</h3></div>
                    <p className="text-slate-300 text-lg md:text-xl leading-relaxed mb-8 font-medium">{user.statusMessage || "Wir analysieren gerade die neuesten Trends für Ihren Account. In Kürze finden Sie hier neue Updates!"}</p>
                    <div className="flex gap-4"><a href="mailto:office@my-dc.at" className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-bold text-sm shadow-lg active:scale-95 transition-all">Support</a><button onClick={() => setActiveTab('strategy')} className="bg-white/10 text-white border border-white/20 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-white/20 active:scale-95 transition-all">Details</button></div>
                  </div>
                  <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-20"></div>
                </div>
                {user.nextAppointment && (
                  <div onClick={() => setActiveTab('appointments')} className="bg-white border border-slate-200 p-6 rounded-[2.5rem] flex items-center justify-between cursor-pointer hover:border-emerald-500 transition-all group shadow-sm border-l-4 border-l-emerald-600">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform"><Camera size={24}/></div>
                      <div>
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Nächster Drehtermin</p>
                        <h4 className="text-lg font-bold text-slate-900">{new Date(user.nextAppointment).toLocaleString('de-DE', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })} Uhr</h4>
                      </div>
                    </div>
                    <ChevronRight className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                  </div>
                )}
                {(user.addons || []).length > 0 && (
                  <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm">
                    <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2 uppercase text-xs tracking-widest"><Coins size={16} className="text-amber-500" /> Gebuchte Extras</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(user.addons || []).map((addon, i) => (
                        <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100"><span className="text-sm font-semibold text-slate-700">{addon.name}</span><span className="text-sm font-bold text-slate-900">{addon.preis} €</span></div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-[2rem] p-6 border border-amber-200 shadow-sm relative overflow-hidden group">
                    <div className="relative z-10">
                        <h4 className="font-bold text-lg mb-2 flex items-center gap-2 text-slate-900"><Rocket size={20} className="text-amber-600" /> Boost your Business</h4>
                        <p className="text-xs text-slate-700 mb-4 font-medium leading-relaxed">Maximieren Sie Ihren Erfolg mit unseren Premium-Upgrades:</p>
                        <ul className="space-y-2 mb-4">
                            <li className="text-xs font-bold text-slate-800 flex items-center gap-2"><CheckCircle2 size={12} className="text-amber-600"/> AD Kampagnen für mehr Umsatz</li>
                            <li className="text-xs font-bold text-slate-800 flex items-center gap-2"><CheckCircle2 size={12} className="text-amber-600"/> Business Meta Abo (Verifiziert)</li>
                            <li className="text-xs font-bold text-slate-800 flex items-center gap-2"><CheckCircle2 size={12} className="text-amber-600"/> Community Management</li>
                        </ul>
                        <a href="mailto:office@my-dc.at?subject=Anfrage%20Zusatzoptionen" className="w-full block text-center bg-slate-900 text-white py-3 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"><Mail size={14}/> Jetzt anfragen</a>
                    </div>
                    <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-amber-400 rounded-full blur-[50px] opacity-30"></div>
                </div>
                <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm">
                    <h4 className="font-bold text-lg mb-4 flex items-center gap-2"><TrendingUp size={20} className="text-blue-600" /> Menü</h4>
                    <div className="space-y-3">
                        <button onClick={() => setActiveTab('appointments')} className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all active:scale-95"><span className="text-sm font-bold">Content-Planung</span><Camera size={16} className="text-slate-400"/></button>
                        <button onClick={() => setActiveTab('strategy')} className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all active:scale-95"><span className="text-sm font-bold">Strategie-Plan</span><Target size={16} className="text-slate-400"/></button>
                        <button onClick={() => setActiveTab('profile')} className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all active:scale-95"><span className="text-sm font-bold">Mein Profil</span><User size={16} className="text-slate-400"/></button>
                    </div>
                </div>
              </div>
            </div>
          </div>
        ) : renderContent()}
      </main>
      <footer className="max-w-6xl mx-auto p-8 text-center border-t mt-12 opacity-30"><p className="text-[9px] uppercase font-bold tracking-[0.2em]">&copy; MyDC OG &bull; High End Content Marketing</p></footer>
    </div>
  );
};

const StatCard = ({ icon, color, label, value }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100'
  };
  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-all">
      <div className={`p-3 rounded-2xl border ${colors[color]} w-fit mb-4`}>{icon}</div>
      <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mb-1">{label}</p>
      <h3 className="text-base font-bold text-slate-900 leading-tight">{value}</h3>
    </div>
  );
};

export default App;
