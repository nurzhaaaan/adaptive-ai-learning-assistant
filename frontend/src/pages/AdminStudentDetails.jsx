import React, {
  useEffect,
  useState
} from 'react';

import {
  Link,
  useParams
} from 'react-router-dom';

import {
  ArrowLeft,
  UserRound,
  AtSign,
  Mail,
  BrainCircuit,
  BarChart3,
  ClipboardCheck,
  BookOpen,
  AlertTriangle,
  Sparkles,
  Trophy,
  Target
} from 'lucide-react';

import { api } from '../api';

export default function AdminStudentDetails() {

  const { id } = useParams();

  const [student, setStudent] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  useEffect(() => {

    async function load() {

      setLoading(true);
      setError('');

      try {

        const data =
          await api(
            `/admin/students/${id}`
          );

        setStudent(data);

      } catch (err) {

        setError(
          err?.message ||
          'Студент ақпаратын жүктеу мүмкін болмады.'
        );

      } finally {

        setLoading(false);
      }
    }

    load();

  }, [id]);

  if (loading) {

    return (
      <div className="loader">
        Студент аналитикасы жүктелуде...
      </div>
    );
  }

  if (
    error ||
    !student
  ) {

    return (
      <div style={styles.error}>
        {error || 'Студент табылмады'}
      </div>
    );
  }

  return (
    <div style={styles.page}>

      <Link
        to="/admin"
        style={styles.back}
      >
        <ArrowLeft size={18}/>
        Admin Dashboard
      </Link>

      <section style={styles.profile}>

        <div style={styles.avatar}>
          {
            student.name
              ?.charAt(0)
              ?.toUpperCase() ||
            'S'
          }
        </div>

        <div style={styles.identity}>

          <span style={styles.eyebrow}>
            STUDENT PROFILE
          </span>

          <h1 style={styles.name}>
            {student.name}
          </h1>

          <div style={styles.identityMeta}>

            <span>
              <AtSign size={15}/>
              {student.username || '—'}
            </span>

            <span>
              <Mail size={15}/>
              {student.email}
            </span>

            <span>
              <UserRound size={15}/>
              #{student.id}
            </span>

          </div>

        </div>

        <LevelBadge
          level={student.level}
        />

      </section>

      <section style={styles.stats}>

        <Stat
          icon={<BrainCircuit/>}
          title="Деңгей"
          value={
            formatLevel(
              student.level
            )
          }
        />

        <Stat
          icon={<Target/>}
          title="Overall Progress"
          value={`${student.overallProgress}%`}
        />

        <Stat
          icon={<BarChart3/>}
          title="Average Quiz"
          value={`${student.averageQuizScore}%`}
        />

        <Stat
          icon={<ClipboardCheck/>}
          title="Quiz саны"
          value={student.completedQuizzes}
        />

      </section>

      <div style={styles.grid}>

        <section style={styles.panel}>

          <PanelTitle
            icon={<AlertTriangle/>}
            title="Әлсіз тақырыптар"
            subtitle="Қосымша practice қажет"
          />

          {
            student.weakTopics?.length
              ? (
                <div style={styles.topicList}>

                  {student.weakTopics.map(
                    topic => (
                      <TopicRow
                        key={topic.topicId}
                        topic={topic}
                      />
                    )
                  )}

                </div>
              )
              : (
                <Empty
                  text="Әлсіз тақырыптар анықталмаған."
                />
              )
          }

        </section>

        <section style={styles.panel}>

          <PanelTitle
            icon={<BookOpen/>}
            title="Пәндер"
            subtitle="Student learning courses"
          />

          {
            student.courses?.length
              ? (
                <div style={styles.courseList}>

                  {student.courses.map(
                    course => (
                      <div
                        key={course}
                        style={styles.courseItem}
                      >
                        <BookOpen size={18}/>
                        {course}
                      </div>
                    )
                  )}

                </div>
              )
              : (
                <Empty
                  text="Әлі пән бойынша progress жоқ."
                />
              )
          }

        </section>

      </div>

      <section style={styles.panel}>

        <PanelTitle
          icon={<ClipboardCheck/>}
          title="Соңғы quiz нәтижелері"
          subtitle="PostgreSQL-да сақталған attempts"
        />

        {
          student.recentQuizzes?.length
            ? (
              <div style={styles.quizTableWrap}>

                <table style={styles.table}>

                  <thead>
                    <tr>
                      <th style={styles.th}>
                        Пән
                      </th>

                      <th style={styles.th}>
                        Тақырып
                      </th>

                      <th style={styles.th}>
                        Difficulty
                      </th>

                      <th style={styles.th}>
                        Нәтиже
                      </th>

                      <th style={styles.th}>
                        Дұрыс
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {student.recentQuizzes.map(
                      quiz => (

                        <tr key={quiz.id}>

                          <td style={styles.td}>
                            <strong>
                              {quiz.courseTitle}
                            </strong>
                          </td>

                          <td style={styles.td}>
                            {quiz.topicTitle}
                          </td>

                          <td style={styles.td}>
                            <Difficulty
                              value={
                                quiz.difficulty
                              }
                            />
                          </td>

                          <td style={styles.td}>

                            <strong
                              style={{
                                color:
                                  scoreColor(
                                    quiz.score
                                  )
                              }}
                            >
                              {quiz.score}%
                            </strong>

                          </td>

                          <td style={styles.td}>
                            {
                              quiz.correctAnswers
                            }
                            /
                            {
                              quiz.totalQuestions
                            }
                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>
            )
            : (
              <Empty
                text="Студент әлі quiz тапсырмаған."
              />
            )
        }

      </section>

      <div style={styles.grid}>

        <section style={styles.panel}>

          <PanelTitle
            icon={<Trophy/>}
            title="Topic Mastery"
            subtitle="Adaptive learning жағдайы"
          />

          {
            student.topicProgress?.length
              ? (
                <div style={styles.topicList}>

                  {student.topicProgress.map(
                    topic => (
                      <TopicRow
                        key={topic.topicId}
                        topic={topic}
                      />
                    )
                  )}

                </div>
              )
              : (
                <Empty
                  text="Diagnostic немесе quiz әлі орындалмаған."
                />
              )
          }

        </section>

        <section style={styles.panel}>

          <PanelTitle
            icon={<Sparkles/>}
            title="AI Recommendations"
            subtitle="Adaptive engine ұсыныстары"
          />

          {
            student.recommendations?.length
              ? (
                <div style={styles.recommendations}>

                  {student.recommendations.map(
                    item => (

                      <article
                        key={item.id}
                        style={styles.recommendation}
                      >

                        <div style={styles.recTop}>

                          <strong>
                            {item.title}
                          </strong>

                          <span style={styles.recType}>
                            {item.type}
                          </span>

                        </div>

                        {item.topicTitle && (
                          <small style={styles.recTopic}>
                            {item.topicTitle}
                          </small>
                        )}

                        <p style={styles.recText}>
                          {item.message}
                        </p>

                      </article>

                    )
                  )}

                </div>
              )
              : (
                <Empty
                  text="Әзірге recommendation жоқ."
                />
              )
          }

        </section>

      </div>

    </div>
  );
}

function Stat({
  icon,
  title,
  value
}) {

  return (
    <article style={styles.stat}>

      <div style={styles.statIcon}>
        {icon}
      </div>

      <div>

        <span style={styles.statTitle}>
          {title}
        </span>

        <strong style={styles.statValue}>
          {value}
        </strong>

      </div>

    </article>
  );
}

function PanelTitle({
  icon,
  title,
  subtitle
}) {

  return (
    <div style={styles.panelTitle}>

      <div style={styles.panelIcon}>
        {icon}
      </div>

      <div>

        <h2 style={styles.panelHeading}>
          {title}
        </h2>

        <p style={styles.panelSubtitle}>
          {subtitle}
        </p>

      </div>

    </div>
  );
}

function TopicRow({
  topic
}) {

  return (
    <div style={styles.topic}>

      <div style={styles.topicHead}>

        <div>

          <strong>
            {topic.topicTitle}
          </strong>

          <small style={styles.courseName}>
            {topic.courseTitle}
          </small>

        </div>

        <strong
          style={{
            color:
              scoreColor(
                topic.masteryScore
              )
          }}
        >
          {topic.masteryScore}%
        </strong>

      </div>

      <div style={styles.progressTrack}>

        <div
          style={{
            ...styles.progressValue,
            width:
              `${Math.min(
                100,
                Math.max(
                  0,
                  topic.masteryScore
                )
              )}%`,
            background:
              scoreColor(
                topic.masteryScore
              )
          }}
        />

      </div>

      <div style={styles.topicBottom}>

        <span>
          {topic.difficulty}
        </span>

        <span>
          {formatStatus(
            topic.status
          )}
        </span>

      </div>

    </div>
  );
}

function Difficulty({
  value
}) {

  return (
    <span style={styles.difficulty}>
      {value}
    </span>
  );
}

function LevelBadge({
  level
}) {

  return (
    <div style={styles.levelBadge}>

      <BrainCircuit size={18}/>

      {formatLevel(level)}

    </div>
  );
}

function Empty({
  text
}) {

  return (
    <div style={styles.empty}>
      {text}
    </div>
  );
}

function formatLevel(level) {

  if (
    level === 'NOT_ASSESSED'
  ) {
    return 'Not assessed';
  }

  if (
    level === 'BEGINNER'
  ) {
    return 'Beginner';
  }

  if (
    level === 'INTERMEDIATE'
  ) {
    return 'Intermediate';
  }

  if (
    level === 'ADVANCED'
  ) {
    return 'Advanced';
  }

  return level || '—';
}

function formatStatus(status) {

  return String(
    status || ''
  )
    .replaceAll(
      '_',
      ' '
    )
    .toLowerCase();
}

function scoreColor(score) {

  if (score < 50) {
    return '#dc4747';
  }

  if (score < 80) {
    return '#d88b19';
  }

  return '#15965b';
}

const styles = {

  page: {
    paddingBottom: '40px'
  },

  back: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    color: '#2877db',
    textDecoration: 'none',
    fontWeight: 800,
    marginBottom: '18px'
  },

  error: {
    padding: '20px',
    background: '#fff1f1',
    borderRadius: '14px',
    color: '#b42318'
  },

  profile: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap',
    padding: '25px',
    background:
      'linear-gradient(135deg,#ffffff,#f3f8ff)',
    border: '1px solid #dce6f2',
    borderRadius: '20px',
    marginBottom: '18px'
  },

  avatar: {
    width: '74px',
    height: '74px',
    borderRadius: '22px',
    background:
      'linear-gradient(135deg,#2379ed,#53a3ff)',
    color: '#fff',
    display: 'grid',
    placeItems: 'center',
    fontSize: '30px',
    fontWeight: 900
  },

  identity: {
    flex: 1,
    minWidth: '220px'
  },

  eyebrow: {
    color: '#2679e8',
    fontSize: '10px',
    fontWeight: 900,
    letterSpacing: '2px'
  },

  name: {
    margin: '5px 0 9px',
    color: '#112e53',
    fontSize: '29px'
  },

  identityMeta: {
    display: 'flex',
    gap: '12px 18px',
    flexWrap: 'wrap',
    color: '#647d9a',
    fontSize: '13px'
  },

  levelBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    padding: '10px 14px',
    borderRadius: '12px',
    background: '#eaf3ff',
    color: '#1765c6',
    fontWeight: 900
  },

  stats: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit,minmax(190px,1fr))',
    gap: '13px',
    marginBottom: '18px'
  },

  stat: {
    display: 'flex',
    alignItems: 'center',
    gap: '13px',
    padding: '18px',
    background: '#fff',
    border: '1px solid #dfe7f1',
    borderRadius: '15px'
  },

  statIcon: {
    width: '43px',
    height: '43px',
    display: 'grid',
    placeItems: 'center',
    background: '#eef5ff',
    color: '#2878dc',
    borderRadius: '12px'
  },

  statTitle: {
    display: 'block',
    color: '#7a8da5',
    fontSize: '12px'
  },

  statValue: {
    display: 'block',
    marginTop: '3px',
    color: '#102d52',
    fontSize: '22px'
  },

  grid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit,minmax(320px,1fr))',
    gap: '16px',
    marginBottom: '16px'
  },

  panel: {
    background: '#fff',
    border: '1px solid #dfe7f1',
    borderRadius: '17px',
    padding: '20px',
    marginBottom: '16px'
  },

  panelTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '11px',
    marginBottom: '17px'
  },

  panelIcon: {
    width: '40px',
    height: '40px',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '11px',
    background: '#eef5ff',
    color: '#2476dd'
  },

  panelHeading: {
    margin: 0,
    color: '#142f51',
    fontSize: '17px'
  },

  panelSubtitle: {
    margin: '3px 0 0',
    color: '#8495aa',
    fontSize: '11px'
  },

  topicList: {
    display: 'grid',
    gap: '15px'
  },

  topic: {
    padding: '13px',
    background: '#f9fbfe',
    borderRadius: '12px'
  },

  topicHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px'
  },

  courseName: {
    display: 'block',
    marginTop: '3px',
    color: '#8799ae'
  },

  progressTrack: {
    height: '7px',
    borderRadius: '20px',
    background: '#e6ecf3',
    overflow: 'hidden',
    marginTop: '10px'
  },

  progressValue: {
    height: '100%',
    borderRadius: '20px'
  },

  topicBottom: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '7px',
    color: '#7d90a8',
    fontSize: '10px',
    textTransform: 'uppercase'
  },

  courseList: {
    display: 'grid',
    gap: '9px'
  },

  courseItem: {
    padding: '13px',
    borderRadius: '11px',
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
    background: '#f6f9fd',
    color: '#284e75',
    fontWeight: 750
  },

  quizTableWrap: {
    overflowX: 'auto'
  },

  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },

  th: {
    textAlign: 'left',
    padding: '11px',
    color: '#7c8da3',
    fontSize: '10px',
    borderBottom:
      '1px solid #e2e8f0'
  },

  td: {
    padding: '13px 11px',
    color: '#38536f',
    fontSize: '13px',
    borderBottom:
      '1px solid #eef2f6'
  },

  difficulty: {
    padding: '5px 8px',
    background: '#edf4ff',
    color: '#226ac7',
    borderRadius: '7px',
    fontSize: '10px',
    fontWeight: 900
  },

  recommendations: {
    display: 'grid',
    gap: '10px'
  },

  recommendation: {
    padding: '14px',
    background:
      'linear-gradient(135deg,#f8f4ff,#f8fbff)',
    border: '1px solid #e5dcfa',
    borderRadius: '12px'
  },

  recTop: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
    color: '#243e62'
  },

  recType: {
    color: '#7650c7',
    fontSize: '9px',
    fontWeight: 900
  },

  recTopic: {
    display: 'block',
    color: '#8265b4',
    marginTop: '5px'
  },

  recText: {
    margin: '8px 0 0',
    color: '#657b96',
    lineHeight: 1.6,
    fontSize: '12px'
  },

  empty: {
    padding: '25px 10px',
    textAlign: 'center',
    color: '#8a9aaf'
  }
};