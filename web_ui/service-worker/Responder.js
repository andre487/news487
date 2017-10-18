import {SR_NET_FIRST, SR_CACHE_FIRST} from './core';

const NETWORK_TIMEOUT = 3000;

export default class Responder {
    constructor(request, strategy) {
        this._request = request;
        this._strategy = strategy;
    }

    respond() {
        switch (this._strategy.name) {
            case SR_NET_FIRST:
                return this._respondNetFirst();
            case SR_CACHE_FIRST:
                return this._respondCacheFirst();
            default:
                if (process.env.NODE_ENV === 'development') {
                    console.warn(`Unknown strategy: ${this._strategy.name}`);
                }
                return this._fetchFromNet();
        }
    }

    _respondNetFirst() {
        return this._fetchFromNet(NETWORK_TIMEOUT)
            .catch(() => this._fetchFromCache());
    }

    _respondCacheFirst() {
        return this._fetchFromCache();
    }

    _fetchFromNet(timeout = null) {
        const fetchPromise = new Promise((resolve, reject) => {
            let timeoutId;
            if (timeout) {
                timeoutId = setTimeout(reject, timeout);
            }

            fetch(this._request)
                .then(resp => {
                    if (timeout) {
                        clearTimeout(timeoutId);
                    }
                    resolve(resp);
                }, reject);
        });

        return fetchPromise.then(resp => {
            return this._strategy.store ?
                this._updateInCache(resp) :
                resp;
        });
    }

    _fetchFromCache() {
        return caches.match(this._strategy.cleanUrl)
            .then(match => {
                if (match) {
                    if (this._strategy.store) {
                        // Update cache
                        this._fetchFromNet()
                            .catch(err => {
                                if (process.env.NODE_ENV === 'development') {
                                    console.error('Unable to update cache', err);
                                }
                            });
                    }
                    return match;
                }
                return this._fetchFromNet();
            });
    }

    _updateInCache(resp) {
        return caches.open(this._strategy.storeName)
            .then(cache => cache.put(this._strategy.cleanUrl, resp.clone()))
            .then(() => resp);
    }
}
