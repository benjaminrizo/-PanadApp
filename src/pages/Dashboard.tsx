import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getRecentTransactions, getDashboardStats, findClientByPhone } from "../services/api";
import type { Transaction, DashboardStats } from "../services/api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(isoDate: string): string {
  const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
  if (diff < 60) return "Hace un momento";
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  return `Hace ${Math.floor(diff / 86400)} días`;
}

function getInitials(name: string): string {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchNotFound, setSearchNotFound] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    clients_today: 0,
    transactions_today: 0,
    revenue_today: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [txData, statsData] = await Promise.all([
          getRecentTransactions(10),
          getDashboardStats(),
        ]);
        setTransactions(txData);
        setStats(statsData);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los datos. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── Búsqueda por teléfono ────────────────────────────────────────────────
  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const phone = search.replace(/\s/g, "");
    if (!phone) return;

    setSearching(true);
    setSearchNotFound(false);
    try {
      const client = await findClientByPhone(phone);
      if (client) {
        navigate(`/client/${client.phone}`);
      } else {
        setSearchNotFound(true);
      }
    } catch (err) {
      console.error(err);
      setSearchNotFound(true);
    } finally {
      setSearching(false);
    }
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    if (searchNotFound) setSearchNotFound(false);
  }

  function handleClientClick(t: Transaction) {
    if (t.clients?.phone) navigate(`/client/${t.clients.phone}`);
  }

  function handleLogout() {
    navigate("/login");
  }

  return (
    <div className="bg-surface min-h-screen font-sans text-on-surface">
      <Navbar onLogout={handleLogout} />

      <main className="max-w-[720px] mx-auto px-5 pt-6 pb-28 space-y-6">

        {/* Stats banner */}
        <section className="bg-secondary-container text-on-secondary-container px-6 py-3 rounded-xl flex items-center justify-between shadow-[0px_4px_12px_rgba(107,58,42,0.1)]">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              group
            </span>
            <span className="text-base font-bold">
              {loading ? "Cargando..." : `Clientes atendidos hoy: ${stats.clients_today}`}
            </span>
          </div>
          <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
        </section>

        {/* Search */}
        <section className="space-y-2">
          <label htmlFor="search-client" className="block text-sm font-bold text-on-surface-variant px-1">
            Buscar cliente por teléfono
          </label>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                id="search-client"
                type="tel"
                value={search}
                onChange={handleSearchChange}
                placeholder="Ej. 3001234567"
                className={`w-full h-14 rounded-lg border-2 bg-surface-container-lowest px-5 pl-14 focus:outline-none transition-all text-base ${
                  searchNotFound
                    ? "border-error focus:border-error"
                    : "border-outline-variant focus:border-primary"
                }`}
              />
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
                search
              </span>
            </div>
            <button
              type="submit"
              disabled={searching || !search.trim()}
              className="h-14 px-5 bg-primary text-white rounded-lg font-bold text-sm flex items-center gap-2 shadow-[0px_4px_12px_rgba(107,58,42,0.1)] active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              {searching ? (
                <span className="material-symbols-outlined animate-spin text-[20px]">refresh</span>
              ) : (
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              )}
            </button>
          </form>

          {/* Feedback no encontrado */}
          {searchNotFound && (
            <div className="flex items-center justify-between bg-error-container text-on-error-container px-4 py-3 rounded-lg text-sm font-semibold">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-base">person_off</span>
                No existe un cliente con ese número.
              </div>
              <button
                onClick={() => navigate("/register-client")}
                className="underline font-bold text-xs ml-2 whitespace-nowrap"
              >
                Registrar
              </button>
            </div>
          )}
        </section>

        {/* Register button */}
        <button
          onClick={() => navigate("/register-client")}
          className="w-full bg-primary text-white h-14 rounded-lg font-bold text-base flex items-center justify-center gap-3 shadow-[0px_4px_12px_rgba(107,58,42,0.1)] active:scale-[0.98] transition-transform"
        >
          <span className="material-symbols-outlined">person_add</span>
          Registrar nuevo cliente
        </button>

        {/* Transactions */}
        <section className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant shadow-[0px_4px_12px_rgba(107,58,42,0.1)]">
          <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant flex justify-between items-center">
            <h2 className="text-xl font-bold text-primary">Últimas transacciones</h2>
            <span className="material-symbols-outlined text-on-surface-variant">history</span>
          </div>

          {loading ? (
            <div className="divide-y divide-outline-variant">
              {[1, 2, 3].map((i) => (
                <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-surface-container shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-surface-container rounded w-1/3" />
                    <div className="h-3 bg-surface-container rounded w-1/4" />
                  </div>
                  <div className="h-5 bg-surface-container rounded w-16" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="px-6 py-8 text-center text-sm text-on-surface-variant">
              <span className="material-symbols-outlined block mx-auto mb-2 text-outline">error_outline</span>
              {error}
            </div>
          ) : transactions.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-on-surface-variant">
              Sin transacciones aún.
            </div>
          ) : (
            <div className="divide-y divide-outline-variant">
              {transactions.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleClientClick(t)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-surface-container transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-extrabold text-sm select-none shrink-0">
                      {getInitials(t.clients?.name ?? "?")}
                    </div>
                    <div>
                      <p className="font-bold text-base text-on-surface">{t.clients?.name ?? "Cliente"}</p>
                      <p className="text-sm font-semibold text-on-surface-variant">{timeAgo(t.created_at)}</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-secondary shrink-0">+{t.points_earned} pts</p>
                </button>
              ))}
            </div>
          )}

          <button className="w-full py-4 text-primary font-bold text-sm hover:bg-surface-container-high transition-colors">
            Ver todo el historial
          </button>
        </section>

        {/* Quick access */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-container-low p-6 rounded-xl flex flex-col gap-2 hover:scale-[1.02] transition-transform cursor-pointer shadow-[0px_4px_12px_rgba(107,58,42,0.1)]">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              point_of_sale
            </span>
            <span className="font-bold text-base text-primary">Cierre de Caja</span>
          </div>
          <div className="bg-surface-container-low p-6 rounded-xl flex flex-col gap-2 hover:scale-[1.02] transition-transform cursor-pointer shadow-[0px_4px_12px_rgba(107,58,42,0.1)]">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              inventory_2
            </span>
            <span className="font-bold text-base text-primary">Stock de Premios</span>
          </div>
        </div>
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[720px] bg-surface z-50 flex justify-around items-center px-4 pb-4 pt-2 shadow-[0px_-4px_12px_rgba(107,58,42,0.05)] border-t border-outline-variant">
        <NavItem icon="home" label="Inicio" active />
        <NavItem icon="qr_code_scanner" label="Escanear" />
        <NavItem icon="groups" label="Clientes" />
        <NavItem icon="settings" label="Panel" />
      </nav>
    </div>
  );
}

function NavItem({
  icon, label, active = false, onClick,
}: {
  icon: string; label: string; active?: boolean; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center px-4 py-1 rounded-full active:scale-90 transition-all duration-200 ${
        active
          ? "bg-secondary-container text-on-secondary-container"
          : "text-on-surface-variant hover:text-primary"
      }`}
    >
      <span className="material-symbols-outlined" style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}>
        {icon}
      </span>
      <span className="text-xs font-semibold">{label}</span>
    </button>
  );
}