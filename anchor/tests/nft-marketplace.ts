import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { ComputeBudgetProgram } from '@solana/web3.js';
import { NftMarketplace } from "../target/types/nft_marketplace";
import { assert } from "chai";

describe("test", () => {
    // Configure the client to use the local cluster.
    const testNftTitle = "EMSKIQQQ";
    const testNftSymbol = "EMO";
    const testNftUri = "https://raw.githubusercontent.com/Emskiq/solana-intro/refs/heads/master/nfts/assets/example.json";

    const provider = anchor.AnchorProvider.env();
    const wallet = provider.wallet as anchor.Wallet;

    anchor.setProvider(provider);

    const program = anchor.workspace.NftMarketplace as Program<NftMarketplace>;

    const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
        "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
    );

    const computeBudgetIx = ComputeBudgetProgram.setComputeUnitLimit({ units: 1_400_000 });

    it("Mint!", async () => {
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
            assert.strictEqual(mintKeypair.publicKey, event.data.mint);
            assert.strictEqual(wallet.publicKey, event.data.owner);
        }
        assert.isTrue(logsEmitted);

        const txMetadata = await provider.connection.getParsedTransaction(tx_sig_metadata, "confirmed")
        const eventParserMetadata = new anchor.EventParser(program.programId, new anchor.BorshCoder(program.idl));
        const eventsMetadata = eventParserMetadata.parseLogs(txMetadata.meta.logMessages);

        logsEmitted = false
        for (let event of eventsMetadata) {
            logsEmitted = true;
            assert.strictEqual(mintKeypair.publicKey, event.data.mint);
        }
        assert.isTrue(logsEmitted);

    });
});

