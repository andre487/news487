import config from '../config';
import * as util from '../util';

const loadCallbacks = [];
let readingQueue = [];
let speechKit;

init();

export function readAllNews() {
    const newsNodes = document.querySelectorAll('[data-news-description="document"]');

    for (let node of newsNodes) {
        const headerNode = node.querySelector('[data-news-description="header"]');
        const textNode = node.querySelector('[data-news-description="text"]');
        const sourceTitleNode = node.querySelector('[data-news-description="source-title"]');

        const headerText = headerNode ? headerNode.innerHTML : '';
        const sourceTitleText = sourceTitleNode ? sourceTitleNode.innerHTML : '';

        const textToRead = util.removeMarkup([
            headerText,
            textNode ? (textNode.innerHTML.includes(headerText) ? '' : textNode.innerHTML) : '',
            headerText.includes(sourceTitleText) ? '' : sourceTitleText,
        ].join('.'))
            .replace(/\s{2,}/, ' ')
            .replace(/\.{2,}/, '.')
            .replace(/\.([\wа-яё])/ig, '. $1');

        readingQueue.push({
            exec: () => readText(textToRead),
            node
        });
    }

    return readAllFromQueue();
}

export function readText(text) {
    const lang = /[а-яё]/i.test(text) ? 'ru-RU' : 'en-US';

    return getSpeechKit().then(speechKit => {
        const tts = speechKit.Tts({
            ...config.speechParams,
            lang,
        });

        return new Promise(resolve => {
            tts.speak(text, { stopCallback: resolve });
        });
    });
}

export function stopReading() {
    readingQueue = [];
}

function init() {
    const apiScript = document.createElement('script');

    apiScript.src = 'https://webasr.yandex.net/jsapi/v1/webspeechkit.js';
    apiScript.async = true;
    apiScript.onload = () => {
        apiScript.onload = null;
        onScriptLoad();
    };

    document.body.appendChild(apiScript);
}

function onScriptLoad() {
    const _speechKit = window.ya && window.ya.speechkit;

    if (!_speechKit || !_speechKit.settings) {
        return setTimeout(onScriptLoad, 50);
    }

    _speechKit.settings.apikey = config.speechKitKey;
    speechKit = _speechKit;

    while (loadCallbacks.length) {
        const cb = loadCallbacks.shift();
        try {
            cb(_speechKit);
        } catch (e) {
            console.error(e);
        }
    }
}

async function readAllFromQueue() {
    while (readingQueue.length) {
        const item = readingQueue.shift();

        if (!item) {
            break;
        }

        item.node.classList.add('speech-reading');
        await item.exec()
            .then(() => {
                item.node.classList.remove('speech-reading');
            });
    }
}

function getSpeechKit() {
    return new Promise(resolve => {
        if (speechKit) {
            resolve(speechKit);
        } else {
            loadCallbacks.push(resolve);
        }
    });
}
