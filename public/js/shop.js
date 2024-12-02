// figure: item carousel
const hatsFigure = document.getElementById('hatsFigure');
const shirtsFigure = document.getElementById('shirtsFigure');
const pantsFigure = document.getElementById('pantsFigure');
// img elements
const hatsImg = document.getElementById('hatsImg');
const shirtsImg = document.getElementById('shirtsImg');
const pantsImg = document.getElementById('pantsImg');

let hatEquipped, shirtEquipped, pantsEquipped;
// by default a "null" value
let itemSelected = 'null';

// on page load, fetch session (user) data
// `/api/session` route
async function fetchUser ()
{
    try
    {
        const response = await fetch('/api/getUser');
        const data = await response.json();

        // extract user info
        document.getElementById('userMark').textContent = data.UserName;
        document.getElementById('goldMark').textContent = data.UserGold;
        // extract current "equipped" items
        hatEquipped = data.UserHat;
        shirtEquipped = data.UserShirt;
        pantsEquipped = data.UserPants;
    }
    catch (error)
    {
        console.error("Error fetching user: ", error);
    }
}


/** asynchronous function for fetching and displaying items */
async function fetchItems ()
{
    try
    {
        /** fetch all items from database */
        const response = await fetch('/api/getItems');
        const data = await response.json();

        // console.log(data);

        // add metadata to default items
        const defHat = document.getElementById('hatsFigure').querySelector('#item0');
        defHat.metadata = { type: 'Hat' };
        defHat.addEventListener("click", handleItemClick);

        const defShirt = document.getElementById('shirtsFigure').querySelector('#item-1');
        defShirt.metadata = { type: 'Shirt' };
        defShirt.addEventListener("click", handleItemClick);

        const defPants = document.getElementById('pantsFigure').querySelector('#item-2');
        defPants.metadata = { type: 'Pants' };
        defPants.addEventListener("click", handleItemClick);

        /** display each item as "article" element within the respective figures */
        for (const item of data.items)
        {
            const nArticle = document.createElement("article");
            nArticle.id = "item" + item.ItemID;
            // store ItemType in element metadata
            nArticle.metadata = { type: item.ItemType };
            nArticle.innerHTML = "<h2>" + item.ItemName + "</h2><p>" + item.ItemPrice + "</p>";
            nArticle.addEventListener("click", handleItemClick);

            switch (item.ItemType)
            {
                case 'Hat':
                    hatsFigure.appendChild(nArticle);
                    break;
                case 'Shirt':
                    shirtsFigure.appendChild(nArticle);
                    break;
                case 'Pants':
                    pantsFigure.appendChild(nArticle);
                    break;
            }
        }

    }
    catch (error)
    {
        console.error("Error fetching items: ", error);
    }
}

// highlight items
function highlightItems ()
{
    if (itemSelected != 'null')
    {
        const itemToSelect = document.querySelector('#item' + itemSelected);
        itemToSelect.classList.add('selected');
    }

    const hatToEquip = hatsFigure.querySelector('#item' + hatEquipped);
    const shirtToEquip = shirtsFigure.querySelector('#item' + shirtEquipped);
    const pantsToEquip = pantsFigure.querySelector('#item' + pantsEquipped);
    hatToEquip.classList.add('equipped');
    shirtToEquip.classList.add('equipped');
    pantsToEquip.classList.add('equipped');
}


// asynchronous fetch on page load
// user info first, then items
document.addEventListener("DOMContentLoaded", async () => {
    await fetchUser();
    await fetchItems();
    highlightItems();
});

// called when item ARTICLE clicked
function handleItemClick (event)
{
    // console.log(event);
    console.log(event.currentTarget);

    // de-select any currently selected element
    if (itemSelected != 'null')
    {
        console.log(itemSelected);
        document.getElementById(itemSelected).classList.remove("selected");
    }

    event.currentTarget.classList.add("selected");
    itemSelected = event.currentTarget.id;
}