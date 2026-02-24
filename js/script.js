document.addEventListener('DOMContentLoaded', () => {
    const navLeftContainer = document.getElementById('nav-left-container');
    const mainContentInner = document.getElementById('main-content-inner');
    const pageNavigation = document.getElementById('page-navigation');
    const tocLinksContainer = document.getElementById('toc-links');
    const sidebarLeft = document.getElementById('sidebar-left');
    const menuToggle = document.getElementById('menu-toggle');
    const themeToggle = document.getElementById('theme-toggle');

    // Theme Toggle
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('nepali-theme', next);
        });
    }

    // 1. Render Left Sidebar
    function renderSidebar() {
        let html = ``;

        courseData.forEach((part, partIndex) => {
            const isOpen = partIndex === 0;
            html += `<div class="nav-group">
                <div class="nav-category" data-open="${isOpen}">
                    ${part.part}
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(${isOpen ? '0' : '-90'}deg);">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>
                <div class="nav-part-content" style="display: ${isOpen ? 'block' : 'none'};">`;

            part.categories.forEach(cat => {
                if (partIndex !== 0) {
                    html += `<div class="nav-subcategory">${cat.title}</div>`;
                }
                html += `<ul class="nav-links">`;

                cat.lessons.forEach(lesson => {
                    html += `<li><a href="#${lesson.id}" data-id="${lesson.id}">${lesson.title}</a></li>`;
                });

                html += `</ul>`;
            });

            html += `</div></div>`;
        });

        navLeftContainer.innerHTML = html;

        // Attach event listeners for categories
        const navCategories = document.querySelectorAll('.nav-category');
        navCategories.forEach(category => {
            category.addEventListener('click', () => {
                const content = category.nextElementSibling;
                const icon = category.querySelector('svg');
                const isOpen = category.getAttribute('data-open') === 'true';

                if (isOpen) {
                    content.style.display = 'none';
                    icon.style.transform = 'rotate(-90deg)';
                    category.setAttribute('data-open', 'false');
                } else {
                    content.style.display = 'block';
                    icon.style.transform = 'rotate(0deg)';
                    category.setAttribute('data-open', 'true');
                }
            });
        });
    }

    // 2. Render Main Content
    function renderContent(lessonId) {
        const lessonIndex = allLessons.findIndex(l => l.id === lessonId);
        const lesson = lessonIndex !== -1 ? allLessons[lessonIndex] : allLessons[0];

        // Update active link in sidebar
        document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
        const activeLink = document.querySelector(`.nav-links a[data-id="${lesson.id}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
            // Ensure parent part is open
            const partContent = activeLink.closest('.nav-part-content');
            if (partContent && partContent.style.display === 'none') {
                partContent.style.display = 'block';
                const category = partContent.previousElementSibling;
                if (category) {
                    category.setAttribute('data-open', 'true');
                    const icon = category.querySelector('svg');
                    if (icon) icon.style.transform = 'rotate(0deg)';
                }
            }
        }

        // Render content
        let contentHtml = `<h1 id="${lesson.id}">${lesson.title}</h1>`;
        if (lesson.content) {
            contentHtml += lesson.content;
        } else {
            contentHtml += `<p>Coming soon...</p>`;
        }
        mainContentInner.innerHTML = contentHtml;

        // Render TOC
        renderTOC();

        // Render Prev/Next
        renderPageNavigation(lessonIndex !== -1 ? lessonIndex : 0);

        // Scroll to top
        window.scrollTo(0, 0);
    }

    let scrollTimeout;

    // 3. Render TOC
    function renderTOC() {
        const headings = mainContentInner.querySelectorAll('h1, h2, h3');
        if (tocLinksContainer) {
            tocLinksContainer.innerHTML = '';
            headings.forEach(heading => {
                if (!heading.id) {
                    heading.id = heading.textContent.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
                }
                const li = document.createElement('li');
                li.className = `toc-${heading.tagName.toLowerCase()}`;
                const a = document.createElement('a');
                a.href = `#${heading.id}`;
                a.textContent = heading.textContent;

                // Smooth scroll for TOC links
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetElement = document.getElementById(heading.id);
                    if (targetElement) {
                        const headerOffset = 80;
                        const elementPosition = targetElement.getBoundingClientRect().top;
                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                    }
                });

                li.appendChild(a);
                tocLinksContainer.appendChild(li);
            });
        }

        initScrollspy();
    }

    function initScrollspy() {
        const headings = Array.from(mainContentInner.querySelectorAll('h1, h2, h3'));
        const tocLinks = document.querySelectorAll('.toc-links a');

        if (headings.length === 0 || tocLinks.length === 0) return;

        function updateActiveTOC() {
            const scrollPosition = window.scrollY + 100; // Offset for header + buffer

            // Find the last heading that is above the current scroll position
            let currentHeading = headings[0];
            for (let i = 0; i < headings.length; i++) {
                // Use offsetTop relative to the document
                const headingTop = headings[i].getBoundingClientRect().top + window.scrollY;
                if (headingTop <= scrollPosition) {
                    currentHeading = headings[i];
                } else {
                    break;
                }
            }

            if (currentHeading) {
                const id = currentHeading.getAttribute('id');
                tocLinks.forEach(link => link.classList.remove('active'));
                const activeLink = document.querySelector(`.toc-links a[href="#${id}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        }

        // Remove old listener if exists
        if (window._scrollSpyListener) {
            window.removeEventListener('scroll', window._scrollSpyListener);
        }

        window._scrollSpyListener = () => {
            if (scrollTimeout) {
                window.cancelAnimationFrame(scrollTimeout);
            }
            scrollTimeout = window.requestAnimationFrame(updateActiveTOC);
        };

        window.addEventListener('scroll', window._scrollSpyListener);

        // Initial call
        updateActiveTOC();
    }

    // 4. Render Page Navigation
    function renderPageNavigation(currentIndex) {
        let html = '';

        if (currentIndex > 0) {
            const prevLesson = allLessons[currentIndex - 1];
            html += `
                <a href="#${prevLesson.id}" class="nav-prev">
                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    <div style="display:flex; flex-direction:column; align-items:flex-start;">
                        <span style="font-size: 0.75rem; opacity: 0.7;">Previous</span>
                        <span>${prevLesson.title}</span>
                    </div>
                </a>
            `;
        } else {
            html += `<div></div>`; // Empty div for flexbox spacing
        }

        if (currentIndex < allLessons.length - 1) {
            const nextLesson = allLessons[currentIndex + 1];
            html += `
                <a href="#${nextLesson.id}" class="nav-next">
                    <div style="display:flex; flex-direction:column; align-items:flex-end;">
                        <span style="font-size: 0.75rem; opacity: 0.7;">Next</span>
                        <span>${nextLesson.title}</span>
                    </div>
                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                </a>
            `;
        }

        pageNavigation.innerHTML = html;
    }

    // 5. Handle Routing
    function handleRoute() {
        const hash = window.location.hash.substring(1);
        const lessonExists = allLessons.some(l => l.id === hash);

        if (lessonExists) {
            renderContent(hash);
        } else if (hash === '') {
            // Default to first lesson
            renderContent(allLessons[0].id);
        } else {
            // It might be a TOC link within the page, let the browser handle it
            // Or we just scroll to it if it exists in the current DOM
            const target = document.getElementById(hash);
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            } else {
                // If not found, default to first lesson
                renderContent(allLessons[0].id);
            }
        }
    }

    window.addEventListener('hashchange', handleRoute);

    // 6. Mobile Menu Toggle
    if (menuToggle && sidebarLeft) {
        menuToggle.addEventListener('click', () => {
            sidebarLeft.classList.toggle('open');
        });

        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 800) {
                if (!sidebarLeft.contains(e.target) && !menuToggle.contains(e.target)) {
                    sidebarLeft.classList.remove('open');
                }
            }
        });
    }

    // Initialize
    renderSidebar();
    handleRoute();
});
