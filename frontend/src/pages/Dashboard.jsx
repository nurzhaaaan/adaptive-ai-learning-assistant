import React,{useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {api} from '../api';
import {useLanguage} from '../state/language';
import ProgressBar from '../components/ProgressBar';
export default function Dashboard(){
 const {lang,t}=useLanguage();
 const l=(k,e,r)=>({KZ:k,EN:e,RU:r}[lang]);
 const [data,setData]=useState(null),[error,setError]=useState(''),[retry,setRetry]=useState(0);
 useEffect(()=>{let active=true;setError('');api('/dashboard').then(d=>{if(active)setData(d)}).catch(e=>{if(active)setError(e.message)});return()=>{active=false}},[retry]);
 if(error)return <section className="card" role="alert"><p>{error}</p><button onClick={()=>setRetry(x=>x+1)}>{t('Retry')}</button></section>;
 if(!data)return <div className="loader">{t('Loading...')}</div>;
 const stats=[[l('Орташа үлгерім','Average score','Средний балл'),data.completedQuizzes?data.averageScore+'%':'—'],[l('Орындалған тесттер','Completed quizzes','Пройденные тесты'),data.completedQuizzes],[t('Courses'),data.courses.length]];
 const links=[['/study-plan','Оқу жоспары'],['/courses','Пәндер'],['/analytics','Прогресс & аналитика'],['/ai','AI Tutor']];
 return <div className="dashboard-page">
 <section className="welcome-banner"><div><span className="eyebrow">{l('ЖЕКЕ ОҚУ КЕҢІСТІГІ','PERSONAL LEARNING SPACE','ЛИЧНОЕ УЧЕБНОЕ ПРОСТРАНСТВО')}</span><h1>{l('Сәлем','Hello','Здравствуйте')}, {data.studentName}!</h1><p>{l('Білім деңгейіңізді бақылап, жеке оқу жоспарыңызды жалғастырыңыз.','Track your progress and continue your personal learning plan.','Следите за прогрессом и продолжайте индивидуальный план обучения.')}</p></div></section>
 <section className="stat-grid" style={{marginTop:20}}>{stats.map(([label,value])=><div className="stat-card" key={label}><div><small>{label}</small><strong>{value}</strong></div></div>)}</section>
 <section className="quick-grid" style={{marginTop:20}}>{links.map(([path,label])=><Link className="quick-card blue" key={path} to={path}><strong>{t(label)}</strong></Link>)}</section>
 <section className="card" style={{marginTop:20}}><h2>{l('Ағымдағы үлгерім','Current progress','Текущий прогресс')}</h2>{data.courses.length===0?<p>{t('No courses found')}</p>:data.courses.map(c=><div className="grade-row" key={c.id}><div><Link to={'/courses/'+c.id}>{c.title}</Link><b>{c.progressPercent}%</b></div><ProgressBar value={c.progressPercent}/></div>)}</section>
 <section className="card" style={{marginTop:20}}><h2>{t('Weak topics')}</h2>{data.weakTopics?.length?data.weakTopics.map(x=><p key={x.topicId}><Link to={'/quiz/'+x.topicId}>{x.topicTitle}</Link> · {x.masteryScore}%</p>):<p>{l('Әлсіз тақырыптарды анықтау үшін тест тапсырыңыз.','Take a test to identify topics that need review.','Пройдите тест, чтобы выявить темы для повторения.')}</p>}<Link to="/study-plan">{t('Study plan')} →</Link></section>
 </div>
}
