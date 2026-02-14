import './index.css';
import { useState } from 'react';
import { Search, Upload, FileText, Brain, BarChart3, Shield, Menu, X, ChevronRight, Zap, Clock, CheckCircle2, AlertCircle, TrendingUp, Users, Database, DollarSign, FileCheck, AlertTriangle } from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(''); // 'customer', 'advisor', 'admin'
  const [authView, setAuthView] = useState('login');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [formData, setFormData] = useState({ 
    firstname: '', 
    lastname: '', 
    email: '', 
    phone: '', 
    password: '', 
    confirmPassword: '', 
    role: '' 
  });

  // Password strength checker
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordMatch, setPasswordMatch] = useState(null);

  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;
    return strength;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
      if (formData.confirmPassword) {
        setPasswordMatch(value === formData.confirmPassword);
      }
    }
    if (name === 'confirmPassword') {
      setPasswordMatch(value === formData.password);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (formData.email && formData.password && formData.role) {
      setUserRole(formData.role);
      setIsAuthenticated(true);
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    if (passwordStrength < 3) {
      alert('Please use a stronger password');
      return;
    }
    setUserRole('customer');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      setIsAuthenticated(false);
      setUserRole('');
      setFormData({ firstname: '', lastname: '', email: '', phone: '', password: '', confirmPassword: '', role: '' });
    }
  };

  const getStrengthLabel = () => {
    if (passwordStrength === 0) return { text: 'Enter password', class: '' };
    if (passwordStrength <= 2) return { text: 'Weak', class: 'weak' };
    if (passwordStrength === 3) return { text: 'Fair', class: 'fair' };
    if (passwordStrength === 4) return { text: 'Good', class: 'good' };
    return { text: 'Strong', class: 'strong' };
  };

  // Role-based navigation
  const getNavigation = () => {
    const commonNav = [
      { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
    ];

    if (userRole === 'customer') {
      return [
        ...commonNav,
        { id: 'policies', icon: Shield, label: 'My Policies' },
        { id: 'buy-policy', icon: FileCheck, label: 'Buy Policy' },
        { id: 'claims', icon: AlertCircle, label: 'Submit Claim' },
        { id: 'premium', icon: DollarSign, label: 'Pay Premium' },
      ];
    }

    if (userRole === 'advisor') {
      return [
        ...commonNav,
        { id: 'customers', icon: Users, label: 'Customers' },
        { id: 'proposals', icon: FileText, label: 'Create Proposal' },
        { id: 'commission', icon: DollarSign, label: 'Commission' },
        { id: 'reports', icon: TrendingUp, label: 'Reports' },
      ];
    }

    if (userRole === 'admin') {
      return [
        ...commonNav,
        { id: 'customers', icon: Users, label: 'Manage Customers' },
        { id: 'policies', icon: Shield, label: 'Approve Policies' },
        { id: 'claims', icon: AlertTriangle, label: 'Approve Claims' },
        { id: 'reports', icon: TrendingUp, label: 'View Reports' },
      ];
    }

    return commonNav;
  };

  const strengthLabel = getStrengthLabel();

  // AUTH PAGES
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex items-center justify-center p-8 relative overflow-hidden">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

          * {
            font-family: 'Outfit', sans-serif;
          }

          .font-mono {
            font-family: 'JetBrains Mono', monospace;
          }

          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }

          .animate-float {
            animation: float 6s ease-in-out infinite;
          }

          .gradient-text {
            background: linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .glow {
            box-shadow: 0 0 20px rgba(34, 211, 238, 0.3);
          }

          .strength-bar {
            height: 5px;
            flex: 1;
            background: #334155;
            border-radius: 3px;
            transition: all 0.35s ease;
          }

          .strength-bar.active.weak { background: #ef4444; }
          .strength-bar.active.fair { background: #f59e0b; }
          .strength-bar.active.good { background: #10b981; }
          .strength-bar.active.strong { background: #22c55e; }
        `}</style>

        {/* Animated background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl glow">
                <Shield size={40} className="text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold gradient-text tracking-tight mb-2">InsureAI</h1>
            <p className="text-slate-400 font-mono">Corporate Policy Intelligence System</p>
          </div>

          <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
            
            {/* Login/Register Tabs */}
            <div className="flex gap-2 mb-8 p-1 bg-slate-800/50 rounded-xl">
              <button
                onClick={() => setAuthView('login')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                  authView === 'login'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white glow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setAuthView('register')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                  authView === 'register'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white glow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Register
              </button>
            </div>

            {/* LOGIN FORM */}
            {authView === 'login' && (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@company.com"
                    className="w-full px-4 py-3 rounded-xl text-slate-100 bg-slate-950/80 border-2 border-slate-700 focus:border-cyan-500 focus:outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl text-slate-100 bg-slate-950/80 border-2 border-slate-700 focus:border-cyan-500 focus:outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Login As</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl text-slate-100 bg-slate-950/80 border-2 border-slate-700 focus:border-cyan-500 focus:outline-none transition-all"
                    required
                  >
                    <option hidden value="">Select your role...</option>
                    <option value="customer">Customer</option>
                    <option value="advisor">Advisor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                    <input type="checkbox" className="rounded bg-slate-800 border-slate-700" />
                    <span>Remember me</span>
                  </label>
                  <button type="button" className="text-cyan-400 hover:text-cyan-300 font-semibold">
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold text-lg glow hover:shadow-2xl transition-all transform hover:scale-[1.02]"
                >
                  Sign In
                </button>

                <div className="flex items-center my-6">
                  <div className="flex-1 border-t border-slate-700"></div>
                  <span className="px-4 text-sm text-slate-500 font-semibold">OR</span>
                  <div className="flex-1 border-t border-slate-700"></div>
                </div>

                <button
                  type="button"
                  className="w-full py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-semibold flex items-center justify-center gap-3 hover:bg-slate-700 transition-all"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
                    <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.59.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z" fill="#FBBC05"/>
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>

                <p className="text-center text-slate-400 text-sm">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthView('register')}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold"
                  >
                    Create one
                  </button>
                </p>
              </form>
            )}

            {/* REGISTER FORM */}
            {authView === 'register' && (
              <form onSubmit={handleRegister} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">First Name</label>
                    <input
                      type="text"
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleInputChange}
                      placeholder="John"
                      className="w-full px-4 py-3 rounded-xl text-slate-100 bg-slate-950/80 border-2 border-slate-700 focus:border-cyan-500 focus:outline-none transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Last Name</label>
                    <input
                      type="text"
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleInputChange}
                      placeholder="Doe"
                      className="w-full px-4 py-3 rounded-xl text-slate-100 bg-slate-950/80 border-2 border-slate-700 focus:border-cyan-500 focus:outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@company.com"
                    className="w-full px-4 py-3 rounded-xl text-slate-100 bg-slate-950/80 border-2 border-slate-700 focus:border-cyan-500 focus:outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="(555) 123-4567"
                    className="w-full px-4 py-3 rounded-xl text-slate-100 bg-slate-950/80 border-2 border-slate-700 focus:border-cyan-500 focus:outline-none transition-all"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Create password"
                      className="w-full px-4 py-3 rounded-xl text-slate-100 bg-slate-950/80 border-2 border-slate-700 focus:border-cyan-500 focus:outline-none transition-all"
                      required
                    />
                    {/* Password Strength */}
                    {formData.password && (
                      <div className="mt-3">
                        <div className="flex gap-2 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`strength-bar ${i < passwordStrength ? `active ${strengthLabel.class}` : ''}`}
                            />
                          ))}
                        </div>
                        <p className={`text-sm font-bold ${
                          strengthLabel.class === 'weak' ? 'text-red-400' :
                          strengthLabel.class === 'fair' ? 'text-orange-400' :
                          strengthLabel.class === 'good' ? 'text-green-400' :
                          strengthLabel.class === 'strong' ? 'text-green-500' :
                          'text-slate-400'
                        }`}>
                          Password strength: <span>{strengthLabel.text}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm password"
                      className="w-full px-4 py-3 rounded-xl text-slate-100 bg-slate-950/80 border-2 border-slate-700 focus:border-cyan-500 focus:outline-none transition-all"
                      required
                    />
                    {/* Password Match */}
                    {formData.confirmPassword && (
                      <div className="mt-3">
                        <p className={`text-sm font-bold flex items-center gap-2 ${
                          passwordMatch ? 'text-green-400' : 'text-red-400'
                        }`}>
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs text-white ${
                            passwordMatch ? 'bg-green-500' : 'bg-red-500'
                          }`}>
                            {passwordMatch ? '✓' : '✕'}
                          </span>
                          {passwordMatch ? 'Passwords match' : 'Passwords do not match'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <input type="checkbox" className="mt-1 rounded bg-slate-800 border-slate-700" required />
                  <label className="text-sm text-slate-400">
                    I agree to the{' '}
                    <button type="button" className="text-cyan-400 hover:text-cyan-300">Terms of Service</button>
                    {' '}and{' '}
                    <button type="button" className="text-cyan-400 hover:text-cyan-300">Privacy Policy</button>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold text-lg glow hover:shadow-2xl transition-all transform hover:scale-[1.02]"
                >
                  Create Account
                </button>

                <p className="text-center text-slate-400 text-sm">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthView('login')}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold"
                  >
                    Sign in
                  </button>
                </p>
              </form>
            )}
          </div>

          <div className="mt-8 text-center text-slate-500 text-sm">
            <p>© 2026 InsureAI. Powered by Advanced AI Technology</p>
          </div>
        </div>
      </div>
    );
  }

  // DASHBOARD
  const navigation = getNavigation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

        * {
          font-family: 'Outfit', sans-serif;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .gradient-text {
          background: linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .glow {
          box-shadow: 0 0 20px rgba(34, 211, 238, 0.3);
        }

        .stat-card {
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%);
          border: 1px solid rgba(51, 65, 85, 0.5);
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 0 30px rgba(34, 211, 238, 0.2);
          border-color: rgba(34, 211, 238, 0.5);
        }

        .nav-item {
          transition: all 0.3s ease;
          border-left: 3px solid transparent;
        }

        .nav-item:hover {
          background: rgba(34, 211, 238, 0.1);
          border-left-color: #22d3ee;
        }

        .nav-item.active {
          background: rgba(34, 211, 238, 0.15);
          border-left-color: #22d3ee;
          color: #22d3ee;
        }
      `}</style>

      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800 backdrop-blur-xl bg-slate-950/50">
        <div className="max-w-full px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl glow">
                  <Shield size={32} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold gradient-text tracking-tight">InsureAI</h1>
                  <p className="text-slate-400 text-sm font-mono capitalize">{userRole} Dashboard</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Search policies, claims, documents..."
                  className="pl-12 pr-4 py-3 rounded-xl text-slate-100 w-96 bg-slate-950/80 border-2 border-slate-700 focus:border-cyan-500 focus:outline-none transition-all"
                />
              </div>
              <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-semibold glow flex items-center gap-2 hover:shadow-lg hover:shadow-cyan-500/50 transition-all">
                <Upload size={20} />
                Upload Policy
              </button>
              <button 
                onClick={handleLogout}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-semibold transition-colors flex items-center gap-2"
              >
                <Users size={20} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex relative z-10">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 border-r border-slate-800 backdrop-blur-xl bg-slate-950/30 overflow-hidden`}>
          <nav className="p-6 space-y-2">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-item w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left ${
                  activeTab === item.id ? 'active' : 'text-slate-300'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
                {activeTab === item.id && <ChevronRight size={16} className="ml-auto" />}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <h2 className="text-3xl font-bold">Welcome back, User!</h2>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-6">
                {userRole === 'customer' && (
                  <>
                    <div className="stat-card p-6 rounded-2xl">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-xl bg-cyan-500/20">
                          <Shield size={24} className="text-cyan-400" />
                        </div>
                        <span className="text-green-400 text-sm font-semibold">Active</span>
                      </div>
                      <h3 className="text-3xl font-bold mb-1">5</h3>
                      <p className="text-slate-400 text-sm">Active Policies</p>
                    </div>

                    <div className="stat-card p-6 rounded-2xl">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-xl bg-green-500/20">
                          <DollarSign size={24} className="text-green-400" />
                        </div>
                        <span className="text-amber-400 text-sm font-semibold">Due Soon</span>
                      </div>
                      <h3 className="text-3xl font-bold mb-1">$1,250</h3>
                      <p className="text-slate-400 text-sm">Premium Due</p>
                    </div>

                    <div className="stat-card p-6 rounded-2xl">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-xl bg-blue-500/20">
                          <FileCheck size={24} className="text-blue-400" />
                        </div>
                        <span className="text-blue-400 text-sm font-semibold">+2</span>
                      </div>
                      <h3 className="text-3xl font-bold mb-1">3</h3>
                      <p className="text-slate-400 text-sm">Claims Submitted</p>
                    </div>

                    <div className="stat-card p-6 rounded-2xl">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-xl bg-purple-500/20">
                          <TrendingUp size={24} className="text-purple-400" />
                        </div>
                        <span className="text-green-400 text-sm font-semibold">+15%</span>
                      </div>
                      <h3 className="text-3xl font-bold mb-1">$50K</h3>
                      <p className="text-slate-400 text-sm">Total Coverage</p>
                    </div>
                  </>
                )}

                {userRole === 'advisor' && (
                  <>
                    <div className="stat-card p-6 rounded-2xl">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-xl bg-cyan-500/20">
                          <Users size={24} className="text-cyan-400" />
                        </div>
                        <span className="text-green-400 text-sm font-semibold">+12</span>
                      </div>
                      <h3 className="text-3xl font-bold mb-1">156</h3>
                      <p className="text-slate-400 text-sm">Total Customers</p>
                    </div>

                    <div className="stat-card p-6 rounded-2xl">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-xl bg-green-500/20">
                          <DollarSign size={24} className="text-green-400" />
                        </div>
                        <span className="text-green-400 text-sm font-semibold">+8%</span>
                      </div>
                      <h3 className="text-3xl font-bold mb-1">$12,450</h3>
                      <p className="text-slate-400 text-sm">This Month</p>
                    </div>

                    <div className="stat-card p-6 rounded-2xl">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-xl bg-blue-500/20">
                          <FileText size={24} className="text-blue-400" />
                        </div>
                        <span className="text-blue-400 text-sm font-semibold">Pending</span>
                      </div>
                      <h3 className="text-3xl font-bold mb-1">23</h3>
                      <p className="text-slate-400 text-sm">Proposals</p>
                    </div>

                    <div className="stat-card p-6 rounded-2xl">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-xl bg-purple-500/20">
                          <TrendingUp size={24} className="text-purple-400" />
                        </div>
                        <span className="text-green-400 text-sm font-semibold">+22%</span>
                      </div>
                      <h3 className="text-3xl font-bold mb-1">89%</h3>
                      <p className="text-slate-400 text-sm">Conversion Rate</p>
                    </div>
                  </>
                )}

                {userRole === 'admin' && (
                  <>
                    <div className="stat-card p-6 rounded-2xl">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-xl bg-cyan-500/20">
                          <Users size={24} className="text-cyan-400" />
                        </div>
                        <span className="text-green-400 text-sm font-semibold">+45</span>
                      </div>
                      <h3 className="text-3xl font-bold mb-1">1,247</h3>
                      <p className="text-slate-400 text-sm">Total Users</p>
                    </div>

                    <div className="stat-card p-6 rounded-2xl">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-xl bg-blue-500/20">
                          <Shield size={24} className="text-blue-400" />
                        </div>
                        <span className="text-amber-400 text-sm font-semibold">Pending</span>
                      </div>
                      <h3 className="text-3xl font-bold mb-1">34</h3>
                      <p className="text-slate-400 text-sm">Policy Approvals</p>
                    </div>

                    <div className="stat-card p-6 rounded-2xl">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-xl bg-red-500/20">
                          <AlertTriangle size={24} className="text-red-400" />
                        </div>
                        <span className="text-red-400 text-sm font-semibold">Urgent</span>
                      </div>
                      <h3 className="text-3xl font-bold mb-1">18</h3>
                      <p className="text-slate-400 text-sm">Claim Approvals</p>
                    </div>

                    <div className="stat-card p-6 rounded-2xl">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-xl bg-green-500/20">
                          <DollarSign size={24} className="text-green-400" />
                        </div>
                        <span className="text-green-400 text-sm font-semibold">+18%</span>
                      </div>
                      <h3 className="text-3xl font-bold mb-1">$2.4M</h3>
                      <p className="text-slate-400 text-sm">Total Revenue</p>
                    </div>
                  </>
                )}
              </div>

              {/* Recent Activity */}
              <div className="stat-card p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold">Recent Activity</h3>
                  <button className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold">View All →</button>
                </div>
                <div className="space-y-4">
                  {[
                    { name: 'Commercial Property Policy v2.4', status: 'Processed', time: '2 hours ago', type: 'Update' },
                    { name: 'Cyber Insurance Framework', status: 'Analyzing', time: '5 hours ago', type: 'New' },
                    { name: 'General Liability Coverage', status: 'Approved', time: '1 day ago', type: 'Review' },
                    { name: 'Workers Compensation Policy', status: 'Pending', time: '2 days ago', type: 'Update' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors cursor-pointer">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
                        <FileText size={20} className="text-cyan-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-100">{item.name}</h4>
                        <p className="text-sm text-slate-400">{item.time}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-400">
                        {item.type}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.status === 'Processed' ? 'bg-green-500/20 text-green-400' :
                        item.status === 'Analyzing' ? 'bg-amber-500/20 text-amber-400' :
                        item.status === 'Approved' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'dashboard' && (
            <div className="stat-card p-12 rounded-2xl text-center">
              <h2 className="text-3xl font-bold mb-4">
                {navigation.find(n => n.id === activeTab)?.label}
              </h2>
              <p className="text-slate-400">This page is under construction.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
