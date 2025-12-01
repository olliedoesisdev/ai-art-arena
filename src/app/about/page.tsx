import Link from "next/link";
import { Trophy, Heart, Github, Calculator, Printer, Rocket } from "lucide-react";
import { SITE_CONFIG, ROUTES } from "@/lib/constants";

export const metadata = {
  title: `About - ${SITE_CONFIG.name}`,
  description: "From life insurance to full-stack development. My journey building AI Art Arena in public using AI as a tool.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full mb-6 shadow-lg">
              <Heart className="w-4 h-4 text-white" />
              <span className="text-sm text-white font-medium">#BuildingInPublic</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
              From Life Insurance to Full-Stack
            </h1>

            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
              My journey building in public (and why I think AI is just a really good calculator)
            </p>
          </div>
        </div>
      </section>

      {/* The Beginning */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto prose prose-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Look, I'm not gonna pretend I knew what I was doing when I started this thing.
          </h2>

          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Three years ago I was selling life insurance. Hated every second of it. Like the kind of hate where you're sitting in traffic going to work and you're actively trying to think of legitimate excuses to turn around. I wanted to build something, create something, but I had zero coding experience. Zero.
          </p>

          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            So I did what everyone does when they want to skip the hard part—bought into Go High Level. Thought drag-and-drop would be enough. Spoiler: it wasn't.
          </p>

          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Then WordPress with page builders. Which was... better? But I still felt like I was fighting the tools instead of actually building anything. Like trying to assemble IKEA furniture but all the pieces are for different products and none of the instructions match. So I started writing my own PHP files. Editing themes. Breaking literally everything. Fixing it. Breaking it again. Learning very slowly that I had no idea how databases worked.
          </p>

          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Every time I switched platforms people probably thought I was just indecisive. But it wasn't that. It was hitting walls and realizing "oh shit I'm not doing this as well as it could be done" and that bothered me way more than starting over. Which is probably a personality flaw but here we are.
          </p>
        </div>
      </section>

      {/* The Project Nobody Will Ever See */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              The Project Nobody Will Ever See
            </h2>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              About two years ago I built this real estate website for an agent in Las Vegas. Full WordPress setup with IDX Broker integration. Listing feeds, search functionality, all of it. That was the first time I had to connect an actual API and do backend work.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Except I didn't even know that's what it was called. I was just trying to make the damn listings show up on his site and Googling things like "how to make WordPress talk to other website" because I didn't know the terminology.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              The agent was brand new. And if you know anything about Las Vegas real estate you know it's absolutely brutal. Like trying to break into Hollywood level of competitive. We couldn't get any traction. Project's basically dead now. I have nothing to show for it.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              And that's the thing about client work when you're starting out right? Their business fails, your work disappears with it. No portfolio piece. No proof you built anything. Just you sitting there knowing you did all that work with literally nothing to point to.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed">
              And honestly? If I'd had a developer friend back then—someone I could ask "hey is this approach stupid" or "am I building this the hardest way possible"—I might've avoided some dead ends. But I was just figuring it out alone, Googling everything, hoping I was doing it right.
            </p>

            <p className="text-lg font-semibold text-gray-900 mt-6">
              It's the worst.
            </p>
          </div>
        </div>
      </section>

      {/* Wait, I'm a What Now? */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Wait, I'm a What Now?
          </h2>

          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            So I kept building stuff. Learning. Breaking things (I'm really good at that part). Using AI more and more because manually debugging was making me want to quit entirely.
          </p>

          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Then like six months ago I'm talking to Claude about something code-related and I just randomly ask "hey how would you describe me and my ability to build websites" and Claude goes "you're a full-stack developer" and I'm just sitting there like... wait what?
          </p>

          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            So I Googled it. Full-stack developer. And I'm reading the definition and I'm realizing—oh. Oh shit. I've been doing this for over a year. APIs, databases, frontend stuff, authentication, deploying things. That's all full-stack. I just didn't know that's what you called it.
          </p>

          <p className="text-lg font-semibold text-gray-900 mb-6">
            An AI had to tell me what I was before I knew it myself.
          </p>

          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Which is kind of hilarious and kind of embarrassing but also perfectly sums up this whole journey.
          </p>

          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            This is why I think we need more people building in public and sharing what they learn. I literally didn't know what to call myself until an AI told me. How many other people are out there doing the work but have no idea what category they fit into? Or what they should learn next? We need to talk to each other more.
          </p>

          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            But the REAL aha moment? That happened last week.
          </p>

          <p className="text-lg text-gray-700 leading-relaxed">
            I finally got AI Art Arena working to the point where I could actually show people. And I'm looking at everything I built—the auth system, the database setup, the real-time voting, the cron jobs that automatically cycle contests every week, the admin dashboard—and it hits me: I actually understand how all of this works now. Like really understand it. Not just "I copied this from Stack Overflow and it works" but genuine understanding of what I'm capable of building.
          </p>

          <div className="bg-gradient-to-br from-orange-50 to-pink-50 border border-orange-200 rounded-xl p-8 mt-8">
            <p className="text-lg text-gray-900 font-medium">
              That's why I'm doing the whole building in public thing now. This is different from that Las Vegas site or any other client project that went nowhere. This is MINE. Even if the contest completely flops, I still have this functioning application I can point to and say "I built that."
            </p>
          </div>
        </div>
      </section>

      {/* AI as a Tool */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Okay So About AI Though
            </h2>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Here's what I need you to understand and I know this might be controversial but whatever: Everything you see on this site was built with AI. Every line of code. Every image. Every word. And I'm not trying to hide it—I'm straight up celebrating it.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Because without AI? None of this exists.
            </p>

            <p className="text-lg font-semibold text-gray-900 mb-6">
              But also—and this is important—I'm the architect. AI is just the builder following my blueprints. There's a huge difference.
            </p>

            <div className="grid md:grid-cols-3 gap-6 my-12">
              <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calculator className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Calculators</h3>
                <p className="text-gray-600 text-sm">
                  Didn't make math obsolete—they made it faster
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Printer className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Printers</h3>
                <p className="text-gray-600 text-sm">
                  Didn't make writing obsolete—they made copies faster
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Rocket className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Computers</h3>
                <p className="text-gray-600 text-sm">
                  Didn't replace NASA's thinking—they computed faster
                </p>
              </div>
            </div>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              You ever see Hidden Figures? That movie about the Black women who worked at NASA doing all the calculations for the space program? I didn't realize until I watched that movie that "computers" used to be PEOPLE. Like that was their job title. "Computer." Because they computed things.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Then machines came along that could compute faster than humans and we started calling the machines "computers" instead of the people. But the humans were still doing all the thinking, all the architecture, all the decision-making. The machine just did the computation faster.
            </p>

            <p className="text-lg font-semibold text-gray-900 mb-6">
              That's what AI is. It's a calculator for code. A printer for words. A computer for computation.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              AI doesn't make development obsolete. It just makes execution faster. But you still need to architect the whole system. Evaluate if the code is secure. Debug when things break (which is constantly). Decide if this is even the right approach in the first place.
            </p>

            <p className="text-lg font-semibold text-gray-900">
              AI is only as good as the person using it and how much work you're willing to put in.
            </p>
          </div>
        </div>
      </section>

      {/* The Work Nobody Sees */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            The Work Nobody Sees
          </h2>

          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            When I built AI Art Arena I didn't just type "build me a voting platform" and watch it magically appear like some people seem to think AI works.
          </p>

          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            I had to design the entire system first. Like sitting down with a notebook and figuring out: What tables does the database need? How do we prevent someone from voting 50 times? What happens when a contest ends? How do we handle people who are logged in versus anonymous voters? What security stuff do we need so we don't immediately get hacked?
          </p>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-8 mb-8">
            <p className="text-base text-gray-800 font-mono leading-relaxed">
              I'm not asking "make a voting system." I'm asking stuff like "I need a Next.js API route that checks if a user voted in the last 24 hours by querying their last vote timestamp, validates the artwork_id actually exists in the database, hashes their IP address with SHA-256 before storing it for privacy, increments the vote count atomically in Supabase so we don't get race conditions, and returns proper error codes for rate limiting, duplicate votes, and invalid artwork IDs."
            </p>
          </div>

          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            And even then? AI's first attempt is usually wrong. Or it's right but not optimal. Or it works but doesn't handle edge cases I didn't think to mention.
          </p>

          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            So I read through the code. Test it. Break it. Realize it's not handling something properly. Regenerate with more specific requirements. Test again. Refactor because it doesn't fit with the rest of my architecture. Repeat this like 10-20 times per feature.
          </p>

          <p className="text-lg font-semibold text-gray-900 mb-6">
            Every single feature in this app went through that process. Every. Single. One.
          </p>

          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            And yeah, if you're reading this and thinking "he's doing X wrong"—PLEASE tell me. That's literally why I'm writing this. I'd rather know now than six months from now when I have to rebuild everything.
          </p>

          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            The mental work is all mine. The architecture, the decision-making, the vision, the hundreds of iterations, all the evaluation and refinement. AI just speeds up the actual typing part.
          </p>

          <p className="text-lg font-semibold text-gray-900">
            The tool changed. The work is still there.
          </p>
        </div>
      </section>

      {/* What I Actually Built */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              What I Actually Built
            </h2>

            <div className="bg-white border border-gray-200 rounded-xl p-8 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">The Tech Stack</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-orange-500 mr-3">•</span>
                  <span><strong>Next.js 14 with TypeScript</strong> - my choice, not AI's suggestion</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-3">•</span>
                  <span><strong>Supabase for backend</strong> - looked at like five different options and picked this one</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-3">•</span>
                  <span><strong>NextAuth</strong> - GitHub, Google, and email magic links (designed the whole auth flow)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-3">•</span>
                  <span><strong>Real-time voting</strong> - 24-hour cooldowns (had to architect all that logic myself)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-3">•</span>
                  <span><strong>Automated weekly cycles</strong> - Vercel cron jobs (took me forever to figure out the scheduling)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-3">•</span>
                  <span><strong>Admin dashboard</strong> - role-based access control (designed the entire permissions system)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-3">•</span>
                  <span><strong>Security measures</strong> - rate limiting, IP hashing (went down a rabbit hole researching best practices)</span>
                </li>
              </ul>
            </div>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              For every feature I had to know:
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white border border-orange-200 rounded-lg p-6">
                <h4 className="font-bold text-gray-900 mb-2">WHAT to build</h4>
                <p className="text-gray-600 text-sm">The requirements</p>
              </div>
              <div className="bg-white border border-pink-200 rounded-lg p-6">
                <h4 className="font-bold text-gray-900 mb-2">WHY it needs to work this way</h4>
                <p className="text-gray-600 text-sm">The logic</p>
              </div>
              <div className="bg-white border border-purple-200 rounded-lg p-6">
                <h4 className="font-bold text-gray-900 mb-2">HOW to structure it</h4>
                <p className="text-gray-600 text-sm">The architecture</p>
              </div>
              <div className="bg-white border border-blue-200 rounded-lg p-6">
                <h4 className="font-bold text-gray-900 mb-2">WHEN AI's solution is wrong</h4>
                <p className="text-gray-600 text-sm">Evaluation</p>
              </div>
            </div>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              Could I have built this without AI? Honestly no. The manual typing, the semicolon debugging, the endless documentation reading—it would have broken me. I would have given up.
            </p>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              But did AI "build" this? Also no.
            </p>

            <p className="text-lg font-semibold text-gray-900">
              I built this. AI was my tool.
            </p>
          </div>
        </div>
      </section>

      {/* Why Building in Public */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Why I'm Doing This Publicly
          </h2>

          <div className="space-y-6 mb-8">
            <div className="bg-gradient-to-br from-orange-50 to-pink-50 border border-orange-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">You learn way more</h3>
              <p className="text-gray-700">
                If I'm building in private and making architectural mistakes I'll never know. Building in public means someone with more expertise can tell me "hey here's a better way to do that" and I actually want that feedback. I need it honestly.
              </p>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">It creates a portfolio as you go</h3>
              <p className="text-gray-700">
                I'm not waiting until everything is perfect to show people because perfect never happens. Every commit, every feature, every iteration is visible. That feels more valuable than a polished final product with zero context about how you got there.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">It holds you accountable</h3>
              <p className="text-gray-700">
                When you publicly say "I'm building this" people kind of expect to see progress. Which keeps you moving forward instead of abandoning projects when they get hard (which I've definitely done before).
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">It shows the reality</h3>
              <p className="text-gray-700">
                If you're switching careers into development you need to see that it's not a straight line. That people rebuild stuff multiple times. That you don't need to understand everything before you start. Building in public shows the messy reality instead of just the highlight reel.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Connect */}
      <section className="bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
              Building With People, Not Just Code
            </h2>

            <p className="text-lg leading-relaxed mb-6 text-white/90">
              Look, I'm not trying to be salesy here or push anything on you. But I'm genuinely looking for people to build alongside. Not clients. Not followers. Just... people.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
                <h3 className="font-bold text-lg mb-3">Developers</h3>
                <p className="text-sm text-white/90">
                  If you know more than me, I'd love to pick your brain sometimes. Review my architecture, share knowledge, collaborate.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
                <h3 className="font-bold text-lg mb-3">Career Switchers</h3>
                <p className="text-sm text-white/90">
                  Earlier in the journey than me? Ask me anything about Next.js, Supabase, authentication, deployment, whatever.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
                <h3 className="font-bold text-lg mb-3">Anyone Building</h3>
                <p className="text-sm text-white/90">
                  Just want to talk about what we're building? Share the journey? Let's connect.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                href={ROUTES.contest}
                className="inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-gray-100 text-gray-900 text-lg font-semibold rounded-lg transition-all shadow-xl"
              >
                <Trophy className="w-5 h-5 mr-2" />
                View AI Art Arena
              </Link>
              <Link
                href="https://github.com/olliedoesis"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-lg font-semibold rounded-lg transition-all border border-white/30"
              >
                <Github className="w-5 h-5 mr-2" />
                GitHub
              </Link>
            </div>

            <p className="text-center text-white/90">
              Because honestly? Learning to code alone kind of sucks. Having people to share the journey with makes it way better.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Let's Build Something Together
          </h2>

          <p className="text-xl text-gray-600 mb-8">
            This is just the beginning.
          </p>

          <div className="bg-gradient-to-br from-orange-50 to-pink-50 border border-orange-200 rounded-2xl p-8">
            <p className="text-gray-700 text-lg mb-6">
              Come check it out. If you see something I'm doing wrong, tell me. If you're working on something similar and want to compare notes, let's talk. If you have questions about anything I mentioned, ask.
            </p>
            <p className="text-gray-900 font-semibold text-xl">
              I'm not gatekeeping any of this.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
