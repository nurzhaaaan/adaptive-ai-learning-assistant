import React,{useEffect,useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {api} from '../api';
import {useLanguage} from '../state/language';
export default function AcademicProfile(){
 const {lang}=useLanguage(),nav=useNavigate();
 const l=(k,e,r)=>({KZ:k,EN:e,RU:r}[lang]);
 const [p,setP]=useState({mode:'UNIVERSITY',university:'',major:'',studyYear:1,goal:'',courseIds:[]});
 const [catalog,setCatalog]=useState([]),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(''),[retry,setRetry]=useState(0);
 useEffect(()=>{let active=true;setLoading(true);setError('');Promise.all([api('/academic/profile'),api('/academic/catalog')]).then(([profile,list])=>{if(!active)return;setCatalog(list);if(profile.mode)setP(profile)}).catch(e=>{if(active)setError(e.message)}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[retry]);
 const field=(key,value)=>setP(old=>({...old,[key]:value}));
 const toggle=id=>setP(old=>({...old,courseIds:old.courseIds.includes(id)?old.courseIds.filter(x=>x!==id):[...old.courseIds,id]}));
 async function save(e){e.preventDefault();setBusy(true);setError('');try{await api('/academic/profile',{method:'PUT',body:JSON.stringify(p)});nav('/courses',{replace:true})}catch(e){setError(e.message)}finally{setBusy(false)}}
 const majors=['Information Systems','Computer Science','Cybersecurity','Data Science','Software Engineering','Other'];
 const hints={'Information Systems':/java|database|sql|cloud|system|iot/i,'Computer Science':/algorithm|data structure|discrete|operating|programming/i,'Cybersecurity':/security|crypto|network|linux/i,'Data Science':/python|machine learning|statistic|math|data science/i,'Software Engineering':/java|software|testing|backend|frontend|programming/i};
 const recommended=catalog.filter(c=>hints[p.major]?.test(c.title+' '+c.code));
 const inputStyle={width:'100%',padding:12,border:'1px solid #cdd8e5',borderRadius:10,boxSizing:'border-box'};
 const labelStyle={display:'grid',gap:6};
 if(loading)return <div className="loader">{l('Жүктелуде...','Loading...','Загрузка...')}</div>;
 if(!catalog.length&&error)return <section className="card" role="alert"><p>{l('Оқу профилі жүктелмеді. Backend жаңа нұсқасын тексеріңіз.','Academic profile could not load. Check the backend deployment.','Не удалось загрузить профиль. Проверьте версию сервера.')}</p><p>{error}</p><button onClick={()=>setRetry(x=>x+1)}>{l('Қайталау','Retry','Повторить')}</button></section>;
 return <div style={{maxWidth:900,margin:'auto'}}><header className="page-head"><div><span className="eyebrow">ADAPTIVE AI</span><h1>{l('Жеке оқу профилі','Your learning profile','Ваш учебный профиль')}</h1><p>{l('Оқу бағытыңызды және нақты пәндеріңізді таңдаңыз.','Choose your learning track and actual subjects.','Выберите направление и свои предметы.')}</p></div></header>
 <form onSubmit={save} className="card" style={{display:'grid',gap:20}}>
 <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:12}}>{[['UNIVERSITY',l('Университетте оқимын','University learning','Обучение в университете')],['SELF',l('Өз бетінше оқимын','Self learning','Самостоятельное обучение')]].map(([mode,title])=><button key={mode} type="button" aria-pressed={p.mode===mode} className={p.mode===mode?'primary':'secondary'} onClick={()=>field('mode',mode)}>{title}</button>)}</section>
 {p.mode==='UNIVERSITY'?<><label style={labelStyle}>{l('Университет','University','Университет')}<input style={inputStyle} required maxLength={200} value={p.university||''} onChange={e=>field('university',e.target.value)} placeholder="MUIT / IITU"/></label><label style={labelStyle}>{l('Мамандық','Major','Специальность')}<input style={inputStyle} required maxLength={160} list="academic-majors" value={p.major||''} onChange={e=>field('major',e.target.value)}/><datalist id="academic-majors">{majors.map(m=><option key={m} value={m}/>)}</datalist></label><label style={labelStyle}>{l('Оқу курсы','Study year','Курс')}<select style={inputStyle} value={p.studyYear||1} onChange={e=>field('studyYear',Number(e.target.value))}>{[1,2,3,4,5,6].map(n=><option key={n}>{n}</option>)}</select></label></>:<label style={labelStyle}>{l('Оқу мақсаты','Learning goal','Цель обучения')}<input style={inputStyle} required maxLength={300} value={p.goal||''} onChange={e=>field('goal',e.target.value)} placeholder="ML Engineer / Java Developer"/></label>}
 <section><h2>{l('Менің пәндерім','My subjects','Мои предметы')} · {p.courseIds.length}</h2><p>{l('Тек каталогта бар пәндерді таңдауға болады.','Choose from the available course catalog.','Выберите предметы из доступного каталога.')}</p>{recommended.length>0&&<button type="button" className="secondary" onClick={()=>field('courseIds',[...new Set([...p.courseIds,...recommended.map(c=>c.id)])])}>{l('Ұсынылған пәндерді қосу','Add suggested subjects','Добавить рекомендуемые предметы')}</button>}<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10,marginTop:12}}>{catalog.map(c=><label key={c.id} style={{display:'flex',alignItems:'center',gap:10,border:'1px solid #dbe4ee',padding:14,borderRadius:10}}><input type="checkbox" checked={p.courseIds.includes(c.id)} onChange={()=>toggle(c.id)}/><span><strong>{c.title}</strong><br/><small>{c.code}{recommended.some(r=>r.id===c.id)?' · '+l('Ұсынылады','Suggested','Рекомендуется'):''}</small></span></label>)}</div></section>
 {error&&<p role="alert" style={{color:'#b42318'}}>{error}</p>}
 <button className="primary" disabled={busy||!p.courseIds.length}>{busy?l('Сақталуда...','Saving...','Сохранение...'):l('Сақтау және оқу','Save and start learning','Сохранить и начать обучение')}</button>
 <button type="button" className="secondary" onClick={()=>nav('/')}>{l('Кейінірек','Later','Позже')}</button>
 </form></div>
}
