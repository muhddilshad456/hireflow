
# Stage 1: Build the React application
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy frontend source code
COPY . .

# Frontend environment variables (provided during build)
ARG VITE_API_BASE_URL
ARG VITE_API_FRONTEND_URL
ARG VITE_P_API_BASE_URL
ARG VITE_SOCKET_URL

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_API_FRONTEND_URL=$VITE_API_FRONTEND_URL
ENV VITE_P_API_BASE_URL=$VITE_P_API_BASE_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

# Build the React application
RUN npm run build


# Stage 2: Serve the application using Nginx
FROM nginx:alpine AS production

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built frontend files
COPY --from=builder /app/dist /usr/share/nginx/html

# Frontend port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
