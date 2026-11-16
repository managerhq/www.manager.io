// Accountants directory: loads the StoreRocket store-locator widget into .storerocket-store-locator.
(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.storerocket.io/widget.js';
    script.onload = () => StoreRocket.init({ selector: '.storerocket-store-locator', account: 'n0pj5rW86V' });
    script.onerror = () => {
        document.querySelector('.storerocket-store-locator').innerHTML =
            '<p class="rounded-md bg-red-50 p-4 text-center text-red-700">The directory could not be loaded. Please try again later.</p>';
    };
    document.body.appendChild(script);
})();
