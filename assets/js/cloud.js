// Cloud Storage functionality

let currentStorage = null;
let currentPath = '/';
let fileStructure = {};

// HTML template for cloud storage tool
function getCloudHTML() {
    return `
    <div class="space-y-6" id="cloud-container">
        <div id="auth-section">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <h3 class="text-lg font-medium text-blue-800 mb-4">Buat Storage Baru</h3>
                    <form id="create-form" class="space-y-4">
                        <div>
                            <label for="create-id" class="block text-sm font-medium text-gray-700 mb-1">ID Storage:</label>
                            <input type="text" id="create-id" required class="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Masukkan ID unik">
                        </div>
                        <div>
                            <label for="create-password" class="block text-sm font-medium text-gray-700 mb-1">Password:</label>
                            <input type="password" id="create-password" required class="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Masukkan password">
                        </div>
                        <div>
                            <label for="confirm-password" class="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password:</label>
                            <input type="password" id="confirm-password" required class="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Konfirmasi password">
                        </div>
                        <button type="submit" class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                            Buat Storage
                        </button>
                    </form>
                </div>
                
                <div class="bg-green-50 p-6 rounded-lg border border-green-200">
                    <h3 class="text-lg font-medium text-green-800 mb-4">Login ke Storage</h3>
                    <form id="login-form" class="space-y-4">
                        <div>
                            <label for="login-id" class="block text-sm font-medium text-gray-700 mb-1">ID Storage:</label>
                            <input type="text" id="login-id" required class="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Masukkan ID storage">
                        </div>
                        <div>
                            <label for="login-password" class="block text-sm font-medium text-gray-700 mb-1">Password:</label>
                            <input type="password" id="login-password" required class="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Masukkan password">
                        </div>
                        <button type="submit" class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                            Login
                        </button>
                    </form>
                </div>
            </div>
        </div>
        
        <div id="storage-section" class="hidden">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-medium text-gray-900">Manajemen File</h3>
                <div class="flex space-x-2">
                    <button id="new-folder-btn" class="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm">
                        <i class="fas fa-folder-plus mr-1"></i>Folder Baru
                    </button>
                    <button id="upload-file-btn" class="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
                        <i class="fas fa-upload mr-1"></i>Upload File
                    </button>
                    <button id="logout-btn" class="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm">
                        <i class="fas fa-sign-out-alt mr-1"></i>Logout
                    </button>
                </div>
            </div>
            
            <div class="bg-gray-100 p-2 rounded-lg mb-4">
                <nav class="flex" aria-label="Breadcrumb">
                    <ol id="breadcrumb" class="flex items-center space-x-2 text-sm">
                        <li><a href="#" data-path="/" class="text-blue-600 hover:text-blue-800">Root</a></li>
                    </ol>
                </nav>
            </div>
            
            <div class="file-tree mb-4">
                <div id="file-list" class="space-y-1">
                    <!-- File list will be populated here -->
                </div>
            </div>
            
            <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 class="font-medium text-yellow-800 mb-2">Informasi Storage</h4>
                <p class="text-yellow-700 text-sm">ID: <span id="storage-id"></span></p>
                <p class="text-yellow-700 text-sm">Dibuat pada: <span id="storage-created"></span></p>
                <p class="text-yellow-700 text-sm">Total file: <span id="storage-filecount"></span></p>
            </div>
        </div>
        
        <input type="file" id="file-input" multiple class="hidden">
    </div>
    `;
}

