# SIGEO v2 Backend - Isolado da v1 para integridade
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "backend-server.js"]
