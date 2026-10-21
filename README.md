# Mi Nutri IA — proyecto inicial

Incluye el HTML original ampliado con un chat, y un Cloudflare Worker que conecta con la API de OpenAI sin exponer la clave al navegador.

## Puesta en marcha
1. Publica `index.html` en un hosting HTTPS (p. ej., GitHub Pages).
2. Instala Node.js, entra en esta carpeta y ejecuta `npx wrangler login`.
3. Cambia `ALLOWED_ORIGIN` en `wrangler.toml` por el origen de tu web, por ejemplo `https://usuario.github.io` (sin ruta).
4. Ejecuta `npx wrangler deploy` y copia la URL del Worker.
5. Ejecuta `npx wrangler secret put OPENAI_API_KEY` y pega la clave en el terminal. **Nunca** la introduzcas en el HTML, en GitHub ni en un chat.
6. Abre tu HTML publicado, ve a la sección 'Nutri IA' e introduce la URL HTTPS de tu Worker, sin `/chat`.

## Seguridad antes de uso real
**Este es un prototipo para pruebas, no un servicio público listo para producción.** CORS no autentica a usuarios ni impide que alguien llame al Worker directamente. Antes de usarlo con una clave facturable, configura una protección de acceso real (por ejemplo, Cloudflare Access con un despliegue de mismo origen o un backend con sesiones verificadas), límites por usuario/IP en el servidor, cuota y alertas de facturación. No publiques un Worker sin esas medidas. No compartas información médica sensible con el chatbot. Configura límites de gasto en la plataforma de API.

El chat **no cambia automáticamente los gramos ni guarda el menú**: propone sustituciones y explicaciones. Los cálculos y cambios automáticos requieren añadir una base de alimentos y una acción confirmada por el usuario.
