# 1. Base image for dependencies & building
FROM node:20 AS deps
WORKDIR /app

# Install dependencies inside container (fresh linux node_modules)
COPY package*.json ./
RUN npm install

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate --schema=./prisma/schema.prisma

# Copy the full project
COPY . .

ENV NEXT_DISABLE_TURBOPACK=1
# Build the Next.js app
RUN npm run build


# 2. Final production image
FROM node:20 AS runner
WORKDIR /app

ENV NODE_ENV production

# Copy built artifacts & node_modules from builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/.next ./.next
COPY --from=deps /app/public ./public
COPY --from=deps /app/package*.json ./

EXPOSE 3000
CMD ["npm", "start"]
