import { Link, NavLink, Outlet } from "react-router-dom";

const tab = ({ isActive }) =>
  `border-b-2 pb-1 transition-colors ${
    isActive ? "border-sun text-chalk" : "border-transparent text-dim hover:text-chalk"
  }`;

const addButton = ({ isActive }) =>
  `rounded-md px-4 py-2 font-semibold text-board transition-colors ${
    isActive ? "bg-chalk" : "bg-sun hover:bg-[#f6dd86]"
  }`;

export default function AppLayout() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-rule">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4 sm:px-8">
          <Link to="/" className="text-2xl font-bold tracking-tight [font-stretch:90%]">
            MyCampus
          </Link>
          <nav className="flex items-center gap-6 text-[15px] sm:gap-8">
            <NavLink to="/app/timeline" className={tab}>
              Timeline
            </NavLink>
            <NavLink to="/app/add" className={addButton}>
              Add event
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <Outlet />
      </main>
    </div>
  );
}