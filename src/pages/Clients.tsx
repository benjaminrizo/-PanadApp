import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";
import { getClients, type Client } from "../services/api";

export default function ClientView() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getClients(200);
        if (!mounted) return;
        setClients(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = clients.filter((c) =>
    `${c.name} ${c.phone}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="bg-surface min-h-screen font-sans text-on-surface">
      <Navbar title="Clientes" />
      <main className="max-w-[720px] mx-auto px-5 pt-6 pb-24 space-y-4">
        <div>
          <label className="block text-sm font-bold text-on-surface-variant px-1">
            Buscar clientes
          </label>
          <input
            className="w-full h-12 rounded-lg border-2 border-outline-variant bg-surface-container-lowest px-4"
            placeholder="Nombre o teléfono"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <section className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant">
          {loading ? (
            <div className="p-6">Cargando clientes...</div>
          ) : filtered.length === 0 ? (
            <div className="p-6">No se encontraron clientes.</div>
          ) : (
            <div className="divide-y divide-outline-variant">
              {filtered.map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate(`/client/${c.phone}`)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-surface-container transition-colors text-left"
                >
                  <div>
                    <p className="font-bold text-base text-on-surface">{c.name}</p>
                    <p className="text-sm text-on-surface-variant">{c.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{c.points} pts</p>
                    <p className="text-xs text-on-surface-variant">{c.tier}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
