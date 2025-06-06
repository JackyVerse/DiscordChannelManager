// Popup stack management
const popupStack = {
  stack: [],
  
  add(popup) {
    // Check if this popup is already in the stack
    const existingIndex = this.stack.findIndex(p => p.id === popup.id);
    if (existingIndex !== -1) {
      // If it exists, update its content
      const existingPopup = this.stack[existingIndex];
      const messageElem = existingPopup.querySelector('.popup-body p');
      messageElem.textContent = popup.querySelector('.popup-body p').textContent;
      return;
    }

    // Check if any popup is currently displayed
    const isAnyPopupShowing = document.querySelector('.popup.show') !== null;
    
    if (isAnyPopupShowing) {
      // If a popup is displayed, add to stack
      this.stack.push(popup);
    } else {
      // If no popup is displayed, add to stack and show immediately
      this.stack.push(popup);
      this.showNext();
    }
  },
  
  remove(popupId) {
    // Remove popup from stack
    this.stack = this.stack.filter(p => p.id !== popupId);
    // Show next popup if any
    this.showNext();
  },
  
  showNext() {
    // Hide all popups
    document.querySelectorAll('.popup').forEach(popup => {
      popup.classList.remove('show');
    });
    
    // Show first popup in stack if any
    if (this.stack.length > 0) {
      const nextPopup = this.stack[0];
      nextPopup.classList.add('show');
    }
  }
};

// Popup handling
function showError(message) {
  console.log("showError: ", message);
  const popup = document.getElementById('errorPopup');
  const messageElem = document.getElementById('errorMessage');
  const currentMessage = messageElem.textContent;
  const isPopupShowing = popup.classList.contains('show');

  // If popup is displayed and has message
  if (isPopupShowing && currentMessage) {
    // Create new popup with new message
    const newPopup = popup.cloneNode(true);
    newPopup.id = 'errorPopup_' + Date.now(); // Create unique ID
    const newMessageElem = newPopup.querySelector('.popup-body p');
    newMessageElem.textContent = message;
    document.body.appendChild(newPopup);
    
    // Add to stack
    popupStack.add(newPopup);
  } else {
    // If popup is not displayed or has no message
    messageElem.textContent = message;
    popupStack.add(popup);
  }
}

function showSuccess(message) {
  const popup = document.getElementById('successPopup');
  const messageElem = document.getElementById('successMessage');
  const currentMessage = messageElem.textContent;
  const isPopupShowing = popup.classList.contains('show');

  // If popup is displayed and has message
  if (isPopupShowing && currentMessage) {
    // Create new popup with new message
    const newPopup = popup.cloneNode(true);
    newPopup.id = 'successPopup_' + Date.now(); // Create unique ID
    const newMessageElem = newPopup.querySelector('.popup-body p');
    newMessageElem.textContent = message;
    document.body.appendChild(newPopup);
    
    // Add to stack
    popupStack.add(newPopup);
  } else {
    // If popup is not displayed or has no message
    messageElem.textContent = message;
    popupStack.add(popup);
  }
}

function closePopup(popupId) {
  const popup = document.getElementById(popupId);
  if (popup) {
    // If it's a cloned popup, remove from DOM
    if (popupId.includes('_')) {
      popup.remove();
    }
    popupStack.remove(popupId);
  }
}

// Close popups when clicking close buttons
document.querySelectorAll('.popup-close, .popup-button').forEach(button => {
  button.addEventListener('click', () => {
    const popup = button.closest('.popup');
    closePopup(popup.id);
  });
});

// Close popups when clicking outside
document.querySelectorAll('.popup').forEach(popup => {
  popup.addEventListener('click', (e) => {
    if (e.target === popup) {
      closePopup(popup.id);
    }
  });
});

// Check authentication
async function checkAuth() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login';
    return false;
  }

  try {
    const response = await fetch('/check-auth', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return false;
    }

    return true;
  } catch (error) {
    console.error('Auth check error:', error);
    localStorage.removeItem('token');
    window.location.href = '/login';
    return false;
  }
}

