"use client"
import { useState } from "react"
import { useGlobal } from "../components/global_provider"
import { UserRoundPlus, ShieldAlert, Loader } from "lucide-react";
export default function SignUp(){
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const { activeUser, setActiveUser } = useGlobal();
    const [loading, setLoading] = useState(false)
    async function handleRegister(){
        setLoading(true)
        if(!username || !password){
            setError("Nothing filled")
            return;
        }
        const request = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/register`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            credentials: "include",
            body: JSON.stringify({username, password})
        })
        if (request.status !== 200){
            const response = await request.json();
            setError(response.error);
            setLoading(false);
            return;
        }
        else{
            const response = await request.json()
            setActiveUser(response.response);
            setLoading(false);
            setError(null);
            return;
        }
    }
    return(
        <div className="font-[Highway] w-full h-full flex flex-col gap-2 items-center justify-center ">
            {!activeUser && <>
                <input value={username} onChange={(event) => setUsername(event.target.value)} type="text" placeholder="An Username" className="cursor-pointer focus:outline-slate-500 outline-2 outline-slate-800 p-1 rounded-sm w-[300px] sm:w-[400px] resize-none sm:text-sm"/>
                <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="A Password" className="cursor-pointer focus:outline-slate-500 outline-2 outline-slate-800 p-1 rounded-sm w-[300px] sm:w-[400px] resize-none sm:text-sm"/>
                {error && <span className="inline-flex items-center bg-red-800 px-2 rounded-sm w-fit gap-1"><ShieldAlert className="w-4 stroke-white"/><p className=" text-white font-[Highway]">{error}</p></span>}
                <button onClick={handleRegister}><span className="cursor-pointer bg-green-400 hover:bg-green-300 transition-all duration-200 px-2 py-1 rounded-lg flex flex-row gap-1"><p>Register</p>{loading ? <Loader className="w-4 animate-spin"/>:<UserRoundPlus className="w-4"/>}</span></button>
            </>}
            {activeUser && <p className="text-center text-2xl absolute top-40">You're logged in as {activeUser.username}</p>}
        </div>
    )
}