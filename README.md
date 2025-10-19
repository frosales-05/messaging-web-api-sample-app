# 🚀 Salesforce Messaging Widget para WordPress

Widget embebible de chat para Salesforce que se auto-conecta desde variables de entorno. Diseñado para integrarse fácilmente en sitios WordPress como un botón flotante.

## ✨ Características

- ✅ **Auto-conectar**: Sin formularios, conecta directamente desde `.env.local`
- ✅ **WordPress Ready**: Integrable como plugin o en functions.php
- ✅ **Botón Flotante**: Aparece en esquina inferior derecha
- ✅ **Responsive**: Funciona en desktop, tablet y mobile
- ✅ **Mensajería en Tiempo Real**: EventSource (SSE) para actualizaciones instantáneas
- ✅ **Producción Ready**: Despliegue en Vercel, Netlify, o servidor propio
- ✅ **Documentación Completa**: 10 documentos de referencia

## 🎯 Inicio Rápido

### 1️⃣ Requisitos
- Node.js + npm
- Acceso a Salesforce Org ID, Deployment Name, y Messaging URL
- (Opcional) Vercel o Netlify para despliegue

### 2️⃣ Configuración Local
```bash
# Clonar/Descargar el proyecto
cd messaging-web-api-sample-app

# Instalar dependencias
npm install

# Crear .env.local con tus valores (CRÍTICO)
cat > .env.local << EOF
REACT_APP_SALESFORCE_ORG_ID=00Dfl000003YlPN
REACT_APP_SALESFORCE_DEPLOYMENT_NAME=Messaging_Web_Deployment
REACT_APP_SALESFORCE_MESSAGING_URL=https://sgocl.my.salesforce-scrt.com
REACT_APP_AUTO_CONNECT=true
EOF

# Iniciar desarrollo
npm start
```

El chat debería abrirse automáticamente en `http://localhost:3000`

### 3️⃣ Compilar para Producción
```bash
npm run build
```

Crea carpeta `build/` lista para despliegue.

### 4️⃣ Despliegue (Vercel - Recomendado)
```bash
git push origin main
# Vercel auto-deploya en 2-5 minutos
# URL: https://[tu-proyecto].vercel.app
```

### 5️⃣ Integrar en WordPress
En WordPress Admin, instala plugin "Code Snippets":
```html
<script src="https://[tu-proyecto].vercel.app"></script>
```

## 📚 Documentación

| Documento | Para | Duración |
|-----------|------|----------|
| **[START_HERE.md](START_HERE.md)** | **Comienza aquí** | 5 min |
| [PASOS_FINALES.md](PASOS_FINALES.md) | Despliegue rápido | 15 min |
| [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) | Opciones de despliegue | 30 min |
| [WORDPRESS_INTEGRATION.md](WORDPRESS_INTEGRATION.md) | Integración WordPress | 10 min |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Resolver problemas | Según necesidad |
| [QUICK_REFERENCE.md](QUICK_REFERENCE.md) | Referencia rápida | 5 min |
| [RESUMEN_FINAL.md](RESUMEN_FINAL.md) | Entender todo | 20 min |
| [DEBUG_GUIDE.md](DEBUG_GUIDE.md) | Debugging avanzado | 30 min |
| [IMPLEMENTATION_CHECKLIST.md](IMPLEMENTATION_CHECKLIST.md) | Verificación completa | 60 min |

## 🔧 Comandos Principales

```bash
# Desarrollo
npm start                    # http://localhost:3000

# Producción
npm run build               # Compilar

# Testing (opcional)
npm test                    # Ejecutar tests
npm run build --analyze     # Analizar tamaño
```

## 🌍 Variables de Entorno

**Archivo**: `.env.local` (NO subir a git - está en .gitignore)

```bash
# Tus credenciales de Salesforce
REACT_APP_SALESFORCE_ORG_ID=00Dfl000003YlPN
REACT_APP_SALESFORCE_DEPLOYMENT_NAME=Messaging_Web_Deployment
REACT_APP_SALESFORCE_MESSAGING_URL=https://sgocl.my.salesforce-scrt.com

# Activar auto-conexión
REACT_APP_AUTO_CONNECT=true
```

**⚠️ Reglas Críticas:**
- ✅ SIN espacios alrededor de `=`
- ✅ Valores SIN comillas
- ✅ URL SIN trailing slash `/`
- ✅ `AUTO_CONNECT` es string `'true'`, no boolean

## 🏗️ Arquitectura

