import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { validateEmployeePin } from "../services/api";

export default function Login() {
  const [pin, setPin] = useState("");
  const [shaking, setShaking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const MAX_PIN = 4;

  function addPin(num: number) {
    if (pin.length < MAX_PIN) {
      setPin((prev) => prev + num);
      if (errorMessage) setErrorMessage(null);
    }
  }

  function clearPin() {
    setPin((prev) => prev.slice(0, -1));
    if (errorMessage) setErrorMessage(null);
  }

  function validateLogin() {
    if (pin.length === MAX_PIN) {
      // validate against backend
      (async () => {
        try {
          const emp = await validateEmployeePin(pin);
          if (emp) {
            localStorage.setItem("employee", JSON.stringify(emp));
            navigate("/dashboard");
          } else {
            setErrorMessage("PIN inválido");
            setShaking(true);
            setTimeout(() => setShaking(false), 400);
          }
        } catch (err) {
          console.error(err);
          setErrorMessage("Error de conexión. Intenta de nuevo.");
          setShaking(true);
          setTimeout(() => setShaking(false), 400);
        }
      })();
    } else {
      setErrorMessage("Ingresa el PIN de 4 dígitos");
      setShaking(true);
      setTimeout(() => setShaking(false), 400);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-5 font-sans text-on-surface relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="fixed top-10 -left-20 w-64 h-64 bg-secondary-container opacity-10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-10 -right-20 w-80 h-80 bg-primary-fixed opacity-10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[400px] flex flex-col items-center gap-16">
        {/* Branding */}
        <header className="text-center flex flex-col items-center gap-3">
          <div className="mb-2">
            <img src="/icono.png" alt="PanadApp" className="w-28 h-28 object-contain" />
          </div>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">
            PanadApp
          </h1>
          <p className="text-sm font-bold text-secondary uppercase tracking-widest">
            Panadería Yumbolac
          </p>
        </header>

        {/* Card login */}
        <div className="w-full bg-surface-container-lowest rounded-xl p-6 shadow-md flex flex-col items-center gap-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-on-surface">
              Acceso de Cajero
            </h2>
            <p className="text-base text-on-surface-variant mt-1">
              Ingresa tu PIN de empleado
            </p>
          </div>

          {/* Puntos PIN */}
          <div
            className={`flex gap-3 py-6 transition-all ${
              shaking ? "animate-[shake_0.2s_ease-in-out_2]" : ""
            }`}
          >
            {Array.from({ length: MAX_PIN }).map((_, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                  i < pin.length
                    ? "bg-primary border-primary scale-110"
                    : "border-outline"
                }`}
              />
            ))}
          </div>

          {/* Teclado numérico */}
          <div className="grid grid-cols-3 gap-3 w-full">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <button
                key={n}
                onClick={() => addPin(n)}
                className="h-16 rounded-lg bg-surface-container text-2xl font-bold text-primary active:scale-95 hover:bg-surface-container-high transition-all"
              >
                {n}
              </button>
            ))}
            {/* Borrar */}
            <button
              onClick={clearPin}
              className="h-16 rounded-lg bg-surface-container-low text-on-surface-variant flex items-center justify-center active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined">backspace</span>
            </button>
            {/* 0 */}
            <button
              onClick={() => addPin(0)}
              className="h-16 rounded-lg bg-surface-container text-2xl font-bold text-primary active:scale-95 hover:bg-surface-container-high transition-all"
            >
              0
            </button>
            <div className="h-16" />
          </div>

          {/* Botón ingresar */}
          <button
            onClick={validateLogin}
            className={`w-full py-4 bg-primary text-white font-bold text-base rounded-lg shadow-lg hover:bg-primary-container active:scale-[0.98] transition-all ${
              pin.length === MAX_PIN ? "animate-bounce" : ""
            }`}
          >
            Ingresar
          </button>
          {errorMessage && (
            <div className="text-sm text-error mt-2 font-semibold">{errorMessage}</div>
          )}

          {import.meta.env.DEV && (
            <button
              onClick={() => {
                localStorage.setItem("employee", JSON.stringify({ id: "dev", name: "Dev", role: "admin" }));
                navigate("/dashboard");
              }}
              className="mt-3 text-xs underline text-on-surface-variant"
            >
              Atajo dev: ingresar como Dev
            </button>
          )}
        </div>

        {/* Footer */}
        <footer className="opacity-30 flex items-center gap-2 text-on-surface-variant">
          <span className="material-symbols-outlined">restaurant</span>
          <span className="text-sm font-semibold">Artesanal y Fresco</span>
          <span className="material-symbols-outlined">restaurant</span>
        </footer>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
      `}</style>
    </main>
  );
}