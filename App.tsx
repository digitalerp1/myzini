
import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabase';
import { Session } from '@supabase/supabase-js';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Students from './pages/Students';
import Staff from './pages/Staff';
import Classes from './pages/Classes';
import Expenses from './pages/Expenses';
import FeesTypes from './pages/FeesTypes';
import QueryHelper from './pages/QueryHelper';
import DuesList from './pages/DuesList';
import Attendance from './pages/Attendance';
import AttendanceReport from './pages/AttendanceReport';
import Sidebar from './components/Sidebar';
import Spinner from './components/Spinner';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate('/');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-light-bg">
        <Spinner />
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return (
    <div className="flex h-screen bg-light-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard user={session.user} />} />
              <Route path="/profile" element={<Profile user={session.user} />} />
              <Route path="/students" element={<Students />} />
              <Route path="/staff" element={<Staff />} />
              <Route path="/classes" element={<Classes />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/fees-types" element={<FeesTypes />} />
              <Route path="/dues-list" element={<DuesList />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/attendance-report" element={<AttendanceReport />} />
              <Route path="/query-helper" element={<QueryHelper />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
