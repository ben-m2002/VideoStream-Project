# Use an official Node runtime as a parent image
FROM node:18 AS Builder

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY package*.json ./

# Install any needed packages specified in package.json
RUN npm install


# Install ffmpeg
RUN apt-get update && apt-get install -y ffmpeg

#Copy the rest of the app
COPY . .

# Build the app
RUN npm run build

#Stage 2: Production stage
FROM node:18

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY package*.json ./

RUN npm install --only=production

# Install ffmpeg
RUN apt-get update && apt-get install -y ffmpeg

COPY --from=0 /app/dist ./dist

EXPOSE 3000

CMD ["npm", "run", "serve"]
