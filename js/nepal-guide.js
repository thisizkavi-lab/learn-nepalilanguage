// Shared gallery/detail interaction for food, communities and places.
const NepalGuide = (() => {
    const escape = (text) => String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
    const normalize = (text) => text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const art = (item, extraClass = '') => {
        const url = new URL(`assets/nepal-guide/${item.art[0]}.webp`, document.baseURI).href;
        return `<span class="guide-art ${extraClass}" aria-hidden="true" style="--atlas:url('${url}');--art-x:${item.art[1] * 50}%;--art-y:${item.art[2] * 100}%"></span>`;
    };
    const sourceLinks = (ids) => ids.map(id => {
        const [label, url] = NepalGuideData.sources[id];
        return `<li><a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(label)}</a></li>`;
    }).join('');
    const navigation = (selected) => `<nav class="guide-tabs" aria-label="Explore Nepal">${[
        ['the-people', 'People & cultures'], ['places', 'Places'], ['food', 'Food'],
    ].map(([route, label]) => `<a href="#${route}" ${route === selected ? 'aria-current="page"' : ''}>${label}</a>`).join('')}</nav>`;

    function parseRoute(hash) {
        const [path, query = ''] = hash.replace(/^#/, '').split('?');
        const [lesson, item = ''] = path.split('/');
        return { lesson, item, params: new URLSearchParams(query) };
    }

    function mount(root, collectionId, route) {
        const collection = NepalGuideData.collections[collectionId];
        const abort = new AbortController();
        const listen = (node, event, fn) => node.addEventListener(event, fn, { signal: abort.signal });
        let category = collection.filters.some(([id]) => id === route.params.get('category')) ? route.params.get('category') : 'all';
        let query = (route.params.get('q') || '').slice(0, 100);
        let selectedId = route.item;
        let mobileDetailOpen = Boolean(route.item);
        const mobile = window.matchMedia('(max-width: 700px)');

        root.insertAdjacentHTML('beforeend', `
            <p class="guide-lead">${escape(collection.subtitle)}</p>
            ${navigation(collection.route)}
            <div class="guide-browser">
                <div class="guide-catalog">
                    <label class="guide-search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></svg>
                        <input type="search" placeholder="${escape(collection.search)}" aria-label="${escape(collection.searchLabel)}" value="${escape(query)}" maxlength="100" autocomplete="off">
                    </label>
                    <div class="guide-filters" role="group" aria-label="Filter ${escape(collection.noun)}">
                        ${collection.filters.map(([id, label]) => `<button type="button" data-filter="${id}" aria-pressed="${id === category}">${escape(label)}</button>`).join('')}
                    </div>
                    <div class="guide-gallery" aria-label="${escape(collection.noun)}"></div>
                    <p class="guide-result-count" role="status" aria-live="polite" aria-atomic="true"></p>
                </div>
                <aside class="guide-detail" id="guide-detail" aria-labelledby="guide-detail-title"></aside>
            </div>
            <div class="guide-endnote"><p>${escape(collection.note)}</p>
                <details class="guide-sources"><summary>Sources & further reading</summary><ul>${sourceLinks(collection.sources)}</ul><p>Illustrations are original, imagined scenes created for this guide. Community entries describe starting points for learning; the drawings depict individual moments.</p></details>
            </div>`);

        const gallery = root.querySelector('.guide-gallery');
        const detail = root.querySelector('.guide-detail');
        const browser = root.querySelector('.guide-browser');
        const search = root.querySelector('input[type="search"]');
        const count = root.querySelector('.guide-result-count');

        function matches() {
            const needle = normalize(query.trim());
            return collection.items.filter(item => (category === 'all' || item.groups.includes(category)) &&
                normalize([item.name, item.nepali, item.description, ...item.sections.flat()].join(' ')).includes(needle));
        }

        function saveRoute(push = false) {
            const params = new URLSearchParams();
            if (category !== 'all') params.set('category', category);
            if (query) params.set('q', query);
            const selection = selectedId ? `/${selectedId}` : '';
            const suffix = params.size ? `?${params}` : '';
            const hash = `#${collection.route}${selection}${suffix}`;
            if (window.location.hash !== hash) {
                window.history[push ? 'pushState' : 'replaceState'](null, '', hash);
            }
        }

        function relatedLinks(item) {
            return (item.related || []).map(path => {
                const [routeName, itemId] = path.split('/');
                const relatedCollection = Object.values(NepalGuideData.collections).find(c => c.route === routeName);
                const target = relatedCollection?.items.find(i => i.id === itemId);
                return target ? `<a href="#${path}">${escape(target.name)} ${NepalGuideData.arrow}</a>` : '';
            }).join('');
        }

        function positionDetail() {
            if (mobile.matches) {
                // Keep the detail next to its selected row, including after filtering.
                const cards = Array.from(gallery.querySelectorAll('[data-item]'));
                const index = cards.findIndex(card => card.dataset.item === selectedId);
                const rowEnd = cards[Math.min(Math.floor(index / 2) * 2 + 1, cards.length - 1)];
                if (rowEnd) rowEnd.after(detail);
                detail.hidden = !mobileDetailOpen || !cards.length;
            } else {
                browser.append(detail);
                detail.hidden = !selectedId;
            }
        }

        function renderDetail() {
            const item = collection.items.find(item => item.id === selectedId);
            if (!item) {
                detail.hidden = true;
                detail.innerHTML = '';
                return;
            }
            detail.innerHTML = `<button type="button" class="guide-detail-close">Back to the collection ${NepalGuideData.arrow}</button>
                ${art(item, 'guide-detail-art')}
                <h2 id="guide-detail-title" tabindex="-1">${escape(item.name)}</h2>
                <p class="guide-native" lang="ne">${escape(item.nepali)}</p>
                <p>${escape(item.description)}</p>
                ${item.sections.map(([heading, content]) => `<h3>${escape(heading)}</h3><p>${escape(content)}</p>`).join('')}
                <div class="guide-related"><h3>Keep exploring</h3>${relatedLinks(item)}</div>
                <details class="guide-sources"><summary>Read more & sources</summary><ul>${sourceLinks(item.sources)}</ul></details>`;
            gallery.querySelectorAll('[data-item]').forEach(button => {
                const active = button.dataset.item === selectedId;
                button.setAttribute('aria-pressed', String(active));
                button.setAttribute('aria-expanded', String(active && (!mobile.matches || mobileDetailOpen)));
            });
            positionDetail();
        }

        function renderGallery() {
            const items = matches();
            if (!items.some(item => item.id === selectedId)) selectedId = items[0]?.id || '';
            // Move the detail out before replacing the mobile gallery's contents.
            browser.append(detail);
            gallery.innerHTML = items.map(item => `<button type="button" class="guide-item" data-item="${item.id}" aria-label="Explore ${escape(item.name)}" aria-controls="guide-detail" aria-pressed="${item.id === selectedId}">
                ${art(item)}<span class="guide-item-name">${escape(item.name)}</span><span class="guide-item-native" lang="ne">${escape(item.nepali)}</span>
            </button>`).join('') || `<div class="guide-empty"><h2>No matches yet</h2><p>Try another name or explore the whole collection.</p><button type="button" class="guide-reset">Clear search & filters</button></div>`;
            count.textContent = `${items.length} of ${collection.items.length} ${collection.noun}`;
            root.querySelectorAll('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
            renderDetail();
        }

        listen(root, 'click', (event) => {
            const itemButton = event.target.closest('[data-item]');
            const filterButton = event.target.closest('[data-filter]');
            if (itemButton) {
                selectedId = itemButton.dataset.item;
                mobileDetailOpen = true;
                renderDetail();
                saveRoute(true);
                // Move keyboard focus to the newly revealed content, never on search/filter.
                detail.querySelector('h2').focus({ preventScroll: true });
                if (mobile.matches) detail.scrollIntoView({ block: 'start', behavior: 'auto' });
            } else if (filterButton) {
                category = filterButton.dataset.filter;
                mobileDetailOpen = false;
                renderGallery();
                saveRoute();
            } else if (event.target.closest('.guide-reset')) {
                category = 'all'; query = ''; search.value = ''; mobileDetailOpen = false;
                renderGallery(); saveRoute(); search.focus();
            } else if (event.target.closest('.guide-detail-close')) {
                mobileDetailOpen = false;
                renderDetail();
                gallery.querySelector(`[data-item="${selectedId}"]`)?.focus();
            }
        });
        listen(search, 'input', () => {
            query = search.value;
            mobileDetailOpen = false;
            renderGallery(); saveRoute();
        });
        listen(root, 'keydown', (event) => {
            if (event.key === 'Escape' && detail.contains(event.target)) {
                if (mobile.matches) {
                    mobileDetailOpen = false;
                    renderDetail();
                }
                gallery.querySelector(`[data-item="${selectedId}"]`)?.focus();
            }
        });
        listen(mobile, 'change', () => renderDetail());
        renderGallery();
        // Keep bare entry links short; invalid explicit selections recover to a valid item.
        if (route.item || route.params.size) saveRoute();
        return () => abort.abort();
    }
    return { mount, parseRoute };
})();
