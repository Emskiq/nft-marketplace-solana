# Stage 1: Build the application
FROM rust:1.82 AS builder

WORKDIR /usr/src/app

# Copy the Cargo.toml and Cargo.lock files
COPY Cargo.toml Cargo.lock ./

# Create a dummy main.rs to build dependencies
RUN mkdir src && echo "fn main() {}" > src/main.rs

# Build dependencies
RUN cargo build --release && rm -rf src/target/release/deps/back_end*

# Copy the source code
COPY src ./src

# Build the application
RUN cargo build --release

# Stage 2: Create the runtime image
FROM debian:buster-slim

# Install required system dependencies
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# Copy the compiled binary from the builder stage
COPY --from=builder /usr/src/app/target/release/back-end .

# Expose the backend port
EXPOSE 5000

# Set the command to run the application
CMD ["./back-end"]

