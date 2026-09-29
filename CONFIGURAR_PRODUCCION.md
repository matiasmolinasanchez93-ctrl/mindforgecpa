# Publicación de MindForge

Sitio: https://mindforgecpa.vercel.app

## Correo de confirmación (paso pendiente en Supabase)
La aplicación ya solicita confirmación y puede reenviarla. El SMTP predeterminado de Supabase no es un servicio de correo para usuarios de producción: limita destinatarios al equipo y aplica un límite reducido de envíos.

1. En Supabase, abre Authentication > Email / SMTP Settings y configura un proveedor SMTP propio (host, puerto, usuario, contraseña y remitente verificado).
2. Mantén activada la confirmación de correo.
3. En URL Configuration, establece Site URL: https://mindforgecpa.vercel.app
4. Autoriza estas Redirect URLs:
   - https://mindforgecpa.vercel.app/auth/callback**
   - http://localhost:3000/auth/callback**
   Los sufijos permiten los parámetros de retorno. No autorices dominios ajenos.
5. En la plantilla de confirmación usa el enlace de confirmación de Supabase (`{{ .ConfirmationURL }}`). El callback de la aplicación también admite token_hash de tipo email/signup si utilizas una plantilla personalizada.
6. Revisa Authentication > Logs y los registros de entrega de tu proveedor si el correo sigue sin llegar. Un registro aceptado no prueba que el correo haya llegado a la bandeja de entrada.

No hace falta borrar usuarios, desactivar RLS ni desactivar la confirmación. El SQL de las tablas no configura el servicio SMTP.

Documentación:
- https://supabase.com/docs/guides/auth/auth-smtp
- https://supabase.com/docs/guides/auth/redirect-urls

## Variables en Vercel
En Settings > Environment Variables, configura para Production:
- NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY: del mismo proyecto Supabase.
- MAKE_AI_WEBHOOK_URL: el flujo de Gemini.
- CHALLENGE_SIGNING_SECRET: valor privado aleatorio estable, compartido por todas las instancias.
No expongas claves de servicio ni contraseñas SMTP como NEXT_PUBLIC_*.

Publica de nuevo después de actualizar código o variables. Las variables NEXT_PUBLIC_* se incorporan a la compilación.

## Verificación
- Registrar un correo real autorizado por tu proveedor SMTP.
- Confirmar el enlace y comprobar que abre la web publicada.
- Cerrar sesión y volver a entrar.
- Crear una conversación, cambiar de materia y recargar para retomarla.
- Crear un prompt o verificar un texto y abrir Resumen: deben aparecer los contadores y resultados guardados.
- Los contadores de herramientas empiezan a registrar uso desde esta actualización. No se inventan actividades anteriores ni puntuaciones para resultados de herramientas.

## Redirecciones de acceso
El dominio de las redirecciones de produccion esta fijado en src/lib/auth-redirect.ts: https://mindforgecpa.vercel.app. APP_URL ya no controla estas redirecciones. Publica los cambios. En Supabase del proyecto jxejohnwplnmxdzzkhen, Site URL debe ser https://mindforgecpa.vercel.app y Redirect URLs debe incluir https://mindforgecpa.vercel.app/auth/callback**. Solicita un correo nuevo tras guardar; los enlaces antiguos pueden conservar localhost. La clave APP_URL no modifica la configuracion de Supabase.

## Recuperar contraseña
La página /login incluye el enlace /forgot-password. El correo abre /auth/callback?next=%2Freset-password y la sesión validada permite cambiar la contraseña en /reset-password. No requiere SQL adicional.
En Supabase > Authentication > Email Templates > Reset password, pega supabase/templates/reset-password.html para permitir abrir el enlace también en otro navegador o dispositivo (token_hash). Site URL debe ser https://mindforgecpa.vercel.app. El formato predeterminado {{ .ConfirmationURL }} también funciona con PKCE si se abre en el mismo navegador donde se pidió el enlace. Autoriza https://mindforgecpa.vercel.app/auth/callback** en Redirect URLs y publica el código actualizado en Vercel. Los enlaces caducados muestran una opción para pedir otro; el formulario no confirma si existe una cuenta con el correo indicado.

Las plantillas supabase/templates/confirm-signup.html (Confirm signup) y supabase/templates/reset-password.html (Reset password) usan explicitamente https://mindforgecpa.vercel.app. Copia cada una en su plantilla de Supabase. Elimina mindforge.today de las Redirect URLs si ya no se utiliza y corrige Site URL. Pide enlaces nuevos despues de guardar.
