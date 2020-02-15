if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('../sw.js')
        .then(function () {
            console.log("Service Worker: Registered");
        })
        .catch(function (err) {
            console.error(err);
        });
}
