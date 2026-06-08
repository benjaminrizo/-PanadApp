import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { registerClient } from "../services/api";

interface FormData {
  name: string;
  phone: string;
  email: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
}

export default function RegisterClient() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>({ name: "", phone: "", email: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState<{ name: string; phone: string } | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  // ── Validación ──────────────────────────────────────────────────────────────
  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = "El nombre es obligatorio";
    if (!form.phone.trim()) {
      e.phone = "El teléfono es obligatorio";
    } else if (!/^\d{7,15}$/.test(form.phone.replace(/\s/g, ""))) {
      e.phone = "Ingresa un número válido (solo dígitos, 7-15 caracteres)";
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = "Correo electrónico inválido";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError(null);

    try {
      // ✅ Una sola llamada — sin búsqueda previa que genera race condition.
      // Si el teléfono ya existe, Supabase lanza error 23505 (unique constraint)
      // y lo capturamos abajo de forma confiable.
      const client = await registerClient({
        name: form.name.trim(),
        phone: form.phone.replace(/\s/g, ""),
        email: form.email.trim() || undefined,
      });

      setRegistered({ name: client.name, phone: client.phone });
    } catch (err: any) {
      console.error(err);
      // ✅ Código 23505 = violación de restricción UNIQUE en PostgreSQL
      if (err?.code === "23505") {
        setErrors({ phone: "Ya existe un cliente con este número" });
      } else {
        setServerError("No se pudo registrar el cliente. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleChange(field: keyof FormData) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };
  }

  // ── Vista: éxito ────────────────────────────────────────────────────────────
  if (registered) {
    return (
      <div className="bg-surface min-h-screen font-sans text-on-surface">
        <Navbar back title="Nuevo Cliente" />
        <main className="max-w-[720px] mx-auto px-5 pt-10 pb-20 flex flex-col items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-secondary-container flex items-center justify-center">
            <span
              className="material-symbols-outlined text-secondary"
              style={{ fontSize: 48, fontVariationSettings: "'FILL' 1" }}
            >
              verified
            </span>
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold text-primary">
              ¡Bienvenido/a al club!
            </h2>
            <p className="text-base text-on-surface-variant">
              <span className="font-bold text-on-surface">{registered.name}</span>{" "}
              fue registrado/a con éxito.
            </p>
            <p className="text-sm text-on-surface-variant">
              Tel: {registered.phone} · 0 puntos iniciales
            </p>
          </div>

          <div className="w-full space-y-3 mt-4">
            <button
              onClick={() => navigate(`/client/${registered.phone}`)}
              className="w-full bg-primary text-white h-14 rounded-lg font-bold text-base flex items-center justify-center gap-3 shadow-[0px_4px_12px_rgba(107,58,42,0.1)] active:scale-[0.98] transition-transform"
            >
              <span className="material-symbols-outlined">person</span>
              Ver perfil del cliente
            </button>
            <button
              onClick={() => {
                setRegistered(null);
                setForm({ name: "", phone: "", email: "" });
              }}
              className="w-full h-14 rounded-lg border-2 border-outline-variant text-on-surface font-bold text-base hover:bg-surface-container transition-colors"
            >
              Registrar otro cliente
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

  // ── Vista: formulario ───────────────────────────────────────────────────────
  return (
    <div className="bg-surface min-h-screen font-sans text-on-surface">
      <Navbar back title="Nuevo Cliente" />

      <main className="max-w-[720px] mx-auto px-5 pt-6 pb-20 space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-extrabold text-primary">
            ¡Únete al Club!
          </h2>
          <p className="text-sm text-on-surface-variant">
            Regístrate para empezar a acumular puntos y obtener recompensas
          </p>
        </div>

        {/* Form card */}
        <section className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant shadow-[0px_4px_12px_rgba(107,58,42,0.1)]">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            {/* Nombre */}
            <Field label="Nombre completo" required error={errors.name}>
              <input
                type="text"
                value={form.name}
                onChange={handleChange("name")}
                placeholder="Ej. María García"
                className={inputClass(!!errors.name)}
              />
            </Field>

            {/* Teléfono */}
            <Field
              label="Número de celular"
              hint="Este será su ID de cliente"
              required
              error={errors.phone}
            >
              <input
                type="tel"
                value={form.phone}
                onChange={handleChange("phone")}
                placeholder="Ej. 3001234567"
                className={inputClass(!!errors.phone)}
              />
            </Field>

            {/* Email (opcional) */}
            <Field
              label="Correo electrónico"
              hint="Opcional — para notificaciones de puntos"
              error={errors.email}
            >
              <input
                type="email"
                value={form.email}
                onChange={handleChange("email")}
                placeholder="Ej. maria@correo.com"
                className={inputClass(!!errors.email)}
              />
            </Field>

            {/* Error del servidor */}
            {serverError && (
              <div className="flex items-center gap-2 bg-error-container text-on-error-container px-4 py-3 rounded-lg text-sm font-semibold">
                <span className="material-symbols-outlined text-base">error</span>
                {serverError}
              </div>
            )}

            <p className="text-xs text-on-surface-variant text-center opacity-70">
              Al registrarte, aceptas nuestros términos de lealtad y privacidad.
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white h-14 rounded-lg font-bold text-base flex items-center justify-center gap-3 shadow-[0px_4px_12px_rgba(107,58,42,0.1)] active:scale-[0.98] transition-transform disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">
                    refresh
                  </span>
                  Registrando...
                </>
              ) : (
                <>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    person_add
                  </span>
                  Registrar cliente
                </>
              )}
            </button>
          </form>
        </section>

        {/* Footer */}
        <div className="flex flex-col items-center gap-1 opacity-40">
          <span className="material-symbols-outlined text-primary">bakery_dining</span>
          <p className="text-xs font-bold text-primary tracking-widest uppercase">
            Artesanal y Fresco
          </p>
        </div>
      </main>
    </div>
  );
}

// ─── Helpers UI ───────────────────────────────────────────────────────────────

function inputClass(hasError: boolean) {
  return `w-full h-14 rounded-lg border-2 px-4 bg-surface focus:outline-none transition-all text-base ${
    hasError
      ? "border-error focus:border-error"
      : "border-outline-variant focus:border-primary"
  }`;
}

function Field({
  label,
  hint,
  required,
  error,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-bold text-on-surface-variant">
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-on-surface-variant opacity-70 ml-1">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-error font-semibold ml-1">{error}</p>
      )}
    </div>
  );
}