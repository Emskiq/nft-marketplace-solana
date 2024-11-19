# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and yarn.lock
COPY package*.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy the rest of the application code
COPY . .

# Expose the frontend port (adjust if necessary)
EXPOSE 5173

# Start the frontend server
CMD ["yarn", "dev", "--host"]
