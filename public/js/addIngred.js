document.getElementById("add-ingredient").addEventListener("click", () => {
  let newListElem = document.createElement("li");
  let newEntry = document.createElement("div");
  document.getElementById("ingredient-list").appendChild(newListElem);
  newListElem.appendChild(newEntry);
  let newIngred = document.createElement("input");
  let newMeasure = document.createElement("input");
  setAttributes(newIngred, {
    type: "text",
    name: "ingredient",
    placeholder: "ingredient",
  });
  setAttributes(newMeasure, {
    type: "text",
    name: "measure",
    placeholder: "measure",
  });
  newEntry.appendChild(newIngred);
  newEntry.appendChild(newMeasure);
});

function setAttributes(elem, attributes) {
  for (let entry in attributes) {
    elem.setAttribute(entry, attributes[entry]);
  }
}
