import React, {
  useCallback,
  useEffect,
  useState
} from 'react';

import {
  Users,
  UserRound,
  ShieldCheck,
  BookOpen,
  RefreshCw
} from 'lucide-react';

import { api } from '../api';

export default function AdminDashboard() {

  const [summary, setSummary] =
    useState(null);

  const [students, setStudents] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const load = useCallback(
    async () => {

      setLoading(true);
      setError('');

      try {

        const [
          summaryData,
          studentsData
        ] = await Promise.all([
          api('/admin/summary'),
          api('/admin/students')
        ]);

        setSummary(summaryData);
        setStudents(studentsData);

      } catch (err) {

        setError(
          err?.message ||
          'Admin деректерін жүктеу мүмкін болмады.'
        );

      } finally {

        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    load();
  }, [load]);

  if (
    loading &&
    !summary
  ) {

    return (
      <div className="loader">
        Admin Dashboard жүктелуде...
      </div>
    );
  }

  return (
    <div className="admin-dashboard-page">

      <header className="admin-page-head">

        <div>

          <span className="eyebrow">
            ADMINISTRATION
          </span>

          <h1>
            Admin Dashboard
          </h1>

          <p>
            Adaptive AI платформасын және
            студенттерді басқару.
          </p>

        </div>

        <button
          className="admin-refresh-btn"
          onClick={load}
          disabled={loading}
        >
          <RefreshCw
            size={18}
            className={
              loading
                ? 'spin'
                : ''
            }
          />

          Жаңарту
        </button>

      </header>

      {error && (
        <div className="admin-empty">
          {error}
        </div>
      )}

      <section className="admin-stat-grid">

        <StatCard
          icon={<Users/>}
          label="Барлық қолданушы"
          value={
            summary?.totalUsers ?? 0
          }
        />

        <StatCard
          icon={<UserRound/>}
          label="Студенттер"
          value={
            summary?.totalStudents ?? 0
          }
        />

        <StatCard
          icon={<ShieldCheck/>}
          label="Админдер"
          value={
            summary?.totalAdmins ?? 0
          }
        />

        <StatCard
          icon={<BookOpen/>}
          label="Пәндер"
          value={
            summary?.totalCourses ?? 0
          }
        />

      </section>

      <section className="admin-panel">

        <div className="admin-panel-head">

          <div>
            <h2>Студенттер</h2>

            <p>
              Платформада тіркелген
              студенттер тізімі.
            </p>
          </div>

          <span className="admin-count">
            {students.length}
          </span>

        </div>

        {students.length === 0 ? (

          <div className="admin-empty">
            Әзірге студент тіркелмеген.
          </div>

        ) : (

          <div className="admin-table-wrap">

            <table className="admin-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>АТЫ</th>
                  <th>LOGIN</th>
                  <th>EMAIL</th>
                  <th>ROLE</th>
                  <th>ТІРКЕЛГЕН КҮНІ</th>
                </tr>
              </thead>

              <tbody>

                {students.map(
                  student => (

                    <tr key={student.id}>

                      <td>
                        #{student.id}
                      </td>

                      <td>

                        <div className="admin-user-cell">

                          <span className="admin-user-avatar">
                            {
                              student
                                .name
                                ?.charAt(0)
                                ?.toUpperCase() ||
                              'S'
                            }
                          </span>

                          <strong>
                            {student.name}
                          </strong>

                        </div>

                      </td>

                      <td>
                        <strong>
                          {student.username || '—'}
                        </strong>
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
                        {formatDate(
                          student.createdAt
                        )}
                      </td>

                    </tr>

                  )
                )}

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
    <article className="admin-stat-card">

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

    </article>
  );
}

function formatDate(value) {

  if (!value) {
    return '—';
  }

  try {

    return new Date(value)
      .toLocaleDateString(
        'kk-KZ',
        {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        }
      );

  } catch {

    return value;
  }
}