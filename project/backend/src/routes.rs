use crate::library::{Router, get, Sender, State};
use crate::ws::handle_ws;

// build axum router / all routes here
pub fn create_router(tx: Sender<String>) -> Router {
    Router::new()
        // simple health check endpoint
        .route("/", get(|| async { "Ok!" }))

        // websocket route
        // we pass broadcast sender (tx) into WS handler
        .route(
            "/ws",
            get(
                move |ws, state: State<Sender<String>>| async move {
                    // call websocket handler
                    handle_ws(ws, state).await
                }
            )
        )

        // store tx inside router state so WS can access it later
        .with_state(tx)
}
