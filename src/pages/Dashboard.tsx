import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Transaction {
  id: number | string;
  clientName: string;
  clientPhone: string;
  points: number;
  createdAt: string; // ISO string
}

interface DashboardStats {
  clientsToday: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(isoDate: string): string {
  const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
  if (diff < 60) return "Hace un momento";
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  return `Hace ${Math.floor(diff / 86400)} días`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ clientsToday: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch de datos ──────────────────────────────────────────────────────────
  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        // TODO: reemplazar con llamadas reales a Supabase / API
        // const [txRes, statsRes] = await Promise.all([
        //   api.getRecentTransactions(),
        //   api.getDashboardStats(),
        // ]);
        // setTransactions(txRes);
        // setStats(statsRes);

        // Datos de ejemplo — eliminar cuando conectes el backend
        await new Promise((r) => setTimeout(r, 600));
        setTransactions([
          {
            id: 1,
            clientName: "María García",
            clientPhone: "3001234567",
            points: 12,
            createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          },
          {
            id: 2,
            clientName: "Roberto Sánchez",
            clientPhone: "3109876543",
            points: 5,
            createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          },
          {
            id: 3,
            clientName: "Elena Torres",
            clientPhone: "3207654321",
            points: 20,
            createdAt: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
          },
        ]);
        setStats({ clientsToday: 24 });
      } catch (err) {
        setError("No se pudieron cargar los datos. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  // ── Búsqueda local ──────────────────────────────────────────────────────────
  const filtered = transactions.filter(
    (t) =>
      t.clientName.toLowerCase().includes(search.toLowerCase()) ||
      t.clientPhone.includes(search)
  );

  function handleLogout() {
    // TODO: limpiar sesión / token
    navigate("/login");
  }

  function handleClientClick(phone: string) {
    navigate(`/client/${phone}`);
  }

  return (
    <div className="bg-surface min-h-screen font-sans text-on-surface">
      <Navbar onLogout={handleLogout} />

      <main className="max-w-[720px] mx-auto px-5 pt-6 pb-28 space-y-6">
        {/* Stats banner */}
        <section className="bg-secondary-container text-on-secondary-container px-6 py-3 rounded-xl flex items-center justify-between shadow-[0px_4px_12px_rgba(107,58,42,0.1)]">
          <div className="flex items-center gap-3">
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              group
            </span>
            <span className="text-base font-bold">
              {loading
                ? "Cargando..."
                : `Clientes atendidos hoy: ${stats.clientsToday}`}
            </span>
          </div>
          <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
        </section>

        {/* Search */}
        <section className="space-y-2">
          <label
            htmlFor="search-client"
            className="block text-sm font-bold text-on-surface-variant px-1"
          >
            Buscar cliente
          </label>
          <div className="relative">
            <input
              id="search-client"
              type="tel"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Número de teléfono..."
              className="w-full h-14 rounded-lg border-2 border-outline-variant bg-surface-container-lowest px-5 pl-14 focus:border-primary focus:outline-none transition-all text-base"
            />
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
              search
            </span>
          </div>
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
            <h2 className="text-xl font-bold text-primary">
              Últimas transacciones
            </h2>
            <span className="material-symbols-outlined text-on-surface-variant">
              history
            </span>
          </div>

          {loading ? (
            <div className="divide-y divide-outline-variant">
              {[1, 2, 3].map((i) => (
                <div key={i} className="px-6 py-4 flex items-center gap-4 animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-surface-container" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-surface-container rounded w-1/3" />
                    <div className="h-3 bg-surface-container rounded w-1/4" />
                  </div>
                  <div className="h-5 bg-surface-container rounded w-16" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="px-6 py-8 text-center text-on-surface-variant text-sm">
              <span className="material-symbols-outlined block mx-auto mb-2 text-outline">
                error_outline
              </span>
              {error}
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-8 text-center text-on-surface-variant text-sm">
              No se encontraron transacciones.
            </div>
          ) : (
            <div className="divide-y divide-outline-variant">
              {filtered.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleClientClick(t.clientPhone)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-surface-container transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-extrabold text-sm select-none shrink-0">
                      {getInitials(t.clientName)}
                    </div>
                    <div>
                      <p className="font-bold text-base text-on-surface">
                        {t.clientName}
                      </p>
                      <p className="text-sm font-semibold text-on-surface-variant">
                        {timeAgo(t.createdAt)}
                      </p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-secondary shrink-0">
                    +{t.points} pts
                  </p>
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
            <span
              className="material-symbols-outlined text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              point_of_sale
            </span>
            <span className="font-bold text-base text-primary">Cierre de Caja</span>
          </div>
          <div className="bg-surface-container-low p-6 rounded-xl flex flex-col gap-2 hover:scale-[1.02] transition-transform cursor-pointer shadow-[0px_4px_12px_rgba(107,58,42,0.1)]">
            <span
              className="material-symbols-outlined text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
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
        <NavItem icon="groups" label="Clientes" onClick={() => navigate("/clients")} />
        <NavItem icon="settings" label="Panel" />
      </nav>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
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
      <span
        className="material-symbols-outlined"
        style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
      >
        {icon}
      </span>
      <span className="text-xs font-semibold">{label}</span>
    </button>
  );
}