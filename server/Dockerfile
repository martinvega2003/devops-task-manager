# Lightweight official Node.js image
FROM node:18-alpine

# Set the working directory inside the container (Docker creates it if there is no /app directory)
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app uses
EXPOSE 5001

# Define the environment variable
ENV NODE_ENV=development

# Command to run the application
CMD ["npm", "start"]

