// Find an Advisor: the top advisors by how many paying customers they support.
// An advisor near the visitor is more use than the global leader, so unless a country is asked for
// (?country=au) the API detects one, and the worldwide list is shown only when that country has nobody.
import { countryName, errorMessage, loadLanguages, message, renderAdvisorCard } from './advisor-card.js';

const listEl = document.getElementById('advisorsList');
const countryLineEl = document.getElementById('countryLine');
const api = listEl.dataset.api;

// The country being shown, and the one the page first settled on.
let shownCountry = '';
let initialCountry = null;
let requestedCountry = new URLSearchParams(window.location.search).get('country') || '';
let languages = {};

async function getJson(path) {
    const response = await fetch(api + path);
    if (!response.ok) throw new Error(`${path} returned ${response.status}`);
    return response.json();
}

function renderCountryText() {
    countryLineEl.hidden = false;
    countryLineEl.innerHTML = `
        <span>Showing advisors in</span>
        <button type="button" id="countryText" class="font-semibold text-gray-900 underline decoration-dashed underline-offset-4 hover:text-indigo-600">${countryName(shownCountry)}</button>`;
    countryLineEl.querySelector('#countryText').addEventListener('click', showCountryPicker);
}

async function showCountryPicker() {
    countryLineEl.innerHTML = `
        <span>Showing advisors in</span>
        <select id="countrySelect" class="rounded-md border border-gray-300 bg-white px-2 py-1 text-gray-900"><option value="">Loading...</option></select>`;
    const select = countryLineEl.querySelector('#countrySelect');

    try {
        const data = await getJson('/api/advisors/countries');
        select.innerHTML = (data.countries || [])
            .map((code) => ({ code, name: countryName(code) }))
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((option) => `<option value="${option.code}">${option.name}</option>`)
            .join('');
        select.value = shownCountry.toLowerCase();
        select.focus();

        select.addEventListener('change', () => {
            requestedCountry = select.value;
            window.history.replaceState({}, '', `${window.location.pathname}?country=${encodeURIComponent(requestedCountry)}`);
            loadAdvisors();
        });

        // Clicking away goes back to plain text, unless the visitor has moved to another country.
        select.addEventListener('blur', () => {
            if (shownCountry.toLowerCase() === (initialCountry || '').toLowerCase()) renderCountryText();
        });
    } catch {
        renderCountryText();
    }
}

function updateCountryLine(emptyCountry) {
    if (emptyCountry) {
        countryLineEl.hidden = false;
        countryLineEl.innerHTML = `<span>No advisors found in ${countryName(emptyCountry)}. Showing top advisors across the world.</span>`;
        return;
    }

    if (!shownCountry) {
        countryLineEl.hidden = true;
        return;
    }

    // Leave the picker open if that is what the visitor is using.
    const select = countryLineEl.querySelector('#countrySelect');
    if (select) select.value = shownCountry.toLowerCase();
    else renderCountryText();
}

async function loadAdvisors() {
    listEl.innerHTML = message('Loading advisors...');

    try {
        let data;
        let emptyCountry = '';

        if (requestedCountry) {
            // Asked for explicitly, so that country is shown even when it is empty.
            data = await getJson(`/api/advisors/top?country=${encodeURIComponent(requestedCountry)}`);
        } else {
            data = await getJson('/api/advisors/top?autoDetect=true');
            if ((data.profiles || []).length === 0) {
                emptyCountry = data.country || '';
                data = await getJson('/api/advisors/top');
            }
        }

        const profiles = data.profiles || [];
        shownCountry = data.country || '';
        if (initialCountry === null) initialCountry = shownCountry;
        updateCountryLine(emptyCountry);

        listEl.innerHTML = profiles.length === 0
            ? message('No advisors available at this time. Check back later for updates.')
            : profiles
                .map((profile) => renderAdvisorCard(profile, { direction: languages[profile.language]?.direction }))
                .join('');
    } catch {
        listEl.innerHTML = errorMessage('Failed to load advisors. Please try again later.');
    }
}

languages = await loadLanguages(api);
await loadAdvisors();
