#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error('❌ Faltan variables de entorno:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', url ? '✓' : '✗');
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', anonKey ? '✓' : '✗');
  process.exit(1);
}

console.log('🔍 Conectando a Supabase...');
console.log('   URL:', url);

const supabase = createClient(url, anonKey);

try {
  const { data, error } = await supabase
    .from('profiles')
    .select('count');
  
  if (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
  
  console.log('✅ Conexión exitosa con Supabase');
  console.log('   Tablas accesibles: Sí');
  process.exit(0);
} catch (err) {
  console.error('❌ Error de conexión:', err.message);
  process.exit(1);
}
