/* -------  THE SEARCHES AND ALL THEY ENTAIL -------- */

document.querySelector("input").value = "";
document
  .querySelector(".getByName-btn")
  .addEventListener("click", getDrinksByName);
document
  .querySelector(".getByIngredient-btn")
  .addEventListener("click", getDrinksByIngredient);
document.querySelector(".reset-btn").addEventListener("click", resetAll);
let drinkList = [];
const userInput = document.querySelector(".ingredient-search-bar");
const drinksContainer = document.querySelector(".card-container");
userInput.value = "";

function resetAll() {
  drinkList = [];
  userInput.value = "";
  document.querySelector(".nameFinder").value = "";
  drinksContainer.innerHTML = "";
}

/* Searching by name is very straightforward.  There's only one fetch request and the array that's returned includes full information about each drink.  Initially I stored it and used it to make the drinks, but now I am trying a different approach that involves storing less data and making more fetch requests. 

We'll just make the minimal card and then do another fetch request based on the drink ID in order to produce the pop-up recipe card.  For some reason having it as a stand-alone function wasn't working, so I stuck it as a method in the drink card item... which I suppose is more OOP anyway.*/

function getDrinksByName() {
  const searchTerm = document.querySelector(".nameFinder").value;
  drinkList = [];
  drinksContainer.innerHTML = "";
  fetch(
    `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${searchTerm}`
  )
    .then((res) => res.json())
    // This returns an array containing a single object, with the key "drinks" and the value an array of objects, with each of these sub-objects containing information about a single drink.
    // We access the array of objects with "data.drinks" and send it away for processing.
    .then((data) => {
      document.querySelector(".nameFinder").value = "";
      makeDrinkListItems(data.drinks);
    })
    .catch((err) => {
      drinksContainer.innerHTML =
        "<p>We couldn't find any drink by that name.</p>";
      console.log(`error ${err}`);
    });
}

/* Searching by ingredient is more difficult, as I have no intention of paying to get the multi-ingredient search option.  (Where's the fun in that?)  Instead I'm doing it "by hand," which means making multiple fetch requests and concatenating the data.   */

async function getDrinksByIngredient() {
  drinksContainer.innerHTML = ""; // clear out old cards
  let ingredArr = Array.from(document.getElementsByClassName("ingred-check"));
  ingredArr = ingredArr.filter((a) => a.checked === true);
  // Because I have added a search bar, I need to add its value to the array.  But since the checkboxes are pushing objects into the array, I can't just take the straight value.
  // I also don't want to add it to the array if it's empty.
  // One thing I'll say for the CocktailDB is that they clearly handle matters of capitalization and spacing on their end.  Nice
  if (document.querySelector(".ingredient-search-bar").value) {
    let userInput = {
      value: document.querySelector(".ingredient-search-bar").value,
    };
    ingredArr.push(userInput);
  }
  console.log(ingredArr);
  try {
    let promiseArray = await Promise.all(
      ingredArr.map((a) =>
        fetch(
          `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${a.value}`
        ).then((response) => response.json())
      )
    );
    // At this point, promiseArray is an array of objects (each Promise is an object).  Those promise objects each contain an array of objects; each of these sub-objects contains the information about a particular drink.
    // We send the array away for processing.
    userInput.value = "";
    combinePromises(promiseArray);
  } catch (err) {
    drinksContainer.innerHTML =
      "<p>We couldn't find any drinks with those ingredients.</p>";
    console.log(err);
  }
}

/* so at this point we have promiseArray, which is an array of objects which are themselves arrays of objects.  I want to drill down to the internal objects and concat them into an array that contains only the drinks common to all arrays

If I want to keep working with the cocktail DB I will have to think of a way to pull out drinks that call for "whiskey" vs "whisky", etc; I could brute force it by simply setting it up so that, say, selecting an "orange liqueur" checkbox would send a fetch request for "triple sec," "cointreau," and "orange liqueur"

I could do that by concatenating the promises that I would get from, say, a fetch for "whiskey" and one for "whisky", then filtering out the duplicates.

Then add it to combinedArray 


function squashArrays(arr) {
    let Array = [];
    for (let i = 0; i < arr.length; i++)
    squashedArray = squashedArray.concat(
      ...Object.values(arr[i])
    );
    return squashedArray.filter((a, i, arr) => arr.indexOf(a) === i);
}

do something like that for each ingredient... or actually this is so much of a PITA that I might just want to host a combined array thing on my site.  Or do something else.  Not sure of the best approach.


*/

function combinePromises(array) {
  let combinedArray = [];
  for (let i = 0; i < array.length; i++) {
    combinedArray = combinedArray.concat(Object.values(array[i]));
  }
  // Now we have a concatenation of the arrays taken from each of the promise objects.  Each sub-array contains the drink data objects
  // Arrays with length > 1 will have to be filtered; an array with length === 1 can skip that step, and an array with length 0 would have been caught earlier in the process.
  if (combinedArray.length > 1) {
    filterDrinkList(combinedArray);
  } else evaluateArrayLength(combinedArray[0]);
  // Note that here we are stripping off the "outer layer" and passing only the array of objects to the next function
}

