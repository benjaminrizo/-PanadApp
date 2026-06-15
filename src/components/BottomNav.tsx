import { Link, useLocation } from "react-router-dom";

export default function BottomNav() {
  const loc = useLocation();
  const items = [
    { to: "/dashboard", label: "Inicio", icon: "home" },
    { to: "/client-view", label: "Clientes", icon: "people" },
    { to: "/register-transaction", label: "Venta", icon: "add" },
    { to: "/rewards", label: "Recompensas", icon: "redeem" },
    { to: "/panel", label: "Panel", icon: "settings" },
  ];

  return (
    <nav className="fixed bottom-4 left-0 right-0 z-40 flex justify-center">
      <div className="bg-surface-container-lowest rounded-full px-4 py-2 shadow-lg flex gap-2">
        {items.map((it) => (
          <Link key={it.to} to={it.to} className={`flex flex-col items-center px-3 py-1 rounded-md ${loc.pathname === it.to ? "bg-surface-container" : ""}`}>
            <span className="material-symbols-outlined">{it.icon}</span>
            <span className="text-xs">{it.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
