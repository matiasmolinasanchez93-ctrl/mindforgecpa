# 🚀 QUICK START - IA MINDFORGE

## En 5 Minutos: Prueba la IA

### Paso 1: Asegúrate que el servidor está corriendo
```bash
npm run dev
# Debería mostrar: ✓ Ready in X ms
# URL: http://localhost:3001
```

### Paso 2: Abre el navegador
```
http://localhost:3001
```

### Paso 3: Crea una cuenta de prueba
- Click en **"Get started free"**
- Ingresa: Email, Nombre, Contraseña
- Selecciona: **"🎓 Student"**
- Click en **"Create account"**

### Paso 4: Crea tu primer negocio (Opcional)
- Completa el onboarding
- Ingresa idea, mercado, presupuesto
- El sistema genera automáticamente:
  - Plan de 30 días
  - Modelo de ingresos
  - Estrategia de marketing

✨ **Listo. La IA ya está funcionando.**

---

## Pruebas sin UI (Para Desarrolladores)

### Prueba 1: Tutor API (Desde la consola del navegador)

```javascript
// Abierto en cualquier página autenticada, ej: /dashboard

const response = await fetch('/api/tutor', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    subject: 'Mathematics',
    difficulty: 'medium',
    message: '¿Cómo resuelvo x² + 2x + 1 = 0?'
  })
});

const data = await response.json();
console.log(data);
// Output: { reply: "Interesante pregunta...", provider: "openai" }
```

### Prueba 2: Coach API

```javascript
const response = await fetch('/api/coach', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: '¿Cuál es el mejor precio para mi producto?',
    businessId: 'business-id-aqui'  // Obtén de /api/businesses
  })
});

const data = await response.json();
console.log(data.reply);
```

### Prueba 3: Fact Checker

```javascript
const response = await fetch('/api/fact-check', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'La Tierra es plana y fue creada hace 6000 años'
  })
});

const data = await response.json();
console.log(data.analysis);
```

---

## Ver Logs en Tiempo Real

Cuando usas la IA, verás en la terminal:

```
[ai] responding from openai            ← Usando OpenAI
[ai] OpenAI rejected the API key       ← Problema con clave
[ai] responding from the local engine  ← Fallback local
```

---

## ¿Qué Significa Cada Log?

| Log | Significado | Acción |
|-----|-----------|--------|
| `responding from openai` | ✅ Funciona perfectamente | Nada |
| `timed out` | OpenAI lento, probando Make | Nada (automático) |
| `responding from the local engine` | Usando fallback | Todo bien (funciona) |
| `rejected the API key` | Problema con API key | Revisa .env.local |
| `rate limited` | Se acabó la cuota de OpenAI | Espera o cambia a Groq |

---

## Checklist de Integración

- ✅ Servidor corriendo en localhost:3001
- ✅ Supabase conectado
- ✅ OpenAI configurado
- ✅ Motor local como fallback
- ✅ 5 endpoints de IA funcionando
- ✅ Base de datos lista

**¿Todo en verde? 🎉 Tu IA está lista para producción.**

---

## Si Algo No Funciona

### El servidor no inicia
```bash
npm run dev
# Si hay errores, revisa que no haya otro proceso en puerto 3001
# npx kill-port 3001
```

### El signup falla
```
Verifica:
1. Supabase está conectado (.env.local)
2. Schema SQL está en la BD (supabase/schema.sql)
3. La terminal no muestra errores de conexión
```

### La IA no responde
```
Verifica logs: npm run dev
- ¿Dice "responding from openai"? → Bien
- ¿Dice "responding from the local engine"? → Bien (fallback)
- ¿Dice "rejected the API key"? → Revisa .env.local
```

---

## Próximos Pasos

1. ✅ **Prueba la IA** desde el navegador
2. ✅ **Revisa los logs** en la terminal
3. ✅ **Crea un negocio de prueba** y mira el plan
4. ✅ **Habla con el tutor** en la sección de tutorías
5. ✅ **Pregunta al coach** sobre tu estrategia
6. ✅ Cuando estés listo: **npm run build && npm start** (Producción)

---

## 📞 Recursos

- 📖 Documentación: [IA_INTEGRATION.md](./IA_INTEGRATION.md)
- 📊 Estado: `node ai-status.mjs`
- 🧪 Tests: `npm run test:ai`
- 🔧 Config: `.env.local`

---

**¡Felicidades! Tu proyecto de IA está completo y funcionando.** 🚀
