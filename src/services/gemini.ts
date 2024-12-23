import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error('VITE_GOOGLE_GEMINI_API_KEY no está definida en el archivo .env');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

export async function getChatResponse(message: string): Promise<string> {
  try {
    const prompt = `Como asistente del sistema de inventario de Infraestructura S.A, ayuda al usuario con su consulta: "${message}". 
    Enfócate en:
    - Gestión de inventario y elementos
    - Consultas sobre materiales de construcción
    - Gestión de solicitudes y pedidos
    - Verificación de cantidades disponibles
    
    Da una respuesta concisa y profesional.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error al obtener respuesta de Gemini:', error);
    return 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta nuevamente.';
  }
}
