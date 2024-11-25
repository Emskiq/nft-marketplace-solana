# Use the official Rust image as the base for building
FROM rust:latest AS build

# Create a new directory for the app
WORKDIR /app

# Copy the source code
# Copy the Cargo.toml and Cargo.lock to leverage Docker cache
COPY Cargo.toml Cargo.lock ./

# Copy the source code
COPY src ./src

# Copy migrations and diesel configuration
COPY migrations ./migrations
COPY diesel.toml .

# Install dependencies and build the application
RUN apt-get update && \
    apt-get install -y libpq-dev && \
    cargo install diesel_cli --no-default-features --features postgres && \
    cargo build --release

# Use a Rust base image
FROM rust:latest

# Copy the built binary from the builder stage
COPY --from=build /app/target/release/back-end /usr/local/bin/back-end

# Set environment variables (these can be overridden at runtime)
ENV API_PORT=${API_PORT}
ENV DATABASE_URL=${DATABASE_URL}
ENV FRONTEND_ORIGIN=${FRONTEND_ORIGIN}

# Expose the port the server runs on
EXPOSE 5000

# Set the entrypoint
CMD ["back-end"]
