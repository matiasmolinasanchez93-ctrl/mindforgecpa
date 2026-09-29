#!/usr/bin/env node

/**
 * Dashboard de Estado de IA - MindForge
 * Muestra qué providers están configurados y el estado de cada endpoint
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Carga .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value && !line.startsWith('#')) {
      process.env[key.trim()] = value.trim();
    }
  });
}

const config = {
  openai: process.env.OPENAI_API_KEY ? '✅' : '❌',
  make: process.env.MAKE_AI_WEBHOOK_URL ? '✅' : '❌',
  supabase: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌',
};

const endpoints = {
  tutor: {
    route: 'POST /api/tutor',
    description: 'Enseñanza por método Socrático',
    requires: ['auth', 'openai | local'],
  },
  coach: {
    route: 'POST /api/coach',
    description: 'Mentoría de estrategia de negocio',
    requires: ['auth', 'openai | local'],
  },
  businessGenerator: {
    route: 'POST /api/generate-business',
    description: 'Genera plan de 30 días y estrategia',
    requires: ['auth', 'openai | local'],
  },
  factChecker: {
    route: 'POST /api/fact-check',
    description: 'Verifica afirmaciones y detecta errores',
    requires: ['auth', 'openai | local'],
  },
  promptBuilder: {
    route: 'POST /api/prompt-builder',
    description: 'Enseña a escribir prompts mejores',
    requires: ['auth', 'openai | local'],
  },
};

console.clear();
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║       🤖 MINDFORGE - IA INTEGRATION STATUS DASHBOARD       ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

console.log('📊 PROVIDERS CONFIGURADOS:\n');
console.log(`  OpenAI (gpt-4o-mini)       ${config.openai}`);
console.log(`  Make.com Webhook           ${config.make}`);
console.log(`  Supabase Backend           ${config.supabase}`);
console.log(`  Motor Local (Fallback)     ✅ (Siempre disponible)\n`);

console.log('🎯 ENDPOINTS DE IA DISPONIBLES:\n');

Object.entries(endpoints).forEach(([key, endpoint], idx) => {
  console.log(`  ${idx + 1}. ${endpoint.route}`);
  console.log(`     📝 ${endpoint.description}`);
  console.log(`     ⚙️  Requiere: ${endpoint.requires.join(', ')}`);
  console.log('');
});

console.log('🔄 FLUJO DE FALLBACK:\n');
console.log('  1️⃣  Intenta OpenAI        (si está configurado)');
console.log('  2️⃣  Intenta Make.com       (si está configurado)');
console.log('  3️⃣  Usa Motor Local        (siempre disponible) ✅\n');

console.log('✨ ACCIONES:\n');
console.log('  🚀 npm run dev             → Inicia el servidor');
console.log('  🧪 npm run test:ai         → Prueba los endpoints');
console.log('  📖 cat IA_INTEGRATION.md   → Lee la documentación\n');

if (!config.openai) {
  console.log('⚠️  ADVERTENCIA: OpenAI no está configurado.');
  console.log('   El sistema funcionará con el motor local, pero con capacidades limitadas.\n');
  console.log('   Para habilitar OpenAI:');
  console.log('   1. Ve a https://platform.openai.com/api-keys');
  console.log('   2. Copia tu API key');
  console.log('   3. Añade a .env.local: OPENAI_API_KEY=sk-...\n');
}

console.log('═'.repeat(60) + '\n');
