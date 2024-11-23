// @@ Handle Register
const addUser = async ({ username, email, password, passwordConf }) => {
    try {
        // Check if passwords match
        if (password !== passwordConf) {
            alert('Passwords do not match!');
            return;
        }

        // Make a request to the backend API to add a user
        const response = await fetch('/addUser', {
        //const response = await fetch('http://localhost:3005/addUser', {

            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }
        
        const data = await response.text();
        alert(data); // Display success message
    } catch (error) {
        console.error('Error adding user:', error);
        alert('Error adding user: ' + error.message);
    }
};

// Handle form submission
const addUserForm = document.getElementById('addUserForm');
addUserForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const username = document.getElementById('manageUsername').value;
    const email = document.getElementById('manageUseremail').value;
    const password = document.getElementById('managePassword').value;
    const passwordConf = document.getElementById('managePasswordConf').value;

    addUser({ username, email, password, passwordConf });
});

// @@ Handle login
const loginUser = async ({ username, password }) => {
    try {
        const response = await fetch('/getUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userFullName: username,
                userPassword: password,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }

        const successMessage = await response.text();
        alert(successMessage); // Display success message
    } catch (error) {
        console.error('Error logging in:', error);
        alert(error.message);
    }
};
// Handle form submission
const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    loginUser({ username, password });
});