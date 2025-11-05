mod routes;
mod ws;
mod library;

use library::*;
use tokio::sync::broadcast;

#[tokio::main]
async fn main() {

    // broadcast channel for all WS clients
    // tx = sender, _rx is unused here
    let (tx, _rx) = broadcast::channel::<String>(64);

    // build app router, pass tx into it
    let app = routes::create_router(tx.clone());

    let addr: SocketAddr = "127.0.0.1:8080".parse().unwrap();
    println!("server running on http://{}", addr);

    // bind TCP listener
    let listener = TcpListener::bind(addr).await.unwrap();

    // convert tokio listener into std listener (axum expects std)
    let std_listener = listener.into_std().unwrap();
    std_listener.set_nonblocking(true).unwrap();

    // start axum server
    axum::Server::from_tcp(std_listener)
        .unwrap()
        .serve(app.into_make_service())
        .await
        .unwrap();
}
