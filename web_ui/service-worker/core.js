/* globals serviceWorkerOption */

export const ORIGIN_CACHE = `origin:${serviceWorkerOption.gitHash}`;
export const API_CACHE = `api:${serviceWorkerOption.gitHash}`;
export const FONTS_CACHE = `fonts:${serviceWorkerOption.gitHash}`;

export const T_ORIGIN = 'origin';
export const T_DOCS_API = 'api';
export const T_FONT = 'font';

export const SR_NET_FIRST = 'strategy-net-first';
export const SR_CACHE_FIRST = 'strategy-cache-first';

export const HANDLER_PATTERNS = [/\/digest/, /\/category\/.+/, /\/tag\/.+/];
export const HANDLER_CANONICAL = `${self.location.origin}/index.html`;

export function onInstall(event) {
    const { assets } = serviceWorkerOption;

    const done = Promise
        .all(assets.map(url => {
            return fetch(`${url}?r=${Math.random()}`);
        }))
        .then(responses => {
            return caches.open(ORIGIN_CACHE)
                .then(cache => {
                    return Promise.all(responses.map((response, idx) => {
                        return cache.put(assets[idx], response);
                    }));
                })
        })
        .then(() => {
            return self.skipWaiting();
        });

    event.waitUntil(done);
}

export function onActivate(event) {
    const done = caches.keys()
        .then(cacheVersions => {
            return Promise.all(cacheVersions.map(version => {
                if (version !== ORIGIN_CACHE && version !== API_CACHE && version !== FONTS_CACHE) {
                    return caches.delete(version);
                }
            }));
        })
        .then(() => self.clients.claim());

    event.waitUntil(done);
}
