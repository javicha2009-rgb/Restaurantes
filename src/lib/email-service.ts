// Servicio de email simplificado usando Formspree
export interface SolicitudData {
  nombreBar: string;
  nombreContacto: string;
  email: string;
  telefono: string;
  ubicacion: string;
  mensaje?: string;
  fechaSolicitud?: string;
}

export interface ResultadoEnvio {
  success: boolean;
  error?: string;
}

// Función para enviar email usando Formspree (más simple y confiable)
export const enviarSolicitudDemo = async (data: SolicitudData): Promise<ResultadoEnvio> => {
  try {
    // Usar Formspree para envío directo a javijg2009@gmail.com
    const formspreeUrl = 'https://formspree.io/f/xdkogkpv'; // Endpoint público de Formspree
    
    const formData = new FormData();
    formData.append('email', 'javijg2009@gmail.com');
    formData.append('_replyto', data.email);
    formData.append('_subject', `Nueva Solicitud de Demostración - ${data.nombreBar}`);
    formData.append('nombreBar', data.nombreBar);
    formData.append('nombreContacto', data.nombreContacto);
    formData.append('emailContacto', data.email);
    formData.append('telefono', data.telefono);
    formData.append('ubicacion', data.ubicacion);
    formData.append('mensaje', data.mensaje || 'Sin mensaje adicional');
    formData.append('fechaSolicitud', data.fechaSolicitud || new Date().toLocaleString('es-ES'));

    const response = await fetch(formspreeUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      console.log('Solicitud enviada exitosamente via Formspree');
      return { success: true };
    } else {
      throw new Error('Error en la respuesta de Formspree');
    }
  } catch (error) {
    console.error('Error al enviar via Formspree:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
};

// Función alternativa usando fetch directo a tu email
export const enviarEmailDirecto = (data: SolicitudData): void => {
  try {
    const fechaActual = data.fechaSolicitud || new Date().toLocaleString('es-ES');
    
    // Usar mailto como fallback
    const mailtoLink = `mailto:javijg2009@gmail.com?subject=Nueva Solicitud de Demostración - ${encodeURIComponent(data.nombreBar)}&body=${encodeURIComponent(
      `Información del Establecimiento:\n` +
      `Nombre del Bar: ${data.nombreBar}\n` +
      `Ubicación: ${data.ubicacion}\n\n` +
      `Información de Contacto:\n` +
      `Nombre: ${data.nombreContacto}\n` +
      `Email: ${data.email}\n` +
      `Teléfono: ${data.telefono}\n\n` +
      `Mensaje: ${data.mensaje || 'Sin mensaje adicional'}\n\n` +
      `Fecha: ${fechaActual}`
    )}`;

    // Abrir cliente de email del usuario
    window.open(mailtoLink);
  } catch (error) {
    console.error('Error al abrir cliente de email:', error);
    throw error;
  }
};

// Función para guardar localmente como respaldo
export const guardarSolicitudLocal = (data: SolicitudData): void => {
  try {
    const solicitudes = JSON.parse(localStorage.getItem('mesalink_solicitudes_demo') || '[]');
    solicitudes.push(data);
    localStorage.setItem('mesalink_solicitudes_demo', JSON.stringify(solicitudes));
    console.log('Solicitud guardada localmente como respaldo');
  } catch (error) {
    console.error('Error al guardar solicitud localmente:', error);
  }
};