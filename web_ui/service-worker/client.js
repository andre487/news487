const serviceWorker = navigator.serviceWorker;

if (serviceWorker && serviceWorker.controller) {
    serviceWorker.ready.then(() => {
        serviceWorker.controller.postMessage({
            type: 'assets',
            payload: window.pageStaticBundles,
        });
    });
}
