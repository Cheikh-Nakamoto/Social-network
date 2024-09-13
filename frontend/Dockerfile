# Use a newer Node.js version
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy project files
COPY . .

# Run Angular with the proxy configuration
CMD ["npm", "run", "start", "--"]

# Expose the application port
EXPOSE 4200
