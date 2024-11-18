use crate::models::{NewNft, Nft};
use actix_web::{post, get, web, HttpResponse, Responder};
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
        INSERT INTO nfts (mint_address, owner_address, price, listed)
        VALUES ($1, $2, $3, false)
        RETURNING id, mint_address, owner_address, price, listed
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

#[get("/get-nfts")]
pub async fn get_nfts(pool: web::Data<PgPool>) -> impl Responder {
    let result = sqlx::query_as!(
        Nft,
        r#"
        SELECT id, mint_address, owner_address, price, listed
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

#[get("/get-nft/{id}")]
pub async fn get_nft(pool: web::Data<PgPool>, id: web::Path<i32>) -> impl Responder {
    let nft_id = id.into_inner();

    let result = sqlx::query_as!(
        Nft,
        r#"
        SELECT id, mint_address, owner_address, price, listed
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

#[get("/get-nfts/{address}")]
pub async fn get_nfts_for_user(pool: web::Data<PgPool>, address: web::Path<String>) -> impl Responder {
    let owner_address = address.into_inner();

    let result = sqlx::query_as!(
        Nft,
        r#"
        SELECT id, mint_address, owner_address, price, listed
        FROM nfts
        WHERE owner_address = $1
        "#,
        owner_address
    )
    .fetch_all(pool.get_ref())
    .await;

    match result {
        Ok(nft) => HttpResponse::Ok().json(nft),
        Err(err) => {
            println!("Database error: {:?}", err);
            HttpResponse::InternalServerError().json("Error fetching NFT")
        }
    }
}

#[post("/update-nft")]
pub async fn update_nft(pool: web::Data<PgPool>, item: web::Json<NewNft>) -> impl Responder {
    println!(
        "Received request to update an NFT: {}, new owner: {}",
        item.mint_address,
        item.owner_address,
    );

    let result = sqlx::query_as!(
        Nft,
        r#"
        UPDATE nfts
        SET owner_address = $1, listed = false
        WHERE mint_address = $2
        RETURNING id, mint_address, owner_address, price, listed
        "#,
        item.owner_address,
        item.mint_address,
    )
    .fetch_one(pool.get_ref())
    .await;

    match result {
        Ok(nft) => HttpResponse::Ok().json(nft),
        Err(err) => {
            println!("Database error: {:?}", err);
            HttpResponse::InternalServerError().json("Error updating NFT")
        }
    }
}

#[get("/get-listed-nfts")]
pub async fn get_listed_nfts(pool: web::Data<PgPool>) -> impl Responder {
    let result = sqlx::query_as!(
        Nft,
        r#"
        SELECT id, mint_address, owner_address, price, listed
        FROM nfts
        WHERE listed = true
        "#,
    )
    .fetch_all(pool.get_ref())
    .await;

    match result {
        Ok(nft) => HttpResponse::Ok().json(nft),
        Err(err) => {
            println!("Database error: {:?}", err);
            HttpResponse::InternalServerError().json("Error fetching NFT")
        }
    }
}

#[post("/list-nft")]
pub async fn list_nft(pool: web::Data<PgPool>, item: web::Json<NewNft>) -> impl Responder {
    println!(
        "Received request to list an NFT: {} owner: {} and price: {}",
        item.mint_address,
        item.owner_address,
        item.price,
    );

    let result = sqlx::query_as!(
        Nft,
        r#"
        UPDATE nfts
        SET price = $1, listed = true
        WHERE mint_address = $2
        RETURNING id, mint_address, owner_address, price, listed
        "#,
        item.price,
        item.mint_address,
    )
    .fetch_one(pool.get_ref())
    .await;

    match result {
        Ok(nft) => HttpResponse::Ok().json(nft),
        Err(err) => {
            println!("Database error: {:?}", err);
            HttpResponse::InternalServerError().json("Error updating NFT")
        }
    }
}
