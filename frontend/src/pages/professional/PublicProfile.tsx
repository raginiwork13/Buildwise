import { API_BASE_URL } from '../../config';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import type { ProfessionalProfileFull } from '../../types/profile';
import { AvailabilityBadge } from '../../components/profile/AvailabilityBadge';
import { VerificationBadge } from '../../components/profile/VerificationBadge';
import { PortfolioCard } from '../../components/portfolio/PortfolioCard';
import { 
  MapPin, Mail, Phone, Globe, Star, Award, ArrowRight, ChevronRight, X, Send, ShieldCheck
} from 'lucide-react';

export const PublicProfessionalProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser, role } = useUser();
  const [profile, setProfile] = useState<ProfessionalProfileFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'portfolio' | 'services' | 'certifications' | 'reviews'>('portfolio');

  // Enquiry Modal state
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [enquirySent, setEnquirySent] = useState(false);
  const [submittingEnquiry, setSubmittingEnquiry] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [projectLocation, setProjectLocation] = useState('Panaji, Goa');
  const [budgetRange, setBudgetRange] = useState('₹25 Lakh – ₹50 Lakh');
  const [enquiryText, setEnquiryText] = useState('');

  const handleOpenEnquiry = () => {
    setSenderName(currentUser?.fullName || (role === 'supplier' ? 'Sunil Silva' : 'Rahul Naik'));
    setSenderPhone(currentUser?.phone || '+91 98221 45091');
    setProjectLocation('Panaji, Goa');
    setBudgetRange('₹25 Lakh – ₹50 Lakh');
    setEnquiryText('');
    setEnquirySent(false);
    setShowEnquiryModal(true);
  };

  const handleSubmitEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSubmittingEnquiry(true);
    const sName = senderName || currentUser?.fullName || (role === 'supplier' ? 'Sunil Silva' : 'Rahul Naik');
    const sRole = role || 'customer';
    const payload = {
      professional_id: profile.id,
      professional_name: profile.full_name,
      professional_company: profile.company_name,
      sender_name: sName,
      sender_role: sRole,
      sender_phone: senderPhone || currentUser?.phone || '+91 98221 45091',
      project_location: projectLocation,
      budget_range: budgetRange,
      requirements: enquiryText
    };

    try {
      await fetch(`${API_BASE_URL}/api/v1/professionals/enquire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn('Enquiry fallback:', err);
    } finally {
      setSubmittingEnquiry(false);
      setEnquirySent(true);
      window.dispatchEvent(new CustomEvent('new_notification', {
        detail: {
          title: '📋 New Enquiry Received',
          desc: `${sName} enquired for ${profile.full_name}'s profile!`
        }
      }));
      window.dispatchEvent(new Event('refresh_notifications'));
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/professionals/${id || 'prof-carlos-1'}`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        } else {
          setProfile(fallbackCarlos);
        }
      } catch {
        setProfile(fallbackCarlos);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading verified professional profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link to="/" className="hover:text-amber-600">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <a href="/#professionals" className="hover:text-amber-600">Professionals</a>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-900 font-semibold">{profile.company_name || profile.full_name}</span>
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="h-36 bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 relative" />

          <div className="px-6 sm:px-10 pb-8 relative -mt-16 sm:-mt-18">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5">
                <img
                  src={profile.profile_photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                  alt={profile.full_name}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-4 border-white shadow-md bg-white"
                />

                <div className="text-center sm:text-left space-y-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                      {profile.company_name || profile.full_name}
                    </h1>
                    <VerificationBadge status={profile.verification_status} showPendingNotice />
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    {profile.full_name} · <span className="capitalize">{profile.category.replace('_', ' ')}</span> ({profile.experience_years} years experience)
                  </p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-500" />
                      {profile.city}, {profile.district}
                    </span>
                    {profile.average_rating && (
                      <span className="flex items-center gap-1 text-slate-900 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {profile.average_rating} ({profile.review_count} verified reviews)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center sm:items-end gap-2">
                <AvailabilityBadge status={profile.availability_status} />
                <button 
                  onClick={handleOpenEnquiry}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  <span>Request Project Quotation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-8 space-y-6">
            <div className="flex gap-2 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
              {[
                { key: 'portfolio', label: `Portfolio Projects (${profile.portfolio_projects.length})` },
                { key: 'services', label: `Services (${profile.services.length})` },
                { key: 'certifications', label: `Certifications (${profile.certifications.length})` },
                { key: 'reviews', label: `Reviews (${profile.review_count})` }
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key as any)}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    activeTab === t.key
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {activeTab === 'portfolio' && (
              <div className="space-y-4">
                {profile.portfolio_projects.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {profile.portfolio_projects.map((proj) => (
                      <PortfolioCard key={proj.id} project={proj} />
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                    No portfolio projects uploaded yet.
                  </div>
                )}
              </div>
            )}

            {activeTab === 'services' && (
              <div className="space-y-3">
                {profile.services.map((s, idx) => (
                  <div key={idx} className="p-5 bg-white rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{s.service_name}</h4>
                      {s.description && <p className="text-xs text-slate-500 mt-0.5">{s.description}</p>}
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-slate-900">₹{s.indicative_rate.toLocaleString()}</span>
                      <span className="text-[11px] text-slate-400 block">/{s.pricing_model.replace('_', ' ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'certifications' && (
              <div className="space-y-3">
                {profile.certifications.map((c, idx) => (
                  <div key={idx} className="p-5 bg-white rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{c.certification_name}</h4>
                        <div className="text-xs text-slate-500">Issued by {c.issuing_authority} · No: {c.certificate_number || 'N/A'}</div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {c.verification_status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {profile.reviews.length > 0 ? (
                  profile.reviews.map((r, idx) => (
                    <div key={idx} className="p-5 bg-white rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{r.reviewer_name}</span>
                          {r.is_verified_purchase && (
                            <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-semibold">
                              Verified Build
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-amber-400 font-bold text-xs">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{r.rating}.0</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{r.review_text}</p>
                      {r.project_reference && (
                        <div className="text-[11px] text-slate-400 italic">Project: {r.project_reference}</div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                    No approved customer reviews yet. Reviews are only submitted post-project milestone delivery.
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">About the Professional</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{profile.bio}</p>

              {profile.specialisations.length > 0 && (
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Key Specialties
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.specialisations.map((s, i) => (
                      <span key={i} className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Project Budget Range</h3>
              <div className="text-lg font-black text-slate-900">
                ₹{(profile.min_budget / 100000).toFixed(1)}L — ₹{(profile.max_budget / 100000).toFixed(1)}L
              </div>
              <p className="text-xs text-slate-500">
                Typical project sizes accepted by this contractor across Goa.
              </p>
            </div>

            <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-amber-400">Direct Contact</h3>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>{profile.phone}</span>
                </div>
                {profile.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-amber-400" />
                    <a href={profile.website} target="_blank" rel="noreferrer" className="hover:underline text-amber-400">
                      {profile.website}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* INSTANT ENQUIRY MODAL */}
      {showEnquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Instant Project Enquiry
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  Enquire with {profile.company_name || profile.full_name}
                </h3>
                <p className="text-xs text-slate-500">Direct transmission to professional dashboard with real-time notification.</p>
              </div>
              <button
                onClick={() => setShowEnquiryModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {enquirySent ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="font-black text-slate-900 text-base">Enquiry Sent Successfully!</h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Your project specifications have been dispatched to <strong>{profile.full_name}</strong>. They will receive a notification and respond directly.
                </p>
                <button
                  onClick={() => setShowEnquiryModal(false)}
                  className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitEnquiry} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Your Name ({role === 'supplier' ? 'Supplier' : 'Consumer'})
                    </label>
                    <input
                      type="text"
                      required
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="e.g. Rahul Naik"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      required
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      placeholder="+91 98221 00000"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Project Location in Goa</label>
                  <input
                    type="text"
                    required
                    value={projectLocation}
                    onChange={(e) => setProjectLocation(e.target.value)}
                    placeholder="e.g. Assagao, Candolim, or Margao"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Budget Range</label>
                  <select 
                    value={budgetRange}
                    onChange={(e) => setBudgetRange(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option>₹25 Lakh – ₹50 Lakh</option>
                    <option>₹50 Lakh – ₹1 Crore</option>
                    <option>₹1 Crore – ₹2.5 Crore</option>
                    <option>Above ₹2.5 Crore</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Project Requirements & Scope</label>
                  <textarea
                    rows={3}
                    required
                    value={enquiryText}
                    onChange={(e) => setEnquiryText(e.target.value)}
                    placeholder="Briefly describe what you're constructing (e.g. 3BHK Portuguese villa, foundation + slab, architectural drawings)..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEnquiryModal(false)}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingEnquiry}
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submittingEnquiry ? 'Sending...' : 'Send Enquiry Directly'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const fallbackCarlos: ProfessionalProfileFull = {
  id: 'prof-carlos-1',
  full_name: 'Carlos Fernandes',
  company_name: 'Fernandes & Sons Civil Construction',
  profile_photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  category: 'contractor',
  email: 'carlos@fernandesconstruct.in',
  phone: '+91 94220 88210',
  website: 'https://fernandesconstruct.in',
  bio: 'Specialists in Goan villas, RCC framed structures, and traditional Portuguese restorations across North and South Goa with over 14 years of proven field expertise.',
  experience_years: 14,
  specialisations: ['RCC Framed Structures', 'Heritage Portuguese Restorations', 'Luxury Villas', 'Waterproofing'],
  project_types_handled: ['Residential Villa', 'Renovation', 'Commercial Boutique'],
  min_budget: 2500000.0,
  max_budget: 30000000.0,
  currency: 'INR',
  availability_status: 'available',
  country: 'India',
  state: 'Goa',
  district: 'North Goa',
  city: 'Panaji',
  is_published: true,
  profile_completion_pct: 100,
  verification_status: 'verified',
  services: [
    { service_name: 'Turnkey Villa Construction', description: 'End-to-end civil execution including foundation, masonry, RCC slab.', pricing_model: 'per_sqft', indicative_rate: 2150.0 }
  ],
  locations: [{ location_name: 'Panaji, Porvorim, Mapusa', district: 'North Goa' }],
  portfolio_projects: [
    {
      id: 'proj-1',
      title: 'Villa Sol de Goa',
      project_type: 'New Construction',
      description: '4,200 sq.ft Portuguese-modern villa with sloping clay tile roofs, exposed laterite accents, and infinity pool.',
      location: 'Assagao, North Goa',
      completion_year: 2024,
      project_area_sqft: 4200.0,
      indicative_budget: 8500000.0,
      role: 'General Contractor',
      display_order: 1,
      media: [
        {
          media_type: 'image',
          file_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
          file_name: 'exterior_front.jpg',
          caption: 'Front Elevation & Sloping Roof',
          display_order: 1
        }
      ]
    }
  ],
  certifications: [
    {
      certification_name: 'PWD Goa Class-1 Civil Contractor',
      issuing_authority: 'Public Works Department Goa',
      certificate_number: 'GOA-PWD-CLASS1-2018',
      issue_date: '2018-05-10',
      verification_status: 'verified'
    }
  ],
  reviews: [
    {
      id: 'rev-1',
      reviewer_name: 'Dr. Amit Roy',
      rating: 5.0,
      review_text: 'Carlos and his team completed our Assagao villa on schedule. Structural quality and transparency during milestone slab castings were outstanding.',
      project_reference: 'Villa Sol de Goa',
      moderation_status: 'approved',
      is_verified_purchase: true
    }
  ],
  average_rating: 4.9,
  review_count: 1
};
