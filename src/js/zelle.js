document.addEventListener('DOMContentLoaded', () => {
	const navTabs = document.querySelectorAll('#main-nav-tabs a[data-tab]');
	const mobileSidebarLinks = document.querySelectorAll('#sidebar a[data-tab]');
	const tabContents = document.querySelectorAll('main > div[id$="-tab"]');
	const menuToggle = document.getElementById('menu-toggle');
	const menuOpenIcon = document.getElementById('menu-open');
	const menuCloseIcon = document.getElementById('menu-close');
	const sidebar = document.getElementById('sidebar');

	// --- Tab Switching Logic ---
	const activateTab = (tabId) => {
		// Remove active class from all nav tabs and sidebar links
		navTabs.forEach(link => link.classList.remove('tab-active'));
		mobileSidebarLinks.forEach(link => link.classList.remove('tab-active'));

		// Hide all tab content
		tabContents.forEach(content => content.classList.add('hidden'));

		// Show the selected tab content
		const targetContent = document.getElementById(tabId);
		if (targetContent) {
			targetContent.classList.remove('hidden');
		}

		// Add active class to the corresponding navigation link
		navTabs.forEach(link => {
			if (link.dataset.tab === tabId) {
				link.classList.add('tab-active');
			}
		});
		mobileSidebarLinks.forEach(link => {
			if (link.dataset.tab === tabId) {
				link.classList.add('tab-active');
			}
		});
	};

	// Handle initial page load based on URL query parameter
	const initialLoadTab = () => {
		const params = new URLSearchParams(window.location.search);
		const tabParam = params.get('tab');

		if (tabParam) {
			// If a tab parameter exists, activate that tab
			activateTab(tabParam);
		} else {
			// Default to Accounts tab if no parameter is present
			activateTab('send-money-tab');
			// Update URL to reflect default tab
			const newUrl = new URL(window.location.href);
			newUrl.searchParams.set('tab', 'send-money-tab');
			window.history.replaceState(null, '', newUrl.toString());
		}
	};

	navTabs.forEach(link => {
		link.addEventListener('click', (e) => {
			e.preventDefault();
			const tabId = e.target.dataset.tab;
			activateTab(tabId);

			// Update URL query parameter
			const newUrl = new URL(window.location.href);
			newUrl.searchParams.set('tab', tabId);
			window.history.pushState(null, '', newUrl.toString());
		});
	});

	// Add event listeners for mobile sidebar links
	mobileSidebarLinks.forEach(link => {
		link.addEventListener('click', (e) => {
			e.preventDefault();
			const tabId = e.target.dataset.tab;
			activateTab(tabId);

			// Update URL query parameter
			const newUrl = new URL(window.location.href);
			newUrl.searchParams.set('tab', tabId);
			window.history.pushState(null, '', newUrl.toString());

			// Close sidebar after clicking a link
			sidebar.classList.add('-translate-x-full');
			menuOpenIcon.classList.remove('menu-hidden');
			menuCloseIcon.classList.add('menu-hidden');
		});
	});

	// Handle back/forward button navigation
	window.addEventListener('popstate', () => {
		initialLoadTab();
	});

	// Initial load call
	initialLoadTab();


	// --- Mobile Menu Toggle Logic ---
	menuToggle.addEventListener('click', () => {
		sidebar.classList.toggle('-translate-x-full');
		menuOpenIcon.classList.toggle('menu-hidden');
		menuCloseIcon.classList.toggle('menu-hidden');
	});
});

const recipientInput = document.getElementById('choose-recipient');
const clearBtn = document.getElementById('clear-search-btn');

clearBtn.addEventListener('click', () => {
	recipientInput.value = '';
});
