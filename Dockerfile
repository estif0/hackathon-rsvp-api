FROM node:22-alpine

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml prisma.config.ts ./
COPY prisma ./prisma/

ENV DATABASE_URL="postgresql://postgres:postgres@db:5432/hackathon_rsvp"

RUN pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm db:generate

COPY . .

EXPOSE 3000

CMD ["pnpm", "start"]
