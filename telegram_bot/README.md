# news-bot487

Bot for reading news from [scrapper487](https://github.com/andre487/scrapper487)

[Docker image](https://hub.docker.com/r/andre487/news-bot487/)

Configuration environment variables:
  * `API_URL` – URL of scrapper487 API
  * `TELEGRAM_TOKEN` – token of the Telegram API
  * `MONGO_HOST` – `localhost` by default
  * `MONGO_PORT` – `27017` by default
  * `MONGO_DB` – `news_bot_487` by default
  * `TZ` – `Europe/Moscow` by default
  * `SHORTEN_LINKS` – need shorten links, causes issues with Telegram preview widgets
  * `GOO_GL_KEY` – goo.gl key for shorten links if enabled
