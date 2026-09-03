/**
 * @file LandingPage - Gamified Mission Control & Bento Dashboard
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Package, Clock, ArrowRight, ShieldCheck,
  TrendingUp, Users, Zap, CheckCircle2, MapPin,
  Sparkles, Compass, Star, ChevronRight, Award, Flame
} from 'lucide-react';
import { requestsDB, usersDB } from '@/lib/db';
import { Button, Card, AnimatedNumber } from '@/components/ui';

export function LandingPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 8, open: 4, inProgress: 2, completed: 2 });
  const [userCount, setUserCount] = useState(7);
  const [topDeliverers, setTopDeliverers] = useState([]);

  useEffect(() => {
    async function load() {
      const [s, c, leaders] = await Promise.all([
        requestsDB.getStats(),
        usersDB.getAllUsersCount(),
        usersDB.getLeaderboard({ limit: 3 }),
      ]);
      setStats(s);
      setUserCount(c);
      setTopDeliverers(leaders);
    }
    load();
  }, []);

  const CATEGORIES = [
    { label: 'Calculators & Tech', count: '12 delivered today', icon: '⚡' },
    { label: 'Emergency Medicine', count: 'Pharmacies near gates', icon: '💊' },
    { label: 'Printing & Thesis Binding', count: 'Chawkbazar presses', icon: '📄' },
    { label: 'Canteen & Food Craving', count: 'GEC & 2 No Gate spots', icon: '🍔' },
  ];

  const HOW_IT_WORKS = [
    {
      step: '01',
      title: 'Broadcast Your Need',
      desc: 'Specify what you need from the city (GEC, Chawkbazar, New Market) and set your custom reward fee in ৳.',
    },
    {
      step: '02',
      title: 'Matched with a Commuter',
      desc: 'A student already boarding the campus bus or rickshaw accepts your request and picks it up on their way.',
    },
    {
      step: '03',
      title: 'Gate Handover & bKash',
      desc: 'Meet at your hall entrance, verify the item in hand, and settle the reward via bKash, Nagad, or cash.',
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 page-enter pb-24">
      {/* ── Top Notice Bar ── */}
      <div className="bg-emerald-500 text-slate-950 font-heading font-bold text-xs py-2 px-4 text-center border-b-2 border-slate-950 flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4" />
        <span>CUET Peer-to-Peer Logistics Console: Active Campus Network</span>
        <Link to="/feed" className="underline font-extrabold hover:text-slate-800 ml-1">
          Explore Live Feed &rarr;
        </Link>
      </div>

      {/* ── Hero Section ── */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 border-2 border-slate-900 dark:border-emerald-500/50 text-emerald-900 dark:text-emerald-300 text-xs font-heading font-extrabold tracking-wide uppercase">
                <Flame className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Never Waste A Commute Again
              </div>

              <h1 className="font-heading text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-950 dark:text-white leading-[1.05] tracking-tight">
                Peer-to-Peer <br />
                <span className="text-emerald-600 dark:text-emerald-400 underline decoration-slate-900 dark:decoration-emerald-500 decoration-4">
                  Campus Courier
                </span>{' '}
                Dispatch.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
                Connect directly with fellow CUETians commuting between Chittagong city and campus. 
                Save hours of travel time on errands, or monetize your empty bus seat every trip.
              </p>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Button
                  onClick={() => navigate('/feed')}
                  variant="primary"
                  className="text-base px-8 py-3.5"
                >
                  Enter Dispatch Feed <ArrowRight className="w-5 h-5 ml-1" />
                </Button>
                <Button
                  onClick={() => navigate('/create')}
                  variant="secondary"
                  className="text-base px-8 py-3.5"
                >
                  Post a Delivery Need
                </Button>
              </div>

              {/* Quick stats indicators */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t-2 border-slate-900/10 dark:border-slate-800">
                <div className="p-3 bg-white dark:bg-[#0d131f] border-2 border-slate-900 dark:border-slate-700 rounded-xl shadow-[3px_3px_0_0_#0f172a] dark:shadow-[3px_3px_0_0_#020617]">
                  <div className="font-heading font-extrabold text-2xl text-slate-950 dark:text-white">
                    <AnimatedNumber value={stats.open} />
                  </div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Open Requests
                  </div>
                </div>
                <div className="p-3 bg-white dark:bg-[#0d131f] border-2 border-slate-900 dark:border-slate-700 rounded-xl shadow-[3px_3px_0_0_#0f172a] dark:shadow-[3px_3px_0_0_#020617]">
                  <div className="font-heading font-extrabold text-2xl text-emerald-600 dark:text-emerald-400">
                    <AnimatedNumber value={stats.completed + 42} />
                  </div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Delivered Items
                  </div>
                </div>
                <div className="p-3 bg-white dark:bg-[#0d131f] border-2 border-slate-900 dark:border-slate-700 rounded-xl shadow-[3px_3px_0_0_#0f172a] dark:shadow-[3px_3px_0_0_#020617]">
                  <div className="font-heading font-extrabold text-2xl text-amber-500">
                    4.9 ★
                  </div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Trust Rating
                  </div>
                </div>
              </div>
            </div>

            {/* Right Hero Column: Interactive Mission Control Dispatch Card */}
            <div className="lg:col-span-5">
              <div className="relative">
                {/* Decorative shadow layer */}
                <div className="absolute inset-0 bg-emerald-500 rounded-2xl transform translate-x-2 translate-y-2 border-2 border-slate-900 pointer-events-none" />
                
                <div className="relative bg-white dark:bg-[#0d131f] border-2 border-slate-900 dark:border-slate-700 rounded-2xl p-6 sm:p-7 space-y-5">
                  <div className="flex items-center justify-between border-b-2 border-slate-900 dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-heading font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                        Live Route In Transit
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 text-emerald-400 font-mono text-xs font-bold">
                      ID #REQ-003
                    </span>
                  </div>

                  {/* Route Visualizer */}
                  <div className="space-y-3 bg-slate-50 dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/60 border border-blue-400 flex items-center justify-center text-blue-600 flex-shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">Pickup Location</div>
                        <div className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                          New Market, Chittagong
                        </div>
                      </div>
                    </div>

                    <div className="ml-3.5 pl-3 border-l-2 border-dashed border-slate-300 dark:border-slate-700 py-1">
                      <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                        4:30 PM Campus Bus Route
                      </span>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-400 flex items-center justify-center text-emerald-600 flex-shrink-0">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">Dropoff Hall</div>
                        <div className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                          Sufia Kamal Hall Gate
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Item Description & Bounty */}
                  <div className="flex items-center justify-between p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-500/30 rounded-xl">
                    <div>
                      <div className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                        Architecture Drafting Sheet Roll
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Requester: Nusrat J. (EEE '21)
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-400 uppercase">Bounty</div>
                      <div className="font-heading font-extrabold text-xl text-emerald-700 dark:text-emerald-300">
                        ৳120
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => navigate('/feed')}
                    variant="primary"
                    className="w-full text-sm py-2.5"
                  >
                    View All Active Requests <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Category Bento Grid ── */}
      <section className="py-12 border-y-2 border-slate-900 dark:border-slate-800 bg-white dark:bg-[#0d131f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
            <div>
              <div className="text-xs font-heading font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Common Dispatches
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white">
                Everything CUETians Need Delivered
              </h2>
            </div>
            <Link
              to="/feed"
              className="text-xs font-heading font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-500 flex items-center gap-1 uppercase tracking-wider"
            >
              Browse All Categories <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((cat, i) => (
              <div
                key={i}
                onClick={() => navigate('/feed')}
                className="p-5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 rounded-xl shadow-[3px_3px_0_0_#0f172a] hover:shadow-[5px_5px_0_0_#0f172a] dark:shadow-[3px_3px_0_0_#020617] dark:hover:shadow-[5px_5px_0_0_#10b981] cursor-pointer transition-all hover:-translate-x-0.5 hover:-translate-y-0.5"
              >
                <div className="text-3xl mb-3">{cat.icon}</div>
                <div className="font-heading font-bold text-base text-slate-900 dark:text-white mb-1">
                  {cat.label}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {cat.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works Steps ── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <div className="text-xs font-heading font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Simple 3-Step Protocol
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white">
            How Campus Dispatch Works
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No external couriers or middlemen. Pure student-to-student collaboration with verified university IDs.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map((h, i) => (
            <div
              key={i}
              className="p-7 bg-white dark:bg-[#0d131f] border-2 border-slate-900 dark:border-slate-700 rounded-2xl shadow-[4px_4px_0_0_#0f172a] dark:shadow-[4px_4px_0_0_#020617] relative space-y-4"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 font-heading font-extrabold text-base flex items-center justify-center">
                {h.step}
              </div>
              <h3 className="font-heading font-bold text-xl text-slate-950 dark:text-white">
                {h.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {h.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Hall of Fame Teaser ── */}
      {topDeliverers.length > 0 && (
        <section className="py-16 bg-slate-100 dark:bg-slate-900/50 border-t-2 border-slate-900 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
              <div>
                <div className="text-xs font-heading font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" /> Top Deliverers
                </div>
                <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white">
                  Campus Courier Hall of Fame
                </h2>
              </div>
              <Button
                variant="secondary"
                onClick={() => navigate('/leaderboard')}
                className="text-xs"
              >
                View Full Leaderboard &rarr;
              </Button>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              {topDeliverers.map((d, i) => (
                <div
                  key={d.id}
                  className="p-5 bg-white dark:bg-[#0d131f] border-2 border-slate-900 dark:border-slate-700 rounded-xl shadow-[3px_3px_0_0_#0f172a] dark:shadow-[3px_3px_0_0_#020617] flex items-center gap-4"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-heading font-black text-xl border-2 border-slate-900 ${
                    i === 0 ? 'bg-amber-400 text-slate-950' : i === 1 ? 'bg-slate-300 text-slate-950' : 'bg-orange-300 text-slate-950'
                  }`}>
                    #{i + 1}
                  </div>
                  <div className="truncate">
                    <div className="font-heading font-bold text-sm text-slate-950 dark:text-white truncate">
                      {d.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {d.deliveriesCompleted} deliveries completed • {d.rating} ★
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Footer ── */}
      <footer className="mt-20 pt-12 border-t-2 border-slate-900 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
        <div className="font-heading font-bold text-base text-slate-900 dark:text-white">
          Bring<span className="text-emerald-500">IT</span>
        </div>
        <p>Built for the students of Chittagong University of Engineering & Technology (CUET).</p>
        <p className="text-[11px] text-slate-400">Open-source peer logistics • MIT License</p>
      </footer>
    </main>
  );
}
