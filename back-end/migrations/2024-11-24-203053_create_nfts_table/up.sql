CREATE TABLE nfts (
    mint_address VARCHAR(255) PRIMARY KEY,
    owner_address VARCHAR(255) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    listed BOOLEAN NOT NULL DEFAULT FALSE
);

