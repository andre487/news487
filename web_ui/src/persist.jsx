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

    const data = JSON.stringify({routePath});
    if (writeRouteData(data)) {
        lastRoutePath = routePath;
    }
}

export function rememberRoute() {
    try {
        const data = localStorage.getItem('news487:lastRoute');
        return JSON.parse(data);
    } catch (e) {}
}

function writeRouteData(data) {
    try {
        localStorage.setItem('news487:lastRoute', data);
        return true;
    } catch (e) {}
}
