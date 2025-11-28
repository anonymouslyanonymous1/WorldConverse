"use client"
import { Menu, ShieldAlert, Locate } from 'lucide-react';
import { useGlobal } from "./global_provider";
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Sidebar(){
    const { createCore, flyTarget, setflyTarget, setcreateCore, activeUser, setActiveUser, sidebarOpen, chatbarOpen, setSidebarOpen, setChatbarOpen } = useGlobal();
    const [search, setSearch] = useState('');
    const [error, setError] = useState(null);
    const [cores, setCores] = useState([]);
    useEffect(() => {
        const fetchCores = async () => {
            const request_cores = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cores?choice=all`)
            if (request_cores.status !== 200){
                const response = await request_cores.json();
                console.error(response.error)
                return;
            }
            else{
                const response = await request_cores.json()
                setCores(response);
            }
        };   

        fetchCores();

        const intervalId = setInterval(fetchCores, 1000);

        return () => clearInterval(intervalId);     
    }, [createCore])
    async function handleLogout(){
        setSidebarOpen(prev => !prev)
        const request = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/logout`, {  method: "POST", headers: {"Content-Type": "application/json"}, credentials: "include"})
        if (request.status !== 200){
            const response = await request.json()
            setError(response.error)
            return;
        }
        else{
            setActiveUser(null);
            setcreateCore(false);
        }
    }
    return(
        <div className={`border-2 border-black font-[Highway] fixed top-0 right-0 p-5 h-full min-w-full sm:min-w-[300px] sm:max-w-[300px] bg-white z-2 transform ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out`}>
            <div className="grid grid-cols-1 grid-rows-[auto_auto_1fr] w-full sm:max-w-[300px] gap-2">
                <Menu onClick={() => setSidebarOpen(prev => !prev)} className={`justify-self-end cursor-pointer h-10 w-10 p-2 rounded-xl hover:bg-green-200 transition-all duration-300`}/>
                <div className='w-full inline-flex justify-evenly items-center h-fit gap-2 mb-4'>
                    {!activeUser && <>
                        <Link href="/register" className="w-full" onClick={() => setSidebarOpen(prev => !prev)}><button className='w-full cursor-pointer outline-2 px-2 py-1 rounded-sm outline-green-400 hover:bg-green-200 transition-colors duration-200'>Register</button></Link>
                        <Link href="/login" className="w-full" onClick={() => setSidebarOpen(prev => !prev)}><button className='w-full cursor-pointer outline-2 px-2 py-1 rounded-sm outline-green-400 hover:bg-green-200 transition-colors duration-200'>Log In</button></Link>
                    </>}
                    {activeUser && <>
                        <div className='flex flex-col w-full items-center gap-1'>
                            <p className='text-wrap'>{activeUser.username}</p>
                            {error && <span className="mb-1 inline-flex items-center bg-red-800 px-2 rounded-sm w-fit gap-1"><ShieldAlert className="w-4 stroke-white"/><p className=" text-white font-[Highway]">{error}</p></span>}
                            <button onClick={handleLogout} className='w-full cursor-pointer outline-2 px-2 py-1 rounded-sm outline-red-400 hover:bg-red-200 transition-colors duration-200'>Log Out</button>
                        </div>
                    </>}
                </div>
                <div className='w-full flex flex-col gap-2 items-center justify-center '>
                    <input value={search} onChange={(event) => setSearch(event.target.value)} type="text" placeholder='Search through cores' className="cursor-pointer focus:outline-slate-500 outline-2 outline-slate-800 p-1 rounded-sm w-full resize-none sm:text-sm"/>
                    <div className='scrollwheel overflow-y-auto h-[400px] w-full text-center flex flex-col gap-1'>
                        {cores.filter(core => search === '' ? true : core.title.toLowerCase().includes(search.toLowerCase())).map((core, index) => {
                            return <span key={index} className='w-full inline-grid grid-cols-[10%_auto] items-center cursor-pointer text-wrap text-left' onClick={() => {setSidebarOpen(prev => !prev); setflyTarget(core.coord)} }><Locate className={`${flyTarget === core.coord ? "stroke-green-400 stroke-3":"stroke-zinc-400"} w-4 h-4`}/><p>{core.title}</p></span> 
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}