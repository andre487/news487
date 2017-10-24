# news487

Mono repository for services providing application `News 487` 
for reading news from different sources.

## DevTools

  * `devtools/create-venv project` – Create VirtualEnv for Python based module
  * `devtools/pip-install project ...packages` – Install packages in VirtualEnv of Python based module
  * `devtools/start-dev project` – Start development version
  * `devtools/run-test project` – Run tests for project
  * `devtools/make-install project` – Install or update project on server
  * `devtools/docker-build project` – Build Docker image
  * `devtools/docker-test project` – Test local Docker image
  * `devtools/docker-push project` – Push Docker image to registry
  * `devtools/build-static-package project` – Build static package for project if it has

Each service or module contains `.devtools` directory where data for development, 
setup and testing is.

Main things in `.devtools` dir:

  * `params` – Bash script with variables and functions that using for running tools commands
  * `Dockerfile` – with this file image for service will be built
  * `setup.yml` - Ansible playbook for setup service on server

## Commons

`common` directory contains code that includes in different services of project:

  * `ansible` – roles for setup services on server
  * `python` – common Python code and `Dockerfile` for base Python image

Common MongoDB setup makes via environment variables:

  * `MONGO_HOST` – `localhost` by default
  * `MONGO_PORT` – `27017` by default
  * `MONGO_USER` – empty by default
  * `MONGO_PASSWORD` – empty by default

## Collector

Service for scrapping sources and extracting documents and their metadata. 
Obsolete name `scrapper487`, this name can be seen in different parts of project. 

Collector usage:

```
usage: scrap.py [-h] [--unicode-json] {run,list} ...

positional arguments:
  {run,list}      Actions
    run           Run scrappers
    list          List scrappers

optional arguments:
  -h, --help      show this help message and exit
  --unicode-json
```

And for `run` command:

```
usage: scrap.py run [-h] [--no-replace-redirects]
                    {all,axel_2ality,chromium_blog,css_tricks,edge_blog,facebook_code,google_developers_web,habr_client_perf,igvita,kinopoisk,mail,meduza,mozilla_hacks,perf_calendar,reddit_perf,search_engines,sessionstack_blog,sitepoint,tinkoff_journal,twitter,v8_blog,web_standards,webkit_blog,yandex_news}
                    [{all,axel_2ality,chromium_blog,css_tricks,edge_blog,facebook_code,google_developers_web,habr_client_perf,igvita,kinopoisk,mail,meduza,mozilla_hacks,perf_calendar,reddit_perf,search_engines,sessionstack_blog,sitepoint,tinkoff_journal,twitter,v8_blog,web_standards,webkit_blog,yandex_news} ...]

positional arguments:
  {all,axel_2ality,chromium_blog,css_tricks,edge_blog,facebook_code,google_developers_web,habr_client_perf,igvita,kinopoisk,mail,meduza,mozilla_hacks,perf_calendar,reddit_perf,search_engines,sessionstack_blog,sitepoint,tinkoff_journal,twitter,v8_blog,web_standards,webkit_blog,yandex_news}

optional arguments:
  -h, --help            show this help message and exit
  --no-replace-redirects
                        Disable redirects replacing inside email documents
```

For using Twitter scrapping API keys should be provided via environment variables:

  * `TWITTER_CONSUMER_KEY`
  * `TWITTER_CONSUMER_SECRET`
  * `TWITTER_ACCESS_TOKEN_KEY`
  * `TWITTER_ACCESS_TOKEN_SECRET`

See [manual](https://python-twitter.readthedocs.io/en/latest/getting_started.html)

For using email scrapping auth data for mail server should be provided vie environment variables:

  * `MAIL_SERVER`
  * `MAIL_LOGIN`
  * `MAIL_PASSWORD`

And if you don't want to mark emails as read, you can provide variable `MAIL_READONLY=1`.

## API

API works through `get-documents`, `get-digest`, `get-documents-by-category` endpoint. Params:

  * `order` – order to sort documents by publish date
  * `limit` – limit of documents
  * `tags` – filter by tags
  * `source-name` – filter by source name
  * `author-name` – filter by author name
  * `text` – fulltext search by title, text and description
  * `name` – name of category

Detailed endpoint specs see in file `endpoint-specs.yml`

API's SphinxSearch setup makes via environment variables:

  * `SPHINX_HOST` – `localhost` by default
  * `SPHINX_PORT` – `9306` by default

## Sphinx

Service for indexing and full text search that uses SphinxSearch inside. 
Used by API for handling `text` param query.

## Pusher

Service for collecting push messaging tokens and send push notifications to Web UI.

Works through the FireBase. 
Firebase key should be provided via `FIREBASE_KEY` environment variable.

## Web UI

This is UI for application. It doesn't have Docker image and deployed as static files
under server's Nginx.

When building application you should provide environment variables:

  * `SCRAPPER_487_API_URL`
  * `SCRAPPER_487_PUSHER_URL`

## Telegram bot

Configuration environment variables:
  * `API_URL` – URL of scrapper487 API
  * `TELEGRAM_TOKEN` – token of the Telegram API
  * `MONGO_HOST` – `localhost` by default
  * `MONGO_PORT` – `27017` by default
  * `MONGO_USER` – empty by default
  * `MONGO_PASSWORD` – empty by default
  * `MONGO_DB` – `news_bot_487` by default
  * `TZ` – `Europe/Moscow` by default
  * `SHORTEN_LINKS` – need shorten links, causes issues with Telegram preview widgets
  * `GOO_GL_KEY` – goo.gl key for shorten links if enabled


## Docker images

  * [Collector](https://hub.docker.com/r/andre487/scrapper487/)
  * [Documents API](https://hub.docker.com/r/andre487/scrapper487-api/)
  * [Push messages manager](https://hub.docker.com/r/andre487/scrapper487-pusher/)
  * [Telegram bot](https://hub.docker.com/r/andre487/news-bot487/)
  * [SphinxSearch](https://hub.docker.com/r/andre487/scrapper487-sphinx/)
  * [Base Python image](https://hub.docker.com/r/andre487/scrapper487-py-common/)
