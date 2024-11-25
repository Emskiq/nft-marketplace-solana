
# NFT Real Estate Marketplace

Welcome to the NFT Real Estate Marketplace project! This platform allows users to mint, list, and trade real estate assets tokenized as NFTs on the Solana blockchain.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Introduction to the Platform](#introduction-to-the-platform)
3. [Building Docker Images and Starting Containers](#building-docker-images-and-starting-containers)
4. [Manually Building and Running the Frontend and Backend](#manually-building-and-running-the-frontend-and-backend)
5. [Overview of Solana Programs](#overview-of-solana-programs)
6. [Running Anchor Tests](#running-anchor-tests)
7. [Project Structure Overview](#project-structure-overview)

---

## Prerequisites

Before you begin, ensure you have met the following requirements:

- **Docker**: Version 20.10 or higher is recommended. You can check your version with:

  ```bash
  docker --version
  ```

- **Rust**: Install Rust and Cargo from [rustup.rs](https://rustup.rs/).

- **Anchor**: Install Anchor CLI by following the [Anchor documentation](https://project-serum.github.io/anchor/getting-started/installation.html).

- **Yarn**: Ensure you have Yarn installed for managing frontend dependencies.

- **Solana CLI**: Install Solana CLI tools from the [official documentation](https://docs.solana.com/cli/install-solana-cli-tools).

- **PostgreSQL Port Availability**: Ensure that port `5432` (the default PostgreSQL port) is not being used by another database instance on your machine.

---

## Introduction to the Platform

The NFT Real Estate Marketplace is a decentralized application (dApp) built on the Solana blockchain. It allows users to:

- **Mint Real Estate NFTs**: Tokenize real estate properties as NFTs.
- **List NFTs for Sale**: Set a price and list your NFTs on the marketplace.
- **Buy NFTs**: Browse listed NFTs and purchase them directly from the marketplace.
- **View Owned NFTs**: Access a personalized profile to view all NFTs you own.

---

## Building Docker Images and Starting Containers

### 1. Check port `5432` and ensure no service is running on port 5432 (this is for our backend)

   ```sh
   sudo lsof -i -P -n | grep 5432
   ```
   To stop existing services:
   ```sh
   sudo service postgresql stop
   # or
   docker stop <container_id_using_5432>
   docker rm <container_id>
   ```

### 2. Build and Run the PostgreSQL Database Container

```bash
# Create a Docker network
docker network create nft_network

# Run the PostgreSQL container
docker run --name limeapi-db \
 --network limeapi-network \
 -e POSTGRES_USER=postgres \
 -e POSTGRES_PASSWORD=postgres \
 -e POSTGRES_DB=nft_db \
 -p 5432:5432 \
 -d postgres
```

### 3. Build and Run the Backend Container

```bash
# Navigate to the backend directory
cd backend

# Build the Docker image
docker build -t my_backend_image .

# Run the backend container
docker run -d \
  --name my_backend \
  --network nft_network \
  -e DATABASE_URL=postgres://postgres:postgres@my_postgres:5432/nft_db \
  -e API_PORT=5000 \
  -e FRONTEND_ORIGIN=http://localhost:5173
  -p 5000:5000 \
  my_backend_image

# Navigate back to the root directory
cd ..
```

### 4. Build and Run the Frontend Container

```bash
# Navigate to the frontend directory
cd frontend

# Build the Docker image
docker build -t my_frontend_image .

# Run the frontend container
docker run -d \
  --name my_frontend \
  --network nft_network \
  -p 5173:5173 \
  my_frontend_image

# Navigate back to the root directory
cd ..
```

### 5. Verify the Containers Are Running

```bash
docker ps
```

You should see `my_postgres`, `my_backend`, and `my_frontend` running.

### 6. Access the Application

Open your browser and navigate to `http://localhost:5173` to access the frontend application.

---

## Manually Building and Running the Frontend and Backend

If you prefer to run the frontend and backend without Docker, follow these steps:

### 1. Start the PostgreSQL Database Locally

Ensure you have PostgreSQL installed locally and running on port `5432`. Create a database named `nft_db`.

### 2. Running the Backend

```bash
# Navigate to the backend directory
cd backend

# Install dependencies (if any)
cargo build

# Set the DATABASE_URL environment variable
export DATABASE_URL=postgres://postgres:postgres@localhost:5432/nft_db

# Run database migrations (if using Diesel ORM)
diesel migration run

# Run the backend application
cargo run

# Navigate back to the root directory
cd ..
```

### 3. Running the Frontend

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
yarn install

# Start the frontend development server
yarn dev

# Navigate back to the root directory
cd ..
```

### 4. Access the Application

Open your browser and navigate to `http://localhost:5173` to access the frontend development server.

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

## Overview of Solana Programs

The backend consists of Solana programs (also known as smart contracts) written in Rust using the Anchor framework. The key functionalities include:

- **Minting NFTs**: Creates a new NFT on the Solana blockchain with associated metadata.

- **Listing NFTs**: Allows NFT owners to list their NFTs for sale by specifying a price.

- **Buying NFTs**: Enables users to purchase listed NFTs, transferring ownership and funds accordingly.

### Key Programs and Scripts

- **`mint`**: Mints a new NFT and assigns metadata.

- **`createMetadata`**: Creates metadata for the minted NFT, including title and URI.

- **`listNft`**: Lists an NFT for sale by creating a listing account with the specified price.

- **`buyNft`**: Facilitates the purchase of an NFT, handling token transfers and updating ownership.

---

## Running Anchor Tests

The project includes tests written using Anchor's testing framework. These tests cover minting, listing, and buying NFTs.

### Steps to Run Tests

1. **Navigate to the Program Directory**

```bash
cd programs/nft_marketplace
```

2. **Install Dependencies**

```bash
anchor build
```

3. **Run Tests**

```bash
anchor test
```

### Notes on Testing

- **Airdropping SOL**: You may encounter issues with airdropping SOL to test accounts. If so, you can uncomment the transfer code provided in the tests to transfer SOL from the provider's wallet instead.

- **Bad-Weather Testing**: The tests include scenarios where the program is expected to fail under certain conditions, ensuring robust error handling.

### Test Code Snippet

```typescript
// Transfer SOL to buyer from provider's wallet
const transferSolToBuyer = async () => {
  const amount = anchor.web3.LAMPORTS_PER_SOL * 1; // Adjust the amount as needed
  const tx = new anchor.web3.Transaction();
  tx.add(
    anchor.web3.SystemProgram.transfer({
      fromPubkey: provider.wallet.publicKey,
      toPubkey: buyerKeypair.publicKey,
      lamports: amount,
    })
  );
  await provider.sendAndConfirm(tx, [], { commitment: 'confirmed' });
};
// Uncomment the line below if airdrop doesn't work
// await transferSolToBuyer();

// Alternatively, use airdrop (may not work on localnet)
await airdrop(provider.connection, buyerKeypair.publicKey);
```

**Note**: If you face issues with the airdrop function not working, it's a common problem when running tests on `localnet`. Uncommenting the transfer code allows you to proceed with the tests by manually transferring SOL.

---

## Project Structure Overview

Here's a brief overview of the project's directory structure:

```
nft-real-estate-marketplace/
├── backend/
│   ├── Cargo.toml
│   ├── Cargo.lock
│   ├── Dockerfile
│   ├── src/
│   ├── migrations/
│   └── diesel.toml
├── frontend/
│   ├── package.json
│   ├── yarn.lock
│   ├── Dockerfile
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── pages/
│       │   └── ui/
│       ├── App.tsx
│       └── main.tsx
├── programs/
│   └── nft_marketplace/
│       ├── Cargo.toml
│       ├── src/
│       └── tests/
├── migrations/
│   └── init.sql
├── Anchor.toml
├── docker-compose.yml (if used)
└── README.md
```

### Directories Explained

- **backend/**: Contains the Rust backend application and Solana programs.

- **frontend/**: Contains the React frontend application.

- **programs/**: Includes Solana programs (smart contracts) written in Rust using Anchor.

- **migrations/**: SQL scripts for initializing the database with initial data.

- **docker-compose.yml**: (Optional) Contains Docker Compose configuration for orchestrating containers.

---

## Additional Information

- **Environment Variables**: Configure any necessary environment variables in `.env` files for both frontend and backend.

- **Logging and Monitoring**: Implement logging in your backend application to monitor and debug issues.

- **Security Considerations**: Ensure sensitive data like private keys and passwords are securely managed and not exposed in the codebase.

---

## Conclusion

This project provides a foundational platform for tokenizing real estate assets as NFTs on the Solana blockchain. By following the steps outlined above, you can set up, run, and test the application locally.

Feel free to contribute, raise issues, or suggest improvements!

---
