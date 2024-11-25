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

    it("Mint and assign metadata", async () => {
        // Derive the mint address and the associated token account address
        const mintKeypair: anchor.web3.Keypair = anchor.web3.Keypair.generate();
        const tokenAddress = await anchor.utils.token.associatedAddress({
            mint: mintKeypair.publicKey,
            owner: wallet.publicKey
        });
        console.log(`New token: ${mintKeypair.publicKey}`);

        // Derive the metadata address
        const metadataAddress = (await anchor.web3.PublicKey.findProgramAddress(
            [
                Buffer.from("metadata"),
                TOKEN_METADATA_PROGRAM_ID.toBuffer(),
                mintKeypair.publicKey.toBuffer(),
            ],
            TOKEN_METADATA_PROGRAM_ID
        ))[0];
        console.log("Metadata initialized");


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
        console.log("Master edition metadata initialized");

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
            // assert.strictEqual(mintKeypair.publicKey, event.data.mint);
            // assert.strictEqual(wallet.publicKey, event.data.owner);
        }
        assert.isTrue(logsEmitted);

        const txMetadata = await provider.connection.getParsedTransaction(tx_sig_metadata, "confirmed")
        const eventParserMetadata = new anchor.EventParser(program.programId, new anchor.BorshCoder(program.idl));
        const eventsMetadata = eventParserMetadata.parseLogs(txMetadata.meta.logMessages);

        logsEmitted = false
        for (let event of eventsMetadata) {
            logsEmitted = true;
            // assert.strictEqual(mintKeypair.publicKey, event.data.mint);
        }
        assert.isTrue(logsEmitted);
    });

    
    it("List and sell", async () => {
        // **Setup**

        // Create seller and buyer keypairs and wallets
        const sellerKeypair = wallet.payer;
        const buyerKeypair = anchor.web3.Keypair.generate();

        // Transfer SOL to buyer from provider's wallet
        // const transferSolToBuyer = async () => {
        //     const amount = anchor.web3.LAMPORTS_PER_SOL * 0.005; // Adjust the amount as needed
        //     const tx = new anchor.web3.Transaction();
        //     tx.add(
        //         anchor.web3.SystemProgram.transfer({
        //             fromPubkey: provider.wallet.publicKey,
        //             toPubkey: buyerKeypair.publicKey,
        //             lamports: amount,
        //         })
        //     );
        //     await provider.sendAndConfirm(tx, [], { commitment: 'confirmed' });
        // };
        // await transferSolToBuyer();

        // Airdrop SOL to seller and buyer (wasn't working for me...)
        await airdrop(provider.connection, sellerKeypair.publicKey)
        await airdrop(provider.connection, buyerKeypair.publicKey);

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

        const txMint = await provider.connection.getParsedTransaction(tx_sig_mint, "confirmed")

        // **List NFT**

        // Define the listing price (e.g., 0.5 SOL)
        const priceInLamports = new anchor.BN(anchor.web3.LAMPORTS_PER_SOL * 0.0025);

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

        await program.methods.listNft(priceInLamports)
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
        // TODO: Check events

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
        const buyerTokenAccountInfo = await anchor.utils.token.getAccount(
            buyerProvider.connection,
            buyerTokenAccount
        );

        assert.strictEqual(buyerTokenAccountInfo.amount.toNumber(), 1, "Buyer should have 1 NFT");

        // Verify that the seller received the payment
        const sellerFinalBalance = await provider.connection.getBalance(sellerKeypair.publicKey);
        const expectedSellerBalance = sellerInitialBalance + priceInLamports.toNumber();
        assert.strictEqual(
            sellerFinalBalance,
            expectedSellerBalance,
            "Seller should receive the sale amount"
        );

        console.log("Seller initial balance:", sellerInitialBalance / anchor.web3.LAMPORTS_PER_SOL, "SOL");
        console.log("Seller final balance:", sellerFinalBalance / anchor.web3.LAMPORTS_PER_SOL, "SOL");

        // Optionally, verify that the NFT account is closed
        try {
            await sellerProgram.account.nft.fetch(nftAccountPda);
            assert.fail("NFT account should be closed after sale");
        } catch (err) {
            // Expected behavior: account does not exist
            assert.ok("NFT account is closed after sale");
        }
    });

});

async function airdrop(connection: any, address: any, amount = 1000000000) {
    await connection.confirmTransaction(await connection.requestAirdrop(address, amount), "confirmed");
}
