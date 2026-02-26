import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Your exact Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBy4uZGPLNdK0vPzYY3YPSNY14Ri9CIR9M",
  authDomain: "gamified-task-master.firebaseapp.com",
  projectId: "gamified-task-master",
  storageBucket: "gamified-task-master.firebasestorage.app",
  messagingSenderId: "31257447033",
  appId: "1:31257447033:web:d3dea1c1d1678e3b9ba2a8",
  measurementId: "G-SPSVCMLRH0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// DOM Elements: Auth
const loginScreen = document.getElementById('login-screen');
const registerScreen = document.getElementById('register-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const loginBtn = document.getElementById('login-submit-btn');
const loginError = document.getElementById('login-error');
const goToRegister = document.getElementById('go-to-register');
const regEmail = document.getElementById('reg-email');
const regUsername = document.getElementById('reg-username');
const regPassword = document.getElementById('reg-password');
const regConfirm = document.getElementById('reg-confirm');
const registerBtn = document.getElementById('register-submit-btn');
const registerError = document.getElementById('register-error');
const goToLogin = document.getElementById('go-to-login');
const logoutBtn = document.getElementById('logout-btn');

// DOM Elements: Game Stats & Nav
const userDisplayName = document.getElementById('user-display-name');
const levelDisplay = document.getElementById('level-display');
const currentXpDisplay = document.getElementById('current-xp');
const maxXpDisplay = document.getElementById('max-xp');
const xpBarFill = document.getElementById('xp-bar-fill');
const gemDisplay = document.getElementById('gem-display');
const goldDisplay = document.getElementById('gold-display');
const navBtns = document.querySelectorAll('.nav-btn');
const appViews = document.querySelectorAll('.app-view');
const currentAvatarImg = document.getElementById('current-avatar');

// DOM Elements: Custom Inputs
const habitInput = document.getElementById('new-habit-input');
const addHabitBtn = document.getElementById('add-habit-btn');
const habitsList = document.getElementById('habits-list');

const dailyInput = document.getElementById('new-daily-input');
const addDailyBtn = document.getElementById('add-daily-btn');
const dailiesList = document.getElementById('dailies-list');

const todoInput = document.getElementById('new-todo-input');
const addTodoBtn = document.getElementById('add-todo-btn');
const todosList = document.getElementById('todos-list');

const rewardInput = document.getElementById('new-reward-input');
const addRewardBtn = document.getElementById('add-reward-btn');
const rewardsList = document.getElementById('rewards-list');

// --- NAVIGATION LOGIC ---
navBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    navBtns.forEach(b => b.classList.remove('active'));
    appViews.forEach(v => v.classList.remove('active'));
    
    const targetBtn = e.target;
    targetBtn.classList.add('active');
    
    const targetViewId = targetBtn.dataset.target;
    document.getElementById(targetViewId).classList.add('active');
  });
});

// --- GAME STATE LOGIC ---
let playerState = {
  level: 1,
  xp: 0,
  gems: 0,
  gold: 0,
  ownedAvatars: ['novice'],
  equippedAvatar: 'novice'
};

function calculateMaxXP(level) {
  return 40 + (level * 10);
}

function updateStatUI() {
  levelDisplay.textContent = playerState.level;
  currentXpDisplay.textContent = playerState.xp;
  
  const currentMaxXP = calculateMaxXP(playerState.level);
  maxXpDisplay.textContent = currentMaxXP;
  
  const xpPercentage = Math.min((playerState.xp / currentMaxXP) * 100, 100);
  xpBarFill.style.width = `${xpPercentage}%`;
  
  gemDisplay.textContent = playerState.gems;
  goldDisplay.textContent = playerState.gold;
}

function updateAvatarUI() {
  const avatarBtns = document.querySelectorAll('.avatar-btn');
  
  avatarBtns.forEach(btn => {
    const avatarId = btn.dataset.id;
    const originalCost = btn.dataset.cost;
    const currency = btn.dataset.currency;
    
    if (playerState.ownedAvatars.includes(avatarId)) {
      if (playerState.equippedAvatar === avatarId) {
        btn.textContent = "Equipped";
        btn.className = "buy-btn equip-btn avatar-btn"; 
        btn.disabled = true;
      } else {
        btn.textContent = "Equip";
        btn.className = "buy-btn equip-action-btn avatar-btn"; 
        btn.disabled = false;
      }
    } else {
      btn.textContent = currency === 'gem' ? `💎 ${originalCost}` : `🪙 ${originalCost}`;
      btn.className = currency === 'gem' ? "buy-btn gem-buy-btn avatar-btn" : "buy-btn gold-buy-btn avatar-btn";
      btn.disabled = false;
    }
  });

  const equippedBtn = document.querySelector(`.avatar-btn[data-id="${playerState.equippedAvatar}"]`);
  if(equippedBtn) {
    currentAvatarImg.src = equippedBtn.dataset.src;
  }
}

