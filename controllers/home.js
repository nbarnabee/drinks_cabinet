const MongoClient = require("mongodb").MongoClient;

module.exports = {
  getIndex: (req, res) => {
    res.sendFile("./index.html");
  },

  recipeForm: (req, res) => {
    res.render("addRecipe.ejs");
  },

  addRecipe: async (req, res) => {
    try {
      const client = new MongoClient(process.env.DB_STRING);
      const db = client.db("drinks_cabinet");
      const ingredientObj = {};
      req.body.ingredient.forEach((a, i) => {
        ingredientObj[a] = req.body.measure[i];
      });
      const newRecipe = {
        recipe: req.body.recipe,
        category: req.body.category,
        "sub-category": req.body.subcategory,
        flavor: req.body.flavor,
        alcohol: req.body.alcohol,
        glass: req.body.glass,
        ingredients: ingredientObj,
        instructions: req.body.instructions,
      };
      console.log(newRecipe);
      // const result = await db.collection("recipes").insertOne(newRecipe);
      // console.log(`A document was inserted with the _id: ${result.insertedId}`);
      res.render("addRecipe.ejs");
    } catch (err) {
      console.log(err);
    }
  },
};
