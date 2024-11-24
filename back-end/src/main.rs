extern crate diesel_migrations;
extern crate diesel;
extern crate actix_web;

use actix_cors::Cors;
use actix_web::{http, middleware::Logger, App, HttpServer, web::Data};
use dotenv::dotenv;
use diesel::r2d2::{ConnectionManager, Pool};
use diesel::pg::PgConnection;
use std::env;

use db_setup::run_migrations;

mod db_setup;
mod models;
mod endpoints;
mod schema;

pub type PgPool = Pool<ConnectionManager<PgConnection>>;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Load `.env` file with environment variables if present
    dotenv().ok();
    env_logger::init();

    let frontend_origin = env::var("FRONTEND_ORIGIN").unwrap_or_else(|_| "http://localhost:5173".to_string());
    let api_port = env::var("API_PORT").unwrap_or_else(|_| "5000".to_string());

    // Database connection and creation setup
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let manager = ConnectionManager::<PgConnection>::new(database_url);
    let pool = Pool::builder().build(manager).expect("Failed to create pool.");
    let mut conn = pool.get().expect("Failed to get connection from pool.");

    run_migrations(&mut conn);

    HttpServer::new(move || {
        // This is to allow any requets to our server
        // - for the Frontend
        // Configure CORS
        let cors = Cors::default()
            .allowed_origin(&frontend_origin)
            .allowed_methods(vec!["GET", "POST"])
            .allowed_headers(vec![http::header::CONTENT_TYPE, http::header::ACCEPT])
            .supports_credentials()
            .max_age(3600); // 1 hour

        App::new()
            // Set up DB pool to be used with web::Data<Pool> extractor
            .app_data(Data::new(pool.clone()))
            .wrap(cors)
            .wrap(Logger::default())
            // register HTTP requests handlers
            .service(endpoints::get_nfts)
            .service(endpoints::get_listed_nfts)
            .service(endpoints::get_nfts_for_user)
            .service(endpoints::get_nft)
            .service(endpoints::create_nft)
            .service(endpoints::update_nft)
            .service(endpoints::list_nft)
    })
    .bind(format!("0.0.0.0:{}", api_port))?
    .run()
    .await
}
