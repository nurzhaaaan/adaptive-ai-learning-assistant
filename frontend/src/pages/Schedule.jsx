import React, {
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  CalendarDays,
  Plus,
  Clock3,
  MapPin,
  UserRound,
  Pencil,
  Trash2,
  X,
  BookOpen,
  Save,
  RefreshCw
} from 'lucide-react';

import { api } from '../api';

const DAYS = [
  {
    key: 'MONDAY',
    short: 'Дс',
    label: 'Дүйсенбі'
  },
  {
    key: 'TUESDAY',
    short: 'Сс',
    label: 'Сейсенбі'
  },
  {
    key: 'WEDNESDAY',
    short: 'Ср',
    label: 'Сәрсенбі'
  },
  {
    key: 'THURSDAY',
    short: 'Бс',
    label: 'Бейсенбі'
  },
  {
    key: 'FRIDAY',
    short: 'Жм',
    label: 'Жұма'
  },
  {
    key: 'SATURDAY',
    short: 'Сб',
    label: 'Сенбі'
  },
  {
    key: 'SUNDAY',
    short: 'Жс',
    label: 'Жексенбі'
  }
];

function emptyForm(day) {
  return {
    dayOfWeek: day,
    subject: '',
    startTime: '09:00',
    endTime: '10:20',
    room: '',
    teacher: ''
  };
}

