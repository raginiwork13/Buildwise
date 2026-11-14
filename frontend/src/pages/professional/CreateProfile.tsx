import { API_BASE_URL } from '../../config';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { ProfileCompletion } from '../../components/profile/ProfileCompletion';

export const CreateProfessionalProfile: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    company_name: '',
    category: 'contractor',
    email: '',
    phone: '',
    website: '',
    bio: '',
    experience_years: 5,
    specialisations: [] as string[],
    project_types_handled: ['Residential Villa', 'Renovation'],
    min_budget: 1500000,
    max_budget: 25000000,
    availability_status: 'available',
    district: 'North Goa',
    city: 'Panaji',
    business_address: '',
    profile_photo_url: '',
    company_logo_url: '',
    subscription_tier: 'pro',
    is_sponsored: true
  });

  const [services, setServices] = useState([
    { service_name: 'Civil Construction', description: 'RCC framing and masonry', pricing_model: 'per_sqft', indicative_rate: 2150 }
  ]);

  const [portfolioProjects, setPortfolioProjects] = useState([
    {
      title: 'Sample Goa Coastal Villa',
      project_type: 'New Construction',
      description: '3,500 sq.ft luxury villa with Portuguese arches and sloping clay roof.',
      location: 'Porvorim, Goa',
      completion_year: 2024,
      project_area_sqft: 3500,
      indicative_budget: 7500000,
      role: 'Lead Contractor',
      display_order: 1,
      media: [
        {
          media_type: 'image' as const,
          file_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
          file_name: 'villa_elevation.jpg',
          caption: 'Front Elevation',
          display_order: 1
        }
      ]
    }
  ]);

  const [specInput, setSpecInput] = useState('');

  const addSpecialisation = () => {
    if (specInput.trim() && !formData.specialisations.includes(specInput.trim())) {
      setFormData({ ...formData, specialisations: [...formData.specialisations, specInput.trim()] });
      setSpecInput('');
    }
  };

  const removeSpecialisation = (spec: string) => {
    setFormData({ ...formData, specialisations: formData.specialisations.filter(s => s !== spec) });
  };

  const calculateCompletion = () => {
    let score = 0;
    if (formData.full_name && formData.email && formData.phone && formData.bio) score += 25;
    if (formData.category && formData.experience_years) score += 20;
    if (formData.district && formData.city) score += 15;
    if (formData.specialisations.length > 0) score += 15;
    if (formData.profile_photo_url) score += 10;
    if (formData.min_budget) score += 15;
    return Math.min(score, 100);
  };

  const handleSaveAndPublish = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/professionals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          is_published: true,
          services: services,
          locations: [{ location_name: formData.city, district: formData.district }]
        })
      });

      if (res.ok) {
        const created = await res.json();
        for (const proj of portfolioProjects) {
          await fetch(`${API_BASE_URL}/api/v1/professionals/${created.id}/portfolio`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(proj)
          });
        }
        navigate(`/professionals/${created.id}`);
      } else {
        navigate(`/professionals/prof-carlos-1`);
      }
    } catch {
      navigate(`/professionals/prof-carlos-1`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              Professional Onboarding Wizard
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-2">Create Your Professional Profile</h1>
            <p className="text-xs text-slate-500 mt-1">Join Goa's verified contractor & architect directory with no authentication barriers.</p>
          </div>

          <div className="w-48">
            <ProfileCompletion percentage={calculateCompletion()} />
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 text-xs font-semibold overflow-x-auto">
          {[
            { n: 1, label: '1. Basic Info' },
            { n: 2, label: '2. Professional Scope' },
            { n: 3, label: '3. Services & Rates' },
            { n: 4, label: '4. Initial Portfolio' },
            { n: 5, label: '5. Preview & Publish' }
          ].map((s) => (
            <button
              key={s.n}
              onClick={() => setStep(s.n)}
              className={`px-3 py-2 rounded-lg cursor-pointer transition-all ${
                step === s.n
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Form Content by Step */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                Step 1: Identity & Contact Coordinates
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Carlos Fernandes"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Firm Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Fernandes & Sons Civil Works"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="contractor">Civil Contractor</option>
                    <option value="architect">Architect & Planner</option>
                    <option value="civil_engineer">Civil / Structural Engineer</option>
                    <option value="interior_designer">Interior Designer</option>
                    <option value="structural_consultant">Structural Consultant</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="carlos@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 94220 XXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Introduction & Bio</label>
                <textarea
                  rows={3}
                  placeholder="Detail your construction experience, team size, Portuguese restoration expertise, or RCC capability across Goa."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Profile Photo Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.profile_photo_url}
                    onChange={(e) => setFormData({ ...formData, profile_photo_url: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company Website</label>
                  <input
                    type="url"
                    placeholder="https://myconstructionfirm.in"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                Step 2: Experience, Budget & Goa Service Area
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Years of Experience</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Goa District</label>
                  <select
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="North Goa">North Goa (Panaji / Mapusa / Bardez)</option>
                    <option value="South Goa">South Goa (Margao / Vasco / Salcete)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City / Town</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Min Indicative Budget (₹)</label>
                  <input
                    type="number"
                    step="50000"
                    value={formData.min_budget}
                    onChange={(e) => setFormData({ ...formData, min_budget: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max Indicative Budget (₹)</label>
                  <input
                    type="number"
                    step="100000"
                    value={formData.max_budget}
                    onChange={(e) => setFormData({ ...formData, max_budget: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Availability Status</label>
                  <select
                    value={formData.availability_status}
                    onChange={(e) => setFormData({ ...formData, availability_status: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="available">Available Immediately</option>
                    <option value="limited_availability">Limited Availability</option>
                    <option value="unavailable">Booked Out</option>
                  </select>
                </div>
              </div>

              {/* Specialisations Tagging */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Specialisations</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="e.g. Sloping Roofs, Heritage Laterite, Swimming Pools"
                    value={specInput}
                    onChange={(e) => setSpecInput(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={addSpecialisation}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {formData.specialisations.map((s, idx) => (
                    <span key={idx} className="bg-amber-50 border border-amber-200 text-amber-900 text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                      {s}
                      <button onClick={() => removeSpecialisation(s)} className="text-amber-700 hover:text-red-500">×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                Step 3: Services & Indicative Pricing
              </h3>

              <div className="space-y-3">
                {services.map((srv, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Service Name</label>
                      <input
                        type="text"
                        value={srv.service_name}
                        onChange={(e) => {
                          const updated = [...services];
                          updated[idx].service_name = e.target.value;
                          setServices(updated);
                        }}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Rate (₹)</label>
                      <input
                        type="number"
                        value={srv.indicative_rate}
                        onChange={(e) => {
                          const updated = [...services];
                          updated[idx].indicative_rate = Number(e.target.value);
                          setServices(updated);
                        }}
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                      />
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => setServices(services.filter((_, i) => i !== idx))}
                        className="w-full py-1.5 bg-red-50 text-red-700 hover:bg-red-100 text-xs rounded-lg font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setServices([...services, { service_name: 'Architectural Blueprint Design', description: '', pricing_model: 'per_sqft', indicative_rate: 180 }])}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700"
              >
                <Plus className="w-4 h-4" /> Add Another Service
              </button>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                Step 4: Showcase Completed Portfolio Projects
              </h3>

              {portfolioProjects.map((proj, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-slate-900">Project #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => setPortfolioProjects(portfolioProjects.filter((_, i) => i !== idx))}
                      className="text-red-500 text-xs font-medium hover:underline"
                    >
                      Delete Project
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Project Title"
                      value={proj.title}
                      onChange={(e) => {
                        const copy = [...portfolioProjects];
                        copy[idx].title = e.target.value;
                        setPortfolioProjects(copy);
                      }}
                      className="px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                    />
                    <input
                      type="text"
                      placeholder="Location (e.g. Assagao, Goa)"
                      value={proj.location}
                      onChange={(e) => {
                        const copy = [...portfolioProjects];
                        copy[idx].location = e.target.value;
                        setPortfolioProjects(copy);
                      }}
                      className="px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                    />
                  </div>

                  <textarea
                    rows={2}
                    placeholder="Project description, architecture style, structural challenges solved..."
                    value={proj.description}
                    onChange={(e) => {
                      const copy = [...portfolioProjects];
                      copy[idx].description = e.target.value;
                      setPortfolioProjects(copy);
                    }}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={() => setPortfolioProjects([...portfolioProjects, {
                  title: 'New Luxury Residence',
                  project_type: 'Residential',
                  description: 'Contemporary coastal architecture with sustainable cross ventilation.',
                  location: 'Calangute, Goa',
                  completion_year: 2023,
                  project_area_sqft: 2800,
                  indicative_budget: 6000000,
                  role: 'Contractor',
                  display_order: portfolioProjects.length + 1,
                  media: []
                }])}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700"
              >
                <Plus className="w-4 h-4" /> Add Another Portfolio Project
              </button>
            </div>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                Step 5: Review & Publish to Marketplace
              </h3>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Ready for Immediate Activation
                </div>
                <p>No login or password barrier. Clicking publish will register your profile in the live FastAPI directory.</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl space-y-2 text-xs text-slate-700">
                <div><strong>Professional Name:</strong> {formData.full_name || 'Not provided'}</div>
                <div><strong>Category:</strong> {formData.category} ({formData.experience_years} years)</div>
                <div><strong>Location:</strong> {formData.city}, {formData.district}</div>
                <div><strong>Portfolio Items:</strong> {portfolioProjects.length} projects configured</div>
                <div><strong>Services:</strong> {services.length} services configured</div>
                <div><strong>Subscription Plan:</strong> <span className="uppercase font-bold text-amber-600">{formData.subscription_tier}</span> ({formData.subscription_tier === 'free' ? 'Organic ranking' : 'Sponsored Placement on Marketplace'})</div>
              </div>

              {/* Plan Switcher in Step 5 */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-2">Select Your Marketplace Visibility Plan</label>
                <div className="grid grid-cols-3 gap-3">
                  <div
                    onClick={() => setFormData({ ...formData, subscription_tier: 'free', is_sponsored: false })}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.subscription_tier === 'free' ? 'border-slate-800 bg-white ring-2 ring-slate-800/10' : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-xs text-slate-800">Free Tier (₹0)</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Organic sorting by rating & experience</div>
                  </div>
                  <div
                    onClick={() => setFormData({ ...formData, subscription_tier: 'pro', is_sponsored: true })}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.subscription_tier === 'pro' ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20' : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-xs text-amber-800">Pro (₹299/mo)</div>
                    <div className="text-[10px] text-slate-600 mt-0.5">Sponsored badge & elevated placement</div>
                  </div>
                  <div
                    onClick={() => setFormData({ ...formData, subscription_tier: 'premium', is_sponsored: true })}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.subscription_tier === 'premium' ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20' : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-xs text-indigo-900">Premium (₹799/mo)</div>
                    <div className="text-[10px] text-slate-600 mt-0.5">Top-of-page sponsored priority</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Nav Controls */}
          <div className="flex justify-between pt-4 border-t border-slate-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Previous Step
              </button>
            ) : <div />}

            {step < 5 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                Next Step <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={handleSaveAndPublish}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                {loading ? 'Publishing...' : 'Publish Profile Now'}
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
