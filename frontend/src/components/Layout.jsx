import React, {
  useMemo,
  useState
} from 'react';

import {
  NavLink,
  Outlet,
  useNavigate
} from 'react-router-dom';

import {
  Home,
  BookOpen,
  CalendarDays,
  CalendarRange,
  ClipboardList,
  ListChecks,
  GraduationCap,
  BarChart3,
  FileText,
  FolderOpen,
  MessageSquareText,
  Bell,
  Search,
  Globe2,
  ChevronDown,
  UserRound,
  Settings,
  Headphones,
  Sparkles,
  BookMarked,
  FileCheck2,
  ShieldQuestion,
  LogOut,
  X,
  ShieldCheck,
  Users
} from 'lucide-react';

import {
  useAuth
} from '../state/AuthContext';

import { useLanguage } from '../state/language';

const studentNav = [
  ['/', Home, 'Басты бет'],
  ['/study-plan', BookMarked, 'Оқу жоспары'],
  ['/schedule', CalendarDays, 'Оқу кестесі'],
  ['/courses', BookOpen, 'Пәндер'],
  ['/assignments', ClipboardList, 'Тапсырмалар'],
  ['/testing', ListChecks, 'Тестілеу'],
  ['/grades', BarChart3, 'Бағалар'],
  ['/analytics', GraduationCap, 'Прогресс & аналитика'],
  ['/academic-calendar', CalendarRange, 'Академиялық күнтізбе'],
  ['/journal', FileCheck2, 'Журнал'],
  ['/applications', FileText, 'Өтініштер'],
  ['/materials', FolderOpen, 'Оқу материалдары'],
  ['/transcript', FileText, 'Транскрипт'],
  ['/appeals', ShieldQuestion, 'Апелляциялар'],
  ['/ai', Sparkles, 'AI Tutor']
];

const adminNav = [
  ['/admin', ShieldCheck, 'Admin Dashboard'],
  ['/courses', BookOpen, 'Пәндер'],
  ['/analytics', BarChart3, 'Аналитика']
];

