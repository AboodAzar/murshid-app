FROM node:20-slim

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy source code
COPY . .

# Build the frontend and backend
RUN npm run build

# Start the application
EXPOSE 3000
CMD ["npm", "run", "start"]
