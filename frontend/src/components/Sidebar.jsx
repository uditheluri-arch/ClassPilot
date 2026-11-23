import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import {
  LayoutDashboard,
  BookOpen,
  FileCheck2,
  FolderOpen,
  GraduationCap,
  Award,
  User,
  Users,
  LogOut,
} from 'lucide-react';

export const Sidebar = () => {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const isStudent = role === 'STUDENT';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const studentNavItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/student/dashboard' },
    { name: 'My Class & Subjects', icon: BookOpen, path: '/student/my-class' },
    { name: 'Examinations', icon: FileCheck2, path: '/student/exams' },
    { name: 'Coursework & Tasks', icon: FolderOpen, path: '/student/assignments' },
    { name: 'Study Materials', icon: GraduationCap, path: '/student/materials' },
    { name: 'Results & Performance', icon: Award, path: '/student/results' },
  ];

  const facultyNavItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/faculty/dashboard' },
    { name: 'My Classes', icon: Users, path: '/faculty/classes' },
    { name: 'Student Directory', icon: User, path: '/faculty/students' },
    { name: 'Exam Management', icon: FileCheck2, path: '/faculty/exams' },
    { name: 'Assignments', icon: FolderOpen, path: '/faculty/assignments' },
    { name: 'Study Materials', icon: GraduationCap, path: '/faculty/materials' },
  ];

  const navItems = isStudent ? studentNavItems : facultyNavItems;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Navigation section */}
      <div className="p-4 flex-1">
        <div className="mb-3 px-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {isStudent ? 'Student Portal' : 'Faculty Portal'}
          </p>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? 'text-indigo-600' : 'text-slate-400'
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User card at bottom */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/70">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
              {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-900 truncate">
                {user?.full_name || user?.identifier}
              </p>
              <p className="text-[11px] text-slate-500 font-mono truncate">
                {user?.identifier || user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
