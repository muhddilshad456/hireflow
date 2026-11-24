
# Stage 1: Build the application
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install all dependencies, including dev dependencies
RUN npm ci

# Copy application source code
COPY . .

# Compile TypeScript into JavaScript
RUN npm run build


# Stage 2: Production image
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

# Copy dependency files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy compiled JavaScript from builder
COPY --from=builder /app/dist ./dist

RUN mkdir -p logs

# Backend port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
