import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";
import { getRewards, redeemReward, findClientByPhone, type Reward } from "../services/api";

export default function Rewards() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState("");
  const [clientName, setClientName] = useState<string | null>(null);
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

  async function handleLookup() {
    setStatus(null);
    try {
      const client = await findClientByPhone(phone.replace(/\s/g, ""));
      if (client) {
        setClientName(client.name);
      } else {
        setClientName(null);
        setStatus("Cliente no encontrado.");
      }
    } catch (err) {
      console.error(err);
      setStatus("Error buscando cliente.");
    }
  }

  async function handleRedeem(rewardId: string, cost: number) {
    setStatus(null);
    try {
      const emp = localStorage.getItem("employee");
      if (!emp) return setStatus("Empleado no autenticado.");
      const empObj = JSON.parse(emp) as { id: string };
      const client = await findClientByPhone(phone.replace(/\s/g, ""));
      if (!client) return setStatus("Cliente no encontrado.");
      await redeemReward(client.id, rewardId, cost, empObj.id);
      setStatus("Canje realizado correctamente.");
    } catch (err) {
      console.error(err);
      setStatus("No se pudo canjear el premio.");
    }
  }

  return (
    <div className="bg-surface min-h-screen font-sans text-on-surface">
      <Navbar title="Catálogo de Recompensas" />
      <main className="max-w-[720px] mx-auto px-5 pt-6 pb-24 space-y-4">
        <section className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant">
          <label className="block text-sm font-bold text-on-surface-variant">Buscar cliente por teléfono para canjear</label>
          <div className="flex gap-2 mt-2">
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ej. 3001234567" className="flex-1 h-12 rounded-lg border-2 border-outline-variant px-4" />
            <button onClick={handleLookup} className="h-12 px-4 bg-primary text-white rounded-lg">Buscar</button>
          </div>
          {clientName && <p className="mt-2 text-sm text-on-surface-variant">Cliente: <span className="font-bold">{clientName}</span></p>}
          {status && <p className="mt-2 text-sm text-error">{status}</p>}
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {loading ? (
            <div> Cargando recompensas...</div>
          ) : rewards.length === 0 ? (
            <div>No hay recompensas disponibles.</div>
          ) : (
            rewards.map((r) => (
              <div key={r.id} className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 bg-surface-container rounded-lg flex items-center justify-center">
                    {r.image_url ? <img src={r.image_url} alt={r.name} className="w-full h-full object-cover rounded-lg" /> : <span className="font-bold">{r.name[0]}</span>}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base">{r.name}</h3>
                    <p className="text-sm text-on-surface-variant">{r.description}</p>
                    <p className="mt-2 font-extrabold text-secondary">{r.points_cost} pts</p>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <button onClick={() => handleRedeem(r.id, r.points_cost)} className="px-4 py-2 bg-primary text-white rounded-lg">Canjear</button>
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