const signupForm = document.getElementById('signupForm');
const statusFigure = document.getElementById('statusFigure');
const redirect = document.getElementById('redirect');

signupForm.addEventListener('submit', signup);

async function signup (event)
{
    // prevent page reload
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try
    {
        const response = await fetch('/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();
        if (response.ok)
        {
            signupForm.style.display = 'none';
            redirect.style.display = 'none';
            statusFigure.style.color = 'var(--theme-green)';
            statusFigure.innerHTML = '<p>Signup successful!</p><a href="/users">Enter now</a>';
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