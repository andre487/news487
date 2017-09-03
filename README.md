# scrapper487

Web pages scrapper

[Collector Docker image](https://hub.docker.com/r/andre487/scrapper487/)

Collector usage:

```
usage: scrap.py [-h] [--log-level LOG_LEVEL] [--mongo MONGO]
                [--mongo-db MONGO_DB] [--mongo-user MONGO_USER]
                [--mongo-password MONGO_PASSWORD]
                {run,list} ...

positional arguments:
  {run,list}            Actions
    run                 Run scrappers
    list                List scrappers

optional arguments:
  -h, --help            show this help message and exit
  --log-level LOG_LEVEL
  --mongo MONGO         Write to MongoDB, param format: host(:port)?
  --mongo-db MONGO_DB   Database name
  --mongo-user MONGO_USER
  --mongo-password MONGO_PASSWORD
```
