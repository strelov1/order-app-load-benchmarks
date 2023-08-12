# order-app-load-benchmarks

## Benchmark Results

| Configuration      | Successful Requests/sec | Successful Order/sec |
|--------------------|------------------------:|---------------------:|
| server-1           |                   187   |                 3.11 |
| server-2           |                   553   |                 8.4  |
| server-3           |                   509   |                 8    |
| server-4           |                   2343  |                 38   |

server-1: Simple pgClient
server-2: pgPooling
server-3: pgPooling + clustering
server-4: pgPooling + sql tuning
