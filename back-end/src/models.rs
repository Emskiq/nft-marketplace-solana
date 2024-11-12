// src/models.rs
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use bigdecimal::BigDecimal;

#[derive(Serialize, Deserialize, FromRow)]
pub struct Nft {
    pub id: i32,
    pub mint_address: String,
    pub owner_address: String,
    pub price: BigDecimal,
}

#[derive(Serialize, Deserialize)]
pub struct NewNft {
    pub mint_address: String,
    pub owner_address: String,
    pub price: BigDecimal,
}