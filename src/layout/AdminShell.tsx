import { Fragment } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import { Permission } from "@mdh/shared";
import { useAuth } from "@/lib/auth";
import { cx } from "@/lib/cx";

interface AdminNavItem {
  to: string;
  label: string;
  permission: string;
  end?: boolean;
}

const ADMIN_NAV: AdminNavItem[] = [
  { to: "/admin", label: "Overview", permission: Permission.PLATFORM_ANALYTICS_VIEW, end: true },
  { to: "/admin/farms", label: "Farms", permission: Permission.FARM_VIEW_ALL },
  { to: "/admin/subscriptions", label: "Subscriptions", permission: Permission.SUBSCRIPTION_VIEW_ALL },
  { to: "/admin/plans", label: "Plans", permission: Permission.PLAN_MANAGE },
  { to: "/admin/tokens", label: "Codes", permission: Permission.TOKEN_GENERATE },
  { to: "/admin/referrals", label: "Referrals", permission: Permission.REFERRAL_MANAGE },
];

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-lg font-bold text-white shadow-sm">
        M
      </span>
      <div className="leading-tight">
        <span className="block text-sm font-semibold text-slate-900">MDH Farm GO</span>
        <span className="block text-xs text-slate-500">Platform admin</span>
      </div>
    </div>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }
  return (
    <Menu as="div" className="relative">
      <MenuButton className="flex items-center gap-2 rounded-full p-1 pr-2 hover:bg-slate-100">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
          {user?.name?.charAt(0).toUpperCase() ?? "A"}
        </span>
        <span className="hidden text-sm font-medium text-slate-700 sm:block">{user?.name}</span>
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
        <MenuItems className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-slate-200 focus:outline-none">
          <MenuItem>
            {({ focus }) => (
              <button
                onClick={handleLogout}
                className={cx(
                  "flex w-full rounded-lg px-3 py-2 text-sm text-slate-700",
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

export function AdminShell() {
  const { can } = useAuth();
  const items = ADMIN_NAV.filter((i) => can(i.permission));
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Brand />
          <UserMenu />
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-2 sm:px-4">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cx(
                  "flex-shrink-0 border-b-2 px-3 py-3 text-sm font-medium transition",
                  isActive
                    ? "border-brand-500 text-brand-700"
                    : "border-transparent text-slate-500 hover:text-slate-800",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
