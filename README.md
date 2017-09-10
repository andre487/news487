# scrapper487

Web pages scrapper

[Collector Docker image](https://hub.docker.com/r/andre487/scrapper487/)

[API Docker image](https://hub.docker.com/r/andre487/scrapper487-api/)

## Collector
Collector usage:

```
usage: scrap.py [-h] [--log-level LOG_LEVEL] [--unicode-json] [--mongo MONGO]
                [--mongo-db MONGO_DB]
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
```

For using Twitter scrapping ypu should provide API keys via environment variables:
  * `TWITTER_CONSUMER_KEY`
  * `TWITTER_CONSUMER_SECRET`
  * `TWITTER_ACCESS_TOKEN_KEY`
  * `TWITTER_ACCESS_TOKEN_SECRET`

See [manual](https://python-twitter.readthedocs.io/en/latest/getting_started.html)


## API

API works through `get-documents`, `get-digest`, `get-documents-by-category` endpoint. Params:
  * order – order to sort documents by publish date
  * limit – limit of documents
  * tags – filter by tags
  * source-name – filter by source name
  * author-name – filter by author name
  * text – fulltext search by tags, title, description and author name
  * name – name of category

Detailed endpoint specs see in file `endpoint-specs.yml`

API MongoDB setup makes via environment variables:
  * MONGO_HOST – `localhost` by default
  * MONGO_PORT – `27017` by default
  * MONGO_DB – `news_documents` by default

For API testing run script `run-test`
