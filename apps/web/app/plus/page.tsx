'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Flame, Check, ShieldCheck, PlayCircle, Film, Sparkles, CheckCircle2 } from 'lucide-react';

export default function PlusPage() {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleStartTrial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/subscribe/personalized', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          topics: ['Politics', 'Business', 'Tech', 'World'],
          regions: ['Global'],
          frequency: 'DAILY_MORNING',
        }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        setErrorMsg('Unable to initiate membership. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Subscription service error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#001424] text-white min-h-screen py-16 px-4">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#FFCC00] text-[#002B49] font-headline font-black text-xs uppercase px-3 py-1 rounded-full tracking-wider">
            <Flame className="w-4 h-4 fill-[#002B49]" />
            Direct Consumer Membership
          </div>
          <h1 className="font-headline font-black text-4xl md:text-6xl uppercase tracking-tight text-white leading-none">
            UNLIMITED ACCESS. <span className="text-[#FFCC00]">ZERO INTERRUPTIONS.</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto font-serif">
            Join Prolific Plus for exclusive investigative series, feature-length historical documentaries, and live commercial-free broadcast feeds.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Monthly Plan */}
          <div
            onClick={() => setSelectedPlan('monthly')}
            className={`bg-[#00233D] rounded-xl p-8 space-y-6 flex flex-col justify-between cursor-pointer border-2 transition ${
              selectedPlan === 'monthly' ? 'border-[#FFCC00] shadow-2xl' : 'border-gray-700 hover:border-gray-500'
            }`}
          >
            <div className="space-y-3">
              <h3 className="font-headline font-black text-xl uppercase tracking-wider text-white">Monthly Pass</h3>
              <div className="flex items-baseline gap-1">
                <span className="font-headline font-black text-4xl text-white">$5.99</span>
                <span className="text-gray-400 text-sm">/ month</span>
              </div>
              <p className="text-xs text-gray-300">Billed monthly. Cancel anytime with zero penalty.</p>
            </div>

            <ul className="space-y-3 text-xs text-gray-200">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#FFCC00]" />
                100% Ad-Free Reading & Video Experience
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#FFCC00]" />
                Commercial-Free Live Broadcast DVR
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#FFCC00]" />
                Full Access to Investigative Documentaries
              </li>
            </ul>

            <button
              type="button"
              className={`w-full font-headline font-bold text-xs uppercase py-3 rounded tracking-wider transition ${
                selectedPlan === 'monthly' ? 'bg-[#FFCC00] text-[#002B49]' : 'bg-white/10 text-white'
              }`}
            >
              Select Monthly Pass
            </button>
          </div>

          {/* Annual Plan (Best Value) */}
          <div
            onClick={() => setSelectedPlan('annual')}
            className={`bg-gradient-to-b from-[#002B49] to-[#001F35] rounded-xl p-8 space-y-6 flex flex-col justify-between relative shadow-2xl cursor-pointer border-2 transition ${
              selectedPlan === 'annual' ? 'border-[#FFCC00] scale-[1.02]' : 'border-gray-700 hover:border-gray-500'
            }`}
          >
            <div className="absolute -top-3 right-6 bg-[#FFCC00] text-[#002B49] text-[10px] font-headline font-black uppercase px-3 py-0.5 rounded-full tracking-wider">
              Most Popular
            </div>

            <div className="space-y-3">
              <h3 className="font-headline font-black text-xl uppercase tracking-wider text-white">Annual Membership</h3>
              <div className="flex items-baseline gap-1">
                <span className="font-headline font-black text-4xl text-[#FFCC00]">$64.99</span>
                <span className="text-gray-300 text-sm">/ year</span>
              </div>
              <p className="text-xs text-[#FFCC00]/90">Save 15% compared to monthly plan.</p>
            </div>

            <ul className="space-y-3 text-xs text-white">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#FFCC00]" />
                All Monthly Features Included
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#FFCC00]" />
                Priority Subscriber Comment Badging
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#FFCC00]" />
                Exclusive Invitations to Virtual Town Halls
              </li>
            </ul>

            <button
              type="button"
              className={`w-full font-headline font-black text-xs uppercase py-3 rounded tracking-wider transition shadow-lg ${
                selectedPlan === 'annual' ? 'bg-[#FFCC00] text-[#002B49]' : 'bg-white/10 text-white'
              }`}
            >
              Select Annual Membership
            </button>
          </div>
        </div>

        {/* Trial Signup Form */}
        <div className="max-w-md mx-auto bg-[#001C30] border border-gray-800 rounded-xl p-6 text-center space-y-4">
          {success ? (
            <div className="space-y-3">
              <CheckCircle2 className="w-12 h-12 text-[#FFCC00] mx-auto" />
              <h4 className="font-headline font-bold text-lg text-white uppercase">7-Day Free Trial Activated!</h4>
              <p className="text-xs text-gray-300">
                Welcome to Prolific Plus. Access credentials and confirmation have been sent to <strong>{email}</strong>.
              </p>
              <Link
                href="/watch"
                className="inline-block mt-2 bg-[#FFCC00] text-[#002B49] text-xs font-headline font-black uppercase px-4 py-2 rounded"
              >
                Go to Live Watch Hub
              </Link>
            </div>
          ) : (
            <form onSubmit={handleStartTrial} className="space-y-3">
              <h4 className="font-headline font-bold text-sm uppercase text-white tracking-wider">
                Start Your 7-Day Free Trial ({selectedPlan.toUpperCase()})
              </h4>
              <p className="text-xs text-gray-400">
                Instant access to ad-free viewing and investigative features. Cancel anytime.
              </p>
              {errorMsg && <p className="text-xs text-rose-400">{errorMsg}</p>}
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 bg-[#001220] border border-gray-700 rounded px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FFCC00]"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#FFCC00] hover:bg-amber-400 text-[#002B49] font-headline font-black text-xs uppercase px-4 py-2 rounded transition cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Activating...' : 'Activate Trial'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
