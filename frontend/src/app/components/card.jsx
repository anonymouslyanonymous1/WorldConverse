"use client"
import {MapPin} from "lucide-react"
import { useGlobal } from "./global_provider";
export default function Card({core_id, title, description, img_url, location, color}){
    function LightnessFromHex(hex){
        hex = hex.replace(/^#/, '')

        const r = parseInt(hex.substr(0,2), 16);
        const g = parseInt(hex.substr(2,2), 16);
        const b = parseInt(hex.substr(4,2), 16);

        const brightness = (0.2126 * r + 0.7152 * g + 0.0722 * b)/ 255;
        return +(brightness * 100).toFixed(2)
    }
    const { setChatbarOpen, setActiveChat } = useGlobal();
    const lightness = LightnessFromHex(color)
    const textcolor = lightness > 50 ? "black" : "white"
    return(
    <>
    <div className="flex flex-col items-end gap-2">
        <div className={`relative rounded-xl overflow-hidden grid grid-rows-1 grid-cols-[40%_60%] sm:gap-2 aspect-video w-[300px] sm:w-[350px] shadow-(--my-shadow)`} style={{"--my-shadow": `0px 1px 108px -15px oklch(from ${color} calc(l*0.8) c h)`, backgroundColor: `oklch(from ${color} calc(l*1.4) c h)`, color: textcolor}}>
            <img className="aspect-9/16 object-cover size-full object-center mask-r-from-50% mask-r-to-100% " src={decodeURIComponent(img_url)} width={350} height={197}/> 
            {/* Needs a fallback image */}
            <div className="px-4 py-2 font-[Highway] overflow-hidden">
                {location && <span className={`${lightness > 60 ? "opacity-55" : "opacity-80"} sm:text-sm flex flex-row items-center gap-0.5 ml-[-2]`}><MapPin className="w-2 sm:w-3"/><p className=" line-clamp-1 text-ellipsis text-[10pt]">{location}</p></span>}
                <p className="text-[10pt] sm:text-[12pt] font-medium tracking-[.01em] line-clamp-3">{title}</p>
                <p className="text-[8pt] sm:text-[10pt] line-clamp-4">{description}</p>
            </div>
        </div>
        <button style={{backgroundColor: `oklch(from ${color} calc(l*1.4) c h)`, color: textcolor}} className="w-fit px-3 font-[Highway] py-1 rounded-2xl cursor-pointer" onClick={() => {setChatbarOpen(true); setActiveChat(core_id)}}>Open Core</button>
    </div>
    </>
    )
}
