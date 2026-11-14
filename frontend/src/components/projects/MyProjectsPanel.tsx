import React, { useState, useEffect, useCallback } from 'react';
import {
  X, BarChart2, CheckCircle2, Clock, AlertTriangle, Building2,
  IndianRupee, FileText, MessageSquare, Plus, ChevronDown,
  ChevronUp, Send, Hammer, TrendingUp, CalendarDays,
  ShieldCheck, Download, Paperclip, Star, Flag, Circle,
  Lock, Eye, Edit3, CreditCard
} from 'lucide-react';
import { useUser } from '../../context/UserContext';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProjectWorkspace {
  id: string;
  project_id: string;
  project_title: string;
  customer_name: string;
  professional_name: string;
  professional_company: string;
  agreed_amount: number;
  expected_start_date: string;
  expected_completion_date: string;
  status: 'agreement_pending' | 'active' | 'paused' | 'completed';
  overall_progress: number;
  amount_paid: number;
  created_at: string;
  // Dual-approval fields
  start_confirmed_professional: boolean;
  start_confirmed_customer: boolean;
  completion_confirmed_professional: boolean;
  completion_confirmed_customer: boolean;
}

interface ProjectMilestone {
  id: string;
  workspace_id: string;
  name: string;
  description: string;
  planned_start: string;
  planned_end: string;
  actual_start?: string | null;
  actual_end?: string | null;
  progress_percentage: number;
  status: 'not_started' | 'in_progress' | 'submitted_for_review' | 'completed' | 'delayed';
  payment_amount?: number;
  photos?: string[];
}

interface ProgressUpdate {
  id: string;
  workspace_id: string;
  title: string;
  description: string;
  work_in_progress: string;
  progress_percentage: number;
  photos?: string[];
  issues_or_delays?: string;
  next_activities?: string;
  created_at: string;
  posted_by: string;
}

interface PaymentMilestone {
  id: string;
  workspace_id: string;
  name: string;
  amount: number;
  status: 'paid' | 'pending' | 'upcoming';
  due_date?: string;
  paid_date?: string;
  reference?: string;
}

interface WorkspaceDocument {
  id: string;
  workspace_id: string;
  filename: string;
  category: string;
  url: string;
  uploader: string;
  uploaded_at: string;
}

// ─── Component Props ──────────────────────────────────────────────────────────

interface MyProjectsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChat?: (name: string, role: string, projectTitle: string) => void;
  targetWorkspaceId?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const API = 'http://localhost:8000/api/v1';

const fmtINR = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const fmtDate = (d?: string | null) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return d; }
};

const milestoneStatusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  not_started: { label: 'Not Started', color: 'bg-slate-100 text-slate-600 border-slate-300', icon: <Circle className="w-3.5 h-3.5" /> },
  in_progress: { label: 'In Progress', color: 'bg-amber-100 text-amber-800 border-amber-300', icon: <Hammer className="w-3.5 h-3.5" /> },
  submitted_for_review: { label: 'Awaiting Approval', color: 'bg-indigo-100 text-indigo-800 border-indigo-300', icon: <Flag className="w-3.5 h-3.5" /> },
  completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  delayed: { label: 'Delayed', color: 'bg-red-100 text-red-800 border-red-300', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
};

const paymentStatusConfig: Record<string, { label: string; color: string }> = {
  paid: { label: 'Paid', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  upcoming: { label: 'Upcoming', color: 'bg-slate-100 text-slate-600 border-slate-200' },
};

// ─── Tab definitions ──────────────────────────────────────────────────────────

type TabId = 'overview' | 'milestones' | 'updates' | 'payments' | 'documents' | 'completion';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <BarChart2 className="w-3.5 h-3.5" /> },
  { id: 'milestones', label: 'Milestones', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  { id: 'updates', label: 'Site Updates', icon: <TrendingUp className="w-3.5 h-3.5" /> },
  { id: 'payments', label: 'Payments', icon: <IndianRupee className="w-3.5 h-3.5" /> },
  { id: 'documents', label: 'Documents', icon: <FileText className="w-3.5 h-3.5" /> },
  { id: 'completion', label: 'Completion', icon: <Star className="w-3.5 h-3.5" /> },
];

// ─── DEMO fallback data ───────────────────────────────────────────────────────

const DEMO_WORKSPACE: ProjectWorkspace = {
  id: 'ws-demo-1',
  project_id: 'proj-c1',
  project_title: '4BHK Contemporary Portuguese Villa with Swimming Pool',
  customer_name: 'Rahul Naik',
  professional_name: 'Carlos Fernandes',
  professional_company: 'Fernandes & Sons Civil Construction',
  agreed_amount: 8150000,
  expected_start_date: '2027-01-15',
  expected_completion_date: '2027-12-15',
  status: 'active',
  overall_progress: 15,
  amount_paid: 1222500,
  created_at: new Date().toISOString(),
  start_confirmed_professional: true,
  start_confirmed_customer: true,
  completion_confirmed_professional: false,
  completion_confirmed_customer: false,
};

const DEMO_MILESTONES: ProjectMilestone[] = [
  { id: 'ms-d1', workspace_id: 'ws-demo-1', name: 'Foundation & Plinth Work', description: 'Excavation, footing, plinth beam casting, DPC treatment', planned_start: '2027-01-15', planned_end: '2027-03-15', actual_start: '2027-01-15', progress_percentage: 60, status: 'in_progress', payment_amount: 1222500 },
  { id: 'ms-d2', workspace_id: 'ws-demo-1', name: 'Ground Floor RCC Structure', description: 'Columns, beams, slab casting for ground floor', planned_start: '2027-03-16', planned_end: '2027-05-30', progress_percentage: 0, status: 'not_started', payment_amount: 1832500 },
  { id: 'ms-d3', workspace_id: 'ws-demo-1', name: 'First Floor & Roof Slab', description: 'First floor columns, beams, roof slab & waterproofing', planned_start: '2027-06-01', planned_end: '2027-08-15', progress_percentage: 0, status: 'not_started', payment_amount: 1222500 },
  { id: 'ms-d4', workspace_id: 'ws-demo-1', name: 'Finishing Works', description: 'Plastering, waterproofing, tiling, electrical & plumbing rough-in', planned_start: '2027-08-16', planned_end: '2027-11-30', progress_percentage: 0, status: 'not_started', payment_amount: 2037500 },
  { id: 'ms-d5', workspace_id: 'ws-demo-1', name: 'Final Handover', description: 'Painting, fixtures, landscaping & swimming pool completion', planned_start: '2027-12-01', planned_end: '2027-12-15', progress_percentage: 0, status: 'not_started', payment_amount: 1832500 },
];

