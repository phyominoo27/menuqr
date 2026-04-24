import Link from 'next/link'
import { QrCode, Menu, Globe, Download, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <QrCode className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900">MenuQR</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="gradient-primary text-white px-5 py-2 rounded-xl font-semibold hover:opacity-90 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Globe className="w-4 h-4" />
            🇲🇲 Built for Myanmar + 🇬🇧 English
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight leading-tight">
            Your menu,
            <br />
            <span className="text-gradient">in a QR code</span>
          </h1>
          <p className="text-xl text-gray-500 mt-6 max-w-2xl mx-auto leading-relaxed">
            Create bilingual menus in minutes. Generate QR codes. Let customers browse on their phone — no app download needed.
          </p>
          <div className="flex items-center justify-center gap-4 mt-10">
            <Link
              href="/signup"
              className="gradient-primary text-white px-8 py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all inline-flex items-center gap-2"
            >
              Create Free Menu
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/m/demo"
              className="text-gray-600 hover:text-gray-900 font-semibold px-8 py-4 rounded-2xl border border-gray-200 hover:border-gray-300 transition-all"
            >
              See Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything you need
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Menu,
                title: 'Bilingual Menus',
                desc: 'Burmese + English. Customers toggle language instantly.',
              },
              {
                icon: QrCode,
                title: 'QR Code Generator',
                desc: 'Print-ready PNG + PDF. Per-table or per-menu codes.',
              },
              {
                icon: Globe,
                title: 'No App Needed',
                desc: 'Works in any phone browser. iOS, Android, Huawei.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 card-shadow hover:card-shadow-hover transition-all">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
                <p className="text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready in under 5 minutes</h2>
          <p className="text-gray-500 text-lg mb-8">Sign up → Create menu → Print QR codes → Done</p>
          <Link
            href="/signup"
            className="gradient-primary text-white px-10 py-4 rounded-2xl font-bold text-lg hover:opacity-90 transition-all inline-flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Start for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-gray-400 text-sm">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4" />
            <span className="font-semibold text-gray-600">MenuQR</span>
          </div>
          <p>Free forever. Made for Myanmar restaurants 🇲🇲</p>
        </div>
      </footer>
    </div>
  )
}
