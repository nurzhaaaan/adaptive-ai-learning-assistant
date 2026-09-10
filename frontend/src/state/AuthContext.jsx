import React,{createContext,useContext,useMemo,useState} from 'react';
import { api } from '../api';
const C=createContext(null);
export function AuthProvider({children}){
 const [user,setUser]=useState(()=>{try{return JSON.parse(localStorage.getItem('user'))}catch{return null}});
 async function login(email,password){const d=await api('/auth/login',{method:'POST',body:JSON.stringify({email,password})});localStorage.setItem('token',d.token);localStorage.setItem('user',JSON.stringify(d));setUser(d);}
 async function register(name,email,password){const d=await api('/auth/register',{method:'POST',body:JSON.stringify({name,email,password})});localStorage.setItem('token',d.token);localStorage.setItem('user',JSON.stringify(d));setUser(d);}
 function logout(){localStorage.removeItem('token');localStorage.removeItem('user');setUser(null)}
 const value=useMemo(()=>({user,login,register,logout}),[user]); return <C.Provider value={value}>{children}</C.Provider>
}
export const useAuth=()=>useContext(C);
