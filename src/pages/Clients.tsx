import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";
import { getClients, deleteClient, type Client } from "../services/api";

export default function ClientView() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
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
    return () => { mounted = false; };
  }, []);

  const filtered = clients.filter((c) =>
    `${c.name} ${c.phone}`.toLowerCase().includes(query.toLowerCase())
  );

  async function handleDelete(id: string) {
    setDeleting(true);
    try {
      await deleteClient(id);
      setClients((prev) => prev.filter((c) => c.id !== id));
      setConfirmId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  }

  const clientToDelete = clients.find((c) => c.id === confirmId);

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
                <div
                  key={c.id}
                  className="w-full px-4 py-4 flex items-center justify-between hover:bg-surface-container transition-colors"
                >
                  <button
                    onClick={() => navigate(`/client/${c.phone}`)}
                    className="flex-1 text-left"
                  >
                    <p className="font-bold text-base text-on-surface">{c.name}</p>
                    <p className="text-sm text-on-surface-variant">{c.phone}</p>
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-primary">{c.points} pts</p>
                      <p className="text-xs text-on-surface-variant capitalize">{c.tier}</p>
                    </div>
                    <button
                      onClick={() => setConfirmId(c.id)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <BottomNav />

      {/* Modal confirmación eliminar */}
      {confirmId && clientToDelete && (
        <div
          style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
          className="fixed inset-0 flex items-center justify-center z-50 px-5"
        >
          <div
            style={{ backgroundColor: "#fff" }}
            className="rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl"
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <div
                style={{ backgroundColor: "#fee2e2" }}
                className="w-16 h-16 rounded-full flex items-center justify-center"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 32, color: "#dc2626" }}
                >
                  person_remove
                </span>
              </div>
              <h3 style={{ color: "#1c1b1f" }} className="text-lg font-extrabold">
                ¿Eliminar cliente?
              </h3>
              <p style={{ color: "#49454f" }} className="text-sm">
                Se eliminará permanentemente a{" "}
                <span style={{ color: "#1c1b1f" }} className="font-bold">
                  {clientToDelete.name}
                </span>
                . Esta acción no se puede deshacer.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmId(null)}
                disabled={deleting}
                style={{ border: "2px solid #cac4d0", color: "#1c1b1f" }}
                className="flex-1 h-12 rounded-lg font-bold text-sm bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmId)}
                disabled={deleting}
                style={{ backgroundColor: "#dc2626", color: "#fff" }}
                className="flex-1 h-12 rounded-lg font-bold text-sm shadow-md active:scale-[0.98] transition-transform disabled:opacity-50"
              >
                {deleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}