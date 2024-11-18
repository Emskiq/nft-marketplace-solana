extern crate actix_web;

use actix_cors::Cors;
use actix_web::{http, middleware::Logger, App, HttpServer, web::Data};
use db::establish_connection;
use dotenv::dotenv;
use std::env;

mod db;
mod models;
mod endpoints;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Load `.env` file with environment variables if present
    dotenv().ok();
    env_logger::init();

    let frontend_origin = env::var("FRONTEND_ORIGIN").unwrap_or_else(|_| "http://localhost:5173".to_string());

    let api_port = env::var("API_PORT").unwrap_or_else(|_| "5000".to_string());
    let pool = establish_connection().await;

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
    .bind(format!("127.0.0.1:{}", api_port))?
    .run()
    .await
}
