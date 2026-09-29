#!/usr/bin/env node

/**
 * Script de prueba para verificar la integración de IA
 * Uso: npm run test:ai
 */

import fetch from 'node-fetch';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

const tests = [
  {
    name: 'Tutor API',
    endpoint: '/api/tutor',
    body: {
      subject: 'Mathematics',
      difficulty: 'medium',
      message: '¿Qué es una integral definida?'
    }
  },
  {
    name: 'Fact Checker API',
    endpoint: '/api/fact-check',
    body: {
      text: 'Python fue creado en 1991 por Guido van Rossum',
      context: 'Programming languages history'
    }
  }
];

async function runTests() {
  console.log('🧪 Iniciando pruebas de integración de IA...\n');
  
  for (const test of tests) {
    try {
      console.log(`📝 Probando: ${test.name}`);
      console.log(`   Endpoint: ${test.endpoint}`);
      
      const response = await fetch(`${BASE_URL}${test.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(test.body)
      });
      
      if (!response.ok) {
        console.log(`   ❌ Error: ${response.status} ${response.statusText}`);
        const error = await response.json();
        console.log(`   Detalle: ${error.error || JSON.stringify(error)}\n`);
        continue;
      }
      
      const data = await response.json();
      console.log(`   ✅ Exitoso`);
      console.log(`   Provider: ${data.provider || 'unknown'}`);
      console.log(`   Response: ${JSON.stringify(data).substring(0, 100)}...\n`);
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`);
    }
  }
  
  console.log('✨ Pruebas completadas');
}

runTests().catch(console.error);
