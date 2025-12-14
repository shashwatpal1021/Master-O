# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /usr/src/app

# Install build dependencies
RUN apk add --no-cache --update python3 make g++

# Copy package files first for better caching
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of the application
COPY . .

# Production stage
FROM node:20-alpine

WORKDIR /usr/src/app

# Install production dependencies only
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install --only=production

# Copy built assets from builder
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /usr/src/app/node_modules/.bin ./node_modules/.bin
COPY --from=builder /usr/src/app/node_modules/@prisma ./node_modules/@prisma

# Copy application code
COPY . .

# Expose the port the app runs on
EXPOSE 4000

# Command to run the application
CMD ["sh", "-c", "node scripts/create-admin.js && node server.js"]
