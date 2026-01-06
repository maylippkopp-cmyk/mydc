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
  EyeOff,
  AlertCircle,
  FileCheck,
  TreeDeciduous,
  AlertTriangle
} from 'lucide-react';

// --- KONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyD5Tb2kC0uyZTvsh0vtjU-TXIADz5aTCmw",
  authDomain: "my-dc-dashboard.firebaseapp.com",
  projectId: "my-dc-dashboard",
  storageBucket: "my-dc-dashboard.firebasestorage.app",
  messagingSenderId: "1097386445910",
  appId: "1:1097386445910:web:80a8e70badbd4e5f3b7ff7"
};

let db;
try {
  if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "DEIN_API_KEY_HIER") {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  }
} catch (e) {
  console.error("Firebase Init Error:", e);
}

const TARIFF_INFO = {
  "Social Sphere": "Der kleinste Tarif. Darin sind lediglich die Verwaltung, das Posten, das Schneiden der Videos, das Hochladen und die Administration von ausgewählten Kanälen vorhanden (z.B. Instagram, Facebook und Co.).",
  "Social Sphere Pro": "Beinhaltet alles was das normale Social Sphere beinhaltet, mit dem Extra, dass wir persönlich vor Ort sind (1 bis maximal 2x im Monat) und selber für den Kunden Content produzieren.",
  "Social Sphere Ultimate": "Beinhaltet alles was Pro beinhaltet, mit dem Unterschied, dass hier ein variables AD Budget mit dem Kunden vereinbart wird, welches zusätzlich mit einer oder mehreren AD Kampagnen verknüpft ist.",
  "Individueller Tarif": "Ein speziell auf Ihre Bedürfnisse zugeschnittenes Leistungspaket."
};

