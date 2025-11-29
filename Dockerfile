FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate database types and build
RUN pnpm build

# Expose port 4000
EXPOSE 4000

# Start the application
CMD ["node", "build"]