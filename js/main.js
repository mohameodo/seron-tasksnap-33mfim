document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('tasksnap_user'));
    if (!user || !user.username) {
        window.location.href = 'index.html';
        return;
    }

    let tasks = JSON.parse(localStorage.getItem('tasksnap_tasks')) || [];

    const appState = {
        user,
        tasks,
        get currentTasks() {
            return this.tasks;
        },
        addTask(task) {
            this.tasks.push({ id: Date.now(), ...task, completed: false });
            this.saveTasks();
        },
        updateTask(updatedTask) {
            this.tasks = this.tasks.map(task => task.id === updatedTask.id ? updatedTask : task);
            this.saveTasks();
        },
        deleteTask(taskId) {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.saveTasks();
        },
        toggleTaskStatus(taskId) {
            const task = this.tasks.find(t => t.id === taskId);
            if (task) {
                task.completed = !task.completed;
            }
            this.saveTasks();
        },
        saveTasks() {
            localStorage.setItem('tasksnap_tasks', JSON.stringify(this.tasks));
            this.renderCurrentPage();
        },
        updateUser(newUserData) {
            this.user = { ...this.user, ...newUserData };
            localStorage.setItem('tasksnap_user', JSON.stringify(this.user));
            UI.updateProfileDisplays(this.user);
        },
        renderCurrentPage() {
            const page = window.location.hash.substring(1) || 'home';
            router(page);
        }
    };

    const appContent = document.getElementById('app-content');

    const routes = {
        home: () => UI.renderHomePage(appState),
        schedule: () => UI.renderSchedulePage(appState),
        stats: () => UI.renderStatsPage(appState),
        profile: () => UI.renderProfilePage(appState)
    };

    function router(page) {
        appContent.innerHTML = '';
        if (routes[page]) {
            routes[page]();
            UI.updateActiveLink(page);
        } else {
            routes.home();
            UI.updateActiveLink('home');
        }
    }

    function handleInitialLoad() {
        const loadingScreen = document.getElementById('loading-screen');
        const loadingPfp = document.getElementById('loading-pfp');
        const loadingName = document.getElementById('loading-name');
        
        loadingPfp.src = appState.user.profilePic;
        loadingName.textContent = `Hello, ${appState.user.username}`;

        setTimeout(() => {
            loadingScreen.classList.add('opacity-0');
            setTimeout(() => loadingScreen.style.display = 'none', 500);

            UI.init(appState);
            const initialPage = window.location.hash.substring(1) || 'home';
            router(initialPage);
        }, 1500);
    }

    window.addEventListener('hashchange', () => appState.renderCurrentPage());
    window.appState = appState; // Make state globally accessible for UI functions
    handleInitialLoad();
});
