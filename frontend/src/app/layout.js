import "./globals.css";
import Header from "./components/header"
import GlobalProvider from "./components/global_provider"
import Sidebar from "./components/sidebar";
import Chatbar from "./components/chat";

export const metadata = {
  title: "WorldConverse",
  description: "Connect with people discussing the same thing across the map",
  icons: {
    icon: "/Globe.svg",
    shortcut: "/Globe.svg",
    apple: "/Globe.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="mx-4 sm:mx-6 my-4 flex flex-col items-center bg-amber-400 h-screen overflow-hidden">
        <GlobalProvider>
          <Header/>
          <Sidebar/>
          <Chatbar/>
          {children}
        </GlobalProvider>
      </body>
    </html>
  );
}
