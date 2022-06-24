const input = document.getElementById("ingredient");
const suggestions = document.querySelector(".suggestions-list");

const ingredientsList = [
  "Brandy",
  "Brandy, Apricot",
  "Vermouth, Dry",
  "Vermouth, Sweet",
  "Vodka",
  "Vodka, Lemon",
  "Whiskey",
  "Triple Sec",
  "Cognac",
  "Tequila",
  "Bourbon",
  "Gin",
  "Rum",
  "Lime juice",
  "Lemon juice",
];

// What I admit to not understanding here is why it matches letter by letter

function search(str) {
  let results = [];
  const val = str.toLowerCase();
  for (let i = 0; i < ingredientsList.length; i++) {
    if (ingredientsList[i].toLowerCase().indexOf(val) > -1) {
      results.push(ingredientsList[i]);
    }
  }
  return results;
}

function searchHandler(e) {
  const inputVal = e.currentTarget.value;
  let results = [];
  if (inputVal.length > 0) {
    results = search(inputVal);
  }
  showSuggestions(results, inputVal);
}

function showSuggestions(results, inputVal) {
  suggestions.innerHTML = "";
  if (results.length > 0) {
    for (i = 0; i < results.length; i++) {
      let item = results[i];
      const match = item.match(new RegExp(inputVal, "i"));
      item = item.replace(match[0], `<strong>${match[0]}</strong>`);
      suggestions.innerHTML += `<li>${item}</li>`;
    }
    suggestions.classList.add("has-suggestions");
  } else {
    results = [];
    suggestions.innerHTML = "";
    suggestions.classList.remove("has-suggestions");
  }
}

// when you click on one of the suggested items, the value in the search box will be set to its value
function useSuggestion(e) {
  input.value = e.target.innerText;
  input.focus();
  suggestions.innerHTML = "";
  suggestions.classList.remove("has-suggestions");
}

input.addEventListener("keyup", searchHandler);
suggestions.addEventListener("click", useSuggestion);
