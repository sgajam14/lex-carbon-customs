FROM node:20-alpine

WORKDIR /app

# Install production dependencies first for better layer caching
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# Ensure uploads directory exists for image storage
RUN mkdir -p /app/uploads/products

ENV NODE_ENV=production
EXPOSE 5001

CMD ["npm", "start"]
