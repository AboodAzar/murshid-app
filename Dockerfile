FROM node:20-slim

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files and patches
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# Install dependencies using pnpm
RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY . .

# Build the frontend and backend
RUN pnpm run build

# Start the application
EXPOSE 3000
CMD ["pnpm", "run", "start"]