function gainXP(amount) {
  playerState.xp += amount;
  let currentMaxXP = calculateMaxXP(playerState.level);

  while (playerState.xp >= currentMaxXP) {
    playerState.xp -= currentMaxXP; 
    playerState.level += 1;
    playerState.gems += 1; 
    currentMaxXP = calculateMaxXP(playerState.level); 
  }

  updateStatUI();
}

function completeTask(xpReward, goldReward) {
  playerState.gold += goldReward;
  gainXP(xpReward);
}

// --- DYNAMIC TASK GENERATION LOGIC ---

function createHabitTask(taskText) {
  const card = document.createElement('div');
  card.className = 'task-card habit-card';
  
  const plusBtn = document.createElement('button');
  plusBtn.className = 'action-btn plus-btn';
  plusBtn.textContent = '+';
  plusBtn.addEventListener('click', () => completeTask(15, 10));

  const content = document.createElement('div');
  content.className = 'task-content';
  content.textContent = taskText;

  const minusBtn = document.createElement('button');
  minusBtn.className = 'action-btn minus-btn';
  minusBtn.textContent = '-';

  card.append(plusBtn, content, minusBtn);
  habitsList.prepend(card); 
}

function createDailyTask(taskText) {
  const card = document.createElement('div');
  card.className = 'task-card';
  
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'task-checkbox';
  
  // Stays ticked and disabled until the user manually reloads the page
  checkbox.addEventListener('change', (e) => {
    if (e.target.checked) {
      completeTask(15, 10);
      e.target.disabled = true; 
    }
  });

  const content = document.createElement('div');
  content.className = 'task-content';
  content.textContent = taskText;

  card.append(checkbox, content);
  dailiesList.prepend(card); 
}

function createTodoTask(taskText) {
  const card = document.createElement('div');
  card.className = 'task-card';
  
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'task-checkbox';
  
  checkbox.addEventListener('change', (e) => {
    if (e.target.checked) {
      completeTask(15, 10);
      card.style.opacity = '0.5';
      card.style.textDecoration = 'line-through';
      e.target.disabled = true; 
    }
  });

  const content = document.createElement('div');
  content.className = 'task-content';
  content.textContent = taskText;

  card.append(checkbox, content);
  todosList.prepend(card); 
}

function createRewardTask(rewardText) {
  const card = document.createElement('div');
  card.className = 'task-card reward-card';
  
  const content = document.createElement('div');
  content.className = 'task-content';
  content.textContent = rewardText;

  const buyBtn = document.createElement('button');
  buyBtn.className = 'buy-btn gold-buy-btn';
  buyBtn.textContent = '🪙 10';
  buyBtn.addEventListener('click', () => {
    if (playerState.gold >= 10) {
      playerState.gold -= 10;
      alert(`Purchased: ${rewardText} for 10 Gold!`);
      updateStatUI();
    } else {
      alert(`Not enough gold! You need ${10 - playerState.gold} more.`);
    }
  });

  card.append(content, buyBtn);
  rewardsList.prepend(card); 
}

// --- INPUT EVENT LISTENERS ---
function setupInputPair(btnElement, inputElement, createFunction) {
  btnElement.addEventListener('click', () => {
    const text = inputElement.value.trim();
    if (text) {
      createFunction(text);
      inputElement.value = ''; 
    }
  });
  inputElement.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') btnElement.click();
  });
}

setupInputPair(addHabitBtn, habitInput, createHabitTask);
setupInputPair(addDailyBtn, dailyInput, createDailyTask);
setupInputPair(addTodoBtn, todoInput, createTodoTask);
setupInputPair(addRewardBtn, rewardInput, createRewardTask);


// --- HARDCODED PLACEHOLDER EVENT LISTENERS ---

// Habits (Buttons)
document.querySelectorAll('.test-xp-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    completeTask(15, 10); 
  });
});

