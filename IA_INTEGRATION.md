# Integración de IA - MindForge

## 📋 Estado Actual

✅ **OpenAI está configurado y activo**
- API Key: Configurado en `.env.local`
- Modelo: `gpt-4o-mini` (puedes cambiar en variables de entorno)
- Fallback: Si OpenAI falla, usa el motor local automáticamente

✅ **Arquitectura de Providers (Prioridad)**
1. **OpenAI** → `OPENAI_API_KEY` (ACTIVO)
2. **Make.com** → `MAKE_AI_WEBHOOK_URL` (Configurado)
3. **Motor Local** → Fallback automático (Siempre disponible)

---

## 🔌 Endpoints de IA Integrados

### 1. **Tutor (Socratic Learning)**
- **Endpoint**: `POST /api/tutor`
- **Propósito**: Enseña mediante preguntas, guía el pensamiento
- **Variables**: OpenAI + Motor local

### 2. **Coach (Mentoría de Negocios)**
- **Endpoint**: `POST /api/coach`
- **Propósito**: Ayuda con estrategia de negocio, presupuesto, marketing
- **Variables**: OpenAI + Motor local

### 3. **Generador de Negocios**
- **Endpoint**: `POST /api/generate-business`
- **Propósito**: Crea plan de 30 días, modelo de ingresos, estrategia
- **Variables**: OpenAI + Motor local

### 4. **Fact Checker**
- **Endpoint**: `POST /api/fact-check`
- **Propósito**: Verifica afirmaciones de IA, detecta alucinaciones
- **Variables**: OpenAI + Motor local

### 5. **Prompt Builder**
- **Endpoint**: `POST /api/prompt-builder`
- **Propósito**: Enseña a escribir prompts efectivos
- **Variables**: OpenAI + Motor local

---

## 📊 Variables de Entorno

```
# OpenAI (ACTUALMENTE EN USO)
NEXT_PUBLIC_SUPABASE_URL=https://jxejohnwplnmxdzzkhen.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu-clave>
OPENAI_API_KEY=sk-proj-...

# Alternativas (opcionales)
MAKE_AI_WEBHOOK_URL=https://hook.us2.make.com/...

# Configuración avanzada (opcional)
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1
```

---

## 🧪 Cómo Funciona

### Flujo de Generación de Texto

```
Usuario hace pregunta
        ↓
Verifica si OpenAI está disponible
        ↓
¿OpenAI está disponible? → SÍ → Llama OpenAI → Retorna respuesta
        ↓ NO
¿Make.com webhook está disponible? → SÍ → Llama webhook → Retorna respuesta
        ↓ NO
Motor local genera respuesta (Fallback seguro)
```

### Ventajas de esta Arquitectura

- ✅ **Nunca se cae**: Siempre hay un fallback
- ✅ **Sin errores**: Fallos en la API no rompen la app
- ✅ **Escalable**: Fácil de agregar nuevos providers
- ✅ **Offline**: Funciona incluso sin internet (con motor local)

---

## 🚀 Pruebas Rápidas

### Test 1: Verifica OpenAI
```bash
# En la consola del navegador, en cualquier página autenticada:
const res = await fetch('/api/tutor', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    subject: 'Mathematics',
    difficulty: 'medium',
    message: '¿Qué es una derivada?'
  })
});
const data = await res.json();
console.log(data); // Debería tener { result: {...}, provider: "openai" }
```

### Test 2: Crea un Negocio
```bash
POST /api/generate-business

Body:
{
  "name": "Tech Startup",
  "idea": "App de productividad",
  "targetMarket": "Freelancers",
  "experience": "Beginner",
  "hoursPerDay": 4,
  "initialBudget": 500,
  "skills": ["Web Development", "Marketing"]
}
```

---

## ⚙️ Configuración Actual

| Componente | Estado | Provider |
|-----------|--------|----------|
| Tutor | ✅ Activo | OpenAI (+ local fallback) |
| Coach | ✅ Activo | OpenAI (+ local fallback) |
| Business Generator | ✅ Activo | OpenAI (+ local fallback) |
| Fact Checker | ✅ Activo | OpenAI (+ local fallback) |
| Prompt Builder | ✅ Activo | OpenAI (+ local fallback) |

---

## 🔧 Si Necesitas Cambiar Provider

### Cambiar a Groq (OpenAI-compatible, gratis y rápido)

1. Crea cuenta en [groq.com](https://groq.com)
2. Obtén API key
3. Actualiza `.env.local`:

```
AI_BASE_URL=https://api.groq.com/openai
AI_PROVIDER_NAME=Groq
AI_API_KEY=gsk_...
AI_MODEL=mixtral-8x7b-32768
```

4. El sistema usará automáticamente Groq en lugar de OpenAI

### Cambiar a Together AI

```
AI_BASE_URL=https://api.together.xyz
AI_PROVIDER_NAME=Together
AI_API_KEY=<tu-key>
AI_MODEL=meta-llama/Llama-3-70b-chat-hf
```

---

## 📞 Problemas Comunes

### ❌ "Invalid API key"
- ✅ Solución: Verifica `OPENAI_API_KEY` en `.env.local`
- ✅ Recarga el servidor: `npm run dev`

### ❌ "Rate limited"
- ✅ OpenAI tiene límites. Espera 1 minuto
- ✅ O cambia a Groq (sin límites)

### ❌ "Empty response"
- ✅ Normal: El motor local responde automáticamente
- ✅ Verifica los logs: `npm run dev` muestra `[ai] responding from the local engine`

---

## 📈 Monitoreo

Todos los endpoints logean en la consola:

```
[ai] responding from the openai
[ai] OpenAI rejected the API key → Usa motor local
[ai] responding from the local engine
```

---

## 🎯 Próximos Pasos Sugeridos

1. ✅ **Prueba los endpoints** desde el navegador
2. ✅ **Crea un usuario de prueba** y usa el tutor
3. ✅ **Verifica los logs** en `npm run dev`
4. ✅ **Opcional**: Cambia a Groq si quieres más cuotas gratis
