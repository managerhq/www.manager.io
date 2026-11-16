// How an advisor appears in the directory listing and on their own page.
// A profile is written in whichever language the advisor's clients speak, so each card carries its own text direction.

const card = 'rounded-lg border border-gray-200 bg-white p-5 shadow-sm';

export function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text ?? '';
    return div.innerHTML;
}

export function countryName(code) {
    if (!code) return '';
    try {
        return new Intl.DisplayNames(['en'], { type: 'region' }).of(code.toUpperCase()) || code;
    } catch {
        return code.toUpperCase();
    }
}

export const message = (text, classes = 'text-gray-500') => `<p class="text-center ${classes}">${text}</p>`;
export const errorMessage = (text) => message(text, 'rounded-md bg-red-50 p-4 text-red-700');

// Languages by code, used for the text direction of a card. Empty when the list cannot be loaded.
export async function loadLanguages(api) {
    try {
        const response = await fetch(`${api}/api/languages`);
        if (!response.ok) return {};
        const data = await response.json();
        return Object.fromEntries((data.languages || []).map((language) => [language.code, language]));
    } catch {
        return {};
    }
}

function website(url) {
    // Anything that is not a web address is left out rather than made into a link.
    if (!/^https?:\/\//i.test(url || '')) return '';
    const label = url.replace(/^https?:\/\//i, '').replace(/\/$/, '');
    return `
        <div class="mt-4 border-t border-gray-200 pt-4 text-sm [overflow-wrap:anywhere]">
            <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:underline">${escapeHtml(label)}</a>
        </div>`;
}

const description = (profile) =>
    profile.description ? `<p class="leading-relaxed text-gray-600">${escapeHtml(profile.description)}</p>` : '';

// profile: { username, businessName, description, website, language, countries }
// options.direction: 'ltr' | 'rtl'; options.full renders the advisor's own page instead of a listing card.
export function renderAdvisorCard(profile, { direction = 'ltr', full = false } = {}) {
    const dir = direction === 'rtl' ? ' dir="rtl"' : '';

    if (full) {
        const countries = (profile.countries || [])
            .map((c) => `<span class="rounded-full bg-gray-100 px-2.5 py-0.5 text-sm text-gray-700">${escapeHtml(countryName(c.country))}</span>`)
            .join('');
        return `
            <div class="${card}"${dir}>
                ${profile.businessName ? `<h1 class="mb-3 text-2xl font-bold text-gray-900">${escapeHtml(profile.businessName)}</h1>` : ''}
                ${description(profile)}
                ${website(profile.website)}
            </div>
            ${countries ? `
            <div class="${card}">
                <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Active in</h2>
                <div class="flex flex-wrap gap-1.5">${countries}</div>
            </div>` : ''}`;
    }

    return `
        <div class="${card}"${dir}>
            ${profile.businessName ? `<a href="/advisors/profile/?username=${encodeURIComponent(profile.username)}" class="mb-2 block text-lg font-semibold text-indigo-600 hover:underline">${escapeHtml(profile.businessName)}</a>` : ''}
            ${description(profile)}
            ${website(profile.website)}
        </div>`;
}
