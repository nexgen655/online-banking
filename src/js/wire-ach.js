const client = new Appwrite.Client();
client
	.setEndpoint("https://fra.cloud.appwrite.io/v1")
	.setProject("68451698002950a2a9c0");

const account = new Appwrite.Account(client);
const databases = new Appwrite.Databases(client);
const DATABASE_ID = "6848c2dc000a6e528a69";

// --- Transfer note ---
const fromAccountSelect = document.getElementById("fromAccount");
const checkingsAcct = document.getElementById("checking-acct-balance");
const savingsAcct = document.getElementById("savings-acct-balance");
const recipientAccountSelect = document.getElementById('recipient-account');
const startDate = document.getElementById("estimated-start-date");
const endDate = document.getElementById("estimated-end-date");
const description = document.getElementById("description");
const amount = document.getElementById("amount");
const requiredNotice = document.getElementById("required-notice");
const frequency = document.getElementById("frequency");
const datePicker = document.getElementById("date-picker");
const sameBusinessDayCheckbox =
	document.getElementById("sameBusinessDay");
const nextBusinessDayCheckbox =
	document.getElementById("nextBusinessDay");

// -- Confirm details ---
const confirmAccountSource = document.getElementById(
	"confirm-account-source"
);
const confirmRecipient = document.getElementById("confirm-recipient");
const confirmDeliverySpeed = document.getElementById(
	"confirm-delivery-speed"
);
const confirmAmount = document.getElementById("confirm-amount");
const confirmDeliveryFee = document.getElementById(
	"confirm-delivery-fee"
);
const confirmFrequency = document.getElementById("confirm-frequency");
const confirmStartDate = document.getElementById("confirm-start-date");
const confirmEndDate = document.getElementById("confirm-end-date");
const confirmDescription = document.getElementById("confirm-description");

// --- Continue buttons ---
const continueTransferBtn = document.getElementById('continue-transfer-btn');
const cancelTransferBtn = document.getElementById('cancel-transfer-btn');

// Scam reminder popup
const scamReminderOverlay = document.getElementById('scam-reminder-overlay');
const scamPopupContinueBtn = document.getElementById('scam-popup-continue-btn');
const scamPopupCancelBtn = document.getElementById('scam-popup-cancel-btn');

// Confirm details popup
const confirmDetailsOverlay = document.getElementById('confirm-details-overlay');
const makeTransferFinalBtn = document.getElementById('make-transfer-final-btn');
const dontMakeTransferBtn = document.getElementById('dont-make-transfer-btn');

// Close transfer popup
const closeTransferSuccessBtn = document.getElementById('close-transfer-success-btn');
const closeTransferSuccessOverlay = document.getElementById('close-transfer-success-overlay');

// Loading spinner popup
const loadingSpinnerOverlay = document.getElementById('loading-spinner');

// Add recipient success popup
const addRecipientBtn = document.getElementById('add-recipient-btn');
const addRecipientSuccessOverlay = document.getElementById('add-recipient-success-overlay');
const viewRecipientsBtn = document.getElementById('view-recipients-btn');
const cancelRecipientFormBtn = document.getElementById('cancel-add-recipient-btn');

// --- Fetch Account Balances ---
let preCheckingBalance;
let preSavingsBalance;
databases
	.getDocument(
		DATABASE_ID,
		"6848c34500258a8bceb4",
		"6848c73100075b19d4b9"
	)
	.then((result) => {
		checkingsAcct.textContent = `My Checking: $${new Intl.NumberFormat(
			"en-US"
		).format(result.checking_account)}`;
		preCheckingBalance = result.checking_account;

		savingsAcct.textContent = `My Savings: $${new Intl.NumberFormat(
			"en-US"
		).format(result.savings_account)}`;
		preSavingsBalance = result.savings_account;
	});


let deliveryFee = 0.00;
function updateDeliveryDetails() {
	if (sameBusinessDayCheckbox.checked) {
		confirmDeliveryFee.textContent = "$30.00";
		confirmDeliverySpeed.textContent = "Same Day";

		deliveryFee = 30.00;
	} else if (nextBusinessDayCheckbox.checked) {
		confirmDeliveryFee.textContent = "$0.00";
		confirmDeliverySpeed.textContent = "Next Day";
	}
}

