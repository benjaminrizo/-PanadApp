import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";
import { findClientByPhone } from "../services/api";

export default function Scan() {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function handleLookup() {
    const value = code.replace(/\s/g, "");
    if (!value) return;
    setBusy(true);
    setMessage(null);
    try {
      const client = await findClientByPhone(value);
      if (client) {
        navigate(`/client/${client.phone}`);
        return;
      }
      setMessage("No se encontró cliente con ese código/teléfono.");
    } catch (err) {
      console.error(err);
      setMessage("Error buscando cliente.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-surface min-h-screen font-sans text-on-surface">
      <Navbar title="Escanear" />
      <main className="max-w-[720px] mx-auto px-5 pt-6 pb-24 space-y-4">
        <section className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant space-y-4">
          <div className="text-center space-y-2">
            <span className="material-symbols-outlined text-primary text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              qr_code_scanner
            </span>
            <h2 className="text-xl font-extrabold text-primary">Buscar cliente rápido</h2>
            <p className="text-sm text-on-surface-variant">Por ahora puedes buscar por teléfono o código manualmente.</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-on-surface-variant">Código / teléfono</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ej. 3001234567"
              className="w-full h-14 rounded-lg border-2 border-outline-variant bg-surface px-4 focus:border-primary focus:outline-none"
            />
          </div>

          {message && <div className="text-sm text-error font-semibold">{message}</div>}

          <button
            onClick={handleLookup}
            disabled={busy || !code.trim()}
            className="w-full h-14 bg-primary text-white rounded-lg font-bold disabled:opacity-50"
          >
            {busy ? "Buscando..." : "Buscar cliente"}
          </button>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button onClick={() => navigate("/register-client")} className="bg-secondary-container text-on-secondary-container rounded-xl p-5 text-left">
            <div className="font-bold text-lg">Registrar cliente</div>
            <div className="text-sm">Si el cliente no existe, créalo desde aquí.</div>
          </button>
          <button onClick={() => navigate("/register-transaction")} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 text-left">
            <div className="font-bold text-lg text-primary">Registrar compra</div>
            <div className="text-sm text-on-surface-variant">Selecciona un cliente y acredita puntos.</div>
          </button>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
