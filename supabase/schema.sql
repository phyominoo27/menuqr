-- MenuQR Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  business_name text,
  created_at timestamp with time zone default now()
);

-- Menus
create table public.menus (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  slug text unique not null,
  is_published boolean default false,
  created_at timestamp with time zone default now()
);

-- Categories
create table public.menu_categories (
  id uuid default uuid_generate_v4() primary key,
  menu_id uuid references public.menus(id) on delete cascade not null,
  name_my text not null,
  name_en text not null,
  sort_order integer default 0
);

-- Items
create table public.menu_items (
  id uuid default uuid_generate_v4() primary key,
  category_id uuid references public.menu_categories(id) on delete cascade not null,
  name_my text not null,
  name_en text not null,
  description_my text,
  description_en text,
  price decimal(10,2) not null,
  currency text default 'MMK' check (currency in ('MMK', 'USD')),
  image_url text,
  sort_order integer default 0,
  is_available boolean default true
);

-- Tables
create table public.tables (
  id uuid default uuid_generate_v4() primary key,
  restaurant_id uuid references public.users(id) on delete cascade not null,
  label text not null,
  qr_slug text unique not null,
  menu_id uuid references public.menus(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- Row Level Security
alter table public.users enable row level security;
alter table public.menus enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.tables enable row level security;

-- Users: users can read their own data
create policy "Users can read own data" on public.users
  for select using (auth.uid() = id);

create policy "Users can insert own data" on public.users
  for insert with check (auth.uid() = id);

create policy "Users can update own data" on public.users
  for update using (auth.uid() = id);

-- Menus: public read, auth write own
create policy "Public can read published menus" on public.menus
  for select using (is_published = true);

create policy "Users can manage own menus" on public.menus
  for all using (auth.uid() = user_id);

-- Categories: public read published menus
create policy "Public can read categories" on public.menu_categories
  for select using (
    exists (select 1 from public.menus where id = menu_id and is_published = true)
  );

create policy "Users can manage own categories" on public.menu_categories
  for all using (
    exists (select 1 from public.menus where id = menu_id and user_id = auth.uid())
  );

-- Items: public read published menus
create policy "Public can read items" on public.menu_items
  for select using (
    exists (
      select 1 from public.menu_categories cc
      join public.menus m on m.id = cc.menu_id
      where cc.id = category_id and m.is_published = true
    )
  );

create policy "Users can manage own items" on public.menu_items
  for all using (
    exists (
      select 1 from public.menu_categories cc
      join public.menus m on m.id = cc.menu_id
      where cc.id = category_id and m.user_id = auth.uid())
  );

-- Tables: owner only
create policy "Users can manage own tables" on public.tables
  for all using (auth.uid() = restaurant_id);

create policy "Public can read tables" on public.tables
  for select using (menu_id is not null);

-- Storage bucket for menu item images
insert into storage.buckets (id, name, public) values ('menu-images', 'menu-images', true);

create policy "Anyone can view menu images" on storage.objects
  for select using (bucket_id = 'menu-images');

create policy "Authenticated users can upload menu images" on storage.objects
  for insert with check (bucket_id = 'menu-images' and auth.role() = 'authenticated');

create policy "Users can delete own menu images" on storage.objects
  for delete using (bucket_id = 'menu-images' and auth.uid()::text = (metadata->>'owner'));
