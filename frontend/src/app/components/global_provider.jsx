"use client"
import { createContext, useContext, useState } from "react";

const GlobalContext = createContext(); // A global store

export default function GlobalProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatbarOpen, setChatbarOpen] = useState(false);
  // const [filters, setFilters] = useState([]);
  const [createCore, setcreateCore] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [activeUser, setActiveUser] = useState(null);
  const [flyTarget, setflyTarget] = useState(null);
  return (
    // Provider passes in data to the children
    <GlobalContext.Provider value={{ flyTarget, setflyTarget, activeUser, setActiveUser, activeChat, setActiveChat, createCore, setcreateCore, sidebarOpen, chatbarOpen, setSidebarOpen, setChatbarOpen }}> 
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobal() { // Created a hook (with proper name) so that algorithm is readable
  return useContext(GlobalContext);
}