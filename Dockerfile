# ------------------- Stage 1: Base Stage -------------------
    FROM node:22-alpine AS base

    WORKDIR /usr/src/app
    
    COPY package*.json ./
    RUN npm ci --only=production && npm cache clean --force
    
    # ------------------- Stage 2: Development Stage -------------------
    FROM base AS development
    
    RUN npm ci
    COPY . .
    EXPOSE 5000
    CMD ["npm", "run", "dev"]
    
    # ------------------- Stage 3: Builder Stage -------------------
    FROM base AS builder
    
    RUN npm ci
    COPY . .
    RUN npm run build
    
    # ------------------- Stage 4: Production Stage -------------------
    FROM node:22-alpine AS production
    
    # Install dumb-init for proper signal handling
    RUN apk add --no-cache dumb-init
    
    # Create app directory and user
    WORKDIR /usr/src/app
    RUN addgroup -g 1001 -S nodejs && \
        adduser -S nodejs -u 1001
    
    # Copy built application
    COPY --from=builder --chown=nodejs:nodejs /usr/src/app/package*.json ./
    RUN npm ci --omit=dev && npm cache clean --force && rm -rf /tmp/*
    COPY --from=builder --chown=nodejs:nodejs /usr/src/app/dist ./dist
    
    # Switch to non-root user
    USER nodejs
    
    EXPOSE 5000
    ENTRYPOINT ["dumb-init", "--"]
    CMD ["node", "dist/index.js"]
    