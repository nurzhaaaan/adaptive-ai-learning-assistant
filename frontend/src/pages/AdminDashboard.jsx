import React, { useEffect, useState } from 'react';
import {
  Users,
  ShieldCheck,
  BookOpen,
  UserRound,
  RefreshCcw
} from 'lucide-react';
import { api } from '../api';

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadData() {
    try {
      setLoading(true);
      setError('');

      const [summaryData, studentsData] = await Promise.all([
        api('/admin/summary'),
        api('/admin/students')
      ]);

      setSummary(summaryData);
      setStudents(studentsData);
    } catch (err) {
      setError(err?.message || 'Admin data жүктелмеді.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="loader">
        Admin Dashboard жүктелуде...
      </div>
    );
  }

  return (
    <div className="admin-dashboard-page">

      <header className="page-head admin-page-head">
        <div>
          <span className="eyebrow">
            ADMINISTRATION
          </span>

          <h1>
            Admin Dashboard
          </h1>

          <p>
            Adaptive AI платформасын және студенттерді басқару.
          </p>
        </div>

        <button
          className="admin-refresh-btn"
          onClick={loadData}
        >
          <RefreshCcw size={17} />
          Жаңарту
        </button>
      </header>

      {error && (
        <div className="alert error">
          {error}
        </div>
      )}

      <section className="admin-stat-grid">

        <StatCard
          icon={<Users />}
          label="Барлық қолданушы"
          value={summary?.totalUsers ?? 0}
        />

        <StatCard
          icon={<UserRound />}
          label="Студенттер"
          value={summary?.totalStudents ?? 0}
        />

        <StatCard
          icon={<ShieldCheck />}
          label="Админдер"
          value={summary?.totalAdmins ?? 0}
        />

        <StatCard
          icon={<BookOpen />}
          label="Пәндер"
          value={summary?.totalCourses ?? 0}
        />

      </section>

      <section className="admin-panel">

        <div className="admin-panel-head">
          <div>
            <h2>
              Студенттер
            </h2>

            <p>
              Платформада тіркелген студенттер тізімі.
            </p>
          </div>

          <span className="admin-count">
            {students.length}
          </span>
        </div>

        {students.length === 0 ? (
          <div className="admin-empty">
            Әзірге студент жоқ.
          </div>
        ) : (
          <div className="admin-table-wrap">

            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Аты</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Тіркелген күні</th>
                </tr>
              </thead>

              <tbody>
                {students.map(student => (
                  <tr key={student.id}>

                    <td>
                      #{student.id}
                    </td>

                    <td>
                      <div className="admin-user-cell">
                        <span className="admin-user-avatar">
                          {student.name?.[0]?.toUpperCase() || 'S'}
                        </span>

                        <strong>
                          {student.name}
                        </strong>
                      </div>
                    </td>

                    <td>
                      {student.email}
                    </td>

                    <td>
                      <span className="student-role-badge">
                        {student.role}
                      </span>
                    </td>

                    <td>
                      {formatDate(student.createdAt)}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>

          </div>
        )}

      </section>

    </div>
  );
}

function StatCard({
  icon,
  label,
  value
}) {
  return (
    <div className="admin-stat-card">

      <div className="admin-stat-icon">
        {icon}
      </div>

      <div>
        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>
      </div>

    </div>
  );
}

function formatDate(value) {
  if (!value) {
    return '—';
  }

  try {
    return new Date(value).toLocaleDateString(
      'kk-KZ',
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }
    );
  } catch {
    return value;
  }
}