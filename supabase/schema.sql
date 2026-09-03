-- Vivabox — schéma checkout (remplace Google Apps Script)
-- À exécuter une fois dans le SQL editor du projet Supabase.

create extension if not exists pgcrypto;

create table ventas (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'reserved'
    check (status in ('reserved', 'paid', 'completed', 'expired')),

  box_slug text not null,
  quantity int not null,

  buyer_name text not null,
  buyer_email text not null,
  buyer_phone text not null default '',

  delivery_type text not null check (delivery_type in ('physical', 'digital')),
  delivery_speed text,

  subtotal integer not null,
  delivery_price integer not null,
  total integer not null,

  paid_at timestamptz,

  recipient_name text,
  recipient_contact text,
  message_para text,
  message_de text,
  message_mensaje text,
  delivery_direccion text,
  delivery_ciudad text,
  delivery_detalles text,
  scheduled boolean not null default false,
  scheduled_date date,
  scheduled_time text,

  completed_at timestamptz,

  -- Rempli depuis /operativo-nuhxy2z8tfv31m (page interne) au fil de la
  -- préparation physique. Deux étapes distinctes : prepared_at = code écrit
  -- dans la box, box fermée ; shipped_at = remise au transportista (peut se
  -- faire plus tard, le ramassage n'est pas toujours immédiat). Distinct de
  -- `status`/`completed_at` : "completed" veut juste dire "on a l'adresse et
  -- le destinataire", pas "le colis est prêt ou parti".
  prepared_at timestamptz,
  shipped_at timestamptz,

  -- Code promo demandé à `start` (texte brut, avant validation complète —
  -- l'email acheteur n'est connu qu'à cette étape). `pay` revalide et
  -- consomme ce même code via redeem_promo_code(), qui remplit promo_code_id
  -- ci-dessous une fois réellement appliqué.
  promo_code_input text,

  -- Traçabilité du code promo utilisé (bienvenue OU campagne — même table,
  -- donc "un seul code par achat" est garanti par cette unique colonne).
  -- Contrainte FK ajoutée après la table promo_codes plus bas.
  promo_code_id uuid,
  discount integer not null default 0
);

alter table ventas enable row level security;
-- Aucune policy créée volontairement : seule la service_role key (utilisée
-- uniquement côté serveur dans les routes API Next.js) peut lire/écrire.
-- Le navigateur du client n'a jamais d'accès direct à cette table.

-- Contacts capturés via le welcome shipping modal (bénéfice première commande)
create table contacts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  email text not null unique,
  source text not null default 'checkout',
  campaign text not null default 'first_purchase_shipping',
  consent boolean not null default false
);

alter table contacts enable row level security;
-- Même politique que ventas : accès exclusif via service_role côté serveur.

-- Codes promo (pour l'instant : uniquement le bénéfice envío gratis).
-- Une seule table pour deux usages : codes auto-générés du welcome flow
-- (max_uses=1, contact_email renseigné) ET codes créés à la main pour des
-- campagnes/influenceurs/partenaires (max_uses=null ou plafonné, pas liés
-- à un email — voir scripts/promo-codes.mjs).
create table promo_codes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  code text not null unique,
  type text not null check (type in ('free_shipping')),
  source text not null default 'first_purchase_welcome',
  contact_email text,
  label text,

  max_uses int,              -- null = illimité
  uses_count int not null default 0,
  active boolean not null default true,

  expires_at timestamptz     -- null = jamais
);

alter table promo_codes enable row level security;
-- Même politique que ventas : accès exclusif via service_role côté serveur.

alter table ventas
  add constraint ventas_promo_code_id_fkey
  foreign key (promo_code_id) references promo_codes(id);

-- Valide + consomme un usage de façon atomique (une seule requête SQL,
-- donc pas de race condition sous checkout concurrent) et rattache le code
-- à la vente. Renvoie true si le code a bien été appliqué.
--
-- p_buyer_email : les codes de bienvenue ont un contact_email renseigné et
-- ne peuvent être consommés que par ce même acheteur — deviner/voler un tel
-- code ne sert à rien sur un panier qui n'est pas le sien. Les codes de
-- campagne (contact_email null) ignorent cette vérification : ils sont
-- publics par construction, seuls max_uses/expires_at/active les limitent.
-- drop nécessaire : la signature change (ajout de p_buyer_email), "create or
-- replace" seul créerait une surcharge au lieu de remplacer l'ancienne.
drop function if exists redeem_promo_code(text, uuid);

create or replace function redeem_promo_code(
  p_code text,
  p_venta_id uuid,
  p_buyer_email text
) returns boolean
language plpgsql
as $$
declare
  v_promo_id uuid;
begin
  update promo_codes
  set uses_count = uses_count + 1
  where code = upper(trim(p_code))
    and active
    and (expires_at is null or expires_at > now())
    and (max_uses is null or uses_count < max_uses)
    and (contact_email is null or contact_email = lower(trim(p_buyer_email)))
  returning id into v_promo_id;

  if v_promo_id is null then
    return false;
  end if;

  update ventas set promo_code_id = v_promo_id where id = p_venta_id;

  return true;
end;
$$;

-- =============================================================
-- MIGRATION — à exécuter une seule fois si promo_codes/ventas existent déjà
-- (schéma déployé avant l'ajout des codes de campagne). Sans effet sur une
-- base créée à partir de ce fichier depuis le début.
-- =============================================================
--
-- alter table promo_codes
--   add column if not exists label text,
--   add column if not exists max_uses int,
--   add column if not exists uses_count int not null default 0,
--   add column if not exists active boolean not null default true;
--
-- update promo_codes set max_uses = 1 where single_use;
-- update promo_codes set uses_count = 1 where used;
--
-- alter table promo_codes
--   alter column contact_email drop not null,
--   alter column expires_at drop not null,
--   drop column if exists single_use,
--   drop column if exists used,
--   drop column if exists used_at;
--
-- alter table ventas
--   add column if not exists promo_code_input text,
--   add column if not exists promo_code_id uuid references promo_codes(id),
--   add column if not exists discount integer not null default 0;

-- Code d'activation unique de chaque Vivabox physique (un code par vente).
-- Généré au moment du paiement. Le destinataire l'utilise plus tard sur la
-- plateforme d'activation (application séparée, MÊME projet Supabase) pour
-- débloquer le choix d'expérience.
create table activation_codes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  venta_id uuid not null references ventas(id),
  code text not null unique,
  -- Forme normalisée de code (majuscules, sans tirets/espaces) utilisée pour
  -- la recherche : le destinataire peut coller "viva-ab3d7", "VIVA AB3D7"...
  code_normalized text not null unique,

  status text not null default 'unused'
    check (status in ('unused', 'activated', 'expired')),

  -- Renseignés par le destinataire au moment de l'activation.
  beneficiary_name text,
  beneficiary_email text,

  -- Renseigné après confirmation d'une réservation (vivabox-appben,
  -- app/reservar/fechas/confirmacion/page.tsx), jamais à l'activation :
  -- opt-in séparé pour recevoir du contenu promotionnel (estados WhatsApp,
  -- SMS) par WhatsApp/SMS. Distinct du numéro WhatsApp demandé à l'étape
  -- /reservar/fechas/confirmar, qui ne sert qu'à coordonner cette réservation
  -- précise et n'est jamais stocké ici de façon structurée (voir bookings.message).
  beneficiary_phone text,
  marketing_consent boolean not null default false,
  marketing_consent_at timestamptz,

  activated_at timestamptz,
  expires_at timestamptz not null
);

