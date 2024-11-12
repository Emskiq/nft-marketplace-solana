use crate::models::{NewNft, Nft};
use actix_web::{post, get, options, web, HttpResponse, Responder};
use sqlx::PgPool;

#[post("/mint-nft")]
pub async fn create_nft(pool: web::Data<PgPool>, item: web::Json<NewNft>) -> impl Responder {
    println!(
        "Received request to insert NFT into our database: {}",
        item.mint_address
    );

    let result = sqlx::query_as!(
        Nft,
        r#"
        INSERT INTO nfts (mint_address, owner_address, price)
        VALUES ($1, $2, $3)
        RETURNING id, mint_address, owner_address, price
        "#,
        item.mint_address,
        item.owner_address,
        item.price
    )
    .fetch_one(pool.get_ref())
    .await;

    match result {
        Ok(nft) => HttpResponse::Ok().json(nft),
        Err(err) => {
            println!("Database error: {:?}", err);
            HttpResponse::InternalServerError().json("Error inserting NFT")
        }
    }
}

#[options("/mint-nft")]
pub async fn options_create_nft() -> impl Responder {
    HttpResponse::Ok()
}

#[get("/get-nfts")]
pub async fn get_nfts(pool: web::Data<PgPool>) -> impl Responder {
    let result = sqlx::query_as!(
        Nft,
        r#"
        SELECT id, mint_address, owner_address, price
        FROM nfts
        ORDER BY id DESC
        "#
    )
    .fetch_all(pool.get_ref())
    .await;

    match result {
        Ok(nfts) => HttpResponse::Ok().json(nfts),
        Err(err) => {
            println!("Database error: {:?}", err);
            HttpResponse::InternalServerError().json("Error fetching NFTs")
        }
    }
}

#[options("/get-nfts")]
pub async fn options_get_nfts() -> impl Responder {
    HttpResponse::Ok()
}

#[get("/get-nft/{id}")]
pub async fn get_nft(pool: web::Data<PgPool>, id: web::Path<i32>) -> impl Responder {
    let nft_id = id.into_inner();

    let result = sqlx::query_as!(
        Nft,
        r#"
        SELECT id, mint_address, owner_address, price
        FROM nfts
        WHERE id = $1
        "#,
        nft_id
    )
    .fetch_one(pool.get_ref())
    .await;

    match result {
        Ok(nft) => HttpResponse::Ok().json(nft),
        Err(err) => {
            println!("Database error: {:?}", err);
            HttpResponse::InternalServerError().json("Error fetching NFT")
        }
    }
}

// TODO: Pbly will add also get-nfts-by-owner
