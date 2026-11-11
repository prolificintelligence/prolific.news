'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
    <div className="bg-[#001424] text-white min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#CC0000] text-white font-headline font-bold text-xs uppercase px-3 py-1 rounded tracking-wider">
            <Mail className="w-3.5 h-3.5 text-[#FFCC00]" />
            Prolific Newsroom & Global Bureaus
          </div>
          <h1 className="font-headline font-black text-3xl md:text-5xl uppercase tracking-tight text-white leading-tight">
            Contact <span className="text-[#FFCC00]">Prolific News Network</span>
          </h1>
          <p className="text-gray-300 text-base md:text-lg font-serif">
            Direct communication channels for readers, newsmakers, institutional advertisers, PR agencies, and commercial partners.
          </p>
        </div>

        {/* Departmental Directory Grid */}
        <div className="space-y-4">
          <h2 className="text-sm font-headline font-bold uppercase tracking-wider text-gray-400">
            Select Department
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Object.values(DEPARTMENTS).map((dept) => {
              const IconComp = ICONS[dept.id] || Mail;
              const isSelected = selectedDept === dept.id;
              return (
                <div
                  key={dept.id}
                  onClick={() => setSelectedDept(dept.id)}
                  className={`rounded-xl p-5 cursor-pointer transition flex flex-col justify-between border-2 relative ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#002B49] to-[#001A2C] border-[#FFCC00] shadow-xl scale-[1.01]'
                      : 'bg-[#002038] border-gray-800 hover:border-gray-600'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-headline font-bold uppercase px-2 py-0.5 rounded bg-white/10 text-cyan-300 tracking-wider">
                        <IconComp className="w-3 h-3 text-[#FFCC00]" />
                        {dept.badge}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {dept.sla}
                      </span>
                    </div>

                    <h3 className="font-headline font-black text-base uppercase text-white tracking-wide">
                      {dept.name}
                    </h3>
                    <p className="text-xs text-[#FFCC00] font-mono font-semibold">
                      {dept.email}
                    </p>
                    <p className="text-xs text-gray-300 leading-relaxed">{dept.purpose}</p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                    <button
                      type="button"
                      className={`text-[11px] font-headline font-bold uppercase tracking-wider px-2.5 py-1 rounded transition ${
                        isSelected ? 'bg-[#FFCC00] text-[#002B49]' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {isSelected ? 'Routing Active' : 'Select for Form'}
                    </button>
                    <a
                      href={`mailto:${dept.email}?subject=Inquiry%20via%20Prolific%20Newsroom`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[11px] font-mono text-gray-400 hover:text-white flex items-center gap-1 transition"
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
            <div className="bg-[#00233D] border border-emerald-500/50 rounded-xl p-8 md:p-12 text-center space-y-4 shadow-2xl">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="font-headline font-black text-2xl uppercase tracking-wide text-white">
                Message Dispatched Successfully
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed max-w-xl mx-auto">
                {receiptMsg}
              </p>
              <div className="p-3 bg-[#001829] rounded text-xs font-mono text-gray-400 max-w-sm mx-auto border border-white/10">
                Tracking Reference: <strong className="text-white">{inquiryId}</strong>
              </div>
              <div className="pt-4">
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setSubject('');
                    setMessage('');
                  }}
                  className="bg-[#FFCC00] text-[#002B49] font-headline font-black text-xs uppercase px-6 py-2.5 rounded tracking-wider hover:bg-amber-400 transition cursor-pointer"
                >
                  Send Another Inquiry
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-[#00233D] border border-gray-800 rounded-xl p-6 md:p-10 space-y-6 shadow-2xl"
            >
              <div className="border-b border-gray-700 pb-4 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className="font-headline font-black text-xl uppercase tracking-wide text-white flex items-center gap-2">
                    <Send className="w-5 h-5 text-[#FFCC00]" />
                    Direct Newsroom Dispatch Form
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Your message will route directly to:{' '}
                    <strong className="text-[#FFCC00]">{currentDept.name} ({currentDept.email})</strong>
                  </p>
                </div>
                <div className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded">
                  Response SLA: {currentDept.sla}
                </div>
              </div>

              {errorMsg && (
                <div className="p-4 bg-rose-950/50 border border-rose-500/50 rounded text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-300">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Elena Rostova"
                    className="w-full bg-[#001829] border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FFCC00]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-300">
                    Your Contact Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="elena@example.com"
                    className="w-full bg-[#001829] border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FFCC00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-300">
                    Target Department
                  </label>
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full bg-[#001829] border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFCC00]"
                  >
                    {Object.values(DEPARTMENTS).map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-300">
                    Subject / Story Reference *
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Editorial correction regarding Nairobi tech hub report"
                    className="w-full bg-[#001829] border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FFCC00]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-300">
                  Message / Details *
                </label>
                <textarea
                  required
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Provide complete details, article links, source documentation, or commercial partnership specifications..."
                  className="w-full bg-[#001829] border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#FFCC00]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#FFCC00] hover:bg-amber-400 text-[#002B49] font-headline font-black text-sm uppercase py-3.5 rounded tracking-wider transition shadow-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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

        {/* Alternative Real-Time Channels */}
        <div className="bg-[#001829] border border-gray-800 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#FFCC00]" />
            <span>Breaking news tips & real-time broadcasts stream continuously via our verified channels.</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://t.me/prolificnews"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#0088cc] text-white px-3 py-1.5 rounded font-bold hover:opacity-90 transition"
            >
              Telegram @prolificnews
            </a>
            <a
              href="/feed.xml"
              className="bg-[#002B49] text-[#FFCC00] border border-white/20 px-3 py-1.5 rounded font-bold hover:bg-[#003B66] transition"
            >
              RSS Feed
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
