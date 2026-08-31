import { createClient } from "@supabase/supabase-js";

// Клиенты создаются лениво (по требованию), а не при загрузке модуля.
// Это важно: Next.js при сборке ("Collecting page data") импортирует все
// API-роуты, и если бы клиент создавался сразу здесь, сборка падала бы
// при отсутствии переменных окружения — даже если этот код ещё не вызывался.

let _supabase = null;

// Клиент для использования в браузере (публичный ключ)
export function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }
  return _supabase;
}

let _supabaseAdmin = null;

// Клиент с service_role ключом — только для серверного кода (API routes)
// Имеет полный доступ, обходит Row Level Security. Никогда не используйте на клиенте.
export function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return _supabaseAdmin;
}

/*
SQL для создания таблицы пользователей в Supabase (выполнить в SQL Editor):

create table profiles (
  id uuid references auth.users primary key,
  email text,
  stripe_customer_id text,
  subscription_status text default 'free', -- 'free' | 'active' | 'canceled'
  generations_used int default 0,
  generations_limit int default 5, -- лимит для free-плана
  created_at timestamp with time zone default now()
);

-- Автоматически создавать профиль при регистрации
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
*/
