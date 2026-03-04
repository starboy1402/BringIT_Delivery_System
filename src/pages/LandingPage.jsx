/**
 * @file LandingPage - Public homepage with hero, features, FAQ, stats
 *
 * Visible to everyone. Uses React Router's Link for navigation.
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin, Package, User, Clock, Check, ArrowRight, Edit3, Eye,
  TrendingUp, ShieldCheck, MessageCircle, CreditCard, Trophy,
  Users, Zap, Star, Heart,
} from 'lucide-react';
import { requestsDB, usersDB } from '@/lib/db';
import { Button, Card, Badge, AnimatedNumber, FAQItem } from '@/components/ui';

export function LandingPage() {
  const [stats, setStats] = useState({ total: 0, open: 0, completed: 0 });
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    async function load() {
      const [s, c] = await Promise.all([
        requestsDB.getStats(),
        usersDB.getAllUsersCount(),
      ]);
      setStats(s);
      setUserCount(c);
    }
    load();
  }, []);

  const FEATURES = [
    { icon: <TrendingUp className="w-6 h-6" />, title: 'Earn Extra Cash', desc: "Going to town anyway? Pick up items for others and earn delivery fees on every trip." },
    { icon: <Clock className="w-6 h-6" />, title: 'Save Precious Time', desc: "Don't waste 3 hours on a bus for a single item. Let someone who's already going bring it." },
    { icon: <ShieldCheck className="w-6 h-6" />, title: 'Trusted Network', desc: 'Only verified CUET students can join. Every user has ratings, badges, and a real identity.' },
    { icon: <MessageCircle className="w-6 h-6" />, title: 'Built-in Chat', desc: 'Communicate directly with your deliverer through our in-app messaging system.' },
    { icon: <CreditCard className="w-6 h-6" />, title: 'Flexible Payment', desc: 'Pay via bKash, Nagad, or cash — whatever works for both parties.' },
    { icon: <Trophy className="w-6 h-6" />, title: 'Leaderboard & Badges', desc: 'Top deliverers earn badges and climb the leaderboard. Build your reputation!' },
  ];

  const STEPS = [
    { step: '1', icon: <Edit3 className="w-6 h-6" />, title: 'Post a Request', desc: "Tell us what you need, where to pick it up, and how much you'll pay for delivery." },
    { step: '2', icon: <Eye className="w-6 h-6" />, title: 'Get Matched', desc: 'Students heading to town see your request and accept the delivery job.' },
    { step: '3', icon: <Check className="w-6 h-6" />, title: 'Receive & Pay', desc: 'Get your item delivered to your hall. Pay the reward via bKash/cash and rate.' },
  ];

  const TESTIMONIALS = [
    { name: 'Arif Rahman', dept: "CSE '20", text: "Saved me during finals week! Got my calculator delivered in 2 hours without leaving the library.", rating: 5, hall: 'Bangabandhu Hall' },
    { name: 'Fatima Noor', dept: "Arch '21", text: "I earn 200-300 BDT every week just by picking up stuff for others when I go to town. Amazing side income!", rating: 5, hall: 'Sufia Kamal Hall' },
    { name: 'Mehedi Hasan', dept: "EEE '19", text: "The chat feature and rating system make everything transparent. Never had a bad experience.", rating: 4, hall: 'Sheikh Russell Hall' },
  ];

  const FAQS = [
    { q: 'Who can use CUETConnect?', a: 'Only verified students of Chittagong University of Engineering and Technology (CUET) can create accounts and use the platform. You need a valid student ID to sign up.' },
    { q: 'How does the payment work?', a: 'Payment is handled between the requester and deliverer directly. You can pay via bKash, Nagad, or cash upon delivery. The reward amount is agreed upon when posting the request.' },
    { q: 'Is it safe?', a: 'Yes! Every user is a verified CUET student with their real name, department, and hall. Plus, our rating system ensures accountability. Users with low ratings are flagged.' },
    { q: "What if the deliverer doesn't show up?", a: "You can cancel a request at any time before it's completed. If a deliverer accepts but doesn't follow through, you can report them and their rating will be affected." },
    { q: 'Can I deliver items too?', a: "Absolutely! That's the best part. If you're heading to town, browse open requests and accept any that match your route. You earn the delivery reward." },
  ];

  const LIVE_STATS = [
    { value: userCount, label: 'Active Students', icon: <Users className="w-5 h-5" /> },
    { value: stats.total, label: 'Total Requests', icon: <Package className="w-5 h-5" /> },
    { value: stats.completed, label: 'Deliveries Done', icon: <Check className="w-5 h-5" /> },
    { value: stats.open, label: 'Open Now', icon: <Zap className="w-5 h-5" /> },
  ];

  return (
    <main className="bg-white dark:bg-gray-900 page-enter">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-green-200/30 dark:bg-green-900/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-teal-200/20 dark:bg-teal-900/10 rounded-full blur-3xl" />
        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge type="success">🎓 For CUET Students Only</Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                Need something from{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600 dark:from-green-400 dark:to-teal-400">
                  Town?
                </span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                Connect with students traveling between Chittagong city and campus. Save time, save money, and help your peers earn.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/signup">
                  <Button className="px-8 py-3 text-lg">
                    Get Started Free <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="secondary" className="px-8 py-3 text-lg">
                    Log In
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-6 pt-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> Free to use</div>
                <div className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> Verified students</div>
                <div className="flex items-center gap-1"><Check className="w-4 h-4 text-green-500" /> Secure</div>
              </div>
            </div>

            {/* Demo Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl transform md:rotate-2 hover:rotate-0 transition-all duration-500 border border-gray-100 dark:border-gray-700 animate-float">
              <div className="flex items-center gap-3 mb-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <User className="text-green-600 dark:text-green-400 w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gray-800 dark:text-white">Samiul needs delivery</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Posted 5 mins ago</div>
                </div>
                <Badge type="danger">Urgent</Badge>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Package className="text-gray-400 mt-1 w-5 h-5" />
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Item</div>
                    <div className="font-medium text-gray-900 dark:text-white">Scientific Calculator</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="text-gray-400 mt-1 w-5 h-5" />
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Route</div>
                    <div className="font-medium text-gray-900 dark:text-white">New Market → Qudrat Hall</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                  <div className="text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-900/30 px-3 py-1.5 rounded-full text-sm">
                    💰 Reward: 50 BDT
                  </div>
                  <div className="bg-gray-900 dark:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                    Accept Job
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Stats */}
      <section className="py-12 bg-white dark:bg-gray-800 border-y border-gray-100 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {LIVE_STATS.map((s, i) => (
              <div key={i} className="count-animate">
                <div className="text-3xl md:text-4xl font-bold text-green-600 dark:text-green-400 mb-1">
                  <AnimatedNumber value={s.value} />
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1.5">
                  {s.icon} {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">How it Works</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
              Three simple steps to get your items delivered or earn money while you travel
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((item, idx) => (
              <div key={idx} className="relative p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg transition-all group">
                <div className="absolute -top-4 left-6 w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {item.step}
                </div>
                <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400 mb-4 mt-2 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Why CUETConnect?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map((f, i) => (
              <div key={i} className="p-6 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 hover:shadow-lg transition-shadow group">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-green-600 dark:text-green-400 mb-4 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">What Students Say</h2>
            <p className="text-gray-500 dark:text-gray-400">Real feedback from CUET students</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <Card key={i} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-4 h-4 ${s <= t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4 italic">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm">{t.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t.dept} • {t.hall}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">FAQ</h2>
            <p className="text-gray-500 dark:text-gray-400">Common questions answered</p>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-green-100 text-lg mb-8">Join hundreds of CUET students already using CUETConnect</p>
          <Link to="/signup">
            <Button
              variant="secondary"
              className="px-8 py-3 text-lg mx-auto bg-white text-green-700 hover:bg-green-50 border-0"
            >
              Create Free Account <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-gray-400 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <Package className="text-white w-4 h-4" />
                </div>
                <span className="font-bold text-lg text-white">CUETConnect</span>
              </div>
              <p className="text-sm text-gray-500 max-w-sm">
                The peer-to-peer campus delivery platform built for CUET students. Save time, earn money, help your peers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/feed" className="hover:text-green-400 transition-colors">Browse Requests</Link></li>
                <li><Link to="/leaderboard" className="hover:text-green-400 transition-colors">Leaderboard</Link></li>
                <li><Link to="/signup" className="hover:text-green-400 transition-colors">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3 text-sm">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><span className="hover:text-green-400 cursor-pointer transition-colors">Help Center</span></li>
                <li><span className="hover:text-green-400 cursor-pointer transition-colors">Safety Tips</span></li>
                <li><span className="hover:text-green-400 cursor-pointer transition-colors">Report Issue</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">&copy; {new Date().getFullYear()} CUETConnect. Built for CUET students, by CUET students.</p>
            <div className="flex items-center gap-1 text-sm">
              Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> at CUET
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
