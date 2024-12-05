// html document elements
const loginForm = document.getElementById('loginForm');
const statusFigure = document.getElementById('statusFigure');
const redirect = document.getElementById('redirect');

// add event listener to login form when submitted
loginForm.addEventListener('submit', login);

async function login (event)
{
    // prevent page reload
    event.preventDefault();

    // extract credentials from form
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try
    {
        // call /login route with credentials
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        // display result to user
        const result = await response.json();
        if (response.ok)
        {
            loginForm.style.display = 'none';
            redirect.style.display = 'none';
            statusFigure.style.color = 'var(--theme-green)';
            statusFigure.innerHTML = '<p>Login successful!</p><a href="/users">Enter now</a>';
        }
        else
        {
            statusFigure.style.color = 'var(--theme-red)';
            statusFigure.innerHTML = `<p>${result.error}</p>`
        }
    }
    catch (err)
    {
        console.error('Error: ', err);
        statusFigure.style.color = 'var(--theme-red)';
        statusFigure.innerHTML = '<p>Internal error. Please try again</p>';
    }
}