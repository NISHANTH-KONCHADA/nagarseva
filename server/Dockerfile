# Use the official Node.js 20 image
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the TypeScript code
RUN npm run build

# Expose port (Cloud Run expects 8080 by default, but we can configure it)
EXPOSE 5000

# Set environment variable for port
ENV PORT=5000

# Run the app
CMD ["npm", "start"]
