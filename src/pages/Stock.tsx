import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";
import { getRewards, updateRewardStock, type Reward } from "../services/api";

export default function Stock() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Record<string, number>>({});
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const list = await getRewards();
        setRewards(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function handleChange(id: string, value: string) {
    const num = parseInt(value || "0", 10) || 0;
    setEditing((prev) => ({ ...prev, [id]: num }));
  }

  async function save(id: string) {
    setStatus(null);
    try {
      const newStock = editing[id] ?? rewards.find((r) => r.id === id)?.stock ?? 0;
      await updateRewardStock(id, newStock);
      setStatus("Stock actualizado");
      // refresh
      const list = await getRewards();
      setRewards(list);
      setEditing((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    } catch (err) {
      console.error(err);
      setStatus("Error al actualizar stock");
    }
  }

  return (
    <div className="bg-surface min-h-screen font-sans text-on-surface">
      <Navbar title="Stock de Premios" />
      <main className="max-w-[720px] mx-auto px-5 pt-6 pb-24 space-y-4">
        {status && <div className="text-sm text-primary">{status}</div>}
        <section className="grid grid-cols-1 gap-4">
          {loading ? (
            <div>Cargando...</div>
          ) : rewards.length === 0 ? (
            <div>No hay premios.</div>
          ) : (
            rewards.map((r) => (
              <div key={r.id} className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant flex items-center justify-between">
                <div>
                  <h3 className="font-bold">{r.name}</h3>
                  <p className="text-sm text-on-surface-variant">{r.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <input type="number" min={0} value={editing[r.id] ?? r.stock ?? 0} onChange={(e) => handleChange(r.id, e.target.value)} className="w-24 h-10 rounded-md border px-2" />
                  <button onClick={() => save(r.id)} className="px-3 py-2 bg-primary text-white rounded-md">Guardar</button>
                </div>
              </div>
            ))
          )}
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
