FROM node:18-bullseye AS builder
WORKDIR /app
COPY package*.json ./
# Remove package-lock if present to avoid npm optional-deps issues, then install without optional deps
RUN rm -f package-lock.json || true
RUN npm install --no-optional --prefer-offline --no-audit || npm ci --no-optional --prefer-offline --no-audit
COPY . .
RUN npm run build

FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
