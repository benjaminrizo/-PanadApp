import { supabase } from "./supabase";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  points: number;
  tier: "standard" | "premium" | "vip";
  created_at: string;
}

export interface Transaction {
  id: string;
  client_id: string;
  employee_id?: string;
  amount: number;
  points_earned: number;
  note?: string;
  created_at: string;
  // join con clients
  clients?: { name: string; phone: string };
}

export interface DashboardStats {
  clients_today: number;
  transactions_today: number;
  revenue_today: number;
}

export interface Reward {
  id: string;
  name: string;
  description?: string;
  points_cost: number;
  stock: number;
  active: boolean;
  image_url?: string;
}

export interface NewClient {
  name: string;
  phone: string;
  email?: string;
}

export interface NewTransaction {
  client_id: string;
  employee_id?: string;
  amount: number;
  points_earned: number;
  note?: string;
}

// ─── CLIENTES ─────────────────────────────────────────────────────────────────

/**
 * Buscar cliente por número de teléfono.
 * Usa .maybeSingle() para retornar null sin lanzar error cuando no existe.
 */
export async function findClientByPhone(phone: string): Promise<Client | null> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("phone", phone)
    .maybeSingle(); // ✅ retorna null si no existe, sin lanzar PGRST116

  if (error) throw error;
  return data;
}

/** Obtener cliente por ID */
export async function getClientById(id: string): Promise<Client | null> {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .maybeSingle(); // ✅ misma corrección por consistencia

  if (error) throw error;
  return data;
}

/** Registrar nuevo cliente */
export async function registerClient(client: NewClient): Promise<Client> {
  const { data, error } = await supabase
    .from("clients")
    .insert(client)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── TRANSACCIONES ────────────────────────────────────────────────────────────

/**
 * Últimas N transacciones con nombre del cliente
 * Usadas en el Dashboard
 */
export async function getRecentTransactions(limit = 10): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*, clients(name, phone)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

/** Historial de compras de un cliente específico */
export async function getClientTransactions(clientId: string): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/** Registrar una compra y sumar puntos (el trigger lo hace automático) */
export async function registerTransaction(tx: NewTransaction): Promise<Transaction> {
  const { data, error } = await supabase
    .from("transactions")
    .insert(tx)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── ESTADÍSTICAS DASHBOARD ───────────────────────────────────────────────────

/** Clientes atendidos hoy, transacciones y ventas del día */
export async function getDashboardStats(): Promise<DashboardStats> {
  const { data, error } = await supabase
    .from("dashboard_stats")
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

// ─── PREMIOS ──────────────────────────────────────────────────────────────────

/** Catálogo de premios activos */
export async function getRewards(): Promise<Reward[]> {
  const { data, error } = await supabase
    .from("rewards")
    .select("*")
    .eq("active", true)
    .order("points_cost", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/** Canjear un premio */
export async function redeemReward(
  clientId: string,
  rewardId: string,
  pointsUsed: number,
  employeeId?: string
): Promise<void> {
  const { error } = await supabase.from("redemptions").insert({
    client_id: clientId,
    reward_id: rewardId,
    points_used: pointsUsed,
    employee_id: employeeId,
  });

  if (error) throw error;
}

// ─── EMPLEADOS ────────────────────────────────────────────────────────────────

/** Validar PIN de empleado */
export async function validateEmployeePin(
  pin: string
): Promise<{ id: string; name: string; role: string } | null> {
  const { data, error } = await supabase
    .from("employees")
    .select("id, name, role")
    .eq("pin", pin)
    .eq("active", true)
    .maybeSingle(); // ✅ misma corrección por consistencia

  if (error) throw error;
  return data;
}