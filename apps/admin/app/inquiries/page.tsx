'use client';

import React, { useEffect, useState } from 'react';
import {
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Filter,
  Radio,
  Briefcase,
  FileText,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';

interface Inquiry {
  id: string;
  department: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  ipHash: string | null;
  createdAt: string;
}

interface InquiriesResponse {
  ok: boolean;
  inquiries: Inquiry[];
  counts: {
    total: number;
    new: number;
    editorial: number;
    partnerships: number;
    wire: number;
    support: number;
    legal: number;
  };
}

const DEPT_BADGES: Record<string, { bg: string; text: string; label: string }> = {
  editorial: { bg: 'bg-rose-100', text: 'text-rose-800', label: 'Editorial Desk' },
  partnerships: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Partnerships' },
  wire: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Commercial Wire' },
  support: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Reader Support' },
  legal: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Legal & Rights' },
};

const STATUS_BADGES: Record<string, { bg: string; text: string }> = {
  NEW: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
  REVIEWED: { bg: 'bg-blue-100', text: 'text-blue-800' },
  RESOLVED: { bg: 'bg-gray-100', text: 'text-gray-600' },
  SPAM: { bg: 'bg-rose-100', text: 'text-rose-800' },
};

export default function AdminInquiriesPage() {
  const [data, setData] = useState<InquiriesResponse | null>(null);
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadInquiries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDept !== 'ALL') params.set('department', selectedDept);
      if (selectedStatus !== 'ALL') params.set('status', selectedStatus);

      const res = await fetch(`/api/inquiries?${params.toString()}`);
      const json = await res.json();
      if (json.ok) {
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load desk inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, [selectedDept, selectedStatus]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/inquiries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        await loadInquiries();
      }
    } catch (err) {
      console.error('Failed to update inquiry status:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="font-headline font-black text-2xl uppercase tracking-tight text-[#002B49] flex items-center gap-2">
            <Mail className="w-6 h-6 text-[#CC0000]" />
            Desk Inquiries & Reader Communications
          </h1>
          <p className="text-xs text-gray-600 mt-1">
            Real-time intake stream across all 5 departmental channels: Editorial, Partnerships, Wire, Support, and Legal.
          </p>
        </div>
        <button
          onClick={loadInquiries}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-[#002B49] hover:bg-[#003B66] text-white px-4 py-2 rounded text-xs font-headline font-bold uppercase tracking-wider transition cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Metrics Row */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Total Inquiries</div>
            <div className="text-2xl font-headline font-black text-[#002B49] mt-1">{data.counts.total}</div>
          </div>
          <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">New / Unread</div>
            <div className="text-2xl font-headline font-black text-emerald-600 mt-1">{data.counts.new}</div>
          </div>
          <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Editorial</div>
            <div className="text-xl font-headline font-black text-gray-800 mt-1">{data.counts.editorial}</div>
          </div>
          <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Partnerships</div>
            <div className="text-xl font-headline font-black text-gray-800 mt-1">{data.counts.partnerships}</div>
          </div>
          <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Wire PR</div>
            <div className="text-xl font-headline font-black text-gray-800 mt-1">{data.counts.wire}</div>
          </div>
          <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-wider text-purple-600">Support</div>
            <div className="text-xl font-headline font-black text-gray-800 mt-1">{data.counts.support}</div>
          </div>
          <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-600">Legal</div>
            <div className="text-xl font-headline font-black text-gray-800 mt-1">{data.counts.legal}</div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Department:
          </span>
          {['ALL', 'editorial', 'partnerships', 'wire', 'support', 'legal'].map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`text-xs font-headline font-bold uppercase tracking-wider px-3 py-1 rounded transition cursor-pointer ${
                selectedDept === dept
                  ? 'bg-[#002B49] text-white shadow-sm'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {dept === 'ALL' ? 'All Channels' : DEPT_BADGES[dept]?.label || dept}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs font-semibold bg-gray-50 border border-gray-300 rounded px-2.5 py-1 text-gray-800 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="RESOLVED">Resolved</option>
            <option value="SPAM">Spam</option>
          </select>
        </div>
      </div>

      {/* Inquiries Table / Feed */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 text-xs">Loading desk inquiries...</div>
        ) : !data || data.inquiries.length === 0 ? (
          <div className="p-12 text-center text-gray-500 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-sm font-semibold text-gray-700">All queues are clear</p>
            <p className="text-xs text-gray-500">No inquiries matching the selected filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {data.inquiries.map((inq) => {
              const deptBadge = DEPT_BADGES[inq.department] || {
                bg: 'bg-gray-100',
                text: 'text-gray-800',
                label: inq.department,
              };
              const statusBadge = STATUS_BADGES[inq.status] || {
                bg: 'bg-gray-100',
                text: 'text-gray-800',
              };
              const isExpanded = expandedId === inq.id;

              return (
                <div key={inq.id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span
                        className={`text-[10px] font-headline font-black uppercase px-2 py-0.5 rounded tracking-wider shrink-0 mt-0.5 ${deptBadge.bg} ${deptBadge.text}`}
                      >
                        {deptBadge.label}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            onClick={() => setExpandedId(isExpanded ? null : inq.id)}
                            className="text-sm font-bold text-gray-900 cursor-pointer hover:text-[#CC0000]"
                          >
                            {inq.subject}
                          </h3>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge.bg} ${statusBadge.text}`}
                          >
                            {inq.status}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-700">{inq.name}</span>
                          <span>&bull;</span>
                          <a
                            href={`mailto:${inq.email}?subject=Re:%20${encodeURIComponent(inq.subject)}`}
                            className="text-[#002B49] hover:underline"
                          >
                            {inq.email}
                          </a>
                          <span>&bull;</span>
                          <span>{new Date(inq.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      <a
                        href={`mailto:${inq.email}?subject=Re:%20${encodeURIComponent(inq.subject)}`}
                        className="text-xs bg-[#002B49] text-white px-2.5 py-1 rounded font-bold hover:bg-[#003B66] transition inline-flex items-center gap-1"
                      >
                        <span>Reply</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      {inq.status !== 'RESOLVED' && (
                        <button
                          onClick={() => updateStatus(inq.id, 'RESOLVED')}
                          className="text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded font-bold transition cursor-pointer"
                        >
                          Resolve
                        </button>
                      )}
                      {inq.status === 'NEW' && (
                        <button
                          onClick={() => updateStatus(inq.id, 'REVIEWED')}
                          className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-300 px-2.5 py-1 rounded font-bold transition cursor-pointer"
                        >
                          Mark Reviewed
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Message body (collapsible preview) */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : inq.id)}
                    className={`mt-3 text-xs text-gray-700 bg-gray-50 p-3 rounded border border-gray-200 cursor-pointer ${
                      isExpanded ? 'whitespace-pre-wrap' : 'line-clamp-2'
                    }`}
                  >
                    {inq.message}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
