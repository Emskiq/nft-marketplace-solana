use actix_web::{post, get, web, HttpResponse, Responder};

use diesel::ExpressionMethods;
use diesel::RunQueryDsl;
use diesel::QueryDsl;
use diesel::result::Error as DieselError;


use crate::{models::Nft, schema::nfts::self, PgPool};
use bigdecimal::BigDecimal;

#[post("/mint-nft")]
pub async fn create_nft(pool: web::Data<PgPool>, item: web::Json<Nft>) -> impl Responder {
    println!(
        "Received request to insert NFT into our database: {}",
        item.mint_address
    );

    let mut conn = pool.get().expect("Failed to get DB connection");

    let mut new_nft = item.into_inner();
    new_nft.listed = false;
    new_nft.price = BigDecimal::from(0);

    let new_nft_clone = new_nft.clone();

    let result = web::block(move || {
        diesel::insert_into(nfts::table)
            .values(&new_nft)
            .execute(&mut conn)
    })
    .await;

    match result {
        Ok(_) => HttpResponse::Ok().json(new_nft_clone),
        Err(err) => {
            println!("Database error: {:?}", err);
            HttpResponse::InternalServerError().json("Error inserting NFT")
        }
    }
}

#[get("/get-nfts")]
pub async fn get_nfts(pool: web::Data<PgPool>) -> impl Responder {
    let mut conn = pool.get().expect("Failed to get DB connection");

    let result: Result<Vec<Nft>, DieselError> = web::block(move || nfts::table.load::<Nft>(&mut conn))
        .await
        .expect("REASON");

    match result {
        Ok(nfts_list) => HttpResponse::Ok().json(nfts_list),
        Err(err) => {
            println!("Database error: {:?}", err);
            HttpResponse::InternalServerError().json("Error fetching NFTs")
        }
    }
}

#[get("/get-nft/{mint_address}")]
pub async fn get_nft(pool: web::Data<PgPool>, mint_addr: web::Path<String>) -> impl Responder {
    let mut conn = pool.get().expect("Failed to get DB connection");
    let mint_addr = mint_addr.into_inner();

    let result: Result<Nft, diesel::result::Error> = web::block(move || nfts::table.find(mint_addr).first::<Nft>(&mut conn))
        .await
        .expect("ERROR");

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
    let mut conn = pool.get().expect("Failed to get DB connection");
    let owner_address = address.into_inner();

    let result: Result<Vec<Nft>, DieselError> = web::block(move || {
        nfts::table.filter(nfts::owner_address.eq(owner_address)).load::<Nft>(&mut conn)
    })
    .await
    .expect("REASON");

    match result {
        Ok(nfts_list) => HttpResponse::Ok().json(nfts_list),
        Err(err) => {
            println!("Database error: {:?}", err);
            HttpResponse::InternalServerError().json("Error fetching NFTs")
        }
    }
}

// Update owner of the NFT in the database
#[post("/update-nft")]
pub async fn update_nft(pool: web::Data<PgPool>, item: web::Json<Nft>) -> impl Responder {
    println!(
        "Received request to update an NFT: {}, new owner: {}",
        item.mint_address,
        item.owner_address,
    );

    let mut conn = pool.get().expect("Failed to get DB connection");
    let mut new_nft_record = item.into_inner();

    // Set defaults as per platform requirements
    new_nft_record.listed = false;
    new_nft_record.price = BigDecimal::from(0);

    let new_nft_clone = new_nft_record.clone();

    let mint_addr = new_nft_record.mint_address.clone();

    let result = web::block(move || {
        diesel::update(nfts::table.find(mint_addr))
            .set(&new_nft_record)
            .execute(&mut conn)
    })
    .await;

    match result {
        Ok(_) => HttpResponse::Ok().json(new_nft_clone),
        Err(err) => {
            println!("Database error: {:?}", err);
            HttpResponse::InternalServerError().json("Error updating NFT")
        }
    }
}

#[get("/get-listed-nfts")]
pub async fn get_listed_nfts(pool: web::Data<PgPool>) -> impl Responder {
    let mut conn = pool.get().expect("Failed to get DB connection");

    let result: Result<Vec<Nft>, DieselError> = web::block(move || {
        nfts::table.filter(nfts::listed.eq(true)).load::<Nft>(&mut conn)
    })
    .await
    .expect("REASON");

    match result {
        Ok(nfts_list) => HttpResponse::Ok().json(nfts_list),
        Err(err) => {
            println!("Database error: {:?}", err);
            HttpResponse::InternalServerError().json("Error fetching NFTs")
        }
    }
}

#[post("/list-nft")]
pub async fn list_nft(pool: web::Data<PgPool>, item: web::Json<Nft>) -> impl Responder {
    println!(
        "Received request to list an NFT: {} owner: {} and price: {}",
        item.mint_address,
        item.owner_address,
        item.price,
    );

    let mut conn = pool.get().expect("Failed to get DB connection");
    let mut new_nft_record = item.into_inner();

    new_nft_record.listed = true;
    // Price is set in the structure comming as a request

    let new_nft_clone = new_nft_record.clone();

    let mint_addr = new_nft_record.mint_address.clone();

    let result = web::block(move || {
        diesel::update(nfts::table.find(mint_addr))
            .set(&new_nft_record)
            .execute(&mut conn)
    })
    .await;

    match result {
        Ok(_) => HttpResponse::Ok().json(new_nft_clone),
        Err(err) => {
            println!("Database error: {:?}", err);
            HttpResponse::InternalServerError().json("Error updating NFT")
        }
    }
}
