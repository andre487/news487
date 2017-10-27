import config from '../config';
import * as util from '../util';

const loadCallbacks = [];
let readingQueue = [];
let speechKit;

let autoPlayEnabled = true;

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

    if (!autoPlayEnabled) {
        return readTextByBrowserSynthesis(text, lang);
    }

    return readTextBySpeechKit(text, lang);
}

function readTextByBrowserSynthesis(text, lang) {
    const synthesis = window.speechSynthesis;
    lang = lang.replace(/-/g, '_');

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang;
    utter.rate = lang === 'ru_RU' ? 1 : 0.8;

    return new Promise((resolve, reject) => {
        function onEnd() {
            clear();
            resolve();
        }

        function onError(err) {
            clear();
            reject(err);
        }

        function clear() {
            utter.removeEventListener('end', onEnd);
            utter.removeEventListener('error', onError);
        }

        utter.addEventListener('end', onEnd);
        utter.addEventListener('error', onError);

        synthesis.speak(utter);
    });
}

function readTextBySpeechKit(text, lang) {
    return getSpeechKit().then(speechKit => {
        const tts = speechKit.Tts({
            ...config.speechParams,
            speed: lang === 'ru-RU' ? 1 : 0.8,
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
    checkAutoPlay();

    const apiScript = document.createElement('script');

    apiScript.src = 'https://webasr.yandex.net/jsapi/v1/webspeechkit.js';
    apiScript.async = true;
    apiScript.onload = () => {
        apiScript.onload = null;
        onScriptLoad();
    };

    document.body.appendChild(apiScript);
}

function checkAutoPlay() {
    if (typeof Audio === 'undefined') {
        return;
    }

    try {
        const audio = new Audio();
        audio.play()
            .catch(err => {
                if (err.name === 'NotAllowedError') {
                    autoPlayEnabled = false;
                }
            });
    } catch (e) {
        console.warn(e);
    }
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
