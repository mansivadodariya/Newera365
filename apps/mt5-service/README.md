# @newera365/mt5-service

**Mock** MT5 price bridge: an Express service (port 4000) that simulates live bid/ask (±0.02% jitter) from the static tables in `src/data/fallback.json`. It exists so the CMS's MT5 proxy and the frontend's live-price contract could be built and tested before real MT5 connectivity.

Contract:

- `GET /instruments` and `GET /instruments/:symbol`, guarded by `MT5_INTERNAL_API_TOKEN` (the CMS holds the token; direct anonymous calls get 401).
- `GET /health`, guarded by `HEALTH_CHECK_TOKEN`.
- The CMS consumes it via `MT5_SERVICE_URL` and degrades gracefully when it is down (`source: "cms-fallback"`). The SiteSettings `mt5SyncEnabled` master switch (currently OFF in production) bypasses it entirely.

Real MT5 status: the official Manager API bindings are Windows-only native libraries; the approved-but-unbuilt path is MT5's HTTP Web API against the broker's server. Until then this mock is the only bridge, and production serves CMS-managed prices.
