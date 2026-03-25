# Use official Node.js LTS image (alpine = lightweight)
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files first (for Docker layer caching)
COPY app/package*.json ./

# Install only production dependencies
RUN npm install 

# Copy rest of application code
COPY app/  .

# Expose application port
EXPOSE 3000

# Start the application
CMD ["node", "app.js"]

