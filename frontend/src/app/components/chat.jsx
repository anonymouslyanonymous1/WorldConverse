"use client"
import { useState, useRef, useEffect, act } from "react";
import { useGlobal } from "./global_provider";
import { MapPin, Send, MessagesSquare, Loader, Frown } from 'lucide-react'
export default function Chatbar(){
    const { activeUser, activeChat, setActiveChat, sidebarOpen, chatbarOpen, setSidebarOpen, setChatbarOpen } = useGlobal();
    const [toSend, setToSend] = useState('')
    const [mention, setMention] = useState([])
    const [coreDetails, setcoreDetails] = useState(null)
    const [loading, setLoading] = useState(false)
    const [allMessages, setAllMessages] = useState(null)
    const chatRef = useRef(null);
    const fetchMessages = async () => {
        if(!activeChat) return;
        const messages = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages?coreID=${activeChat}`);
        if (messages.status !== 200){
            const response = await messages.json();
            console.error(response.error)
            return;
        }
        else{
            const response = await messages.json()
            setAllMessages(response)
        }
    }
    useEffect(() => {
        if(!activeChat) return;
        (async () => {
            const core_details = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cores?choice=${activeChat}`);
            if (core_details.status !== 200){
                const response = await core_details.json();
                console.error(response.error)
                return;
            }
            else{
                const response = await core_details.json()
                setcoreDetails(response)
            }  
        })();
        
        fetchMessages();

        const intervalId = setInterval(fetchMessages, 1000);

        return () => clearInterval(intervalId);
    }, [activeChat])
    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [allMessages]);
    async function handleSend(){
        if(!toSend){
            alert("No message to send")
            return;
        }
        setLoading(true)
        try{ 
            const pingArray = mention.split(",").map(p => p.trim()); 
            var pingJSON = Object.assign({}, pingArray);
        } catch(err){ 
            var pingJSON = {}; 
        }
        const request = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/messages`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            credentials: "include",
            body: JSON.stringify({message: toSend, mentions: pingJSON, core_id: activeChat})
        })
        if (request.status !== 200){
            const response = await request.json();
            console.error(response.error);
            setLoading(false);
            setToSend('');
            setMention('');
            return;
        }
        else{
            fetchMessages();
            setLoading(false);
            setToSend('');
            setMention('');
            return;
        }
    }
    function Filter({name, color}){
        return (<p className="rounded-xl border-2 px-2 text-sm" style={{borderColor: color, color: color}}>{name}</p>)
    }
    function LightnessFromHex(hex){
        if(!hex){
            return null;
        }
        hex = hex.replace(/^#/, '')

        const r = parseInt(hex.substr(0,2), 16);
        const g = parseInt(hex.substr(2,2), 16);
        const b = parseInt(hex.substr(4,2), 16);

        const brightness = (0.2126 * r + 0.7152 * g + 0.0722 * b)/ 255;
        return +(brightness * 100).toFixed(2)
    }
    function Message({sender, self, message, ping}){
        const lightness = LightnessFromHex(coreDetails?.color)
        const textcolor = lightness > 50 ? "black" : "white"
        ping = ping.map(p => p.trim());
        return(
            <div style={{"--mentionedColor": `oklch(from ${coreDetails?.color} calc(l*1.8) c h`, "--usualColor": coreDetails?.color, "--usualText": textcolor}} className={`${sender === self ? "bg-(--usualColor) text-(--usualText) justify-self-end": ping.includes(self) ? "bg-(--mentionedColor) text-black": "bg-gray-400"} mb-4 w-fit max-w-[80%] text-wrap px-2 py-1 rounded-sm`}>
                <p>{message}</p>
                {sender !== self && ping.includes(self) ? <p className="text-right text-wrap opacity-60 text-xs">{sender} mentioned you</p> : <p className="text-black text-right text-wrap opacity-60 text-sm">{sender}</p>}
            </div>
        )
    }
    return(
        <div className={`flex flex-col scrollwheel border-2 border-black overflow-y-auto font-[Highway] fixed top-0 right-0 p-5 h-screen min-w-full sm:min-w-[300px] sm:max-w-[300px] bg-white z-4 ${chatbarOpen ? 'translate-x-0' : 'translate-x-full'} transition-all duration-300 ease-in-out`}>
            <div className="gap-2 grid grid-cols-1 grid-rows-[1fr_1fr_1fr_1fr_1fr] w-full sm:max-w-[300px] h-full">
                <MessagesSquare onClick={() => setChatbarOpen(prev => !prev)} className={`justify-self-end cursor-pointer h-10 w-10 p-2 rounded-xl hover:bg-green-200 transition-all duration-300 z-5`}/>
                {activeChat ? 
                (<>
                <div id="chat-info" className="p-2">
                    <p className="mb-2 text-xl sm:text-lg text-wrap">Conversing "{coreDetails?.title}"</p>
                    <p className="mb-2 text-lg sm:text-base border-l-2 ml-4 pl-2">{coreDetails?.description}</p>
                    <div className="flex-wrap flex flex-row items-center justify-end gap-2">
                        <Filter name={`Radius: ${coreDetails?.radius}m`} color={coreDetails?.color}/>
                        {coreDetails?.location && <span className="opacity-55 text-[12pt] sm:text-sm flex flex-row items-center gap-0.5"><MapPin className="w-4"/><p>{coreDetails?.location}</p></span>}
                    </div>
                </div>
                <div ref={chatRef} id="chat-window" className="border-2 border-black h-80 rounded-sm p-2 overflow-y-auto scrollwheel ">
                    <div>
                        {allMessages?.length > 0 ? allMessages.map((message, index) => (
                            <Message key={index} ping={Object.keys(message.mentions).length > 0 ? [...Object.values(message.mentions)]:[]} sender={message.sender.username} self={activeUser?.username} message={message.message}/>
                        )): <span className="justify-self-center flex items-center gap-2"><Frown style={{stroke: coreDetails?.color}}/><p className="font-[Highway] text-center text-black">No Messages</p></span>}
                    </div>
                </div>
                {allMessages && activeUser ? 
                <div id="chat-input-window" className="flex flex-col items-end gap-2">
                    <input value={mention} onChange={(event) => setMention(event.target.value)} type="text" placeholder="Mention [eg: user1, user2, user3]" className="cursor-pointer focus:outline-slate-500 outline-2 outline-slate-800 p-1 rounded-sm w-full resize-none sm:text-sm"/>
                    <textarea value={toSend} onChange={(event) => setToSend(event.target.value)} type="text" placeholder="Your Message" className="cursor-pointer focus:outline-slate-500 outline-2 outline-slate-800 p-1 rounded-sm w-full resize-none min-h-[150px] sm:text-sm"/>
                    <button onClick={handleSend}><span className="cursor-pointer bg-(--buttonColor) hover:bg-(--buttonColor)/75 auto transition-all duration-200 px-2 py-1 rounded-lg flex flex-row gap-1" style={{"--buttonColor": coreDetails?.color, color: LightnessFromHex(coreDetails?.color) > 50 ? "black" : "white"}}><p>Send</p>{loading ? <Loader className="w-4 animate-spin"/>:<Send className="w-4"/>}</span></button>
                </div> : <></>}
                <div className="h-2.5">
                </div>
                </>) : (<p className="absolute top-15 left-4">No active conversation. Join a core to converse.</p>)}
            </div>
        </div>
    )
}