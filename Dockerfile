# Stage 1: Build the React app
FROM node:20-alpine AS build

WORKDIR /app

# 노드 환경 설정 - 메모리 제한 증가 및 프로덕션 모드 설정
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV NODE_ENV=production

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the app with Vite
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy the build output to nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config if needed
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]