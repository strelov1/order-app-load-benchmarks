# store-app-load-benchmarks

## Benchmark Results

| Configuration      | Description                    | Successful Requests/sec | Successful Order/sec |
|--------------------|--------------------------------|------------------------:|---------------------:|
| server-1           | Basic server setup             |                   187   |                 3.11 |
| server-2           | pgPooling                      |                   553   |                 8.4  |
| server-3           | pgPooling + clustered          |                   509   |                 8    |
| server-4           | pgPooling + sql tuning         |                   2372  |                 38   |