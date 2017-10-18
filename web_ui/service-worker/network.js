import Responder from './Responder';
import {
    ORIGIN_CACHE, FONTS_CACHE,
    API_CACHE, T_ORIGIN, T_DOCS_API, T_FONT,
    SR_NET_FIRST, SR_CACHE_FIRST,
    HANDLER_PATTERNS, HANDLER_CANONICAL
} from './core';

const origin = self.location.origin;

const requestTypes = [
    [new RegExp(escapeHostPattern(origin)), T_ORIGIN],
    [new RegExp(escapeHostPattern(process.env.API_URL)), T_DOCS_API],
    [/(?:fonts\.googleapis\.com)|(?:fonts\.gstatic\.com)/, T_FONT]
];

const handleStrategies = {
    [T_ORIGIN]: {
        name: SR_NET_FIRST,
        storeName: ORIGIN_CACHE,
        store: true
    },
    [T_DOCS_API]: {
        name: SR_NET_FIRST,
        storeName: API_CACHE,
        store: true
    },
    [T_FONT]: {
        name: SR_CACHE_FIRST,
        storeName: FONTS_CACHE,
        store: true
    },
};

export default function onFetch(event) {
    const { request } = event;

    const handleStrategy = getHandleStrategy(request);
    if (handleStrategy) {
        const resp = new Responder(request, handleStrategy);
        event.respondWith(resp.respond());
    }
}

function escapeHostPattern(host) {
    return host.replace(/\./g, '\\.')
        .replace(/^https?:\/\//, '');
}

function isResource(url) {
    return /\.(?:js|css|svg)(?:\?.+)?$/.test(url);
}

function isHandler(url) {
    return HANDLER_PATTERNS.some(pattern => pattern.test(url));
}

function getHandleStrategy(request) {
    if (request.method !== 'GET') {
        return;
    }

    const { url } = request;
    let requestType;

    for (let [pattern, type] of requestTypes) {
        if (pattern.test(url)) {
            requestType = type;
            break;
        }
    }

    if (!requestType) {
        return;
    }

    let cleanUrl = url;
    if (requestType === T_ORIGIN) {
        if (isResource(cleanUrl)) {
            cleanUrl = cleanUrl.replace(/\?.+$/, '');
        } else if (isHandler(cleanUrl)) {
            cleanUrl = HANDLER_CANONICAL;
        }
    }

    return {
        ...handleStrategies[requestType] || {},
        requestType,
        cleanUrl,
    };
}
