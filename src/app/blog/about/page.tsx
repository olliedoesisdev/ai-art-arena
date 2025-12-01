import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, Clock, ArrowLeft, Code2, Database, Palette } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Me - AI Art Arena',
  description: 'From life insurance to full-stack development - my journey into AI-powered web applications',
  openGraph: {
    title: 'About Me - AI Art Arena',
    description: 'From life insurance to full-stack development - my journey into AI-powered web applications',
    type: 'article',
  },
};

export default function BlogAboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        {/* Header */}
        <header className="mb-8">
          {/* Category */}
          <Badge
            variant="default"
            className="mb-4 bg-purple-600"
          >
            Personal
          </Badge>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            About Me: From Life Insurance to Full-Stack Development
          </h1>

          {/* Excerpt */}
          <p className="text-xl text-slate-400 mb-6">
            My journey from selling life insurance to building AI-powered web applications, and why I'm passionate about building in public.
          </p>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 pb-6 border-b border-slate-700">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {format(new Date(), 'MMMM d, yyyy')}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              8 min read
            </div>
            <div>
              By Alex Photon
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="prose prose-invert max-w-none mb-12">
          {/* The Beginning */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4 mt-6">The Beginning</h2>
            <p className="text-slate-300 mb-4">
              I used to sell life insurance. Not the flashy kind with big commissions – the kind where you sit across from families,
              help them plan for the worst, and hope they never need it. It was meaningful work, but it wasn't mine.
            </p>
            <p className="text-slate-300 mb-4">
              What I loved was the spreadsheets. The models. The systems. I'd build calculators in Excel that could project cash
              values 40 years into the future, test scenarios, automate quotes. My boss thought I was just thorough. I was obsessed.
            </p>
          </section>

          {/* The Project Nobody Will See */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4 mt-6">The Project Nobody Will See</h2>
            <p className="text-slate-300 mb-4">
              One day I thought: <em>What if I could turn this into a web app?</em> Not for clients – for me. Just to see if I could.
            </p>
            <p className="text-slate-300 mb-4">
              I started with HTML and CSS. Then JavaScript. Then I hit a wall: I needed a backend. So I learned Node.js. Then I
              needed a database. So I learned SQL. Then I needed authentication. So I learned JWTs and sessions and bcrypt.
            </p>
            <p className="text-slate-300 mb-4">
              Six months later, I had a fully functional life insurance quoting platform. It had user accounts, PDF generation,
              email notifications, premium calculations, the works.
            </p>
            <p className="text-slate-300 mb-4">
              Nobody ever used it. Not one person. But I didn't care – I was hooked.
            </p>
          </section>

          {/* Wait, I'm a What Now? */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4 mt-6">Wait, I'm a <em>What</em> Now?</h2>
            <p className="text-slate-300 mb-4">
              I didn't wake up one day and call myself a developer. I just kept building. I'd finish one project and immediately
              start another. A task manager. A recipe app. A budgeting tool. Each one taught me something new.
            </p>
            <p className="text-slate-300 mb-4">
              Then one day, someone asked me what I did for a living. I said "life insurance" out of habit, but it felt wrong.
              Because by that point, I was spending 40 hours a week at my job and 40 hours a week coding.
            </p>
            <p className="text-slate-300 mb-4">
              So I quit. No safety net. No job lined up. Just a portfolio of projects nobody had ever seen and a belief that I
              could figure it out.
            </p>
            <p className="text-slate-300 mb-4">
              Turns out, I could.
            </p>
          </section>

          {/* AI as a Tool, Not a Threat */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4 mt-6">AI as a Tool, Not a Threat</h2>
            <p className="text-slate-300 mb-4">
              Here's the thing people get wrong about AI: it's not replacing developers. It's replacing the parts of development
              that don't require thinking.
            </p>
            <p className="text-slate-300 mb-4">
              Think of it this way:
            </p>

            <div className="grid md:grid-cols-3 gap-6 my-8">
              <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
                <div className="text-4xl mb-4">🧮</div>
                <h3 className="text-lg font-semibold text-white mb-2">Calculator</h3>
                <p className="text-slate-400 text-sm">
                  Did calculators replace mathematicians? No – they freed them to solve harder problems.
                </p>
              </div>
              <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
                <div className="text-4xl mb-4">🖨️</div>
                <h3 className="text-lg font-semibold text-white mb-2">Printer</h3>
                <p className="text-slate-400 text-sm">
                  Did printers replace writers? No – they let more people share ideas.
                </p>
              </div>
              <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
                <div className="text-4xl mb-4">💻</div>
                <h3 className="text-lg font-semibold text-white mb-2">Computer</h3>
                <p className="text-slate-400 text-sm">
                  Did computers replace developers? No – they created the field.
                </p>
              </div>
            </div>

            <p className="text-slate-300 mb-4">
              AI is the same. It writes boilerplate so I don't have to. It catches bugs I'd miss. It suggests patterns I wouldn't
              think of. But it doesn't decide what to build, or why, or for whom.
            </p>
            <p className="text-slate-300 mb-4">
              That's still on me.
            </p>
          </section>

          {/* The Work Nobody Sees */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4 mt-6">The Work Nobody Sees</h2>
            <p className="text-slate-300 mb-4">
              AI Art Arena started as a weekend experiment. I wanted to see if I could build a voting platform for AI-generated
              art. Not because anyone asked for it – because I was curious.
            </p>
            <p className="text-slate-300 mb-4">
              But here's what nobody sees:
            </p>
            <ul className="list-disc list-inside text-slate-300 mb-4 space-y-2">
              <li>The 12 hours I spent debugging Supabase RLS policies</li>
              <li>The 6 rewrites of the voting logic before it felt right</li>
              <li>The 3am sessions refactoring TypeScript types</li>
              <li>The documentation I read cover-to-cover because I didn't understand Next.js caching</li>
              <li>The git commits with messages like "please work" and "WHY"</li>
            </ul>
            <p className="text-slate-300 mb-4">
              That's the real work. Not the polished landing page or the clean UI – the grind. The learning. The iteration.
            </p>
          </section>

          {/* What I've Built */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4 mt-6">What I've Built</h2>
            <p className="text-slate-300 mb-4">
              AI Art Arena is a full-stack Next.js application with:
            </p>

            <div className="grid md:grid-cols-2 gap-6 my-8">
              <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
                <Code2 className="w-8 h-8 text-blue-400 mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Frontend</h3>
                <ul className="text-slate-400 text-sm space-y-1">
                  <li>• Next.js 14 with App Router</li>
                  <li>• TypeScript for type safety</li>
                  <li>• Tailwind CSS for styling</li>
                  <li>• Server and client components</li>
                </ul>
              </div>

              <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
                <Database className="w-8 h-8 text-green-400 mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Backend</h3>
                <ul className="text-slate-400 text-sm space-y-1">
                  <li>• Supabase (PostgreSQL)</li>
                  <li>• Row Level Security policies</li>
                  <li>• Real-time subscriptions</li>
                  <li>• Server-side auth</li>
                </ul>
              </div>

              <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
                <Palette className="w-8 h-8 text-purple-400 mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Features</h3>
                <ul className="text-slate-400 text-sm space-y-1">
                  <li>• Weekly AI art contests</li>
                  <li>• Email-based voting system</li>
                  <li>• Admin dashboard</li>
                  <li>• Contest archive</li>
                </ul>
              </div>

              <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
                <Code2 className="w-8 h-8 text-orange-400 mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Developer Experience</h3>
                <ul className="text-slate-400 text-sm space-y-1">
                  <li>• Git version control</li>
                  <li>• TypeScript strict mode</li>
                  <li>• Component-driven architecture</li>
                  <li>• Responsive design</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Why I'm Building in Public */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4 mt-6">Why I'm Building in Public</h2>
            <p className="text-slate-300 mb-4">
              I'm not doing this for validation. I'm doing it because I remember being that person who didn't think they could
              code. Who thought "developer" was something you were born as, not something you became.
            </p>
            <p className="text-slate-300 mb-4">
              I'm building in public because:
            </p>
            <ul className="list-disc list-inside text-slate-300 mb-4 space-y-2">
              <li>It holds me accountable</li>
              <li>It forces me to explain my decisions</li>
              <li>It shows the messy middle, not just the polished end</li>
              <li>It proves that you don't need a CS degree or 10 years of experience to ship real products</li>
            </ul>
            <p className="text-slate-300 mb-4">
              If you're reading this and thinking "I could never do that" – you're wrong. You absolutely could. You just haven't
              started yet.
            </p>
          </section>

          {/* What's Next */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4 mt-6">What's Next</h2>
            <p className="text-slate-300 mb-4">
              AI Art Arena is live. It works. People can vote, browse archives, and see contest results. But I'm not done.
            </p>
            <p className="text-slate-300 mb-4">
              I'm adding:
            </p>
            <ul className="list-disc list-inside text-slate-300 mb-4 space-y-2">
              <li>Artist profiles and submission history</li>
              <li>Social sharing for contest results</li>
              <li>Email notifications for new contests</li>
              <li>Advanced analytics and insights</li>
              <li>Community features and discussions</li>
            </ul>
            <p className="text-slate-300 mb-4">
              Not because I have to. Because I want to. Because building is what I do now.
            </p>
          </section>

          {/* Connect */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4 mt-6">Let's Connect</h2>
            <p className="text-slate-300 mb-4">
              I'm always happy to chat about development, AI tools, or building in public. You can find me on:
            </p>
            <ul className="list-disc list-inside text-slate-300 mb-4 space-y-2">
              <li>
                <strong>GitHub:</strong>{' '}
                <a
                  href="https://github.com/AlexPhoton"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @AlexPhoton
                </a>
              </li>
              <li>
                <strong>Twitter:</strong>{' '}
                <a
                  href="https://twitter.com/AlexPhotonDev"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @AlexPhotonDev
                </a>
              </li>
              <li>
                <strong>Email:</strong>{' '}
                <a
                  href="mailto:alex@aiartarena.com"
                  className="text-primary hover:underline"
                >
                  alex@aiartarena.com
                </a>
              </li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <footer className="pt-8 border-t border-slate-700">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all posts
          </Link>
        </footer>
      </article>
    </div>
  );
}
