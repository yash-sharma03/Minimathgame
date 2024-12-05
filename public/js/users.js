// holds user data after each fetch
let userdata;
// map: key-value; id-filename
let itemMap = new Map;
let users;

// figure element of selected User
let userSelected;

const infoFigure = document.getElementById('infoFigure');
const userP = document.getElementById('userP');

// img elements
const hatsImg = document.getElementById('hatsImg');
const shirtsImg = document.getElementById('shirtsImg');
const pantsImg = document.getElementById('pantsImg');

const usersAside = document.getElementById('usersAside');

/**
 * RUNS FIRST ON PAGE LOAD
 * asynchronously fetch and display items through /api/getItems
 */
async function fetchItems ()
{
    // set default items
    itemMap.set(0, '/images/blank.png');
    itemMap.set(-1, '/images/blank.png');
    itemMap.set(-2, '/images/blank.png');

    try
    {
        /** fetch all items from database */
        const response = await fetch('/api/getItems');
        data = await response.json();

        // add all items to itemMap
        for (item of data.items)
        {
            itemMap.set(item.ItemID, '/images/' + item.ItemName + '.png');
        }
    }
    catch (error)
    {
        console.error("Error fetching items: ", error);
    }
}

/**
 * SECOND ON PAGE LOAD
 * fetch user data through /api/getUser
 */
async function fetchUser ()
{
    try
    {
        const response = await fetch('/api/getUser');
        userdata = await response.json();

        // extract user info
        document.getElementById('userMark').textContent = userdata.UserName;
        document.getElementById('goldMark').textContent = userdata.UserGold;
    }
    catch (error)
    {
        console.error("Error fetching user: ", error);
    }
}

/**
 * @function fetchUsers
 * query database and get object of all users
 * make 'figure' elements for each user, with corresponding user information
 */
async function fetchUsers ()
{
    try
    {
        const response = await fetch('api/getUsers');
        data = await response.json();
        users = data.users;

        for (const user of users)
        {
            // make new document element, metadata: user object
            const uFigure = document.createElement('figure');
            uFigure.metadata = {
                user: user
            }
            // populate figure with user information
            uFigure.innerHTML = `<p><mark>${user.UserName}</mark></p>`;
            uFigure.innerHTML += `<p>Items: <mark>${user.UserItems}</mark></p>`;
            uFigure.innerHTML += `<p>Gold: <mark>${user.UserGold}</mark></p>`;
            uFigure.addEventListener('click', handleUserClick);

            usersAside.appendChild(uFigure);
        }
        console.log(users);
    }
    catch (error)
    {
        console.error('Error fetching users: ', error);
    }
}

/**
 * @function handleUserClick
 * called when a user ARTICLE is clicked
 * update `userSelected`
 * article accessible by: event.currentTarget
 */
function handleUserClick (event)
{
    // de-select any currently selected element
    if (userSelected != null)
        userSelected.classList.remove('selected');

    // update selected item, highlight
    userSelected = event.currentTarget;
    userSelected.classList.add('selected');

    // iterate through the map to replace images on left side with the user's equipped items
    hatsImg.setAttribute("src", itemMap.get(event.currentTarget.metadata.user.UserHat));
    shirtsImg.setAttribute("src", itemMap.get(event.currentTarget.metadata.user.UserShirt));
    pantsImg.setAttribute("src", itemMap.get(event.currentTarget.metadata.user.UserPants));

    // display selected user's name
    infoFigure.style.visibility = 'visible';
    infoP.textContent = event.currentTarget.metadata.user.UserName;

    console.log(userSelected);
}

// asynchronous fetch on page load
// items first, then all users and user info
document.addEventListener("DOMContentLoaded", async () => {
    await fetchItems();
    await fetchUser();
    await fetchUsers();
});