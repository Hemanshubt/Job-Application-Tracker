import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Copy, Check, Mail, Sparkles, Send, MessageSquare } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface EmailTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCompany?: string;
  defaultRole?: string;
  defaultContactName?: string;
}

type TemplateCategory = 'thank_you' | 'referral' | 'follow_up' | 'negotiation' | 'hiring_manager';

export const EmailTemplateModal: React.FC<EmailTemplateModalProps> = ({
  isOpen,
  onClose,
  defaultCompany = '',
  defaultRole = '',
  defaultContactName = '',
}) => {
  const { success } = useToast();
  const [category, setCategory] = useState<TemplateCategory>('thank_you');
  const [company, setCompany] = useState(defaultCompany);
  const [role, setRole] = useState(defaultRole);
  const [contactName, setContactName] = useState(defaultContactName);
  const [copiedType, setCopiedType] = useState<'subject' | 'body' | null>(null);

  // Sync defaults if props change
  React.useEffect(() => {
    if (defaultCompany) setCompany(defaultCompany);
    if (defaultRole) setRole(defaultRole);
    if (defaultContactName) setContactName(defaultContactName);
  }, [defaultCompany, defaultRole, defaultContactName, isOpen]);

  const targetCompany = company || '[Company]';
  const targetRole = role || '[Role Title]';
  const targetName = contactName || '[Name]';

  const templates: Record<TemplateCategory, { title: string; tag: string; subject: string; body: string }> = {
    thank_you: {
      title: 'Post-Interview Thank You',
      tag: 'Send within 24h',
      subject: `Thank you — ${targetRole} interview with ${targetCompany}`,
      body: `Hi ${targetName},

Thank you so much for taking the time to speak with me today about the ${targetRole} role at ${targetCompany}.

I really enjoyed our conversation regarding your team's current focus, engineering standards, and the exciting milestones ahead. Our discussion reinforced my excitement about the opportunity to contribute to ${targetCompany}'s goals.

Please let me know if you need any additional code samples, design docs, or information from my end. Looking forward to hearing about the next steps!

Best regards,
[Your Name]
[Your Portfolio / LinkedIn]`,
    },
    referral: {
      title: 'LinkedIn Referral Request',
      tag: 'Networking',
      subject: `Referral inquiry for ${targetRole} at ${targetCompany}`,
      body: `Hi ${targetName},

I hope you're having a productive week!

I noticed an exciting opening for the ${targetRole} role on the ${targetCompany} team, and your work with the group caught my eye. Given my background building scalable full-stack web applications, I believe I could make an immediate impact.

Would you be open to providing a referral or sharing any insights on what the team is looking for? I'd be happy to share my resume and portfolio for a quick look.

Either way, thank you for your time and continued inspiration!

Warmly,
[Your Name]`,
    },
    follow_up: {
      title: 'Recruiter Follow-up / Status Check',
      tag: 'After 7-10 Days',
      subject: `Following up: ${targetRole} application — [Your Name]`,
      body: `Hi ${targetName},

I hope you're doing well!

I am following up on my recent interview / application for the ${targetRole} position at ${targetCompany}. I remain very enthusiastic about the opportunity to collaborate with your team.

Could you please share an update on the hiring timeline or next steps in the process?

Thank you so much for your time and guidance.

Best regards,
[Your Name]`,
    },
    negotiation: {
      title: 'Salary & Compensation Negotiation',
      tag: 'Offer Stage',
      subject: `Regarding the offer for ${targetRole} at ${targetCompany}`,
      body: `Dear ${targetName},

Thank you very much for extending the offer to join ${targetCompany} as a ${targetRole}! I am thrilled about the prospect of joining the team and contributing to your high-impact roadmap.

Before signing, I wanted to discuss the compensation package. Based on my technical experience, competitive market rates for this level, and other active discussions, I was hoping we could get closer to [Target Salary / e.g. ₹28 LPA or $210,000 base + equity adjustment].

If we can align on this target, I would be delighted to accept the offer immediately and begin onboarding.

Thank you again for your time, support, and partnership throughout this journey.

Warm regards,
[Your Name]`,
    },
    hiring_manager: {
      title: 'Cold Outreach to Hiring Manager',
      tag: 'High Impact',
      subject: `${targetRole} inquiry: High-performance engineering for ${targetCompany}`,
      body: `Hi ${targetName},

I've been closely following ${targetCompany}'s impressive product growth and engineering architecture.

I noticed your team is expanding and hiring for a ${targetRole}. With experience architecting scalable distributed systems and shipping user-facing products with high craft and velocity, I wanted to reach out directly to see how I could help you solve key bottlenecks this quarter.

I've linked my recent projects and GitHub below:
• Portfolio / Work: [Link]
• GitHub: [Link]

Would you be open to a 10-minute chat this week?

Best,
[Your Name]`,
    },
  };

  const current = templates[category];

  const copyToClipboard = async (text: string, type: 'subject' | 'body') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      success(type === 'subject' ? 'Subject Copied' : 'Email Copied', 'Ready to paste in your email client.');
      setTimeout(() => setCopiedType(null), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Outreach & Follow-Up Email Generator"
      description="Personalized, battle-tested cold emails and thank-you notes tailored to this opportunity."
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Dynamic Placeholders Input Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
          <Input
            label="Company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Stripe"
            className="text-xs h-8"
          />
          <Input
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Senior Full Stack"
            className="text-xs h-8"
          />
          <Input
            label="Contact / Recruiter Name"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="e.g. Sarah Jenkins"
            className="text-xs h-8"
          />
        </div>

        {/* Template Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {(Object.keys(templates) as TemplateCategory[]).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {templates[cat].title}
            </button>
          ))}
        </div>

        {/* Subject Line Box */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Subject Line
            </span>
            <button
              type="button"
              onClick={() => copyToClipboard(current.subject, 'subject')}
              className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
            >
              {copiedType === 'subject' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copiedType === 'subject' ? 'Copied!' : 'Copy Subject'}
            </button>
          </div>
          <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/90 text-xs font-mono text-slate-200 truncate">
            {current.subject}
          </div>
        </div>

        {/* Email Body Preview & Copy */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Message Body
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              {current.tag}
            </span>
          </div>

          <div className="relative">
            <textarea
              readOnly
              rows={9}
              value={current.body}
              className="w-full rounded-xl border border-slate-800 bg-slate-950/80 p-3.5 text-xs text-slate-300 font-sans leading-relaxed focus:outline-none resize-none selection:bg-indigo-500/30"
            />
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <p className="text-[11px] text-slate-500">
            💡 Replace any bracketed details before hitting send.
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => copyToClipboard(current.body, 'body')}
              className="gap-1.5"
            >
              {copiedType === 'body' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedType === 'body' ? 'Copied to Clipboard!' : 'Copy Entire Email'}</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
