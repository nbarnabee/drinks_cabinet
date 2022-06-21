document.querySelector("input").value = "";
document
  .querySelector(".getByName-btn")
  .addEventListener("click", getDrinksByName);
document
  .querySelector(".getByIngredient-btn")
  .addEventListener("click", getDrinksByIngredient);
let drinkList = [];
const drinksContainer = document.querySelector(".card-container");

function getDrinksByName() {
  const searchTerm = document.querySelector(".nameFinder").value;
  drinkList = [];
  drinksContainer.innerHTML = "";
  fetch(
    `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${searchTerm}`
  )
    .then((res) => res.json())
    .then((data) => {
      makeDrinks(data);
    })
    .catch((err) => {
      console.log(`error ${err}`);
      alert("Sorry, we didn't find anything");
      document.querySelector("input").value = "";
    });
}

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
    // so at this point we have promiseArray, which is an array of objects which are themselves arrays of objects.  I want to drill down to the internal objects and concat them into an array that contains only drinks found in both arrays
    // If I want to keep working with the cocktail DB I will have to think of a way to pull out drinks that call for "whiskey" vs "whisky", etc; that would be a call for concatenation with removing duplicates (though there don't seem  to be duplicates:  that's why I need to do this in the first place!!!)

    let combinedArray = [];
    let fullyCombinedArray = [];
    for (let i = 0; i < promiseArray.length; i++) {
      combinedArray = combinedArray.concat(Object.values(promiseArray[i]));
      fullyCombinedArray = fullyCombinedArray.concat(
        ...Object.values(promiseArray[i])
      );
    }
    // combinedArray gives me an array consisting of the arrays-of-objects returned from the promises
    // fullyCombinedArray gives me an array of all of the objects, and is what I would need for dealing with the "whiskey/whisky" conundrum
    // getting combinedArray to where I need it is going to require a filter
    let filtered = combinedArray[0];
    let ids = [];
    // so if only one ingredient is chosen, it will just return the object array that lists all of those

    if (combinedArray.length > 1) {
      for (let i = 1; i < combinedArray.length; i++) {
        ids = combinedArray[i].map((a) => a.idDrink);
        filtered = combinedArray[0].filter((a) => ids.includes(a.idDrink));
      }
    }
    console.log(filtered);
    makeDrinkNameList(filtered);
  } catch (error) {
    console.log(error);
  }
}

function makeDrinkNameList(drinksArray) {
  if (drinksArray.length === 0) {
    drinksContainer.innerHTML =
      "<p>We couldn't find any drinks with those ingredients.</p>";
  } else if (drinksArray.length > 40) {
    drinksContainer.innerHTML = `<p>${drinksArray.length} matches found.  You might want to narrow it down a bit.`;
  } else {
    makeDrinkListItems(drinksArray);
  }
}

function makeDrinkListItems(arr) {
  arr.forEach((element) => {
    let drinkListItem = document.createElement("figure");
    drinkListItem.innerHTML = `<img src=${element.strDrinkThumb} class="card--small__img"><figcaption class="card--small__txt"><h2 class="card--small__title">${element.strDrink}</h2></figcaption>`;
    drinkListItem.classList.add("card--small");
    drinksContainer.appendChild(drinkListItem);
    drinkListItem.addEventListener("click", makeDrinkCardLarge);
  });
}

// need to shoehorn this into my objects somehow

function makeDrinkCardLarge(e) {
  console.log(e);
}

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

/*  Drink as a constructor function/class */

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
  // initially I had makeDrinkCardLarge() as part of the Drink object, but I think I will have to rethink this.  I have also duplicated makeDrinkCardSmall above...

  makeDrinkCardLarge() {
    // I should have a preexisting element that sits out of the window and is called up and populated when someone clicks on a drink
    console.log(`The user selected ${this.name}`);
  }
}

/*   ----  OLD CODE --------

Here is the original "drinkCardSmall," before I standardized the style to make them look the same regardless of whether you'd searched by name or by ingredients.
 
  makeDrinkCardSmall() {
    let drinkCardSmall = document.createElement("figure");
    drinkCardSmall.innerHTML = `<img src=${this.image} class="card--small__img"><figcaption class="card--small__txt"><ul class="card--small__list"><li><h2 class="card--small__title">${this.name}</h2><small>(${this.alcoholic})</small></li><li>Rating</li></ul></figcaption>`;
    drinkCardSmall.classList.add("card--small");
    drinksContainer.appendChild(drinkCardSmall);
    drinkCardSmall.addEventListener(
      "click",
      this.makeDrinkCardLarge.bind(this)
    );
  }


This was the original way that I built the "drinkCardFull"

   function makeList(arr, target) {
        document.querySelector([target]).innerHTML = "";
        arr.forEach(element => {
          let listItem = document.createElement("li");
          listItem.textContent = element;
          document.querySelector([target]).appendChild(listItem);
        })
      };

      document.querySelector("h2").textContent = data.drinks[0].strDrink;
      document.querySelector("img").src = data.drinks[0].strDrinkThumb;
      getIngredients();
      getInstructions();
      document.querySelector("input").value = "";
    })







*/