// Initialize cloud storage tool
function initCloud() {
    const createForm = document.getElementById('create-form');
    const loginForm = document.getElementById('login-form');
    const newFolderBtn = document.getElementById('new-folder-btn');
    const uploadFileBtn = document.getElementById('upload-file-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const fileInput = document.getElementById('file-input');
    
    // Form event listeners
    createForm.addEventListener('submit', handleCreateStorage);
    loginForm.addEventListener('submit', handleLogin);
    
    // Button event listeners
    if (newFolderBtn) {
        newFolderBtn.addEventListener('click', createNewFolder);
    }
    
    if (uploadFileBtn) {
        uploadFileBtn.addEventListener('click', () => {
            fileInput.click();
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    fileInput.addEventListener('change', handleFileUpload);
}

// Handle create storage form submission
function handleCreateStorage(e) {
    e.preventDefault();
    
    const storageId = document.getElementById('create-id').value.trim();
    const password = document.getElementById('create-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    // Validate inputs
    if (!storageId) {
        alert('ID storage tidak boleh kosong!');
        return;
    }
    
    if (password.length < 6) {
        alert('Password harus minimal 6 karakter!');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Password dan konfirmasi password tidak cocok!');
        return;
    }
    
    // Show loading
    document.getElementById('loading').classList.remove('hidden');
    
    // Hash password (using bcryptjs loaded via CDN)
    if (typeof bcrypt === 'undefined') {
        // Load bcryptjs dynamically
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/bcryptjs/2.4.3/bcrypt.min.js';
        script.onload = function() {
            createStorageWithHash(storageId, password);
        };
        document.head.appendChild(script);
    } else {
        createStorageWithHash(storageId, password);
    }
}

// Create storage with hashed password
function createStorageWithHash(storageId, password) {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const deviceFingerprint = utils.getDeviceFingerprint();
    
    // Create initial storage structure
    const storageData = {
        id: storageId,
        password: hashedPassword,
        created: new Date().toISOString(),
        deviceFingerprint: deviceFingerprint,
        structure: {
            '/': {
                type: 'folder',
                name: 'Root',
                children: {}
            }
        }
    };
    
    // Send to serverless function
    fetch('/api/jsonbin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'create',
            data: storageData
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert('Error: ' + data.error);
            return;
        }
        
        // Successfully created
        currentStorage = storageId;
        fileStructure = storageData.structure;
        
        // Switch to storage view
        showStorageView();
        loadStorageData();
        
        document.getElementById('loading').classList.add('hidden');
    })
    .catch(error => {
        console.error('Error creating storage:', error);
        alert('Terjadi kesalahan saat membuat storage. Silakan coba lagi.');
        document.getElementById('loading').classList.add('hidden');
    });
}

// Handle login form submission
function handleLogin(e) {
    e.preventDefault();
    
    const storageId = document.getElementById('login-id').value.trim();
    const password = document.getElementById('login-password').value;
    
    if (!storageId || !password) {
        alert('ID storage dan password harus diisi!');
        return;
    }
    
    // Show loading
    document.getElementById('loading').classList.remove('hidden');
    
    // Get storage data
    fetch('/api/jsonbin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'get',
            id: storageId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert('Error: ' + data.error);
            document.getElementById('loading').classList.add('hidden');
            return;
        }
        
        // Verify password
        if (typeof bcrypt === 'undefined') {
            // Load bcryptjs dynamically
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/bcryptjs/2.4.3/bcrypt.min.js';
            script.onload = function() {
                verifyPasswordAndLogin(data, storageId, password);
            };
            document.head.appendChild(script);
        } else {
            verifyPasswordAndLogin(data, storageId, password);
        }
    })
    .catch(error => {
        console.error('Error logging in:', error);
        alert('Terjadi kesalahan saat login. Silakan coba lagi.');
        document.getElementById('loading').classList.add('hidden');
    });
}

// Verify password and login
function verifyPasswordAndLogin(storageData, storageId, password) {
    if (!bcrypt.compareSync(password, storageData.password)) {
        alert('Password salah!');
        document.getElementById('loading').classList.add('hidden');
        return;
    }
    
    // Successfully logged in
    currentStorage = storageId;
    fileStructure = storageData.structure;
    
    // Switch to storage view
    showStorageView();
    loadStorageData();
    
    document.getElementById('loading').classList.add('hidden');
}

// Show storage view
function showStorageView() {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('storage-section').classList.remove('hidden');
}

// Load storage data
function loadStorageData() {
    // Set storage info
    document.getElementById('storage-id').textContent = currentStorage;
    
    // Navigate to root
    navigateTo('/');
}

// Navigate to path
function navigateTo(path) {
    currentPath = path;
    
    // Update breadcrumb
    updateBreadcrumb();
    
    // Display files in current path
    displayFiles();
}

// Update breadcrumb
function updateBreadcrumb() {
    const breadcrumb = document.getElementById('breadcrumb');
    breadcrumb.innerHTML = '';
    
    // Add root link
    const rootLi = document.createElement('li');
    rootLi.innerHTML = '<a href="#" data-path="/" class="text-blue-600 hover:text-blue-800">Root</a>';
    breadcrumb.appendChild(rootLi);
    
    // Add path segments
    if (currentPath !== '/') {
        const segments = currentPath.split('/').filter(segment => segment !== '');
        let currentSegmentPath = '';
        
        segments.forEach(segment => {
            currentSegmentPath += '/' + segment;
            
            const li = document.createElement('li');
            li.classList.add('flex', 'items-center');
            li.innerHTML = `
                <i class="fas fa-chevron-right text-gray-400 mx-2"></i>
                <a href="#" data-path="${currentSegmentPath}" class="text-blue-600 hover:text-blue-800">${segment}</a>
            `;
            
            breadcrumb.appendChild(li);
        });
    }
    
    // Add breadcrumb event listeners
    breadcrumb.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const path = link.getAttribute('data-path');
            navigateTo(path);
        });
    });
}

