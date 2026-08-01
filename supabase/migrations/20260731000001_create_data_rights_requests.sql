create table if not exists public.data_rights_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  email text not null,
  right_type text not null check (
    right_type in (
      'acceso',
      'rectificacion',
      'cancelacion',
      'oposicion',
      'portabilidad',
      'bloqueo'
    )
  ),
  details text,
  status text not null default 'pendiente' check (
    status in ('pendiente', 'en_proceso', 'resuelta', 'rechazada')
  ),
  resolved_at timestamptz
);
comment on table public.data_rights_requests is 'Solicitudes de ejercicio de derechos ARCO+ (Ley 21.719)';
alter table public.data_rights_requests enable row level security;
create policy "no_public_access" on public.data_rights_requests for all using (false);