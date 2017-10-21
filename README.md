# news487

News collector

Docker images:

  * [Collector](https://hub.docker.com/r/andre487/scrapper487/)
  * [Documents API](https://hub.docker.com/r/andre487/scrapper487-api/)
  * [Telegram bot](https://hub.docker.com/r/andre487/news-bot487/)
  * [SphinxSearch](https://hub.docker.com/r/andre487/scrapper487-sphinx/)

## DevTools

  * `devtools/start-dev project` – Start development version
  * `devtools/run-test project` – Run tests for project
  * `devtools/make-update project` – Update project on server
  * `devtools/docker-build project` – Build Docker image
  * `devtools/docker-test project` – Test local Docker image
  * `devtools/docker-push project` – Push Docker image to registry

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

For using Twitter scrapping API keys should be provided via environment variables:
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
  * text – fulltext search by title, text and description
  * name – name of category

Detailed endpoint specs see in file `endpoint-specs.yml`

API MongoDB setup makes via environment variables:
  * MONGO_HOST – `localhost` by default
  * MONGO_PORT – `27017` by default
  * MONGO_DB – `news_documents` by default

API SphinxSearch setup makes via environment variables:
  * SPHINX_HOST – `localhost` by default
  * SPHINX_PORT – `9306` by default
  * SPHINX_INDEX – `news_documents` by default

For API testing run script `run-test`


## Telegram bot

Configuration environment variables:
  * `API_URL` – URL of scrapper487 API
  * `TELEGRAM_TOKEN` – token of the Telegram API
  * `MONGO_HOST` – `localhost` by default
  * `MONGO_PORT` – `27017` by default
  * `MONGO_DB` – `news_bot_487` by default
  * `TZ` – `Europe/Moscow` by default
  * `SHORTEN_LINKS` – need shorten links, causes issues with Telegram preview widgets
  * `GOO_GL_KEY` – goo.gl key for shorten links if enabled
