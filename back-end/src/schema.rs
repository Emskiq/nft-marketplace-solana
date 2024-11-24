// @generated automatically by Diesel CLI.

diesel::table! {
    nfts (mint_address) {
        #[max_length = 255]
        mint_address -> Varchar,
        #[max_length = 255]
        owner_address -> Varchar,
        price -> Numeric,
        listed -> Bool,
    }
}