// Dailies and To-Do's (Checkboxes)
document.querySelectorAll('.test-xp-checkbox').forEach(checkbox => {
  checkbox.addEventListener('change', (e) => {
    if (e.target.checked) {
      completeTask(15, 10);
      e.target.disabled = true; // Prevents spam clicking, stays checked until reload
    }
  });
});

// Shop / Rewards
document.querySelectorAll('.buy-btn').forEach(btn => {
  if(btn.id === 'logout-btn' || btn.id === 'login-submit-btn' || btn.id === 'register-submit-btn') return;

  btn.addEventListener('click', (e) => {
    if(e.target.disabled) return;

    const isAvatar = e.target.classList.contains('avatar-btn');
    const id = e.target.dataset.id;
    const cost = parseInt(e.target.dataset.cost);
    const currency = e.target.dataset.currency;
    const itemName = e.target.dataset.name;
    const levelReq = parseInt(e.target.dataset.req) || 1;

    if (isAvatar && playerState.ownedAvatars.includes(id)) {
      playerState.equippedAvatar = id;
      updateAvatarUI();
      return; 
    }

    if (playerState.level < levelReq) {
      alert(`You must be Level ${levelReq} to unlock ${itemName}! Keep grinding!`);
      return;
    }

    if (currency === 'gold') {
      if (playerState.gold >= cost) {
        playerState.gold -= cost;
        alert(`Purchased: ${itemName} for ${cost} Gold!`);
      } else {
        alert(`Not enough gold! You need ${cost - playerState.gold} more.`);
        return;
      }
    } else if (currency === 'gem') {
      if (playerState.gems >= cost) {
        playerState.gems -= cost;
        alert(`Avatar Unlocked: ${itemName} for ${cost} Gems!`);
        
        if (isAvatar) {
          playerState.ownedAvatars.push(id);
          playerState.equippedAvatar = id;
        }
      } else {
        alert(`Not enough gems! Level up ${cost - playerState.gems} more times.`);
        return;
      }
    }
    
    updateStatUI(); 
    if (isAvatar) updateAvatarUI();
  });
});

// Initialize on load
updateStatUI();
updateAvatarUI();

// --- AUTHENTICATION LOGIC ---

goToRegister.addEventListener('click', () => {
  loginScreen.classList.add('hidden');
  registerScreen.classList.remove('hidden');
  loginError.textContent = ""; 
});

goToLogin.addEventListener('click', () => {
  registerScreen.classList.add('hidden');
  loginScreen.classList.remove('hidden');
  registerError.textContent = "";
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    loginScreen.classList.add('hidden');
    registerScreen.classList.add('hidden');
    dashboardScreen.classList.remove('hidden'); 
    userDisplayName.textContent = user.displayName || user.email;
    loginPassword.value = ''; regPassword.value = ''; regConfirm.value = '';
    
    // For now, reset to local memory state on login
    playerState = { level: 1, xp: 0, gems: 0, gold: 0, ownedAvatars: ['novice'], equippedAvatar: 'novice' };
    updateStatUI();
    updateAvatarUI();

  } else {
    loginScreen.classList.remove('hidden');
    registerScreen.classList.add('hidden');
    dashboardScreen.classList.add('hidden');
  }
});

registerBtn.addEventListener('click', () => {
  const email = regEmail.value.trim();
  const username = regUsername.value.trim();
  const password = regPassword.value;
  const confirmPassword = regConfirm.value;

  if (!email || !username || !password) {
    registerError.textContent = "Please fill in all fields.";
    return;
  }
  
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!passwordRegex.test(password)) {
    registerError.textContent = "Password must be at least 8 characters and include a capital letter, a number, and a special character.";
    return;
  }

  if (password !== confirmPassword) {
    registerError.textContent = "Passwords do not match.";
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      return updateProfile(userCredential.user, { displayName: username })
      .then(() => {
        userDisplayName.textContent = username;
        registerError.textContent = "";
      });
    })
    .catch((error) => { registerError.textContent = error.message; });
});

loginBtn.addEventListener('click', () => {
  const email = loginEmail.value.trim();
  const password = loginPassword.value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => { loginError.textContent = ""; })
    .catch((error) => { 
      console.error("Firebase Login Error:", error);
      loginError.textContent = `Login Failed: ${error.code}. Please check your credentials.`; 
    });
});

logoutBtn.addEventListener('click', () => {
  signOut(auth).catch((error) => console.error(error));
});