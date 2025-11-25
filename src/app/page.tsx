import Link from "next/link";
import Image from "next/image";
import { Sparkles, Trophy, Calendar, TrendingUp } from "lucide-react";
import { SITE_CONFIG, ROUTES } from "@/lib/constants";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Background Image */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#FFB6A3] via-[#FF9A8B] to-[#C79BD1]">
        {/* Hero Image Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-sunset-city.webp"
            alt="Sunset Cityscape"
            fill
            className="object-cover"
            priority
            quality={95}
          />
          {/* Gradient Overlay - Sunset tones */}
          <div className="absolute inset-0 bg-gradient-to-b from-pink-500/30 via-orange-400/20 to-purple-600/40"></div>
          {/* Soft bokeh effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-300/10 via-transparent to-purple-400/10"></div>
        </div>

        {/* Hero Content */}
        <div className="container mx-auto px-4 py-8 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full mb-4 shadow-lg">
              <Sparkles className="w-4 h-4 text-yellow-200" />
              <span className="text-sm text-white font-medium drop-shadow-lg">Weekly AI Art Competitions</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight drop-shadow-2xl">
              Discover & Vote on<br />
              <span className="bg-gradient-to-r from-yellow-200 via-pink-200 to-purple-200 bg-clip-text text-transparent drop-shadow-lg">
                AI-Generated Art
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
              {SITE_CONFIG.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={ROUTES.contest}
                className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white text-base font-semibold rounded-lg transition-all shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/50 backdrop-blur-sm"
              >
                <Trophy className="w-5 h-5 mr-2" />
                Vote Now
              </Link>
              <Link
                href={ROUTES.archive}
                className="inline-flex items-center justify-center px-8 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-base font-semibold rounded-lg transition-all border border-white/30 shadow-lg"
              >
                <Calendar className="w-5 h-5 mr-2" />
                View Archive
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom gradient fade - removed to create clean separation */}
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 relative bg-white">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-orange-50 to-pink-50 border border-orange-200 rounded-xl p-8 hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Weekly Contests</h3>
            <p className="text-gray-600 leading-relaxed">
              New AI-generated artworks compete every week. Vote for your favorites and help crown the champion.
            </p>
          </div>

          <div className="bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200 rounded-xl p-8 hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-pink-500 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">AI Art Gallery</h3>
            <p className="text-gray-600 leading-relaxed">
              Explore stunning artworks created by cutting-edge AI models. Each piece is unique and imaginative.
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-8 hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Community Driven</h3>
            <p className="text-gray-600 leading-relaxed">
              Your votes decide the winners. Be part of a community that celebrates AI creativity.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-16 relative bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
            How It Works
          </h2>

          <div className="space-y-6">
            <div className="flex gap-4 bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                1
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Browse the Contest</h4>
                <p className="text-gray-600">
                  Check out the current week's AI-generated artwork submissions. Each contest features 6 unique pieces.
                </p>
              </div>
            </div>

            <div className="flex gap-4 bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                2
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Cast Your Vote</h4>
                <p className="text-gray-600">
                  Vote for your favorite artwork once per day. Each vote helps determine the week's winner.
                </p>
              </div>
            </div>

            <div className="flex gap-4 bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                3
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">See the Winner</h4>
                <p className="text-gray-600">
                  At the end of the week, the artwork with the most votes wins and gets archived in the hall of fame.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 pb-24 relative bg-white">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-orange-50 to-pink-50 border border-orange-200 rounded-2xl p-12 text-center shadow-xl">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to Start Voting?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join the community and help decide this week's AI art champion.
          </p>
          <Link
            href={ROUTES.contest}
            className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white text-lg font-semibold rounded-lg transition-all shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/50"
          >
            <Trophy className="w-5 h-5 mr-2" />
            View Current Contest
          </Link>
        </div>
      </section>
    </div>
  );
}