// Display files in current path
function displayFiles() {
    const fileList = document.getElementById('file-list');
    fileList.innerHTML = '';
    
    // Get current folder
    let currentFolder = fileStructure;
    const pathSegments = currentPath.split('/').filter(segment => segment !== '');
    
    for (const segment of pathSegments) {
        if (currentFolder[segment] && currentFolder[segment].type === 'folder') {
            currentFolder = currentFolder[segment].children;
        } else {
            // Path doesn't exist, navigate to root
            navigateTo('/');
            return;
        }
    }
    
    // Display folders first, then files
    const items = Object.entries(currentFolder);
    
    // Folders
    items.filter(([name, item]) => item.type === 'folder').forEach(([name, item]) => {
        const folderElement = document.createElement('div');
        folderElement.className = 'folder-item';
        folderElement.innerHTML = `
            <i class="fas fa-folder"></i>
            <span>${item.name}</span>
            <div class="ml-auto flex space-x-1">
                <button class="text-blue-500 hover:text-blue-700 rename-btn" data-name="${name}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="text-red-500 hover:text-red-700 delete-btn" data-name="${name}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        folderElement.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                navigateTo(currentPath + (currentPath === '/' ? '' : '/') + name);
            }
        });
        
        // Add event listeners for buttons
        const renameBtn = folderElement.querySelector('.rename-btn');
        const deleteBtn = folderElement.querySelector('.delete-btn');
        
        renameBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            renameItem(name, 'folder');
        });
        
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteItem(name);
        });
        
        fileList.appendChild(folderElement);
    });
    
    // Files
    items.filter(([name, item]) => item.type === 'file').forEach(([name, item]) => {
        const fileElement = document.createElement('div');
        fileElement.className = 'file-item';
        fileElement.innerHTML = `
            <i class="fas fa-file"></i>
            <span>${item.name}</span>
            <span class="text-xs text-gray-500 ml-2">${utils.formatFileSize(item.size)}</span>
            <div class="ml-auto flex space-x-1">
                <button class="text-green-500 hover:text-green-700 download-btn" data-name="${name}">
                    <i class="fas fa-download"></i>
                </button>
                <button class="text-blue-500 hover:text-blue-700 rename-btn" data-name="${name}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="text-red-500 hover:text-red-700 delete-btn" data-name="${name}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add event listeners for buttons
        const downloadBtn = fileElement.querySelector('.download-btn');
        const renameBtn = fileElement.querySelector('.rename-btn');
        const deleteBtn = fileElement.querySelector('.delete-btn');
        
        downloadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            downloadFile(name);
        });
        
        renameBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            renameItem(name, 'file');
        });
        
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteItem(name);
        });
        
        fileList.appendChild(fileElement);
    });
    
    // Update storage info
    updateStorageInfo();
}

// Update storage information
function updateStorageInfo() {
    // Count files
    let fileCount = 0;
    
    function countFiles(structure) {
        for (const key in structure) {
            if (structure[key].type === 'file') {
                fileCount++;
            } else if (structure[key].type === 'folder') {
                countFiles(structure[key].children);
            }
        }
    }
    
    countFiles(fileStructure);
    
    document.getElementById('storage-filecount').textContent = fileCount;
}

