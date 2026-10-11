import React from 'react';
import { cn } from '../../lib/utils';
import { ApplicationStatus, TaskPriority, InterviewOutcome } from '../../types';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'status' | 'priority' | 'outcome';
  status?: ApplicationStatus;
  priority?: TaskPriority;
  outcome?: InterviewOutcome;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'default',
  status,
  priority,
  outcome,
  ...props
}) => {
  let badgeStyles = 'bg-slate-800 text-slate-300 border-slate-700';

  if (status) {
    switch (status) {
      case 'Applied':
        badgeStyles = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        break;
      case 'Screening':
        badgeStyles = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
        break;
      case 'Interview':
        badgeStyles = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        break;
      case 'Offer':
        badgeStyles = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        break;
      case 'Accepted':
        badgeStyles = 'bg-teal-500/10 text-teal-400 border-teal-500/20';
        break;
      case 'Rejected':
        badgeStyles = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
        break;
      case 'Withdrawn':
        badgeStyles = 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
        break;
    }
  } else if (priority) {
    switch (priority) {
      case 'Urgent':
        badgeStyles = 'bg-rose-500/15 text-rose-400 border-rose-500/30 font-semibold';
        break;
      case 'High':
        badgeStyles = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
        break;
      case 'Medium':
        badgeStyles = 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
        break;
      case 'Low':
        badgeStyles = 'bg-slate-800 text-slate-400 border-slate-700';
        break;
    }
  } else if (outcome) {
    switch (outcome) {
      case 'Passed':
        badgeStyles = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        break;
      case 'Scheduled':
        badgeStyles = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        break;
      case 'Completed':
        badgeStyles = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
        break;
      case 'Failed':
        badgeStyles = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
        break;
      case 'Cancelled':
        badgeStyles = 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
        break;
    }
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors',
        badgeStyles,
        className
      )}
      {...props}
    >
      {children || status || priority || outcome}
    </span>
  );
};
