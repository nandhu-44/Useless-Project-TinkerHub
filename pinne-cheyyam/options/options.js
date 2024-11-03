// Helper function to update the display of the site lists
function updateSiteList(type, listId) {
  chrome.storage.sync.get([type], (result) => {
    const list = result[type] || [];
    const listElement = document.getElementById(listId);
    listElement.innerHTML = '';
    list.forEach((site, index) => {
      const listItem = document.createElement('li');
      listItem.className = 'flex justify-between items-center bg-gray-50 p-2 rounded-md border border-gray-200';
      listItem.textContent = site;

      // Add remove button
      const removeButton = document.createElement('button');
      removeButton.textContent = 'Remove';
      removeButton.className = 'bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-md ml-4';
      removeButton.onclick = () => removeSite(type, index);
      listItem.appendChild(removeButton);

      listElement.appendChild(listItem);
    });
  });
}

// Utility function to sanitize and format the URL
function sanitizeURL(url) {
  // Remove any trailing slash and path
  try {
    let formattedURL = url.trim();

    // Add https:// if missing
    if (!/^https?:\/\//i.test(formattedURL)) {
      formattedURL = 'https://' + formattedURL;
    }

    const urlObj = new URL(formattedURL);
    // Reconstruct the URL with only protocol, hostname, and port (if any)
    formattedURL = urlObj.origin;

    return formattedURL;
  } catch (error) {
    // If URL is invalid, return the original input
    return url;
  }
}

// Function to add a new site
function addSite(type, inputId, listId) {
  const inputElement = document.getElementById(inputId);
  const rawURL = inputElement.value.trim();
  if (rawURL) {
    const sanitizedURL = sanitizeURL(rawURL);
    chrome.storage.sync.get([type], (result) => {
      const sites = result[type] || [];
      // Prevent adding duplicate entries
      if (!sites.includes(sanitizedURL)) {
        sites.push(sanitizedURL);
        chrome.storage.sync.set({ [type]: sites }, () => {
          updateSiteList(type, listId);
          inputElement.value = '';
        });
      } else {
        alert('This site is already in the list.');
      }
    });
  }
}

// Function to remove a site
function removeSite(type, index) {
  chrome.storage.sync.get([type], (result) => {
    const sites = result[type] || [];
    sites.splice(index, 1);
    chrome.storage.sync.set({ [type]: sites }, () => {
      updateSiteList(type, type === 'productiveSites' ? 'productiveList' : 'distractingList');
    });
  });
}

// Event listeners for adding sites
document.getElementById('addProductive').addEventListener('click', () => addSite('productiveSites', 'productiveInput', 'productiveList'));
document.getElementById('addDistracting').addEventListener('click', () => addSite('distractingSites', 'distractingInput', 'distractingList'));

// Initialize lists on load
updateSiteList('productiveSites', 'productiveList');
updateSiteList('distractingSites', 'distractingList');
