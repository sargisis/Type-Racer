// re-export axum types for convenience
pub use axum::{
    Router,                     // main route builder
    routing::get,               // GET handler builder
    extract::ws::{              // websocket primitives
        WebSocketUpgrade,       // HTTP -> WS upgrade extractor
        WebSocket,              // actual websocket connection
        Message                 // websocket message type
    },
    response::IntoResponse,     // convert handler return -> HTTP response
    extract::State,             // extractor for shared state (our broadcast sender)
};

// tcp listener for axum
pub use tokio::net::TcpListener;

// socket addr helper
pub use std::net::SocketAddr;

// futures helpers for ws split/read/write
pub use futures::{SinkExt, StreamExt};

// broadcast channel sender
pub use tokio::sync::broadcast::Sender;

// spawn background tasks (for read/write loops)
pub use tokio::task;
