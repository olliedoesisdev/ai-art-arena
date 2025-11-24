"use client";

import { useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

interface Voter {
  id: string;
  email: string;
  name?: string;
  voted_at: string;
  vote_date: string;
}

interface ArtworkVoteDetailsProps {
  artworkId: string;
  artworkTitle: string;
  voteCount: number;
}

export function ArtworkVoteDetails({ artworkId, artworkTitle, voteCount }: ArtworkVoteDetailsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [voters, setVoters] = useState<Voter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVoters = async () => {
    if (isExpanded) {
      // Collapse
      setIsExpanded(false);
      return;
    }

    // Expand and fetch voters
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/artwork-voters?artworkId=${artworkId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch voters');
      }

      const data = await response.json();
      setVoters(data.voters || []);
      setIsExpanded(true);
    } catch (err) {
      console.error('Error fetching voters:', err);
      setError('Failed to load voter details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Clickable vote count */}
      <button
        onClick={fetchVoters}
        className="flex items-center gap-2 hover:bg-slate-800/50 rounded-lg px-2 py-1 transition-colors"
        disabled={loading}
      >
        <span className="text-2xl font-bold text-blue-400">
          {voteCount}
        </span>
        <span className="text-sm text-slate-400">
          {voteCount === 1 ? 'vote' : 'votes'}
        </span>
        {loading ? (
          <div className="animate-spin h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full" />
        ) : isExpanded ? (
          <ChevronUp className="text-slate-400" size={16} />
        ) : (
          <ChevronDown className="text-slate-400" size={16} />
        )}
      </button>

      {/* Expanded voter details */}
      {isExpanded && (
        <div className="mt-4 bg-slate-900/50 rounded-lg border border-slate-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-white">
              Voters for "{artworkTitle}"
            </h4>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {error ? (
            <p className="text-red-400 text-sm">{error}</p>
          ) : voters.length === 0 ? (
            <p className="text-slate-400 text-sm">No voters yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-700">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400">
                      Voter
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400">
                      Email
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400">
                      Date
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-400">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {voters.map((voter) => (
                    <tr key={voter.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-3 py-2 text-slate-300">
                        {voter.name || voter.email?.split('@')[0] || 'Anonymous'}
                      </td>
                      <td className="px-3 py-2 text-slate-400 font-mono text-xs">
                        {voter.email || 'N/A'}
                      </td>
                      <td className="px-3 py-2 text-slate-400 text-xs">
                        {voter.vote_date ? new Date(voter.vote_date).toLocaleDateString() : new Date(voter.voted_at).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2 text-slate-400 text-xs">
                        {new Date(voter.voted_at).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
