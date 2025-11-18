const loginForm = document.getElementById('loginForm');

function getUsers() {
  const raw = localStorage.getItem('taskmanager.users');
  return raw ? JSON.parse(raw) : [];
}

loginForm.addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);

  if(user) {
    localStorage.setItem('taskmanager.loggedIn', JSON.stringify(user));
    alert(`Welcome ${user.username}!`);
    window.location.href = 'index.html';
  } else {
    alert('Invalid email or password');
  }
});
