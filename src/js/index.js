const client = new Appwrite.Client();
client
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("68451698002950a2a9c0");

const account = new Appwrite.Account(client);
const databases = new Appwrite.Databases(client);

const loginBtn = document.getElementById('login-btn');
const loginBtnSpinner = document.getElementById('login-btn-spinner');
const loginSecurityIcon = document.getElementById('login-security-icon');
const userIdInput = document.getElementById('user-id');
const passwordInput = document.getElementById('password');
const userIdNotice = document.getElementById('user-id-notice');
const passwordNotice = document.getElementById('password-notice');

function showNotice(noticeElement, message, inputElement) {
  noticeElement.textContent = message;
  noticeElement.classList.remove('hidden');
  noticeElement.classList.add('mb-2');
  inputElement.classList.remove('mb-3');

  loginBtnSpinner.classList.add('menu-hidden');
  loginSecurityIcon.classList.remove('menu-hidden');
}

function hideNotice(noticeElement, inputElement) {
  noticeElement.textContent = '';
  noticeElement.classList.add('hidden');
  noticeElement.classList.remove('mb-2');
  inputElement.classList.add('mb-3');
}

loginBtn.addEventListener('click', async () => {
  const userId = userIdInput.value.trim();
  const password = passwordInput.value.trim();

  loginBtnSpinner.classList.remove('menu-hidden');
  loginSecurityIcon.classList.add('menu-hidden');

  if (!userId) {
    hideNotice(passwordNotice, passwordInput);
    showNotice(userIdNotice, 'Please enter your user ID', userIdInput);

    return;
  } else if (!password) {
    hideNotice(userIdNotice, userIdInput);
    showNotice(passwordNotice, 'Please enter your password', passwordInput);

    return;
  }

  try {
    const result = await databases.getDocument(
      "6848c2dc000a6e528a69",
      "6848c34500258a8bceb4",
      "6848c73100075b19d4b9"
    );

    if (result.user_id !== userId) {
      hideNotice(passwordNotice, passwordInput);
      showNotice(userIdNotice, 'User ID is invalid', userIdInput);

      return;
    } else if (result.password !== password) {
      hideNotice(userIdNotice, userIdInput);
      showNotice(passwordNotice, 'Password is incorrect', passwordInput);

      return;
    }

    setTimeout(() => {
      window.location.href = 'home.html?tab=accounts-tab';
    }, 1000);
  } catch (error) {
    console.log(error);
  }
})