import { Fragment } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import { useAuth } from "@/lib/auth";
import { cx } from "@/lib/cx";
import { NAV_ITEMS, type NavItem } from "./nav";

function useVisibleNav(): NavItem[] {
  const { can, hasModule } = useAuth();
  return NAV_ITEMS.filter((item) => {
    if (item.permission && !can(item.permission)) return false;
    if (item.module && !hasModule(item.module)) return false;
    return true;
  });
}

function Brand({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-lg font-bold text-white shadow-sm">
        M
      </span>
      {!compact && (
        <span className="text-base font-semibold tracking-tight text-slate-900">
          MDH Farm GO
        </span>
      )}
    </div>
  );
}

function UserMenu() {
  const { user, farm, logout } = useAuth();
  const navigate = useNavigate();
  const initial = user?.name?.charAt(0).toUpperCase() ?? "?";

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <Menu as="div" className="relative">
      <MenuButton className="flex items-center gap-2 rounded-full p-1 pr-2 text-left hover:bg-slate-100">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
          {initial}
        </span>
        <span className="hidden text-sm sm:block">
          <span className="block font-medium leading-tight text-slate-800">{user?.name}</span>
          <span className="block text-xs leading-tight text-slate-500">{farm?.name}</span>
        </span>
      </MenuButton>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <MenuItems className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-slate-200 focus:outline-none">
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-slate-800">{user?.name}</p>
            <p className="truncate text-xs text-slate-500">{user?.email ?? user?.phone}</p>
          </div>
          <div className="my-1 border-t border-slate-100" />
          <MenuItem>
            {({ focus }) => (
              <button
                onClick={handleLogout}
                className={cx(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700",
                  focus && "bg-slate-100",
                )}
              >
                Sign out
              </button>
            )}
          </MenuItem>
        </MenuItems>
      </Transition>
    </Menu>
  );
}

function DesktopSidebar({ items }: { items: NavItem[] }) {
  return (
    <aside className="hidden w-60 flex-shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
      <div className="flex h-16 items-center px-5">
        <Brand />
      </div>
      <nav className="flex-1 space-y-1 px-3 py-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cx(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                isActive
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

function MobileBottomNav({ items }: { items: NavItem[] }) {
  const primary = items.filter((i) => i.primary).slice(0, 5);
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden">
      {primary.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/"}
          className={({ isActive }) =>
            cx(
              "flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium",
              isActive ? "text-brand-600" : "text-slate-500",
            )
          }
        >
          {item.icon}
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

function MobileMenu({ items }: { items: NavItem[] }) {
  // Items that don't fit in the 5-slot bottom bar live behind a "More" sheet.
  const overflow = items.filter((i) => !i.primary);
  if (overflow.length === 0) return null;
  return (
    <Menu as="div" className="relative lg:hidden">
      <MenuButton
        className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100"
        aria-label="More"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
          <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </MenuButton>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <MenuItems className="absolute right-0 mt-2 w-52 origin-top-right rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-slate-200 focus:outline-none">
          {overflow.map((item) => (
            <MenuItem key={item.to}>
              {({ focus }) => (
                <NavLink
                  to={item.to}
                  className={cx(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700",
                    focus && "bg-slate-100",
                  )}
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              )}
            </MenuItem>
          ))}
        </MenuItems>
      </Transition>
    </Menu>
  );
}

export function AppShell() {
  const items = useVisibleNav();
  return (
    <div className="flex min-h-screen bg-sand-50">
      <DesktopSidebar items={items} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-2 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-2 lg:hidden">
            <Brand compact />
          </div>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-1">
            <MobileMenu items={items} />
            <UserMenu />
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-6 sm:px-6 lg:pb-10">
          <Outlet />
        </main>
      </div>
      <MobileBottomNav items={items} />
    </div>
  );
}
