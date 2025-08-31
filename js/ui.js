const UI = {
    init(appState) {
        this.renderNav(appState.user);
        this.updateProfileDisplays(appState.user);
    },

    updateProfileDisplays(user) {
        document.getElementById('sidebar-pfp').src = user.profilePic;
        document.getElementById('sidebar-username').textContent = user.username;
        const profilePagePfp = document.getElementById('profile-page-pfp');
        if (profilePagePfp) profilePagePfp.src = user.profilePic;
    },

    renderNav(user) {
        const navItems = [
            { page: 'home', icon: 'fa-home', label: 'Home' },
            { page: 'schedule', icon: 'fa-calendar-alt', label: 'Schedule' },
            { page: 'stats', icon: 'fa-chart-pie', label: 'Stats' },
            { page: 'profile', icon: 'fa-user', label: 'Profile' },
        ];

        const mobileNav = document.getElementById('mobile-nav');
        const desktopNav = document.getElementById('desktop-nav');

        mobileNav.innerHTML = navItems.map(item => `
            <a href="#${item.page}" class="flex flex-col items-center text-gray-500 hover:text-blue-600 p-2 nav-link" data-page="${item.page}">
                <i class="fas ${item.icon} text-xl"></i>
                <span class="text-xs mt-1">${item.label}</span>
            </a>
        `).join('');

        desktopNav.innerHTML = navItems.map(item => `
            <a href="#${item.page}" class="flex items-center p-3 text-gray-600 rounded-lg hover:bg-gray-100 nav-link" data-page="${item.page}">
                <i class="fas ${item.icon} w-6 text-center text-lg"></i>
                <span class="ml-4 font-medium">${item.label}</span>
            </a>
        `).join('');
    },

    updateActiveLink(page) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.page === page);
        });
    },

    renderHomePage(appState) {
        const appContent = document.getElementById('app-content');
        const onProgressTasks = appState.currentTasks.filter(t => !t.completed);
        const completedTasks = appState.currentTasks.filter(t => t.completed);
        appContent.innerHTML = `
            <div class="space-y-8">
                <header class="flex justify-between items-center">
                    <div>
                        <h1 class="text-3xl font-bold">Hello, ${appState.user.username}</h1>
                        <p class="text-gray-500">You have ${onProgressTasks.length} tasks today.</p>
                    </div>
                    <button id="share-btn" class="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-200 transition-colors flex items-center gap-2"><i class="fas fa-share-alt"></i> Share</button>
                </header>

                <div>
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-xl font-semibold">On Progress (${onProgressTasks.length})</h2>
                    </div>
                    <div id="on-progress-list" class="space-y-3">${onProgressTasks.length > 0 ? onProgressTasks.map(this.createTaskElement).join('') : '<p class="text-gray-500">No tasks in progress. Great job!</p>'}</div>
                </div>

                <div>
                     <div class="flex justify-between items-center mb-4">
                        <h2 class="text-xl font-semibold">Completed (${completedTasks.length})</h2>
                    </div>
                    <div id="completed-list" class="space-y-3">${completedTasks.length > 0 ? completedTasks.map(this.createTaskElement).join('') : '<p class="text-gray-500">No tasks completed yet.</p>'}</div>
                </div>
            </div>
            <button id="add-task-btn" class="fixed bottom-20 right-5 md:bottom-8 md:right-8 bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-blue-700 transition-transform transform hover:scale-110"><i class="fas fa-plus"></i></button>
        `;
        this.attachHomeEventListeners(appState);
    },
    
    createTaskElement(task) {
        return `
            <div class="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between transition-all duration-300 ${task.completed ? 'opacity-60' : ''}">
                <div class="flex items-center">
                    <button class="toggle-status-btn w-6 h-6 rounded-full border-2 ${task.completed ? 'bg-blue-500 border-blue-500' : 'border-gray-300'} flex items-center justify-center mr-4 transition-colors duration-300" data-id="${task.id}">
                       ${task.completed ? '<i class="fas fa-check text-white text-xs"></i>' : ''}
                    </button>
                    <div>
                        <p class="font-medium ${task.completed ? 'line-through text-gray-500' : ''}">${task.title}</p>
                        <p class="text-sm text-gray-500">${task.description}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <button class="edit-task-btn text-gray-400 hover:text-blue-500" data-id="${task.id}"><i class="fas fa-pencil-alt"></i></button>
                    <button class="delete-task-btn text-gray-400 hover:text-red-500" data-id="${task.id}"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
        `;
    },

    attachHomeEventListeners(appState) {
        document.getElementById('add-task-btn').addEventListener('click', () => this.showTaskModal(null, appState));
        document.getElementById('share-btn').addEventListener('click', () => this.showShareModal(appState));

        document.querySelectorAll('.edit-task-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = Number(e.currentTarget.dataset.id);
                const task = appState.currentTasks.find(t => t.id === taskId);
                this.showTaskModal(task, appState);
            });
        });

        document.querySelectorAll('.delete-task-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = Number(e.currentTarget.dataset.id);
                if (confirm('Are you sure you want to delete this task?')) {
                    appState.deleteTask(taskId);
                }
            });
        });
        
        document.querySelectorAll('.toggle-status-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                 const taskId = Number(e.currentTarget.dataset.id);
                 appState.toggleTaskStatus(taskId);
            });
        });
    },

    showTaskModal(task, appState) {
        const isEditing = task !== null;
        const modalHTML = `
            <div id="task-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-2xl p-8 w-full max-w-md modal-content">
                    <h2 class="text-2xl font-bold mb-6">${isEditing ? 'Edit Task' : 'New Task'}</h2>
                    <form id="task-form" class="space-y-4">
                        <div>
                            <label for="task-title" class="block text-sm font-medium text-gray-700">Title</label>
                            <input type="text" id="task-title" value="${isEditing ? task.title : ''}" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                        </div>
                        <div>
                            <label for="task-desc" class="block text-sm font-medium text-gray-700">Description</label>
                            <textarea id="task-desc" rows="3" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">${isEditing ? task.description : ''}</textarea>
                        </div>
                        <div class="flex justify-end space-x-3 pt-4">
                            <button type="button" id="cancel-task-btn" class="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
                            <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">${isEditing ? 'Save Changes' : 'Create Task'}</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.getElementById('modal-container').innerHTML = modalHTML;

        document.getElementById('task-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('task-title').value;
            const description = document.getElementById('task-desc').value;
            if (isEditing) {
                appState.updateTask({ ...task, title, description });
            } else {
                appState.addTask({ title, description });
            }
            this.closeModal('task-modal');
        });

        document.getElementById('cancel-task-btn').addEventListener('click', () => this.closeModal('task-modal'));
    },

    showShareModal(appState) {
        const modalHTML = `
            <div id="share-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                 <div class="bg-white rounded-2xl p-8 w-full max-w-sm modal-content text-center">
                    <h2 class="text-2xl font-bold mb-4">Share Your List</h2>
                    <p class="text-gray-600 mb-6">Scan this QR code with another device to share your current task list.</p>
                    <div id="qrcode" class="flex justify-center items-center p-4 bg-gray-100 rounded-lg"></div>
                    <button id="close-share-btn" class="mt-6 bg-blue-600 text-white w-full px-4 py-2 rounded-lg hover:bg-blue-700">Done</button>
                 </div>
            </div>
        `;
        document.getElementById('modal-container').innerHTML = modalHTML;
        
        const tasksJSON = JSON.stringify(appState.currentTasks);
        new QRCode(document.getElementById("qrcode"), {
            text: tasksJSON,
            width: 200,
            height: 200,
        });

        document.getElementById('close-share-btn').addEventListener('click', () => this.closeModal('share-modal'));
    },

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if(modal) modal.remove();
    },

    renderSchedulePage(appState) {
        const appContent = document.getElementById('app-content');
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        appContent.innerHTML = `
            <header class="mb-8">
                <h1 class="text-3xl font-bold">Schedule</h1>
                <p class="text-gray-500">${today}</p>
            </header>
            <div class="bg-white p-6 rounded-xl shadow-sm">
                <h2 class="font-semibold mb-4">Today's Tasks</h2>
                <div class="space-y-4">
                    ${appState.currentTasks.filter(t => !t.completed).length > 0 ? appState.currentTasks.filter(t => !t.completed).map(task => `
                        <div class="flex items-center">
                            <div class="w-12 text-sm text-gray-500">Now</div>
                            <div class="pl-4 border-l-2 border-blue-500 ml-4 flex-1">
                                <p class="font-medium">${task.title}</p>
                                <p class="text-sm text-gray-500">${task.description}</p>
                            </div>
                        </div>
                    `).join('') : '<p class="text-gray-500">No tasks scheduled for today.</p>'}
                </div>
            </div>
        `;
    },

    renderStatsPage(appState) {
        const appContent = document.getElementById('app-content');
        const totalTasks = appState.currentTasks.length;
        const completedTasks = appState.currentTasks.filter(t => t.completed).length;
        const progressTasks = totalTasks - completedTasks;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        appContent.innerHTML = `
            <header class="mb-8">
                <h1 class="text-3xl font-bold">Statistics</h1>
                <p class="text-gray-500">Your productivity overview.</p>
            </header>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div class="bg-white p-6 rounded-xl shadow-sm text-center">
                    <p class="text-gray-500">Total Tasks</p>
                    <p class="text-4xl font-bold">${totalTasks}</p>
                </div>
                 <div class="bg-white p-6 rounded-xl shadow-sm text-center">
                    <p class="text-gray-500">Completed</p>
                    <p class="text-4xl font-bold text-green-500">${completedTasks}</p>
                </div>
                 <div class="bg-white p-6 rounded-xl shadow-sm text-center">
                    <p class="text-gray-500">In Progress</p>
                    <p class="text-4xl font-bold text-yellow-500">${progressTasks}</p>
                </div>
            </div>
             <div class="bg-white p-6 rounded-xl shadow-sm">
                <h2 class="font-semibold mb-2">Completion Rate</h2>
                <div class="w-full bg-gray-200 rounded-full h-4">
                    <div class="bg-blue-600 h-4 rounded-full" style="width: ${completionRate}%"></div>
                </div>
                <p class="text-right font-medium mt-2 text-blue-600">${completionRate}%</p>
            </div>
        `;
    },

    renderProfilePage(appState) {
        const appContent = document.getElementById('app-content');
        appContent.innerHTML = `
             <header class="text-center mb-8">
                <div class="relative inline-block">
                    <img id="profile-page-pfp" src="${appState.user.profilePic}" class="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg mx-auto">
                    <label for="profile-page-upload" class="absolute bottom-1 right-1 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700">
                        <i class="fas fa-camera"></i>
                    </label>
                    <input type="file" id="profile-page-upload" class="hidden" accept="image/*">
                </div>
                <h1 class="text-3xl font-bold mt-4">${appState.user.username}</h1>
             </header>
             <div class="max-w-md mx-auto space-y-4">
                <div class="bg-white p-4 rounded-xl shadow-sm">
                     <label for="username-edit" class="block text-sm font-medium text-gray-700 mb-1">Username</label>
                     <input type="text" id="username-edit" value="${appState.user.username}" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                </div>
                <button id="save-profile-btn" class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium">Save Changes</button>
                <button id="reset-app-btn" class="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 font-medium">Reset App</button>
             </div>
        `;
        this.attachProfileEventListeners(appState);
    },

    attachProfileEventListeners(appState) {
        const profileUpload = document.getElementById('profile-page-upload');
        const profileImg = document.getElementById('profile-page-pfp');

        profileUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (re) => {
                    profileImg.src = re.target.result;
                };
                reader.readAsDataURL(file);
            }
        });

        document.getElementById('save-profile-btn').addEventListener('click', () => {
            const newUsername = document.getElementById('username-edit').value;
            const newProfilePic = profileImg.src;
            appState.updateUser({ username: newUsername, profilePic: newProfilePic });
            alert('Profile saved!');
            location.reload(); // simple way to reflect changes everywhere
        });

        document.getElementById('reset-app-btn').addEventListener('click', () => {
            if (confirm('Are you sure you want to reset the app? All your data will be deleted.')) {
                localStorage.clear();
                window.location.href = 'index.html';
            }
        });
    }
};