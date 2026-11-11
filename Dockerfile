# Usamos la imagen de Node para crear el build
FROM node:18-alpine as build

# Establecemos el directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración primero (para mejor caché de Docker)
COPY package.json package-lock.json ./

# Instalar dependencias y actualizar browserslist
RUN npm install && \
    npm ci && \
    npx update-browserslist-db@latest && \
    npm cache clean --force

# Copiar los archivos del frontend
#COPY . /app/
COPY . .

# Instalar dependencias
RUN npm install

# Construir el proyecto React para producción
RUN rm -rf dist && npm run build && \
    echo "Build completo" && \
    ls -lah /app/dist && \
    cat /app/dist/index.html | grep script
# Usamos una imagen de Nginx para servir la aplicación compilada
FROM nginx:alpine

# Eliminar la configuración por defecto de Nginx
#RUN rm /etc/nginx/conf.d/default.conf



# Copiar los archivos estáticos generados a la carpeta de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

# Exponer el puerto 80
EXPOSE 80
