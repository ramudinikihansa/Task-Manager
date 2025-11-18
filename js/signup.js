const USERS_KEY = 'taskmanager.users';

function getUsers() {
  const raw = localStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

const signupForm = document.getElementById('signupForm');
signupForm.addEventListener('submit', e => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if(password !== confirmPassword) {
    alert('Passwords do not match');
    return;
  }

  const users = getUsers();
  if(users.find(u => u.email === email)) {
    alert('Email already registered');
    return;
  }

  users.push({ username, email, password });
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  alert('Account created successfully!');
  window.location.href = 'login.html';
});
