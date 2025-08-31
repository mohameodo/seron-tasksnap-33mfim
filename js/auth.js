document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('tasksnap_user'));
    if (user && user.username) {
        window.location.href = 'app.html';
        return;
    }

    const welcomeForm = document.getElementById('welcome-form');
    const profileUpload = document.getElementById('profile-upload');
    const profilePreview = document.getElementById('profile-preview');
    const usernameInput = document.getElementById('username');

    let profilePicData = 'https://i.pravatar.cc/150?u=a042581f4e29026704d';

    profileUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                profilePicData = e.target.result;
                profilePreview.src = profilePicData;
            };
            reader.readAsDataURL(file);
        }
    });

    welcomeForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const username = usernameInput.value.trim();
        if (username) {
            const newUser = {
                username: username,
                profilePic: profilePicData
            };
            localStorage.setItem('tasksnap_user', JSON.stringify(newUser));
            localStorage.setItem('tasksnap_tasks', JSON.stringify([]));
            window.location.href = 'app.html';
        }
    });
});