alter table activation_codes enable row level security;
-- Même politique que les autres tables : accès exclusif via service_role.
-- Utilisée à la fois par le site (génération à la vente) et par la
-- plateforme d'activation (lecture/consommation), toutes deux côté serveur.

-- =============================================================
-- ACTIVATION — remplace AppScript/activation.gs
-- =============================================================

-- Session du destinataire après activation/vérification. Le token brut n'est
-- jamais stocké : seul son hash (sha256) l'est, pour que la lecture de cette
-- table seule ne permette pas d'usurper une session.
create table activation_sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  activation_code_id uuid not null references activation_codes(id),
  token_hash text not null unique,

  expires_at timestamptz not null,
  revoked_at timestamptz
);

alter table activation_sessions enable row level security;
-- Accès exclusif via service_role côté serveur.

-- Demande de réservation d'une expérience, une fois le code activé.
-- experience_code référence le codigo_interno du catalogue Experiencias
-- (encore hébergé sur Google Sheets aujourd'hui, pas de FK possible).
create table bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  activation_code_id uuid not null references activation_codes(id),
  experience_code text not null,

  requested_date date,
  -- Jusqu'à 3 options proposées par le bénéficiaire (côté vivabox-appben,
  -- voir app/reservar/fechas/page.tsx). requested_date reste la date
  -- active/effective (1re option, ou date alternative promue à la
  -- confirmation) et continue seule à piloter confirm/reschedule/cron ;
  -- requested_dates n'est là que pour affichage côté /pedidos.
  requested_dates date[],
  message text,

  status text not null default 'requested'
    check (status in ('requested', 'alternative_proposed', 'confirmed', 'completed', 'cancelled')),

  -- Date/moment/heure proposés par l'équipe quand la date demandée n'est pas
  -- disponible (status "alternative_proposed") — voir proposeAlternative()
  -- dans pedidos-.../reservas/actions.ts et respond-alternative côté
  -- vivabox-appben. Reflètent toujours la 1re alternative de
  -- proposed_alternatives : conservés tels quels pour ne pas casser
  -- vivabox-appben, qui ne connaît encore qu'une seule proposition.
  proposed_date date,
  proposed_moment text,
  proposed_hour text,
  -- Jusqu'à 3 alternatives préparées par l'équipe (même forme que
  -- requested_dates côté bénéficiaire), dans l'ordre de présentation
  -- A1 → A2 → A3. Chaque élément : {"date": "YYYY-MM-DD", "moment":
  -- "morning"|"afternoon"|"night", "hour": "HH:MM"|null}. NULL tant
  -- qu'aucune alternative n'a été proposée.
  proposed_alternatives jsonb
);