const DEMO_UPDATES: ProgressUpdate[] = [
  {
    id: 'upd-d1', workspace_id: 'ws-demo-1',
    title: 'Foundation Excavation Completed – Week 2',
    description: 'Excavation work for all 6 footing locations completed as per drawing. Soil strata found suitable at -1.8m depth. PCC bed laid and curing in progress.',
    work_in_progress: 'Footing reinforcement cage binding and form-work preparation',
    progress_percentage: 15,
    photos: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=400&q=80'
    ],
    issues_or_delays: 'Minor utility pipe found at north-west corner. Rerouting in coordination with PWD. No major schedule impact expected.',
    next_activities: 'Footing reinforcement, shuttering, concrete pour (M25) for 6 footings',
    posted_by: 'Carlos Fernandes',
    created_at: new Date().toISOString(),
  }
];

const DEMO_PAYMENTS: PaymentMilestone[] = [
  { id: 'pmt-d1', workspace_id: 'ws-demo-1', name: '15% Advance / Mobilisation', amount: 1222500, status: 'paid', due_date: '2027-01-10', paid_date: '2027-01-12', reference: 'NEFT/UPI-20270112' },
  { id: 'pmt-d2', workspace_id: 'ws-demo-1', name: '25% Foundation Completion', amount: 2037500, status: 'pending', due_date: '2027-03-20' },
  { id: 'pmt-d3', workspace_id: 'ws-demo-1', name: '30% Ground Floor Slab', amount: 2445000, status: 'upcoming', due_date: '2027-06-10' },
  { id: 'pmt-d4', workspace_id: 'ws-demo-1', name: '20% First Floor & Roof', amount: 1630000, status: 'upcoming', due_date: '2027-09-01' },
  { id: 'pmt-d5', workspace_id: 'ws-demo-1', name: '10% Final Handover', amount: 815000, status: 'upcoming', due_date: '2027-12-20' },
];

