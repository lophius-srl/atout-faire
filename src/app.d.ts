// Types globaux de SvelteKit : https://svelte.dev/docs/kit/types#app.d.ts
import type { SupabaseClient } from "@supabase/supabase-js";

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient;
      utilisateurConnecte: () => Promise<{ id: string } | null>;
    }
  }
}

export {};
