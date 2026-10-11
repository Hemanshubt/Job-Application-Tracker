import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Plus,
  Menu,
  X,
  Search,
  Calendar,
  Clock,
  ExternalLink,
  CheckCircle,
  Briefcase,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { tasksApi, interviewsApi } from '../../lib/api';
import { Task, Interview } from '../../types';
import { formatDate, formatDateTime } from '../../lib/utils';
import { Link, useNavigate } from 'react-router-dom';

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenNewApplicationModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  onOpenNewApplicationModal,
}) => {
  const { user, isDemoUser } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadReminders = async () => {
      try {
        const [taskList, interviewList] = await Promise.all([
          tasksApi.list({ isCompleted: false }),
          interviewsApi.getUpcoming(5),
        ]);
        setTasks(taskList.slice(0, 5));
        setInterviews(interviewList);
      } catch (err) {
        console.warn('Could not load reminders:', err);
      }
    };
    loadReminders();
    const interval = setInterval(loadReminders, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close notifications on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalNotifications = tasks.length + interviews.length;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-4 sm:px-6 backdrop-blur-md">
      {/* Left section: mobile hamburger & search bar shortcut */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          onClick={() => navigate('/applications')}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-xs text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-slate-500" />
          <span>Quick search applications...</span>
          <kbd className="ml-4 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right section: Demo badge, New Application CTA, Notifications, Profile */}
      <div className="flex items-center gap-3">
        {isDemoUser && (
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-medium text-indigo-300">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Local Dev Mode
          </div>
        )}

        <Button
          size="sm"
          onClick={onOpenNewApplicationModal}
          className="gap-1.5 font-medium shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Application</span>
        </Button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {totalNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-slate-950">
                {totalNotifications}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-2xl backdrop-blur-xl z-50 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-white">In-App Reminders</span>
                  <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-400">
                    {totalNotifications} Active
                  </span>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 max-h-80 overflow-y-auto space-y-3 pr-1">
                {interviews.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                      Upcoming Interviews
                    </h4>
                    <div className="space-y-2">
                      {interviews.map((int) => (
                        <div
                          key={int.id}
                          className="flex items-start gap-2.5 p-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-colors"
                        >
                          <Calendar className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-slate-200 truncate">
                              {int.round_name} • {int.application?.company}
                            </div>
                            <div className="text-[11px] text-amber-300/80 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              {formatDateTime(int.scheduled_at)}
                            </div>
                          </div>
                          {int.meeting_url && (
                            <a
                              href={int.meeting_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-amber-400 hover:text-amber-300 p-1"
                              title="Join Meeting"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tasks.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                      Pending Action Items
                    </h4>
                    <div className="space-y-2">
                      {tasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/40 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-slate-200 truncate">
                              {task.title}
                            </div>
                            {task.due_date && (
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                Due: {formatDate(task.due_date)}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {totalNotifications === 0 && (
                  <div className="py-6 text-center text-xs text-slate-500">
                    No pending reminders right now! 🎉
                  </div>
                )}
              </div>

              <div className="pt-3 mt-3 border-t border-slate-800 text-center">
                <Link
                  to="/tasks"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-block"
                >
                  Manage all tasks & reminders →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User avatar snapshot */}
        <Link
          to="/settings"
          className="flex items-center gap-2 pl-2 border-l border-slate-800 hover:opacity-80 transition-opacity"
        >
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.full_name || 'Profile'}
              className="w-8 h-8 rounded-full border border-slate-700 object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
              {(user?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
          )}
        </Link>
      </div>
    </header>
  );
};
