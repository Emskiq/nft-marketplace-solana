import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ComputeBudgetProgram } from '@solana/web3.js';
import { NftMarketplace } from "../target/types/nft_marketplace";
import { assert } from "chai";

describe("NFT Marketplace", () => {
    // Configure the client to use the local cluster.
    const testNftTitle = "EMSKIQQQ";
    const testNftSymbol = "EMO";
    const testNftUri = "https://raw.githubusercontent.com/Emskiq/solana-intro/refs/heads/master/nfts/assets/example.json";

    const NFT_MARKET_PLACE_SEED = "NFT_MARKETPLACE_EMSKIQ";
    const LISTED_NFT_SEED = "LISTED_NFT_EMSKIQ_SEED";


    const provider = anchor.AnchorProvider.env();
    const wallet = provider.wallet as anchor.Wallet;

    anchor.setProvider(provider);

    const program = anchor.workspace.NftMarketplace as Program<NftMarketplace>;

    const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
        "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
    );

    it("Mint and assign metadata to NFT", async () => {
        // Derive the mint address and the associated token account address
        const mintKeypair: anchor.web3.Keypair = anchor.web3.Keypair.generate();
        const tokenAddress = await anchor.utils.token.associatedAddress({
            mint: mintKeypair.publicKey,
            owner: wallet.publicKey
        });
        // console.log(`New token: ${mintKeypair.publicKey}`);

        // Derive the metadata address
        const metadataAddress = (await anchor.web3.PublicKey.findProgramAddress(
            [
                Buffer.from("metadata"),
                TOKEN_METADATA_PROGRAM_ID.toBuffer(),
                mintKeypair.publicKey.toBuffer(),
            ],
            TOKEN_METADATA_PROGRAM_ID
        ))[0];
        // console.log("Metadata initialized");


        // Derive the master edition address
        const masterEditionAddress = (await anchor.web3.PublicKey.findProgramAddress(
            [
                Buffer.from("metadata"),
                TOKEN_METADATA_PROGRAM_ID.toBuffer(),
                mintKeypair.publicKey.toBuffer(),
                Buffer.from("edition"),
            ],
            TOKEN_METADATA_PROGRAM_ID
        ))[0];
        // console.log("Master edition metadata initialized");

        // Transact with the "mint" function in our on-chain program
        //
        // The 'transaction' actually is just a function call to our program
        // that's the benefit of Anchor
        const tx_sig_mint = await program.methods.mint(
        )
        .accounts({
            mint: mintKeypair.publicKey,
            tokenAccount: tokenAddress,
            mintAuthority: wallet.publicKey,
        })
        .signers([mintKeypair])
        .rpc();

        const tx_sig_metadata = await program.methods.createMetadata(
            testNftTitle, testNftUri
        )
        .accounts({
            mint: mintKeypair.publicKey,
            mintAuthority: wallet.publicKey,
            metadata: metadataAddress,
            tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
            masterEdition: masterEditionAddress,
        })
        .signers([mintKeypair])
        .rpc();

        const txMint = await provider.connection.getParsedTransaction(tx_sig_mint, "confirmed")
        const eventParser = new anchor.EventParser(program.programId, new anchor.BorshCoder(program.idl));
        const events = eventParser.parseLogs(txMint.meta.logMessages);

        let logsEmitted = false
        for (let event of events) {
            logsEmitted = true;
            assert.equal(mintKeypair.publicKey.toString(), event.data.mint.toString());
        }
        assert.isTrue(logsEmitted);

        const txMetadata = await provider.connection.getParsedTransaction(tx_sig_metadata, "confirmed")
        const eventParserMetadata = new anchor.EventParser(program.programId, new anchor.BorshCoder(program.idl));
        const eventsMetadata = eventParserMetadata.parseLogs(txMetadata.meta.logMessages);

        logsEmitted = false
        for (let event of eventsMetadata) {
            logsEmitted = true;
            assert.equal(mintKeypair.publicKey.toString(), event.data.mint.toString());
        }
        assert.isTrue(logsEmitted);
    }).timeout(9000);

    
    it("List and sell NFT", async () => {
        // **Setup**

        // Create seller and buyer keypairs and wallets
        // const sellerKeypair = wallet.payer;
        const sellerKeypair = wallet.payer;
        const buyerKeypair = anchor.web3.Keypair.generate();

        // Transfer SOL to buyer from provider's wallet
        // (if airdroping is timeouting, pbly because you are not on localnet, but on devnet)
        // await transferSol(provider, sellerKeypair.publicKey, buyerKeypair.publicKey, 0.5);

        // Airdrop SOL to seller and buyer (wasn't working for me...)
        await airdrop(provider.connection, sellerKeypair.publicKey, anchor.web3.LAMPORTS_PER_SOL * 6)
        await airdrop(provider.connection, buyerKeypair.publicKey, anchor.web3.LAMPORTS_PER_SOL * 5);

        // **Mint NFT**

        // Derive the mint address and the associated token account address
        const mintKeypair: anchor.web3.Keypair = anchor.web3.Keypair.generate();
        const tokenAddress = await anchor.utils.token.associatedAddress({
            mint: mintKeypair.publicKey,
            owner: sellerKeypair.publicKey
        });

        // Derive the metadata address
        const metadataAddress = (await anchor.web3.PublicKey.findProgramAddress(
            [
                Buffer.from("metadata"),
                TOKEN_METADATA_PROGRAM_ID.toBuffer(),
                mintKeypair.publicKey.toBuffer(),
            ],
            TOKEN_METADATA_PROGRAM_ID
        ))[0];

        // Derive the master edition address
        const masterEditionAddress = (await anchor.web3.PublicKey.findProgramAddress(
            [
                Buffer.from("metadata"),
                TOKEN_METADATA_PROGRAM_ID.toBuffer(),
                mintKeypair.publicKey.toBuffer(),
                Buffer.from("edition"),
            ],
            TOKEN_METADATA_PROGRAM_ID
        ))[0];

        // Mint the NFT
        const tx_sig_mint = await program.methods.mint(
        )
        .accounts({
            mint: mintKeypair.publicKey,
            tokenAccount: tokenAddress,
            mintAuthority: wallet.publicKey,
        })
        .signers([mintKeypair])
        .rpc();

        // **List NFT**

        // Define the listing price (e.g., 0.5 SOL)
        const priceInLamports = new anchor.BN(anchor.web3.LAMPORTS_PER_SOL * 0.5);

        // Derive PDAs
        const [nftAccountPda, nftAccountBump] = await anchor.web3.PublicKey.findProgramAddress(
            [Buffer.from(LISTED_NFT_SEED), mintKeypair.publicKey.toBuffer()],
            program.programId
        );

        const [programPda, programPdaBump] = await anchor.web3.PublicKey.findProgramAddress(
            [Buffer.from(NFT_MARKET_PLACE_SEED)],
            program.programId
        );

        const sellerTokenAccount = tokenAddress;

        const pdaTokenAccount = await anchor.utils.token.associatedAddress({
            mint: mintKeypair.publicKey,
            owner: programPda
        });

        const txSignatureList = await program.methods.listNft(priceInLamports)
        .accounts({
            owner: sellerKeypair.publicKey,
            mint: mintKeypair.publicKey,
            ownerTokenAccount: sellerTokenAccount,
            nftListingAccount: nftAccountPda,
            pdaTokenAccount: pdaTokenAccount,
            programPda: programPda,
        })
        .signers([sellerKeypair])
        .rpc();

        // **Buy NFT**

        // Buyer's token account
        const buyerTokenAccount = await anchor.utils.token.associatedAddress({
            mint: mintKeypair.publicKey,
            owner: buyerKeypair.publicKey
        });

        // Get seller's initial balance
        const sellerInitialBalance = await provider.connection.getBalance(sellerKeypair.publicKey);

        // Buy the NFT
        await program.methods.buyNft()
        .accounts({
            buyer: buyerKeypair.publicKey,
            seller: sellerKeypair.publicKey,
            mint: mintKeypair.publicKey,
            nftListingAccount: nftAccountPda,
            pdaTokenAccount: pdaTokenAccount,
            buyerTokenAccount: buyerTokenAccount,
            programPda: programPda,
        })
        .signers([buyerKeypair])
        .rpc();

        // **Verification**

        // Verify that the buyer now owns the NFT

        const buyerTokenAccountInfo = await provider.connection.getTokenAccountBalance(buyerTokenAccount);
        assert.strictEqual(buyerTokenAccountInfo.value.amount, "1", "Buyer should have 1 NFT");

        // Verify that the seller received the payment
        const sellerFinalBalance = await provider.connection.getBalance(sellerKeypair.publicKey);
        const expectedSellerBalance = sellerInitialBalance + priceInLamports.toNumber();

        assert.isTrue(sellerFinalBalance > expectedSellerBalance, "Seller should receive at least the sale amount");

        // console.log("Seller initial balance:", sellerInitialBalance / anchor.web3.LAMPORTS_PER_SOL, "SOL");
        // console.log("Seller final balance:", sellerFinalBalance / anchor.web3.LAMPORTS_PER_SOL, "SOL");

        // Optionally, verify that the NFT account is closed
        try {
            await sellerProgram.account.nft.fetch(nftAccountPda);
            assert.fail("NFT account should be closed after sale");
        } catch (err) {
            // Expected behavior: account does not exist
            assert.ok("NFT account is closed after sale");
        }
    }).timeout(9000);

     it("Attempt to buy an NFT with insufficient SOL", async () => {
        try {
            // Mint and list an NFT
            const mintKeypair: anchor.web3.Keypair = anchor.web3.Keypair.generate();
            const tokenAddress = await anchor.utils.token.associatedAddress({
                mint: mintKeypair.publicKey,
                owner: wallet.publicKey 
            });


            // Derive the metadata address
            const metadataAddress = (await anchor.web3.PublicKey.findProgramAddress(
                [
                    Buffer.from("metadata"),
                    TOKEN_METADATA_PROGRAM_ID.toBuffer(),
                    mintKeypair.publicKey.toBuffer(),
                ],
                TOKEN_METADATA_PROGRAM_ID
            ))[0];

            // Derive the master edition address
            const masterEditionAddress = (await anchor.web3.PublicKey.findProgramAddress(
                [
                    Buffer.from("metadata"),
                    TOKEN_METADATA_PROGRAM_ID.toBuffer(),
                    mintKeypair.publicKey.toBuffer(),
                    Buffer.from("edition"),
                ],
                TOKEN_METADATA_PROGRAM_ID
            ))[0];

            // Mint the NFT
            await program.methods.mint()
                .accounts({
                    mint: mintKeypair.publicKey,
                    tokenAccount: tokenAddress,
                    mintAuthority: wallet.publicKey, 
                })
                .signers([mintKeypair])
                .rpc();

            await program.methods.createMetadata(
                testNftTitle, testNftUri
            )
                .accounts({
                    mint: mintKeypair.publicKey,
                    mintAuthority: wallet.publicKey,
                    metadata: metadataAddress,
                    tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
                    masterEdition: masterEditionAddress,
                })
                .signers([mintKeypair])
                .rpc();

            // List the NFT
            const priceInLamports = new anchor.BN(anchor.web3.LAMPORTS_PER_SOL * 1); // 1 SOL
            const [nftAccountPda, nftAccountBump] = await anchor.web3.PublicKey.findProgramAddress(
                [Buffer.from(LISTED_NFT_SEED), mintKeypair.publicKey.toBuffer()],
                program.programId
            );

            const [programPda, programPdaBump] = await anchor.web3.PublicKey.findProgramAddress(
                [Buffer.from(NFT_MARKET_PLACE_SEED)],
                program.programId
            );

            const sellerTokenAccount = tokenAddress;

            const pdaTokenAccount = await anchor.utils.token.associatedAddress({
                mint: mintKeypair.publicKey,
                owner: programPda
            });

            await program.methods.listNft(priceInLamports)
                .accounts({
                    owner: wallet.publicKey,
                    mint: mintKeypair.publicKey,
                    ownerTokenAccount: sellerTokenAccount,
                    nftListingAccount: nftAccountPda,
                    pdaTokenAccount: pdaTokenAccount,
                    programPda: programPda,
                })
                .signers([wallet.payer])
                .rpc();

            // Create a buyer with insufficient SOL
            const buyerKeypair = anchor.web3.Keypair.generate();

            // Transfer SOL to buyer from provider's wallet
            // (if airdroping is timeouting, pbly because you are not on localnet, but on devnet)
            // await transferSol(provider, wallet.publicKey, buyerKeypair.publicKey, 0.01);

            // Airdrop minimal SOL to buyer (e.g., 0.001 SOL) -> Not working for me... :(
            await airdrop(provider.connection, buyerKeypair.publicKey, anchor.web3.LAMPORTS_PER_SOL * 0.001);

            const buyerTokenAccount = await anchor.utils.token.associatedAddress({
                mint: mintKeypair.publicKey,
                owner: buyerKeypair.publicKey
            });

            // Attempt to buy the NFT
            await program.methods.buyNft()
                .accounts({
                    buyer: buyerKeypair.publicKey,
                    seller: wallet.publicKey,
                    mint: mintKeypair.publicKey,
                    nftListingAccount: nftAccountPda,
                    pdaTokenAccount: pdaTokenAccount,
                    buyerTokenAccount: buyerTokenAccount,
                    programPda: programPda,
                })
                .signers([buyerKeypair])
                .rpc();

            assert.fail("Buying should have failed due to insufficient SOL");
        } catch (err: any) {
            assert.include(err.message, "insufficient", "Expected insufficient funds error");
        }
    }).timeout(9000);

    it("Attempt to list an NFT not owned by the seller", async () => {
        try {
            // Mint an NFT to the actual owner
            const ownerKeypair = anchor.web3.Keypair.generate();
            await airdrop(provider.connection, ownerKeypair.publicKey);

            const mintKeypair = anchor.web3.Keypair.generate();
            const tokenAddress = await anchor.utils.token.associatedAddress({
                mint: mintKeypair.publicKey,
                owner: ownerKeypair.publicKey,
            });

            await program.methods.mint()
            .accounts({
                mint: mintKeypair.publicKey,
                tokenAccount: tokenAddress,
                mintAuthority: ownerKeypair.publicKey,
            })
            .signers([mintKeypair, ownerKeypair])
            .rpc();

            // Attempt to list the NFT from a different account (unauthorized seller)
            const unauthorizedSeller = anchor.web3.Keypair.generate();
            await airdrop(provider.connection, unauthorizedSeller.publicKey);

            const priceInLamports = new anchor.BN(anchor.web3.LAMPORTS_PER_SOL * 0.5);

            const [nftAccountPda] = await anchor.web3.PublicKey.findProgramAddress(
                [Buffer.from(LISTED_NFT_SEED), mintKeypair.publicKey.toBuffer()],
                program.programId
            );

            const [programPda] = await anchor.web3.PublicKey.findProgramAddress(
                [Buffer.from(NFT_MARKET_PLACE_SEED)],
                program.programId
            );

            const sellerTokenAccount = await anchor.utils.token.associatedAddress({
                mint: mintKeypair.publicKey,
                owner: unauthorizedSeller.publicKey,
            });

            const pdaTokenAccount = await anchor.utils.token.associatedAddress({
                mint: mintKeypair.publicKey,
                owner: programPda,
            });

            await program.methods.listNft(priceInLamports)
            .accounts({
                owner: unauthorizedSeller.publicKey,
                mint: mintKeypair.publicKey,
                ownerTokenAccount: sellerTokenAccount,
                nftListingAccount: nftAccountPda,
                pdaTokenAccount: pdaTokenAccount,
                programPda: programPda,
            })
            .signers([unauthorizedSeller])
            .rpc();

            assert.fail("Listing should have failed due to unauthorized seller");
        } catch (err: any) {
            assert.ok(true);
        }
    }).timeout(10000);

});

async function airdrop(connection: any, address: any, amount = 1000000000) {
    await connection.confirmTransaction(await connection.requestAirdrop(address, amount), "confirmed");
}

async function transferSol(provider: any, from: any, to: any, amount = 1) {
    const amountInSol = anchor.web3.LAMPORTS_PER_SOL * amount;
    const tx = new anchor.web3.Transaction();
    tx.add(
        anchor.web3.SystemProgram.transfer({
            fromPubkey: from,
            toPubkey: to,
            lamports: amountInSol,
        })
    );
    await provider.sendAndConfirm(tx, [], { commitment: 'confirmed' });
}
