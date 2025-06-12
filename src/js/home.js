const client = new Appwrite.Client();
client
	.setEndpoint("https://fra.cloud.appwrite.io/v1")
	.setProject("68451698002950a2a9c0");

const account = new Appwrite.Account(client);
const databases = new Appwrite.Databases(client);
const DATABASE_ID = "6848c2dc000a6e528a69";

// --- Display Account Balances ---
const checkingsAcct = document.getElementById("checking-acct-balance");
const savingsAcct = document.getElementById("savings-acct-balance");

databases
	.getDocument(
		DATABASE_ID,
		"6848c34500258a8bceb4",
		"6848c73100075b19d4b9"
	)
	.then((result) => {
		checkingsAcct.textContent = `$${new Intl.NumberFormat("en-US").format(
			result.checking_account
		)}`;
		savingsAcct.textContent = `$${new Intl.NumberFormat("en-US").format(
			result.savings_account
		)}`;
	});

// --- Display Transaction History ---
function formatMethodToTitleCase(str) {
	if (!str) return "";
	return str
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

function capitalizeFirstLetter(str) {
	if (!str) return "";
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function populateTransactionList(transactions, section) {
	const completedTransactionList = document.getElementById("completed-transaction-list");
	const secheduledTransactionList = document.getElementById("scheduled-transaction-list")

	if (!transactions || transactions.length === 0) {
		const emptyTransactionsNote = document.getElementById('empty-transactions-note');
		emptyTransactionsNote.classList.remove('hidden');
		emptyTransactionsNote.classList.add('flex');

		return;
	}

	transactions.forEach((transaction) => {
		const listItem = document.createElement("li");
		listItem.className =
			"flex items-center justify-between bg-gray-50 p-2.5 lg:p-3.5 rounded-lg border border-gray-100 cursor-pointer hover:shadow-sm";

		let iconName = "";
		let iconColorClass = "";
		let formattedStatus = '';

		let amountColorClass = "text-gray-500";
		if (transaction.type === "withdrawal") {
			iconName = "call_made";
			iconColorClass = "text-red-600 bg-red-200";
			amountColorClass = "text-red-500";

			if (transaction.status !== "scheduled") {
				formattedStatus = capitalizeFirstLetter(transaction.status);
			}
		} else if (transaction.type === "deposit") {
			iconName = "call_received";
			iconColorClass = "text-green-600 bg-green-200";
			amountColorClass = "text-blue-500";
		}

		let formattedMethod = formatMethodToTitleCase(transaction.method);
		if (formattedMethod.startsWith('Ach')) {
			formattedMethod = formattedMethod.slice(0, 3).toUpperCase() + formattedMethod.slice(3);
		}

		let statusColorClass;
		if (transaction.status === "success") {
			statusColorClass = "text-green-500";
		} else if (transaction.status === "failed") {
			statusColorClass = "text-red-500";
		} else if (transaction.status === "pending") {
			statusColorClass = "text-yellow-500";
		} else if (transaction.status === "scheduled") {
			statusColorClass = "text-amber-600";
		}

		const formattedAmount = new Intl.NumberFormat("en-US", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(parseFloat(transaction.amount));

		const transactionDate = new Date(transaction.date);
		const longDate = transactionDate.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
		const shortDate = transactionDate
			.toLocaleDateString("en-GB", {
				day: "2-digit",
				month: "2-digit",
				year: "2-digit",
			})
			.replace(/\//g, "-");

		listItem.innerHTML = `
			<div class="flex items-center space-x-4">
					<div class="flex-shrink-0">
							<span class="material-symbols-outlined ${iconColorClass} p-2 rounded-full">
									${iconName}
							</span>
					</div>
					<div>
							<p class="lg:text-lg font-bold">
									${transaction.description.toUpperCase()}
							</p>
							<p class="text-sm lg:text-base text-blue-500 lg:ml-0.5">
									${formattedMethod}
							</p>
					</div>
			</div>
			<div class="text-right lg:mr-2">
					<p class="text-sm text-gray-600 hidden lg:block">
							${longDate}
					</p>
					<p class="text-sm text-gray-600 lg:hidden tracking-wide">
							${shortDate}
					</p>
					<p class="text-lg font-semibold ${amountColorClass} tracking-wider">
							$${formattedAmount}
					</p>
					<p class="text-sm ${statusColorClass}">${formattedStatus}</p>
			</div>
      `;

		section === 'completed' ? completedTransactionList.appendChild(listItem) : secheduledTransactionList.appendChild(listItem);
	});
}

document.addEventListener('DOMContentLoaded', async () => {
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
			activateTab('accounts-tab');
			// Update URL to reflect default tab
			const newUrl = new URL(window.location.href);
			newUrl.searchParams.set('tab', 'accounts-tab');
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

	// --- Populate transaction list ---
	const transactions = await databases.listDocuments(
		DATABASE_ID,
		"6848c35f0032ff245a24"
	);

	const completedTransactions = transactions.documents.filter(transaction => transaction.type !== "scheduled").reverse();
	const scheduledTransactions = transactions.documents.filter(transaction => transaction.type === "scheduled").reverse();
	
	populateTransactionList(completedTransactions, 'completed');
	populateTransactionList(scheduledTransactions, 'scheduled');
});

const wireAchTransfer = document.getElementById('wire-ach-card');
wireAchTransfer.addEventListener('click', () => {
	window.location.href = 'wire-ach.html';
});

const billsCard = document.getElementById('bills-card');
billsCard.addEventListener('click', () => {
	window.location.href = 'bills.html';
});

const zelleCard = document.getElementById('zelle-card');
zelleCard.addEventListener('click', () => {
	window.location.href = 'zelle.html';
});

const transferCard = document.getElementById('transfer-card');
transferCard.addEventListener('click', () => {
	window.location.href = 'transfer.html';
});