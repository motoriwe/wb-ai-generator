import { createClient } from "@supabase/supabase-js";

// Клиент для использования в браузере (публичный ключ)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Клиент с service_role ключом — только для серверного кода (API routes)
// Имеет полный доступ, обходит Row Level Security. Никогда не используйте на клиенте.
export function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
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
