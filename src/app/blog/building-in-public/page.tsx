import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'From Life Insurance to Full-Stack: My Journey Building in Public - AI Art Arena',
  description: 'Three years from selling insurance to deploying production apps. My journey using AI as a tool while doing the real architectural work.',
  openGraph: {
    title: 'From Life Insurance to Full-Stack: My Journey Building in Public',
    description: 'Three years from selling insurance to deploying production apps. My journey using AI as a tool while doing the real architectural work.',
    type: 'article',
  },
};

export default function BuildingInPublicPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        {/* Header */}
        <header className="mb-8">
          <Badge variant="default" className="mb-4 bg-blue-600">
            Building in Public
          </Badge>

          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            From Life Insurance to Full-Stack: My Journey Building in Public
          </h1>

          <p className="text-xl text-slate-400 mb-6">
            Three years from selling insurance to deploying production apps
          </p>

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 pb-6 border-b border-slate-300">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {format(new Date(), 'MMMM d, yyyy')}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              12 min read
            </div>
            <div>By Oliver</div>
          </div>
        </header>

        {/* Content */}
        <div className="bg-white rounded-lg p-8 md:p-12 mb-12 shadow-xl">
          <p className="text-slate-800 mb-4">
            Look, I'm not gonna pretend I knew what I was doing when I started this thing.
          </p>

          <p className="text-slate-800 mb-4">
            Three years ago I was selling life insurance. Hated every second of it. I'd make upwards of 300 calls a day, trying to sell insurance to people who were actively trying to get OFF this call list. My day oscillated between hoping people wouldn't pick up the phone, then hoping they wouldn't hang up on me. I wanted to build something, create something, but I had zero coding experience. Zero.
          </p>

          <p className="text-slate-800 mb-4">
            So I did what everyone does when they want to skip the hard part—bought into Go High Level. Thought drag-and-drop would be enough. Spoiler: it wasn't.
          </p>

          <p className="text-slate-800 mb-4">
            Then WordPress with page builders. Which was... better? But I still felt like I was fighting the tools instead of actually building anything. Like trying to assemble IKEA furniture but all the pieces are for different products and none of the instructions match. So I started writing my own PHP files. Editing themes. Breaking literally everything. Fixing it. Breaking it again. Learning very slowly that I had no idea how databases worked.
          </p>

          <p className="text-slate-800 mb-4">
            Every time I switched platforms people probably thought I was just indecisive. But it wasn't that. It was hitting walls and realizing "oh shit I'm not doing this as well as it could be done" and that bothered me way more than starting over. Which is probably a personality flaw but here we are.
          </p>

          <hr className="border-slate-300 my-8" />

          <h2 className="text-2xl font-bold text-slate-900 mb-4 mt-6">The Project Nobody Will Ever See</h2>

          <p className="text-slate-800 mb-4">
            About two years ago I built this real estate website for an agent in Las Vegas. Full WordPress setup with IDX Broker integration. Listing feeds, search functionality, all of it. That was the first time I had to connect an actual API and do backend work.
          </p>

          <p className="text-slate-800 mb-4">
            Except I didn't even know that's what it was called. I was just trying to make the damn listings show up on his site and Googling things like "how to make WordPress talk to other website" because I didn't know the terminology.
          </p>

          <p className="text-slate-800 mb-4">
            The agent was brand new. And if you know anything about Las Vegas real estate you know it's absolutely brutal. Like trying to break into Hollywood level of competitive. We couldn't get any traction. Project's basically dead now. I have nothing to show for it.
          </p>

          <div className="bg-blue-50 border-l-4 border-blue-600 pl-6 py-4 my-6 rounded-r-lg">
            <p className="text-slate-800 mb-0">
              And that's the thing about client work when you're starting out right? Their business fails, your work disappears with it. No portfolio piece. No proof you built anything. Just you sitting there knowing you did all that work with literally nothing to point to. It's the worst.
            </p>
          </div>

          <hr className="border-slate-300 my-8" />

          <h2 className="text-2xl font-bold text-slate-900 mb-4 mt-6">Wait, I'm a What Now?</h2>

          <p className="text-slate-800 mb-4">
            So I kept building stuff. Learning. Breaking things (I'm really good at that part). Using AI more and more because manually debugging was making me want to quit entirely.
          </p>

          <p className="text-slate-800 mb-4">
            Then like six months ago I'm talking to Claude about something code-related and I just randomly ask "hey how would you describe me and my ability to build websites" and Claude goes "you're a full-stack developer" and I'm just sitting there like... wait what?
          </p>

          <p className="text-slate-800 mb-4">
            So I Googled it. Full-stack developer. And I'm reading the definition and I'm realizing—oh. Oh shit. I've been doing this for over a year. APIs, databases, frontend stuff, authentication, deploying things. That's all full-stack. I just didn't know that's what you called it.
          </p>

          <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg p-8 my-8 text-center">
            <p className="text-xl md:text-2xl font-semibold text-blue-600 italic mb-0">
              An AI had to tell me what I was before I knew it myself. Which is kind of hilarious and kind of embarrassing but also perfectly sums up this whole journey.
            </p>
          </div>

          <p className="text-slate-800 mb-4">
            But the REAL aha moment? That happened last week.
          </p>

          <p className="text-slate-800 mb-4">
            I finally got AI Art Arena working to the point where I could actually show people. And I'm looking at everything I built—the auth system, the database setup, the real-time voting, the cron jobs that automatically cycle contests every week, the admin dashboard—and it hits me: I actually understand how all of this works now. Like really understand it. Not just "I copied this from Stack Overflow and it works" but genuine understanding of what I'm capable of building.
          </p>

          <p className="text-slate-800 mb-4">
            That's why I'm doing the whole building in public thing now. This is different from that Las Vegas site or any other client project that went nowhere. This is MINE. Even if the contest completely flops, I still have this functioning application I can point to and say "I built that."
          </p>

          <hr className="border-slate-300 my-8" />

          <h2 className="text-2xl font-bold text-slate-900 mb-4 mt-6">Okay So About AI Though</h2>

          <p className="text-slate-800 mb-4">
            Here's what I need you to understand and I know this might be controversial but whatever: Everything you see on this site was built with AI. Every line of code. Every image. Every word. And I'm not trying to hide it—I'm straight up celebrating it.
          </p>

          <p className="text-slate-800 mb-4">
            Because without AI? None of this exists.
          </p>

          <p className="text-slate-800 mb-4">
            But also—and this is important—<span className="text-blue-600 font-semibold">I'm the architect. AI is just the builder following my blueprints.</span> There's a huge difference.
          </p>

          <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">The Calculator Analogy</h3>

          <p className="text-slate-800 mb-4">
            You ever see Hidden Figures? That movie about the Black women who worked at NASA doing all the calculations for the space program? I didn't realize until I watched that movie that "computers" used to be PEOPLE. Like that was their job title. "Computer." Because they performed computations.
          </p>

          <p className="text-slate-800 mb-4">
            Then machines came along that could compute faster than humans and we started calling the machines "computers" instead of the people. But the humans were still doing all the thinking, all the architecture, all the decision-making. The machine just did the computation faster.
          </p>

          <div className="bg-blue-50 border-l-4 border-blue-600 rounded-r-lg pl-6 py-4 my-6">
            <p className="text-slate-800 mb-3">
              <strong>That's what AI is.</strong> It's a calculator for code. A printer for words. A computer for computation.
            </p>

            <p className="text-slate-800 mb-3">
              Calculators didn't make math obsolete—they made it faster. But you still need to know what equation to write. You still need to know if the answer makes sense or if you fat-fingered something.
            </p>

            <p className="text-slate-800 mb-3">
              Printers didn't make writing obsolete. They just made it way faster to produce copies. You still have to write the thing. Edit it. Make it actually good.
            </p>

            <p className="text-slate-800 mb-0">
              AI doesn't make development obsolete. It just makes execution faster. But you still need to architect the whole system. Evaluate if the code is secure. Debug when things break (which is constantly). Decide if this is even the right approach in the first place.
            </p>
          </div>

          <p className="text-blue-600 text-xl font-semibold text-center my-8">
            AI is only as good as the person using it and how much work you're willing to put in.
          </p>

          <hr className="border-slate-300 my-8" />

          <h2 className="text-2xl font-bold text-slate-900 mb-4 mt-6">The Work Nobody Sees</h2>

          <p className="text-slate-800 mb-4">
            When I built AI Art Arena I didn't just type "build me a voting platform" and watch it magically appear like some people seem to think AI works.
          </p>

          <p className="text-slate-800 mb-4">
            I had to design the entire system first. Like sitting down with a notebook and figuring out: What tables does the database need? How do we prevent someone from voting 50 times? What happens when a contest ends? How do we handle people who are logged in versus anonymous voters? What security stuff do we need so we don't immediately get hacked?
          </p>

          <p className="text-slate-800 mb-4">
            Then I had to translate all of that into extremely specific prompts for AI.
          </p>

          <p className="text-slate-800 mb-4">
            I'm not asking "make a voting system." I'm asking stuff like "I need a Next.js API route that checks if a user voted in the last 24 hours by querying their last vote timestamp, validates the artwork_id actually exists in the database, hashes their IP address with SHA-256 before storing it for privacy, increments the vote count atomically in Supabase so we don't get race conditions, and returns proper error codes for rate limiting, duplicate votes, and invalid artwork IDs."
          </p>

          <p className="text-slate-800 mb-4">
            And even then? AI's first attempt is usually wrong. Or it's right but not optimal. Or it works but doesn't handle edge cases I didn't think to mention.
          </p>

          <div className="bg-blue-50 border-l-4 border-blue-600 rounded-r-lg pl-6 py-4 my-6">
            <p className="text-slate-800 mb-3">
              So I read through the code. Test it. Break it. Realize it's not handling something properly. Regenerate with more specific requirements. Test again. Refactor because it doesn't fit with the rest of my architecture. Repeat this like 10-20 times per feature.
            </p>

            <p className="text-slate-800 mb-0">
              <strong>Every single feature in this app went through that process. Every. Single. One.</strong>
            </p>
          </div>

          <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">The Mental Work is All Mine</h3>

          <p className="text-slate-800 mb-4">
            When AI generates code I have to read every line and actually understand what it's doing. Not just copy-paste and hope. I need to:
          </p>

          <ul className="list-none space-y-3 mb-6">
            <li className="border-l-4 border-cyan-400 pl-5 py-3 bg-cyan-50 text-slate-700">Evaluate if it's secure (is this vulnerable to SQL injection?)</li>
            <li className="border-l-4 border-cyan-400 pl-5 py-3 bg-cyan-50 text-slate-700">Check if it handles errors properly</li>
            <li className="border-l-4 border-cyan-400 pl-5 py-3 bg-cyan-50 text-slate-700">Test edge cases AI didn't consider</li>
            <li className="border-l-4 border-cyan-400 pl-5 py-3 bg-cyan-50 text-slate-700">Refactor it to fit my existing code</li>
            <li className="border-l-4 border-cyan-400 pl-5 py-3 bg-cyan-50 text-slate-700">Debug when it inevitably breaks</li>
            <li className="border-l-4 border-cyan-400 pl-5 py-3 bg-cyan-50 text-slate-700">Decide if this is even the right approach</li>
          </ul>

          <p className="text-slate-800 mb-4">
            The mental work is all mine. The architecture, the decision-making, the vision, the hundreds of iterations, all the evaluation and refinement. AI just speeds up the actual typing part.
          </p>

          <p className="text-slate-800 mb-4">
            You know how before AI I mentioned getting frustrated with debugging? Manually hunting for a missing semicolon in C++ was enough to make me want to quit programming entirely. I think that's why I barely use punctuation in half my messages now—somewhere in my brain I'm still traumatized from hunting for that one missing comma that broke everything and I just... never put them back.
          </p>

          <p className="text-slate-800 mb-4">
            But with AI I can focus on the logic. The architecture. The design. The stuff my brain is actually good at. And when I screw something up (which is often) AI helps me debug way faster than I could alone.
          </p>

          <p className="text-blue-600 text-lg font-semibold mt-6">
            The tool changed. The work is still there. Just like calculators, printers, and those NASA computers.
          </p>

          <hr className="border-slate-300 my-8" />

          <h2 className="text-2xl font-bold text-slate-900 mb-4 mt-6">What I Actually Built</h2>

          <p className="text-slate-800 mb-4">
            This portfolio site you're on? AI Art Arena? I designed every piece of it. Then used AI to help me build what I designed.
          </p>

          <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-6 my-8">
            <h3 className="text-2xl font-bold text-blue-600 mb-6 mt-0">The Tech Stack</h3>
            <ul className="list-none grid md:grid-cols-2 gap-4">
              <li className="border-l-4 border-cyan-400 pl-4 py-3 bg-cyan-50 text-slate-800 font-medium">✓ Next.js 14 with TypeScript</li>
              <li className="border-l-4 border-cyan-400 pl-4 py-3 bg-cyan-50 text-slate-800 font-medium">✓ Supabase for backend</li>
              <li className="border-l-4 border-cyan-400 pl-4 py-3 bg-cyan-50 text-slate-800 font-medium">✓ NextAuth - GitHub, Google, email</li>
              <li className="border-l-4 border-cyan-400 pl-4 py-3 bg-cyan-50 text-slate-800 font-medium">✓ Real-time voting system</li>
              <li className="border-l-4 border-cyan-400 pl-4 py-3 bg-cyan-50 text-slate-800 font-medium">✓ Automated weekly cron jobs</li>
              <li className="border-l-4 border-cyan-400 pl-4 py-3 bg-cyan-50 text-slate-800 font-medium">✓ Admin dashboard with RBAC</li>
              <li className="border-l-4 border-cyan-400 pl-4 py-3 bg-cyan-50 text-slate-800 font-medium">✓ Security & rate limiting</li>
            </ul>
          </div>

          <p className="text-slate-800 mb-4">For every feature I had to know:</p>

          <ul className="list-none space-y-4 mb-8">
            <li className="border-l-4 border-blue-500 pl-6 py-4 bg-blue-900/30 rounded-r-lg">
              <strong className="text-blue-600 text-lg">WHAT</strong>
              <span className="text-slate-700 ml-2">to build (the requirements)</span>
            </li>
            <li className="border-l-4 border-blue-500 pl-6 py-4 bg-blue-900/30 rounded-r-lg">
              <strong className="text-blue-600 text-lg">WHY</strong>
              <span className="text-slate-700 ml-2">it needs to work this way (the logic)</span>
            </li>
            <li className="border-l-4 border-blue-500 pl-6 py-4 bg-blue-900/30 rounded-r-lg">
              <strong className="text-blue-600 text-lg">HOW</strong>
              <span className="text-slate-700 ml-2">to structure it (the architecture)</span>
            </li>
            <li className="border-l-4 border-blue-500 pl-6 py-4 bg-blue-900/30 rounded-r-lg">
              <strong className="text-blue-600 text-lg">WHEN</strong>
              <span className="text-slate-700 ml-2">AI's solution is actually wrong (evaluation)</span>
            </li>
          </ul>

          <div className="bg-blue-50 border-l-4 border-blue-600 rounded-r-lg pl-6 py-4 my-6">
            <p className="text-slate-800 mb-3">
              Could I have built this without AI? Honestly no. The manual typing, the semicolon debugging, the endless documentation reading—it would have broken me. I would have given up.
            </p>

            <p className="text-slate-800 mb-3">But did AI "build" this? Also no.</p>

            <p className="text-slate-800 mb-0">
              <strong>I built this. AI was my tool.</strong>
            </p>
          </div>

          <hr className="border-slate-300 my-8" />

          <h2 className="text-2xl font-bold text-slate-900 mb-4 mt-6">Why I'm Doing This Publicly Instead of Just Building in Private</h2>

          <p className="text-slate-800 mb-4">
            Client projects disappear. The Las Vegas site? Gone. All that work—the API integration, the custom functionality, the problem-solving—just gone. Building in public means I always have proof of what I built regardless of whether the actual project succeeds. Which feels important when you're trying to prove you can do this work.
          </p>

          <h3 className="text-xl font-semibold text-slate-900 mb-3 mt-4">What Building in Public Gives You</h3>

          <p className="text-slate-800 mb-3">
            <strong className="text-blue-600">You learn way more when people can see your work.</strong> If I'm building in private and making architectural mistakes I'll never know. Building in public means someone with more expertise can tell me "hey here's a better way to do that" and I actually want that feedback. I need it honestly.
          </p>

          <p className="text-slate-800 mb-3">
            <strong className="text-blue-600">It creates a portfolio as you go.</strong> I'm not waiting until everything is perfect to show people because perfect never happens. Every commit, every feature, every iteration is visible. That feels more valuable than a polished final product with zero context about how you got there.
          </p>

          <p className="text-slate-800 mb-3">
            <strong className="text-blue-600">It holds you accountable in a weird way.</strong> When you publicly say "I'm building this" people kind of expect to see progress. Which keeps you moving forward instead of abandoning projects when they get hard (which I've definitely done before).
          </p>

          <p className="text-slate-800 mb-4">
            <strong className="text-blue-600">It shows the reality.</strong> If you're switching careers into development you need to see that it's not a straight line. That people rebuild stuff multiple times. That you don't need to understand everything before you start. Building in public shows the messy reality instead of just the highlight reel.
          </p>

          <hr className="border-slate-300 my-8" />

          <h2 className="text-2xl font-bold text-slate-900 mb-4 mt-6">I Still Don't Know What I'm Doing (Sometimes)</h2>

          <p className="text-slate-800 mb-4">
            Full transparency: I've built a functional full-stack app and I'm proud of it. But I know there are people who could look at my code architecture and immediately spot like ten things I could do better. Probably more than ten honestly.
          </p>

          <p className="text-blue-600 text-lg font-semibold mb-4">And I want that feedback.</p>

          <p className="text-slate-800 mb-4">
            If you're a developer with way more expertise than me (which let's be real is probably most developers) I'd love to connect. Not because I want you to fix my code for free—that's not what I'm asking. But having a few people I can learn from, who can look at my architectural decisions and tell me "here's a better approach" or "this works but here's why it might cause problems later"—that would be incredibly valuable.
          </p>

          <p className="text-slate-800 mb-4">
            I'm building in public which means showing the messy parts. The stuff I don't know. The places where I'm probably doing it wrong but it works so I shipped it anyway because done is better than perfect.
          </p>

          <p className="text-slate-800 mb-4">
            <strong>If you see something that could be better—code architecture, database design, security practices, deployment strategies, whatever—tell me. I legitimately want to learn.</strong>
          </p>

          <hr className="border-slate-300 my-8" />

          <h2 className="text-2xl font-bold text-slate-900 mb-4 mt-6">The Actual Story Here</h2>

          <p className="text-slate-800 mb-4">
            This isn't about AI building things for people. It's about using the right tool to remove barriers while still putting in the real work to architect, evaluate, and refine.
          </p>

          <p className="text-slate-800 mb-4">
            Calculators didn't make mathematicians obsolete. Printers didn't make writers obsolete. Machine computers didn't make NASA's thinking obsolete. The tools changed. The work evolved. Humans still do the thinking.
          </p>

          <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg p-8 my-8 text-center">
            <p className="text-xl md:text-2xl font-semibold text-blue-600 italic mb-0">
              AI is the latest tool in that evolution. And like every tool before it, it's only as good as the person using it.
            </p>
          </div>

          <p className="text-slate-800 mb-4">
            I'm the architect. AI is my builder. But I'm drawing detailed blueprints, checking every measurement, iterating until it's right.
          </p>

          <p className="text-slate-800 mb-4">
            That's building in public. That's using AI as a tool. That's what I'm doing at{' '}
            <a href="https://olliedoesis.dev" className="text-cyan-400 hover:underline">
              olliedoesis.dev
            </a>.
          </p>

          <p className="text-blue-600 text-xl font-bold text-center my-8">
            Come check it out. Tell me what I'm doing wrong. Let's build something together.
          </p>

          <p className="text-center text-cyan-400 font-semibold text-lg mt-8">
            Follow along: #buildinpublic
          </p>

          <p className="text-center text-blue-400 font-bold text-xl mt-6">
            This is just the beginning.
          </p>
        </div>

        {/* Footer */}
        <footer className="pt-8 border-t border-slate-300">
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
