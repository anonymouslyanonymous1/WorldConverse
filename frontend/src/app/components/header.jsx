"use client"
import { Menu, MessagesSquare, Plus, Telescope } from "lucide-react"
import { useGlobal } from "./global_provider";
import Link from "next/link";
import Logo from "../../../public/Logo.svg"
import Image from "next/image";
export default function Header(){
    const {  activeChat, setActiveChat, activeUser, setActiveUser, createCore, setcreateCore, sidebarOpen, chatbarOpen, setSidebarOpen, setChatbarOpen } = useGlobal();
    return( <>
        {activeUser ? <div className="w-full grid grid-rows-1 grid-cols-[46%_34%_10%_10%] sm:grid-cols-[70%_20%_5%_5%] items-center gap-1 sm:gap-0 justify-items-center">
          <div className="flex flex-row justify-start gap-2 justify-self-start">
            <Link href="/" className="flex flex-row justify-start items-center gap-2 justify-self-start">
              <Image src={Logo} alt={"logo"} className={`aspect-square w-6 sm:w-9 transition-all duration-200`}/>
              <p className={`cursor-pointer text-lg sm:text-2xl font-[Gacor] transition-all duration-200`}>WorldConverse</p>
            </Link>
          </div>
          <button onClick={() => setcreateCore(prev => !prev)} className="flex flex-row items-center justify-center w-24 sm:w-[90%] h-8 px-1 sm:px-0 border-2 border-black bg-white rounded-xl cursor-pointer font-[Highway] hover:bg-gray-200"><span className="flex flex-row items-center justify-center gap-1 text-xs md:text-base">{createCore ? <><p className="text-[8pt]">Spectate Cores</p><Telescope className="sm:w-5 sm:h-5 w-4 h-4"/></> : <><p>Create Core</p><Plus className="w-5 h-5"/></>}</span></button>
          <MessagesSquare onClick={() => {setChatbarOpen(prev => !prev); setActiveChat(null);}} className={`cursor-pointer h-10 w-10 p-2 rounded-xl hover:bg-green-200 transition-all duration-300`}/>
          <Menu onClick={() => setSidebarOpen(prev => !prev)} className={`cursor-pointer h-10 w-10 p-2 rounded-xl hover:bg-green-200 transition-all duration-300`}/>
        </div> :
        <div className="w-full grid grid-rows-1 grid-cols-[80%_10%_10%] sm:grid-cols-[90%_5%_5%] items-center justify-center sm:justify-items-center">
          <Link href="/" className="flex flex-row justify-start items-center gap-2 justify-self-start">
            <Image src={Logo} alt={"logo"} className={`aspect-square ${chatbarOpen || sidebarOpen ? "w-6 sm:w-9":"w-9"} transition-all duration-200`}/>
            <p className={`cursor-pointer ${chatbarOpen || sidebarOpen ? "text-xl sm:text-2xl":"text-lg sm:text-2xl"} font-[Gacor] transition-all duration-200`}>WorldConverse</p>
          </Link>
          <MessagesSquare onClick={() => setChatbarOpen(prev => !prev)} className={`cursor-pointer h-10 w-10 p-2 rounded-xl hover:bg-green-200 transition-all duration-300`}/>
          <Menu onClick={() => setSidebarOpen(prev => !prev)} className={`cursor-pointer h-10 w-10 p-2 rounded-xl hover:bg-green-200 transition-all duration-300`}/>
        </div>}
    </>)
}