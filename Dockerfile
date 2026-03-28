FROM node:24-alpine

WORKDIR /app

COPY package.json ./
COPY apps ./apps
COPY services ./services
COPY packages ./packages
COPY scripts ./scripts
COPY README.md ./

RUN mkdir -p /app/data

ENV PORT=8080
ENV DATA_FILE_PATH=/app/data/db.json
ENV LOG_REQUESTS=true

EXPOSE 8080

CMD ["npm", "run", "start:prod"]