-- Un seul code ne peut avoir qu'une réservation active à la fois — garanti
-- par la base (pas seulement par une vérification côté application, qui
-- serait sujette à une race condition sur double-clic/double appel).
-- "alternative_proposed" compte comme active au même titre que "requested" :
-- tant que le bénéficiaire n'a pas répondu, la demande reste en cours.
create unique index bookings_one_active_per_code
  on bookings (activation_code_id)
  where status in ('requested', 'alternative_proposed', 'confirmed');

alter table bookings enable row level security;
-- Accès exclusif via service_role côté serveur.

-- Trace de chaque reprogrammation faite par le bénéficiaire depuis /ayuda
-- (vivabox-appben, POST /api/booking/[bookingId]/reschedule) : table à part
-- plutôt qu'un champ "previous_date" sur bookings pour garder tout
-- l'historique si le bénéficiaire change plusieurs fois, pas juste la
-- dernière valeur écrasée. Lue en lecture seule côté /pedidos (reservas,
-- BookingCard) pour afficher "12 ago → 20 ago" sous chaque réservation
-- reprogrammée.
create table booking_reschedules (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,

  -- Repris de bookings.requested_date / le segment "Horario: ..." de
  -- bookings.message juste avant d'être écrasés — previous_time_label est du
  -- texte déjà formaté (ex: "Mañana (~10:00)"), pas une clé morning/
  -- afternoon/night, car c'est la seule forme dans laquelle l'ancien horario
  -- existe (voir message ci-dessus). NULL si la réservation n'avait encore
  -- aucun horario enregistré (1er reschedule depuis la création).
  previous_date date,
  previous_time_label text,

  new_date date not null,
  new_time_label text not null,

  changed_at timestamptz not null default now()
);

create index booking_reschedules_booking_id_idx on booking_reschedules(booking_id);

alter table booking_reschedules enable row level security;
-- Accès exclusif via service_role côté serveur.

-- Compteur de tentatives, utilisé pour le rate limiting des endpoints
-- d'activation. Contrairement à AppScript (qui limitait par email soumis,
-- donc contournable en changeant d'email), on limite par IP ET par code
-- normalisé tenté — voir check_rate_limit() ci-dessous.
create table rate_limit_attempts (
  identifier text not null,
  action text not null,
  window_start timestamptz not null default now(),
  count int not null default 1,

  primary key (identifier, action)
);

