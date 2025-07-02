# Stage 1: Build the frontend application using Node.js 20.12.0
FROM node:20.12.0-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy the project files into the container
COPY . .

# Install dependencies and build the project
RUN npm install && npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html/hotel
EXPOSE 80