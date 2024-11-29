# NFT Real Estate Marketplace

Welcome to the **NFT Real Estate Marketplace** project! This platform allows users to mint, list, and trade real estate assets tokenized as NFTs on the Solana blockchain.

## Table of Contents

1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Setting up the Project](#setting-up-the-project)
    - [Building and Running with Docker Compose (easiest setup)](#building-and-running-with-docker-compose-(easiest-setup))
    - [Building and Running Each Docker Image Manually (easy)](#building-and-running-each-docker-image-manually-(easy))
    - [Manually Building and Running the Frontend and Backend](#manually-building-and-running-the-frontend-and-backend)
    - [How to Use the Platform](#how-to-use-the-platform)
4. [Project Structure Overview](#project-structure-overview)
5. [Overview of Solana Programs](#overview-of-solana-programs)
6. [Tests](#tests)
7. [Conclusion](#conclusion)

---

## Introduction

The NFT Real Estate Marketplace is a decentralized application (dApp) built on the Solana blockchain. It allows users to:

- **Mint Real Estate NFTs**: Tokenize real estate properties as NFTs.
- **List NFTs for Sale**: Set a price and list your NFTs on the marketplace.
- **Buy NFTs**: Browse listed NFTs and purchase them directly from the marketplace.
- **View Owned NFTs**: Access a personalized profile to view all NFTs you own.

---

## Prerequisites

Before you begin, ensure you have met the following requirements:

- **Docker**: Version 20.10 or higher is recommended. You can check your version with:

  ```bash
  docker --version
  ```

- **Docker Compose**: Usually included with Docker Desktop. Check your version with:

  ```bash
  docker-compose --version
  ```

- **Rust**: Install Rust and Cargo from [rustup.rs](https://rustup.rs/).

- **Anchor**: Install Anchor CLI by following the [Anchor documentation](https://project-serum.github.io/anchor/getting-started/installation.html).

- **Yarn**: Ensure you have Yarn installed for managing frontend dependencies.

  ```bash
  npm install --global yarn
  ```

- **Solana CLI**: Install Solana CLI tools from the [official documentation](https://docs.solana.com/cli/install-solana-cli-tools).

- **PostgreSQL Port Availability**: Ensure that port `5432` (the default PostgreSQL port) is **not** being used by another database instance on your machine.

---

## Setting up the Project

### Building and Running with Docker Compose (easiest setup)

#### 1. Check Port Availability

Ensure that port `5432` is free:

```bash
sudo lsof -i -P -n | grep 5432
```

If another service is using port `5432`, stop it:

```bash
# For system services
sudo service postgresql stop

# For Docker containers
docker stop <container_id_using_5432>
docker rm <container_id_using_5432>
```

#### 2. Build and Start the Services

Run the following command in the root directory:

```bash
docker compose up --build
```

This command will:

- Build the Docker images for the backend and frontend.
- Start the PostgreSQL database, backend, and frontend services.
- Use the specified Docker Compose configuration.

#### 3. Verify Services Are Running

In a separate terminal, run:

```bash
docker ps
```

You should see `nft_db`, `nft_backend`, and `nft_frontend` running.

#### 4. Access the Application

Open your browser and navigate to [http://localhost:5173](http://localhost:5173) to access the frontend application.

#### 5. Stopping the Services

To stop the services, press `CTRL + C` in the terminal where `docker compose` is running, then run:

```bash
docker compose down
```

---

### Building and Running Each Docker Image Manually (easy)

#### 1. Check Port Availability (same steps as above)

#### 2. Build and Run the PostgreSQL Database Container

```bash
# Create a Docker network
docker network create nft_network

# Run the PostgreSQL container
docker run --name nft_db \
  --network nft_network \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=nft_db \
  -p 5432:5432 \
  -d postgres
```

#### 3. Build and Run the Backend Container

```bash
# Navigate to the backend directory
cd back-end

# Build the Docker image
docker build -t nft_backend_image .

# Run the backend container
docker run -d \
  --name nft_backend \
  --network nft_network \
  -e DATABASE_URL=postgres://postgres:postgres@nft_db:5432/nft_db \
  -e API_PORT=5000 \
  -e FRONTEND_ORIGIN=http://localhost:5173 \
  -p 5000:5000 \
  nft_backend_image

# Navigate back to the root directory
cd ..
```

#### 4. Build and Run the Frontend Container

```bash
# Navigate to the frontend directory
cd front-end

# Build the Docker image
docker build -t nft_frontend_image .

# Run the frontend container
docker run -d \
  --name nft_frontend \
  --network nft_network \
  -p 5173:5173 \
  nft_frontend_image
```

#### 5. Verify the Containers Are Running

```bash
docker ps
```

You should see `nft_db`, `nft_backend`, and `nft_frontend` running.

#### 6. Access the Application

Open your browser and navigate to [http://localhost:5173](http://localhost:5173) to access the frontend application.

---

### Manually Building and Running the Frontend and Backend

If you prefer to run the frontend and backend without Docker, follow these steps:

#### 1. Start the PostgreSQL Database Locally

Ensure you have PostgreSQL installed locally and running on port `5432`. Create a database named `nft_db`.

#### 2. Running the Backend

```bash
# Navigate to the backend directory
cd back-end

# Install dependencies (if any)
cargo build

# Set the DATABASE_URL environment variable
export DATABASE_URL=postgres://postgres:postgres@localhost:5432/nft_db

# Run database migrations (if using Diesel ORM)
diesel migration run

# Run the backend application
cargo run

# The backend should now be running on http://localhost:5000
```

#### 3. Running the Frontend

```bash
# Navigate to the frontend directory
cd ../front-end

# Install dependencies
yarn install

# Start the frontend development server
yarn dev --host

# The frontend should now be running on http://localhost:5173
```

---

### How to Use the Platform

1. **Connect Your Wallet**: Click on the wallet button in the navbar to connect your Solana wallet.

2. **Mint an NFT**:

   - Navigate to the **Mint** page.
   - Provide the property title and metadata URI.
   - Click **Mint NFT**.

3. **List an NFT for Sale**:

   - Go to your **Profile** page to view your owned NFTs.
   - Select an NFT and click **List NFT**.
   - Set a price in SOL and confirm the listing.

4. **Buy an NFT**:

   - Browse the **Home** page to view listed NFTs.
   - Click on an NFT to view details.
   - Click **Buy NFT** and approve the transaction in your wallet.

---

## Project Structure Overview

Here's a brief overview of the project's directory structure:

```
nft-marketplace/
├── anchor/
│   ├── programs/
│   │   └── nft-marketplace/
│   │       └── src/
│   │           ├── errors.rs
│   │           ├── instructions/
│   │           │   ├── buy.rs
│   │           │   ├── list.rs
│   │           │   ├── metadata.rs
│   │           │   ├── mint.rs
│   │           │   └── mod.rs
│   │           ├── lib.rs
│   │           └── state.rs
│   └── tests/
├── back-end/
└── front-end/
```

### Directories Explained

- **`anchor/`**: Contains the NFT Marketplace Solana program (smart contract) written in Rust using Anchor.

  - **`errors.rs`**: Defines custom error types.

  - **`instructions/`**: Contains instruction handlers.

    - **`buy.rs`**: Logic for buying NFTs.

    - **`list.rs`**: Logic for listing NFTs.

    - **`metadata.rs`**: Logic for handling NFT metadata.

    - **`mint.rs`**: Logic for minting NFTs.

    - **`mod.rs`**: Module declarations.

  - **`lib.rs`**: Main library file—the entry point of our Solana program.

  - **`state.rs`**: Defines program accounts and state, saved for listed NFTs.

- **`back-end/`**: Contains the Rust backend application, essentially the server that stores the listed NFTs and interacts with the local database.

- **`front-end/`**: Contains the React frontend application.

---

## Overview of Solana Programs

The backend consists of Solana programs (smart contracts) written in Rust using the Anchor framework. The key functionalities include:

- **Minting NFTs**: Creates a new NFT on the Solana blockchain with associated metadata.

- **Listing NFTs**: Allows NFT owners to list their NFTs for sale by specifying a price.

- **Buying NFTs**: Enables users to purchase listed NFTs, transferring ownership and funds accordingly.

---

## Tests

The project includes tests written using Anchor's testing framework. These tests cover minting, listing, and buying NFTs, including both good-weather and bad-weather scenarios.

### Steps to Run Tests

#### 1. Navigate to the Anchor Directory

```bash
cd anchor
```

#### 2. Start Local Solana Test Validator with Metaplex Program

Run the following command:

```bash
solana-test-validator -r --bpf-program metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s tests/metaplex_token_metadata_program.so
```

- **Explanation**:

  - **`-r`**: Resets the ledger.

  - **`--bpf-program`**: Loads the Metaplex Token Metadata program required for NFT functionality.

#### 3. Fund the Localnet Account (the one in `localnet-payer.json`)

In a new terminal, run:

```bash
solana airdrop 6969 DupZuZ4GKKDnzxbg7hTBexE4RzEFaBWL4Sod2R1daKhp --url http://localhost:8899
```

The public key above is the one from the `localnet-payer.json` file.

#### 4. Run the Tests

Run:

```bash
anchor test --skip-local-validator
```

Or, if you prefer to just run the tests (after successfully executing `anchor build` and `anchor deploy`):

```bash
anchor run test -- --skip-local-validator
```

---

## Conclusion

This project provides a foundational platform for tokenizing real estate assets as NFTs on the Solana blockchain. By following the steps outlined above, you can set up, run, and test the application locally using Docker Compose or manual setup.

Feel free to contribute, raise issues, or suggest improvements!

---

**Note:** Ensure all dependencies are correctly installed, and environment variables are properly set before running the application or tests. Always refer to the official documentation for detailed setup instructions for tools like Docker, Rust, Anchor, and Solana CLI.
