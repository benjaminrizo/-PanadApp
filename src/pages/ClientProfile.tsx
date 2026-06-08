import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  findClientByPhone,
  getClientTransactions,
  type Client,
  type Transaction,
} from "../services/api";

// ─── Constantes de niveles ────────────────────────────────────────────────────
const TIER_LABELS: Record<string, string> = {
  standard: "Estándar",
  premium: "Premium",
  vip: "VIP",
};

const TIER_COLORS: Record<string, string> = {
  standard: "bg-surface-container text-on-surface-variant",
  premium: "bg-secondary-container text-on-secondary-container",
  vip: "bg-primary-container text-on-primary-container",
};

// Recompensa objetivo según puntos actuales
function getNextReward(points: number): { name: string; target: number } {
  if (points < 200) return { name: "Café gratis", target: 200 };
  if (points < 400) return { name: "Pan artesanal gratis", target: 400 };
  if (points < 800) return { name: "Desayuno completo gratis", target: 800 };
  return { name: "Caja de pasteles", target: 1500 };
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function ClientProfile() {
  const { phone } = useParams<{ phone: string }>();
  const navigate = useNavigate();

  const [client, setClient] = useState<Client | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!phone) return;
    loadData(phone);
  }, [phone]);

  async function loadData(phoneNumber: string) {
    setLoading(true);
    setError(null);
    try {
      const [clientData, txData] = await Promise.all([
        findClientByPhone(phoneNumber),
        // No tenemos getClientTransactions por phone, primero buscamos cliente
        Promise.resolve([] as Transaction[]),
      ]);

      if (!clientData) {
        setError("Cliente no encontrado.");
        setLoading(false);
        return;
      }

      const txs = await getClientTransactions(clientData.id);
      setClient(clientData);
      setTransactions(txs.slice(0, 5));
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar el perfil. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  // ── Estados de carga / error ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-surface min-h-screen font-sans text-on-surface">
        <Navbar back title="Perfil del Cliente" />
        <main className="max-w-[720px] mx-auto px-5 pt-10 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-surface-container animate-pulse" />
          <div className="h-5 w-40 bg-surface-container rounded animate-pulse" />
          <div className="h-4 w-24 bg-surface-container rounded animate-pulse" />
          <div className="w-full h-32 bg-surface-container rounded-xl animate-pulse mt-4" />
          <div className="w-full h-48 bg-surface-container rounded-xl animate-pulse" />
        </main>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="bg-surface min-h-screen font-sans text-on-surface">
        <Navbar back title="Perfil del Cliente" />
        <main className="max-w-[720px] mx-auto px-5 pt-20 flex flex-col items-center gap-4 text-center">
          <span
            className="material-symbols-outlined text-error"
            style={{ fontSize: 56 }}
          >
            person_off
          </span>
          <p className="text-lg font-bold text-on-surface">
            {error ?? "Cliente no encontrado"}
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-2 bg-primary text-white px-6 py-3 rounded-lg font-bold"
          >
            Volver al Dashboard
          </button>
        </main>
      </div>
    );
  }

  const nextReward = getNextReward(client.points);
  const progress = Math.min((client.points / nextReward.target) * 100, 100);
  const pointsLeft = Math.max(nextReward.target - client.points, 0);

  // Iniciales para avatar
  const initials = client.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="bg-surface min-h-screen font-sans text-on-surface">
      <Navbar back title="Perfil del Cliente" />

      <main className="max-w-[720px] mx-auto px-5 pt-8 pb-24 space-y-4">

        {/* ── Avatar + nombre ─────────────────────────────────────────────── */}
        <section className="flex flex-col items-center gap-2 py-4">
          {/* Avatar con iniciales */}
          <div className="w-24 h-24 rounded-full bg-primary-container flex items-center justify-center shadow-[0px_4px_12px_rgba(107,58,42,0.2)]">
            <span className="text-3xl font-extrabold text-on-primary-container">
              {initials}
            </span>
          </div>

          <h2 className="text-2xl font-extrabold text-on-surface mt-1">
            {client.name}
          </h2>

          <p className="text-sm text-on-surface-variant flex items-center gap-1">
            <span className="material-symbols-outlined text-[18px]">phone</span>
            {client.phone}
          </p>

          {client.email && (
            <p className="text-sm text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">mail</span>
              {client.email}
            </p>
          )}

          {/* Badge de nivel */}
          <span
            className={`mt-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              TIER_COLORS[client.tier] ?? TIER_COLORS.standard
            }`}
          >
            {TIER_LABELS[client.tier] ?? client.tier}
          </span>
        </section>

        {/* ── Tarjeta de puntos ────────────────────────────────────────────── */}
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant shadow-[0px_4px_12px_rgba(107,58,42,0.1)] relative overflow-hidden">
          {/* Decoración fondo */}
          <span
            className="material-symbols-outlined absolute top-3 right-3 text-primary opacity-5 select-none"
            style={{ fontSize: 96, fontVariationSettings: "'FILL' 1" }}
          >
            bakery_dining
          </span>

          <div className="relative z-10">
            {/* Puntos actuales */}
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  Balance actual
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-primary">
                    {client.points.toLocaleString("es-CO")}
                  </span>
                  <span className="text-xl font-bold text-primary">puntos</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-secondary font-semibold">
                  Faltan {pointsLeft} para
                </p>
                <p className="text-sm font-bold text-on-surface">{nextReward.name}</p>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-secondary-container rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-on-surface-variant font-semibold">
              <span>0 pts</span>
              <span>{nextReward.target} pts</span>
            </div>

            {/* Miembro desde */}
            <p className="mt-3 text-xs text-on-surface-variant opacity-70 text-center">
              Miembro desde {formatDate(client.created_at)}
            </p>
          </div>
        </div>

        {/* ── Botones de acción ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate(`/register-transaction/${client.id}`)}
            className="flex items-center justify-center gap-2 bg-primary text-white h-14 rounded-lg font-bold text-sm shadow-[0px_4px_12px_rgba(107,58,42,0.15)] active:scale-[0.98] transition-transform"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              add_shopping_cart
            </span>
            Registrar compra
          </button>

          <button
            onClick={() => navigate(`/rewards?client=${client.id}`)}
            className="flex items-center justify-center gap-2 bg-secondary-container text-on-secondary-container h-14 rounded-lg font-bold text-sm active:scale-[0.98] transition-transform"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              redeem
            </span>
            Canjear premio
          </button>
        </div>

        {/* ── Historial de compras ─────────────────────────────────────────── */}
        <section>
          <h3 className="text-base font-extrabold text-on-surface mb-3 px-1">
            Últimas compras
          </h3>

          {transactions.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant text-center space-y-2">
              <span
                className="material-symbols-outlined text-on-surface-variant opacity-40"
                style={{ fontSize: 40 }}
              >
                receipt_long
              </span>
              <p className="text-sm text-on-surface-variant">
                Aún no hay compras registradas
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx, i) => (
                <div
                  key={tx.id}
                  className="bg-surface-container-lowest rounded-xl px-4 py-3 border border-outline-variant shadow-[0px_2px_8px_rgba(107,58,42,0.06)] flex justify-between items-center"
                  style={{ opacity: 1 - i * 0.08 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-primary text-[20px]">
                        receipt_long
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-on-surface">
                        {formatDate(tx.created_at)}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {formatCurrency(tx.amount)}
                        {tx.note && (
                          <span className="ml-2 opacity-60">· {tx.note}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-extrabold text-secondary">
                    +{tx.points_earned} pts
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-1 pt-2 opacity-30">
          <span className="material-symbols-outlined text-primary">bakery_dining</span>
          <p className="text-xs font-bold text-primary tracking-widest uppercase">
            Artesanal y Fresco
          </p>
        </div>
      </main>
    </div>
  );
}