alter table rate_limit_attempts enable row level security;
-- Accès exclusif via service_role côté serveur.

-- Incrémente/réinitialise le compteur de façon atomique (un seul statement
-- SQL, donc pas de race condition possible entre deux requêtes concurrentes)
-- et renvoie true si l'appelant est toujours sous la limite.
create or replace function check_rate_limit(
  p_identifier text,
  p_action text,
  p_max_attempts int,
  p_window_minutes int
) returns boolean
language plpgsql
as $$
declare
  v_count int;
begin
  insert into rate_limit_attempts (identifier, action, window_start, count)
  values (p_identifier, p_action, now(), 1)
  on conflict (identifier, action) do update
    set count = case
          when rate_limit_attempts.window_start < now() - (p_window_minutes || ' minutes')::interval
          then 1
          else rate_limit_attempts.count + 1
        end,
        window_start = case
          when rate_limit_attempts.window_start < now() - (p_window_minutes || ' minutes')::interval
          then now()
          else rate_limit_attempts.window_start
        end
  returning count into v_count;

  return v_count <= p_max_attempts;
end;
$$;

-- =============================================================
-- ALIADOS — propuestas de experiencia (/aliados)
-- =============================================================

-- Propuesta enviada por un posible aliado a través de /aliados. Volumen
-- bajo, sin ciclo de vida complejo en V1 : el equipo revisa manualmente
-- (email de notificación) y da seguimiento por WhatsApp/email, no hay
-- dashboard ni cambio de estado en la app todavía.
--
-- whatsapp/email son individualmente opcionales (el formulario solo exige
-- al menos uno de los dos) — de ahí el constraint partner_leads_contact_
-- required en vez de "not null" en ambas columnas.
create table partner_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  name text not null,
  company text not null,
  location text not null,

  whatsapp text,
  email text,

  category text not null
    check (category in (
      'Gastronomía', 'Bienestar', 'Naturaleza & aventura',
      'Cultura & creatividad', 'Escapadas', 'Parejas', 'Otro'
    )),
  experience_name text not null,
  experience_description text,
  website_or_instagram text,

  constraint partner_leads_contact_required
    check (coalesce(whatsapp, '') <> '' or coalesce(email, '') <> '')
);

alter table partner_leads enable row level security;
-- Mismo patrón que las demás tablas : sin policy, acceso exclusivo vía
-- service_role (ruta API Next.js del lado servidor).

-- Grant explícito para poder ejecutar solo este bloque en una base que ya
-- tiene el resto del esquema (el bloque GRANTS de más abajo ya lo cubriría,
-- pero solo si se vuelve a ejecutar completo).
grant select, insert, update, delete on partner_leads to service_role;

-- =============================================================
-- MIGRATION — si partner_leads ya fue creada con la versión anterior
-- (whatsapp/email/experience_description NOT NULL, sin location).
-- Sin efecto en una base creada desde cero con la definición de arriba.
-- =============================================================
--
-- alter table partner_leads
--   add column if not exists location text not null default '',
--   alter column whatsapp drop not null,
--   alter column email drop not null,
--   alter column experience_description drop not null;
--
-- alter table partner_leads
--   add constraint partner_leads_contact_required
--   check (coalesce(whatsapp, '') <> '' or coalesce(email, '') <> '');

-- =============================================================
-- GRANTS — nécessaire quand le projet est créé avec "Automatically
-- expose new tables" décoché (recommandé : évite d'exposer une table par
-- erreur à anon/authenticated). Sans ce bloc, service_role n'a aucun
-- privilège sur les tables même si RLS est bypass pour ce rôle — Postgres
-- vérifie les GRANT table par table avant même d'arriver à RLS.
-- "alter default privileges" couvre aussi les tables/fonctions futures.
-- =============================================================
grant usage on schema public to service_role;
grant select, insert, update, delete on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;

alter default privileges in schema public
  grant select, insert, update, delete on tables to service_role;
alter default privileges in schema public
  grant usage, select on sequences to service_role;
alter default privileges in schema public
  grant execute on functions to service_role;
