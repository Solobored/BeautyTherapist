alter table public.profiles
  add column if not exists terms_accepted_at timestamptz,
  add column if not exists terms_version text,
  add column if not exists privacy_accepted_at timestamptz,
  add column if not exists privacy_version text;

comment on column public.profiles.terms_accepted_at is 'Fecha/hora en que el titular aceptó Términos y Condiciones';
comment on column public.profiles.terms_version is 'Versión de la política aceptada (updatedAt de lib/policies.ts)';
comment on column public.profiles.privacy_accepted_at is 'Fecha/hora en que el titular aceptó la Política de Privacidad';
comment on column public.profiles.privacy_version is 'Versión de la Política de Privacidad aceptada';
