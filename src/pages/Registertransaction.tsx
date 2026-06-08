import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getClientById, registerTransaction, type Client } from "../services/api";

// Regla: $1.000 COP = 1 punto
const POINTS_RATE = 1000;

function calculatePoints(amount: number): number {
  return Math.floor(amount / POINTS_RATE);
}

function formatCurrency(value: string): string {
  const num = parseInt(value.replace(/\D/g, ""), 10);
  if (isNaN(num)) return "";
  return num.toLocaleString("es-CO");
}

function getInitials(name: string): string {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

export default function RegisterTransaction() {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();

  const [client, setClient] = useState<Client | null>(null);
  const [loadingClient, setLoadingClient] = useState(true);

  const [rawAmount, setRawAmount] = useState(""); // valor numérico sin formato
  const [displayAmount, setDisplayAmount] = useState(""); // valor con formato visual
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!clientId) return;
    loadClient(clientId);
  }, [clientId]);

  async function loadClient(id: string) {
    setLoadingClient(true);
    try {
      const data = await getClientById(id);
      if (!data) navigate("/dashboard");
      else setClient(data);
    } catch (err) {
      console.error(err);
      navigate("/dashboard");
    } finally {
      setLoadingClient(false);
    }
  }

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "");
    setRawAmount(digits);
    setDisplayAmount(formatCurrency(digits));
    setServerError(null);
  }

  const numericAmount = parseInt(rawAmount, 10) || 0;
  const pointsToEarn = calculatePoints(numericAmount);

  async function handleSubmit() {
    if (!client || numericAmount <= 0) return;
    setSubmitting(true);
    setServerError(null);
    try {
      await registerTransaction({
        client_id: client.id,
        amount: numericAmount,
        points_earned: pointsToEarn,
        note: note.trim() || undefined,
      });
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setServerError("No se pudo registrar la compra. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Estado: cargando cliente ──────────────────────────────────────────────
  if (loadingClient) {
    return (
      <div className="bg-surface min-h-screen font-sans">
        <Navbar back title="Registrar Compra" />
        <main className="max-w-[720px] mx-auto px-5 pt-10 space-y-4">
          <div className="h-24 bg-surface-container rounded-xl animate-pulse" />
          <div className="h-48 bg-surface-container rounded-xl animate-pulse" />
        </main>
      </div>
    );
  }

  if (!client) return null;

  // ── Estado: éxito ─────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="bg-surface min-h-screen font-sans text-on-surface">
        <Navbar back title="Registrar Compra" />
        <main className="max-w-[720px] mx-auto px-5 pt-16 pb-20 flex flex-col items-center gap-6 text-center">
          <div className="w-24 h-24 rounded-full bg-secondary-container flex items-center justify-center shadow-[0px_4px_12px_rgba(107,58,42,0.2)]">
            <span
              className="material-symbols-outlined text-secondary"
              style={{ fontSize: 48, fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-primary">¡Compra registrada!</h2>
            <p className="text-base text-on-surface-variant">
              Se acreditaron{" "}
              <span className="font-extrabold text-secondary text-xl">+{pointsToEarn} puntos</span>
            </p>
            <p className="text-sm text-on-surface-variant">
              a <span className="font-bold text-on-surface">{client.name}</span>
            </p>
          </div>

          <div className="w-full space-y-3 mt-4">
            <button
              onClick={() => navigate(`/client/${client.phone}`)}
              className="w-full bg-primary text-white h-14 rounded-lg font-bold text-base flex items-center justify-center gap-3 shadow-[0px_4px_12px_rgba(107,58,42,0.1)] active:scale-[0.98] transition-transform"
            >
              <span className="material-symbols-outlined">person</span>
              Ver perfil del cliente
            </button>
            <button
              onClick={() => {
                setSuccess(false);
                setRawAmount("");
                setDisplayAmount("");
                setNote("");
              }}
              className="w-full h-14 rounded-lg border-2 border-outline-variant text-on-surface font-bold text-base hover:bg-surface-container transition-colors"
            >
              Registrar otra compra
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full py-3 text-primary font-bold text-sm hover:underline"
            >
              Volver al Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ── Vista principal ───────────────────────────────────────────────────────
  return (
    <div className="bg-surface min-h-screen font-sans text-on-surface">
      <Navbar back title="Registrar Compra" />

      <main className="max-w-[720px] mx-auto px-5 pt-6 pb-24 space-y-4">

        {/* Tarjeta del cliente */}
        <section className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shadow-[0px_4px_12px_rgba(107,58,42,0.08)] flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-lg font-extrabold text-on-primary-container">
              {getInitials(client.name)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Cliente seleccionado
            </p>
            <h2 className="text-lg font-extrabold text-primary truncate">{client.name}</h2>
            <p className="text-sm text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">stars</span>
              {client.points.toLocaleString("es-CO")} puntos actuales
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="text-xs text-primary font-bold underline shrink-0"
          >
            Cambiar
          </button>
        </section>

        {/* Formulario de compra */}
        <section className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant shadow-[0px_4px_12px_rgba(107,58,42,0.08)] space-y-5">

          {/* Monto */}
          <div className="space-y-1">
            <label className="block text-sm font-bold text-on-surface-variant">
              Monto de la compra (COP) <span className="text-error ml-1">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-extrabold text-outline select-none">
                $
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={displayAmount}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full h-16 rounded-lg border-2 border-outline-variant bg-surface focus:border-primary focus:outline-none transition-all text-2xl font-extrabold text-primary pl-10 pr-4"
              />
            </div>
            <p className="text-xs text-on-surface-variant opacity-70 ml-1">
              Regla: por cada $1.000 = 1 punto
            </p>
          </div>

          {/* Display de puntos calculados */}
          <div className="bg-secondary-fixed rounded-xl p-4 flex items-center justify-between border-2 border-dashed border-secondary-fixed-dim relative overflow-hidden">
            {/* Textura de puntos */}
            <div
              className="absolute inset-0 opacity-5 pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(#7c5800 1px, transparent 1px)",
                backgroundSize: "12px 12px",
              }}
            />
            <div className="relative z-10">
              <p className="text-xs font-bold text-on-secondary-fixed uppercase tracking-wider mb-1">
                Puntos a acreditar
              </p>
              <div className="flex items-baseline gap-2">
                <span
                  className="text-4xl font-extrabold text-secondary transition-all duration-300"
                  style={{ transform: pointsToEarn > 0 ? "scale(1.05)" : "scale(1)" }}
                >
                  {pointsToEarn.toLocaleString("es-CO")}
                </span>
                <span className="text-base font-bold text-secondary">pts</span>
              </div>
            </div>
            <div className="relative z-10 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-[0px_0px_20px_rgba(254,202,102,0.4)]">
              <span
                className="material-symbols-outlined text-secondary"
                style={{ fontSize: 28, fontVariationSettings: "'FILL' 1" }}
              >
                redeem
              </span>
            </div>
          </div>

          {/* Nota opcional */}
          <div className="space-y-1">
            <label className="block text-sm font-bold text-on-surface-variant">
              Nota <span className="text-xs font-normal opacity-60">(opcional)</span>
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ej. Torta de cumpleaños, pedido especial..."
              maxLength={80}
              className="w-full h-12 rounded-lg border-2 border-outline-variant bg-surface focus:border-primary focus:outline-none transition-all text-sm px-4"
            />
          </div>

          {/* Info */}
          <div className="flex gap-3 p-3 bg-surface-container rounded-lg items-start">
            <span className="material-symbols-outlined text-primary text-[18px] mt-0.5 shrink-0">info</span>
            <p className="text-xs text-on-surface-variant">
              Al confirmar, los{" "}
              <span className="font-bold text-secondary">{pointsToEarn} puntos</span>{" "}
              se acreditarán inmediatamente al perfil de{" "}
              <span className="font-bold text-on-surface">{client.name}</span>.
            </p>
          </div>

          {/* Error servidor */}
          {serverError && (
            <div className="flex items-center gap-2 bg-error-container text-on-error-container px-4 py-3 rounded-lg text-sm font-semibold">
              <span className="material-symbols-outlined text-base">error</span>
              {serverError}
            </div>
          )}
        </section>

        {/* Botones */}
        <div className="space-y-3">
          <button
            onClick={handleSubmit}
            disabled={submitting || numericAmount <= 0}
            className="w-full bg-primary text-white h-14 rounded-lg font-bold text-base flex items-center justify-center gap-3 shadow-[0px_4px_12px_rgba(107,58,42,0.15)] active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {submitting ? (
              <>
                <span className="material-symbols-outlined animate-spin">refresh</span>
                Registrando...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
                Confirmar compra
              </>
            )}
          </button>

          <button
            onClick={() => navigate(-1)}
            className="w-full h-12 rounded-lg text-error font-bold text-sm hover:bg-error-container transition-colors"
          >
            Cancelar
          </button>
        </div>

        {/* Footer */}
        <div className="flex flex-col items-center gap-1 pt-2 opacity-30">
          <span className="material-symbols-outlined text-primary">bakery_dining</span>
          <p className="text-xs font-bold text-primary tracking-widest uppercase">Artesanal y Fresco</p>
        </div>
      </main>
    </div>
  );
}