// Create new folder
function createNewFolder() {
    const folderName = prompt('Masukkan nama folder baru:');
    
    if (!folderName) return;
    
    // Get current folder
    let currentFolder = fileStructure;
    const pathSegments = currentPath.split('/').filter(segment => segment !== '');
    
    for (const segment of pathSegments) {
        if (currentFolder[segment] && currentFolder[segment].type === 'folder') {
            currentFolder = currentFolder[segment].children;
        }
    }
    
    // Create folder
    const folderId = utils.generateId();
    
    currentFolder[folderId] = {
        type: 'folder',
        name: folderName,
        children: {}
    };
    
    // Save to server
    saveStorage();
    
    // Refresh file list
    displayFiles();
}

// Handle file upload
function handleFileUpload(e) {
    const files = e.target.files;
    
    if (files.length === 0) return;
    
    // Get current folder
    let currentFolder = fileStructure;
    const pathSegments = currentPath.split('/').filter(segment => segment !== '');
    
    for (const segment of pathSegments) {
        if (currentFolder[segment] && currentFolder[segment].type === 'folder') {
            currentFolder = currentFolder[segment].children;
        }
    }
    
    // Process each file
    Array.from(files).forEach(file => {
        if (file.size > 5 * 1024 * 1024) {
            alert(`File ${file.name} terlalu besar (maksimal 5MB)`);
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const fileId = utils.generateId();
            
            currentFolder[fileId] = {
                type: 'file',
                name: file.name,
                size: file.size,
                data: e.target.result.split(',')[1], // Remove data URL prefix
                mimeType: file.type
            };
            
            // Save to server after all files are processed
            if (Array.from(files).indexOf(file) === files.length - 1) {
                saveStorage();
                displayFiles();
            }
        };
        
        reader.readAsDataURL(file);
    });
}

// Download file
function downloadFile(name) {
    // Get current folder
    let currentFolder = fileStructure;
    const pathSegments = currentPath.split('/').filter(segment => segment !== '');
    
    for (const segment of pathSegments) {
        if (currentFolder[segment] && currentFolder[segment].type === 'folder') {
            currentFolder = currentFolder[segment].children;
        }
    }
    
    const file = currentFolder[name];
    
    if (!file || file.type !== 'file') {
        alert('File tidak ditemukan!');
        return;
    }
    
    // Convert base64 to blob
    const byteCharacters = atob(file.data);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: file.mimeType });
    
    // Create download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = file.name;
    link.click();
    
    // Clean up
    URL.revokeObjectURL(link.href);
}

// Rename item
function renameItem(name, type) {
    const newName = prompt(`Masukkan nama baru untuk ${type === 'folder' ? 'folder' : 'file'}:`);
    
    if (!newName) return;
    
    // Get current folder
    let currentFolder = fileStructure;
    const pathSegments = currentPath.split('/').filter(segment => segment !== '');
    
    for (const segment of pathSegments) {
        if (currentFolder[segment] && currentFolder[segment].type === 'folder') {
            currentFolder = currentFolder[segment].children;
        }
    }
    
    // Rename item
    if (currentFolder[name]) {
        currentFolder[name].name = newName;
        
        // Save to server
        saveStorage();
        
        // Refresh file list
        displayFiles();
    }
}

// Delete item
function deleteItem(name) {
    if (!confirm('Apakah Anda yakin ingin menghapus item ini?')) return;
    
    // Get current folder
    let currentFolder = fileStructure;
    const pathSegments = currentPath.split('/').filter(segment => segment !== '');
    
    for (const segment of pathSegments) {
        if (currentFolder[segment] && currentFolder[segment].type === 'folder') {
            currentFolder = currentFolder[segment].children;
        }
    }
    
    // Delete item
    if (currentFolder[name]) {
        delete currentFolder[name];
        
        // Save to server
        saveStorage();
        
        // Refresh file list
        displayFiles();
    }
}

// Save storage to server
function saveStorage() {
    fetch('/api/jsonbin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'update',
            id: currentStorage,
            data: {
                structure: fileStructure
            }
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert('Error: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error saving storage:', error);
        alert('Terjadi kesalahan saat menyimpan perubahan. Silakan coba lagi.');
    });
}

// Handle logout
function handleLogout() {
    currentStorage = null;
    currentPath = '/';
    fileStructure = {};
    
    document.getElementById('auth-section').classList.remove('hidden');
    document.getElementById('storage-section').classList.add('hidden');
    
    // Clear forms
    document.getElementById('create-form').reset();
    document.getElementById('login-form').reset();
}

// Export functions for global access
window.getCloudHTML = getCloudHTML;
window.initCloud = initCloud;