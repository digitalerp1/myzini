
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import DashboardIcon from './icons/DashboardIcon';
import ProfileIcon from './icons/ProfileIcon';
import StudentsIcon from './icons/StudentsIcon';
import StaffIcon from './icons/StaffIcon';
import ClassesIcon from './icons/ClassesIcon';
import ExpensesIcon from './icons/ExpensesIcon';
import FeesIcon from './icons/FeesIcon';
import DuesIcon from './icons/DuesIcon';
import AttendanceIcon from './icons/AttendanceIcon';
import QueryIcon from './icons/QueryIcon';
import ReportIcon from './icons/ReportIcon';
import LogoutIcon from './icons/LogoutIcon';

const Sidebar: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    const linkClasses = "flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200";
    const activeLinkClasses = "bg-primary text-white";

    return (
        <div className="w-64 bg-dark-nav text-white flex flex-col h-screen">
            <div className="flex items-center justify-center h-20 border-b border-gray-700">
                <h1 className="text-2xl font-bold">My Zini</h1>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
                <NavLink to="/dashboard" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                    <DashboardIcon />
                    <span className="mx-4">Dashboard</span>
                </NavLink>
                <NavLink to="/profile" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                    <ProfileIcon />
                    <span className="mx-4">My Profile</span>
                </NavLink>
                <NavLink to="/students" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                    <StudentsIcon />
                    <span className="mx-4">Students</span>
                </NavLink>
                <NavLink to="/staff" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                    <StaffIcon />
                    <span className="mx-4">Staff</span>
                </NavLink>
                 <NavLink to="/classes" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                    <ClassesIcon />
                    <span className="mx-4">Classes</span>
                </NavLink>
                 <NavLink to="/expenses" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                    <ExpensesIcon />
                    <span className="mx-4">Expenses</span>
                </NavLink>
                <NavLink to="/fees-types" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                    <FeesIcon />
                    <span className="mx-4">Fee Management</span>
                </NavLink>
                <NavLink to="/dues-list" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                    <DuesIcon />
                    <span className="mx-4">Dues List</span>
                </NavLink>
                <NavLink to="/attendance" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                    <AttendanceIcon />
                    <span className="mx-4">Attendance</span>
                </NavLink>
                <NavLink to="/attendance-report" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                    <ReportIcon />
                    <span className="mx-4">Attendance Report</span>
                </NavLink>
                <NavLink to="/query-helper" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                    <QueryIcon />
                    <span className="mx-4">AI Query Helper</span>
                </NavLink>
            </nav>
            <div className="px-4 py-6 border-t border-gray-700">
                <button onClick={handleLogout} className={linkClasses + " w-full"}>
                    <LogoutIcon />
                    <span className="mx-4">Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
