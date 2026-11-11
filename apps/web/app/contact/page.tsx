'use client';

import React, { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Radio,
  FileText,
  AlertCircle,
  HelpCircle,
  Briefcase,
  ExternalLink,
} from 'lucide-react';
import { DEPARTMENTS } from '../../lib/site';

const ICONS: Record<string, React.ElementType> = {
  editorial: Radio,
  partnerships: Briefcase,
  wire: FileText,
  support: HelpCircle,
  legal: ShieldCheck,
};

export default function ContactPage() {
  const [selectedDept, setSelectedDept] = useState('editorial');

  useEffect(() => {
    const dept = new URLSearchParams(window.location.search).get('dept');
    if (dept && DEPARTMENTS[dept]) {
      setSelectedDept(dept);
    }
  }, []);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [receiptMsg, setReceiptMsg] = useState('');
  const [inquiryId, setInquiryId] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department: selectedDept,
          name,
          email,
          subject,
          message,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
        setInquiryId(data.inquiryId);
        setReceiptMsg(data.message);
      } else {
        setErrorMsg(data.error || 'Failed to submit inquiry. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error during submission.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentDept = DEPARTMENTS[selectedDept] || DEPARTMENTS.editorial;

  return (
    <div className="bg-white text-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-12">
        {/* Hero Header Card matching /advertise */}
        <div className="bg-gradient-to-br from-[#002B49] via-[#001F35] to-[#000F1C] text-white rounded-2xl p-8 md:p-12 shadow-xl border-b-4 border-[#CC0000]">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-[#CC0000] text-white font-headline font-bold text-xs uppercase px-3 py-1 rounded tracking-widest">
              <Mail className="w-3.5 h-3.5 text-[#FFCC00]" />
              Prolific Newsroom & Global Bureaus
            </div>
            <h1 className="font-headline font-black text-3xl md:text-5xl uppercase tracking-tight text-white leading-[1.08]">
              Contact <span className="text-[#FFCC00]">Prolific News Network</span>
            </h1>
            <p className="text-gray-300 text-base md:text-lg leading-relaxed">
              Direct communication channels for readers, newsmakers, institutional advertisers, PR agencies, and commercial partners.
            </p>
          </div>
        </div>

        {/* Departmental Directory Grid */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-headline font-black text-2xl md:text-3xl uppercase tracking-tight text-[#002B49]">
              Select Newsroom or Commercial Department
            </h2>
            <p className="text-sm text-gray-600">
              Choose a dedicated desk below to route your message directly with guaranteed response SLAs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.values(DEPARTMENTS).map((dept) => {
              const IconComp = ICONS[dept.id] || Mail;
              const isSelected = selectedDept === dept.id;
              return (
                <div
                  key={dept.id}
                  onClick={() => setSelectedDept(dept.id)}
                  className={`rounded-xl p-6 cursor-pointer transition flex flex-col justify-between border relative ${
                    isSelected
                      ? 'bg-[#002B49] text-white border-[#FFCC00] ring-2 ring-[#FFCC00]/40 shadow-xl'
                      : 'bg-white text-gray-900 border-gray-200 hover:border-[#002B49]/40 shadow-sm'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[10px] font-headline font-bold uppercase px-2.5 py-1 rounded tracking-widest ${
                          isSelected
                            ? 'bg-[#CC0000] text-white'
                            : 'bg-[#002B49]/10 text-[#002B49]'
                        }`}
                      >
                        <IconComp className={`w-3 h-3 ${isSelected ? 'text-[#FFCC00]' : 'text-[#CC0000]'}`} />
                        {dept.badge}
                      </span>
                      <span
                        className={`text-[10px] font-mono flex items-center gap-1 font-semibold ${
                          isSelected ? 'text-[#FFCC00]' : 'text-emerald-700'
                        }`}
                      >
                        <Clock className="w-2.5 h-2.5" />
                        {dept.sla}
                      </span>
                    </div>

                    <h3 className="font-headline font-black text-lg uppercase tracking-tight">
                      {dept.name}
                    </h3>
                    <p
                      className={`text-xs font-mono font-bold ${
                        isSelected ? 'text-[#FFCC00]' : 'text-[#CC0000]'
                      }`}
                    >
                      {dept.email}
                    </p>
                    <p className={`text-xs leading-relaxed ${isSelected ? 'text-gray-200' : 'text-gray-600'}`}>
                      {dept.purpose}
                    </p>
                  </div>

                  <div
                    className={`pt-4 mt-4 border-t flex items-center justify-between ${
                      isSelected ? 'border-white/15' : 'border-gray-200'
                    }`}
                  >
                    <button
                      type="button"
                      className={`text-[11px] font-headline font-bold uppercase tracking-wider px-3 py-1.5 rounded transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#FFCC00] text-[#002B49]'
                          : 'bg-[#002B49] hover:bg-[#003B66] text-white'
                      }`}
                    >
                      {isSelected ? 'Routing Active' : 'Select Desk'}
                    </button>
                    <a
                      href={`mailto:${dept.email}?subject=Inquiry%20via%20Prolific%20Newsroom`}
                      onClick={(e) => e.stopPropagation()}
                      className={`text-[11px] font-mono flex items-center gap-1 transition ${
                        isSelected ? 'text-gray-200 hover:text-white' : 'text-gray-500 hover:text-[#002B49]'
                      }`}
                      title="Open in Mail Client"
                    >
                      <span>Direct Mail</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Web Form or Success Screen */}
        <div className="max-w-3xl mx-auto">
          {submitted ? (
            <div className="bg-white border border-emerald-200 rounded-xl p-8 md:p-12 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="font-headline font-black text-2xl uppercase tracking-wide text-[#002B49]">
                Message Dispatched Successfully
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed max-w-xl mx-auto">
                {receiptMsg}
              </p>
              <div className="p-3 bg-[#F8F9FA] rounded text-xs font-mono text-gray-600 max-w-sm mx-auto border border-gray-200">
                Tracking Reference: <strong className="text-[#002B49]">{inquiryId}</strong>
              </div>
              <div className="pt-4">
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setSubject('');
                    setMessage('');
                  }}
                  className="bg-[#002B49] hover:bg-[#003B66] text-[#FFCC00] font-headline font-black text-xs uppercase px-6 py-3 rounded tracking-wider transition cursor-pointer"
                >
                  Send Another Inquiry
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white border border-gray-200 rounded-xl p-6 md:p-10 space-y-6 shadow-sm"
            >
              <div className="border-b border-gray-200 pb-4 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className="font-headline font-black text-xl uppercase tracking-wide text-[#002B49] flex items-center gap-2">
                    <Send className="w-5 h-5 text-[#CC0000]" />
                    Direct Newsroom Dispatch Form
                  </h2>
                  <p className="text-xs text-gray-600 mt-1">
                    Your message will route directly to:{' '}
                    <strong className="text-[#002B49]">{currentDept.name} ({currentDept.email})</strong>
                  </p>
                </div>
                <div className="text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded font-semibold">
                  Response SLA: {currentDept.sla}
                </div>
              </div>

              {errorMsg && (
                <div className="p-4 bg-red-50 border border-red-200 rounded text-[#CC0000] text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Elena Rostova"
                    className="w-full bg-[#F8F9FA] border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#002B49] focus:bg-white transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    Your Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="elena@example.com"
                    className="w-full bg-[#F8F9FA] border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#002B49] focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    Target Department
                  </label>
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full bg-[#F8F9FA] border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#002B49] focus:bg-white transition"
                  >
                    {Object.values(DEPARTMENTS).map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    Subject / Story Reference *
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Editorial correction regarding Nairobi tech hub report"
                    className="w-full bg-[#F8F9FA] border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#002B49] focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Message / Details *
                </label>
                <textarea
                  required
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Provide complete details, article links, source documentation, or commercial partnership specifications..."
                  className="w-full bg-[#F8F9FA] border border-gray-300 rounded px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#002B49] focus:bg-white transition"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#002B49] hover:bg-[#003B66] text-[#FFCC00] font-headline font-black text-sm uppercase py-3.5 rounded tracking-wider transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <span>Dispatching Inquiry...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message to {currentDept.name}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Direct Channel Strip matching /advertise bottom strip */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-full bg-[#002B49] text-[#FFCC00] flex items-center justify-center shrink-0">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-sm uppercase text-[#002B49]">
                Real-Time Wire & Broadcast Channels
              </h3>
              <p className="text-xs text-gray-600">
                Breaking news tips & real-time dispatches stream continuously across our verified channels.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://t.me/prolificnews"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#0088cc] text-white text-xs font-headline font-bold uppercase tracking-wider px-4 py-2.5 rounded hover:opacity-90 transition"
            >
              Telegram @prolificnews
            </a>
            <a
              href="/feed.xml"
              className="bg-[#CC0000] hover:bg-red-700 text-white text-xs font-headline font-bold uppercase tracking-wider px-4 py-2.5 rounded transition"
            >
              RSS Feed
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
