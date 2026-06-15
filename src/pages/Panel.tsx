import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";
import { useNavigate } from "react-router-dom";

export default function Panel() {
  const navigate = useNavigate();

  return (
    <div className="bg-surface min-h-screen font-sans text-on-surface">
      <Navbar title="Panel" />
      <main className="max-w-[720px] mx-auto px-5 pt-6 pb-24 space-y-4">
        <section className="bg-secondary-container text-on-secondary-container rounded-xl p-5 shadow-[0px_4px_12px_rgba(107,58,42,0.1)]">
          <h2 className="text-xl font-extrabold">Panel administrativo</h2>
          <p className="text-sm mt-1">Accesos rápidos para tareas internas.</p>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button onClick={() => navigate("/stock")} className="bg-surface-container-low p-5 rounded-xl text-left shadow-[0px_4px_12px_rgba(107,58,42,0.1)]">
            <span className="material-symbols-outlined text-primary">inventory_2</span>
            <div className="font-bold mt-2">Stock de Premios</div>
            <div className="text-sm text-on-surface-variant">Ajustar cantidades y ver inventario.</div>
          </button>
          <button onClick={() => navigate("/rewards")} className="bg-surface-container-low p-5 rounded-xl text-left shadow-[0px_4px_12px_rgba(107,58,42,0.1)]">
            <span className="material-symbols-outlined text-primary">redeem</span>
            <div className="font-bold mt-2">Catálogo de Recompensas</div>
            <div className="text-sm text-on-surface-variant">Ver premios activos y canjear.</div>
          </button>
          <button onClick={() => navigate("/client-view")} className="bg-surface-container-low p-5 rounded-xl text-left shadow-[0px_4px_12px_rgba(107,58,42,0.1)]">
            <span className="material-symbols-outlined text-primary">groups</span>
            <div className="font-bold mt-2">Clientes</div>
            <div className="text-sm text-on-surface-variant">Buscar y revisar perfiles.</div>
          </button>
          <button onClick={() => navigate("/scan")} className="bg-surface-container-low p-5 rounded-xl text-left shadow-[0px_4px_12px_rgba(107,58,42,0.1)]">
            <span className="material-symbols-outlined text-primary">qr_code_scanner</span>
            <div className="font-bold mt-2">Escanear</div>
            <div className="text-sm text-on-surface-variant">Buscar cliente rápido.</div>
          </button>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
