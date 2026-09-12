-- Milestone 1: Supabase foundation
-- Enables pgcrypto so gen_random_uuid() is available for all primary keys.
-- Idempotent: safe to re-run.
create extension if not exists pgcrypto;