let recipients = [];
function populateConfirmDetails() {
	const recipient = recipients?.find(recipient => recipient.$id === recipientAccountSelect.value);

	confirmAccountSource.textContent = fromAccountSelect.value;
	confirmRecipient.textContent = `${recipient?.name.toUpperCase()} - (${recipient?.bank.toUpperCase()})`;

	confirmAmount.textContent = `$${new Intl.NumberFormat("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(parseFloat(amount.value))}`;

	confirmFrequency.textContent = frequency.value;
	confirmStartDate.textContent = startDate.textContent;
	confirmEndDate.textContent = endDate.textContent;
	confirmDescription.textContent = `${description.value || "Transfer"} - ${recipient?.name.toUpperCase()}`;

	updateDeliveryDetails();
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
			activateTab('send-tab');
			// Update URL to reflect default tab
			const newUrl = new URL(window.location.href);
			newUrl.searchParams.set('tab', 'send-tab');
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

	// --- Estimated delivery times ---
	const currentDate = new Date().toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
	startDate.textContent = currentDate;
	endDate.textContent = currentDate;

	// Fetch Recipients
	const response = await databases.listDocuments(
		DATABASE_ID,
		'6848c313000eb80c0e27'
	);
	recipients = response.documents;

	// --- Initial population of Confirm Details popup ---
	populateConfirmDetails();

	// --- Populate Recipient List ---
	populateRecipientList();
	populateRecipientSelect();
});

// Function to show any given popup overlay
const showOverlay = (overlayElement) => {
	overlayElement.classList.remove('hidden');
	overlayElement.classList.add('flex');
	document.body.classList.add('overflow-hidden');
};

// Function to hide any given popup overlay
const hideOverlay = (overlayElement) => {
	overlayElement.classList.remove('flex');
	overlayElement.classList.add('hidden');
	document.body.classList.remove('overflow-hidden');
};

// --- Event listeners to display and hide required popups ---
cancelTransferBtn.addEventListener('click', () => {
	window.location.href = 'home.html?tab=transfers-tab';
});

// Continue after filling transfer form
continueTransferBtn.addEventListener('click', async () => {
	if (amount.value === '') {
		requiredNotice.classList.remove('hidden');
		window.location.href = '#required-notice';

		return;
	}

	populateConfirmDetails();
	showOverlay(scamReminderOverlay);
});

scamPopupContinueBtn.addEventListener('click', () => {
	hideOverlay(scamReminderOverlay);
	showOverlay(confirmDetailsOverlay);
});

scamPopupCancelBtn.addEventListener('click', () => {
	hideOverlay(scamReminderOverlay);
});

// Process wire transfer
makeTransferFinalBtn.addEventListener('click', async () => {
	hideOverlay(confirmDetailsOverlay);
	showOverlay(loadingSpinnerOverlay);

	let status;
	confirmEndDate.textContent === confirmStartDate.textContent ? status = 'success' : status = 'scheduled';

	// Create new transaction
	await databases.createDocument(
		DATABASE_ID,
		'6848c35f0032ff245a24',
		Appwrite.ID.unique(),
		{
			description: confirmDescription.textContent,
			amount: parseFloat(amount.value),
			method: 'wire_transfer',
			type: 'withdrawal',
			status,
			date: confirmEndDate.textContent,
		},
	);

	let newBalanceUpdate = {};
	if (confirmAccountSource.textContent.includes('Checking')) {
		newBalanceUpdate = { checking_account: preCheckingBalance - parseFloat(amount.value) - deliveryFee };
	} else if (confirmAccountSource.textContent.includes('Savings')) {
		newBalanceUpdate = { savings_account: preSavingsBalance - parseFloat(amount.value) - deliveryFee };
	}

	// Update user account balances
	await databases.updateDocument(
		DATABASE_ID,
		"6848c34500258a8bceb4",
		"6848c73100075b19d4b9",
		newBalanceUpdate
	);

	setTimeout(() => {
		hideOverlay(loadingSpinnerOverlay);
		showOverlay(closeTransferSuccessOverlay);
	}, 1250);
});

closeTransferSuccessBtn.addEventListener('click', () => {
	hideOverlay(closeTransferSuccessOverlay);
	window.location.href = 'home.html?tab=transfers-tab';
});

dontMakeTransferBtn.addEventListener('click', () => {
	hideOverlay(confirmDetailsOverlay);
});

// Close any popup if clicking outside the overlay
scamReminderOverlay.addEventListener('click', (e) => {
	if (e.target === scamReminderOverlay) {
		hideOverlay(scamReminderOverlay);
	}
});
confirmDetailsOverlay.addEventListener('click', (e) => {
	if (e.target === confirmDetailsOverlay) {
		hideOverlay(confirmDetailsOverlay);
	}
});

addRecipientBtn.addEventListener('click', () => showOverlay(addRecipientSuccessOverlay));

viewRecipientsBtn.addEventListener('click', () => {
	window.location.href = 'wire-ach.html?tab=manage-tab';
});

cancelRecipientFormBtn.addEventListener('click', () => {
	window.location.href = 'wire-ach.html?tab=send-tab';
});

// Event listeners for delivery speed checkboxes
sameBusinessDayCheckbox.addEventListener("change", updateDeliveryDetails);
nextBusinessDayCheckbox.addEventListener("change", updateDeliveryDetails);

