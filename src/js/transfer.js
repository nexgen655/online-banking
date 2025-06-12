let preCheckingBalance = 0;
let preSavingBalance = 0;

const client = new Appwrite.Client();
client
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("68451698002950a2a9c0");

const account = new Appwrite.Account(client);
const databases = new Appwrite.Databases(client);

const fromAccountSelect = document.getElementById("fromAccount");
const toAccountSelect = document.getElementById("toAccount");
const amountInput = document.getElementById("amount");
const proceedBtn = document.getElementById("proceed-btn");
const loadingSpinner = document.getElementById("loading-spinner");
const transferSuccessOverlay = document.getElementById(
  "transfer-success-overlay"
);
const closeTransferSuccessBtn = document.getElementById(
  "close-transfer-success-btn"
);
const transferNote = document.getElementById("transfer-note");

const DATABASE_ID = "6848c2dc000a6e528a69";
const COLLECTION_ID = "6848c34500258a8bceb4";
const USER_DOCUMENT_ID = "6848c73100075b19d4b9";

const showOverlay = (overlayElement) => {
  overlayElement.classList.remove("hidden");
  overlayElement.classList.add("flex");
  document.body.classList.add("overflow-hidden");
};

const hideOverlay = (overlayElement) => {
  overlayElement.classList.remove("flex");
  overlayElement.classList.add("hidden");
  document.body.classList.remove("overflow-hidden");
};

function updateAccountOptionVisibility() {
  const selectedFrom = fromAccountSelect.value;

  Array.from(toAccountSelect.options).forEach((option) => {
    if (option.value === selectedFrom) {
      option.classList.add("hidden");
    } else {
      option.classList.remove("hidden");
    }
  });

  if (toAccountSelect.value === selectedFrom) {
    const firstVisibleOption = Array.from(toAccountSelect.options).find(
      (opt) => !opt.classList.contains("hidden")
    );
    if (firstVisibleOption) {
      toAccountSelect.value = firstVisibleOption.value;
    }
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const userDocument = await databases.getDocument(
      DATABASE_ID,
      COLLECTION_ID,
      USER_DOCUMENT_ID
    );

    preCheckingBalance = userDocument.checking_account;
    preSavingBalance = userDocument.savings_account;

    updateAccountOptionVisibility();
    checkAmountAndToggleProceedButton();
  } catch (error) {
    console.error("Error fetching initial account balances:", error);
  }
});

function checkAmountAndToggleProceedButton() {
  const amountValue = parseFloat(amountInput.value);
  proceedBtn.disabled = isNaN(amountValue) || amountValue <= 0;
}

amountInput.addEventListener("input", checkAmountAndToggleProceedButton);
amountInput.addEventListener("change", checkAmountAndToggleProceedButton);

fromAccountSelect.addEventListener(
  "change",
  updateAccountOptionVisibility
);

proceedBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  const amount = parseFloat(amountInput.value);

  if (isNaN(amount) || amount <= 0) {
    alert("Please enter a valid amount greater than zero.");
    return;
  }

  showOverlay(loadingSpinner);

  let postCheckingBalance = preCheckingBalance;
  let postSavingBalance = preSavingBalance;

  try {
    if (fromAccountSelect.value === "My Checking") {
      if (amount > preCheckingBalance) {
        alert("Insufficient funds in your Checking account.");
        hideOverlay(loadingSpinner);
        return;
      }

      postCheckingBalance = preCheckingBalance - amount;
      postSavingBalance = preSavingBalance + amount;
      transferNote.innerHTML = `You have transferred $<span class="font-bold text-lg">${amount}</span> to your Savings account.`;
    } else {
      if (amount > preSavingBalance) {
        alert("Insufficient funds in your Savings account.");
        hideOverlay(loadingSpinner);
        return;
      }

      postCheckingBalance = preCheckingBalance + amount;
      postSavingBalance = preSavingBalance - amount;
      transferNote.innerHTML = `You have transferred $<span class="font-bold text-lg">${amount}</span> to your Checking account.`;
    }

    await databases.updateDocument(
      DATABASE_ID,
      COLLECTION_ID,
      USER_DOCUMENT_ID,
      {
        checking_account: postCheckingBalance,
        savings_account: postSavingBalance,
      }
    );


    setTimeout(() => {
      hideOverlay(loadingSpinner);
      showOverlay(transferSuccessOverlay);
    }, 1000);
  } catch (error) {
    console.error("Error during transfer or document update:", error.message);
    hideOverlay(loadingSpinner);
    alert("An error occurred during transfer. Please try again.");
  }
});

closeTransferSuccessBtn.addEventListener("click", () => {
  hideOverlay(transferSuccessOverlay);
  window.location.href = "home.html?tab=transfers-tab";
});