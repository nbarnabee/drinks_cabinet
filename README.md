# drinks_cabinet

## About the project

In its original (and current) form, this project pulls information from the [CocktailDB API]("https://www.thecocktaildb.com/api.php"), allowing users to search for cocktail recipes by name or by ingredient. Unfortunately, the poor data modelling and inconsistencies associated with that API caused me so many headaches that I decided to compile my own DB.  I am also in the process of building out a proper backend for the project, that will allow for logged in users to save information, write comments and rate drinks.

### Planned features:

- [x] Search for cocktails by name
- [x] Filter cocktails by ingredient
- [x] Display full cocktail recipe
- [] Save favorite recipes
- [] Save a list of ingredients
- [] Use your ingredients list to return a list of drinks you can make
- [] Build a shopping list based on the ingredients of drinks you would like to make

### To do:

- [] Improve UI
- [] Expand and organize list of searchable ingredients
- [] Expand my own recipe DB and migrate search functionality
- [] Add pagination

## Challenges

The main challenges that I have faced while working on this project involve dealing with the CocktailDB itself.

### Building an ingredient list

If I were to build my own database of cocktail recipes, I would store the measures and ingredients either in arrays or as key:value pairs in an object. The CocktailDB opted to store them separately, as key:value pairs in the following format: `strIngredient1: tequila` and a corresponding `strMeasure1: 1 measure.` Each drink object contains 15 of these strIngredient/Measure keys, though the vast majority of them are empty.

In order to build a list of ingredients, I extracted the values (if they existed), from the object I received from the CocktailDB and pushed them into a two-dimensional array, which I then attached to the drink objects that I had built to contain the information attached to each drink.

```
function getIngredients(source, target) {
  let ingredients = [];
  for (let i = 1; i <= 15; i++) {
    if (!source[`strIngredient${i}`]) break;
    else
      ingredients.push([source[`strMeasure${i}`], source[`strIngredient${i}`]]);
  }
  target.ingredients = ingredients;
}
```

### Multi-ingredient searches

Although the CocktailDB offers multi-ingredient services as a paid feature, I had no intention of paying for it (besides, where's the fun in that?). I did want to enable a multi-ingredient search, however. I opted to set up a search function that made multiple fetch requests to the DB, then bundled the results and passed them to additional functions, which would concatenate the data into a multidimensional array, then filter for the objects that were common to all of the arrays, and finally return those results.

```
async function getDrinksByIngredient() {
  drinksContainer.innerHTML = "";
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
    combinePromises(promiseArray);
  } catch (err) {
    drinksContainer.innerHTML =
      "<p>We couldn't find any drinks with those ingredients.</p>";
    console.log(err);
  }
}

function combinePromises(array) {
  let combinedArray = [];
  for (let i = 0; i < array.length; i++) {
    combinedArray = combinedArray.concat(Object.values(array[i]));
  }
  if (combinedArray.length > 1) {
    filterDrinkList(combinedArray);
  } else evaluateArrayLength(combinedArray[0]);
}

function filterDrinkList(array) {
  let ids = [],
    filtered = [];
  for (let i = 1; i < array.length; i++) {
    ids = array[i].map((a) => a.idDrink);
    filtered = array[0].filter((a) => ids.includes(a.idDrink));
    array[0] = filtered;
  }
  evaluateArrayLength(filtered);
}
```


### Dealing with inconsistencies

The CocktailDB allows subscribers to upload new recipes, and there seems to be very little interest in maintaining consistency. Thus, a search for "whiskey" and a search for "whisky" will produce different results. Equally, "lime" and "lime juice" return mutually exclusive recipe lists.

Because I would like to return the widest possible results, and not be bound to, say, insisting that "whiskey" and "whisky" are two different ingredients, I have to come up with an option that will search for "related" ingredients, concatenate the results, and then introduce them to the concatenation/filtering process outlined above.

So far, I haven't come up with a good solution.
