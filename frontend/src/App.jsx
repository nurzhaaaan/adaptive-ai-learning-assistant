import React from 'react';

import {
  Navigate,
  Route,
  Routes
} from 'react-router-dom';

import { useAuth } from './state/AuthContext';

import Layout from './components/Layout';

import Login from './pages/Login';
import Register from './pages/Register';

import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';

import Courses from './pages/Courses';
import CourseDetails from './pages/CourseDetails';

import Quiz from './pages/Quiz';
import Diagnostic from './pages/Diagnostic';
import Analytics from './pages/Analytics';
import AiTutor from './pages/AiTutor';

import Schedule from './pages/Schedule';

import {
  StudyPlan,
  Assignments,
  Testing,
  Grades,
  AcademicCalendar,
  Journal,
  Applications,
  Materials,
  Transcript,
  Appeals,
  Messages,
  Profile,
  SettingsPage,
  Support
} from './pages/UniversityPages';

function Private({
  children
}) {

  const { user } = useAuth();

  return user
    ? children
    : (
      <Navigate
        to="/login"
        replace
      />
    );
}

function AdminOnly({
  children
}) {

  const { user } = useAuth();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (user.role !== 'ADMIN') {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return children;
}

function Home() {

  const { user } = useAuth();

  if (
    user?.role === 'ADMIN'
  ) {
    return (
      <Navigate
        to="/admin"
        replace
      />
    );
  }

  return <Dashboard/>;
}

export default function App() {

  return (
    <Routes>

      <Route
        path="/login"
        element={<Login/>}
      />

      <Route
        path="/register"
        element={<Register/>}
      />

      <Route
        path="/"
        element={
          <Private>
            <Layout/>
          </Private>
        }
      >

        <Route
          index
          element={<Home/>}
        />

        <Route
          path="admin"
          element={
            <AdminOnly>
              <AdminDashboard/>
            </AdminOnly>
          }
        />

        <Route
          path="study-plan"
          element={<StudyPlan/>}
        />

        <Route
          path="schedule"
          element={<Schedule/>}
        />

        <Route
          path="courses"
          element={<Courses/>}
        />

        <Route
          path="courses/:id"
          element={<CourseDetails/>}
        />

        <Route
          path="assignments"
          element={<Assignments/>}
        />

        <Route
          path="testing"
          element={<Testing/>}
        />

        <Route
          path="grades"
          element={<Grades/>}
        />

        <Route
          path="quiz/:topicId"
          element={<Quiz/>}
        />

        <Route
          path="diagnostic/:courseId"
          element={<Diagnostic/>}
        />

        <Route
          path="analytics"
          element={<Analytics/>}
        />

        <Route
          path="academic-calendar"
          element={<AcademicCalendar/>}
        />

        <Route
          path="journal"
          element={<Journal/>}
        />

        <Route
          path="applications"
          element={<Applications/>}
        />

        <Route
          path="materials"
          element={<Materials/>}
        />

        <Route
          path="transcript"
          element={<Transcript/>}
        />

        <Route
          path="appeals"
          element={<Appeals/>}
        />

        <Route
          path="ai"
          element={<AiTutor/>}
        />

        <Route
          path="messages"
          element={<Messages/>}
        />

        <Route
          path="profile"
          element={<Profile/>}
        />

        <Route
          path="settings"
          element={<SettingsPage/>}
        />

        <Route
          path="support"
          element={<Support/>}
        />

      </Route>

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>
  );
}