const TARIFF_OPTIONS = Object.keys(TARIFF_INFO);

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
const INVOICE_STATUS_OPTIONS = ["Bezahlt", "Offen", "Fällig"];

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
  const [viewTariff, setViewTariff] = useState(''); 
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDuePopup, setShowDuePopup] = useState(false); 
  
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
        const saved = localStorage.getItem('mydc_customers_v20');
        if (saved) {
            setCustomers(JSON.parse(saved));
        } else {
            // Default Demo User
            setCustomers({
                "KD-1001": {
                    name: "Max Mustermann",
                    company: "Muster GmbH",
                    password: "start123", 
                    tarif: "Social Sphere",
                    tarifDescription: TARIFF_INFO["Social Sphere"],
                    creativeFocus: 3, 
                    statusOrganic: true,
                    statusPaid: false,
                    managedAccounts: ["Instagram"],
                    preis: "499,00",
                    addons: [{ name: "Zusatz-Reel", preis: "89,00" }],
                    monat: "Januar 2024",
                    startDatum: "2023-05-15",
                    status: "Aktiv",
                    nextAppointment: "2024-02-15T10:00",
                    contentFocus: "Winter-Kollektion Shooting",
                    preparationInfo: "Bitte alle Produkte & Räumlichkeiten vorbereiten.",
                    statusMessage: "",
                    internalNotes: "",
                    invoiceStatus: "Bezahlt",
                    invoiceHistory: [
                      { month: "Dezember 2023", status: "Bezahlt" },
                      { month: "November 2023", status: "Bezahlt" }
                    ]
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
    tarifDescription: TARIFF_INFO[TARIFF_OPTIONS[0]],
    creativeFocus: 3,
    statusOrganic: false,
    statusPaid: false,
    managedAccounts: [],
    preis: '',
    addons: [],
    startDatum: new Date().toISOString().split('T')[0],
    status: 'Aktiv',
    nextAppointment: '',
    contentFocus: '',
    preparationInfo: '',
    statusMessage: '',
    internalNotes: '',
    invoiceStatus: 'Bezahlt',
    invoiceHistory: []
  });

  const [newAddon, setNewAddon] = useState({ name: '', preis: '' });
  const [newHistoryItem, setNewHistoryItem] = useState({ month: '', status: 'Bezahlt' });

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
            setViewTariff(foundUser.tarif); 
            setIsAdmin(false);
            setActiveTab('overview');
            
            if (foundUser.invoiceStatus === 'Fällig') {
                setShowDuePopup(true);
            } else {
                setShowDuePopup(false);
            }

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
    setShowDuePopup(false);
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
        localStorage.setItem('mydc_customers_v20', JSON.stringify(newCustomers));
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
              localStorage.setItem('mydc_customers_v20', JSON.stringify(newCustomers));
          }
      }
  };

  const resetForm = () => {
    setEditCustomer({ 
        id: '', name: '', company: '', password: '', 
        tarif: TARIFF_OPTIONS[0], 
        tarifDescription: TARIFF_INFO[TARIFF_OPTIONS[0]],
        creativeFocus: 3, statusOrganic: false, statusPaid: false,
        managedAccounts: [], preis: '', addons: [], 
        startDatum: new Date().toISOString().split('T')[0], status: 'Aktiv', 
        nextAppointment: '', contentFocus: '', preparationInfo: '', statusMessage: '', internalNotes: '',
        invoiceStatus: 'Bezahlt', invoiceHistory: []
      });
    setNewAddon({ name: '', preis: '' });
    setNewHistoryItem({ month: '', status: 'Bezahlt' });
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

  const addHistoryItem = () => {
    if (!newHistoryItem.month) return;
    setEditCustomer(prev => ({
        ...prev,
        invoiceHistory: [...(prev.invoiceHistory || []), { ...newHistoryItem }]
    }));
    setNewHistoryItem({ month: '', status: 'Bezahlt' });
  };

  const removeHistoryItem = (index) => {
    setEditCustomer(prev => ({
        ...prev,
        invoiceHistory: prev.invoiceHistory.filter((_, i) => i !== index)
    }));
  };

  const updateTariff = (newTariff) => {
      setEditCustomer({
          ...editCustomer,
          tarif: newTariff,
          tarifDescription: TARIFF_INFO[newTariff] || ""
      });
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "Kein Termin vereinbart";
    const dt = new Date(dateTimeStr);
    return dt.toLocaleString('de-DE', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + " Uhr";
  };

  const getStatusColor = (status) => {
      switch(status) {
          case 'Bezahlt': return 'bg-green-100 text-green-700 border-green-200';
          case 'Offen': return 'bg-orange-100 text-orange-700 border-orange-200'; 
          case 'Fällig': return 'bg-red-100 text-red-700 border-red-200'; 
          default: return 'bg-slate-100 text-slate-700 border-slate-200';
      }
  };

  const getStatusIcon = (status) => {
      switch(status) {
          case 'Bezahlt': return <FileCheck size={24} className="text-green-600"/>;
          case 'Offen': return <FileText size={24} className="text-orange-600"/>;
          case 'Fällig': return <AlertCircle size={24} className="text-red-600"/>;
          default: return <FileText size={24} className="text-slate-600"/>;
      }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 font-sans text-slate-900">
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
      <div className="min-h-screen bg-slate-100 font-sans pb-10 text-slate-800">
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
                    <select className="w-full p-3 border rounded-xl" value={editCustomer.tarif} onChange={e => updateTariff(e.target.value)}>
                        {TARIFF_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <textarea 
                        className="w-full p-2 text-xs border rounded-xl mt-1 h-20 bg-slate-50"
                        placeholder="Tarifbeschreibung (automatisch oder manuell)"
                        value={editCustomer.tarifDescription}
                        onChange={e => setEditCustomer({...editCustomer, tarifDescription: e.target.value})}
                    />
                </div>
                
                {/* STRATEGY & CHANNELS */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Target size={12}/> Strategie & Kanäle</p>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase block">Creative Focus (1=Product, 5=Personal)</label>
                        <input 
                            type="range" 
                            min="1" 
                            max="5" 
                            step="1" 
                            className="w-full accent-slate-900"
                            value={editCustomer.creativeFocus || 3} 
                            onChange={e => setEditCustomer({...editCustomer, creativeFocus: parseInt(e.target.value)})}
                        />
                        <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase">
                            <span>Product Brand</span>
                            <span>Personal Brand</span>
                        </div>
                    </div>
                    <div className="flex gap-4 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-xl border border-slate-200">
                            <input type="checkbox" checked={editCustomer.statusOrganic || false} onChange={e => setEditCustomer({...editCustomer, statusOrganic: e.target.checked})} className="accent-green-600 w-4 h-4"/>
                            <span className="text-xs font-bold flex items-center gap-1"><TreeDeciduous size={14} className={editCustomer.statusOrganic ? "text-green-600" : "text-slate-400"}/> Organic</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-xl border border-slate-200">
                            <input type="checkbox" checked={editCustomer.statusPaid || false} onChange={e => setEditCustomer({...editCustomer, statusPaid: e.target.checked})} className="accent-amber-500 w-4 h-4"/>
                            <span className="text-xs font-bold flex items-center gap-1"><Coins size={14} className={editCustomer.statusPaid ? "text-amber-500" : "text-slate-400"}/> Paid</span>
                        </label>
                    </div>
                    <div className="pt-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Kanäle</label>
                        <div className="flex flex-wrap gap-1.5">
                            {PLATFORMS.map(p => (<button key={p} onClick={() => toggleSelection('managedAccounts', p)} className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${editCustomer.managedAccounts?.includes(p) ? 'bg-slate-900 text-white' : 'bg-white text-slate-400 border-slate-200'}`}>{p}</button>))}
                        </div>
                    </div>
                </div>

                {/* INVOICE SECTION */}
                <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-100 space-y-3">
                    <p className="text-[10px] font-black text-yellow-600 uppercase tracking-widest flex items-center gap-1"><FileText size={12}/> Abrechnung & Rechnungen</p>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-yellow-600 uppercase ml-1">Aktueller Rechnungsstatus</label>
                        <select className="w-full p-2.5 border border-yellow-200 rounded-xl bg-white" value={editCustomer.invoiceStatus || 'Bezahlt'} onChange={e => setEditCustomer({...editCustomer, invoiceStatus: e.target.value})}>
                            {INVOICE_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="pt-2 border-t border-yellow-200">
                        <label className="text-[10px] font-bold text-yellow-600 uppercase ml-1 block mb-2">Historie hinzufügen</label>
                        <div className="flex gap-2">
                            <input className="flex-1 p-2 border border-yellow-200 rounded-lg text-xs" placeholder="Monat (z.B. Mai 2024)" value={newHistoryItem.month} onChange={e => setNewHistoryItem({...newHistoryItem, month: e.target.value})} />
                            <select className="w-24 p-2 border border-yellow-200 rounded-lg text-xs bg-white" value={newHistoryItem.status} onChange={e => setNewHistoryItem({...newHistoryItem, status: e.target.value})}>
                                {INVOICE_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <button onClick={addHistoryItem} className="p-2 bg-yellow-500 text-white rounded-lg"><Plus size={16}/></button>
                        </div>
                        <div className="mt-2 space-y-1 max-h-24 overflow-y-auto">
                            {(editCustomer.invoiceHistory || []).map((h, i) => (
                                <div key={i} className="flex justify-between items-center text-xs bg-white/50 p-1.5 rounded">
                                    <span>{h.month}</span>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-1.5 rounded text-[9px] font-bold ${getStatusColor(h.status)}`}>{h.status}</span>
                                        <button onClick={() => removeHistoryItem(i)} className="text-red-400"><X size={12}/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
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
                    <textarea rows="2" className="w-full p-2.5 border border-blue-200 rounded-xl bg-white text-xs" placeholder="Vorbereitungs-Infos für den Kunden..." value={editCustomer.preparationInfo} onChange={e => setEditCustomer({...editCustomer, preparationInfo: e.target.value})} />
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
                            {data.invoiceStatus && <span className={`text-[9px] font-bold px-2 py-1 rounded-md border ${getStatusColor(data.invoiceStatus)}`}>{data.invoiceStatus}</span>}
                        </div>
                    </div>
                    <div className="flex gap-2"><button onClick={() => setEditCustomer({id, ...data, addons: data.addons || [], strategies: data.strategies || [], managedAccounts: data.managedAccounts || [], invoiceHistory: data.invoiceHistory || [], preparationInfo: data.preparationInfo || '', creativeFocus: data.creativeFocus || 3, statusOrganic: data.statusOrganic || false, statusPaid: data.statusPaid || false, tarifDescription: data.tarifDescription || TARIFF_INFO[data.tarif] || ""})} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-blue-600 hover:text-white transition-all"><Settings size={20}/></button><button onClick={() => deleteCustomerData(id)} className="p-3 bg-slate-50 text-slate-300 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all"><Trash2 size={20}/></button></div>
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
        // Calculation for the gradient
        const focusVal = user.creativeFocus || 3;
        const percent = (focusVal - 1) * 25;
        
        return (
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-4"><div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><Target size={24}/></div><div><h3 className="text-2xl font-bold text-slate-900">Strategie-Plan</h3><p className="text-slate-500 text-sm">Ihre aktuelle Marktausrichtung und Kampagnenfokus.</p></div></div>
            
            <div className="space-y-6">
                <div>
                    <h4 className="font-bold text-lg mb-4 text-slate-900">Creative Focus</h4>
                    <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-200">
                        <div className="relative h-6 rounded-full w-full shadow-inner mb-6" style={{ background: `linear-gradient(90deg, #e2e8f0 0%, #0f172a ${percent}%, #e2e8f0 100%)` }}>
                            {/* Thumb */}
                            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-white border-4 border-slate-900 rounded-full shadow-xl transition-all duration-700 ease-out z-10" style={{ left: `${percent}%` }}></div>
                            
                            {/* Scale Points */}
                            {[0, 25, 50, 75, 100].map((pos) => (
                                <div key={pos} className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white/50 rounded-full shadow-sm z-0" style={{ left: `${pos}%` }}></div>
                            ))}
                        </div>
                        <div className="flex justify-between text-sm font-black text-slate-600 uppercase tracking-widest">
                            <span>Product Brand</span>
                            <span>Personal Brand</span>
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="font-bold text-lg mb-4 text-slate-900">Target Status</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={`p-6 rounded-[2rem] border transition-all flex items-center justify-between ${user.statusOrganic ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200 opacity-50'}`}>
                            <div>
                                <h5 className={`font-bold text-lg ${user.statusOrganic ? 'text-green-800' : 'text-slate-500'}`}>Organic Content</h5>
                                <p className="text-xs font-medium mt-1 opacity-70">{user.statusOrganic ? 'Aktiviert' : 'Inaktiv'}</p>
                            </div>
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${user.statusOrganic ? 'bg-green-600 text-white shadow-lg shadow-green-200' : 'bg-slate-200 text-slate-400'}`}>
                                <TreeDeciduous size={28} />
                            </div>
                        </div>

                        <div className={`p-6 rounded-[2rem] border transition-all flex items-center justify-between ${user.statusPaid ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200 opacity-50'}`}>
                            <div>
                                <h5 className={`font-bold text-lg ${user.statusPaid ? 'text-amber-800' : 'text-slate-500'}`}>Paid Content</h5>
                                <p className="text-xs font-medium mt-1 opacity-70">{user.statusPaid ? 'Aktiviert' : 'Inaktiv'}</p>
                            </div>
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${user.statusPaid ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' : 'bg-slate-200 text-slate-400'}`}>
                                <Coins size={28} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        );
      case 'appointments':
        return (
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 mb-6"><div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><Camera size={24}/></div><div><h3 className="text-2xl font-bold text-slate-900">Content & Termine</h3><p className="text-slate-500 text-sm">Planung und Produktion.</p></div></div>
            {user.nextAppointment ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Geplanter Content (Links) */}
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
                </div>

                {/* Termin Karte (Rechts) */}
                <div className="bg-emerald-600 text-white rounded-[2.5rem] p-10 relative overflow-hidden shadow-xl flex flex-col justify-between">
                  <div className="relative z-10">
                    <div className="bg-white/20 w-fit px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">nächster persönlicher Termin</div>
                    <h4 className="text-4xl font-black mb-2">{new Date(user.nextAppointment).toLocaleDateString('de-DE', { weekday: 'long' })}</h4>
                    <p className="text-5xl font-light mb-8 opacity-90">{new Date(user.nextAppointment).toLocaleDateString('de-DE', { day: '2-digit', month: 'long' })}</p>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-sm"><Clock className="text-emerald-200" size={24}/><div><p className="text-[10px] uppercase font-bold text-emerald-200">Uhrzeit</p><p className="text-lg font-bold">{new Date(user.nextAppointment).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr</p></div></div>
                      <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-sm"><MapPin className="text-emerald-200" size={24}/><div><p className="text-[10px] uppercase font-bold text-emerald-200">Ort</p><p className="text-lg font-bold">Direkt bei Ihnen</p></div></div>
                    </div>

                    {/* Vorbereitung Block (Integriert) */}
                    <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10 mb-4">
                        <h5 className="font-bold text-emerald-100 mb-2 flex items-center gap-2 text-sm"><Info size={16} className="text-emerald-200"/> Vorbereitung</h5>
                        <p className="text-sm text-white/90 leading-relaxed">
                            {user.preparationInfo || "Bitte alle Produkte & Räumlichkeiten sowie relevante Outfits vorbereiten."}
                        </p>
                    </div>

                    {/* Termin verschieben Button (Integriert) */}
                    <div className="flex justify-between items-center pt-4 border-t border-white/10">
                        <span className="text-xs font-medium text-emerald-100">Termin ändern?</span>
                        <a href="mailto:office@my-dc.at?subject=Terminverschiebung" className="bg-white text-emerald-800 px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-50 transition-all flex items-center gap-2 shadow-sm">
                            <Mail size={14}/> Kontaktieren
                        </a>
                    </div>
                  </div>
                  <Camera size={200} className="absolute -bottom-10 -right-10 text-white/5 rotate-12" />
                </div>
              </div>
            ) : (
              <div className="p-20 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200"><div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400"><Calendar size={32}/></div><h4 className="text-xl font-bold text-slate-900">Noch kein Termin geplant</h4><p className="text-slate-500 mt-2">Wir melden uns in Kürze für einen Drehtermin.</p></div>
            )}
          </div>
        );
      
      case 'tariffDetails':
        return (
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b pb-6">
              <div>
                <h3 className="text-3xl font-black text-slate-900 mb-2">{viewTariff}</h3>
                <p className="text-slate-500 text-sm">Details zum gewählten Leistungspaket.</p>
              </div>
              {viewTariff === user.tarif ? (
                  <button className="bg-slate-100 text-slate-400 px-6 py-3 rounded-2xl font-bold text-sm cursor-default flex items-center gap-2">
                    Aktueller Tarif <CheckCircle2 size={16}/>
                  </button>
              ) : (
                  <a href={`mailto:office@my-dc.at?subject=Tarifwechsel%20zu%20${viewTariff}`} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg hover:-translate-y-0.5">
                    Wechseln zu {viewTariff} <ArrowRight size={16}/>
                  </a>
              )}
            </div>
            
            <div className="p-8 bg-blue-50 rounded-[2rem] border border-blue-100">
                <h4 className="font-bold text-lg text-blue-900 mb-4 flex items-center gap-2"><Info size={20}/> Leistungsbeschreibung</h4>
                <p className="text-blue-800 leading-relaxed font-medium">
                    {viewTariff === user.tarif && user.tarifDescription 
                        ? user.tarifDescription 
                        : (TARIFF_INFO[viewTariff] || "Keine Beschreibung verfügbar.")}
                </p>
            </div>

            <div className="mt-8">
                <h4 className="font-bold text-lg mb-4 text-slate-900">Verfügbare Tarif-Modelle</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.keys(TARIFF_INFO).filter(t => t !== user.tarif).map(t => (
                    <div 
                        key={t} 
                        onClick={() => setViewTariff(t)}
                        className={`p-4 border rounded-2xl cursor-pointer transition-all ${viewTariff === t ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                    >
                        <h5 className={`font-bold text-sm ${viewTariff === t ? 'text-blue-700' : 'text-slate-700'}`}>{t}</h5>
                    </div>
                ))}
                </div>
            </div>
          </div>
        );

      case 'billingDetails':
        return (
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4 border-b pb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${getStatusColor(user.invoiceStatus).replace('border', '')}`}>
                    {getStatusIcon(user.invoiceStatus)}
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-slate-900">Abrechnungsstatus</h3>
                    <p className="text-slate-500 text-sm">Aktuelle Rechnung: <span className={`font-bold ml-1 px-2 py-0.5 rounded ${getStatusColor(user.invoiceStatus)}`}>{user.invoiceStatus || 'Unbekannt'}</span></p>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="font-bold text-lg text-slate-900">Historie</h4>
                {(user.invoiceHistory && user.invoiceHistory.length > 0) ? (
                    <div className="grid gap-3">
                        {user.invoiceHistory.map((inv, idx) => (
                            <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-300 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Calendar size={18} className="text-slate-400"/>
                                    <span className="font-bold text-slate-700">{inv.month}</span>
                                </div>
                                <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${getStatusColor(inv.status)}`}>
                                    {inv.status}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-slate-400 italic text-center py-8">Keine historischen Daten verfügbar.</p>
                )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 pb-12 relative">
      {/* Pop-Up Modal für fällige Rechnungen */}
      {showDuePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border-4 border-red-100 animate-in zoom-in-95 duration-300 relative">
                <button onClick={() => setShowDuePopup(false)} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"><X size={20}/></button>
                <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
                        <AlertTriangle size={40} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">Rechnung fällig</h3>
                    <p className="text-slate-500 mb-8 leading-relaxed">
                        Wir möchten Sie höflich daran erinnern, dass eine Rechnung aktuell noch offen ist. Bitte prüfen Sie Ihre Unterlagen.
                    </p>
                    <button onClick={() => { setActiveTab('billingDetails'); setShowDuePopup(false); }} className="w-full bg-red-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all active:scale-95 flex items-center justify-center gap-2">
                        Details ansehen <ArrowRight size={20}/>
                    </button>
                </div>
            </div>
        </div>
      )}

      <nav className="bg-white border-b px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('overview')}>
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-all"><span className="text-white font-bold text-xs">MyDC</span></div>
          <div className="flex flex-col"><span className="font-bold text-lg tracking-tight leading-none">MyDC Portal</span><span className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-0.5">Your Media Marketing</span></div>
        </div>
        <button onClick={() => setUser(null)} className="flex items-center gap-2 text-slate-500 text-sm font-bold bg-slate-50 px-3 py-2 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all active:scale-95"><LogOut size={18} /> <span className="hidden md:inline">Abmelden</span></button>
      </nav>
      <main className="max-w-6xl mx-auto p-4 md:p-8">
        {activeTab !== 'overview' && (
             <button onClick={() => { setActiveTab('overview'); setViewTariff(user.tarif); }} className="mb-6 text-sm font-bold text-slate-400 flex items-center gap-2 hover:text-slate-900 transition-colors animate-in slide-in-from-left duration-300"><ChevronRight size={18} className="rotate-180"/> Zurück zum Dashboard</button>
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="cursor-pointer" onClick={() => { setViewTariff(user.tarif); setActiveTab('tariffDetails'); }}>
                  <StatCard icon={<ShieldCheck size={24}/>} color="blue" label="Mein Tarif" value={user.tarif || "Kein Tarif"} clickable />
              </div>
              <div className="cursor-pointer" onClick={() => setActiveTab('billingDetails')}>
                  <StatCard 
                    icon={getStatusIcon(user.invoiceStatus)} 
                    color={user.invoiceStatus === 'Bezahlt' ? 'emerald' : user.invoiceStatus === 'Fällig' ? 'purple' : 'amber'} 
                    label="Rechnungsstatus" 
                    value={
                        <div>
                            <div className="text-sm text-slate-500 font-medium mb-1">{user.monat || "Aktuell"}</div>
                            <div className="text-xl">{user.invoiceStatus || "Unbekannt"}</div>
                        </div>
                    }
                    clickable
                  />
              </div>
              
              <StatCard icon={<Clock size={24}/>} color="amber" label="Partnerschaft" value={user.startDatum ? new Date(user.startDatum).getFullYear() : new Date().getFullYear()} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden shadow-xl">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4 text-blue-400"><MessageSquare size={16}/><h3 className="text-xl font-bold uppercase tracking-tight">Status & News</h3></div>
                    <p className="text-slate-300 text-lg md:text-xl leading-relaxed mb-8 font-medium">{user.statusMessage || "Wir analysieren gerade die neuesten Trends für Ihren Account. In Kürze finden Sie hier neue Updates!"}</p>
                    <div className="flex gap-4"><a href="mailto:office@my-dc.at" className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-bold text-sm shadow-lg active:scale-95 transition-all">Support</a></div>
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
                        <button onClick={() => setActiveTab('appointments')} className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all active:scale-95"><span className="text-sm font-bold">Content & Termine</span><Camera size={16} className="text-slate-400"/></button>
                        <button onClick={() => setActiveTab('strategy')} className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all active:scale-95"><span className="text-sm font-bold">Strategie-Plan</span><Target size={16} className="text-slate-400"/></button>
                        <button onClick={() => setActiveTab('profile')} className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all active:scale-95"><span className="text-sm font-bold">Mein Profil</span><User size={16} className="text-slate-400"/></button>
                    </div>
                </div>
              </div>
            </div>
          </div>
        ) : renderContent()}
      </main>
      <footer className="max-w-6xl mx-auto p-8 text-center border-t mt-12 opacity-50 text-[10px] text-slate-500 font-bold uppercase tracking-widest flex flex-col gap-2">
          <p>&copy; MyDC OG &bull; Your Media Marketing</p>
          <a href="https://www.my-dc.at/impressum" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 transition-colors underline underline-offset-4">Impressum</a>
      </footer>
    </div>
  );
};

const StatCard = ({ icon, color, label, value, clickable }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100'
  };
  return (
    <div className={`bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-md transition-all h-full flex flex-col justify-between ${clickable ? 'cursor-pointer hover:border-slate-300 hover:-translate-y-1 active:scale-95' : ''}`}>
      <div className={`p-3 rounded-2xl border ${colors[color] || colors.blue} w-fit mb-4`}>{icon}</div>
      <div>
        <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mb-1">{label}</p>
        <div className="text-base font-bold text-slate-900 leading-tight">{value}</div>
      </div>
    </div>
  );
};

export default App;