// Display date for scheduled transfers
frequency.addEventListener("change", () => {
	if (frequency.value === "One time, scheduled") {
		frequency.classList.add("mb-3");
		datePicker.classList.remove("hidden");
		datePicker.previousElementSibling.classList.remove("hidden");
	} else if (frequency.value === "Weekly") {
		const currentDate = new Date();
		const nextWeekDate = new Date(currentDate.getTime() + (7 * 24 * 60 * 60 * 1000));

		endDate.textContent = nextWeekDate.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	} else if (frequency.value === "Every 2 weeks") {
		const currentDate = new Date();
		const nextWeekDate = new Date(currentDate.getTime() + (14 * 24 * 60 * 60 * 1000));

		endDate.textContent = nextWeekDate.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	} else if (frequency.value === "Monthly") {
		const currentDate = new Date();
		const nextWeekDate = new Date(currentDate.getTime() + (30 * 24 * 60 * 60 * 1000));

		endDate.textContent = nextWeekDate.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	} else {
		datePicker.classList.add("hidden");
		datePicker.previousElementSibling.classList.add("hidden");
	}

	populateConfirmDetails();
});

datePicker.addEventListener("change", () => {
	endDate.textContent = new Date(datePicker.value).toLocaleDateString(
		"en-US",
		{
			year: "numeric",
			month: "long",
			day: "numeric",
		}
	);

	populateConfirmDetails();
});

amount.addEventListener('input', populateConfirmDetails);
recipientAccountSelect.addEventListener('change', populateConfirmDetails);
description.addEventListener('input', populateConfirmDetails);
fromAccountSelect.addEventListener('change', populateConfirmDetails);

// --- Populate Recipient List ---
const recipientListBody = document.getElementById('recipient-list');
function formatRecipientDate(dateString) {
	if (!dateString) return 'N/A';
	try {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	} catch (e) {
		return 'Invalid Date';
	}
}

function maskAccountNumber(accountNumber) {
	const str = accountNumber.toString();
	const len = str.length;

	if (len === 10) {
		return '**** ** ' + str.slice(-4);
	} else if (len === 12) {
		return '**** **** ' + str.slice(-4);
	} else {
		throw new Error("Account number must be 10 or 12 digits.");
	}
}

function populateRecipientList() {
	if (recipients.length === 0) {
		recipientListBody.innerHTML = `
				<tr>
						<td colspan="4" class="px-4 lg:px-6 py-4 text-center text-gray-500">
								No recipients found.
						</td>
				</tr>
        `;

		return;
	}

	recipients.forEach(recipient => {
		const row = document.createElement('tr');
		row.className = 'hover:bg-gray-50';
		row.setAttribute('data-recipient-id', recipient.$id);

		row.innerHTML = `
				<td class="px-4 lg:px-6 py-2 lg:py-3 whitespace-nowrap">
						<div class="text-sm lg:text-base font-semibold tracking-wide">
								${maskAccountNumber(recipient.account_number)}
						</div>
						<div class="text-sm text-gray-500">
							<span class="font-medium">${recipient.name.toUpperCase()}</span>
							<span class="hidden lg:block">(${recipient.bank})</span>
						</div>
				</td>
				<td class="hidden md:table-cell px-4 lg:px-6 py-2 lg:py-3 whitespace-nowrap text-sm text-green-500">
					Verified
				</td>
				<td class="hidden md:table-cell px-2.5 lg:px-4 py-2 lg:py-3 whitespace-nowrap text-sm text-gray-500">
					${formatRecipientDate(recipient.date_of_last_transfer)}
				</td>
				<td class="px-2 lg:px-6 py-2 lg:py-3 whitespace-nowrap text-right text-sm font-medium">
						<span
								class="material-symbols-outlined delete-recipient-btn mr-2 md:mr-4 lg:pr-5 text-red-500 cursor-pointer hover:scale-105 hover:text-red-600"
								style="font-size: 25px"
								data-recipient-id="${recipient.$id}"
						>
								delete
						</span>
						<span
								class="material-symbols-outlined edit-recipient-btn text-blue-500 cursor-pointer hover:scale-105 hover:text-blue-600"
								style="font-size: 25px"
								data-recipient-id="${recipient.$id}"
						>
								edit
						</span>
				</td>
        `;
		recipientListBody.appendChild(row);
	});
}

// Populate recipient account list for transfers
function populateRecipientSelect() {
	if (recipients.length === 0) {
		const option = document.createElement('option');
		option.value = '';
		option.textContent = 'No recipients available';
		recipientAccountSelect.appendChild(option);
		recipientAccountSelect.disabled = true;

		return;
	}

	recipients.forEach(recipient => {
		const option = document.createElement('option');
		option.value = recipient.$id;
		option.textContent = `${recipient.name.toUpperCase()} (${recipient.bank.toUpperCase()})`;

		recipientAccountSelect.appendChild(option);
	});
}