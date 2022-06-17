document.querySelector("input").value = "";
document.querySelector("button").addEventListener("click", getDrinks);
const select = document.getElementById("searchType");
let drinkList = [];

function getDrinks() {
  const searchTerm = document.querySelector("input").value;
  const searchType = select.options[select.selectedIndex].value;
  drinkList = [];
  document.querySelector(".card-container").innerHTML = "";
  fetch(
    `https://www.thecocktaildb.com/api/json/v1/1/${searchType}${searchTerm}`
  )
    .then((res) => res.json())
    .then((data) => {
      // because the format of the information is different depending on whether we're searching by name or by ingredient, we have to kick the data in two different directions
      if (searchType.includes("filter")) {
        console.log(data);
      } else makeDrinks(data);
    })
    .catch((err) => {
      console.log(`error ${err}`);
      alert("Sorry, we didn't find anything");
      document.querySelector("input").value = "";
    });
}

// how I can do this:  the filter returns the drink name, a photo and an id
// basically put all of the ids into an array
// then run another search and put all of those ids in an array
// repeat as necessary
// compare the arrays and pick out the common values, and stick them into another array
// make a fetch request for each item in that array, and push the results into YET ANOTHER array, which you then feed to makeDrinks

function makeDrinks(data) {
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

/*
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
    drinkCardSmall.innerHTML = `<img src=${this.image} class="card--small__img"><figcaption class="card--small__txt"><ul class="card--small__list"><li><h2 class="card--small__title">${this.name}</h2><small>(${this.alcoholic})</small></li><li>Rating</li></ul></figcaption>`;
    drinkCardSmall.classList.add("card--small");
    document.querySelector(".card-container").appendChild(drinkCardSmall);
    drinkCardSmall.addEventListener(
      "click",
      this.makeDrinkCardLarge.bind(this)
    );
  }

  makeDrinkCardLarge() {
    // actually, no.  I should have a preexisting element that sits out of the window and is called up and populated when someone clicks on a drink
    let drinkCardLarge = document.createElement("section");
    console.log(`The user selected ${this.name}`);
  }
}
