import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Link } from 'react-router-dom';
import {
  CalendarDays, ClipboardList, BookOpen, BarChart3, ListChecks, FileText,
  ArrowRight, Sparkles, MessageSquareText, MapPin, Library, ClipboardCheck,
  AlertTriangle, BrainCircuit
} from 'lucide-react';
import ProgressBar from '../components/ProgressBar';

const fallback = {
  studentName: 'Student', overallProgress: 68, averageScore: 78, completedQuizzes: 8,
  courses: [{id:1,title:'Java Programming',code:'JAVA101',topicCount:7,progressPercent:68}],
  weakTopics: [{topicId:5,topicTitle:'OOP',masteryScore:45}], recommendations: []
};

export default function Dashboard(){
  const [d,setD]=useState(null);
  useEffect(()=>{api('/dashboard').then(setD).catch(()=>setD(fallback))},[]);
  if(!d) return <div className="loader">Dashboard жүктелуде...</div>;

  return <div className="dashboard-page">
    <section className="hero-grid">
      <div className="welcome-banner">
        <div><span className="eyebrow">PERSONAL LEARNING SPACE</span><h1>Сәлем, {d.studentName}!</h1><p>Білімге ұмтылу — үлкен жетістікке бастайды.</p></div>
        <div className="quote-card"><strong>“Бүгінгі еңбек — ертеңгі мүмкіндік.”</strong><small>Adaptive AI</small><BrainCircuit size={20}/></div>
      </div>
      <div className="semester-card"><div className="semester-title"><CalendarDays/><div><strong>Күзгі семестр 2026</strong><small>1 қыркүйек – 25 желтоқсан</small></div></div><div className="semester-meta"><span>7 апта / 16 апта</span><b>{Math.round(7/16*100)}%</b></div><ProgressBar value={7/16*100}/></div>
    </section>

    <section className="quick-grid">
      <Quick to="/schedule" icon={<CalendarDays/>} title="Оқу кестесі" sub="Бүгінгі сабақтар" tone="blue"/>
      <Quick to="/assignments" icon={<ClipboardList/>} title="Тапсырмалар" sub="3 жаңа тапсырма" tone="green"/>
      <Quick to="/courses" icon={<BookOpen/>} title="Пәндер" sub="Барлық пәндер" tone="purple"/>
      <Quick to="/grades" icon={<BarChart3/>} title="Бағалар" sub="Ағымдағы үлгерім" tone="orange"/>
      <Quick to="/testing" icon={<ListChecks/>} title="Тестілеу" sub="Adaptive quiz" tone="cyan"/>
      <Quick to="/applications" icon={<FileText/>} title="Өтініш беру" sub="Академиялық сұраныс" tone="pink"/>
    </section>

    <section className="dashboard-columns">
      <div className="panel schedule-panel"><PanelHead title="Бүгінгі сабақтар" link="/schedule"/><div className="timeline">
        <Lesson time="10:00 – 11:20" title="Human-Computer Interaction" room="Ауд. 304, Бас ғимарат" teacher="Сейтқұлов А.Е."/>
        <Lesson time="12:00 – 13:20" title="Database Systems" room="Ауд. 318, Бас ғимарат" teacher="Ибрайимова Г.К."/>
        <Lesson time="14:00 – 15:20" title="Probability and Statistics" room="Ауд. 201, Бас ғимарат" teacher="Тулебаев М.С."/>
        <Lesson time="16:00 – 17:20" title="English" room="Ауд. 401, 2-ші ғимарат" teacher="Johnson P."/>
      </div></div>

      <div className="middle-stack">
        <div className="panel"><PanelHead title="Жақын арадағы тапсырмалар" link="/assignments"/><Task due="Ертең" title="Java Adaptive Quiz" text="Deadline: 10 қыркүйек, 23:59" hot/><Task due="3 күн" title="Database Lab 2" text="Deadline: 12 қыркүйек, 23:59"/><Task due="5 күн" title="HCI Assignment" text="Deadline: 14 қыркүйек, 23:59"/><Task due="1 апта" title="English Essay" text="Deadline: 16 қыркүйек, 23:59"/></div>
        <div className="panel"><PanelHead title="Хабарламалар" link="/messages"/><Message title="Оқытушыдан хабарлама" text="Java пәні бойынша қосымша материал жүктелді." time="2 сағат бұрын"/><Message title="AI Recommendation" text="OOP тақырыбын қайта қарау ұсынылады." time="Бүгін"/><Message title="Жүйелік хабарлама" text="Diagnostic test нәтижесі жаңартылды." time="Кеше"/></div>
      </div>

      <div className="right-stack">
        <div className="panel"><PanelHead title="Ағымдағы үлгерім" link="/analytics"/>{d.courses.map(c=><CourseProgress key={c.id} title={c.title} value={c.progressPercent}/>)}<CourseProgress title="Database Systems" value={72}/><CourseProgress title="Human-Computer Interaction" value={85}/><CourseProgress title="English" value={90}/></div>
        <div className="panel"><PanelHead title="AI Learning Insight" link="/ai"/><div className="ai-insight"><Sparkles/><div><strong>{d.weakTopics?.[0]?.topicTitle ? `${d.weakTopics[0].topicTitle} тақырыбын қайтала` : 'Жаңа quiz тапсырып көр'}</strong><p>AI сенің quiz нәтижелеріңді талдап, келесі оқу қадамын ұсынады.</p><Link to="/ai">AI Tutor-дан сұрау →</Link></div></div></div>
        <div className="panel quick-actions"><PanelHead title="Жылдам әрекеттер"/><div><Link to="/transcript"><FileText/>Транскрипт</Link><Link to="/materials"><Library/>Кітапхана</Link><Link to="/schedule"><MapPin/>Аудитория</Link><Link to="/testing"><ClipboardCheck/>Тест тапсыру</Link></div></div>
      </div>
    </section>
  </div>
}
function Quick({to,icon,title,sub,tone}){return <Link className={`quick-card ${tone}`} to={to}><span>{icon}</span><strong>{title}</strong><small>{sub}</small></Link>}
function PanelHead({title,link}){return <div className="panel-head"><h2>{title}</h2>{link&&<Link to={link}>Барлығын көру <ArrowRight size={15}/></Link>}</div>}
function Lesson({time,title,room,teacher}){return <div className="lesson-row"><time>{time}</time><span className="timeline-dot"/><div><strong>{title}</strong><small>{room}</small><small>Оқытушы: {teacher}</small></div></div>}
function Task({due,title,text,hot}) {return <Link to="/assignments" className="task-row"><span className={hot?'due hot':'due'}>{due}</span><div><strong>{title}</strong><small>{text}</small></div><ArrowRight size={16}/></Link>}
function Message({title,text,time}){return <Link to="/messages" className="message-row"><MessageSquareText size={17}/><div><strong>{title}</strong><small>{text}</small></div><time>{time}</time></Link>}
function CourseProgress({title,value}){return <div className="grade-row"><div><strong>{title}</strong><b>{value}%</b></div><ProgressBar value={value}/></div>}
