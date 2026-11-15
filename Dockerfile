FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build -- --configuration production

FROM nginx:alpine AS runtime

ENV BACKEND_API_URL=http://159.203.68.36:8080
ENV NGINX_ENVSUBST_FILTER=^BACKEND_API_URL$

COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist/ficha-tecnica-ui/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
