import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { VerificationSubmission } from '../../types/profile';
import { CheckCircle2, XCircle, Clock, FileText } from 'lucide-react';

export const VerificationManagement: React.FC = () => {
  const [submissions, setSubmissions] = useState<VerificationSubmission[]>([]);
  const [selectedSub, setSelectedSub] = useState<VerificationSubmission | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/admin/verifications');
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      } else {
        setSubmissions(demoSubmissions);
      }
    } catch {
      setSubmissions(demoSubmissions);
    }
  };

  const handleDecision = async (status: 'approved' | 'rejected') => {
    if (!selectedSub) return;
    setActionLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/admin/verifications/${selectedSub.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          rejection_reason: status === 'rejected' ? rejectionReason : null,
          reviewer_notes: status === 'approved' ? 'All license records confirmed valid with PWD/CoA records' : null
        })
      });

      if (res.ok) {
        alert(`Submission marked as ${status}! Status reflected on public profile badge.`);
        setSelectedSub(null);
        fetchSubmissions();
      }
    } catch {
      setSubmissions(submissions.map(s => s.id === selectedSub.id ? { ...s, status: status === 'approved' ? 'verified' : 'rejected' } : s));
      setSelectedSub(null);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                Administrative Verification Portal
              </span>
              <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Feature 10: Private Document Audit
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-2">Professional & Supplier Verification Queue</h1>
            <p className="text-xs text-slate-500 mt-1">
              Audit government licenses, CoA registration, and GSTIN certificates before granting the Verified Builder Badge.
            </p>
          </div>

          <Link to="/" className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">
            Back to Marketplace
          </Link>
        </div>

        {/* Submissions Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Pending & Reviewed Submissions ({submissions.length})</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                <tr>
                  <th className="p-4">Entity / Legal Name</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Registration / GSTIN</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Private Documents</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{sub.business_legal_name}</td>
                    <td className="p-4 capitalize">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                        {sub.entity_type}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 font-mono text-[11px]">
                      {sub.tax_identifier_gstin || sub.registration_number || 'N/A'}
                    </td>
                    <td className="p-4">
                      {sub.status === 'verified' && (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      )}
                      {sub.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full font-bold">
                          <Clock className="w-3 h-3" /> Pending Review
                        </span>
                      )}
                      {sub.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full font-bold">
                          <XCircle className="w-3 h-3" /> Rejected
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 text-slate-600">
                        <FileText className="w-3.5 h-3.5 text-blue-500" />
                        <span>Private Document (Confidential)</span>
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedSub(sub)}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 cursor-pointer"
                      >
                        Audit & Decide
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for Decision */}
        {selectedSub && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-base text-slate-900">Verification Audit Decision</h3>
                <button onClick={() => setSelectedSub(null)} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
              </div>

              <div className="space-y-3 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl">
                <div><strong>Business Legal Name:</strong> {selectedSub.business_legal_name}</div>
                <div><strong>Entity Category:</strong> {selectedSub.entity_type}</div>
                <div><strong>Tax / GSTIN Number:</strong> {selectedSub.tax_identifier_gstin || 'Not submitted'}</div>
                <div><strong>Registration License:</strong> {selectedSub.registration_number || 'Not submitted'}</div>
                <div className="pt-2 text-amber-800">
                  <span className="font-bold">Private ID Proof Document:</span> {selectedSub.id_proof_doc_url}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rejection Reason (if declining)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Expired CoA license or illegible GST certificate scan..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  disabled={actionLoading}
                  onClick={() => handleDecision('rejected')}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Reject Submission
                </button>
                <button
                  disabled={actionLoading}
                  onClick={() => handleDecision('approved')}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Approve & Grant Badge
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

const demoSubmissions: VerificationSubmission[] = [
  {
    id: 'sub-1',
    entity_type: 'professional',
    entity_id: 'prof-carlos-1',
    business_legal_name: 'Fernandes & Sons Civil Construction LLP',
    registration_number: 'GOA-PWD-CLASS1-2018',
    tax_identifier_gstin: '30AAACF1234K1Z5',
    id_proof_doc_url: '/api/v1/media/files/verification-documents/carlos_pwd_cert.pdf',
    status: 'verified',
    submission_date: '2026-02-10'
  },
  {
    id: 'sub-2',
    entity_type: 'supplier',
    entity_id: 'supp-mandovi-1',
    business_legal_name: 'Mandovi Building Solutions Pvt Ltd',
    registration_number: 'U45200GA2020PTC014298',
    tax_identifier_gstin: '30AABCM9876P1Z3',
    id_proof_doc_url: '/api/v1/media/files/verification-documents/mandovi_gst_cert.pdf',
    status: 'pending',
    submission_date: '2026-03-01'
  }
];