//

function filterDrinkList(array) {
  let ids = [];
  for (let i = 1; i < array.length; i++) {
    ids = array[i].map((a) => a.idDrink);
    filtered = array[0].filter((a) => ids.includes(a.idDrink));
  }
  evaluateArrayLength(filtered);
}
/* I'm a little proud of this one.  Any drink IDs that exist in all of the arrays will necessarily occur in the first array.  

So we take the idDrink values from the second, third, etc. arrays, map each in turn, and check the elements of the first array to see if they are included. 

Then we pass it on to the next step in evaluation.*/

function evaluateArrayLength(array) {
  if (array.length === 0) {
    drinksContainer.innerHTML =
      "<p>We couldn't find any drinks with those ingredients.</p>";
  } else if (array.length > 40) {
    drinksContainer.innerHTML = `<p>We found ${array.length} matches.  You might want to narrow it down a bit.`;
  } else {
    makeDrinkListItems(array);
  }
}

function makeDrinkListItems(array) {
  let drinkList = [];
  array.forEach(function (a, i) {
    drinkList[i] = new DrinkListItem(a.strDrink, a.idDrink, a.strDrinkThumb);
  });
  for (let drink of drinkList) {
    drink.makeNameCard();
  }
}

class DrinkListItem {
  constructor(drink, id, image) {
    this.drink = drink;
    this.id = id;
    this.image = image;
  }
  makeNameCard() {
    let nameCard = document.createElement("figure");
    nameCard.innerHTML = `<img src=${this.image} class="card__img"><figcaption class="card__name"><h3>${this.drink}</h3></figcaption>`;
    nameCard.classList.add("card");
    drinksContainer.appendChild(nameCard);
    nameCard.addEventListener("click", this.getDrinkById.bind(this));
  }
  getDrinkById() {
    let id = this.id;
    fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`)
      .then((res) => res.json())
      .then((data) => makeDrink(data.drinks[0]))
      .catch((err) => console.log(err));
  }
  /* The API returns an object that contains an array that contains an object.  We only want that internal object, so we extract it from its wrapping and pass it along.  Initially I had set makeDrinkCard() as a method inside this object, but really they're two separate things, so time to pass it along to the code I already wrote */
}

/*  MAKING THE FULL DRINK OBJECT */

function makeDrink(data) {
  let drink = new Drink(
    data.strDrink,
    data.idDrink,
    data.strGlass,
    data.strAlcoholic,
    data.strDrinkThumb
  );
  getIngredients(data, drink);
  getInstructions(data, drink);
  drink.makeDrinkCard();
}

function getIngredients(source, target) {
  let ingredients = [];
  for (let i = 1; i <= 15; i++) {
    if (!source[`strIngredient${i}`]) break;
    else
      ingredients.push([source[`strMeasure${i}`], source[`strIngredient${i}`]]);
  }
  target.ingredients = ingredients;
}

/* This is taking the mess that is the way the cocktail DB handled ingredients and measures and turning it into a 2D Array with the following format:
["measure1 ingred1", "measure2 ingred2"], ....] 
}*/

function getInstructions(source, target) {
  let instructionList = [];
  instructionList = instructionList.concat(source.strInstructions.split(". "));
  target.instructions = instructionList.filter((a) => a !== "");
}
/* This takes the jumble of instructions and splits them into an array of individual sentences.  I found that some instruction lists included empty sentences, so have filtered them out.*/

function makeListFromArray(source, target) {
  let listItem;
  document.getElementById(target).innerHTML = "";
  source.forEach((a) => {
    listItem = document.createElement("li");
    if (Array.isArray(a)) listItem.innerText = a.join(" ");
    else listItem.innerText = a;
    document.getElementById(target).appendChild(listItem);
  });
}

/*  DRINK CONSTRUCTOR FUNCTION and everything that goes along with it */

class Drink {
  constructor(drink, id, glass, alcoholic, image) {
    /* all of the following are strings */
    this.drink = drink;
    this.id = id;
    this.glass = glass;
    this.alcoholic = alcoholic;
    this.image = image;
    /* each drink will have additional properties -- this.ingredients and this.instructions -- which are added by the getIngredients and getInstructions functions
    ingredients is a 2D array with the following syntax: ["measure", "ingredient"] */
  }

  makeDrinkCard() {
    document.getElementById("drink").textContent = this.drink;
    this.setImage();
    makeListFromArray(this.ingredients, "ingredients");
    makeListFromArray(this.instructions, "instructions");
    document.querySelector(".drink-modal").classList.remove("modal-closed");
  }

  setImage() {
    document.querySelector(".modal__img").innerHTML = "";
    let drinkImage = document.createElement("img");
    drinkImage.setAttribute("src", this.image);
    document.querySelector(".modal__img").appendChild(drinkImage);
  }
}

/* -------- Controlling the modal --------- */

document.querySelector(".closeModal-btn").addEventListener("click", closeModal);

function closeModal() {
  document.querySelector(".drink-modal").classList.add("modal-closed");
}
