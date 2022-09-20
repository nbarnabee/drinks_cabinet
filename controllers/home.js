const mongoConnect = require("../config/database");

module.exports = {
  getIndex: (req, res) => {
    res.sendFile("./index.html");
  },

  recipeForm: (req, res) => {
    res.render("addRecipe.ejs");
  },

  addRecipe: async (req, res) => {
    try {
      const client = mongoConnect.getConnection();
      const db = client.db("drinks_cabinet");
      // The ingredients are uploaded as two arrays, one containing the ingredients and the other containing the corresponding measures.  Here I associate them with each other and insert them into an object.  (But I have to do something differently if there's only one ingredient.. which I doubt there would be but you never know)
      const ingredientObj = {};
      if (typeof req.body.ingredient === "string") {
        ingredientObj[req.body.ingredient] = req.body.measure;
      } else
        req.body.ingredient.forEach((a, i) => {
          ingredientObj[a] = req.body.measure[i];
        });
      const newRecipe = {
        name: req.body.recipe,
        category: req.body.category,
        "sub-category": req.body.subcategory,
        favorited: 0, // For future use
        rating: [Number(req.body.rating)], // rating will be an array of numbers and later I'll take their average
        flavor: req.body.flavor,
        alcohol: Number(req.body.alcohol),
        glass: req.body.glass,
        ingredients: ingredientObj,
        instructions: req.body.instructions,
      };
      console.log(newRecipe);
      const result = await db.collection("recipes").insertOne(newRecipe);
      console.log(`A document was inserted with the _id: ${result.insertedId}`);
      res.render("addRecipe.ejs");
    } catch (err) {
      console.log(err);
    }
  },
};
