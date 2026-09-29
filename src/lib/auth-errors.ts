export function authErrorMessage(error: unknown): string {
  const value = error as { code?: string; message?: string } | null;
  const messages: Record<string, string> = {
    same_password: "Elige una contraseña diferente a la anterior.",
    session_not_found: "Tu sesión ha caducado. Solicita un nuevo enlace de recuperación.",
    refresh_token_not_found: "Tu sesión ha caducado. Solicita un nuevo enlace de recuperación.",
    otp_expired: "El enlace ha caducado. Solicita uno nuevo.",
    email_not_confirmed: "Confirma tu correo antes de iniciar sesión.",
    invalid_credentials: "El correo o la contraseña no son correctos.",
    over_email_send_rate_limit: "Se alcanzó el límite de envío de correos. Espera antes de reintentarlo o contacta al administrador.",
    over_request_rate_limit: "Hay demasiados intentos. Espera un momento e inténtalo de nuevo.",
    email_address_not_authorized: "El servicio de correo no puede enviar a esta dirección. Contacta al administrador.",
    signup_disabled: "El registro está temporalmente deshabilitado.",
    user_already_exists: "Ya existe una cuenta con ese correo. Prueba a iniciar sesión.",
    weak_password: "Elige una contraseña más segura, de al menos 8 caracteres.",
    email_address_invalid: "Revisa que el correo electrónico esté escrito correctamente.",
  };
  if (value?.code && messages[value.code]) return messages[value.code];
  if (/sending confirmation|sending.*email/i.test(value?.message ?? "")) return "No se pudo enviar el correo de confirmación. Inténtalo más tarde o contacta al administrador.";
  if (/database error saving/i.test(value?.message ?? "")) return "No se pudo completar el registro. Contacta al administrador para revisar la creación de tu perfil.";
  return "No pudimos completar la solicitud. Comprueba tu conexión e inténtalo de nuevo.";
}
