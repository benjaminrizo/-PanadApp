
```
## Configuración local

1. Copia `.env.example` a `.env` y completa las variables:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

2. Instala dependencias y ejecuta en modo desarrollo:

```bash
npm install
npm run dev
```

3. Flujo principal implementado:
- Login: validación de PIN con `validateEmployeePin` (Supabase `employees` table).
- Dashboard: últimas transacciones y búsqueda por teléfono.
- Clientes: listado y búsqueda de clientes.
- Registro de cliente y registro de transacción ya implementados.
- Recompensas: catálogo y flujo de canje (buscar cliente por teléfono y canjear).

Si necesitas que adapte el UI exactamente al mockup de Stitch (colores, espaciado y textos), indícamelo y aplicaré ajustes finos.

