"use client";
import { useEffect, useState, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import MaplibreGeocoder from '@maplibre/maplibre-gl-geocoder'
import '@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css'
import Card from './card'
import * as turf from '@turf/turf';
import { useGlobal } from "./global_provider";
import {Paintbrush} from 'lucide-react'
import { createPortal } from 'react-dom';

function isValidURL(str) {
  try {
    const url = new URL(str);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

async function UploadCore(setCoreID, activeUser, location, coord, color, title, img, description){
    // Uploading to DB
    const BASE_RADIUS = 200; // In metres
    if(activeUser){
        const request = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cores`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            credentials: "include",
            body: JSON.stringify({
                title,
                img_url: img,
                description,
                archived: "False",
                radius: BASE_RADIUS,
                coord,
                location,
                color
            })
        })
        if (request.status !== 200){
            const response = await request.json();
            console.error(response.error);
            return;
        }    
        else{
            const response = await request.json();
            setCoreID(response.response)
        }
    }
}

function DrawCore(createCore, setPopups, RefMap, location, coord, color, title, img, description, core_id, radius){
    const map = RefMap.current
    const unique_id = `core-${coord.lng}${coord.lat}`;
    if(map.getLayer(unique_id)){
        return;
    }
    const hex_color = color
    const options = {
        steps: 64,
        units: 'meters'
    };
    const circle = turf.circle([coord.lng, coord.lat], radius, options);
    map.addSource(unique_id, {
        type: 'geojson',
        data: circle
    });
    map.addLayer({
        id: unique_id,
        type: 'fill',
        source: unique_id,
        paint: {
            'fill-color': hex_color,
            'fill-opacity': 0.5
        }
    });
    map.addLayer({
        id: `${unique_id}-outline`,
        type: 'line',
        source: unique_id,
        paint: {
            'line-color': hex_color,
            'line-width': 3
        }
    });
    map.on("mouseenter", unique_id, e => {
        map.getCanvas().style.cursor = 'pointer'; 
    })
    map.on("mouseleave", unique_id, e => {
        map.getCanvas().style.cursor = createCore.current ? "crosshair" : "grab"; 
    })
    map.on("click", unique_id, e => {
        const popupNode = document.createElement('div');
        // const root = createRoot(popupNode);
        // root.render(<Card title={title} location={location} color={color} description={description} img_url={encodeURIComponent(img)} />);
        const popup = new maplibregl.Popup({ offset: 25, closeButton: false, closeOnClick: true })
            .setLngLat([coord.lng,coord.lat]) // longitude, latitude
            .setDOMContent(popupNode)
            .addTo(map);
        setPopups(prev => [...prev, {
            node: popupNode,
            popup: popup,
            props: { title, location, color, description, img_url: encodeURIComponent(img), core_id }
        }]);
        popup.on('close', () => {
            setPopups(prev => prev.filter(p => p.popup !== popup));
        });
    })
}

export default function Map() {
    const { flyTarget, activeUser, createCore, setcreateCore, sidebarOpen, chatbarOpen, setSidebarOpen, setChatbarOpen } = useGlobal();
    const [popups, setPopups] = useState([]);
    const mapRef = useRef(null); // To refer to it in other components
    const containerRef = useRef(null);
    const createCoreRef = useRef(createCore);
    const [input, setInput] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [img, setImg] = useState('');
    const [color, setColor] = useState("#000000");
    const [click, setClick] = useState(null);
    const [coreID, setCoreID] = useState('');
    useEffect(() => {
        createCoreRef.current = createCore;
        const map = mapRef.current;  
        if (!map) return;
        if(!createCore){
            setInput(false);
            setTitle('');
            setDescription('');
            setImg('');
            setColor("#000000");
            map.getCanvas().style.cursor = 'grab'; 
        }
        else{
            map.getCanvas().style.cursor = 'crosshair'; 
        }
    }, [createCore]);
    function handleSubmit(){
        if(!title || !description || !isValidURL(img) || !color){
            alert('Incomplete Form. Core not created. ⛔');
        }
        else{
            setcreateCore(false);
            setInput(false);
            const map = mapRef.current;            
            const features = map.queryRenderedFeatures(click.point);
            UploadCore(setCoreID, activeUser, features?.[0]?.properties?.name_en ?? null, click.lngLat, color, title, img, description);
            setTitle('');
            setDescription('');
            setImg('');
            setColor("#000000");
        }
    }
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;
        if (!flyTarget) return;
        map.flyTo({
            center: [flyTarget.lng,flyTarget.lat],
            zoom:14,
            essential: true
        });
    }, [flyTarget])
    useEffect(() => {
        if (mapRef.current) return;
        mapRef.current = new maplibregl.Map({
            container: containerRef.current,
            style: '/styles/skin.json',
            center: [40,30],
            zoom: 1,
            attributionControl: false,
            renderWorldCopies: false
        });
        const map = mapRef.current;
        map.getCanvas().style.cursor = 'grab'; 
        const geocoderApi = {
            forwardGeocode: async (config) => {
                const features = [];
                try {
                    const request =
                `https://nominatim.openstreetmap.org/search?q=${config.query}&format=geojson&polygon_geojson=1&addressdetails=1`;
                    const response = await fetch(request);
                    const geojson = await response.json();
                    for (const feature of geojson.features) {
                        const center = [
                            feature.bbox[0] +
                        (feature.bbox[2] - feature.bbox[0]) / 2,
                            feature.bbox[1] +
                        (feature.bbox[3] - feature.bbox[1]) / 2
                        ];
                        const point = {
                            type: 'Feature',
                            geometry: {
                                type: 'Point',
                                coordinates: center
                            },
                            place_name: feature.properties.display_name,
                            properties: feature.properties,
                            text: feature.properties.display_name,
                            place_type: ['place'],
                            center
                        };
                        features.push(point);
                    }
                } catch (e) {
                    console.error(`Failed to forwardGeocode with error: ${e}`);
                }

                return {
                    features
                };
            }
        };
        map.addControl(
            new MaplibreGeocoder(geocoderApi, {
                maplibregl
            })
        );
        map.addControl(
            new maplibregl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true
                },
                trackUserLocation: true
            })
        );
        map.on('click', (e) => {
            if(createCoreRef.current && !input && activeUser){
                setInput(true)
                setClick(e)
            }
        });
    }, []);
    useEffect(() => {
        const fetchCores = async () => {
            let cores = ''
            const request_cores = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/cores?choice=all`)
            if (request_cores.status !== 200){
                const response = await request_cores.json();
                console.error(response.error)
                return;
            }
            else{
                const response = await request_cores.json()
                cores = response;
            }
            const map = mapRef.current;  
            if (!map) return;
            // map.on("load", () => {
            //     for(let core of cores){
            //         DrawCore(createCoreRef, setPopups, mapRef, core.location, core.coord, core.color, core.title, core.img_url, core.description, core.id, core.radius)
            //     }
            // })
            for(let core of cores){
                DrawCore(createCoreRef, setPopups, mapRef, core.location, core.coord, core.color, core.title, core.img_url, core.description, core.id, core.radius)
            }
        };

        fetchCores();
        
        const intervalId = setInterval(fetchCores, 1000);

        return () => clearInterval(intervalId);
    }, [coreID])
    useEffect(() => {
        const map = mapRef.current;  
        if (!map) return;
        if (!click) return;
        const coordinates = click.lngLat
        map.flyTo({
            center: [coordinates.lng,coordinates.lat],
            zoom:14,
            essential: true
        });
    }, [coreID])
    return (
        <div className='relative flex items-center justify-center'>  
            {input &&
            <div className='absolute bottom-65 sm:bottom-35 font-[Highway] bg-white w-[300px] sm:w-[400px] aspect-square z-2 rounded-2xl p-4 flex flex-col justify-center items-center gap-2'>
                <p className='text-2xl'>Details for Core</p>
                <input className='p-2 outline-black outline-2 focus:outline-slate-600 cursor-pointer rounded-xl w-full' onChange={(event) => setTitle(event.target.value)} value={title} placeholder="Core's Title" type='text'/>
                <input className='p-2 outline-black outline-2 focus:outline-slate-600 cursor-pointer rounded-xl w-full' onChange={(event) => setImg(event.target.value)} value={img} placeholder="A hosted image's URL" type='url'/>
                <textarea className='min-h-[150px] resize-none p-2 outline-black outline-2 focus:outline-slate-600 cursor-pointer rounded-xl w-full' onChange={(event) => setDescription(event.target.value)} value={description} placeholder="Core's Description" type='text'/>
                <div className='flex flex-row justify-between w-full items-center gap-2'>
                    <input id="coreColor" className='absolute top-20 left-10 inset-0 opacity-0 w-0 h-0 m-0 p-0 ' onChange={(event) => setColor(event.target.value)} value={color} type='color'/>
                    <label htmlFor='coreColor' className='relative max-w-10 flex items-center justify-center p-2 outline-black outline-2 focus:outline-slate-600 cursor-pointer rounded-xl w-full'><Paintbrush color={color}/></label>
                    <button onClick={handleSubmit} className='cursor-pointer px-3 py-2 bg-black text-white hover:bg-gray-800 rounded-xl aspect-video w-20'>Submit</button>
                </div>
            </div>}
            <div ref={containerRef} className={`${input ? "blur-xl":""} z-1 w-screen h-screen transition-all duration-300`}></div>
            {popups.map(popup => 
                createPortal(
                    <Card {...popup.props} />,
                    popup.node,
                    popup.id
                )
            )}
            {/* <Card title={"Lorem ipsum, dolor sit amet consectetur adipisicing elit. Cupiditate facere, suscipit praesentium vel quas, quod eaque enim rerum, nulla quos odio ea pariatur temporibus non quidem reiciendis doloribus! Consequuntur, aut!"} location={"Bangladesh"} color={"#370101"} description={"Lorem ipsum, dolor sit amet consectetur adipisicing elit. Necessitatibus autem commodi atque dolores similique placeat sequi voluptate aliquid numquam maiores soluta harum tenetur cum, cupiditate labore eligendi, iste sint ad!"} img_url={encodeURIComponent("https://cdn.britannica.com/68/274768-050-25BE2F57/Zohran-Mamdani-Democratic-nominee-New-York-City-mayor-campaigning-April-2025.jpg")} /> */}
        </div>
    );
}