export default function Layout() {

  const {
    user,
    logout
  } = useAuth();

  const nav =
    useNavigate();

  const [searchOpen, setSearchOpen] =
    useState(false);

  const [
    notificationsOpen,
    setNotificationsOpen
  ] = useState(false);

  const [
    profileOpen,
    setProfileOpen
  ] = useState(false);

  const [
    query,
    setQuery
  ] = useState('');

  const {lang,setLanguage,t}=useLanguage();

  const isAdmin =
    user?.role === 'ADMIN';

  const primaryNav =
    isAdmin
      ? adminNav
      : studentNav;

  const searchItems =
    useMemo(
      () => [
        ...primaryNav.map(
          ([path, , label]) => ({
            path,
            label: t(label),
            type:
              isAdmin
                ? 'Admin'
                : t("Бөлім")
          })
        ),
        {
          path: '/courses/1',
          label: 'Java Programming',
          type: t("Пән")
        },
        {
          path: '/ai',
          label: 'AI Tutor — Java',
          type: 'AI'
        },
        {
          path: '/analytics',
          label: 'Weak topics & mastery',
          type: t("Аналитика")
        }
      ],
      [primaryNav, isAdmin, lang]
    );

  const filtered =
    searchItems
      .filter(
        item =>
          item.label
            .toLowerCase()
            .includes(
              query.toLowerCase()
            )
      )
      .slice(0, 8);



  return (
    <div className="portal-shell">

      <aside className="portal-sidebar">

        <button
          className="portal-brand"
          onClick={() =>
            nav(
              isAdmin
                ? '/admin'
                : '/'
            )
          }
          aria-label="Adaptive AI home"
        >

          <img
            className="portal-brand-image"
            src="/adaptive-ai-logo.svg"
            alt="Adaptive AI"
          />

        </button>

        {isAdmin && (
          <div className="admin-sidebar-label">
            <ShieldCheck size={15} />
            ADMIN PANEL
          </div>
        )}

        <nav className="portal-nav">

          {primaryNav.map(
            ([to, Icon, label]) => (

              <NavLink
                key={to}
                to={to}
                end={
                  to === '/' ||
                  to === '/admin'
                }
              >

                <Icon size={20} />

                <span>
                  {t(label)}
                </span>

                {
                  !isAdmin &&
                  to === '/assignments' &&
                  (
                    <b className="nav-badge">
                      3
                    </b>
                  )
                }

              </NavLink>

            )
          )}

        </nav>

        <div className="sidebar-bottom">

          <NavLink to="/profile">
            <UserRound size={20} />
            {t("Жеке кабинет")}
          </NavLink>

          {!isAdmin && (
            <NavLink to="/messages">
              <MessageSquareText size={20} />
              {t("Хабарламалар")}
              <b className="nav-badge">
                2
              </b>
            </NavLink>
          )}

          <NavLink to="/settings">
            <Settings size={20} />
            {t("Параметрлер")}
          </NavLink>

          <NavLink to="/support">
            <Headphones size={20} />
            {t("Қолдау қызметі")}
          </NavLink>

        </div>

      </aside>

      <section className="portal-body">

        <header className="portal-topbar">

          <button
            className="top-search"
            onClick={() =>
              setSearchOpen(true)
            }
          >

            <Search size={20} />

            <span>
              {
                isAdmin
                  ? t("Студент, пән, аналитика іздеу...")
                  : t("Іздеу (пән, тапсырма, материал...)")
              }
            </span>

          </button>

          <div className="top-actions">

            <div className="dropdown-wrap">

              <button
                className="icon-btn"
                onClick={() =>
                  setNotificationsOpen(
                    value => !value
                  )
                }
              >
                <Bell size={21} />
                <i />
              </button>

              {notificationsOpen && (
                <div className="dropdown notifications">

                  <h4>
                    {t("Хабарландырулар")}
                  </h4>

                  {isAdmin ? (
                    <>
                      <button>
                        <strong>
                          Admin Panel
                        </strong>
                        <small>
                          {t("Жүйе қалыпты жұмыс істеуде")}
                        </small>
                      </button>

                      <button
                        onClick={() =>
                          nav('/admin')
                        }
                      >
                        <strong>
                          Students
                        </strong>
                        <small>
                          {t("Қолданушылар статистикасын қарау")}
                        </small>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() =>
                          nav('/assignments')
                        }
                      >
                        <strong>
                          Java Quiz
                        </strong>
                        <small>
                          {t("Ертең 23:59 дейін")}
                        </small>
                      </button>

                      <button
                        onClick={() =>
                          nav('/messages')
                        }
                      >
                        <strong>
                          {t("Жаңа хабарлама")}
                        </strong>
                        <small>
                          {t("Оқытушы материал жіберді")}
                        </small>
                      </button>

                      <button
                        onClick={() =>
                          nav('/analytics')
                        }
                      >
                        <strong>
                          AI Recommendation
                        </strong>
                        <small>
                          {t("OOP тақырыбын қайталау ұсынылды")}
                        </small>
                      </button>
                    </>
                  )}

                </div>
              )}

            </div>

            <div className="lang-switch">

              <Globe2 size={18} />

              <select
                value={lang}
                onChange={
                  e =>
                    setLanguage(
                      e.target.value
                    )
                }
              >
                <option>KZ</option>
                <option>RU</option>
                <option>EN</option>
              </select>

            </div>

            <div className="dropdown-wrap">

              <button
                className="profile-btn"
                onClick={() =>
                  setProfileOpen(
                    value => !value
                  )
                }
              >

                <span className="top-avatar">
                  {user?.name?.[0] || 'U'}
                </span>

                <span>
                  <strong>
                    {user?.name || 'User'}
                  </strong>

                  <small>
                    {
                      isAdmin
                        ? t("Администратор")
                        : t("Студент")
                    }
                  </small>
                </span>

                <ChevronDown size={16} />

              </button>

              {profileOpen && (
                <div className="dropdown profile-menu">

                  <button
                    onClick={() =>
                      nav('/profile')
                    }
                  >
                    <UserRound size={17} />
                    {t("Жеке кабинет")}
                  </button>

                  <button
                    onClick={() =>
                      nav('/settings')
                    }
                  >
                    <Settings size={17} />
                    {t("Параметрлер")}
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      nav('/login');
                    }}
                  >
                    <LogOut size={17} />
                    {t("Шығу")}
                  </button>

                </div>
              )}

            </div>

          </div>

        </header>

        <main className="portal-main">
          <Outlet />
        </main>

        <footer className="portal-footer">

          <strong>
            ADAPTIVE AI
          </strong>

          <span>
            © 2026. University Adaptive Learning Platform.
          </span>

          <span>
            {t("Құпиялық саясаты · Байланыс")}
          </span>

        </footer>

      </section>

      {searchOpen && (
        <div
          className="search-overlay"
          onMouseDown={() =>
            setSearchOpen(false)
          }
        >

          <div
            className="search-modal"
            onMouseDown={
              e => e.stopPropagation()
            }
          >

            <div className="search-modal-head">

              <Search size={21} />

              <input
                autoFocus
                value={query}
                onChange={
                  e =>
                    setQuery(
                      e.target.value
                    )
                }
                placeholder={t("Не іздейсіз?")}
              />

              <button
                onClick={() =>
                  setSearchOpen(false)
                }
              >
                <X />
              </button>

            </div>

            <div className="search-results">

              {filtered.map(
                item => (
                  <button
                    key={
                      item.path +
                      item.label
                    }
                    onClick={() => {
                      nav(item.path);
                      setSearchOpen(false);
                      setQuery('');
                    }}
                  >

                    <span>
                      <strong>
                        {item.label}
                      </strong>

                      <small>
                        {item.type}
                      </small>
                    </span>

                    <span>
                      →
                    </span>

                  </button>
                )
              )}

              {!filtered.length && (
                <p>
                  {t("Нәтиже табылмады.")}
                </p>
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}