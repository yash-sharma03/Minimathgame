// holds user data after each fetch
let userdata = [];

const buyFigure = document.getElementById('buyFigure');
const buyP = document.getElementById('buyP');
const buyButton = document.getElementById('buyButton');

// figure: item carousel
const hatsFigure = document.getElementById('hatsFigure');
const shirtsFigure = document.getElementById('shirtsFigure');
const pantsFigure = document.getElementById('pantsFigure');
// img elements
const hatsImg = document.getElementById('hatsImg');
const shirtsImg = document.getElementById('shirtsImg');
const pantsImg = document.getElementById('pantsImg');

// default item articles
const defHat = document.getElementById('item0');
const defShirt = document.getElementById('item-1');
const defPants = document.getElementById('item-2');

// hold "article" of equipped items
let hatEquipped, shirtEquipped, pantsEquipped;
// after selecting item: holds "article" of selected item
let itemSelected = null;

// hold "article"s of owned items
let itemsOwned = [];

/**
 * RUNS FIRST ON PAGE LOAD
 * asynchronously fetch and display items through /api/getItems
 */
async function fetchItems ()
{
    // add metadata to default items
    defHat.metadata = {
        id: 0,
        file: '/images/blank.png',
        type: 'Hat'
    };
    defHat.addEventListener("click", handleItemClick);

    defShirt.metadata = {
        id: -1,
        file: '/images/blank.png',
        type: 'Shirt'
    };
    defShirt.addEventListener("click", handleItemClick);

    defPants.metadata = {
        id: -2,
        file: '/images/blank.png',
        type: 'Pants'
    };
    defPants.addEventListener("click", handleItemClick);

    try
    {
        /** fetch all items from database */
        const response = await fetch('/api/getItems');
        const data = await response.json();

        /** display each item as "article" element within the respective figures */
        for (const item of data.items)
        {
            const nArticle = document.createElement("article");
            nArticle.id = 'item' + item.ItemID;
            // store ItemType in element metadata
            nArticle.metadata = {
                id: item.ItemID,
                file: '/images/' + item.ItemName + '.png',
                price: item.ItemPrice,
                type: item.ItemType
            };
            nArticle.innerHTML = "<h2>" + item.ItemName + "</h2><p>" + item.ItemPrice + "</p>";
            nArticle.addEventListener("click", handleItemClick);

            // which carousel to add the article to?
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
        // extract current "equipped" items
        hatEquipped = document.getElementById('item' + userdata.UserHat);
        shirtEquipped = document.getElementById('item' + userdata.UserShirt);
        pantsEquipped = document.getElementById('item' + userdata.UserPants);

        // display equipped items on avatar
        hatsImg.setAttribute("src", hatEquipped.metadata.file);
        shirtsImg.setAttribute("src", shirtEquipped.metadata.file);
        pantsImg.setAttribute("src", pantsEquipped.metadata.file);

        // clear itemsOwned (except default items)
        itemsOwned = [defHat, defShirt, defPants];
        // retrieve all items owned by user
        for (item of userdata.UserItems)
            itemsOwned.push( document.getElementById('item' + item.ItemID) );

        // paint owned items red
        for (item of itemsOwned)
            item.classList.add('owned');
    }
    catch (error)
    {
        console.error("Error fetching user: ", error);
    }
}

// highlight items
// account for whether there is selected item
function highlightItems ()
{
    // highlight equipped items
    hatEquipped.classList.add('equipped');
    shirtEquipped.classList.add('equipped');
    pantsEquipped.classList.add('equipped');

    // only update if there is selected item
    if (itemSelected != null)
    {
        itemSelected.classList.add('selected');
        // LEFT SIDE: load images of equipped items, then selected item
        switch (itemSelected.metadata.type)
        {
            case 'Hat':
                hatsImg.setAttribute("src", itemSelected.metadata.file);
                shirtsImg.setAttribute("src", shirtEquipped.metadata.file);
                pantsImg.setAttribute("src", pantsEquipped.metadata.file);
                break;
            case 'Shirt':
                hatsImg.setAttribute("src", hatEquipped.metadata.file);
                shirtsImg.setAttribute("src", itemSelected.metadata.file);
                pantsImg.setAttribute("src", pantsEquipped.metadata.file);
                break;
            case 'Pants':
                hatsImg.setAttribute("src", hatEquipped.metadata.file);
                shirtsImg.setAttribute("src", shirtEquipped.metadata.file);
                pantsImg.setAttribute("src", itemSelected.metadata.file);
                break;
        }

        // update buyFigure
        buyFigure.style.visibility = 'visible';
        buyP.textContent = itemSelected.querySelector('h2').textContent;
        /**
         * buyButton behavior logic:
         * 
         * if user owns item (OR DEFAULT ITEM):
         *      if equipped: disabled
         *      else: "equip", enabled
         * else
         *      if enough gold: buy, enabled
         *      else: broke, disabled
         */
        if (itemsOwned.includes(itemSelected) || itemSelected.metadata.id < 1)
        {
            if (itemSelected == hatEquipped || itemSelected == shirtEquipped || itemSelected == pantsEquipped)
            {
                buyButton.textContent = 'Already equipped';
                buyButton.disabled = true;
            }
            else
            {
                buyButton.textContent = 'Equip';
                buyButton.disabled = false;
            }
        }
        else
        {
            if (userdata.UserGold >= itemSelected.metadata.price)
            {
                buyButton.textContent = 'Buy';
                buyButton.disabled = false;
            }
            else
            {
                buyButton.textContent = 'Too Broke To Buy';
                buyButton.disabled = true;
            }
        }
    }
}

// called when item ARTICLE clicked
// change itemSelected
// article accessible by: event.currentTarget
function handleItemClick (event)
{
    // de-select any currently selected element
    if (itemSelected != null)
        itemSelected.classList.remove("selected");

    // update selected item, highlight
    itemSelected = event.currentTarget;

    // highlight items accordingly
    highlightItems();
}

// asynchronous fetch on page load
// user info first, then items
document.addEventListener("DOMContentLoaded", async () => {
    await fetchItems();
    await fetchUser();
    highlightItems();

    buyButton.addEventListener('click', handleBuy);
});

/** on buy button mouse click */
async function handleBuy ()
{
    /** which api */
    const apiToCall = (itemsOwned.includes(itemSelected) ? '/api/equipItem' : '/api/buyItem');

    // POST request to api to buy/equip selected item
    const response = await fetch(apiToCall, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ItemID: itemSelected.metadata.id })
    });

    if (!response.ok) console.log(response);

    const data = await response.json();
    console.log(data);

    // remove old equipped classes
    hatEquipped.classList.remove('equipped');
    shirtEquipped.classList.remove('equipped');
    pantsEquipped.classList.remove('equipped');

    // redraw item articles
    await fetchUser();
    highlightItems();
}