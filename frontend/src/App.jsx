import './index.css';
import { useState, useEffect, useCallback } from 'react';
import { Search, Brain, BarChart3, Shield, Menu, X, ChevronRight, CheckCircle2, AlertCircle, TrendingUp, Users, DollarSign, FileCheck, AlertTriangle, Plus, Trash2, Eye, Download, CreditCard, Bell, Star, ArrowRight, Phone, HeartPulse, Car, Home, Plane, Briefcase, FileText, LogOut, Settings, ChevronDown } from 'lucide-react';
import axios from 'axios';

// ── API SETUP ──────────────────────────────────────────────────────────────
const api = axios.create({ baseURL: 'http://localhost:8080/api' });
api.interceptors.request.use(config => {
  const token = localStorage.getItem('insurai_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(res => res, err => {
  if (err.response?.status === 401) {
    localStorage.removeItem('insurai_token');
    localStorage.removeItem('insurai_user');
    window.location.reload();
  }
  return Promise.reject(err);
});

const authAPI = {
  login:    (email, password) => api.post('/auth/login', { email, password }),
  register: (firstname, lastname, email, password, phone) =>
    api.post('/auth/register', { firstname, lastname, email, password, phone, role: 'CUSTOMER' }),
};
const policyAPI = {
  getMyPolicies:      (userId) => api.get(`/policies/user/${userId}`),
  getAllPolicies:      ()       => api.get('/policies'),
  createPolicy:       (userId, data) => api.post(`/policies/user/${userId}`, data),
  updatePolicyStatus: (id, status)   => api.patch(`/policies/${id}/status`, null, { params: { status } }),
};
const claimAPI = {
  getMyClaims:       (userId) => api.get(`/claims/user/${userId}`),
  getAllClaims:       ()       => api.get('/claims'),
  submitClaim:       (userId, policyId, data) => api.post(`/claims/user/${userId}/policy/${policyId}`, data),
  updateClaimStatus: (id, status) => api.patch(`/claims/${id}/status`, null, { params: { status } }),
};
const paymentAPI = {
  getMyPayments: (userId)               => api.get(`/payments/user/${userId}`),
  makePayment:   (userId, policyId, data) => api.post(`/payments/user/${userId}/policy/${policyId}`, data),
};
const userAPI = {
  getAllUsers: ()         => api.get('/users'),
  updateUser:  (id, data) => api.put(`/users/${id}`, data),
  deleteUser:  (id)       => api.delete(`/users/${id}`),
};

// ── POLICY CATALOGUE ───────────────────────────────────────────────────────
const POLICY_CATALOGUE = [
  { type:'HEALTH',   name:'Health Shield Pro',    price:'450',  coverage:'100000', icon: HeartPulse, tag:'Most Popular',  tagColor:'#f59e0b', desc:'Comprehensive health cover for you & family', features:['Cashless at 5000+ hospitals','No claim bonus up to 50%','Day care procedures covered'] },
  { type:'AUTO',     name:'Motor Protect Plus',   price:'180',  coverage:'50000',  icon: Car,        tag:'Best Value',    tagColor:'#10b981', desc:'Complete vehicle protection on road',          features:['Zero depreciation cover','24/7 roadside assistance','Engine protection included'] },
  { type:'HOME',     name:'Home Secure Elite',    price:'250',  coverage:'300000', icon: Home,       tag:'',              tagColor:'',        desc:'Protect your home against all risks',          features:['Structure & contents covered','Natural disaster cover','Burglary & theft protection'] },
  { type:'LIFE',     name:'Life Guard Term Plan', price:'120',  coverage:'500000', icon: Shield,     tag:'Recommended',   tagColor:'#3b82f6', desc:'Secure your family\'s financial future',       features:['Pure term life cover','Tax benefits under 80C','Critical illness add-on available'] },
  { type:'TRAVEL',   name:'Travel Safe Global',   price:'50',   coverage:'25000',  icon: Plane,      tag:'New',           tagColor:'#8b5cf6', desc:'Hassle-free travel coverage worldwide',        features:['Medical emergency abroad','Trip cancellation cover','Lost baggage reimbursement'] },
  { type:'BUSINESS', name:'Biz Guard Commercial', price:'800',  coverage:'1000000',icon: Briefcase,  tag:'Enterprise',    tagColor:'#ef4444', desc:'End-to-end business risk protection',         features:['Property & liability cover','Business interruption','Employee coverage included'] },
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole]     = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [authView, setAuthView]     = useState('login');
  const [authError, setAuthError]   = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab]   = useState('dashboard');
  const [loading, setLoading]       = useState(false);
  const [notifOpen, setNotifOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [formData, setFormData] = useState({ firstname:'', lastname:'', email:'', phone:'', password:'', confirmPassword:'' });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordMatch, setPasswordMatch]       = useState(null);
  const [policies,  setPolicies]  = useState([]);
  const [claims,    setClaims]    = useState([]);
  const [payments,  setPayments]  = useState([]);
  const [allUsers,  setAllUsers]  = useState([]);
  const [claimForm, setClaimForm] = useState({ policyId:'', type:'MEDICAL', amount:'', description:'' });
  const [paymentForm, setPaymentForm] = useState({ policyId:'', cardLast4:'' });
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('insurai_token');
    const user  = localStorage.getItem('insurai_user');
    if (token && user) {
      const p = JSON.parse(user);
      setCurrentUser(p);
      setUserRole(p.role.toLowerCase());
      setIsAuthenticated(true);
      setFormData(f => ({ ...f, firstname: p.firstname||'', lastname: p.lastname||'', email: p.email||'', phone: p.phone||'' }));
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const role = currentUser.role.toLowerCase();
      if (['dashboard','policies','buy-policy'].includes(activeTab)) {
        const res = role==='customer' ? await policyAPI.getMyPolicies(currentUser.userId) : await policyAPI.getAllPolicies();
        setPolicies(res.data);
      }
      if (['dashboard','claims'].includes(activeTab)) {
        const res = role==='customer' ? await claimAPI.getMyClaims(currentUser.userId) : await claimAPI.getAllClaims();
        setClaims(res.data);
      }
      if (activeTab==='premium') {
        const [polRes, payRes] = await Promise.all([policyAPI.getMyPolicies(currentUser.userId), paymentAPI.getMyPayments(currentUser.userId)]);
        setPolicies(polRes.data); setPayments(payRes.data);
      }
      if (activeTab==='customers') {
        const res = await userAPI.getAllUsers(); setAllUsers(res.data);
      }
      if (activeTab==='dashboard' && role==='admin') {
        const [polRes, clmRes, usrRes] = await Promise.all([policyAPI.getAllPolicies(), claimAPI.getAllClaims(), userAPI.getAllUsers()]);
        setPolicies(polRes.data); setClaims(clmRes.data); setAllUsers(usrRes.data);
      }
    } catch(e) { console.error(e); } finally { setLoading(false); }
  }, [activeTab, currentUser]);

  useEffect(() => { if (isAuthenticated) fetchData(); }, [activeTab, isAuthenticated, fetchData]);

  const handleLogin = async (e) => {
    e.preventDefault(); setAuthError(''); setAuthLoading(true);
    try {
      const res = await authAPI.login(formData.email, formData.password);
      const user = res.data;
      localStorage.setItem('insurai_token', user.token);
      localStorage.setItem('insurai_user', JSON.stringify(user));
      setCurrentUser(user); setUserRole(user.role.toLowerCase()); setIsAuthenticated(true);
      setFormData(f => ({ ...f, firstname: user.firstname||'', lastname: user.lastname||'' }));
    } catch(err) { setAuthError(err.response?.data?.message || 'Invalid email or password'); }
    finally { setAuthLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) { setAuthError('Passwords do not match'); return; }
    if (passwordStrength < 3) { setAuthError('Please use a stronger password'); return; }
    setAuthError(''); setAuthLoading(true);
    try {
      const res = await authAPI.register(formData.firstname, formData.lastname, formData.email, formData.password, formData.phone);
      const user = res.data;
      localStorage.setItem('insurai_token', user.token);
      localStorage.setItem('insurai_user', JSON.stringify(user));
      setCurrentUser(user); setUserRole(user.role.toLowerCase()); setIsAuthenticated(true);
    } catch(err) { setAuthError(err.response?.data?.message || 'Registration failed'); }
    finally { setAuthLoading(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('insurai_token'); localStorage.removeItem('insurai_user');
    setIsAuthenticated(false); setCurrentUser(null); setUserRole(''); setActiveTab('dashboard');
    setPolicies([]); setClaims([]); setPayments([]); setAllUsers([]);
    setFormData({ firstname:'', lastname:'', email:'', phone:'', password:'', confirmPassword:'' });
  };

  const handleUpdatePolicyStatus = async (id, status) => {
    try { await policyAPI.updatePolicyStatus(id, status); setPolicies(p => p.map(x => x.id===id ? {...x, status} : x)); }
    catch { alert('Failed to update'); }
  };

  const handleUpdateClaimStatus = async (id, status) => {
    try { await claimAPI.updateClaimStatus(id, status); setClaims(c => c.map(x => x.id===id ? {...x, status} : x)); }
    catch { alert('Failed to update'); }
  };

  const handleSubmitClaim = async (e) => {
    e.preventDefault();
    if (!claimForm.policyId) { alert('Select a policy'); return; }
    try {
      const res = await claimAPI.submitClaim(currentUser.userId, claimForm.policyId,
        { type: claimForm.type, amount: parseFloat(claimForm.amount), description: claimForm.description });
      setClaims(p => [res.data, ...p]);
      setClaimForm({ policyId:'', type:'MEDICAL', amount:'', description:'' });
      alert('Claim submitted successfully!');
    } catch { alert('Failed to submit claim'); }
  };

  const handleMakePayment = async (e) => {
    e.preventDefault();
    if (!paymentForm.policyId) { alert('Select a policy'); return; }
    const policy = policies.find(p => p.id === parseInt(paymentForm.policyId));
    try {
      const res = await paymentAPI.makePayment(currentUser.userId, paymentForm.policyId,
        { amount: policy?.premium, cardLast4: paymentForm.cardLast4 || '0000' });
      setPayments(p => [res.data, ...p]);
      setPaymentForm({ policyId:'', cardLast4:'' });
      alert('Payment successful!');
    } catch { alert('Payment failed'); }
  };

  const handleBuyPolicy = async (p) => {
    try {
      const res = await policyAPI.createPolicy(currentUser.userId, {
        type: p.type, name: p.name,
        coverage: parseFloat(p.coverage),
        premium: parseFloat(p.price)
      });
      alert(`${p.name} purchased!\nPolicy #${res.data.policyNumber}`);
      const updated = await policyAPI.getMyPolicies(currentUser.userId);
      setPolicies(updated.data);
      setSelectedPolicy(null);
      setActiveTab('policies');
    } catch(err) { console.error(err); alert('Failed to purchase policy'); }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      await userAPI.updateUser(currentUser.userId, { firstname: formData.firstname, lastname: formData.lastname, phone: formData.phone });
      const updated = { ...currentUser, firstname: formData.firstname, lastname: formData.lastname };
      localStorage.setItem('insurai_user', JSON.stringify(updated));
      setCurrentUser(updated); alert('Profile updated!');
    } catch { alert('Failed to update profile'); }
  };

  const checkPasswordStrength = (p) => {
    let s = 0;
    if (p.length >= 8) s++; if (/[a-z]/.test(p)) s++; if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++; if (/[!@#$%^&*]/.test(p)) s++;
    return s;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
    if (name === 'password') { setPasswordStrength(checkPasswordStrength(value)); setPasswordMatch(formData.confirmPassword ? value === formData.confirmPassword : null); }
    if (name === 'confirmPassword') setPasswordMatch(value === formData.password);
  };

  const getInitials = () => {
    const f = (formData.firstname||currentUser?.firstname||'')[0]?.toUpperCase() || '';
    const l = (formData.lastname||currentUser?.lastname||'')[0]?.toUpperCase() || '';
    return f || l ? `${f}${l}` : '?';
  };

  const strengthLabel = (() => {
    if (passwordStrength === 0) return { text:'Enter password', cls:'' };
    if (passwordStrength <= 2)  return { text:'Weak',   cls:'weak' };
    if (passwordStrength === 3) return { text:'Fair',   cls:'fair' };
    if (passwordStrength === 4) return { text:'Good',   cls:'good' };
    return { text:'Strong', cls:'strong' };
  })();

  const statusInfo = (status) => {
    const map = {
      ACTIVE:       { cls:'badge-green',  label:'Active'       },
      APPROVED:     { cls:'badge-green',  label:'Approved'     },
      PAID:         { cls:'badge-green',  label:'Paid'         },
      PENDING:      { cls:'badge-amber',  label:'Pending'      },
      UNDER_REVIEW: { cls:'badge-blue',   label:'Under Review' },
      REJECTED:     { cls:'badge-red',    label:'Rejected'     },
      EXPIRED:      { cls:'badge-slate',  label:'Expired'      },
      FAILED:       { cls:'badge-red',    label:'Failed'       },
    };
    return map[status] || { cls:'badge-slate', label: status };
  };

  const navItems = () => {
    const common = [{ id:'dashboard', icon:BarChart3, label:'Dashboard' }];
    if (userRole === 'customer') return [...common,
      { id:'policies',    icon:Shield,       label:'My Policies'   },
      { id:'buy-policy',  icon:Plus,         label:'Buy Policy'    },
      { id:'claims',      icon:AlertCircle,  label:'My Claims'     },
      { id:'premium',     icon:CreditCard,   label:'Pay Premium'   },
      { id:'ai-analysis', icon:Brain,        label:'AI Analysis'   },
      { id:'profile',     icon:Settings,     label:'Profile'       },
    ];
    if (userRole === 'advisor') return [...common,
      { id:'customers',   icon:Users,        label:'Customers'     },
      { id:'ai-analysis', icon:Brain,        label:'AI Analysis'   },
      { id:'reports',     icon:TrendingUp,   label:'Reports'       },
      { id:'profile',     icon:Settings,     label:'Profile'       },
    ];
    if (userRole === 'admin') return [...common,
      { id:'customers',   icon:Users,        label:'Users'         },
      { id:'policies',    icon:Shield,       label:'Policies'      },
      { id:'claims',      icon:AlertTriangle,label:'Claims'        },
      { id:'reports',     icon:TrendingUp,   label:'Reports'       },
      { id:'profile',     icon:Settings,     label:'Profile'       },
    ];
    return common;
  };

  // ══════════════════════════════════════════════════════════════════
  //  GLOBAL STYLES
  // ══════════════════════════════════════════════════════════════════
  const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --navy:    #050d1a;
      --navy2:   #0a1628;
      --navy3:   #0f1f3d;
      --navy4:   #162447;
      --blue:    #1a6ef5;
      --blue2:   #2979ff;
      --blue3:   #5b9bff;
      --blue4:   #bfd4ff;
      --accent:  #00d4ff;
      --green:   #00c48c;
      --amber:   #f59e0b;
      --red:     #f43f5e;
      --text1:   #f0f6ff;
      --text2:   #94a3b8;
      --text3:   #4a6080;
      --border:  rgba(26,110,245,0.15);
      --card:    rgba(10,22,40,0.8);
      --radius:  12px;
      font-family: 'DM Sans', sans-serif;
    }

    body { background: var(--navy); color: var(--text1); }

    /* ── TYPOGRAPHY ── */
    .mono { font-family: 'DM Mono', monospace; }
    .text-grad { background: linear-gradient(135deg, #fff 0%, var(--blue3) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .text-blue-grad { background: linear-gradient(135deg, var(--blue2) 0%, var(--accent) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

    /* ── CARDS ── */
    .card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); backdrop-filter: blur(12px); }
    .card-hover { transition: all 0.25s ease; }
    .card-hover:hover { border-color: rgba(26,110,245,0.4); box-shadow: 0 8px 32px rgba(26,110,245,0.15); transform: translateY(-2px); }

    /* ── BUTTONS ── */
    .btn-primary { background: linear-gradient(135deg, var(--blue) 0%, var(--blue2) 100%); color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
    .btn-primary:hover { background: linear-gradient(135deg, var(--blue2) 0%, #1560e8 100%); box-shadow: 0 4px 20px rgba(26,110,245,0.4); transform: translateY(-1px); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    .btn-ghost { background: transparent; border: 1px solid var(--border); color: var(--text2); border-radius: 8px; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
    .btn-ghost:hover { border-color: var(--blue3); color: var(--text1); background: rgba(26,110,245,0.08); }
    .btn-danger { background: rgba(244,63,94,0.15); border: 1px solid rgba(244,63,94,0.3); color: var(--red); border-radius: 8px; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
    .btn-danger:hover { background: rgba(244,63,94,0.25); }
    .btn-success { background: rgba(0,196,140,0.15); border: 1px solid rgba(0,196,140,0.3); color: var(--green); border-radius: 8px; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', sans-serif; }
    .btn-success:hover { background: rgba(0,196,140,0.25); }

    /* ── INPUTS ── */
    .inp { width: 100%; padding: 11px 14px; background: rgba(5,13,26,0.8); border: 1.5px solid var(--border); border-radius: 8px; color: var(--text1); font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none; transition: border-color 0.2s; }
    .inp:focus { border-color: var(--blue); }
    .inp::placeholder { color: var(--text3); }
    .inp option { background: var(--navy2); }
    select.inp { cursor: pointer; }

    /* ── BADGES ── */
    .badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; letter-spacing: 0.03em; }
    .badge-green  { background: rgba(0,196,140,0.12); color: var(--green); border: 1px solid rgba(0,196,140,0.25); }
    .badge-amber  { background: rgba(245,158,11,0.12); color: var(--amber); border: 1px solid rgba(245,158,11,0.25); }
    .badge-blue   { background: rgba(26,110,245,0.12); color: var(--blue3); border: 1px solid rgba(26,110,245,0.25); }
    .badge-red    { background: rgba(244,63,94,0.12); color: var(--red); border: 1px solid rgba(244,63,94,0.25); }
    .badge-slate  { background: rgba(100,120,150,0.12); color: var(--text2); border: 1px solid rgba(100,120,150,0.2); }

    /* ── NAV ── */
    .nav-link { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 8px; cursor: pointer; transition: all 0.2s; border: none; background: transparent; color: var(--text2); font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; width: 100%; text-align: left; }
    .nav-link:hover { background: rgba(26,110,245,0.08); color: var(--text1); }
    .nav-link.active { background: rgba(26,110,245,0.15); color: var(--blue3); border-left: 3px solid var(--blue2); }

    /* ── TABLE ── */
    .tbl { width: 100%; border-collapse: collapse; }
    .tbl th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text3); border-bottom: 1px solid var(--border); }
    .tbl td { padding: 14px 16px; border-bottom: 1px solid rgba(26,110,245,0.06); font-size: 13px; }
    .tbl tbody tr { transition: background 0.15s; }
    .tbl tbody tr:hover { background: rgba(26,110,245,0.04); }

    /* ── STRENGTH ── */
    .s-bar { height: 4px; flex: 1; background: var(--navy3); border-radius: 2px; transition: all 0.3s; }
    .s-bar.active.weak   { background: var(--red); }
    .s-bar.active.fair   { background: var(--amber); }
    .s-bar.active.good   { background: var(--green); }
    .s-bar.active.strong { background: #00ff88; }

    /* ── STAT CARD ── */
    .stat-num { font-size: 32px; font-weight: 800; letter-spacing: -1px; }

    /* ── POLICY CARD TAG ── */
    .policy-tag { position: absolute; top: -1px; right: 16px; padding: 2px 10px; border-radius: 0 0 6px 6px; font-size: 10px; font-weight: 700; letter-spacing: 0.04em; }

    /* ── SCROLLBAR ── */
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: var(--navy); }
    ::-webkit-scrollbar-thumb { background: var(--navy4); border-radius: 2px; }

    /* ── ANIMATIONS ── */
    @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
    @keyframes pulse-blue { 0%,100% { box-shadow: 0 0 0 0 rgba(26,110,245,0.4); } 50% { box-shadow: 0 0 0 8px rgba(26,110,245,0); } }
    .fade-up { animation: fadeUp 0.4s ease forwards; }

    /* ── SPINNER ── */
    @keyframes spin { to { transform: rotate(360deg); } }
    .spinner { width: 36px; height: 36px; border: 3px solid var(--navy3); border-top-color: var(--blue); border-radius: 50%; animation: spin 0.7s linear infinite; }

    /* ── TRUST BAR ── */
    .trust-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text2); }
    .trust-dot  { width: 6px; height: 6px; border-radius: 50%; background: var(--green); flex-shrink: 0; }

    /* ── HERO MESH ── */
    .mesh { position: fixed; inset: 0; pointer-events: none; z-index: 0; background: radial-gradient(ellipse 80% 60% at 20% 10%, rgba(26,110,245,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(0,212,255,0.05) 0%, transparent 60%); }
  `;

  // ══════════════════════════════════════════════════════════════════
  //  AUTH PAGE
  // ══════════════════════════════════════════════════════════════════
  if (!isAuthenticated) return (
    <div style={{ minHeight:'100vh', background:'var(--navy)', display:'flex', alignItems:'stretch' }}>
      <style>{CSS}</style>
      <div className="mesh"/>

      {/* LEFT PANEL */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'60px 80px', position:'relative', zIndex:1, borderRight:'1px solid var(--border)' }}>
        {/* Logo */}
        <div style={{ marginBottom:48 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:32 }}>
            <div style={{ width:40, height:40, background:'linear-gradient(135deg, var(--blue) 0%, var(--accent) 100%)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Shield size={22} color="#fff"/>
            </div>
            <span style={{ fontSize:22, fontWeight:800, letterSpacing:'-0.5px' }} className="text-grad">InsurAI</span>
          </div>

          <h1 style={{ fontSize:38, fontWeight:800, lineHeight:1.15, letterSpacing:'-1px', marginBottom:12 }}>
            India's Smartest<br/>
            <span className="text-blue-grad">Insurance Platform</span>
          </h1>
          <p style={{ color:'var(--text2)', fontSize:15, lineHeight:1.6 }}>
            Compare, buy and manage insurance policies with AI-powered insights. Trusted by 2 lakh+ customers.
          </p>
        </div>

        {/* Trust indicators */}
        <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:40 }}>
          {[
            '₹500 Cr+ claims settled successfully',
            'IRDAI registered & regulated',
            '5000+ network hospitals & garages',
            'Instant policy issuance in 2 minutes',
          ].map(t => (
            <div className="trust-item" key={t}>
              <div className="trust-dot"/>
              {t}
            </div>
          ))}
        </div>

        {/* Ratings row */}
        <div style={{ display:'flex', gap:24 }}>
          {[{ val:'4.8★', label:'App Rating' },{ val:'2L+', label:'Happy Customers' },{ val:'99%', label:'Claim Settlement' }].map(r => (
            <div key={r.label} style={{ textAlign:'center' }}>
              <div style={{ fontSize:20, fontWeight:800, color:'var(--blue3)' }}>{r.val}</div>
              <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>{r.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL - AUTH FORM */}
      <div style={{ width:460, display:'flex', flexDirection:'column', justifyContent:'center', padding:'48px 40px', position:'relative', zIndex:1 }}>
        <div className="card" style={{ padding:32 }}>
          {/* Tabs */}
          <div style={{ display:'flex', gap:4, marginBottom:28, background:'var(--navy)', borderRadius:8, padding:4 }}>
            {['login','register'].map(v => (
              <button key={v} onClick={() => { setAuthView(v); setAuthError(''); }}
                style={{ flex:1, padding:'9px 0', border:'none', borderRadius:6, fontWeight:600, fontSize:14, cursor:'pointer', transition:'all 0.2s',
                  background: authView===v ? 'var(--blue)' : 'transparent',
                  color: authView===v ? '#fff' : 'var(--text2)',
                  fontFamily:'DM Sans, sans-serif' }}>
                {v === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {authError && (
            <div style={{ background:'rgba(244,63,94,0.1)', border:'1px solid rgba(244,63,94,0.25)', borderRadius:8, padding:'10px 14px', marginBottom:20, color:'var(--red)', fontSize:13, textAlign:'center' }}>
              {authError}
            </div>
          )}

          {/* LOGIN */}
          {authView === 'login' && (
            <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text2)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Email Address</label>
                <input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="you@example.com" className="inp" required/>
              </div>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text2)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Password</label>
                <input name="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" className="inp" required/>
              </div>
              <button type="submit" disabled={authLoading} className="btn-primary" style={{ padding:'13px', fontSize:15, marginTop:4 }}>
                {authLoading ? 'Signing in…' : 'Sign In →'}
              </button>
              <div style={{ textAlign:'center', fontSize:12, color:'var(--text3)', borderTop:'1px solid var(--border)', paddingTop:12 }}>
                Demo: admin@insurai.com · advisor@insurai.com · customer@insurai.com<br/>Password: <strong style={{color:'var(--text2)'}}>password</strong>
              </div>
            </form>
          )}

          {/* REGISTER */}
          {authView === 'register' && (
            <form onSubmit={handleRegister} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text2)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>First Name</label>
                  <input name="firstname" type="text" value={formData.firstname} onChange={handleInputChange} placeholder="John" className="inp" required/>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text2)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Last Name</label>
                  <input name="lastname" type="text" value={formData.lastname} onChange={handleInputChange} placeholder="Doe" className="inp" required/>
                </div>
              </div>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text2)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Email</label>
                <input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="you@example.com" className="inp" required/>
              </div>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text2)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Phone</label>
                <input name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="9876543210" className="inp" required/>
              </div>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text2)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Password</label>
                <input name="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="Min. 8 characters" className="inp" required/>
                {formData.password && (
                  <div style={{ marginTop:8 }}>
                    <div style={{ display:'flex', gap:4, marginBottom:4 }}>
                      {[...Array(5)].map((_,i) => <div key={i} className={`s-bar ${i < passwordStrength ? `active ${strengthLabel.cls}` : ''}`}/>)}
                    </div>
                    <span style={{ fontSize:11, fontWeight:600, color: strengthLabel.cls==='weak'?'var(--red)': strengthLabel.cls==='good'||strengthLabel.cls==='strong'?'var(--green)':'var(--amber)' }}>{strengthLabel.text}</span>
                  </div>
                )}
              </div>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text2)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Confirm Password</label>
                <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} placeholder="Repeat password" className="inp" required/>
                {formData.confirmPassword && (
                  <span style={{ fontSize:11, fontWeight:600, marginTop:4, display:'block', color: passwordMatch ? 'var(--green)' : 'var(--red)' }}>
                    {passwordMatch ? '✓ Passwords match' : '✕ Do not match'}
                  </span>
                )}
              </div>
              <button type="submit" disabled={authLoading} className="btn-primary" style={{ padding:'13px', fontSize:15, marginTop:4 }}>
                {authLoading ? 'Creating account…' : 'Create Account →'}
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign:'center', fontSize:11, color:'var(--text3)', marginTop:16 }}>
          By continuing, you agree to our Terms of Service & Privacy Policy
        </p>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════
  //  DASHBOARD
  // ══════════════════════════════════════════════════════════════════
  const nav = navItems();

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background:'var(--navy)' }}>
      <style>{CSS}</style>
      <div className="mesh"/>

      {/* ── TOP NAV ── */}
      <header style={{ position:'sticky', top:0, zIndex:50, background:'rgba(5,13,26,0.95)', borderBottom:'1px solid var(--border)', backdropFilter:'blur(12px)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px', height:60 }}>
          {/* Left */}
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="btn-ghost" style={{ padding:'6px 8px', display:'flex' }}>
              {sidebarOpen ? <X size={18}/> : <Menu size={18}/>}
            </button>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:32, height:32, background:'linear-gradient(135deg, var(--blue) 0%, var(--accent) 100%)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Shield size={16} color="#fff"/>
              </div>
              <span style={{ fontSize:18, fontWeight:800, letterSpacing:'-0.5px' }} className="text-grad">InsurAI</span>
            </div>
            <div style={{ width:1, height:24, background:'var(--border)' }}/>
            <span style={{ fontSize:12, color:'var(--text3)', fontFamily:'DM Mono, monospace', textTransform:'uppercase', letterSpacing:'0.08em' }}>{userRole} Portal</span>
          </div>

          {/* Right */}
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ position:'relative', display:'flex', alignItems:'center' }}>
              <Search size={14} style={{ position:'absolute', left:10, color:'var(--text3)' }}/>
              <input placeholder="Search…" style={{ paddingLeft:32, paddingRight:12, paddingTop:7, paddingBottom:7, background:'var(--navy2)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text1)', fontSize:13, outline:'none', width:200, fontFamily:'DM Sans, sans-serif' }}/>
            </div>

            <button className="btn-ghost" style={{ padding:'7px', position:'relative', display:'flex' }} onClick={() => setNotifOpen(!notifOpen)}>
              <Bell size={16}/>
              <span style={{ position:'absolute', top:4, right:4, width:6, height:6, background:'var(--red)', borderRadius:'50%' }}/>
            </button>

            {/* Profile dropdown */}
            <div style={{ position:'relative' }}>
              <button onClick={() => setProfileOpen(!profileOpen)} style={{ display:'flex', alignItems:'center', gap:8, background:'var(--navy2)', border:'1px solid var(--border)', borderRadius:8, padding:'6px 10px', cursor:'pointer', transition:'all 0.2s' }}>
                <div style={{ width:28, height:28, background:'linear-gradient(135deg, var(--blue) 0%, var(--accent) 100%)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff' }}>
                  {getInitials()}
                </div>
                <span style={{ fontSize:13, fontWeight:600, color:'var(--text1)' }}>{currentUser?.firstname}</span>
                <ChevronDown size={12} style={{ color:'var(--text3)' }}/>
              </button>
              {profileOpen && (
                <div className="card" style={{ position:'absolute', right:0, top:'calc(100% + 8px)', width:180, padding:8, zIndex:100 }}>
                  <button onClick={() => { setActiveTab('profile'); setProfileOpen(false); }} className="nav-link" style={{ fontSize:13 }}>
                    <Settings size={14}/> Profile
                  </button>
                  <button onClick={handleLogout} className="nav-link" style={{ fontSize:13, color:'var(--red)' }}>
                    <LogOut size={14}/> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div style={{ display:'flex', flex:1, position:'relative', zIndex:1 }}>
        {/* ── SIDEBAR ── */}
        <aside style={{ width: sidebarOpen ? 220 : 0, flexShrink:0, overflow:'hidden', transition:'width 0.25s ease', borderRight:'1px solid var(--border)', background:'rgba(5,13,26,0.6)', backdropFilter:'blur(8px)' }}>
          <nav style={{ padding:'16px 10px', display:'flex', flexDirection:'column', gap:2 }}>
            {nav.map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`nav-link ${activeTab===item.id ? 'active' : ''}`}>
                <item.icon size={16} style={{ flexShrink:0 }}/>
                {item.label}
                {activeTab===item.id && <ChevronRight size={12} style={{ marginLeft:'auto' }}/>}
              </button>
            ))}
          </nav>

          {/* Sidebar footer */}
          <div style={{ padding:'12px 10px', borderTop:'1px solid var(--border)', marginTop:'auto' }}>
            <div style={{ padding:'10px 12px', background:'rgba(26,110,245,0.08)', borderRadius:8, border:'1px solid rgba(26,110,245,0.15)' }}>
              <div style={{ fontSize:11, color:'var(--blue3)', fontWeight:600, marginBottom:4 }}>Need Help?</div>
              <div style={{ fontSize:11, color:'var(--text3)', display:'flex', alignItems:'center', gap:4 }}>
                <Phone size={10}/> 1800-XXX-XXXX
              </div>
            </div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main style={{ flex:1, padding:28, overflow:'auto', minWidth:0 }}>
          {loading && (
            <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:200 }}>
              <div className="spinner"/>
            </div>
          )}

          {/* ══ DASHBOARD ══ */}
          {!loading && activeTab === 'dashboard' && (
            <div className="fade-up" style={{ display:'flex', flexDirection:'column', gap:24 }}>
              <div>
                <h2 style={{ fontSize:24, fontWeight:800, letterSpacing:'-0.5px', marginBottom:4 }}>
                  Good day, {currentUser?.firstname}! 👋
                </h2>
                <p style={{ color:'var(--text2)', fontSize:14 }}>Here's your insurance portfolio overview</p>
              </div>

              {/* Stats */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
                {userRole === 'customer' && [
                  { label:'Active Policies', val: policies.filter(p=>p.status==='ACTIVE').length, icon:Shield, color:'var(--blue)' },
                  { label:'Total Policies',  val: policies.length, icon:FileCheck, color:'var(--accent)' },
                  { label:'Claims Filed',    val: claims.length, icon:AlertCircle, color:'var(--amber)' },
                  { label:'Pending Claims',  val: claims.filter(c=>c.status==='PENDING').length, icon:AlertTriangle, color:'var(--red)' },
                ].map(s => (
                  <div key={s.label} className="card" style={{ padding:20 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                      <div style={{ width:36, height:36, background:`${s.color}18`, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <s.icon size={18} style={{ color:s.color }}/>
                      </div>
                    </div>
                    <div className="stat-num">{s.val}</div>
                    <div style={{ fontSize:12, color:'var(--text2)', marginTop:4, fontWeight:500 }}>{s.label}</div>
                  </div>
                ))}
                {userRole === 'admin' && [
                  { label:'Total Users',       val: allUsers.length, icon:Users, color:'var(--blue)' },
                  { label:'All Policies',      val: policies.length, icon:Shield, color:'var(--accent)' },
                  { label:'Pending Policies',  val: policies.filter(p=>p.status==='PENDING').length, icon:AlertCircle, color:'var(--amber)' },
                  { label:'Pending Claims',    val: claims.filter(c=>c.status==='PENDING').length, icon:AlertTriangle, color:'var(--red)' },
                ].map(s => (
                  <div key={s.label} className="card" style={{ padding:20 }}>
                    <div style={{ width:36, height:36, background:`${s.color}18`, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12 }}>
                      <s.icon size={18} style={{ color:s.color }}/>
                    </div>
                    <div className="stat-num">{s.val}</div>
                    <div style={{ fontSize:12, color:'var(--text2)', marginTop:4, fontWeight:500 }}>{s.label}</div>
                  </div>
                ))}
                {userRole === 'advisor' && (
                  <div className="card" style={{ padding:20, gridColumn:'span 4' }}>
                    <p style={{ color:'var(--text2)', textAlign:'center', padding:20 }}>Advisor dashboard — connect commission & customer data to see live stats</p>
                  </div>
                )}
              </div>

              {/* Quick actions for customer */}
              {userRole === 'customer' && (
                <div className="card" style={{ padding:20 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'var(--text2)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:16 }}>Quick Actions</div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
                    {[
                      { label:'Buy Policy',    tab:'buy-policy', icon:Plus,        color:'var(--blue)' },
                      { label:'File Claim',    tab:'claims',     icon:AlertCircle, color:'var(--amber)' },
                      { label:'Pay Premium',   tab:'premium',    icon:CreditCard,  color:'var(--green)' },
                      { label:'View Policies', tab:'policies',   icon:Shield,      color:'var(--accent)' },
                    ].map(a => (
                      <button key={a.label} onClick={() => setActiveTab(a.tab)} className="card card-hover"
                        style={{ padding:'16px 12px', display:'flex', flexDirection:'column', alignItems:'center', gap:8, border:'none', cursor:'pointer', textAlign:'center', background:'var(--navy2)' }}>
                        <div style={{ width:40, height:40, background:`${a.color}18`, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <a.icon size={20} style={{ color:a.color }}/>
                        </div>
                        <span style={{ fontSize:13, fontWeight:600, color:'var(--text1)' }}>{a.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent policies */}
              {policies.length > 0 && (
                <div className="card" style={{ overflow:'hidden' }}>
                  <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontWeight:700, fontSize:15 }}>Recent Policies</span>
                    <button onClick={() => setActiveTab('policies')} style={{ fontSize:12, color:'var(--blue3)', background:'none', border:'none', cursor:'pointer', fontWeight:600 }}>View All →</button>
                  </div>
                  <table className="tbl">
                    <thead><tr><th>Policy #</th><th>Name</th><th>Type</th><th>Premium</th><th>Status</th></tr></thead>
                    <tbody>
                      {policies.slice(0,4).map(p => {
                        const si = statusInfo(p.status);
                        return (
                          <tr key={p.id}>
                            <td><span className="mono" style={{ fontSize:12, color:'var(--blue3)' }}>{p.policyNumber}</span></td>
                            <td style={{ fontWeight:600 }}>{p.name}</td>
                            <td style={{ color:'var(--text2)' }}>{p.type}</td>
                            <td style={{ color:'var(--green)', fontWeight:600 }}>${Number(p.premium).toLocaleString()}/mo</td>
                            <td><span className={`badge ${si.cls}`}>{si.label}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ══ MY POLICIES ══ */}
          {!loading && activeTab === 'policies' && userRole === 'customer' && (
            <div className="fade-up" style={{ display:'flex', flexDirection:'column', gap:20 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <h2 style={{ fontSize:22, fontWeight:800, marginBottom:4 }}>My Policies</h2>
                  <p style={{ color:'var(--text2)', fontSize:13 }}>{policies.length} {policies.length===1?'policy':'policies'} in your portfolio</p>
                </div>
                <button onClick={() => setActiveTab('buy-policy')} className="btn-primary" style={{ padding:'10px 18px', display:'flex', alignItems:'center', gap:6, fontSize:13 }}>
                  <Plus size={14}/> Buy New Policy
                </button>
              </div>
              <div className="card" style={{ overflow:'hidden' }}>
                <table className="tbl">
                  <thead><tr><th>Policy Number</th><th>Plan Name</th><th>Type</th><th>Coverage</th><th>Premium</th><th>Expiry</th><th>Status</th></tr></thead>
                  <tbody>
                    {policies.length === 0
                      ? <tr><td colSpan={7} style={{ textAlign:'center', padding:40, color:'var(--text3)' }}>No policies yet. <button onClick={() => setActiveTab('buy-policy')} style={{ color:'var(--blue3)', background:'none', border:'none', cursor:'pointer', fontWeight:600 }}>Buy your first policy →</button></td></tr>
                      : policies.map(p => {
                          const si = statusInfo(p.status);
                          return (
                            <tr key={p.id}>
                              <td><span className="mono" style={{ fontSize:12, color:'var(--blue3)' }}>{p.policyNumber}</span></td>
                              <td style={{ fontWeight:600 }}>{p.name}</td>
                              <td><span className="badge badge-blue">{p.type}</span></td>
                              <td style={{ fontWeight:600 }}>${Number(p.coverage).toLocaleString()}</td>
                              <td style={{ color:'var(--green)', fontWeight:600 }}>${Number(p.premium).toLocaleString()}/mo</td>
                              <td style={{ color:'var(--text2)', fontSize:12 }}>{p.expiryDate || '—'}</td>
                              <td><span className={`badge ${si.cls}`}>{si.label}</span></td>
                            </tr>
                          );
                        })
                    }
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ BUY POLICY ══ */}
          {!loading && activeTab === 'buy-policy' && userRole === 'customer' && !selectedPolicy && (
            <div className="fade-up" style={{ display:'flex', flexDirection:'column', gap:20 }}>
              <div>
                <h2 style={{ fontSize:22, fontWeight:800, marginBottom:4 }}>Choose Your Plan</h2>
                <p style={{ color:'var(--text2)', fontSize:13 }}>Compare and select the best insurance plan for your needs</p>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:18 }}>
                {POLICY_CATALOGUE.map(p => (
                  <div key={p.type} className="card card-hover" style={{ padding:22, position:'relative', cursor:'pointer' }} onClick={() => setSelectedPolicy(p)}>
                    {p.tag && (
                      <div className="policy-tag" style={{ background:`${p.tagColor}20`, color:p.tagColor, border:`1px solid ${p.tagColor}40` }}>
                        {p.tag}
                      </div>
                    )}
                    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                      <div style={{ width:44, height:44, background:'rgba(26,110,245,0.12)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <p.icon size={22} style={{ color:'var(--blue3)' }}/>
                      </div>
                      <div>
                        <div style={{ fontWeight:700, fontSize:15 }}>{p.name}</div>
                        <div style={{ fontSize:11, color:'var(--text3)', marginTop:1 }}>{p.type} Insurance</div>
                      </div>
                    </div>
                    <p style={{ fontSize:12, color:'var(--text2)', marginBottom:14, lineHeight:1.5 }}>{p.desc}</p>
                    <div style={{ marginBottom:16 }}>
                      {p.features.map(f => (
                        <div key={f} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:5 }}>
                          <CheckCircle2 size={12} style={{ color:'var(--green)', flexShrink:0 }}/>
                          <span style={{ fontSize:11, color:'var(--text2)' }}>{f}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ borderTop:'1px solid var(--border)', paddingTop:14, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <div>
                        <div style={{ fontSize:11, color:'var(--text3)' }}>Starting from</div>
                        <div style={{ fontSize:20, fontWeight:800, color:'var(--blue3)' }}>${p.price}<span style={{ fontSize:11, fontWeight:400, color:'var(--text3)' }}>/mo</span></div>
                      </div>
                      <div style={{ fontSize:11, color:'var(--text2)' }}>Cover: ${Number(p.coverage).toLocaleString()}</div>
                    </div>
                    <button className="btn-primary" style={{ width:'100%', marginTop:14, padding:'10px', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                      Get Quote <ArrowRight size={13}/>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BUY POLICY - DETAIL */}
          {!loading && activeTab === 'buy-policy' && userRole === 'customer' && selectedPolicy && (
            <div className="fade-up" style={{ maxWidth:600 }}>
              <button onClick={() => setSelectedPolicy(null)} className="btn-ghost" style={{ padding:'7px 12px', fontSize:13, marginBottom:20, display:'flex', alignItems:'center', gap:6 }}>
                ← Back to Plans
              </button>
              <div className="card" style={{ padding:28 }}>
                <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:24, paddingBottom:20, borderBottom:'1px solid var(--border)' }}>
                  <div style={{ width:52, height:52, background:'rgba(26,110,245,0.12)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <selectedPolicy.icon size={26} style={{ color:'var(--blue3)' }}/>
                  </div>
                  <div>
                    <h3 style={{ fontSize:20, fontWeight:800 }}>{selectedPolicy.name}</h3>
                    <p style={{ color:'var(--text2)', fontSize:13 }}>{selectedPolicy.desc}</p>
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24 }}>
                  <div style={{ background:'var(--navy2)', borderRadius:8, padding:16 }}>
                    <div style={{ fontSize:11, color:'var(--text3)', marginBottom:4 }}>Monthly Premium</div>
                    <div style={{ fontSize:24, fontWeight:800, color:'var(--blue3)' }}>${selectedPolicy.price}</div>
                  </div>
                  <div style={{ background:'var(--navy2)', borderRadius:8, padding:16 }}>
                    <div style={{ fontSize:11, color:'var(--text3)', marginBottom:4 }}>Sum Insured</div>
                    <div style={{ fontSize:24, fontWeight:800, color:'var(--green)' }}>${Number(selectedPolicy.coverage).toLocaleString()}</div>
                  </div>
                </div>
                <div style={{ marginBottom:24 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:'var(--text2)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>What's Covered</div>
                  {selectedPolicy.features.map(f => (
                    <div key={f} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                      <CheckCircle2 size={14} style={{ color:'var(--green)', flexShrink:0 }}/>
                      <span style={{ fontSize:13, color:'var(--text1)' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <div style={{ background:'rgba(26,110,245,0.06)', border:'1px solid rgba(26,110,245,0.15)', borderRadius:8, padding:14, marginBottom:20, fontSize:12, color:'var(--text2)' }}>
                  <strong style={{ color:'var(--text1)' }}>Note:</strong> Policy will be active after admin approval (usually within 24 hours). Premium will be charged monthly.
                </div>
                <button onClick={() => handleBuyPolicy(selectedPolicy)} className="btn-primary" style={{ width:'100%', padding:'14px', fontSize:15, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                  <Shield size={16}/> Confirm Purchase — ${selectedPolicy.price}/mo
                </button>
              </div>
            </div>
          )}

          {/* ══ CLAIMS ══ */}
          {!loading && activeTab === 'claims' && userRole === 'customer' && (
            <div className="fade-up" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, alignItems:'start' }}>
              <div className="card" style={{ padding:24 }}>
                <h3 style={{ fontSize:17, fontWeight:700, marginBottom:20 }}>File New Claim</h3>
                <form onSubmit={handleSubmitClaim} style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text2)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Policy</label>
                    <select className="inp" value={claimForm.policyId} onChange={e => setClaimForm(f=>({...f,policyId:e.target.value}))} required>
                      <option value="">Select policy…</option>
                      {policies.map(p => <option key={p.id} value={p.id}>{p.policyNumber} — {p.type}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text2)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Claim Type</label>
                    <select className="inp" value={claimForm.type} onChange={e => setClaimForm(f=>({...f,type:e.target.value}))}>
                      {['MEDICAL','ACCIDENT','PROPERTY_DAMAGE','THEFT','OTHER'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text2)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Amount (USD)</label>
                    <input type="number" className="inp" placeholder="0.00" value={claimForm.amount} onChange={e => setClaimForm(f=>({...f,amount:e.target.value}))} required/>
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text2)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Description</label>
                    <textarea rows={4} className="inp" style={{ resize:'none' }} placeholder="Describe what happened…" value={claimForm.description} onChange={e => setClaimForm(f=>({...f,description:e.target.value}))}/>
                  </div>
                  <button type="submit" className="btn-primary" style={{ padding:'12px', fontSize:14 }}>Submit Claim →</button>
                </form>
              </div>
              <div className="card" style={{ padding:24 }}>
                <h3 style={{ fontSize:17, fontWeight:700, marginBottom:16 }}>My Claims <span style={{ fontSize:12, color:'var(--text3)', fontWeight:400 }}>({claims.length})</span></h3>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {claims.length === 0
                    ? <p style={{ color:'var(--text3)', textAlign:'center', padding:32, fontSize:13 }}>No claims filed yet</p>
                    : claims.map(c => {
                        const si = statusInfo(c.status);
                        return (
                          <div key={c.id} className="card" style={{ padding:14, background:'var(--navy2)' }}>
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
                              <span className="mono" style={{ fontSize:11, color:'var(--blue3)' }}>{c.claimNumber}</span>
                              <span className={`badge ${si.cls}`}>{si.label}</span>
                            </div>
                            <div style={{ fontWeight:600, marginBottom:2 }}>{c.type}</div>
                            <div style={{ color:'var(--green)', fontWeight:700, fontSize:17 }}>${Number(c.amount).toLocaleString()}</div>
                            {c.description && <div style={{ fontSize:11, color:'var(--text3)', marginTop:4, lineHeight:1.4 }}>{c.description}</div>}
                          </div>
                        );
                      })
                  }
                </div>
              </div>
            </div>
          )}

          {/* ══ PAY PREMIUM ══ */}
          {!loading && activeTab === 'premium' && userRole === 'customer' && (
            <div className="fade-up" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, alignItems:'start' }}>
              <div className="card" style={{ padding:24 }}>
                <h3 style={{ fontSize:17, fontWeight:700, marginBottom:6 }}>Pay Premium</h3>
                <p style={{ fontSize:12, color:'var(--text2)', marginBottom:20 }}>Keep your policy active by paying your monthly premium</p>
                <form onSubmit={handleMakePayment} style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text2)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Select Policy</label>
                    <select className="inp" value={paymentForm.policyId} onChange={e => setPaymentForm(f=>({...f,policyId:e.target.value}))} required>
                      <option value="">Choose policy…</option>
                      {policies.filter(p=>p.status==='ACTIVE').map(p => <option key={p.id} value={p.id}>{p.policyNumber} — ${p.premium}/mo</option>)}
                    </select>
                  </div>
                  {paymentForm.policyId && (
                    <div style={{ background:'rgba(0,196,140,0.08)', border:'1px solid rgba(0,196,140,0.2)', borderRadius:8, padding:14 }}>
                      <div style={{ display:'flex', justifyContent:'space-between' }}>
                        <span style={{ fontSize:13, color:'var(--text2)' }}>Amount Due</span>
                        <span style={{ fontSize:22, fontWeight:800, color:'var(--green)' }}>${policies.find(p=>p.id===parseInt(paymentForm.policyId))?.premium || 0}</span>
                      </div>
                    </div>
                  )}
                  <div>
                    <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text2)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Card Number</label>
                    <div style={{ position:'relative' }}>
                      <CreditCard size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text3)' }}/>
                      <input type="text" className="inp" style={{ paddingLeft:36 }} placeholder="**** **** **** 1234" onChange={e => setPaymentForm(f=>({...f,cardLast4:e.target.value.slice(-4)}))}/>
                    </div>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    <div>
                      <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text2)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Expiry</label>
                      <input type="text" className="inp" placeholder="MM/YY"/>
                    </div>
                    <div>
                      <label style={{ display:'block', fontSize:12, fontWeight:600, color:'var(--text2)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>CVV</label>
                      <input type="text" className="inp" placeholder="•••"/>
                    </div>
                  </div>
                  <div style={{ background:'rgba(26,110,245,0.06)', border:'1px solid rgba(26,110,245,0.12)', borderRadius:8, padding:10, display:'flex', alignItems:'center', gap:6, fontSize:11, color:'var(--text2)' }}>
                    <Shield size={12} style={{ color:'var(--blue3)', flexShrink:0 }}/> 256-bit SSL secured payment. Your card details are never stored.
                  </div>
                  <button type="submit" className="btn-primary" style={{ padding:'13px', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                    <CreditCard size={14}/> Pay Now
                  </button>
                </form>
              </div>
              <div className="card" style={{ padding:24 }}>
                <h3 style={{ fontSize:17, fontWeight:700, marginBottom:16 }}>Payment History</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {payments.length === 0
                    ? <p style={{ color:'var(--text3)', textAlign:'center', padding:32, fontSize:13 }}>No payments yet</p>
                    : payments.map(pay => {
                        const si = statusInfo(pay.status);
                        return (
                          <div key={pay.id} className="card" style={{ padding:14, background:'var(--navy2)' }}>
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                              <div>
                                <div style={{ fontWeight:600, fontSize:13 }}>Premium Payment</div>
                                <div style={{ fontSize:11, color:'var(--text3)', marginTop:2 }}>{pay.paymentDate}</div>
                              </div>
                              <div style={{ textAlign:'right' }}>
                                <div style={{ fontWeight:800, color:'var(--green)' }}>${Number(pay.amount).toLocaleString()}</div>
                                <span className={`badge ${si.cls}`} style={{ marginTop:4 }}>{si.label}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                  }
                </div>
              </div>
            </div>
          )}

          {/* ══ ADMIN: POLICIES ══ */}
          {!loading && activeTab === 'policies' && userRole === 'admin' && (
            <div className="fade-up" style={{ display:'flex', flexDirection:'column', gap:20 }}>
              <h2 style={{ fontSize:22, fontWeight:800 }}>Policy Approvals</h2>
              <div className="card" style={{ overflow:'hidden' }}>
                <table className="tbl">
                  <thead><tr><th>Policy #</th><th>Customer</th><th>Type</th><th>Coverage</th><th>Premium</th><th>Status</th><th>Action</th></tr></thead>
                  <tbody>
                    {policies.length === 0
                      ? <tr><td colSpan={7} style={{ textAlign:'center', padding:40, color:'var(--text3)' }}>No policies found</td></tr>
                      : policies.map(p => {
                          const si = statusInfo(p.status);
                          return (
                            <tr key={p.id}>
                              <td><span className="mono" style={{ fontSize:11, color:'var(--blue3)' }}>{p.policyNumber}</span></td>
                              <td style={{ fontWeight:600 }}>{p.user?.firstname} {p.user?.lastname}</td>
                              <td><span className="badge badge-blue">{p.type}</span></td>
                              <td>${Number(p.coverage).toLocaleString()}</td>
                              <td style={{ color:'var(--green)', fontWeight:600 }}>${Number(p.premium).toLocaleString()}/mo</td>
                              <td><span className={`badge ${si.cls}`}>{si.label}</span></td>
                              <td>
                                <div style={{ display:'flex', gap:6 }}>
                                  <button onClick={() => handleUpdatePolicyStatus(p.id,'ACTIVE')} className="btn-success" style={{ padding:'5px 10px', fontSize:11, fontWeight:600 }}>Approve</button>
                                  <button onClick={() => handleUpdatePolicyStatus(p.id,'REJECTED')} className="btn-danger" style={{ padding:'5px 10px', fontSize:11, fontWeight:600 }}>Reject</button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                    }
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ ADMIN: CLAIMS ══ */}
          {!loading && activeTab === 'claims' && userRole === 'admin' && (
            <div className="fade-up" style={{ display:'flex', flexDirection:'column', gap:20 }}>
              <h2 style={{ fontSize:22, fontWeight:800 }}>Claims Review</h2>
              <div className="card" style={{ overflow:'hidden' }}>
                <table className="tbl">
                  <thead><tr><th>Claim #</th><th>Customer</th><th>Type</th><th>Amount</th><th>Description</th><th>Status</th><th>Action</th></tr></thead>
                  <tbody>
                    {claims.length === 0
                      ? <tr><td colSpan={7} style={{ textAlign:'center', padding:40, color:'var(--text3)' }}>No claims found</td></tr>
                      : claims.map(c => {
                          const si = statusInfo(c.status);
                          return (
                            <tr key={c.id}>
                              <td><span className="mono" style={{ fontSize:11, color:'var(--blue3)' }}>{c.claimNumber}</span></td>
                              <td style={{ fontWeight:600 }}>{c.user?.firstname} {c.user?.lastname}</td>
                              <td>{c.type}</td>
                              <td style={{ color:'var(--green)', fontWeight:600 }}>${Number(c.amount).toLocaleString()}</td>
                              <td style={{ color:'var(--text2)', fontSize:12, maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.description||'—'}</td>
                              <td><span className={`badge ${si.cls}`}>{si.label}</span></td>
                              <td>
                                <div style={{ display:'flex', gap:6 }}>
                                  <button onClick={() => handleUpdateClaimStatus(c.id,'APPROVED')} className="btn-success" style={{ padding:'5px 10px', fontSize:11, fontWeight:600 }}>Approve</button>
                                  <button onClick={() => handleUpdateClaimStatus(c.id,'REJECTED')} className="btn-danger" style={{ padding:'5px 10px', fontSize:11, fontWeight:600 }}>Reject</button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                    }
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ CUSTOMERS ══ */}
          {!loading && activeTab === 'customers' && (userRole==='admin'||userRole==='advisor') && (
            <div className="fade-up" style={{ display:'flex', flexDirection:'column', gap:20 }}>
              <h2 style={{ fontSize:22, fontWeight:800 }}>{userRole==='admin' ? 'User Management' : 'Customers'}</h2>
              <div className="card" style={{ overflow:'hidden' }}>
                <table className="tbl">
                  <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th>{userRole==='admin'&&<th>Actions</th>}</tr></thead>
                  <tbody>
                    {allUsers.length === 0
                      ? <tr><td colSpan={5} style={{ textAlign:'center', padding:40, color:'var(--text3)' }}>No users found</td></tr>
                      : allUsers.map(u => (
                          <tr key={u.id}>
                            <td style={{ fontWeight:600 }}>{u.firstname} {u.lastname}</td>
                            <td style={{ color:'var(--text2)', fontSize:12 }}>{u.email}</td>
                            <td style={{ color:'var(--text2)', fontSize:12 }}>{u.phone||'—'}</td>
                            <td><span className="badge badge-blue">{u.role}</span></td>
                            {userRole==='admin' && (
                              <td>
                                <button onClick={async () => {
                                  if (confirm('Delete this user?')) {
                                    try { await userAPI.deleteUser(u.id); setAllUsers(p=>p.filter(x=>x.id!==u.id)); }
                                    catch { alert('Failed'); }
                                  }
                                }} className="btn-danger" style={{ padding:'5px 10px', fontSize:11, fontWeight:600, display:'flex', alignItems:'center', gap:4 }}>
                                  <Trash2 size={11}/> Delete
                                </button>
                              </td>
                            )}
                          </tr>
                        ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ AI ANALYSIS ══ */}
          {!loading && activeTab === 'ai-analysis' && (
            <AIAnalysisTab policies={policies} claims={claims} currentUser={currentUser}/>
          )}

          {/* ══ REPORTS ══ */}
          {!loading && activeTab === 'reports' && (
            <div className="fade-up" style={{ display:'flex', flexDirection:'column', gap:20 }}>
              <h2 style={{ fontSize:22, fontWeight:800 }}>Reports & Analytics</h2>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:16 }}>
                {[
                  { title:'Policy Report',  desc:'Portfolio overview & status breakdown',  icon:Shield,       color:'var(--blue)' },
                  { title:'Claims Report',  desc:'Claims analysis & settlement trends',     icon:AlertCircle,  color:'var(--amber)' },
                  { title:'Revenue Report', desc:'Premiums collected & financial summary',  icon:DollarSign,   color:'var(--green)' },
                  { title:'User Report',    desc:'Customer growth & activity insights',     icon:Users,        color:'#a78bfa' },
                ].map(r => (
                  <div key={r.title} className="card card-hover" style={{ padding:22, display:'flex', gap:16, cursor:'pointer' }}>
                    <div style={{ width:44, height:44, background:`${r.color}18`, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <r.icon size={20} style={{ color:r.color }}/>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, marginBottom:4 }}>{r.title}</div>
                      <div style={{ fontSize:12, color:'var(--text2)', marginBottom:14 }}>{r.desc}</div>
                      <button className="btn-ghost" style={{ padding:'6px 12px', fontSize:12, fontWeight:600, display:'flex', alignItems:'center', gap:4 }}>
                        <Download size={12}/> Generate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="card" style={{ padding:22, display:'flex', alignItems:'center', justifyContent:'center', height:200 }}>
                <div style={{ textAlign:'center' }}>
                  <BarChart3 size={36} style={{ color:'var(--blue3)', marginBottom:8 }}/>
                  <p style={{ color:'var(--text2)', fontSize:13 }}>Connect analytics engine for live charts</p>
                </div>
              </div>
            </div>
          )}

          {/* ══ PROFILE ══ */}
          {!loading && activeTab === 'profile' && (
            <div className="fade-up" style={{ maxWidth:700, display:'flex', flexDirection:'column', gap:20 }}>
              <h2 style={{ fontSize:22, fontWeight:800 }}>My Profile</h2>
              <div style={{ display:'grid', gridTemplateColumns:'200px 1fr', gap:20, alignItems:'start' }}>
                <div className="card" style={{ padding:24, textAlign:'center' }}>
                  <div style={{ width:72, height:72, background:'linear-gradient(135deg, var(--blue) 0%, var(--accent) 100%)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, fontWeight:800, color:'#fff', margin:'0 auto 14px' }}>
                    {getInitials()}
                  </div>
                  <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>{currentUser?.firstname} {currentUser?.lastname}</div>
                  <div style={{ fontSize:11, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:12 }}>{userRole}</div>
                  <div style={{ fontSize:11, color:'var(--text2)' }}>{formData.email}</div>
                </div>
                <div className="card" style={{ padding:24 }}>
                  <h3 style={{ fontSize:15, fontWeight:700, marginBottom:18 }}>Personal Information</h3>
                  <form onSubmit={handleSaveProfile} style={{ display:'flex', flexDirection:'column', gap:14 }}>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                      <div>
                        <label style={{ display:'block', fontSize:11, fontWeight:600, color:'var(--text2)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>First Name</label>
                        <input type="text" name="firstname" value={formData.firstname} onChange={handleInputChange} className="inp"/>
                      </div>
                      <div>
                        <label style={{ display:'block', fontSize:11, fontWeight:600, color:'var(--text2)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Last Name</label>
                        <input type="text" name="lastname" value={formData.lastname} onChange={handleInputChange} className="inp"/>
                      </div>
                    </div>
                    <div>
                      <label style={{ display:'block', fontSize:11, fontWeight:600, color:'var(--text2)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Email (read only)</label>
                      <input type="email" value={formData.email} disabled className="inp" style={{ opacity:0.5, cursor:'not-allowed' }}/>
                    </div>
                    <div>
                      <label style={{ display:'block', fontSize:11, fontWeight:600, color:'var(--text2)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' }}>Phone</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="inp"/>
                    </div>
                    <button type="submit" className="btn-primary" style={{ padding:'11px 20px', fontSize:13, alignSelf:'flex-start' }}>Save Changes</button>
                  </form>
                </div>
              </div>
              <div className="card" style={{ padding:22, border:'1px solid rgba(244,63,94,0.2)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14, color:'var(--red)' }}>
                  <AlertTriangle size={18}/>
                  <span style={{ fontWeight:700, fontSize:15 }}>Danger Zone</span>
                </div>
                <p style={{ fontSize:13, color:'var(--text2)', marginBottom:14 }}>Permanently delete your account and all associated data. This action cannot be undone.</p>
                <button onClick={async () => {
                  if (confirm('Are you sure? This cannot be undone.')) {
                    try { await userAPI.deleteUser(currentUser.userId); handleLogout(); }
                    catch { alert('Failed to delete account'); }
                  }
                }} className="btn-danger" style={{ padding:'9px 16px', fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:6 }}>
                  <Trash2 size={14}/> Delete My Account
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  REAL AI ANALYSIS TAB — powered by Claude API
// ══════════════════════════════════════════════════════════════════════════════
function AIAnalysisTab({ policies, claims, currentUser }) {
  const [mode,      setMode]      = useState('document'); // 'document' | 'risk' | 'chat'
  const [docText,   setDocText]   = useState('');
  const [question,  setQuestion]  = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [result,    setResult]    = useState(null);
  const [running,   setRunning]   = useState(false);
  const [error,     setError]     = useState('');

  const callClaude = async (messages, system) => {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system,
        messages,
      }),
    });
    const data = await res.json();
    return data.content?.map(b => b.text || '').join('') || '';
  };

  // ── Document Analysis ───────────────────────────────────────────────────────
  const analyzeDocument = async () => {
    if (!docText.trim()) { setError('Please paste a policy document first.'); return; }
    setRunning(true); setError(''); setResult(null);
    try {
      const raw = await callClaude(
        [{ role:'user', content:`Analyze this insurance policy document and respond ONLY with a valid JSON object, no markdown, no backticks:\n\n${docText}` }],
        `You are an expert insurance policy analyst for the Indian market. 
Analyze the given policy document and return ONLY a JSON object with this exact structure:
{
  "summary": "2-3 sentence overview",
  "riskScore": <number 0-100>,
  "riskLevel": "Low|Medium|High|Critical",
  "complianceScore": <number 0-100>,
  "coverageScore": <number 0-100>,
  "premiumFairness": "Fair|Overpriced|Underpriced",
  "keyFindings": ["finding1","finding2","finding3","finding4"],
  "redFlags": ["flag1","flag2"],
  "recommendations": ["rec1","rec2","rec3"],
  "exclusions": ["exclusion1","exclusion2"],
  "irdaiCompliant": true|false
}`
      );
      const clean = raw.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      setResult({ type:'document', data: parsed });
    } catch(e) {
      console.error(e);
      setError('Analysis failed. Check console for details.');
    }
    setRunning(false);
  };

  // ── Risk Profile Analysis ───────────────────────────────────────────────────
  const analyzeRisk = async () => {
    if (!policies.length) { setError('No policies found for risk analysis.'); return; }
    setRunning(true); setError(''); setResult(null);
    const policyData = policies.map(p => ({
      type: p.type, name: p.name, premium: p.premium, coverage: p.coverage, status: p.status
    }));
    const claimData = claims.map(c => ({
      type: c.type, amount: c.amount, status: c.status
    }));
    try {
      const raw = await callClaude(
        [{ role:'user', content:`Analyze this customer's insurance portfolio and respond ONLY with valid JSON:\n\nPolicies: ${JSON.stringify(policyData)}\nClaims: ${JSON.stringify(claimData)}` }],
        `You are an AI risk analyst for an Indian insurance company.
Analyze the customer's policy portfolio and claim history. Return ONLY a JSON object:
{
  "overallRisk": "Low|Medium|High|Critical",
  "riskScore": <number 0-100>,
  "portfolioHealth": "Excellent|Good|Fair|Poor",
  "coverageGaps": ["gap1","gap2"],
  "recommendations": ["rec1","rec2","rec3"],
  "claimRisk": "Low|Medium|High",
  "fraudRisk": "Low|Medium|High",
  "insights": ["insight1","insight2","insight3"],
  "suggestedPolicies": ["policy_type1","policy_type2"]
}`
      );
      const clean = raw.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      setResult({ type:'risk', data: parsed });
    } catch(e) {
      console.error(e);
      setError('Risk analysis failed. Check console.');
    }
    setRunning(false);
  };

  // ── Insurance Chatbot ───────────────────────────────────────────────────────
  const sendChat = async () => {
    if (!question.trim()) return;
    const userMsg = { role:'user', content: question };
    const updatedHistory = [...chatHistory, userMsg];
    setChatHistory(updatedHistory);
    setQuestion('');
    setRunning(true);
    try {
      const reply = await callClaude(
        updatedHistory,
        `You are InsurAI's intelligent assistant, an expert in Indian insurance — IRDAI regulations, health, motor, life, travel, and business policies. 
The user's name is ${currentUser?.firstname || 'the customer'}.
They have ${policies.length} active policies and ${claims.length} claims on record.
Give concise, accurate, helpful answers about insurance. Be friendly and professional.`
      );
      setChatHistory(h => [...h, { role:'assistant', content: reply }]);
    } catch(e) {
      setChatHistory(h => [...h, { role:'assistant', content:'Sorry, I encountered an error. Please try again.' }]);
    }
    setRunning(false);
  };

  const riskColor = r => ({ Low:'#10b981', Medium:'#f59e0b', High:'#ef4444', Critical:'#dc2626' }[r] || '#64748b');

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <h2 style={{ fontSize:22, fontWeight:800, marginBottom:4 }}>AI Policy Intelligence</h2>
          <p style={{ color:'var(--text2)', fontSize:13 }}>Real AI analysis powered by Claude — not a demo</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(139,92,246,0.12)', border:'1px solid rgba(139,92,246,0.25)', borderRadius:8, padding:'6px 12px' }}>
          <Brain size={14} style={{ color:'#a78bfa' }}/>
          <span style={{ fontSize:12, color:'#a78bfa', fontWeight:700 }}>Claude AI · Live</span>
        </div>
      </div>

      {/* Mode selector */}
      <div style={{ display:'flex', gap:8 }}>
        {[
          { id:'document', label:'📄 Analyze Policy Document' },
          { id:'risk',     label:'📊 My Risk Profile'         },
          { id:'chat',     label:'💬 Ask AI Assistant'        },
        ].map(m => (
          <button key={m.id} onClick={() => { setMode(m.id); setResult(null); setError(''); }}
            style={{ padding:'9px 18px', borderRadius:10, border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:600, transition:'all .2s',
              background: mode===m.id ? 'linear-gradient(135deg,#7c3aed,#a855f7)' : 'var(--navy2)',
              color: mode===m.id ? 'white' : 'var(--text2)',
              boxShadow: mode===m.id ? '0 4px 14px rgba(139,92,246,0.3)' : 'none',
            }}>
            {m.label}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', color:'#f87171', borderRadius:10, padding:'11px 15px', fontSize:14 }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── DOCUMENT ANALYSIS MODE ── */}
      {mode === 'document' && (
        <div style={{ display:'grid', gridTemplateColumns: result ? '1fr 1.2fr' : '1fr', gap:20 }}>
          <div className="card" style={{ padding:22 }}>
            <h3 style={{ fontSize:15, fontWeight:700, marginBottom:5 }}>Paste Policy Document</h3>
            <p style={{ fontSize:12, color:'var(--text2)', marginBottom:14 }}>Works with any insurance policy — health, motor, life, travel, business</p>
            <textarea rows={14} className="inp" style={{ resize:'vertical', marginBottom:14, fontSize:13, lineHeight:1.6 }}
              placeholder="Paste your full policy document text here…&#10;&#10;Example: This Health Insurance Policy is issued to...&#10;&#10;The AI will extract:&#10;• Risk score & level&#10;• Coverage gaps&#10;• Red flags&#10;• IRDAI compliance&#10;• Recommendations"
              value={docText} onChange={e => setDocText(e.target.value)}/>
            <button onClick={analyzeDocument} disabled={running}
              style={{ width:'100%', padding:'12px', borderRadius:10, border:'none', cursor: running?'not-allowed':'pointer', fontFamily:'inherit', fontSize:14, fontWeight:700,
                background:'linear-gradient(135deg,#7c3aed,#a855f7)', color:'white', opacity: running?0.7:1,
                display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              {running ? <>⏳ Analyzing…</> : <><Brain size={15}/> Analyze with AI</>}
            </button>
          </div>

          {result?.type === 'document' && (() => {
            const d = result.data;
            return (
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {/* Scores */}
                <div className="card" style={{ padding:20 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                    <h3 style={{ fontSize:15, fontWeight:700 }}>Analysis Results</h3>
                    <span style={{ fontSize:12, fontWeight:700, padding:'4px 10px', borderRadius:20, background:`${riskColor(d.riskLevel)}22`, color:riskColor(d.riskLevel) }}>
                      {d.riskLevel} Risk
                    </span>
                  </div>
                  <p style={{ fontSize:13, color:'var(--text2)', lineHeight:1.6, marginBottom:16 }}>{d.summary}</p>
                  {[
                    { label:'Risk Score',       val:`${d.riskScore}/100`, pct:d.riskScore,      color: riskColor(d.riskLevel) },
                    { label:'IRDAI Compliance', val:`${d.complianceScore}%`, pct:d.complianceScore, color:'#10b981' },
                    { label:'Coverage Quality', val:`${d.coverageScore}%`,  pct:d.coverageScore,   color:'#3b82f6' },
                  ].map(r => (
                    <div key={r.label} style={{ marginBottom:14 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                        <span style={{ fontSize:12, color:'var(--text2)', fontWeight:600 }}>{r.label}</span>
                        <span style={{ fontSize:12, fontWeight:700, color:r.color }}>{r.val}</span>
                      </div>
                      <div style={{ height:5, background:'var(--navy3)', borderRadius:3, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${r.pct}%`, background:r.color, borderRadius:3, transition:'width 1.2s ease' }}/>
                      </div>
                    </div>
                  ))}
                  <div style={{ display:'flex', gap:10, marginTop:6 }}>
                    <div style={{ flex:1, padding:'10px', background:'var(--navy2)', borderRadius:8, textAlign:'center' }}>
                      <div style={{ fontSize:11, color:'var(--text2)', marginBottom:3 }}>Premium</div>
                      <div style={{ fontSize:13, fontWeight:700, color: d.premiumFairness==='Fair'?'#10b981':d.premiumFairness==='Overpriced'?'#ef4444':'#f59e0b' }}>{d.premiumFairness}</div>
                    </div>
                    <div style={{ flex:1, padding:'10px', background:'var(--navy2)', borderRadius:8, textAlign:'center' }}>
                      <div style={{ fontSize:11, color:'var(--text2)', marginBottom:3 }}>IRDAI</div>
                      <div style={{ fontSize:13, fontWeight:700, color: d.irdaiCompliant?'#10b981':'#ef4444' }}>{d.irdaiCompliant?'Compliant':'Non-Compliant'}</div>
                    </div>
                  </div>
                </div>

                {/* Findings */}
                <div className="card" style={{ padding:20 }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                    <div>
                      <div style={{ fontSize:12, fontWeight:700, color:'#34d399', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.05em' }}>✓ Key Findings</div>
                      {d.keyFindings?.map((f,i) => (
                        <div key={i} style={{ fontSize:12, color:'var(--text2)', marginBottom:5, display:'flex', gap:6, alignItems:'flex-start', lineHeight:1.4 }}>
                          <span style={{ color:'#34d399', flexShrink:0 }}>•</span>{f}
                        </div>
                      ))}
                    </div>
                    <div>
                      <div style={{ fontSize:12, fontWeight:700, color:'#f87171', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.05em' }}>⚠ Red Flags</div>
                      {d.redFlags?.length ? d.redFlags.map((f,i) => (
                        <div key={i} style={{ fontSize:12, color:'var(--text2)', marginBottom:5, display:'flex', gap:6, alignItems:'flex-start', lineHeight:1.4 }}>
                          <span style={{ color:'#f87171', flexShrink:0 }}>•</span>{f}
                        </div>
                      )) : <div style={{ fontSize:12, color:'#34d399' }}>No red flags found ✓</div>}
                    </div>
                  </div>
                  <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid var(--navy3)' }}>
                    <div style={{ fontSize:12, fontWeight:700, color:'#60a5fa', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.05em' }}>💡 Recommendations</div>
                    {d.recommendations?.map((r,i) => (
                      <div key={i} style={{ fontSize:12, color:'var(--text2)', marginBottom:5, display:'flex', gap:6, lineHeight:1.4 }}>
                        <span style={{ color:'#60a5fa', flexShrink:0 }}>{i+1}.</span>{r}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ── RISK PROFILE MODE ── */}
      {mode === 'risk' && (
        <div style={{ display:'grid', gridTemplateColumns: result ? '1fr 1.2fr' : '1fr', gap:20 }}>
          <div className="card" style={{ padding:22 }}>
            <h3 style={{ fontSize:15, fontWeight:700, marginBottom:5 }}>Your Portfolio Risk Analysis</h3>
            <p style={{ fontSize:12, color:'var(--text2)', marginBottom:20 }}>AI will analyze your {policies.length} policies and {claims.length} claims to generate a personal risk profile.</p>
            {policies.length === 0
              ? <div style={{ textAlign:'center', padding:'30px 0', color:'var(--text2)' }}>
                  <Shield size={40} style={{ margin:'0 auto 12px', opacity:0.3, display:'block' }}/>
                  <p style={{ fontSize:13 }}>Buy some policies first to unlock risk analysis</p>
                </div>
              : <>
                  <div style={{ background:'var(--navy2)', borderRadius:10, padding:14, marginBottom:18 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:'var(--text2)', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.05em' }}>What will be analyzed:</div>
                    {[
                      `${policies.length} insurance policies across ${[...new Set(policies.map(p=>p.type))].join(', ')}`,
                      `${claims.filter(c=>c.status==='APPROVED').length} approved claims out of ${claims.length} total`,
                      'Coverage gaps and under-insured areas',
                      'Fraud risk based on claim patterns',
                      'Personalized policy recommendations',
                    ].map((item,i) => (
                      <div key={i} style={{ fontSize:12, color:'var(--text2)', marginBottom:5, display:'flex', gap:7 }}>
                        <span style={{ color:'#a78bfa' }}>→</span>{item}
                      </div>
                    ))}
                  </div>
                  <button onClick={analyzeRisk} disabled={running}
                    style={{ width:'100%', padding:'12px', borderRadius:10, border:'none', cursor:running?'not-allowed':'pointer', fontFamily:'inherit', fontSize:14, fontWeight:700,
                      background:'linear-gradient(135deg,#7c3aed,#a855f7)', color:'white', opacity:running?0.7:1,
                      display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                    {running ? '⏳ Analyzing…' : <><Brain size={15}/> Generate My Risk Profile</>}
                  </button>
                </>
            }
          </div>

          {result?.type === 'risk' && (() => {
            const d = result.data;
            return (
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div className="card" style={{ padding:20 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                    <h3 style={{ fontSize:15, fontWeight:700 }}>Risk Profile</h3>
                    <span style={{ fontSize:12, fontWeight:700, padding:'4px 10px', borderRadius:20, background:`${riskColor(d.overallRisk)}22`, color:riskColor(d.overallRisk) }}>
                      {d.overallRisk} Risk
                    </span>
                  </div>
                  {[
                    { label:'Overall Risk',   pct:d.riskScore,  color:riskColor(d.overallRisk) },
                    { label:'Claim Risk',     pct:d.claimRisk==='Low'?25:d.claimRisk==='Medium'?55:80, color:'#f59e0b' },
                    { label:'Fraud Risk',     pct:d.fraudRisk==='Low'?15:d.fraudRisk==='Medium'?50:85, color:'#ef4444' },
                  ].map(r => (
                    <div key={r.label} style={{ marginBottom:14 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                        <span style={{ fontSize:12, color:'var(--text2)', fontWeight:600 }}>{r.label}</span>
                        <span style={{ fontSize:12, fontWeight:700, color:r.color }}>{r.pct}/100</span>
                      </div>
                      <div style={{ height:5, background:'var(--navy3)', borderRadius:3, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${r.pct}%`, background:r.color, borderRadius:3 }}/>
                      </div>
                    </div>
                  ))}
                  <div style={{ display:'flex', gap:10, marginTop:4 }}>
                    <div style={{ flex:1, padding:'10px', background:'var(--navy2)', borderRadius:8, textAlign:'center' }}>
                      <div style={{ fontSize:11, color:'var(--text2)', marginBottom:3 }}>Portfolio</div>
                      <div style={{ fontSize:13, fontWeight:700, color: d.portfolioHealth==='Excellent'||d.portfolioHealth==='Good'?'#10b981':'#f59e0b' }}>{d.portfolioHealth}</div>
                    </div>
                    <div style={{ flex:1, padding:'10px', background:'var(--navy2)', borderRadius:8, textAlign:'center' }}>
                      <div style={{ fontSize:11, color:'var(--text2)', marginBottom:3 }}>Gaps Found</div>
                      <div style={{ fontSize:13, fontWeight:700, color: d.coverageGaps?.length?'#f59e0b':'#10b981' }}>{d.coverageGaps?.length || 0}</div>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ padding:20 }}>
                  {d.coverageGaps?.length > 0 && (
                    <div style={{ marginBottom:14 }}>
                      <div style={{ fontSize:12, fontWeight:700, color:'#f87171', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.05em' }}>⚠ Coverage Gaps</div>
                      {d.coverageGaps.map((g,i) => (
                        <div key={i} style={{ fontSize:12, color:'var(--text2)', marginBottom:5, display:'flex', gap:6 }}><span style={{ color:'#f87171' }}>•</span>{g}</div>
                      ))}
                    </div>
                  )}
                  <div style={{ marginBottom:14 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:'#60a5fa', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.05em' }}>💡 Insights</div>
                    {d.insights?.map((s,i) => (
                      <div key={i} style={{ fontSize:12, color:'var(--text2)', marginBottom:5, display:'flex', gap:6 }}><span style={{ color:'#60a5fa' }}>→</span>{s}</div>
                    ))}
                  </div>
                  {d.suggestedPolicies?.length > 0 && (
                    <div style={{ paddingTop:12, borderTop:'1px solid var(--navy3)' }}>
                      <div style={{ fontSize:12, fontWeight:700, color:'#34d399', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.05em' }}>✦ Suggested Policies</div>
                      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                        {d.suggestedPolicies.map((p,i) => (
                          <span key={i} style={{ fontSize:11, fontWeight:600, padding:'4px 10px', borderRadius:20, background:'rgba(16,185,129,0.12)', color:'#34d399', border:'1px solid rgba(16,185,129,0.25)' }}>{p}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ── AI CHAT MODE ── */}
      {mode === 'chat' && (
        <div className="card" style={{ display:'flex', flexDirection:'column', height:520 }}>
          <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--navy3)', display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:'linear-gradient(135deg,#7c3aed,#a855f7)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Brain size={16} color="white"/>
            </div>
            <div>
              <div style={{ fontWeight:700, fontSize:14 }}>InsurAI Assistant</div>
              <div style={{ fontSize:11, color:'#10b981' }}>● Online — powered by Claude</div>
            </div>
            {chatHistory.length > 0 && (
              <button onClick={() => setChatHistory([])}
                style={{ marginLeft:'auto', fontSize:11, color:'var(--text2)', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit' }}>
                Clear chat
              </button>
            )}
          </div>

          <div style={{ flex:1, overflowY:'auto', padding:20, display:'flex', flexDirection:'column', gap:12 }}>
            {chatHistory.length === 0 && (
              <div style={{ textAlign:'center', padding:'30px 20px' }}>
                <Brain size={36} style={{ margin:'0 auto 12px', color:'#a78bfa', display:'block' }}/>
                <div style={{ fontWeight:700, fontSize:15, marginBottom:8 }}>Ask me anything about insurance</div>
                <div style={{ fontSize:12, color:'var(--text2)', marginBottom:20 }}>IRDAI regulations · Policy comparisons · Claims guidance · Coverage advice</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center' }}>
                  {[
                    'What is a no-claim bonus?',
                    'How do I file a cashless claim?',
                    'What does IRDAI say about claim settlement?',
                    'Should I buy term or whole life insurance?',
                  ].map(q => (
                    <button key={q} onClick={() => setQuestion(q)}
                      style={{ fontSize:11, padding:'6px 12px', borderRadius:20, background:'var(--navy2)', border:'1px solid var(--navy3)', color:'var(--text2)', cursor:'pointer', fontFamily:'inherit' }}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {chatHistory.map((msg, i) => (
              <div key={i} style={{ display:'flex', justifyContent: msg.role==='user'?'flex-end':'flex-start' }}>
                <div style={{
                  maxWidth:'75%', padding:'11px 15px', borderRadius: msg.role==='user'?'14px 14px 4px 14px':'14px 14px 14px 4px',
                  background: msg.role==='user' ? 'linear-gradient(135deg,#1d4ed8,#0ea5e9)' : 'var(--navy2)',
                  border: msg.role==='assistant' ? '1px solid var(--navy3)' : 'none',
                  fontSize:13, lineHeight:1.6, color:'#e2e8f0', whiteSpace:'pre-wrap',
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {running && (
              <div style={{ display:'flex', justifyContent:'flex-start' }}>
                <div style={{ padding:'11px 15px', borderRadius:'14px 14px 14px 4px', background:'var(--navy2)', border:'1px solid var(--navy3)', fontSize:13, color:'var(--text2)' }}>
                  ⏳ Thinking…
                </div>
              </div>
            )}
          </div>

          <div style={{ padding:'14px 16px', borderTop:'1px solid var(--navy3)', display:'flex', gap:10 }}>
            <input className="inp" style={{ flex:1 }} placeholder="Ask about policies, claims, IRDAI rules…"
              value={question} onChange={e => setQuestion(e.target.value)}
              onKeyDown={e => e.key==='Enter' && !e.shiftKey && sendChat()}/>
            <button onClick={sendChat} disabled={running || !question.trim()}
              style={{ padding:'11px 18px', borderRadius:10, border:'none', cursor:'pointer', fontFamily:'inherit', fontWeight:700, fontSize:13,
                background:'linear-gradient(135deg,#7c3aed,#a855f7)', color:'white', opacity:running||!question.trim()?0.5:1 }}>
              Send →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

