
// Goal is not to use client, so that page is rendered on server and sent, faster (?)
import Map from "./components/map"
export default function Home() {
  return (
    <div className="mt-2 w-full h-[85%] border-2 border-black rounded-2xl overflow-hidden">
      <Map/>
    </div>
  );
}
