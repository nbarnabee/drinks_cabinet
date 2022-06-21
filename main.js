/* -------  THE SEARCH AND ALL IT ENTAILS -------- */

document.querySelector("input").value = "";
document
  .querySelector(".getByName-btn")
  .addEventListener("click", getDrinksByName);
document
  .querySelector(".getByIngredient-btn")
  .addEventListener("click", getDrinksByIngredient);
let drinkList = [];
const drinksContainer = document.querySelector(".card-container");

/* Searching by name is very straightforward.  There's only one fetch request and the array that's returned includes full information about each drink.  Initially I stored it and used it to make the drinks, but now I am trying a different approach that involves storing less data and making more fetch requests. 

We'll just make the minimal card and then do another fetch request based on the drink ID in order to produce the pop-up recipe card */

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

/* Searching by ingredient is much more difficult, as I have no intention of paying to get the multi-ingredient search option.  (Where's the fun in that?)  Instead I'm doing it "by hand," which means making multiple fetch requests and concatenating the data.   */

async function getDrinksByIngredient() {
  drinksContainer.innerHTML = ""; // clear out old cards
  let ingredArr = Array.from(document.getElementsByClassName("ingred-check"));
  ingredArr = ingredArr.filter((a) => a.checked === true);
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
    combinePromises(promiseArray);
  } catch (err) {
    drinksContainer.innerHTML =
      "<p>We couldn't find any drinks with those ingredients.</p>";
    console.log(err);
  }
}

/* so at this point we have promiseArray, which is an array of objects which are themselves arrays of objects.  I want to drill down to the internal objects and concat them into an array that contains only the drinks common to all arrays

If I want to keep working with the cocktail DB I will have to think of a way to pull out drinks that call for "whiskey" vs "whisky", etc; I could brute force it by simply setting it up so that, say, selecting an "orange liqueur" checkbox would send a fetch request for "triple sec," "cointreau," and "orange liqueur"

One idea I had toyed with was for a fully combined array, which I thought could solve that problem... only it's been a few days and I no longer fully follow my own train of thought.  Oops.

Old notes here:
(promiseArray was what I initially called the promise bundle from the multi-ingredient fetch function)

  let fullyCombinedArray = [];
    fullyCombinedArray = fullyCombinedArray.concat(
      ...Object.values(promiseArray[i])
    );
  }

    // fullyCombinedArray gives me an array of all of the objects, and is what I would need for dealing with the "whiskey/whisky" conundrum
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
    console.log(a);
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
    let drinkCardSmall = document.createElement("figure");
    drinkCardSmall.innerHTML = `<img src=${this.image} class="card--small__img"><figcaption class="card--small__txt"><h2 class="card--small__title">${this.drink}</h2></figcaption>`;
    drinkCardSmall.classList.add("card--small");
    drinksContainer.appendChild(drinkCardSmall);
    drinkCardSmall.addEventListener(
      "click",
      this.makeDrinkCardLarge.bind(this)
    );
  }
  makeDrinkCardLarge() {
    // I should have a preexisting element that sits out of the window and is called up and populated when someone clicks on a drink
    console.log(`The user selected ${this.drink}, id ${this.id}`);
  }
}

/*  MAKING THE FULL DRINK OBJECTS  
I am intending to take a new approach here.
*/

function makeDrinks(data) {
  document.querySelector(".nameFinder").value = "";
  for (let i in data.drinks) {
    drinkList[i] = new Drink(
      data.drinks[i].strDrink,
      data.drinks[i].strGlass,
      data.drinks[i].strAlcoholic,
      data.drinks[i].strDrinkThumb
    );
    getIngredients(data.drinks[i], i);
    getInstructions(data.drinks[i], i);
  }
  for (let drink of drinkList) {
    drink.makeDrinkCardSmall();
  }
}

function getIngredients(obj, index) {
  let ingredients = [];
  let ingredientVar;
  let ingredientMeasureVar;
  for (let i = 1; i <= 15; i++) {
    ingredientVar = `strIngredient${i}`;
    ingredientMeasureVar = `strMeasure${i}`;
    if (!obj[ingredientVar]) break;
    else ingredients.push([obj[ingredientMeasureVar], obj[ingredientVar]]);
    drinkList[index].ingredients = ingredients;
  }
}

function getInstructions(obj, index) {
  let instructionList = [];
  instructionList = instructionList.concat(obj.strInstructions.split(". "));
  drinkList[index].instructions = instructionList;
}

/*  DRINK CONSTRUCTOR FUNCTION and everything that goes along with it */
/* I really need to rethink this. */

class Drink {
  constructor(name, glass, alcoholic, image) {
    /* all of the following are strings */
    this.name = name;
    this.glass = glass;
    this.alcoholic = alcoholic;
    this.image = image;
    /* the Drink has additional properties -- this.ingredients and this.instructions -- which are added by the getIngredients and getInstructions functions
    ingredients is a 2D array with the following syntax: ["measure", "ingredient"] */
  }

  makeDrinkCardSmall() {
    let drinkCardSmall = document.createElement("figure");
    drinkCardSmall.innerHTML = `<img src=${this.image} class="card--small__img"><figcaption class="card--small__txt"><h2 class="card--small__title">${this.name}</h2></figcaption>`;
    drinkCardSmall.classList.add("card--small");
    drinksContainer.appendChild(drinkCardSmall);
    drinkCardSmall.addEventListener(
      "click",
      this.makeDrinkCardLarge.bind(this)
    );
  }

  makeDrinkCardLarge() {
    // I should have a preexisting element that sits out of the window and is called up and populated when someone clicks on a drink
    console.log(`The user selected ${this.name}`);
  }
}
