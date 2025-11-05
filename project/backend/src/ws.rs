use crate::library::{SinkExt , StreamExt};
use crate::library::WebSocketUpgrade;
use crate::library::WebSocket;
use crate::library::IntoResponse;
use crate::library::Message;
use crate::library::Sender;
use crate::library::task;
use crate::library::State;

// entry point for `/ws` route
// upgrade regular HTTP connection into WebSocket connection
pub async fn handle_ws(
    ws: WebSocketUpgrade,
    State(tx): State<Sender<String>>, // broadcast channel sender
) -> impl IntoResponse {
    // when connection upgrades => call handle_socket
    ws.on_upgrade(move |socket| handle_socket(socket , tx))
}

// per-client WebSocket handler
async fn handle_socket(socket: WebSocket, tx: Sender<String>) {

    // create receiver copy for this client
    let mut rx = tx.subscribe();

    // split websocket into (sender, receiver)
    // sender => to send messages to client
    // receiver_ws => read incoming messages from client
    let (mut sender , mut receiver_ws) = socket.split();

    // TASK 1: forward broadcast messages to this client
    task::spawn(async move {
        while let Ok(msg) = rx.recv().await {
            // try to send to client
            if sender.send(Message::Text(msg)).await.is_err() {
                // client closed connection
                break;
            }
        }
    });
    
    // TASK 2: read messages coming from this client
    while let Some(Ok(msg)) = receiver_ws.next().await {
        if let Message::Text(msg) = msg {
            // broadcast this message to all others
            let _ = tx.send(msg).unwrap();
        }
    }
}