```
src/
├── bootstrapMessaging.js     👈 Auto-connect + botón
├── App.js                    👈 Componente raíz
├── components/
│   ├── conversation.js       👈 Lógica principal del chat
│   ├── messagingWindow.js    👈 Ventana flotante
│   ├── messagingButton.js    👈 Botón "Let's Chat"
│   └── ...otros componentes
├── services/
│   ├── messagingService.js   👈 API a Salesforce
│   ├── eventSourceService.js 👈 Mensajes en tiempo real
│   └── dataProvider.js       👈 Storage local
└── helpers/
    ├── constants.js
    ├── conversationEntryUtil.js
    └── webstorageUtils.js
```

## 📱 Despliegue

### Opción 1: Vercel (RECOMENDADO)
- Gratis
- Auto-deploy en cada push
- Variables de entorno protegidas
- CDN global

### Opción 2: Netlify
- Similar a Vercel
- Interfaz diferente
- Mismo proceso

### Opción 3: Servidor Propio
- AWS, DigitalOcean, Bluehost, etc.
- FTP upload del folder `build/`
- URL: `https://tu-dominio.com/widget`

Ver [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) para instrucciones detalladas.

## 🔌 Integración WordPress

### Método 1: Plugin Code Snippets (Más Fácil)
1. Plugins → Add New → "Code Snippets"
2. Instala y activa
3. Snippets → Add New
4. Pega: `<script src="https://[tu-vercel-url].vercel.app"></script>`
5. Activa

### Método 2: functions.php
```php
function enqueue_salesforce_widget() {
    wp_enqueue_script('sf-widget', 'https://[tu-vercel-url].vercel.app', [], '1.0', true);
}
add_action('wp_enqueue_scripts', 'enqueue_salesforce_widget');
```

### Método 3: Widget HTML
- Widgets → Add Custom HTML
- Pega script
- Guarda

Ver [WORDPRESS_INTEGRATION.md](WORDPRESS_INTEGRATION.md) para más opciones.

## 🐛 Troubleshooting Rápido

| Problema | Solución |
|----------|----------|
| **Chat no se abre** | Verifica `.env.local` tiene valores correctos |
| **"Conversation Ended"** | Bug ya arreglado, verifica que tienes código actualizado |
| **Duplicadas conversaciones** | StrictMode removido, verifica `src/index.js` |
| **Widget no aparece en WordPress** | Verifica URL es correcta, F12 Network busca errores |
| **Error CORS** | Configura CORS en Salesforce Setup |
| **Build falla** | `npm install --legacy-peer-deps && npm run build` |

Ver [TROUBLESHOOTING.md](TROUBLESHOOTING.md) para soluciones completas.

## ✅ Estado Actual

```
✅ Auto-connect funcionando
✅ Chat abre sin errores
✅ Mensajes envían/reciben
✅ Sin duplicación de conversaciones
✅ Botón flotante responsivo
✅ Listo para producción
✅ Totalmente documentado
```

## 🎓 Tecnologías Usadas

- **React 18.3.1** - Framework UI
- **Create React App** - Tooling y build
- **EventSource/SSE** - Mensajería en tiempo real
- **localStorage/sessionStorage** - Persistencia de datos
- **Salesforce Messaging API v2.0** - Backend

## 📞 Ayuda

1. **Primeras vez**: Lee [START_HERE.md](START_HERE.md)
2. **Despliegue rápido**: Lee [PASOS_FINALES.md](PASOS_FINALES.md)
3. **Problemas**: Busca en [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
4. **Dudas**: Lee [RESUMEN_FINAL.md](RESUMEN_FINAL.md)

## 📄 REST API Documentation
[https://developer.salesforce.com/docs/service/messaging-api](https://developer.salesforce.com/docs/service/messaging-api)

## 📋 Prerequisites
- Salesforce Org con Embedded Service Deployment (Custom Client)
- Org ID (15 o 18 caracteres)
- Deployment Name
- Messaging URL

## 🚀 Próximos Pasos

1. Abre [START_HERE.md](START_HERE.md)
2. Sigue los pasos
3. ¡Tu widget estará funcionando en 15 minutos!

---

**Versión**: 2.0 Auto-Connect  
**Estado**: ✅ Production-Ready  
**Última actualización**: 2024
- Once the Sample App page is launched either Remotely or via Local Setup, input your Embedded Service deployment details in the form and submit.
  - The deployment details can be found under the Code Snippet panel under Embedded Service deployment setup in Salesforce.
- Click on the 'Let's Chat' Button to get started with a new conversation.
