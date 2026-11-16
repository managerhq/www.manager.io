// Shows the banner written for the visitor's country, if this page has one.
// The page lists its banners in #banner-data as { "<country code>": "<html>" }.
(async () => {
    const container = document.getElementById('banner');
    const banners = JSON.parse(document.getElementById('banner-data').textContent);

    // Used only when Cloudflare cannot tell us the country. Covers the countries that have banners.
    const timeZoneCountries = {
        'Asia/Kabul': 'af',
        'Asia/Riyadh': 'sa',
        'Asia/Kuala_Lumpur': 'my',
        'Asia/Kuching': 'my',
        'Africa/Harare': 'zw'
    };

    async function detectCountry() {
        // ?country=au overrides detection, which is handy for testing
        const override = new URLSearchParams(window.location.search).get('country');
        if (override) return override;

        // Every site proxied through Cloudflare exposes the visitor's country here
        try {
            const response = await fetch('/cdn-cgi/trace');
            if (response.ok) {
                const match = (await response.text()).match(/^loc=([A-Za-z]{2})$/m);
                if (match) return match[1];
            }
        } catch (e) {
            // Not behind Cloudflare - fall back to the time zone
        }

        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
        return timeZone.startsWith('Australia/') ? 'au' : timeZoneCountries[timeZone];
    }

    const country = await detectCountry();
    const html = country && banners[country.toLowerCase()];
    if (html) {
        container.innerHTML = html;
        container.hidden = false;
    }
})();
