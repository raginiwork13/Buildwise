import React, { useState, useEffect } from 'react';
import { 
  FolderKanban, Plus, Search, MapPin, IndianRupee, Calendar, 
  Layers, CheckCircle2, User, Building2, X, Filter, 
  FileText, MessageSquare, Check, ArrowRight, ThumbsUp, BarChart2, ShieldCheck
} from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { OlxChatDrawer } from '../../components/chat/OlxChatDrawer';
import type { ChatTarget } from '../../components/chat/OlxChatDrawer';
import { QuotationsDashboardModal } from '../../components/quotations/QuotationsDashboardModal';
import { SendQuotationModal } from '../../components/quotations/SendQuotationModal';
import { MyProjectsPanel } from '../../components/projects/MyProjectsPanel';
import { ProjectApprovalsModal } from '../../components/quotations/ProjectApprovalsModal';

interface ProjectItem {
  id: string;
  customer_name: string;
  customer_type?: string;
  title: string;
  description: string;
  category: string;
  location_address: string;
  district: string;
  city: string;
  built_up_area_sqft: number;
  floors_count: number;
  estimated_budget: number;
  required_services: string[];
  preferred_timeline_months: number;
  status: string;
  enquiries_count: number;
  created_at?: string;
  
  // Comprehensive Section fields
  property_type?: string;
  project_type?: string;
  project_stage?: string;
  plot_area_sqft?: number;
  bedrooms_count?: number;
  bathrooms_count?: number;
  parking_requirement?: string;
  min_budget?: number;
  max_budget?: number;
  budget_flexibility?: string;
  materials_included?: string;
  labour_included?: string;
  urgency?: string;
}

