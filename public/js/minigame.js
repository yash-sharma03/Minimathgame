const questionP = document.getElementById('questionP');
const answerInput = document.getElementById('answerInput');
const answerButton = document.getElementById('answerButton');
const statusP = document.getElementById("status");
let question;
let correctAnswer;

/**
 * FIRST ON PAGE LOAD
 * fetch user data through /api/getUser
 */
async function fetchUser ()
{
    try
    {
        const response = await fetch('/api/getUser');
        const userdata = await response.json();

        // extract user info
        document.getElementById('userMark').textContent = userdata.UserName;
        document.getElementById('goldMark').textContent = userdata.UserGold;
        // extract current "equipped" items
        // hatEquipped = document.getElementById('item' + userdata.UserHat);
        // shirtEquipped = document.getElementById('item' + userdata.UserShirt);
        // pantsEquipped = document.getElementById('item' + userdata.UserPants);

        // display equipped items on avatar
        // hatsImg.setAttribute("src", hatEquipped.metadata.file);
        // shirtsImg.setAttribute("src", shirtEquipped.metadata.file);
        // pantsImg.setAttribute("src", pantsEquipped.metadata.file);
    }
    catch (error)
    {
        console.error("Error fetching user: ", error);
    }
}

// generate math question: addition, subtraction, or multiplication
function generateQuestion ()
{
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operator = ['+', '-', '*'][Math.floor(Math.random()*3)];
    equation = `${num1} ${operator} ${num2}`; 
    correctAnswer = eval(equation);

    questionP.textContent = equation;
}

// check user's answer, query database if correct
async function checkAnswer ()
{
    const userAnswer = parseInt(answerInput.value);

    statusP.innerHTML = "<p>" + equation + " = " + correctAnswer + "</p>";
    statusP.innerHTML += "<p>Your answer = " + userAnswer + "</p>";
    if (userAnswer === correctAnswer) {
        const response = await fetch('/api/winGold', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) console.log(response);

        const data = await response.json();
        
        // update gold count
        await fetchUser();

        statusP.innerHTML += "<p>Correct! You earned 10 gold.</p>";
        statusP.style.color = "var(--theme-green)";
    } else {
        statusP.innerHTML += "<p>Wrong! Try again.</p>";
        statusP.style.color = "var(--theme-red)";
    }

    answerInput.value = ""; // Clear the input
    answerButton.disabled = true;
    answerButton.textContent = 'Enter your answer';
    generateQuestion(); // Generate a new question
}

// setup on page load
document.addEventListener('DOMContentLoaded', async () => {
    await fetchUser();
    generateQuestion();
    answerInput.addEventListener('input', handleButton);
});

function handleButton (event)
{
    console.log(answerInput.value);
    if (answerInput.value == '')
    {
        answerButton.disabled = true;
        answerButton.textContent = 'Enter your answer';
    }
    else
    {
        answerButton.disabled = false;
        answerButton.textContent = 'Submit';
    }
}