// Add token to header for all requests
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

// Store original user list
let originalUsers = [];

// Update user list based on search keyword
function updateUserList(keyword) {
  const select = document.getElementById("userId");
  select.innerHTML = '';

  const filteredUsers = originalUsers.filter(user => 
    user.username.toLowerCase().includes(keyword.toLowerCase()) ||
    user.tag.toLowerCase().includes(keyword.toLowerCase())
  );

  if (filteredUsers.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No users found";
    select.appendChild(option);
    return;
  }

  filteredUsers.forEach((user) => {
    const option = document.createElement("option");
    option.value = user.id;
    option.textContent = `${user.username} (${user.tag})`;
    select.appendChild(option);
  });
}

// Handle search
document.getElementById("userSearch").addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const filteredMembers = originalUsers.filter(member => 
    member.username.toLowerCase().includes(searchTerm) || 
    member.tag.toLowerCase().includes(searchTerm)
  );
  updateUserList(searchTerm);
});

// Initialize data
async function initializeData() {
  // Check authentication first
  if (!await checkAuth()) {
    return;
  }

  const errors = [];
  
  // Add loading state to selects
  const membersSelect = document.getElementById("userId");
  const channelsSelect = document.getElementById("channelId");
  const rolesSelect = document.getElementById("roleId");
  
  // Check if selects exist
  if (!membersSelect || !channelsSelect || !rolesSelect) {
    showError("Required select elements not found");
    return;
  }
  
  // Add loading state for members
  membersSelect.innerHTML = '<option value="">Loading members...</option>';
  try {
    const membersRes = await fetch("/api/members", {
      headers: getAuthHeaders()
    });
    if (!membersRes.ok) {
      errors.push({
        type: "members",
        message: "Failed to load members"
      });
      membersSelect.innerHTML = '<option value="">Error loading members</option>';
    } else {
      originalUsers = await membersRes.json();
      updateUserList(originalUsers.map(user => user.username).join(' '));
    }
  } catch (err) {
    errors.push({
      type: "members",
      message: "Failed to load members"
    });
    membersSelect.innerHTML = '<option value="">Error loading members</option>';
  }

  // Add loading state for channels
  channelsSelect.innerHTML = '<option value="">Loading channels...</option>';
  try {
    const channelsRes = await fetch("/api/channels", {
      headers: getAuthHeaders()
    });
    if (!channelsRes.ok) {
      errors.push({
        type: "channels",
        message: "Failed to load channels"
      });
      channelsSelect.innerHTML = '<option value="">Error loading channels</option>';
    } else {
      const channels = await channelsRes.json();
      channelsSelect.innerHTML = '';
      channels.forEach((channel) => {
        const option = document.createElement("option");
        option.value = channel.id;
        const icon = channel.type === 0 ? '💬' : '🔊';
        option.textContent = `${icon} ${channel.name}`;
        channelsSelect.appendChild(option);
      });
    }
  } catch (err) {
    errors.push({
      type: "channels",
      message: "Failed to load channels"
    });
    channelsSelect.innerHTML = '<option value="">Error loading channels</option>';
  }

  // Add loading state for roles
  rolesSelect.innerHTML = '<option value="">Loading roles...</option>';
  try {
    const rolesRes = await fetch("/api/roles", {
      headers: getAuthHeaders()
    });
    if (!rolesRes.ok) {
      errors.push({
        type: "roles",
        message: "Failed to load roles"
      });
      rolesSelect.innerHTML = '<option value="">Error loading roles</option>';
    } else {
      const roles = await rolesRes.json();
      rolesSelect.innerHTML = '';
      roles.forEach((role) => {
        const option = document.createElement("option");
        option.value = role.id;
        option.textContent = role.name;
        rolesSelect.appendChild(option);
      });
    }
  } catch (err) {
    errors.push({
      type: "roles",
      message: "Failed to load roles"
    });
    rolesSelect.innerHTML = '<option value="">Error loading roles</option>';
  }

  // Show error if any
  if (errors.length > 0) {
    const errorMessage = `Failed to load some data:\n${errors.map(e => e.message).join('\n')}\n\nPlease try again using the retry buttons.`;
    showError(errorMessage);
    
    // Add retry button for each data type
    errors.forEach(error => {
      const select = document.getElementById(`${error.type}Id`);
      if (!select) {
        console.error(`Không tìm thấy select với id ${error.type}Id`);
        return;
      }

      // Check if retry button already exists
      const existingRetryButton = select.parentNode.querySelector('.retry-button');
      if (existingRetryButton) {
        return; // Retry button already exists, don't add another
      }

      const retryButton = document.createElement('button');
      retryButton.className = 'retry-button';
      retryButton.textContent = '🔄 Retry';
      retryButton.onclick = async () => {
        retryButton.disabled = true;
        retryButton.textContent = '⏳ Loading...';
        
        try {
          const res = await fetch(`/api/${error.type}`, {
            headers: getAuthHeaders()
          });
          if (!res.ok) throw new Error(`Failed to load ${error.type}`);
          
          const data = await res.json();
          select.innerHTML = '';
          
          if (error.type === 'members') {
            originalUsers = data;
            updateUserList(originalUsers.map(user => user.username).join(' '));
          } else {
            data.forEach(item => {
              const option = document.createElement("option");
              option.value = item.id;
              if (error.type === 'channels') {
                const icon = item.type === 0 ? '💬' : '🔊';
                option.textContent = `${icon} ${item.name}`;
              } else {
                option.textContent = item.name;
              }
              select.appendChild(option);
            });
          }
          
          // Remove retry button when loading succeeds
          retryButton.remove();
          
          // Check if there are any errors
          const remainingErrors = document.querySelectorAll('.retry-button');
          if (remainingErrors.length === 0) {
            // If no errors, close popup
            const popup = document.querySelector('.popup.show');
            if (popup) {
              closePopup(popup.id);
            }
          }
        } catch (err) {
          retryButton.textContent = '❌ Failed';
          setTimeout(() => {
            retryButton.textContent = '🔄 Retry';
            retryButton.disabled = false;
          }, 2000);
        }
      };
      
      // Add retry button after select
      select.parentNode.insertBefore(retryButton, select.nextSibling);
    });
  }
}

