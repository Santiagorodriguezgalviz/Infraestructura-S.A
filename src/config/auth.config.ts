// Configuración de autenticación
export const authConfig = {
  defaultCredentials: {
    email: import.meta.env.VITE_DEFAULT_AUTH_EMAIL || '',
    password: import.meta.env.VITE_DEFAULT_AUTH_PASSWORD || '',
  },
  // Función para verificar si las credenciales predefinidas están disponibles
  hasDefaultCredentials: () => {
    return Boolean(
      import.meta.env.VITE_DEFAULT_AUTH_EMAIL &&
      import.meta.env.VITE_DEFAULT_AUTH_PASSWORD
    );
  },
  // Función para obtener las credenciales predefinidas de forma segura
  getDefaultCredentials: () => {
    if (!authConfig.hasDefaultCredentials()) {
      console.warn('No hay credenciales predefinidas disponibles');
      return { email: '', password: '' };
    }
    return authConfig.defaultCredentials;
  }
};
