# drinks_cabinet

## About the project

In its current form, this project pulls information from the [CocktailDB API]("https://www.thecocktaildb.com/api.php"). The data formatting in the API, and the lack of consistency with regards to ingredients, causes me certain difficulties, and I'm tempted to compile my own DB in the future.

### Planned features:

- [x] Search for cocktails by name
- [x] Filter cocktails by ingredient
- [x] See full cocktail recipe
- [] Save favorite recipes
- [] Save a list of ingredients
- [] Use your ingredients list to return a list of drinks you can make
- [] Build a shopping list based on the ingredients of drinks you would like to make

### To do:

- [] Improve UI
- [] Improve search function to take into account the DB's inconsistencies


## Challenges

The main challenges that I have faced while working on this project involve dealing with the CocktailDB itself.  

### Building an ingredient list

If I were to build my own database of cocktail recipes, I would store the measures and ingredients either in arrays or as key:value pairs in an object.  The CocktailDB opted to store them separately, as key:value pairs in the following format: `strIngredient1: tequila` and a corresponding `strMeasure1: 1 measure.`  Each drink object contains 15 of these strIngredient/Measure keys, though the vast majority of them are empty.

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

Although the CocktailDB offers multi-ingredient services as a paid feature, I had no intention of paying for it (besides, where's the fun in that?).  I did want to enable a multi-ingredient search, however. I opted to set up a search function that made multiple fetch requests to the DB, then bundled the results and passed them to additional functions, which would concatenate the data into a multidimensional array, then filter for the objects that were common to all of the arrays, and finally return those results.

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
  let ids = [];
  for (let i = 1; i < array.length; i++) {
    ids = array[i].map((a) => a.idDrink);
    filtered = array[0].filter((a) => ids.includes(a.idDrink));
  }
  evaluateArrayLength(filtered);
}
```

### Dealing with inconsistencies

The CocktailDB allows subscribers to upload new recipes, and there seems to be very little interest in maintaining consistency.  Thus, a search for "whiskey" and a search for "whisky" will produce different results.  Also, ingredients tend to be inputted by brand name; thus a search for "triple sec" will return a different set of results than a search for "cointreau" which will also be different from "orange liqueur," although all three are variations on the same thing.

Because I would like to return the widest possible results, and not be bound to, say, insisting that a margarita could only be made with Triple Sec, I have to come up with an option that will search for "related" ingredients, concatenate the results, and then introduce them to the concatenation/filtering process outlined above.

So far, I haven't come up with a good solution.

