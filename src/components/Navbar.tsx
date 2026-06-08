import { useNavigate } from "react-router-dom";

interface NavbarProps {
  /** Modo detalle: muestra flecha atrás en vez del logo */
  back?: boolean;
  /** Título principal */
  title?: string;
  /** Subtítulo (ej: puntos del cliente) */
  subtitle?: string;
  /** Callback logout — solo aplica en modo dashboard */
  onLogout?: () => void;
}

export default function Navbar({
  back = false,
  title = "PanadApp",
  subtitle,
  onLogout,
}: NavbarProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-surface shadow-[0px_4px_12px_rgba(107,58,42,0.1)]">
      <div className="flex justify-between items-center w-full px-5 py-2 max-w-[720px] mx-auto min-h-[56px]">
        {/* Izquierda: logo o botón atrás */}
        {back ? (
          <button
            onClick={() => navigate(-1)}
            aria-label="Volver"
            className="hover:bg-surface-container-high p-2 rounded-full active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-primary">
              arrow_back
            </span>
          </button>
        ) : (
          <h1 className="text-2xl font-extrabold text-primary tracking-tight">
            {title}
          </h1>
        )}

        {/* Centro: título + subtítulo en modo detalle */}
        {back && (
          <div className="flex flex-col items-center">
            <span className="font-bold text-base text-on-surface leading-tight">
              {title}
            </span>
            {subtitle && (
              <span className="text-sm font-semibold text-secondary">
                {subtitle}
              </span>
            )}
          </div>
        )}

        {/* Derecha: logout en modo dashboard, vacío en modo detalle */}
        {!back ? (
          <button
            onClick={onLogout}
            aria-label="Cerrar sesión"
            className="hover:bg-surface-container-high p-2 rounded-full active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-primary">
              logout
            </span>
          </button>
        ) : (
          // Spacer para centrar el título
          <div className="w-10" />
        )}
      </div>
    </header>
  );
}