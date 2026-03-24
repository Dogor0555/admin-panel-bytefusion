"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowsRound } from "../components/ui/icons/ArrowsRound";
import { Usuario } from "../components/ui/icons/Usuario";
import { TicketSoporte } from "../components/ui/icons/TicketSoporte";
import { FaBars, FaMoon, FaSun, FaSignOutAlt } from "react-icons/fa";
import { useState, useEffect } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(true);
  const [dark, setDark] = useState(false);

  const toggleSidebar = () => setOpen(!open);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !dark;
    setDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleLogout = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00";
    router.push("/login");
  };

  const user = { name: "Admin Panel", email: "admin@test.com" };
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const linkClass = (path: string) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all
     ${
       pathname === path
         ? "bg-blue-600 text-white shadow-md"
         : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
     }`;

  return (
    <aside
      className={`
        h-[calc(100vh-2rem)]
        m-4
        bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-800
        shadow-xl
        rounded-2xl
        flex flex-col
        transition-all duration-300
        ${open ? "w-64" : "w-20"}
      `}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-800">
        {open && (
          <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            Panel Admin
          </h1>
        )}

        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-transform"
        >
          <ArrowsRound
            size={28}
            className={`transition-transform duration-500 ease-in-out ${
              open ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>
      </div>

      {/* NAV */}
      <nav className="flex-1 p-3 space-y-2">
        <Link href="/panel" className={linkClass("/panel")}>
          <Usuario className="w-5 h-5" />
          {open && <span>Usuarios</span>}
        </Link>

        <Link href="/panel/soporte" className={linkClass("/panel/soporte")}>
          <TicketSoporte className="w-5 h-5" />
          {open && <span>Soporte</span>}
        </Link>
      </nav>

      {/* FOOTER */}
      <div className="p-3 border-t dark:border-gray-800 space-y-3">
        {/* THEME */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          {dark ? <FaSun /> : <FaMoon />}
          {open && <span>{dark ? "Modo claro" : "Modo oscuro"}</span>}
        </button>

        {/* USER */}
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
            {initials}
          </div>
          {open && (
            <div className="text-sm">
              <p className="font-semibold text-gray-800 dark:text-gray-100">{user.name}</p>
              <p className="text-gray-500 text-xs">{user.email}</p>
            </div>
          )}
        </div>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full p-2 rounded-lg text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition"
        >
          <FaSignOutAlt />
          {open && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}