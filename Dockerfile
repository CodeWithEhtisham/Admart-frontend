# syntax=docker/dockerfile:1
# One frontend image.
#   dev  (default for the backend repo's docker compose): source is bind-mounted, Vite hot-reloads
#   prod: static build served by nginx (VITE_* values are baked in at build time: pass them as --build-arg)

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS dev
COPY . .
EXPOSE 5173
CMD ["npx", "vite", "--host", "0.0.0.0", "--port", "5173", "--strictPort"]

FROM deps AS build
COPY . .
ARG VITE_API_URL=""
ARG VITE_GOOGLE_CLIENT_ID=""
ARG VITE_GOOGLE_REDIRECT_URI=""
ARG VITE_SUPPORT_EMAIL=""
ARG VITE_COMPANY_NAME="Admart"
ARG VITE_COMPANY_ADDRESS=""
RUN npm run build

FROM nginx:1.27-alpine AS prod
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
