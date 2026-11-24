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
    { name: 'Assignments', icon: FolderOpen, path: '/student/assignments' },
    { name: 'Study Materials', icon: GraduationCap, path: '/student/materials' },
    { name: 'Results & Performance', icon: Award, path: '/student/results' },
  ];

  const facultyNavItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/faculty/dashboard' },
    { name: 'Assigned Classes', icon: Users, path: '/faculty/classes' },
    { name: 'Student Roster', icon: BookOpen, path: '/faculty/students' },
    { name: 'Exam Management', icon: FileCheck2, path: '/faculty/exams' },
    { name: 'Assignments', icon: FolderOpen, path: '/faculty/assignments' },
    { name: 'Study Materials', icon: GraduationCap, path: '/faculty/materials' },
  ];

  const navItems = isStudent ? studentNavItems : facultyNavItems;

  return (
    <aside className="w-60 bg-white border-r border-[#E2E8F0] flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Navigation items */}
      <div className="p-3 flex-1">
        <div className="mb-2 px-3 pt-2">
          <p className="text-xs font-semibold text-[#64748B]">
            {isStudent ? 'Student Workspace' : 'Faculty Workspace'}
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
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#F0F5FA] text-[#315E91] font-semibold border-l-2 border-[#315E91]'
                      : 'text-[#64748B] hover:text-[#172033] hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Account Info Footer */}
      <div className="p-3 border-t border-[#E2E8F0] bg-slate-50/60">
        <div className="flex items-center justify-between gap-2">
          <div className="truncate">
            <p className="text-xs font-semibold text-[#172033] truncate">
              {user?.full_name || user?.identifier}
            </p>
            <p className="text-xs text-[#64748B] font-mono truncate">
              {user?.identifier || user?.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 text-[#64748B] hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
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