// Add CSS for retry and logout buttons
const style = document.createElement('style');
style.textContent = `
  .retry-button {
    margin-left: 8px;
    padding: 4px 8px;
    border: none;
    border-radius: 4px;
    background-color: #4CAF50;
    color: white;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.3s ease;
  }
  
  .retry-button:hover {
    background-color: #45a049;
  }
  
  .retry-button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  
  .retry-button:disabled:hover {
    background-color: #cccccc;
  }

  .logout-button {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 8px 16px;
    background-color: #ed4245;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.3s ease;
  }
  
  .logout-button:hover {
    background-color: #c03537;
  }
`;
document.head.appendChild(style);

// Form submission
document.getElementById("addForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const userId = document.getElementById("userId").value;
  const channelId = document.getElementById("channelId").value;
  const roleId = document.getElementById("roleId").value;

  try {
    const res = await fetch("/api/add-user", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId, channelId, roleId })
    });

    const result = await res.json();
    
    if (result.success) {
      showSuccess(result.message || "User added successfully!");
    } else {
      showError(result.message || "Failed to add user. Please try again.");
    }
  } catch (err) {
    showError("Network error. Please check your connection and try again.");
  }
});

// Add logout button
const logoutButton = document.createElement('button');
logoutButton.className = 'logout-button';
logoutButton.textContent = '🚪 Đăng xuất';
logoutButton.onclick = async () => {
  try {
    await fetch('/logout', {
      method: 'POST',
      headers: getAuthHeaders()
    });
    localStorage.removeItem('token');
    window.location.href = '/login.html';
  } catch (error) {
    console.error('Logout error:', error);
  }
};
document.body.appendChild(logoutButton);

// Initialize
initializeData();