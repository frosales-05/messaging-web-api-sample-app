/**
 * Salesforce Messaging Widget Embed Script
 * 
 * Uso en WordPress o cualquier sitio:
 * <script>
 *   window.SalesforceMessagingConfig = {
 *     orgId: '00Dfl000003YlPN',
 *     deploymentName: 'Messaging_Web_Deployment',
 *     messagingUrl: 'https://sgocl.my.salesforce-scrt.com',
 *     autoConnect: true
 *   };
 * </script>
 * <script src="https://tu-dominio.com/salesforce-messaging-widget.js"></script>
 */

(function() {
    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWidget);
    } else {
        initWidget();
    }

    function initWidget() {
        // Crear contenedor root para React
        const root = document.createElement('div');
        root.id = 'salesforce-messaging-widget-root';
        document.body.appendChild(root);

        // Cargar configuración
        const config = window.SalesforceMessagingConfig || {};

        // Establecer variables de entorno
        if (config.orgId) {
            window.REACT_APP_SALESFORCE_ORG_ID = config.orgId;
        }
        if (config.deploymentName) {
            window.REACT_APP_SALESFORCE_DEPLOYMENT_NAME = config.deploymentName;
        }
        if (config.messagingUrl) {
            window.REACT_APP_SALESFORCE_MESSAGING_URL = config.messagingUrl;
        }
        if (config.autoConnect !== undefined) {
            window.REACT_APP_AUTO_CONNECT = config.autoConnect.toString();
        }

        // Aquí iría la carga de React y el renderizado del widget
        console.log('Salesforce Messaging Widget loaded');
        console.log('Config:', config);
    }
})();
