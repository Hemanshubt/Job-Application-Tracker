import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Zap,
  TrendingUp,
  RefreshCw,
  FileText,
} from 'lucide-react';

interface AtsMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialJobDescription?: string;
  companyName?: string;
  roleTitle?: string;
}

const COMMON_TECH_KEYWORDS = [
  'React', 'TypeScript', 'JavaScript', 'Node.js', 'Express', 'Python', 'Go', 'Java',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'GCP',
  'Azure', 'GraphQL', 'REST API', 'CI/CD', 'Git', 'System Design', 'Microservices',
  'Kafka', 'Tailwind', 'Next.js', 'Redux', 'Unit Testing', 'Jest', 'Agile', 'Scrum',
  'SQL', 'Supabase', 'NoSQL', 'Security', 'Idempotency', 'Authentication', 'Performance',
];

export const AtsMatchModal: React.FC<AtsMatchModalProps> = ({
  isOpen,
  onClose,
  initialJobDescription = '',
  companyName = 'Target Company',
  roleTitle = 'Position',
}) => {
  const { profile } = useAuth();
  const [jobDescription, setJobDescription] = useState(initialJobDescription);
  const [candidateProfileText, setCandidateProfileText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [matchedKeywords, setMatchedKeywords] = useState<string[]>([]);
  const [missingKeywords, setMissingKeywords] = useState<string[]>([]);
  const [tailoringTips, setTailoringTips] = useState<string[]>([]);

  // Initialize candidate text from profile
  useEffect(() => {
    if (profile) {
      const bio = profile.bio || '';
      const headline = profile.headline || '';
      const targetRole = profile.target_role || '';
      const text = `${headline} ${targetRole} ${bio} React TypeScript Node.js PostgreSQL Express Docker Supabase REST API Git System Design`;
      setCandidateProfileText(text);
    }
  }, [profile]);

  useEffect(() => {
    if (initialJobDescription) {
      setJobDescription(initialJobDescription);
      runAnalysis(initialJobDescription);
    }
  }, [initialJobDescription, isOpen]);

  const runAnalysis = (jdText: string) => {
    if (!jdText.trim()) return;

    setIsAnalyzing(true);

    setTimeout(() => {
      const lowerJd = jdText.toLowerCase();
      const lowerCandidate = candidateProfileText.toLowerCase();

      // Find keywords present in JD
      const foundInJd = COMMON_TECH_KEYWORDS.filter((kw) =>
        lowerJd.includes(kw.toLowerCase())
      );

      // Distinguish matched vs missing
      const matched: string[] = [];
      const missing: string[] = [];

      foundInJd.forEach((kw) => {
        if (lowerCandidate.includes(kw.toLowerCase())) {
          matched.push(kw);
        } else {
          missing.push(kw);
        }
      });

      // Calculate score
      let score = 70;
      if (foundInJd.length > 0) {
        score = Math.min(96, Math.max(45, Math.round((matched.length / foundInJd.length) * 100)));
      }

      const tips: string[] = [];
      if (missing.length > 0) {
        tips.push(`Add projects highlighting experience with ${missing.slice(0, 3).join(', ')}.`);
      }
      tips.push('Quantify technical accomplishments with measurable outcomes (e.g. "Reduced API latency by 35%").');
      tips.push(`Mirror the exact title "${roleTitle}" in your resume summary section.`);
      tips.push('Format your resume using standard single-column PDF without nested tables for optimal parsing.');

      setMatchedKeywords(matched);
      setMissingKeywords(missing);
      setMatchScore(score);
      setTailoringTips(tips);
      setIsAnalyzing(false);
    }, 450);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score >= 65) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ATS Resume & Job Match Analyzer"
      description={`Compare this job description against your candidate profile to optimize your interview chances.`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-5">
        {/* JD Input / Editor */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">
              Job Description / Requirements
            </label>
            <Button
              size="sm"
              variant="outline"
              onClick={() => runAnalysis(jobDescription)}
              disabled={isAnalyzing || !jobDescription.trim()}
              className="h-7 text-xs gap-1.5 border-indigo-500/30 text-indigo-300"
            >
              <RefreshCw className={`w-3 h-3 ${isAnalyzing ? 'animate-spin' : ''}`} />
              Re-analyze
            </Button>
          </div>
          <Textarea
            rows={4}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description, required skills, or qualifications here..."
            className="text-xs leading-relaxed"
          />
        </div>

        {/* Results Overview */}
        {matchScore !== null && (
          <div className="space-y-4 pt-1">
            {/* Score Banner */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl border border-slate-800 bg-slate-900/90 gap-4">
              <div className="flex items-center gap-4">
                <div
                  className={`w-16 h-16 rounded-2xl border-2 flex flex-col items-center justify-center font-bold text-xl ${getScoreColor(
                    matchScore
                  )}`}
                >
                  <span>{matchScore}%</span>
                  <span className="text-[9px] uppercase tracking-wider font-semibold opacity-80">Match</span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    ATS Compatibility Rating
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {matchScore >= 80
                      ? 'Strong fit! Your profile matches most critical requirements for this role.'
                      : matchScore >= 65
                      ? 'Good baseline fit. Adding a few missing keywords can boost your interview rate.'
                      : 'Moderate alignment. Consider tailoring your resume with the suggested keywords.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right text-xs">
                  <span className="text-emerald-400 font-semibold">{matchedKeywords.length} Matched</span>
                  <span className="text-slate-600 mx-1.5">•</span>
                  <span className="text-rose-400 font-semibold">{missingKeywords.length} Missing</span>
                </div>
              </div>
            </div>

            {/* Keywords Split Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Matched Keywords */}
              <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Matching Skills & Keywords ({matchedKeywords.length})</span>
                </div>
                {matchedKeywords.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {matchedKeywords.map((kw) => (
                      <span
                        key={kw}
                        className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                      >
                        ✓ {kw}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No overlapping keywords detected.</p>
                )}
              </div>

              {/* Missing Keywords */}
              <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>Missing Keywords in Profile ({missingKeywords.length})</span>
                </div>
                {missingKeywords.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {missingKeywords.map((kw) => (
                      <span
                        key={kw}
                        className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20"
                      >
                        + {kw}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-emerald-400 font-medium">All key JD requirements found!</p>
                )}
              </div>
            </div>

            {/* AI Tailoring Tips */}
            <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>Resume Tailoring & Interview Recommendations</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300 pl-4 list-disc marker:text-indigo-400">
                {tailoringTips.map((tip, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