const DEMO_DOCS: WorkspaceDocument[] = [
  { id: 'doc-d1', workspace_id: 'ws-demo-1', filename: 'Carlos_Villa_BOQ_Quotation_v1.pdf', category: 'Approved Quotation', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', uploader: 'Carlos Fernandes', uploaded_at: new Date().toISOString() },
  { id: 'doc-d2', workspace_id: 'ws-demo-1', filename: 'Work_Agreement_Rahul_Carlos_Villa.pdf', category: 'Work Agreement', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', uploader: 'System', uploaded_at: new Date().toISOString() },
];

// ─── ReadOnly Badge ───────────────────────────────────────────────────────────
const ReadOnlyBadge: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500">
    <Eye className="w-3.5 h-3.5" />
    <span>{label} — View Only</span>
    <Lock className="w-3 h-3 ml-0.5 opacity-50" />
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const MyProjectsPanel: React.FC<MyProjectsPanelProps> = ({ isOpen, onClose, onOpenChat, targetWorkspaceId }) => {
  const { currentUser, role } = useUser();
  const isProfessional = role === 'professional';
  const isCustomer = role === 'customer';
  const userName = currentUser?.fullName || '';

  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [workspaces, setWorkspaces] = useState<ProjectWorkspace[]>([]);
  const [workspace, setWorkspace] = useState<ProjectWorkspace | null>(null);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [updates, setUpdates] = useState<ProgressUpdate[]>([]);
  const [payments, setPayments] = useState<PaymentMilestone[]>([]);
  const [documents, setDocuments] = useState<WorkspaceDocument[]>([]);
  const [loading, setLoading] = useState(true);

  // Professional-only forms
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [newUpdate, setNewUpdate] = useState({ title: '', description: '', work_in_progress: '', progress_percentage: 0, issues_or_delays: '', next_activities: '' });
  const [newMilestone, setNewMilestone] = useState({ name: '', description: '', planned_start: '', planned_end: '', payment_amount: 0 });

  // Customer-only: payment
  const [payingId, setPayingId] = useState<string | null>(null);
  const [paymentRef, setPaymentRef] = useState('');

  // Completion (dual approval)
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const [expandedUpdate, setExpandedUpdate] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const showMsg = (msg: string) => { setActionMsg(msg); setTimeout(() => setActionMsg(null), 4000); };

  // ── Load workspace data filtered to current user ──────────────────────────
  const loadWorkspaces = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/workspaces?user_name=${encodeURIComponent(userName)}`);
      if (res.ok) {
        const data: ProjectWorkspace[] = await res.json();
        const list = data.length ? data : [DEMO_WORKSPACE];
        setWorkspaces(list);

        // Pick the target workspace if requested, else newest one
        let ws = list[0];
        if (targetWorkspaceId) {
          const match = list.find(w => w.id === targetWorkspaceId || w.project_id === targetWorkspaceId);
          if (match) ws = match;
        }
        setWorkspace(ws);
        await loadWorkspaceData(ws.id);
        return;
      }
    } catch { /* fall through to demo */ }
    // Demo fallback — only show if user is one of the two parties
    const demo = DEMO_WORKSPACE;
    if (userName === demo.customer_name || userName === demo.professional_name || !userName) {
      setWorkspaces([demo]);
      setWorkspace(demo);
      setMilestones(DEMO_MILESTONES);
      setUpdates(DEMO_UPDATES);
      setPayments(DEMO_PAYMENTS);
      setDocuments(DEMO_DOCS);
    } else {
      setWorkspaces([]);
      setWorkspace(null);
    }
    setLoading(false);
  }, [userName, targetWorkspaceId]);

  const loadWorkspaceData = async (wsId: string) => {
    try {
      const [msRes, updRes, pmtRes, docRes] = await Promise.all([
        fetch(`${API}/workspaces/${wsId}/milestones`),
        fetch(`${API}/workspaces/${wsId}/updates`),
        fetch(`${API}/workspaces/${wsId}/payments`),
        fetch(`${API}/workspaces/${wsId}/documents`),
      ]);
      if (msRes.ok) setMilestones(await msRes.json()); else setMilestones(DEMO_MILESTONES);
      if (updRes.ok) setUpdates(await updRes.json()); else setUpdates(DEMO_UPDATES);
      if (pmtRes.ok) setPayments(await pmtRes.json()); else setPayments(DEMO_PAYMENTS);
      if (docRes.ok) setDocuments(await docRes.json()); else setDocuments(DEMO_DOCS);
    } catch {
      setMilestones(DEMO_MILESTONES);
      setUpdates(DEMO_UPDATES);
      setPayments(DEMO_PAYMENTS);
      setDocuments(DEMO_DOCS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) loadWorkspaces();
  }, [isOpen, loadWorkspaces]);

  // ── Dual-approval: Confirm Project Start ─────────────────────────────────
  const confirmProjectStart = async () => {
    if (!workspace) return;
    const field = isProfessional ? 'start_confirmed_professional' : 'start_confirmed_customer';
    const updated = { ...workspace, [field]: true };
    const bothConfirmed = updated.start_confirmed_professional && updated.start_confirmed_customer;
    if (bothConfirmed) updated.status = 'active';
    setWorkspace(updated);
    try {
      await fetch(`${API}/workspaces/${workspace.id}/confirm-start`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: isProfessional ? 'professional' : 'customer' })
      });
    } catch { /* local only */ }
    if (bothConfirmed) {
      showMsg('🎉 Both parties confirmed! Project is now officially Active.');
    } else {
      showMsg(`✅ Your start confirmation recorded. Waiting for ${isProfessional ? workspace.customer_name : workspace.professional_name} to confirm.`);
    }
  };

  // ── Dual-approval: Confirm Project Completion ────────────────────────────
  const confirmCompletion = async () => {
    if (!workspace) return;
    const field = isProfessional ? 'completion_confirmed_professional' : 'completion_confirmed_customer';
    const updated = { ...workspace, [field]: true };
    const bothConfirmed = updated.completion_confirmed_professional && updated.completion_confirmed_customer;
    if (bothConfirmed) updated.status = 'completed';
    setWorkspace(updated);
    try {
      await fetch(`${API}/workspaces/${workspace.id}/confirm-completion`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: isProfessional ? 'professional' : 'customer' })
      });
    } catch { /* local only */ }
    if (bothConfirmed) {
      showMsg('🏆 Project marked as Completed by both parties!');
      window.dispatchEvent(new CustomEvent('project_completed', {
        detail: {
          title: '🏆 Project Completed!',
          desc: `Project "${workspace.project_title}" is officially completed! Both consumer and professional have confirmed completion.`,
          workspace
        }
      }));
    } else {
      showMsg(`✅ Your completion recorded. Waiting for ${isProfessional ? workspace.customer_name : workspace.professional_name} to confirm.`);
    }
    window.dispatchEvent(new Event('refresh_notifications'));
  };

  // ── Professional: Milestone actions ──────────────────────────────────────
  const handleMilestoneStatusChange = async (ms: ProjectMilestone, newStatus: ProjectMilestone['status']) => {
    if (!isProfessional) return; // Guard — only professional
    const pct = newStatus === 'completed' ? 100 : newStatus === 'in_progress' ? Math.max(ms.progress_percentage, 10) : ms.progress_percentage;
    const updated = { ...ms, status: newStatus, progress_percentage: pct };
    setMilestones(prev => prev.map(m => m.id === ms.id ? updated : m));
    // Recalculate overall progress
    const newMilestones = milestones.map(m => m.id === ms.id ? updated : m);
    const avg = Math.round(newMilestones.reduce((s, m) => s + m.progress_percentage, 0) / newMilestones.length);
    setWorkspace(prev => prev ? { ...prev, overall_progress: avg } : prev);
    try {
      await fetch(`${API}/workspaces/${ms.workspace_id}/milestones/${ms.id}/status`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, progress_percentage: pct })
      });
    } catch { /* local only */ }
    const msgs: Record<string, string> = {
      in_progress: `▶ "${ms.name}" started!`,
      submitted_for_review: `🏁 "${ms.name}" submitted for customer review.`,
      delayed: `⚠ "${ms.name}" marked as delayed.`,
      completed: `✅ "${ms.name}" completed!`,
    };
    showMsg(msgs[newStatus] || 'Milestone updated.');
  };

  // ── Professional: Post update ─────────────────────────────────────────────
  const handlePostUpdate = async () => {
    if (!isProfessional || !newUpdate.title.trim() || !workspace) return;
    const upd: ProgressUpdate = {
      id: `upd-${Date.now()}`,
      workspace_id: workspace.id,
      ...newUpdate,
      posted_by: currentUser?.fullName || 'Professional',
      created_at: new Date().toISOString(),
    };
    setUpdates(prev => [upd, ...prev]);
    setWorkspace(prev => prev ? { ...prev, overall_progress: newUpdate.progress_percentage } : prev);
    setNewUpdate({ title: '', description: '', work_in_progress: '', progress_percentage: 0, issues_or_delays: '', next_activities: '' });
    setShowUpdateForm(false);
    try {
      await fetch(`${API}/workspaces/${workspace.id}/updates`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(upd)
      });
    } catch { /* local only */ }
    showMsg('✅ Site update posted! Customer can now view it.');
  };

  // ── Professional: Add milestone ───────────────────────────────────────────
  const handleAddMilestone = async () => {
    if (!isProfessional || !newMilestone.name.trim() || !workspace) return;
    const ms: ProjectMilestone = {
      id: `ms-${Date.now()}`,
      workspace_id: workspace.id,
      ...newMilestone,
      progress_percentage: 0,
      status: 'not_started',
      photos: [],
    };
    setMilestones(prev => [...prev, ms]);
    setNewMilestone({ name: '', description: '', planned_start: '', planned_end: '', payment_amount: 0 });
    setShowMilestoneForm(false);
    try {
      await fetch(`${API}/workspaces/${workspace.id}/milestones`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ms)
      });
    } catch { /* local only */ }
    showMsg('✅ Milestone added to project plan.');
  };

  // ── Customer: Mark payment as paid ───────────────────────────────────────
  const handleMarkPaymentPaid = async (pmt: PaymentMilestone) => {
    if (!isCustomer) return; // Guard — only customer
    if (!paymentRef.trim()) { showMsg('⚠ Please enter a payment reference (UTR/transaction ID).'); return; }
    const updated = { ...pmt, status: 'paid' as const, paid_date: new Date().toISOString().slice(0, 10), reference: paymentRef };
    setPayments(prev => prev.map(p => p.id === pmt.id ? updated : p));
    setWorkspace(prev => {
      if (!prev) return prev;
      const totalPaid = payments.reduce((s, p) => p.id === pmt.id ? s + pmt.amount : p.status === 'paid' ? s + p.amount : s, 0);
      return { ...prev, amount_paid: totalPaid };
    });
    setPayingId(null);
    setPaymentRef('');
    try {
      await fetch(`${API}/workspaces/${pmt.workspace_id}/payments/${pmt.id}/mark-paid`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: paymentRef })
      });
    } catch { /* local only */ }
    showMsg(`✅ Payment of ${fmtINR(pmt.amount)} recorded. Professional notified.`);
  };

  const downloadFile = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.target = '_blank';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  if (!isOpen) return null;

  const ws = workspace;
  const completedMs = milestones.filter(m => m.status === 'completed').length;
  const totalMs = milestones.length;
  const outstanding = ws ? ws.agreed_amount - ws.amount_paid : 0;
  const nextPmt = payments.find(p => p.status === 'pending');
  const myStartConfirmed = ws ? (isProfessional ? ws.start_confirmed_professional : ws.start_confirmed_customer) : false;
  const otherStartConfirmed = ws ? (isProfessional ? ws.start_confirmed_customer : ws.start_confirmed_professional) : false;
  const myCompletionConfirmed = ws ? (isProfessional ? ws.completion_confirmed_professional : ws.completion_confirmed_customer) : false;
  const otherCompletionConfirmed = ws ? (isProfessional ? ws.completion_confirmed_customer : ws.completion_confirmed_professional) : false;
  const otherName = ws ? (isProfessional ? ws.customer_name : ws.professional_name) : '';
  const projectActive = ws?.status === 'active';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col overflow-hidden">

        {/* ── Panel Header ── */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-6 py-5 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-300 bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-500/30 flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5" /> My Projects Progress
            </span>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Workspace Switcher if user has multiple projects */}
          {workspaces.length > 1 && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Switch Project:</span>
              <select
                value={ws?.id}
                onChange={(e) => {
                  const selected = workspaces.find(w => w.id === e.target.value);
                  if (selected) {
                    setWorkspace(selected);
                    loadWorkspaceData(selected.id);
                  }
                }}
                className="bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                {workspaces.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.project_title} ({w.customer_name})
                  </option>
                ))}
              </select>
            </div>
          )}

          {ws && (
            <>
              <h2 className="text-lg font-black leading-snug mt-1">{ws.project_title}</h2>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-300 flex-wrap">
                <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{ws.professional_company}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" />{fmtDate(ws.expected_start_date)} → {fmtDate(ws.expected_completion_date)}</span>
              </div>
              {/* Status pill */}
              <div className="mt-2 flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${ws.status === 'active' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                    ws.status === 'completed' ? 'bg-indigo-400/20 text-indigo-200 border-indigo-400/40' :
                      'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}>
                  {ws.status === 'active' ? '🟢 Active' : ws.status === 'completed' ? '🏆 Completed' : '⏳ Pending Both Approvals'}
                </span>
                {/* Role indicator */}
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${isProfessional ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-indigo-500/20 text-indigo-200 border-indigo-400/40'
                  }`}>
                  {isProfessional ? '🔨 Professional View' : '👤 Customer View'}
                </span>
              </div>
              {/* Progress bar */}
              {projectActive && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400">Overall Progress</span>
                    <span className="font-black text-amber-400">{ws.overall_progress}% Complete</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-700" style={{ width: `${ws.overall_progress}%` }} />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Tab Bar */}
          <div className="flex items-center gap-1 mt-4 overflow-x-auto pb-1">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${activeTab === t.id ? 'bg-amber-500 text-slate-950' : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
                  }`}
              >
                {t.icon}{t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Action Message ── */}
        {actionMsg && (
          <div className="mx-4 mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />{actionMsg}
          </div>
        )}

        {/* ── Tab Content ── */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !ws ? (
            <div className="text-center py-16 px-6">
              <BarChart2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Active Projects</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">Your project workspace appears here once a quotation is approved and both parties confirm work commencement.</p>
            </div>
          ) : (
            <>
              {/* ══════════════ OVERVIEW ══════════════ */}
              {activeTab === 'overview' && (
                <div className="p-6 space-y-5">

                  {/* ── Dual-Approval: Project Start Banner ── */}
                  {ws.status === 'agreement_pending' || (!ws.start_confirmed_professional || !ws.start_confirmed_customer) ? (
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-3">
                      <h3 className="text-sm font-black text-amber-900 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" /> Project Start — Dual Approval Required
                      </h3>
                      <p className="text-xs text-amber-800">Both parties must confirm before work officially begins.</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className={`p-2.5 rounded-xl border text-center text-xs font-bold ${ws.start_confirmed_professional ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-white border-slate-200 text-slate-500'}`}>
                          {ws.start_confirmed_professional ? '✅' : '⏳'} {ws.professional_name}
                          <div className="text-[10px] font-normal mt-0.5">{ws.start_confirmed_professional ? 'Confirmed' : 'Pending'}</div>
                        </div>
                        <div className={`p-2.5 rounded-xl border text-center text-xs font-bold ${ws.start_confirmed_customer ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-white border-slate-200 text-slate-500'}`}>
                          {ws.start_confirmed_customer ? '✅' : '⏳'} {ws.customer_name}
                          <div className="text-[10px] font-normal mt-0.5">{ws.start_confirmed_customer ? 'Confirmed' : 'Pending'}</div>
                        </div>
                      </div>
                      {!myStartConfirmed && (
                        <button onClick={confirmProjectStart} className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl cursor-pointer transition-colors">
                          ✅ Confirm Project Start
                        </button>
                      )}
                      {myStartConfirmed && !otherStartConfirmed && (
                        <div className="text-xs text-amber-700 font-bold text-center bg-amber-100 py-2 rounded-xl">
                          ⏳ Waiting for {otherName} to confirm…
                        </div>
                      )}
                    </div>
                  ) : null}

                  {/* KPI Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                      <div className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">Agreed Value</div>
                      <div className="text-xl font-black text-indigo-900 mt-0.5">{fmtINR(ws.agreed_amount)}</div>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                      <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Amount Paid</div>
                      <div className="text-xl font-black text-emerald-900 mt-0.5">{fmtINR(ws.amount_paid)}</div>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                      <div className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Outstanding</div>
                      <div className="text-xl font-black text-amber-900 mt-0.5">{fmtINR(outstanding)}</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Milestones</div>
                      <div className="text-xl font-black text-slate-900 mt-0.5">{completedMs}/{totalMs}</div>
                    </div>
                  </div>

                  {/* Budget Health / Overbudget Analysis Warning */}
                  <div className={`p-4 rounded-2xl border ${ws.amount_paid > ws.agreed_amount
                      ? 'bg-red-50 border-red-200 text-red-900'
                      : (ws.amount_paid / (ws.agreed_amount || 1)) > (ws.overall_progress / 100 + 0.15) && ws.overall_progress > 0
                        ? 'bg-amber-50 border-amber-200 text-amber-900'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4" /> Budget & Cost Health Tracker
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border bg-white/70">
                        {ws.amount_paid > ws.agreed_amount ? '🚨 Over Budget' : (ws.amount_paid / (ws.agreed_amount || 1)) > (ws.overall_progress / 100 + 0.15) && ws.overall_progress > 0 ? '⚠️ Payment Exceeds Progress' : '✅ Budget on Track'}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed">
                      {ws.amount_paid > ws.agreed_amount
                        ? `Caution: Total payments of ${fmtINR(ws.amount_paid)} have exceeded agreed quotation value (${fmtINR(ws.agreed_amount)}) by ${fmtINR(ws.amount_paid - ws.agreed_amount)}.`
                        : `Agreed budget: ${fmtINR(ws.agreed_amount)}. Paid: ${fmtINR(ws.amount_paid)} (${Math.round((ws.amount_paid / (ws.agreed_amount || 1)) * 100)}%). Milestone Progress: ${ws.overall_progress}%. Project is running within budgeted scope.`}
                    </p>
                  </div>

                  {/* Parties */}
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Project Parties</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center font-black text-amber-700 text-sm">{ws.professional_name[0]}</div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{ws.professional_name}</div>
                        <div className="text-[10px] text-slate-500">{ws.professional_company} · <span className="text-amber-600 font-bold">Professional</span></div>
                      </div>
                      {onOpenChat && isCustomer && (
                        <button onClick={() => onOpenChat(ws.professional_name, 'professional', ws.project_title)} className="ml-auto px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer hover:bg-indigo-700">
                          <MessageSquare className="w-3 h-3" /> Chat
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center font-black text-emerald-700 text-sm">{ws.customer_name[0]}</div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{ws.customer_name}</div>
                        <div className="text-[10px] text-slate-500">Property Owner · <span className="text-emerald-600 font-bold">Customer</span></div>
                      </div>
                      {onOpenChat && isProfessional && (
                        <button onClick={() => onOpenChat(ws.customer_name, 'customer', ws.project_title)} className="ml-auto px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-1 cursor-pointer hover:bg-indigo-700">
                          <MessageSquare className="w-3 h-3" /> Chat
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Latest update snippet */}
                  {updates[0] && (
                    <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Latest Site Update</span>
                        <span className="ml-auto text-[10px] text-slate-400">By {updates[0].posted_by}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-900">{updates[0].title}</p>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">{updates[0].description}</p>
                      <button onClick={() => setActiveTab('updates')} className="text-xs font-bold text-indigo-600 hover:underline mt-1 cursor-pointer">View all updates →</button>
                    </div>
                  )}

                  {/* Next payment */}
                  {nextPmt && (
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                      <div className="text-[10px] text-amber-600 font-bold uppercase tracking-wider mb-1">Next Payment Due</div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-bold text-slate-900">{nextPmt.name}</div>
                          <div className="text-xs text-slate-600">Due: {fmtDate(nextPmt.due_date)}</div>
                        </div>
                        <div className="text-lg font-black text-amber-800">{fmtINR(nextPmt.amount)}</div>
                      </div>
                      {isCustomer && (
                        <button onClick={() => { setActiveTab('payments'); setPayingId(nextPmt.id); }} className="mt-2 w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5" /> Record Payment
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ══════════════ MILESTONES ══════════════ */}
              {activeTab === 'milestones' && (
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">Construction Milestones</h3>
                    {isProfessional ? (
                      <button onClick={() => setShowMilestoneForm(!showMilestoneForm)} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer hover:bg-indigo-700">
                        <Plus className="w-3.5 h-3.5" /> Add Milestone
                      </button>
                    ) : (
                      <ReadOnlyBadge label="Milestones" />
                    )}
                  </div>

                  {/* Info banner for customer */}
                  {isCustomer && (
                    <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-700 flex items-start gap-2">
                      <Eye className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>Your professional manages milestone progress. You can view status and track completion here.</span>
                    </div>
                  )}

                  {/* Add Milestone Form — PROFESSIONAL ONLY */}
                  {showMilestoneForm && isProfessional && (
                    <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-200 space-y-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 mb-1">
                        <Edit3 className="w-3.5 h-3.5" /> New Milestone
                      </div>
                      <input placeholder="Milestone name *" value={newMilestone.name} onChange={e => setNewMilestone(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 text-xs rounded-xl border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
                      <textarea placeholder="Description" rows={2} value={newMilestone.description} onChange={e => setNewMilestone(p => ({ ...p, description: e.target.value }))} className="w-full px-3 py-2 text-xs rounded-xl border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-600 mb-0.5 block">Planned Start</label>
                          <input type="date" value={newMilestone.planned_start} onChange={e => setNewMilestone(p => ({ ...p, planned_start: e.target.value }))} className="w-full px-3 py-2 text-xs rounded-xl border border-indigo-300 focus:ring-2 focus:ring-indigo-500 bg-white" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-600 mb-0.5 block">Planned End</label>
                          <input type="date" value={newMilestone.planned_end} onChange={e => setNewMilestone(p => ({ ...p, planned_end: e.target.value }))} className="w-full px-3 py-2 text-xs rounded-xl border border-indigo-300 focus:ring-2 focus:ring-indigo-500 bg-white" />
                        </div>
                      </div>
                      <input type="number" placeholder="Payment linked to this milestone (₹)" value={newMilestone.payment_amount || ''} onChange={e => setNewMilestone(p => ({ ...p, payment_amount: Number(e.target.value) }))} className="w-full px-3 py-2 text-xs rounded-xl border border-indigo-300 focus:ring-2 focus:ring-indigo-500 bg-white" />
                      <div className="flex gap-2">
                        <button onClick={handleAddMilestone} className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-indigo-700">Save</button>
                        <button onClick={() => setShowMilestoneForm(false)} className="px-4 py-2 bg-white text-slate-700 text-xs font-bold rounded-xl border border-slate-300 cursor-pointer hover:bg-slate-50">Cancel</button>
                      </div>
                    </div>
                  )}

                  {/* Milestone List */}
                  {milestones.map((ms) => {
                    const cfg = milestoneStatusConfig[ms.status];
                    return (
                      <div key={ms.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="text-sm font-bold text-slate-900">{ms.name}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{ms.description}</div>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full border flex items-center gap-1 shrink-0 ${cfg.color}`}>
                            {cfg.icon}{cfg.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] text-slate-500">
                          <span>📅 {fmtDate(ms.planned_start)} → {fmtDate(ms.planned_end)}</span>
                          {ms.payment_amount ? <span className="font-bold text-indigo-700">₹ {(ms.payment_amount / 100000).toFixed(1)}L</span> : null}
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-[10px] mb-1">
                            <span className="text-slate-500">Progress</span>
                            <span className="font-bold text-slate-800">{ms.progress_percentage}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full">
                            <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${ms.progress_percentage}%` }} />
                          </div>
                        </div>

                        {/* Actions — PROFESSIONAL ONLY */}
                        {isProfessional && (
                          <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-slate-100">
                            {ms.status === 'not_started' && (
                              <button onClick={() => handleMilestoneStatusChange(ms, 'in_progress')} className="px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold cursor-pointer hover:bg-amber-100">▶ Start Work</button>
                            )}
                            {ms.status === 'in_progress' && (
                              <>
                                <button onClick={() => handleMilestoneStatusChange(ms, 'submitted_for_review')} className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-800 border border-indigo-200 text-[10px] font-bold cursor-pointer hover:bg-indigo-100">🏁 Submit for Review</button>
                                <button onClick={() => handleMilestoneStatusChange(ms, 'delayed')} className="px-3 py-1 rounded-xl bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold cursor-pointer hover:bg-red-100">⚠ Mark Delayed</button>
                              </>
                            )}
                            {ms.status === 'submitted_for_review' && (
                              <div className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-200">⏳ Awaiting customer approval…</div>
                            )}
                            {ms.status === 'delayed' && (
                              <button onClick={() => handleMilestoneStatusChange(ms, 'in_progress')} className="px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold cursor-pointer hover:bg-amber-100">↩ Resume Work</button>
                            )}
                          </div>
                        )}

                        {/* Customer sees submitted_for_review notice only */}
                        {isCustomer && ms.status === 'submitted_for_review' && (
                          <div className="p-2.5 bg-indigo-50 rounded-xl border border-indigo-200 text-xs text-indigo-700 font-bold flex items-center gap-1.5">
                            <Flag className="w-3.5 h-3.5" /> Professional has submitted this milestone — awaiting your payment confirmation in the Payments tab.
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ══════════════ SITE UPDATES ══════════════ */}
              {activeTab === 'updates' && (
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">Site Progress Updates</h3>
                    {isProfessional ? (
                      <button onClick={() => setShowUpdateForm(!showUpdateForm)} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer hover:bg-indigo-700">
                        <Plus className="w-3.5 h-3.5" /> Post Update
                      </button>
                    ) : (
                      <ReadOnlyBadge label="Updates" />
                    )}
                  </div>

                  {/* Info banner for customer */}
                  {isCustomer && (
                    <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-700 flex items-start gap-2">
                      <Eye className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>Your professional posts site updates here. You can view progress, photos, and any issues reported on-site.</span>
                    </div>
                  )}

                  {/* Post Update Form — PROFESSIONAL ONLY */}
                  {showUpdateForm && isProfessional && (
                    <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-200 space-y-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 mb-1">
                        <Edit3 className="w-3.5 h-3.5" /> New Site Update
                      </div>
                      <input placeholder="Update title *" value={newUpdate.title} onChange={e => setNewUpdate(p => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2 text-xs rounded-xl border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
                      <textarea placeholder="What was completed today?" rows={2} value={newUpdate.description} onChange={e => setNewUpdate(p => ({ ...p, description: e.target.value }))} className="w-full px-3 py-2 text-xs rounded-xl border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
                      <textarea placeholder="Work currently in progress…" rows={2} value={newUpdate.work_in_progress} onChange={e => setNewUpdate(p => ({ ...p, work_in_progress: e.target.value }))} className="w-full px-3 py-2 text-xs rounded-xl border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 mb-1 block">Overall Progress: {newUpdate.progress_percentage}%</label>
                        <input type="range" min={0} max={100} value={newUpdate.progress_percentage} onChange={e => setNewUpdate(p => ({ ...p, progress_percentage: Number(e.target.value) }))} className="w-full accent-indigo-600" />
                      </div>
                      <textarea placeholder="Issues or delays (if any)" rows={2} value={newUpdate.issues_or_delays} onChange={e => setNewUpdate(p => ({ ...p, issues_or_delays: e.target.value }))} className="w-full px-3 py-2 text-xs rounded-xl border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
                      <textarea placeholder="Next planned activities" rows={2} value={newUpdate.next_activities} onChange={e => setNewUpdate(p => ({ ...p, next_activities: e.target.value }))} className="w-full px-3 py-2 text-xs rounded-xl border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white" />
                      <div className="flex gap-2">
                        <button onClick={handlePostUpdate} className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-indigo-700 flex items-center gap-1"><Send className="w-3 h-3" /> Post Update</button>
                        <button onClick={() => setShowUpdateForm(false)} className="px-4 py-2 bg-white text-slate-700 text-xs font-bold rounded-xl border border-slate-300 cursor-pointer hover:bg-slate-50">Cancel</button>
                      </div>
                    </div>
                  )}

                  {/* Update Cards — VIEW ONLY for customer */}
                  {updates.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                      <TrendingUp className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">{isProfessional ? 'No updates posted yet. Post your first site update above.' : 'No site updates posted by your professional yet.'}</p>
                    </div>
                  ) : (
                    updates.map((upd) => (
                      <div key={upd.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-sm font-bold text-slate-900">{upd.title}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">By {upd.posted_by} · {fmtDate(upd.created_at)}</div>
                          </div>
                          <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-200 shrink-0">{upd.progress_percentage}%</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">{upd.description}</p>
                        {upd.work_in_progress && (
                          <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-900">
                            <span className="font-bold">🔨 In Progress: </span>{upd.work_in_progress}
                          </div>
                        )}
                        {upd.photos && upd.photos.length > 0 && (
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {upd.photos.map((photo, i) => (
                              <img key={i} src={photo} alt={`Site photo ${i + 1}`} className="w-24 h-20 object-cover rounded-xl shrink-0 border border-slate-200" />
                            ))}
                          </div>
                        )}
                        {upd.issues_or_delays && (
                          <div className="p-2.5 bg-red-50 rounded-xl border border-red-100 text-xs text-red-800">
                            <span className="font-bold">⚠ Issues: </span>{upd.issues_or_delays}
                          </div>
                        )}
                        {upd.next_activities && (
                          <div className="text-xs text-slate-600"><span className="font-bold">📋 Next: </span>{upd.next_activities}</div>
                        )}
                        {/* Expand button */}
                        <button onClick={() => setExpandedUpdate(expandedUpdate === upd.id ? null : upd.id)} className="text-xs text-indigo-500 font-semibold flex items-center gap-1 cursor-pointer hover:text-indigo-700">
                          {expandedUpdate === upd.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          {expandedUpdate === upd.id ? 'Hide Details' : 'More Details'}
                        </button>
                        {expandedUpdate === upd.id && (
                          <div className="pt-2 border-t border-slate-100 text-xs text-slate-500">
                            <span className="font-bold">Posted: </span>{new Date(upd.created_at).toLocaleString('en-IN')}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* ══════════════ PAYMENTS ══════════════ */}
              {activeTab === 'payments' && (
                <div className="p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">Payment Schedule</h3>
                    {isProfessional ? (
                      <ReadOnlyBadge label="Payments" />
                    ) : (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5" /> You can record payments
                      </span>
                    )}
                  </div>

                  {/* Info banner for professional */}
                  {isProfessional && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-2">
                      <Eye className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>Your customer manages and records payments. You can view the payment status and reference details here.</span>
                    </div>
                  )}

                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-center">
                      <div className="text-[10px] text-indigo-500 font-bold uppercase">Total</div>
                      <div className="text-sm font-black text-indigo-900">{fmtINR(ws.agreed_amount)}</div>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                      <div className="text-[10px] text-emerald-600 font-bold uppercase">Paid</div>
                      <div className="text-sm font-black text-emerald-900">{fmtINR(ws.amount_paid)}</div>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-center">
                      <div className="text-[10px] text-amber-600 font-bold uppercase">Due</div>
                      <div className="text-sm font-black text-amber-900">{fmtINR(outstanding)}</div>
                    </div>
                  </div>

                  {/* Payment Milestones */}
                  <div className="space-y-3">
                    {payments.map((pmt) => {
                      const cfg = paymentStatusConfig[pmt.status];
                      const isBeingPaid = payingId === pmt.id;
                      return (
                        <div key={pmt.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div className="flex-1">
                              <div className="text-sm font-bold text-slate-900">{pmt.name}</div>
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                Due: {fmtDate(pmt.due_date)}
                                {pmt.paid_date && <span className="text-emerald-600 font-bold"> · Paid: {fmtDate(pmt.paid_date)}</span>}
                                {pmt.reference && <span className="text-slate-400"> · Ref: {pmt.reference}</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${cfg.color}`}>{cfg.label}</span>
                              <span className="text-sm font-black text-slate-900">{fmtINR(pmt.amount)}</span>
                            </div>
                          </div>

                          {/* Customer: Mark as Paid button */}
                          {isCustomer && pmt.status !== 'paid' && (
                            <>
                              {!isBeingPaid ? (
                                <button onClick={() => setPayingId(pmt.id)} className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors flex items-center justify-center gap-1.5">
                                  <CreditCard className="w-3.5 h-3.5" /> Record Payment of {fmtINR(pmt.amount)}
                                </button>
                              ) : (
                                <div className="space-y-2">
                                  <input
                                    placeholder="Enter UTR / Transaction ID / Reference *"
                                    value={paymentRef}
                                    onChange={e => setPaymentRef(e.target.value)}
                                    className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                                  />
                                  <div className="flex gap-2">
                                    <button onClick={() => handleMarkPaymentPaid(pmt)} className="flex-1 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-emerald-700">✅ Confirm Payment</button>
                                    <button onClick={() => { setPayingId(null); setPaymentRef(''); }} className="px-4 py-2 bg-white text-slate-700 text-xs font-bold rounded-xl border border-slate-300 cursor-pointer hover:bg-slate-50">Cancel</button>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ══════════════ DOCUMENTS ══════════════ */}
              {activeTab === 'documents' && (
                <div className="p-6 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">Project Documents</h3>
                  {documents.map((doc) => (
                    <div key={doc.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                        <Paperclip className="w-5 h-5 text-indigo-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">{doc.filename}</div>
                        <div className="text-[10px] text-slate-500">{doc.category} · By {doc.uploader} · {fmtDate(doc.uploaded_at)}</div>
                      </div>
                      <button onClick={() => downloadFile(doc.url, doc.filename)} className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-indigo-700 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer shrink-0">
                        <Download className="w-3.5 h-3.5" /> Download
                      </button>
                    </div>
                  ))}
                  {documents.length === 0 && (
                    <div className="text-center py-10 text-slate-400">
                      <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">No documents yet.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ══════════════ COMPLETION ══════════════ */}
              {activeTab === 'completion' && (
                <div className="p-6 space-y-5">

                  {/* Handover Checklist */}
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Final Handover Checklist</h3>
                    {[
                      { label: 'All milestones completed & approved', done: completedMs === totalMs && totalMs > 0 },
                      { label: 'All payments settled by customer', done: payments.every(p => p.status === 'paid') },
                      { label: 'Work agreement documents uploaded', done: documents.length > 0 },
                      { label: 'Site progress updates submitted', done: updates.length > 0 },
                      { label: `${ws.professional_name} confirmed completion`, done: ws.completion_confirmed_professional },
                      { label: `${ws.customer_name} confirmed completion`, done: ws.completion_confirmed_customer },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        {item.done
                          ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          : <Clock className="w-4 h-4 text-slate-400 shrink-0" />}
                        <span className={item.done ? 'text-emerald-800 font-bold' : 'text-slate-600'}>{item.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Dual-approval: Confirm Completion */}
                  <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-200 space-y-3">
                    <h3 className="text-sm font-black text-indigo-900 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" /> Project Completion — Both Must Confirm
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className={`p-2.5 rounded-xl border text-center text-xs font-bold ${ws.completion_confirmed_professional ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-white border-slate-200 text-slate-500'}`}>
                        {ws.completion_confirmed_professional ? '✅' : '⏳'} {ws.professional_name}
                        <div className="text-[10px] font-normal mt-0.5">{ws.completion_confirmed_professional ? 'Confirmed' : 'Pending'}</div>
                      </div>
                      <div className={`p-2.5 rounded-xl border text-center text-xs font-bold ${ws.completion_confirmed_customer ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-white border-slate-200 text-slate-500'}`}>
                        {ws.completion_confirmed_customer ? '✅' : '⏳'} {ws.customer_name}
                        <div className="text-[10px] font-normal mt-0.5">{ws.completion_confirmed_customer ? 'Confirmed' : 'Pending'}</div>
                      </div>
                    </div>
                    {!myCompletionConfirmed ? (
                      <button onClick={confirmCompletion} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl cursor-pointer transition-colors">
                        ✅ Confirm Project Completion
                      </button>
                    ) : !otherCompletionConfirmed ? (
                      <div className="text-xs text-indigo-700 font-bold text-center bg-indigo-100 py-2 rounded-xl">
                        ⏳ Waiting for {otherName} to confirm completion…
                      </div>
                    ) : (
                      <div className="text-center p-3 bg-emerald-100 border border-emerald-200 rounded-xl">
                        <p className="text-sm font-black text-emerald-800">🏆 Project Successfully Completed!</p>
                        <p className="text-xs text-emerald-600 mt-0.5">Both parties have confirmed the handover.</p>
                      </div>
                    )}
                  </div>

                  {/* Customer: Rating section */}
                  {isCustomer && !feedbackSent && (
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-3">
                      <h3 className="text-sm font-bold text-slate-900">Rate & Review {ws.professional_name}</h3>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(s => (
                          <button key={s} onClick={() => setRating(s)} className={`text-2xl cursor-pointer transition-transform hover:scale-110 ${s <= rating ? 'opacity-100' : 'opacity-30'}`}>⭐</button>
                        ))}
                        <span className="text-xs font-bold text-slate-700 ml-2">{rating}/5</span>
                      </div>
                      <textarea rows={3} placeholder="Share your experience with this professional…" value={feedbackText} onChange={e => setFeedbackText(e.target.value)} className="w-full px-3 py-2 text-xs rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white" />
                      <button onClick={() => { setFeedbackSent(true); showMsg('✅ Thank you for your review!'); }} className="px-4 py-2 bg-amber-500 text-slate-950 text-xs font-bold rounded-xl cursor-pointer hover:bg-amber-600 flex items-center gap-1">
                        <Send className="w-3.5 h-3.5" /> Submit Review
                      </button>
                    </div>
                  )}
                  {feedbackSent && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                      <p className="text-sm font-bold text-emerald-800">Review submitted! Thank you.</p>
                    </div>
                  )}

                  {/* Professional note */}
                  {isProfessional && (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600">
                      <p className="font-bold">📋 Professional Note</p>
                      <p className="mt-1">Once both parties confirm handover, this project will be archived in your portfolio automatically.</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
