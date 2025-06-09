
# Guía de Compilación y Publicación Móvil - GatofitAI

Esta guía te llevará paso a paso para compilar y publicar GatofitAI en Google Play Store y Apple App Store.

## Prerrequisitos

### Para Android:
- Android Studio instalado
- Java JDK 17 o superior
- Cuenta de desarrollador de Google Play (costo único de $25 USD)

### Para iOS:
- macOS con Xcode instalado
- Cuenta de desarrollador de Apple ($99 USD anuales)
- Certificados de firma de iOS

## Paso 1: Preparar el proyecto

1. **Exportar desde Lovable:**
   - Haz clic en el botón de GitHub en la esquina superior derecha
   - Exporta el proyecto a tu repositorio de GitHub
   - Clona el repositorio en tu máquina local

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Construir la aplicación web:**
   ```bash
   npm run build
   ```

## Paso 2: Configurar plataformas nativas

### Android:
```bash
npx cap add android
npx cap sync android
```

### iOS (solo en Mac):
```bash
npx cap add ios
npx cap sync ios
```

## Paso 3: Compilar para Android

1. **Abrir en Android Studio:**
   ```bash
   npx cap open android
   ```

2. **En Android Studio:**
   - Espera a que se sincronicen las dependencias
   - Ve a Build > Generate Signed Bundle / APK
   - Selecciona "Android App Bundle (AAB)"
   - Crea o selecciona tu keystore
   - Firma la aplicación
   - Genera el archivo AAB para producción

3. **Configurar metadatos:**
   - Crea íconos de la app (1024x1024 para la tienda)
   - Prepara capturas de pantalla
   - Escribe la descripción de la app
   - Define palabras clave

## Paso 4: Compilar para iOS

1. **Abrir en Xcode:**
   ```bash
   npx cap open ios
   ```

2. **En Xcode:**
   - Configura tu equipo de desarrollo
   - Selecciona el dispositivo de destino
   - Ve a Product > Archive
   - Una vez archivado, sube a App Store Connect

## Paso 5: Publicar en las tiendas

### Google Play Store:
1. Ve a [Google Play Console](https://play.google.com/console)
2. Crea una nueva aplicación
3. Sube el archivo AAB
4. Completa toda la información requerida
5. Configura la clasificación de contenido
6. Envía para revisión

### Apple App Store:
1. Ve a [App Store Connect](https://appstoreconnect.apple.com)
2. Crea una nueva app
3. Sube el build desde Xcode
4. Completa los metadatos
5. Envía para revisión

## Configuraciones importantes

### Permisos requeridos:
- **Cámara**: Para escanear alimentos
- **Almacenamiento**: Para guardar imágenes
- **Internet**: Para conectar con Supabase

### URLs importantes:
- **Términos de servicio**: Necesarios para ambas tiendas
- **Política de privacidad**: Obligatorios
- **URL de soporte**: Para contacto con usuarios

## Notas adicionales

- El proceso de revisión puede tomar de 1-7 días
- Asegúrate de probar exhaustivamente en dispositivos reales
- Mantén actualizadas las dependencias de seguridad
- Considera implementar analytics para monitorear el uso

## Comandos útiles

```bash
# Sincronizar cambios después de modificaciones
npx cap sync

# Limpiar y reconstruir
npx cap clean
npm run build
npx cap sync

# Ver logs en desarrollo
npx cap run android --target=device
npx cap run ios --target=device
```

## Solución de problemas comunes

1. **Error de permisos de cámara**: Verifica AndroidManifest.xml
2. **Problemas de red**: Revisa la configuración de CORS en Supabase
3. **Crash en inicio**: Verifica que todas las dependencias estén sincronizadas

¡Tu aplicación GatofitAI estará lista para miles de usuarios en las tiendas móviles!
