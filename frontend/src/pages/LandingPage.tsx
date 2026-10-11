import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  Kanban,
  FileText,
  Calendar,
  BarChart3,
  Shield,
  Zap,
  CheckCircle2,
  Users,
  Building2,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden">
      {/* Background Radial Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-transparent blur-3xl rounded-full" />
        <div className="absolute top-48 left-1/4 w-[350px] h-[250px] bg-blue-600/10 blur-3xl rounded-full" />
      </div>

      {/* 1. Navigation Header */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <Logo size="md" showText={true} />
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              v2.0
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/')}
                className="gap-1.5 text-xs font-semibold"
              >
                Go to Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/register')}
                  className="gap-1.5 text-xs font-semibold shadow-lg shadow-indigo-600/20"
                >
                  Get Started Free <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="pt-16 pb-20 sm:pt-24 sm:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Release Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium mb-6 backdrop-blur-sm animate-pulse">
          <Zap className="w-3.5 h-3.5 text-indigo-400" />
          <span>Engineered for modern tech job seekers & developers</span>
          <ChevronRight className="w-3 h-3 text-indigo-400" />
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
          Stop losing job leads in messy spreadsheets.
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          The high-performance workspace to track applications, organize interview rounds, store tailored resumes, and land your next offer.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            size="lg"
            variant="primary"
            onClick={() => navigate(user ? '/' : '/register')}
            className="w-full sm:w-auto text-sm px-6 py-3 gap-2 shadow-xl shadow-indigo-600/25 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500"
          >
            Start Tracking Free <ArrowRight className="w-4 h-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate(user ? '/' : '/login')}
            className="w-full sm:w-auto text-sm px-6 py-3 border-slate-800 hover:bg-slate-900 text-slate-300 hover:text-white"
          >
            {user ? 'Open Dashboard' : 'Sign In to Your Pipeline'}
          </Button>
        </div>

        {/* Quick Highlights Row */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> No credit card required
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Supabase secure cloud storage
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> INR & LPA salary ready
          </span>
        </div>

        {/* 3. Hero Visual Mockup */}
        <div className="mt-14 relative max-w-5xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/60 p-3 sm:p-4 shadow-2xl backdrop-blur-xl">
          <div className="rounded-xl border border-slate-800/80 bg-slate-950 p-4 sm:p-6 text-left">
            {/* Mock Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-xs font-semibold text-slate-400 hidden sm:inline">
                  Trackr Dashboard — Active Pipeline
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Offer Received • ₹24 LPA
                </span>
              </div>
            </div>

            {/* Mock Pipeline Columns */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {/* Card 1 */}
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    Applied
                  </span>
                  <span className="text-[10px] text-slate-500">2d ago</span>
                </div>
                <h4 className="text-xs font-bold text-white">Figma</h4>
                <p className="text-[11px] text-slate-400">Product Engineer • Remote</p>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>₹22 LPA</span>
                  <span className="text-emerald-400 font-medium">Master CV</span>
                </div>
              </div>

              {/* Card 2 */}
              <div className="p-3.5 rounded-xl border border-amber-500/30 bg-slate-900/80 space-y-2 relative">
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Interview Round 2
                  </span>
                  <span className="text-[10px] text-amber-300">Tomorrow</span>
                </div>
                <h4 className="text-xs font-bold text-white">Stripe</h4>
                <p className="text-[11px] text-slate-400">Senior Full Stack • Bengaluru</p>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>₹28 LPA</span>
                  <span className="text-indigo-400 font-medium">Prep Notes (4)</span>
                </div>
              </div>

              {/* Card 3 */}
              <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-slate-900/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Offer Extended
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold">Accepted!</span>
                </div>
                <h4 className="text-xs font-bold text-white">Linear</h4>
                <p className="text-[11px] text-slate-400">Design Systems Lead • Remote</p>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold text-emerald-300">₹32 LPA</span>
                  <span className="text-slate-400">Signed ✍️</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Feature Highlights Grid */}
      <section className="py-20 border-t border-slate-900 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">
              Features Built for Success
            </h2>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Everything you need from first apply to signed offer
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/50 hover:bg-slate-900/80 transition-all hover:-translate-y-1">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                <Kanban className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Pipeline Kanban</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Drag and drop opportunities between Applied, Screening, Interview, Offer, and Accepted stages.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/50 hover:bg-slate-900/80 transition-all hover:-translate-y-1">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Resume Storage</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Upload Master CV once or store tailored resumes per opportunity using Supabase Cloud Storage.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/50 hover:bg-slate-900/80 transition-all hover:-translate-y-1">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
                <Calendar className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Interview Tracking</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Log technical rounds, meeting links, interviewers, prep notes, and upcoming round countdowns.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/50 hover:bg-slate-900/80 transition-all hover:-translate-y-1">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Offer Analytics</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Analyze your interview conversion rate, salary distributions in LPA, and top location hubs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Bottom Call to Action */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="p-8 sm:p-12 rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/40 to-slate-900/60 backdrop-blur-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto">
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
              Ready to take control of your career search?
            </h3>
            <p className="text-sm text-slate-400 mb-8 leading-relaxed">
              Join job seekers tracking applications with precision. Free forever with instant cloud sync.
            </p>
            <Button
              size="lg"
              variant="primary"
              onClick={() => navigate(user ? '/' : '/register')}
              className="text-sm px-8 py-3.5 shadow-xl shadow-indigo-600/30 bg-indigo-600 hover:bg-indigo-500"
            >
              Get Started for Free <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="border-t border-slate-900 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo size="sm" showText={false} />
            <span className="font-semibold text-slate-300">Trackr</span>
            <span>— Precision Job Search Workspace</span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-slate-300">Sign In</Link>
            <Link to="/register" className="hover:text-slate-300">Create Account</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
