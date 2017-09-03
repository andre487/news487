# scrapper487

Web pages scrapper

[Collector Docker image](https://hub.docker.com/r/andre487/scrapper487/)

[API Docker image](https://hub.docker.com/r/andre487/scrapper487-api/)

Collector usage:

```
usage: scrap.py [-h] [--log-level LOG_LEVEL] [--unicode-json] [--mongo MONGO]
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
  --unicode-json
  --mongo MONGO         Write to MongoDB, param format: host(:port)?
  --mongo-db MONGO_DB   Database name
  --mongo-user MONGO_USER
  --mongo-password MONGO_PASSWORD
```

API works through `get-document` endpoint. Params:
  * order – order to sort documents by publish date
  * limit – limit of documents
  * tags – filter by tags
  * source_name – filter by source name
  * author_name – filter by author name
  * text – fulltext search by tags, title, description and author name
 
API MongoDB setup makes via environment variables:
  * MONGO_HOST – `localhost` by default
  * MONGO_PORT – `27017` by default
  * MONGO_DB – `news_documents` by default
