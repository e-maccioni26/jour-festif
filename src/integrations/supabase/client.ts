
import { createClient } from '@supabase/supabase-js';

// Définition de l'URL et de la clé d'API Supabase
export const supabaseUrl = "https://tnadoqlzxhehlnqmihbr.supabase.co";
export const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuYWRvcWx6eGhlaGxucW1paGJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxMDI5NDEsImV4cCI6MjA1ODY3ODk0MX0.OuGqTRb1F-NGfZeWdHfFlMePmI4vbYOlZmOJCivYseE";

// Création du client Supabase
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage,
  }
});
