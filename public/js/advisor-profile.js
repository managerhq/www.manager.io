// One advisor's public page: /advisors/profile/?username=…
// Sending the advisor a message needs a signed-in sender, so that part is on manager.cloud.
import { errorMessage, escapeHtml, loadLanguages, message, renderAdvisorCard } from './advisor-card.js';

const profileEl = document.getElementById('profileContent');
const api = profileEl.dataset.api;
const username = new URLSearchParams(window.location.search).get('username');

const backLink = '<p><a href="/advisors/" class="text-sm text-indigo-600 hover:underline">&#8592; Back to advisors</a></p>';

async function loadProfile() {
    try {
        const [languages, response] = await Promise.all([
            loadLanguages(api),
            fetch(`${api}/api/advisors/profiles/${encodeURIComponent(username)}`)
        ]);

        if (response.status === 404) {
            profileEl.innerHTML = backLink + message('Advisor not found.');
            return;
        }
        if (!response.ok) throw new Error('Failed to load the advisor profile');

        const profile = await response.json();

        // The browser tab should name the advisor, not just "Advisor".
        if (profile.businessName) document.title = `${profile.businessName} | Manager.io`;

        profileEl.innerHTML = `
            ${backLink}
            ${renderAdvisorCard(profile, { direction: languages[profile.language]?.direction, full: true })}
            <p class="pt-2">
                <a href="${api}/advisors/contact?username=${encodeURIComponent(username)}" class="inline-block rounded-md bg-indigo-600 px-3.5 py-2.5 text-base font-semibold text-white shadow-sm hover:bg-indigo-500 hover:text-white">
                    Contact ${escapeHtml(profile.businessName || 'this advisor')}
                </a>
            </p>`;
    } catch {
        profileEl.innerHTML = backLink + errorMessage('Failed to load the advisor profile. Please try again later.');
    }
}

if (username) await loadProfile();
else window.location.replace('/advisors/');
