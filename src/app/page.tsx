'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Layers,
  Download,
  Zap,
  Palette,
  Share2,
  Shield,
  ArrowRight,
  Sparkles,
  Star,
} from 'lucide-react';

const features = [
  {
    icon: Layers,
    title: 'Drag & Drop Editor',
    description: 'Intuitive canvas editor with layers, shapes, text, and images. Design like a pro.',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    icon: Palette,
    title: '30+ Templates',
    description: 'Start from professionally designed templates across 6 categories.',
    color: 'from-purple-500 to-pink-600',
  },
  {
    icon: Download,
    title: 'Multiple Export Formats',
    description: 'Export your designs as PNG, JPG, PDF, or SVG with high resolution.',
    color: 'from-green-500 to-teal-600',
  },
  {
    icon: Zap,
    title: 'QR Code Generator',
    description: 'Add custom QR codes to your cards linking to any URL or contact info.',
    color: 'from-yellow-500 to-orange-600',
  },
  {
    icon: Share2,
    title: 'Easy Sharing',
    description: 'Share your designs with a link or download for print-ready output.',
    color: 'from-red-500 to-rose-600',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your designs are stored securely and privately in your account.',
    color: 'from-cyan-500 to-blue-600',
  },
];

const testimonials = [
  {
    name: 'Sarah K.',
    role: 'Freelance Designer',
    content: 'CardCrafter is the easiest card designer I have ever used. Made 10 cards in an hour!',
    rating: 5,
  },
  {
    name: 'Marcus T.',
    role: 'Startup Founder',
    content: 'The templates are stunning and the export quality is perfect for print.',
    rating: 5,
  },
  {
    name: 'Priya L.',
    role: 'Marketing Manager',
    content: 'Finally a tool that makes professional card design accessible to everyone.',
    rating: 5,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">CardCrafter</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-white/70 hover:text-white transition-colors">Features</a>
              <a href="#templates" className="text-sm text-white/70 hover:text-white transition-colors">Templates</a>
              <a href="#testimonials" className="text-sm text-white/70 hover:text-white transition-colors">Reviews</a>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/auth/signin"
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-indigo-300 text-sm mb-8">
              <Sparkles className="w-4 h-4" />
              <span>Simple, fast, and free to use</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight">
              Create stunning{' '}
              <span className="gradient-text">contact cards</span>
              <br />
              in minutes
            </h1>
            <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10">
              Design beautiful, professional contact cards with our intuitive drag-and-drop editor.
              Choose from 30+ templates, customize every detail, and export in seconds.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/editor"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl text-lg transition-all shadow-2xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
            >
              Start designing for free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#templates"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-lg transition-all border border-white/20"
            >
              Browse templates
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center justify-center gap-12 mt-16 text-white/50 text-sm"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">10K+</div>
              <div>Cards created</div>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">30+</div>
              <div>Templates</div>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">4.9★</div>
              <div>User rating</div>
            </div>
          </motion.div>
        </div>

        {/* Preview cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative max-w-5xl mx-auto mt-20"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { bg: 'from-indigo-600 to-purple-700', name: 'Alex Johnson', role: 'Product Designer', email: 'alex@design.co' },
              { bg: 'from-emerald-600 to-teal-700', name: 'Sarah Chen', role: 'Software Engineer', email: 'sarah@tech.io' },
              { bg: 'from-rose-600 to-pink-700', name: 'Marcus Lee', role: 'Marketing Director', email: 'marcus@brand.com' },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + i * 0.1 }}
                className={`bg-gradient-to-br ${card.bg} rounded-2xl p-6 shadow-2xl border border-white/20`}
                style={{ transform: i === 1 ? 'scale(1.05)' : 'scale(0.97)' }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold">
                    {card.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-white">{card.name}</div>
                    <div className="text-white/70 text-sm">{card.role}</div>
                  </div>
                </div>
                <div className="text-white/60 text-xs">{card.email}</div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex-1 h-1 bg-white/20 rounded-full" />
                  <div className="w-8 h-8 bg-white/20 rounded-lg" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything you need</h2>
            <p className="text-white/60 text-lg max-w-xl mx-auto">
              Powerful tools made simple. Design professional cards without any design experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-6 transition-colors group"
              >
                <div className={`inline-flex p-3 bg-gradient-to-br ${feature.color} rounded-xl mb-4 shadow-lg`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Preview */}
      <section id="templates" className="py-24 px-4 sm:px-6 lg:px-8 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Start from a template</h2>
            <p className="text-white/60 text-lg max-w-xl mx-auto">
              Choose from 30+ professionally designed templates across 6 categories.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {['Corporate', 'Creative', 'Minimal', 'Tech', 'Social', 'Event'].map((cat, i) => (
              <div
                key={i}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 text-center text-sm font-medium cursor-pointer transition-colors hover:border-indigo-500/50"
              >
                {cat}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Executive Blue', cat: 'Corporate', bg: '#1e3a5f', accent: '#93c5fd' },
              { name: 'Vibrant Artist', cat: 'Creative', bg: 'linear-gradient(135deg, #f093fb, #f5576c)', accent: '#fff' },
              { name: 'Dev Dark', cat: 'Tech', bg: '#0d1117', accent: '#58d68d' },
              { name: 'Pure White', cat: 'Minimal', bg: '#fff', accent: '#111827' },
              { name: 'Influencer', cat: 'Social', bg: 'linear-gradient(45deg, #ff9a9e, #fecfef)', accent: '#7c3aed' },
              { name: 'Conference', cat: 'Event', bg: 'linear-gradient(135deg, #667eea, #764ba2)', accent: '#fff' },
            ].map((tmpl, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group relative rounded-xl overflow-hidden border border-white/10 hover:border-indigo-500/50 transition-colors cursor-pointer"
              >
                <div
                  className="h-40 p-4 flex flex-col justify-between"
                  style={{ background: tmpl.bg }}
                >
                  <div className="text-xs opacity-60" style={{ color: tmpl.accent }}>{tmpl.cat}</div>
                  <div>
                    <div className="font-bold text-lg" style={{ color: tmpl.accent }}>John Smith</div>
                    <div className="text-xs opacity-60" style={{ color: tmpl.accent }}>Senior Designer</div>
                  </div>
                </div>
                <div className="bg-white/5 px-4 py-3 flex items-center justify-between">
                  <span className="text-sm font-medium">{tmpl.name}</span>
                  <Link href="/editor" className="text-xs text-indigo-400 hover:text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    Use this →
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/editor"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors border border-white/20"
            >
              View all 30 templates
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Loved by creators</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-white/80 mb-6 text-sm leading-relaxed">&quot;{t.content}&quot;</p>
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-white/50 text-xs">{t.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl font-black mb-6">
              Ready to create your{' '}
              <span className="gradient-text">perfect card?</span>
            </h2>
            <p className="text-white/60 text-lg mb-10">
              Join thousands of professionals who use CardCrafter to make lasting first impressions.
            </p>
            <Link
              href="/editor"
              className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xl transition-all shadow-2xl shadow-indigo-500/25"
            >
              Start for free — no signup required
              <ArrowRight className="w-6 h-6" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm">CardCrafter</span>
          </div>
          <p className="text-white/40 text-sm">© 2024 CardCrafter. All rights reserved.</p>
          <div className="flex items-center gap-6 text-white/40 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
