let lastRoutePath = null;

export default function(store) {
    store.subscribe(() => {
        const state = store.getState();
        const routePath = state.router.location.pathname;

        memorizeRoute(routePath);
    });
};

export function memorizeRoute(routePath) {
    if (routePath === lastRoutePath || routePath === '/') {
        return;
    }

    if (writeToStorage('lastRoute', { routePath })) {
        lastRoutePath = routePath;
    }
}

export function rememberRoute() {
    return readFromStorage('lastRoute');
}

export function writeToStorage(key, val) {
    const data = JSON.stringify(val);
    try {
        localStorage.setItem(`news487:${key}`, data);
        return true;
    } catch (e) {}
}

export function readFromStorage(key, defaultVal = null) {
    try {
        const json = localStorage.getItem(`news487:${key}`);

        let val;
        if (json) {
            val = JSON.parse(json);
        }

        return val !== undefined ? val : defaultVal;
    } catch (e) {
        return defaultVal;
    }
}