export const CustomerProjectsPage: React.FC = () => {
  const { currentUser, role, setOpenRegisterModal, setSelectedRoleForModal } = useUser();
  const isProfessional = role === 'professional';
  const isCustomer = role === 'customer';
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modals state
  const [showQuotationsModal, setShowQuotationsModal] = useState(false);
  const [showChatDrawer, setShowChatDrawer] = useState(false);
  const [chatTarget, setChatTarget] = useState<ChatTarget | null>(null);
  const [showSendQuotationModal, setShowSendQuotationModal] = useState(false);
  const [selectedProjectForQuotation, setSelectedProjectForQuotation] = useState<ProjectItem | null>(null);
  const [interestedProjects, setInterestedProjects] = useState<Record<string, boolean>>({});
  const [interestFeedback, setInterestFeedback] = useState<string | null>(null);
  const [showMyProjectsPanel, setShowMyProjectsPanel] = useState(false);
  const [selectedWorkspaceIdForPanel, setSelectedWorkspaceIdForPanel] = useState<string | undefined>(undefined);
  const [showProjectApprovalsModal, setShowProjectApprovalsModal] = useState(false);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(1);

  // Comprehensive Project Creation Modal state
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [submittingProject, setSubmittingProject] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form state matching user's Sections A through F
  const [newProject, setNewProject] = useState({
    // Section A: Basic project information
    title: '',
    category: 'new_residential',
    project_type: 'New construction',
    property_type: 'Villa',
    description: '',
    project_stage: 'Ready for construction',

    // Section B: Location
    state: 'Goa',
    district: 'North Goa',
    city: 'Assagao',
    pincode: '403507',
    location_address: '',
    site_accessibility: 'Easily accessible',

    // Section C: Dimensions & specs
    plot_area_sqft: 3500,
    built_up_area_sqft: 2800,
    floors_count: 2,
    bedrooms_count: 3,
    bathrooms_count: 3,
    parking_requirement: 'Yes, 2 cars',
    construction_style: 'Contemporary Portuguese',
    structural_requirements: 'RCC Framed',

    // Section D: Budget
    min_budget: 3500000,
    max_budget: 5000000,
    budget_flexibility: 'Negotiable',
    materials_included: 'Yes',
    labour_included: 'Yes',

    // Section E: Required professionals checklist
    required_services: ['General Contractor', 'Architect', 'Civil Engineer', 'Interior Designer'] as string[],

    // Section F: Timeline
    preferred_timeline_months: 8,
    urgency: 'Within 3 months'
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      console.warn('Failed to fetch projects from backend:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInterestClick = async (proj: ProjectItem) => {
    const isAlready = interestedProjects[proj.id];
    if (isAlready) return;

    try {
      await fetch('http://localhost:8000/api/v1/interests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: proj.id,
          project_title: proj.title,
          provider_id: currentUser?.id || 'prof-carlos-1',
          provider_name: currentUser?.fullName || 'Carlos Fernandes',
          provider_role: currentUser?.role || 'professional',
          provider_company: currentUser?.companyName || currentUser?.businessName || 'Fernandes & Sons Civil Construction',
          message: `Interested in executing ${proj.title}`
        })
      });
    } catch (err) {
      console.warn('Interest submitted locally:', err);
    }

    setInterestedProjects(prev => ({ ...prev, [proj.id]: true }));
    setProjects(prev => prev.map(p => p.id === proj.id ? { ...p, enquiries_count: p.enquiries_count + 1 } : p));
    setInterestFeedback(`Interest submitted to ${proj.customer_name}! They have been notified.`);
    setTimeout(() => setInterestFeedback(null), 3500);
  };

  const handleOpenChatForProject = (proj: ProjectItem) => {
    setChatTarget({
      recipientId: `cust-${proj.customer_name.toLowerCase().replace(/\s+/g, '-')}`,
      recipientName: proj.customer_name,
      recipientRole: 'customer',
      projectId: proj.id,
      projectTitle: proj.title
    });
    setShowChatDrawer(true);
  };

  const handleOpenChatFromQuotations = (providerName: string, providerRole: string, projectTitle: string) => {
    setShowQuotationsModal(false);
    setChatTarget({
      recipientId: `prov-${providerName.toLowerCase().replace(/\s+/g, '-')}`,
      recipientName: providerName,
      recipientRole: providerRole,
      projectTitle: projectTitle
    });
    setShowChatDrawer(true);
  };

  const toggleService = (srv: string) => {
    setNewProject(prev => {
      const exists = prev.required_services.includes(srv);
      if (exists) {
        return { ...prev, required_services: prev.required_services.filter(s => s !== srv) };
      } else {
        return { ...prev, required_services: [...prev.required_services, srv] };
      }
    });
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title.trim() || !newProject.description.trim()) return;

    setSubmittingProject(true);
    try {
      const payload = {
        ...newProject,
        customer_name: currentUser?.fullName || 'Homeowner',
        customer_type: 'Individual / Homeowner',
        estimated_budget: newProject.max_budget || 4500000
      };

      const res = await fetch('http://localhost:8000/api/v1/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const created = await res.json();
        setProjects(prev => [created, ...prev]);
        setShowNewProjectModal(false);
        setCurrentStep(1);
      }
    } catch (err) {
      console.error('Error creating project:', err);
    } finally {
      setSubmittingProject(false);
    }
  };

  const categoryLabels: Record<string, string> = {
    new_residential: 'Residential',
    renovation: 'Renovation',
    commercial: 'Commercial',
    interior_design: 'Interior Design',
    structural_work: 'Structural Work'
  };

  const filteredProjects = projects.filter(p => {
    if (districtFilter !== 'all' && p.district !== districtFilter) return false;
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchCity = p.city.toLowerCase().includes(q);
      const matchCust = p.customer_name.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchCity || matchCust;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-indigo-900/40 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-300 bg-indigo-500/20 px-3.5 py-1 rounded-full border border-indigo-500/30 inline-flex items-center gap-1.5 mb-3">
              <FolderKanban className="w-3.5 h-3.5" /> Customer Projects Marketplace
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Live Construction & Renovation Projects in Goa
            </h1>
            <p className="text-slate-300 text-sm sm:text-base mt-3 leading-relaxed">
              Explore real-time project requirements posted by verified homeowners, developers, and hospitality businesses across North & South Goa. Contractors and architects can bid directly.
            </p>

            {/* ACTION BUTTONS: Post a Project + Quotations Received */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  if (!currentUser) {
                    setSelectedRoleForModal('customer');
                    setOpenRegisterModal(true);
                  } else {
                    setShowNewProjectModal(true);
                  }
                }}
                className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Post a New Project (Free)</span>
              </button>

              {/* Quotations Received button only visible to Customers */}
              {isCustomer && (
                <button
                  onClick={() => setShowQuotationsModal(true)}
                  className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all backdrop-blur-sm cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>Quotations Received</span>
                  <span className="ml-1 bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                    3
                  </span>
                </button>
              )}

              {/* My Projects Progress — visible to both customers and professionals */}
              <button
                onClick={() => setShowMyProjectsPanel(true)}
                className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <BarChart2 className="w-4 h-4" />
                <span>My Projects Progress</span>
                <span className="ml-1 bg-white/20 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border border-white/30">
                  1
                </span>
              </button>

              <button
                onClick={() => setShowChatDrawer(true)}
                className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Open Messenger</span>
              </button>

              {/* Project Approvals button — strictly for Professionals near Open Messenger */}
              {isProfessional && (
                <button
                  onClick={() => setShowProjectApprovalsModal(true)}
                  className="px-5 py-3 rounded-xl bg-indigo-900/80 hover:bg-indigo-800 text-amber-300 border border-amber-500/40 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-md cursor-pointer backdrop-blur-sm"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Project Approvals</span>
                  {pendingApprovalsCount > 0 ? (
                    <span className="ml-1 bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
                      {pendingApprovalsCount}
                    </span>
                  ) : (
                    <span className="ml-1 text-slate-400 text-[10px] font-bold">
                      (0)
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {interestFeedback && (
          <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-2xl border border-emerald-200 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{interestFeedback}</span>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search villa, renovation, Assagao, Panaji..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-semibold text-slate-500">District:</span>
              <select
                value={districtFilter}
                onChange={e => setDistrictFilter(e.target.value)}
                className="px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Goa</option>
                <option value="North Goa">North Goa</option>
                <option value="South Goa">South Goa</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500">Category:</span>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Categories</option>
                <option value="new_residential">Residential</option>
                <option value="renovation">Renovation</option>
                <option value="commercial">Commercial</option>
                <option value="interior_design">Interior Design</option>
                <option value="structural_work">Structural Work</option>
              </select>
            </div>
          </div>
        </div>

        {/* Project Cards Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-medium text-slate-500">Loading customer projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
            <FolderKanban className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900">No Projects Found</h3>
            <p className="text-xs text-slate-500 mt-1">Try resetting your filters or post the first project in this category.</p>
            <button
              onClick={() => { setSearchQuery(''); setDistrictFilter('all'); setCategoryFilter('all'); }}
              className="mt-4 px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredProjects.map((proj) => {
              const formattedBudget = new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0
              }).format(proj.estimated_budget);

              const hasExpressedInterest = interestedProjects[proj.id];

              return (
                <div
                  key={proj.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                >
                  <div className="p-6 space-y-4">
                    
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-200">
                          {categoryLabels[proj.category] || proj.category}
                        </span>
                        <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Receiving Enquiries
                        </span>
                      </div>

                      <div className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
                        {proj.enquiries_count} Proposals / Bids
                      </div>
                    </div>

                    {/* Title & Customer */}
                    <div>
                      <h3 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                        {proj.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {proj.customer_name}
                        </span>
                        <span>•</span>
                        <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded text-[10px]">
                          {proj.customer_type || 'Homeowner'}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {proj.description}
                    </p>

                    {/* Project Highlights Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                      <div className="p-2 bg-slate-50 rounded-xl">
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <IndianRupee className="w-3 h-3" /> Est. Budget
                        </div>
                        <div className="font-extrabold text-slate-900 mt-0.5">{formattedBudget}</div>
                      </div>

                      <div className="p-2 bg-slate-50 rounded-xl">
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Layers className="w-3 h-3" /> Area
                        </div>
                        <div className="font-bold text-slate-900 mt-0.5">{proj.built_up_area_sqft} sq.ft</div>
                      </div>

                      <div className="p-2 bg-slate-50 rounded-xl">
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> Floors
                        </div>
                        <div className="font-bold text-slate-900 mt-0.5">{proj.floors_count} {proj.floors_count === 1 ? 'Floor' : 'Floors'}</div>
                      </div>

                      <div className="p-2 bg-slate-50 rounded-xl">
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Timeline
                        </div>
                        <div className="font-bold text-slate-900 mt-0.5">{proj.preferred_timeline_months} Months</div>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-800">{proj.city}, {proj.district}</span>
                      <span className="text-slate-400">({proj.location_address})</span>
                    </div>

                    {/* Required Services Tags */}
                    {proj.required_services && proj.required_services.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {proj.required_services.map((srv, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-medium bg-indigo-50/70 text-indigo-800 px-2 py-0.5 rounded-md border border-indigo-100"
                          >
                            {srv}
                          </span>
                        ))}
                      </div>
                    )}

                  </div>

                  {/* Card Action Footer: INTERESTED + SEND QUOTATION + CHAT */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                    
                    {/* Interested Button */}
                    <button
                      onClick={() => handleInterestClick(proj)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        hasExpressedInterest
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{hasExpressedInterest ? 'Interested Sent' : 'Interested'}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {/* Chat Button (takes to chat with that user) */}
                      <button
                        onClick={() => handleOpenChatForProject(proj)}
                        className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Chat</span>
                      </button>

                      {/* Send Quotation Button (Strictly for Verified Professionals) */}
                      {isProfessional && (
                        <button
                          onClick={() => {
                            setSelectedProjectForQuotation(proj);
                            setShowSendQuotationModal(true);
                          }}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Send Quotation</span>
                        </button>
                      )}
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* --- MODAL 1: COMPREHENSIVE PROJECT CREATION FORM (Sections A - F) --- */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white relative shrink-0">
              <button 
                onClick={() => setShowNewProjectModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/20 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                Post Construction Requirements
              </span>
              <h2 className="text-2xl font-black tracking-tight mt-1.5">Create & List Your Project</h2>
              <p className="text-slate-300 text-xs mt-0.5">Enter project dimensions, budget, location, and required contractors across Goa.</p>
              
              {/* Step Navigation Tabs */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className={`px-3 py-1 rounded-lg cursor-pointer ${currentStep === 1 ? 'bg-amber-500 text-slate-950' : 'bg-white/10 text-slate-300 hover:text-white'}`}
                >
                  1. Basic & Location
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className={`px-3 py-1 rounded-lg cursor-pointer ${currentStep === 2 ? 'bg-amber-500 text-slate-950' : 'bg-white/10 text-slate-300 hover:text-white'}`}
                >
                  2. Specs & Dimensions
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className={`px-3 py-1 rounded-lg cursor-pointer ${currentStep === 3 ? 'bg-amber-500 text-slate-950' : 'bg-white/10 text-slate-300 hover:text-white'}`}
                >
                  3. Budget & Financials
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className={`px-3 py-1 rounded-lg cursor-pointer ${currentStep === 4 ? 'bg-amber-500 text-slate-950' : 'bg-white/10 text-slate-300 hover:text-white'}`}
                >
                  4. Professionals & Timeline
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateProject} className="p-6 space-y-5 overflow-y-auto flex-1">
              
              {/* STEP 1: Basic Project Info (Section A) & Location (Section B) */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-2">
                    <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Section A: Basic Project Information</h3>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Project Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Two-storey residential house with swimming pool"
                      value={newProject.title}
                      onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Project Category</label>
                      <select
                        value={newProject.category}
                        onChange={e => setNewProject({ ...newProject, category: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="new_residential">Residential</option>
                        <option value="commercial">Commercial</option>
                        <option value="renovation">Industrial / Heritage</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Project Type</label>
                      <select
                        value={newProject.project_type}
                        onChange={e => setNewProject({ ...newProject, project_type: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="New construction">New construction</option>
                        <option value="Renovation">Renovation</option>
                        <option value="Extension">Extension</option>
                        <option value="Repair">Repair</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Property Type</label>
                      <select
                        value={newProject.property_type}
                        onChange={e => setNewProject({ ...newProject, property_type: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Villa">Villa</option>
                        <option value="Independent house">Independent house</option>
                        <option value="Apartment">Apartment</option>
                        <option value="Office">Office</option>
                        <option value="Shop">Shop</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Project Description *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Describe your requirements: e.g. Two-storey house with parking, garden, double-height living room..."
                      value={newProject.description}
                      onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="border-b border-slate-100 pb-2 pt-2">
                    <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Section B: Project Location in Goa</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">District</label>
                      <select
                        value={newProject.district}
                        onChange={e => setNewProject({ ...newProject, district: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="North Goa">North Goa</option>
                        <option value="South Goa">South Goa</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">City / Village *</label>
                      <input
                        type="text"
                        required
                        placeholder="Margao, Panaji, Assagao"
                        value={newProject.city}
                        onChange={e => setNewProject({ ...newProject, city: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">PIN Code</label>
                      <input
                        type="text"
                        placeholder="403601"
                        value={newProject.pincode}
                        onChange={e => setNewProject({ ...newProject, pincode: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Site Address (optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Near Station Road, Borda, Margao, Goa"
                      value={newProject.location_address}
                      onChange={e => setNewProject({ ...newProject, location_address: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Next: Dimensions & Specs</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Dimensions & Specifications (Section C) */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-2">
                    <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Section C: Project Dimensions & Specifications</h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Plot Area (sq.ft)</label>
                      <input
                        type="number"
                        value={newProject.plot_area_sqft}
                        onChange={e => setNewProject({ ...newProject, plot_area_sqft: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Construction Area (sq.ft) *</label>
                      <input
                        type="number"
                        required
                        value={newProject.built_up_area_sqft}
                        onChange={e => setNewProject({ ...newProject, built_up_area_sqft: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Floors</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={newProject.floors_count}
                        onChange={e => setNewProject({ ...newProject, floors_count: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Bedrooms</label>
                      <input
                        type="number"
                        min="1"
                        value={newProject.bedrooms_count}
                        onChange={e => setNewProject({ ...newProject, bedrooms_count: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Parking Requirement</label>
                      <input
                        type="text"
                        placeholder="Yes, 2 cars"
                        value={newProject.parking_requirement}
                        onChange={e => setNewProject({ ...newProject, parking_requirement: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Construction Style</label>
                      <select
                        value={newProject.construction_style}
                        onChange={e => setNewProject({ ...newProject, construction_style: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Contemporary Portuguese">Contemporary Portuguese</option>
                        <option value="Modern Minimalist">Modern Minimalist</option>
                        <option value="Traditional Goan">Traditional Goan</option>
                        <option value="Tropical Biophilic">Tropical Biophilic</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Structural Requirements</label>
                      <select
                        value={newProject.structural_requirements}
                        onChange={e => setNewProject({ ...newProject, structural_requirements: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="RCC Framed">RCC Framed</option>
                        <option value="Steel Composite">Steel Composite</option>
                        <option value="Load-bearing Laterite">Load-bearing Laterite</option>
                        <option value="Not decided">Not decided</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Next: Budget & Financials</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Budget and Financial Information (Section D) */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-2">
                    <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Section D: Budget & Financial Information</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum Budget (₹)</label>
                      <input
                        type="number"
                        step="50000"
                        value={newProject.min_budget}
                        onChange={e => setNewProject({ ...newProject, min_budget: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Maximum Budget (₹) *</label>
                      <input
                        type="number"
                        required
                        step="50000"
                        value={newProject.max_budget}
                        onChange={e => setNewProject({ ...newProject, max_budget: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Budget Flexibility</label>
                      <select
                        value={newProject.budget_flexibility}
                        onChange={e => setNewProject({ ...newProject, budget_flexibility: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Negotiable">Negotiable</option>
                        <option value="Fixed">Fixed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Includes Materials?</label>
                      <select
                        value={newProject.materials_included}
                        onChange={e => setNewProject({ ...newProject, materials_included: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No (Labour only)</option>
                        <option value="Not decided">Not decided</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Includes Labour?</label>
                      <select
                        value={newProject.labour_included}
                        onChange={e => setNewProject({ ...newProject, labour_included: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Next: Select Professionals</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Professionals Checklist & Timeline (Sections E & F) */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-2">
                    <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Which professionals are you looking for?</h3>
                    <p className="text-xs text-slate-500">Select all services required for your project.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      'Architect',
                      'Civil Engineer',
                      'Structural Engineer',
                      'General Contractor',
                      'Interior Designer',
                      'Electrical Contractor',
                      'Plumbing Contractor',
                      'Landscape Designer',
                      'Renovation Specialist',
                      'Project Management Consultant'
                    ].map((prof) => {
                      const isChecked = newProject.required_services.includes(prof);
                      return (
                        <div
                          key={prof}
                          onClick={() => toggleService(prof)}
                          className={`p-3 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                            isChecked
                              ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-bold'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <span className="text-xs">{prof}</span>
                          <div className={`w-4 h-4 rounded flex items-center justify-center ${isChecked ? 'bg-indigo-600 text-white' : 'border border-slate-300'}`}>
                            {isChecked && <Check className="w-3 h-3" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-b border-slate-100 pb-2 pt-2">
                    <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Section F: Timeline & Urgency</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Timeline (Months)</label>
                      <input
                        type="number"
                        min="1"
                        value={newProject.preferred_timeline_months}
                        onChange={e => setNewProject({ ...newProject, preferred_timeline_months: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Project Urgency</label>
                      <select
                        value={newProject.urgency}
                        onChange={e => setNewProject({ ...newProject, urgency: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Immediate">Immediate</option>
                        <option value="Within 3 months">Within 3 months</option>
                        <option value="Within 6 months">Within 6 months</option>
                        <option value="Flexible">Flexible</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-between pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={submittingProject}
                      className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{submittingProject ? 'Publishing Project...' : 'Publish Project to Marketplace'}</span>
                    </button>
                  </div>
                </div>
              )}

            </form>

          </div>
        </div>
      )}

      {/* --- MODAL 2: SEND QUOTATION MODAL --- */}
      {showSendQuotationModal && selectedProjectForQuotation && (
        <SendQuotationModal
          isOpen={showSendQuotationModal}
          onClose={() => setShowSendQuotationModal(false)}
          project={selectedProjectForQuotation}
          onSuccess={() => {
            setInterestFeedback(`Quotation submitted successfully for ${selectedProjectForQuotation.title}!`);
            setTimeout(() => setInterestFeedback(null), 4000);
          }}
        />
      )}

      {/* --- MODAL 3: CUSTOMER QUOTATIONS DASHBOARD MODAL --- */}
      {showQuotationsModal && (
        <QuotationsDashboardModal
          isOpen={showQuotationsModal}
          onClose={() => setShowQuotationsModal(false)}
          onOpenChatWithProvider={handleOpenChatFromQuotations}
        />
      )}

      {/* --- MODAL 4: OLX / WHATSAPP REAL-TIME CHAT DRAWER --- */}
      {showChatDrawer && (
        <OlxChatDrawer
          isOpen={showChatDrawer}
          onClose={() => setShowChatDrawer(false)}
          initialTarget={chatTarget}
        />
      )}

      {/* --- FLOATING MESSENGER TRIGGER AT RIGHTMOST CORNER --- */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setShowChatDrawer(true)}
          className="p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-2xl hover:scale-105 transition-all flex items-center justify-center relative cursor-pointer group"
          title="Open Messenger (Chat with Customers & Professionals)"
        >
          <MessageSquare className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
            2
          </span>
          <span className="absolute right-full mr-3 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg pointer-events-none">
            Live Chat Messenger
          </span>
        </button>
      </div>

      {/* --- MY PROJECTS PROGRESS PANEL --- */}
      <MyProjectsPanel
        isOpen={showMyProjectsPanel}
        onClose={() => {
          setShowMyProjectsPanel(false);
          setSelectedWorkspaceIdForPanel(undefined);
        }}
        targetWorkspaceId={selectedWorkspaceIdForPanel}
        onOpenChat={(name, role, projectTitle) => {
          setShowMyProjectsPanel(false);
          setChatTarget({
            recipientId: `prov-${name.toLowerCase().replace(/\s+/g, '-')}`,
            recipientName: name,
            recipientRole: role,
            projectTitle
          });
          setShowChatDrawer(true);
        }}
      />

      {/* --- PROJECT APPROVALS MODAL (PROFESSIONAL ONLY) --- */}
      <ProjectApprovalsModal
        isOpen={showProjectApprovalsModal}
        onClose={() => setShowProjectApprovalsModal(false)}
        onOpenMyProjects={(wsId) => {
          if (wsId) setSelectedWorkspaceIdForPanel(wsId);
          setShowMyProjectsPanel(true);
        }}
        onApprovalsCountChange={(count) => setPendingApprovalsCount(count)}
      />

    </div>
  );
};
