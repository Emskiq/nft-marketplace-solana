use diesel::prelude::*;
use diesel::deserialize::Queryable;

use serde::{Deserialize, Serialize};
use crate::schema::nfts;
use bigdecimal::BigDecimal;

#[derive(AsChangeset, Queryable, Insertable, Selectable, Serialize, Deserialize, Debug, Clone)]
#[diesel(table_name = nfts)]
pub struct Nft {
    pub mint_address: String,
    pub owner_address: String,
    pub price: BigDecimal,
    pub listed: bool,
}