export default function Schedule() {

  const [lessons, setLessons] =
    useState([]);

  const [selectedDay, setSelectedDay] =
    useState('MONDAY');

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState('');

  const [formOpen, setFormOpen] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [form, setForm] =
    useState(
      emptyForm('MONDAY')
    );

  async function loadLessons() {

    setLoading(true);
    setError('');

    try {

      const data =
        await api('/schedule');

      setLessons(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {

      setError(
        err?.message ||
        'Кестені жүктеу мүмкін болмады.'
      );

    } finally {

      setLoading(false);
    }
  }

  useEffect(() => {
    loadLessons();
  }, []);

  const selectedDayInfo =
    DAYS.find(
      day =>
        day.key === selectedDay
    );

  const visibleLessons =
    useMemo(
      () =>
        lessons
          .filter(
            lesson =>
              lesson.dayOfWeek ===
              selectedDay
          )
          .sort(
            (a, b) =>
              a.startTime.localeCompare(
                b.startTime
              )
          ),
      [
        lessons,
        selectedDay
      ]
    );

  function countForDay(day) {

    return lessons.filter(
      lesson =>
        lesson.dayOfWeek ===
        day
    ).length;
  }

  function openCreate() {

    setEditingId(null);

    setForm(
      emptyForm(selectedDay)
    );

    setFormOpen(true);
    setError('');
  }

  function openEdit(lesson) {

    setEditingId(lesson.id);

    setForm({
      dayOfWeek:
        lesson.dayOfWeek,

      subject:
        lesson.subject || '',

      startTime:
        lesson.startTime || '09:00',

      endTime:
        lesson.endTime || '10:20',

      room:
        lesson.room || '',

      teacher:
        lesson.teacher || ''
    });

    setFormOpen(true);
    setError('');
  }

  function closeForm() {

    if (saving) {
      return;
    }

    setFormOpen(false);
    setEditingId(null);
  }

  function changeField(
    field,
    value
  ) {

    setForm(
      previous => ({
        ...previous,
        [field]: value
      })
    );
  }

  async function submit(e) {

    e.preventDefault();

    setError('');

    if (!form.subject.trim()) {

      setError(
        'Пән атауын енгіз.'
      );

      return;
    }

    if (
      form.endTime <=
      form.startTime
    ) {

      setError(
        'Аяқталу уақыты басталу уақытынан кейін болуы керек.'
      );

      return;
    }

    setSaving(true);

    try {

      const url =
        editingId
          ? `/schedule/${editingId}`
          : '/schedule';

      const method =
        editingId
          ? 'PUT'
          : 'POST';

      await api(
        url,
        {
          method,
          body:
            JSON.stringify(form)
        }
      );

      setSelectedDay(
        form.dayOfWeek
      );

      setFormOpen(false);
      setEditingId(null);

      await loadLessons();

    } catch (err) {

      setError(
        err?.message ||
        'Сабақты сақтау кезінде қате шықты.'
      );

    } finally {

      setSaving(false);
    }
  }

  async function removeLesson(
    lesson
  ) {

    const accepted =
      window.confirm(
        `"${lesson.subject}" сабағын өшіргің келе ме?`
      );

    if (!accepted) {
      return;
    }

    try {

      await api(
        `/schedule/${lesson.id}`,
        {
          method: 'DELETE'
        }
      );

      setLessons(
        previous =>
          previous.filter(
            item =>
              item.id !== lesson.id
          )
      );

    } catch (err) {

      setError(
        err?.message ||
        'Сабақты өшіру мүмкін болмады.'
      );
    }
  }

  return (
    <div style={s.page}>

      <header style={s.header}>

        <div>

          <span style={s.eyebrow}>
            WEEKLY SCHEDULE
          </span>

          <h1 style={s.title}>
            Оқу кестесі
          </h1>

          <p style={s.subtitle}>
            Апталық сабақ кестеңді
            өзің құрастыр және басқар.
          </p>

        </div>

        <div style={s.headerActions}>

          <button
            style={s.secondaryButton}
            onClick={loadLessons}
          >
            <RefreshCw size={17}/>
            Жаңарту
          </button>

          <button
            style={s.primaryButton}
            onClick={openCreate}
          >
            <Plus size={19}/>
            Сабақ қосу
          </button>

        </div>

      </header>

      {error && (
        <div style={s.error}>
          {error}
        </div>
      )}

      <section style={s.dayTabs}>

        {DAYS.map(day => {

          const active =
            selectedDay ===
            day.key;

          const count =
            countForDay(day.key);

          return (
            <button
              key={day.key}
              onClick={() =>
                setSelectedDay(
                  day.key
                )
              }
              style={{
                ...s.dayButton,
                ...(active
                  ? s.dayButtonActive
                  : {})
              }}
            >

              <span style={s.dayShort}>
                {day.short}
              </span>

              <span>
                {day.label}
              </span>

              {count > 0 && (
                <b
                  style={{
                    ...s.dayCount,
                    ...(active
                      ? s.dayCountActive
                      : {})
                  }}
                >
                  {count}
                </b>
              )}

            </button>
          );
        })}

      </section>

      <section style={s.contentCard}>

        <div style={s.dayHeader}>

          <div style={s.dayTitleWrap}>

            <div style={s.calendarIcon}>
              <CalendarDays
                size={24}
              />
            </div>

            <div>

              <h2 style={s.dayTitle}>
                {
                  selectedDayInfo
                    ?.label
                }
              </h2>

              <p style={s.daySubtitle}>
                {
                  visibleLessons.length
                }{' '}
                сабақ
              </p>

            </div>

          </div>

          <button
            style={s.addMiniButton}
            onClick={openCreate}
          >
            <Plus size={17}/>
            Қосу
          </button>

        </div>

        {loading ? (

          <div style={s.empty}>
            Кесте жүктелуде...
          </div>

        ) : visibleLessons.length ===
          0 ? (

          <div style={s.empty}>

            <div style={s.emptyIcon}>
              <BookOpen
                size={30}
              />
            </div>

            <h3>
              Бұл күнге сабақ жоқ
            </h3>

            <p>
              «Сабақ қосу» батырмасы
              арқылы кестеңді толтыр.
            </p>

            <button
              style={s.primaryButton}
              onClick={openCreate}
            >
              <Plus size={18}/>
              Бірінші сабақты қосу
            </button>

          </div>

        ) : (

          <div style={s.lessonList}>

            {visibleLessons.map(
              lesson => (

                <article
                  key={lesson.id}
                  style={s.lessonCard}
                >

                  <div
                    style={s.timeColumn}
                  >

                    <strong
                      style={s.startTime}
                    >
                      {
                        lesson.startTime
                      }
                    </strong>

                    <span
                      style={s.timeLine}
                    />

                    <small
                      style={s.endTime}
                    >
                      {lesson.endTime}
                    </small>

                  </div>

                  <div
                    style={s.lessonIcon}
                  >
                    <BookOpen
                      size={21}
                    />
                  </div>

                  <div
                    style={s.lessonMain}
                  >

                    <h3
                      style={s.lessonTitle}
                    >
                      {lesson.subject}
                    </h3>

                    <div
                      style={s.lessonMeta}
                    >

                      {lesson.room && (
                        <span>
                          <MapPin
                            size={15}
                          />
                          {lesson.room}
                        </span>
                      )}

                      {lesson.teacher && (
                        <span>
                          <UserRound
                            size={15}
                          />
                          {lesson.teacher}
                        </span>
                      )}

                      <span>
                        <Clock3
                          size={15}
                        />

                        {
                          lesson.startTime
                        }
                        {' – '}
                        {
                          lesson.endTime
                        }
                      </span>

                    </div>

                  </div>

                  <div
                    style={s.lessonActions}
                  >

                    <button
                      style={s.iconButton}
                      onClick={() =>
                        openEdit(
                          lesson
                        )
                      }
                      title="Өзгерту"
                    >
                      <Pencil
                        size={17}
                      />
                    </button>

                    <button
                      style={{
                        ...s.iconButton,
                        ...s.deleteButton
                      }}
                      onClick={() =>
                        removeLesson(
                          lesson
                        )
                      }
                      title="Өшіру"
                    >
                      <Trash2
                        size={17}
                      />
                    </button>

                  </div>

                </article>
              )
            )}

          </div>
        )}

      </section>

      {formOpen && (

        <div
          style={s.overlay}
          onMouseDown={
            closeForm
          }
        >

          <div
            style={s.modal}
            onMouseDown={
              e =>
                e.stopPropagation()
            }
          >

            <div
              style={s.modalHeader}
            >

              <div>

                <span
                  style={s.eyebrow}
                >
                  {
                    editingId
                      ? 'EDIT LESSON'
                      : 'NEW LESSON'
                  }
                </span>

                <h2
                  style={s.modalTitle}
                >
                  {
                    editingId
                      ? 'Сабақты өзгерту'
                      : 'Сабақ қосу'
                  }
                </h2>

              </div>

              <button
                onClick={closeForm}
                style={s.closeButton}
              >
                <X size={21}/>
              </button>

            </div>

            <form
              onSubmit={submit}
              style={s.form}
            >

              <label
                style={s.field}
              >
                <span>
                  Апта күні
                </span>

                <select
                  style={s.input}
                  value={
                    form.dayOfWeek
                  }
                  onChange={
                    e =>
                      changeField(
                        'dayOfWeek',
                        e.target.value
                      )
                  }
                >

                  {DAYS.map(day => (
                    <option
                      key={day.key}
                      value={day.key}
                    >
                      {day.label}
                    </option>
                  ))}

                </select>

              </label>

              <label
                style={s.field}
              >
                <span>
                  Пән атауы *
                </span>

                <input
                  style={s.input}
                  value={
                    form.subject
                  }
                  onChange={
                    e =>
                      changeField(
                        'subject',
                        e.target.value
                      )
                  }
                  placeholder="Мысалы: Database Systems"
                  autoFocus
                />
              </label>

              <div
                style={s.twoColumns}
              >

                <label
                  style={s.field}
                >
                  <span>
                    Басталуы
                  </span>

                  <input
                    style={s.input}
                    type="time"
                    value={
                      form.startTime
                    }
                    onChange={
                      e =>
                        changeField(
                          'startTime',
                          e.target.value
                        )
                    }
                  />
                </label>

                <label
                  style={s.field}
                >
                  <span>
                    Аяқталуы
                  </span>

                  <input
                    style={s.input}
                    type="time"
                    value={
                      form.endTime
                    }
                    onChange={
                      e =>
                        changeField(
                          'endTime',
                          e.target.value
                        )
                    }
                  />
                </label>

              </div>

              <label
                style={s.field}
              >
                <span>
                  Аудитория
                </span>

                <input
                  style={s.input}
                  value={
                    form.room
                  }
                  onChange={
                    e =>
                      changeField(
                        'room',
                        e.target.value
                      )
                  }
                  placeholder="Мысалы: Lab 2"
                />
              </label>

              <label
                style={s.field}
              >
                <span>
                  Оқытушы
                </span>

                <input
                  style={s.input}
                  value={
                    form.teacher
                  }
                  onChange={
                    e =>
                      changeField(
                        'teacher',
                        e.target.value
                      )
                  }
                  placeholder="Оқытушының аты-жөні"
                />
              </label>

              <div
                style={s.formActions}
              >

                <button
                  type="button"
                  onClick={closeForm}
                  style={s.cancelButton}
                >
                  Бас тарту
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    ...s.primaryButton,
                    opacity:
                      saving
                        ? .65
                        : 1
                  }}
                >
                  <Save size={18}/>

                  {
                    saving
                      ? 'Сақталуда...'
                      : 'Сақтау'
                  }

                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

const s = {

  page: {
    paddingBottom: '35px'
  },

  header: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: '20px',
    flexWrap: 'wrap',
    marginBottom: '24px'
  },

  eyebrow: {
    color: '#2479ed',
    fontWeight: 900,
    letterSpacing: '2px',
    fontSize: '11px'
  },

  title: {
    margin: '8px 0 5px',
    fontSize: '34px',
    lineHeight: 1.1,
    color: '#10294d'
  },

  subtitle: {
    margin: 0,
    color: '#7186a3',
    fontSize: '16px'
  },

  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap'
  },

  primaryButton: {
    minHeight: '42px',
    border: 0,
    borderRadius: '11px',
    padding: '0 17px',
    background: '#267beb',
    color: '#fff',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontWeight: 800,
    cursor: 'pointer'
  },

  secondaryButton: {
    minHeight: '42px',
    border: '1px solid #d9e2ef',
    borderRadius: '11px',
    padding: '0 15px',
    background: '#fff',
    color: '#17375f',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    fontWeight: 750,
    cursor: 'pointer'
  },

  error: {
    padding: '13px 15px',
    marginBottom: '16px',
    background: '#fff0f0',
    color: '#b42318',
    border: '1px solid #ffd1d1',
    borderRadius: '12px'
  },

  dayTabs: {
    display: 'flex',
    gap: '9px',
    flexWrap: 'wrap',
    marginBottom: '16px'
  },

  dayButton: {
    border: '1px solid #dce5f0',
    background: '#fff',
    color: '#314e73',
    minHeight: '46px',
    borderRadius: '12px',
    padding: '0 13px',
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    fontWeight: 750,
    cursor: 'pointer'
  },

  dayButtonActive: {
    borderColor: '#287df0',
    background: '#287df0',
    color: '#fff',
    boxShadow:
      '0 8px 22px rgba(40,125,240,.20)'
  },

  dayShort: {
    fontSize: '11px',
    opacity: .7
  },

  dayCount: {
    width: '20px',
    height: '20px',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '50%',
    background: '#edf3fb',
    color: '#1b579f',
    fontSize: '11px'
  },

  dayCountActive: {
    background:
      'rgba(255,255,255,.18)',
    color: '#fff'
  },

  contentCard: {
    background: '#fff',
    border: '1px solid #dbe4ef',
    borderRadius: '18px',
    overflow: 'hidden',
    boxShadow:
      '0 8px 25px rgba(42,67,105,.04)'
  },

  dayHeader: {
    minHeight: '85px',
    padding: '17px 22px',
    borderBottom:
      '1px solid #e3eaf3',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '15px'
  },

  dayTitleWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '13px'
  },

  calendarIcon: {
    width: '45px',
    height: '45px',
    borderRadius: '13px',
    display: 'grid',
    placeItems: 'center',
    background: '#eef5ff',
    color: '#267beb'
  },

  dayTitle: {
    margin: 0,
    color: '#112d52',
    fontSize: '21px'
  },

  daySubtitle: {
    margin: '3px 0 0',
    color: '#8a9bb0',
    fontSize: '13px'
  },

  addMiniButton: {
    border: '1px solid #d8e3f1',
    background: '#f8fbff',
    borderRadius: '10px',
    height: '38px',
    padding: '0 13px',
    color: '#226dcc',
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer'
  },

  lessonList: {
    padding: '10px 20px 20px',
    display: 'grid',
    gap: '10px'
  },

  lessonCard: {
    minHeight: '105px',
    display: 'flex',
    alignItems: 'center',
    gap: '17px',
    padding: '15px 17px',
    border: '1px solid #e0e7f0',
    borderRadius: '14px',
    background:
      'linear-gradient(90deg,#fff,#fbfdff)'
  },

  timeColumn: {
    minWidth: '58px',
    textAlign: 'center',
    display: 'grid',
    justifyItems: 'center'
  },

  startTime: {
    color: '#122f55',
    fontSize: '15px'
  },

  endTime: {
    color: '#8293a8',
    fontSize: '11px'
  },

  timeLine: {
    width: '1px',
    height: '14px',
    background: '#cfd9e6',
    margin: '3px 0'
  },

  lessonIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'grid',
    placeItems: 'center',
    color: '#287bed',
    background: '#edf5ff',
    flexShrink: 0
  },

  lessonMain: {
    minWidth: 0,
    flex: 1
  },

  lessonTitle: {
    margin: '0 0 8px',
    fontSize: '17px',
    color: '#102b50'
  },

  lessonMeta: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px 15px',
    color: '#70849e',
    fontSize: '12px'
  },

  lessonActions: {
    display: 'flex',
    gap: '7px'
  },

  iconButton: {
    width: '36px',
    height: '36px',
    display: 'grid',
    placeItems: 'center',
    border: '1px solid #dce5ef',
    background: '#fff',
    color: '#31577f',
    borderRadius: '9px',
    cursor: 'pointer'
  },

  deleteButton: {
    color: '#cf3b3b',
    background: '#fff7f7'
  },

  empty: {
    minHeight: '300px',
    padding: '45px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    color: '#7488a4'
  },

  emptyIcon: {
    width: '64px',
    height: '64px',
    display: 'grid',
    placeItems: 'center',
    background: '#eff5fd',
    color: '#3679cc',
    borderRadius: '18px',
    marginBottom: '10px'
  },

  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 500,
    display: 'grid',
    placeItems: 'center',
    padding: '20px',
    background:
      'rgba(9,27,53,.42)',
    backdropFilter: 'blur(5px)'
  },

  modal: {
    width: 'min(520px, 95vw)',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '25px',
    background: '#fff',
    borderRadius: '20px',
    boxShadow:
      '0 30px 100px rgba(15,36,68,.25)'
  },

  modalHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '15px',
    marginBottom: '22px'
  },

  modalTitle: {
    margin: '6px 0 0',
    color: '#102b50',
    fontSize: '25px'
  },

  closeButton: {
    width: '38px',
    height: '38px',
    display: 'grid',
    placeItems: 'center',
    borderRadius: '10px',
    border: '1px solid #e1e7ef',
    background: '#fff',
    cursor: 'pointer',
    color: '#536b87'
  },

  form: {
    display: 'grid',
    gap: '15px'
  },

  field: {
    display: 'grid',
    gap: '7px',
    color: '#264462',
    fontSize: '13px',
    fontWeight: 750
  },

  input: {
    width: '100%',
    height: '44px',
    boxSizing: 'border-box',
    border: '1px solid #d2deeb',
    borderRadius: '10px',
    padding: '0 12px',
    outline: 'none',
    color: '#132f51',
    background: '#fff',
    fontSize: '14px'
  },

  twoColumns: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit,minmax(160px,1fr))',
    gap: '12px'
  },

  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '7px'
  },

  cancelButton: {
    height: '42px',
    border: '1px solid #d9e2ec',
    borderRadius: '10px',
    background: '#fff',
    color: '#46617e',
    padding: '0 16px',
    fontWeight: 750,
    cursor: 'pointer'
  }
};