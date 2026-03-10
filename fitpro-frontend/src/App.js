import React, { useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { buildMuiTheme } from './theme';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

// Public pages
import HomePage     from './pages/HomePage';
import LoginPage    from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';

// User pages
import UserDashboard from './pages/User/Dashboard';
import WorkoutsPage  from './pages/User/WorkoutsPage';
import ProgramsPage  from './pages/User/ProgramsPage';
import ProgressPage  from './pages/User/ProgressPage';
import NutritionPage from './pages/User/NutritionPage';
import ProfilePage   from './pages/User/ProfilePage';
import SettingsPage  from './pages/User/SettingsPage';

// Coach pages
import CoachDashboard  from './pages/Coach/CoachDashboard';
import ManageExercises from './pages/Coach/ManageExercises';
import ManagePrograms  from './pages/Coach/ManagePrograms';
import UsersProgress   from './pages/Coach/UsersProgress';
import MessagesPage    from './pages/Coach/MessagesPage';

// Admin pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import ManageUsers    from './pages/Admin/ManageUsers';
import ManageCoaches  from './pages/Admin/ManageCoaches';
import AdminExercises from './pages/Admin/AdminExercises';
import AdminPrograms  from './pages/Admin/AdminPrograms';
import ReportsPage    from './pages/Admin/ReportsPage';

/* ─── Route guards ───────────────────────────────────────────── */
const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin"     replace />;
    if (user.role === 'coach') return <Navigate to="/coach"     replace />;
    return                            <Navigate to="/dashboard" replace />;
  }
  return children;
};

/* ─── Routes ─────────────────────────────────────────────────── */
function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"         element={<HomePage />} />
      <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* User */}
      <Route path="/dashboard" element={<PrivateRoute roles={['user']}><UserDashboard /></PrivateRoute>} />
      <Route path="/workouts"  element={<PrivateRoute roles={['user']}><WorkoutsPage /></PrivateRoute>} />
      <Route path="/programs"  element={<PrivateRoute roles={['user']}><ProgramsPage /></PrivateRoute>} />
      <Route path="/progress"  element={<PrivateRoute roles={['user']}><ProgressPage /></PrivateRoute>} />
      <Route path="/nutrition" element={<PrivateRoute roles={['user']}><NutritionPage /></PrivateRoute>} />
      <Route path="/profile"   element={<PrivateRoute roles={['user','coach','admin']}><ProfilePage /></PrivateRoute>} />
      <Route path="/settings"  element={<PrivateRoute roles={['user','coach','admin']}><SettingsPage /></PrivateRoute>} />

      {/* Coach */}
      <Route path="/coach"           element={<PrivateRoute roles={['coach']}><CoachDashboard /></PrivateRoute>} />
      <Route path="/coach/exercises" element={<PrivateRoute roles={['coach']}><ManageExercises /></PrivateRoute>} />
      <Route path="/coach/programs"  element={<PrivateRoute roles={['coach']}><ManagePrograms /></PrivateRoute>} />
      <Route path="/coach/users"     element={<PrivateRoute roles={['coach']}><UsersProgress /></PrivateRoute>} />
      <Route path="/coach/messages"  element={<PrivateRoute roles={['coach']}><MessagesPage /></PrivateRoute>} />

      {/* Admin */}
      <Route path="/admin"            element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
      <Route path="/admin/users"      element={<PrivateRoute roles={['admin']}><ManageUsers /></PrivateRoute>} />
      <Route path="/admin/coaches"    element={<PrivateRoute roles={['admin']}><ManageCoaches /></PrivateRoute>} />
      <Route path="/admin/exercises"  element={<PrivateRoute roles={['admin']}><AdminExercises /></PrivateRoute>} />
      <Route path="/admin/programs"   element={<PrivateRoute roles={['admin']}><AdminPrograms /></PrivateRoute>} />
      <Route path="/admin/reports"    element={<PrivateRoute roles={['admin']}><ReportsPage /></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/* ─── MUI theme sync (reads isDark from ThemeContext) ─────────── */
function MuiThemeSync({ children }) {
  const { isDark } = useTheme();
  const muiTheme   = useMemo(() => buildMuiTheme(isDark ? 'dark' : 'light'), [isDark]);

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}

/* ─── Root ───────────────────────────────────────────────────── */
export default function App() {
  return (
    <ThemeProvider>
      <MuiThemeSync>
        <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <AuthProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </AuthProvider>
        </SnackbarProvider>
      </MuiThemeSync>
    </ThemeProvider>
  );
}