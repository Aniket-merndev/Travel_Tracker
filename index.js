import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";

env.config();
const app = express(); 
// const port1 = process.env.PORT1;
const port = process.env.PORT;

const {Client} = pg;
const db = new Client({
  connectionString: process.env.EXTERNAL_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function checkVisisted() {

  const result = await db.query("SELECT country_code FROM visited_countries");
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  return countries;
}

app.get("/", async (req, res) => {
  const countries = await checkVisisted();
  res.render("index.ejs", { countries: countries, total: countries.length });
});



app.post("/add", async (req, res) => {
  const input = req.body["country"].trim(); 
  const normalizedInput = input.toUpperCase(); 

  let result = await db.query(
    "SELECT country_code FROM countries WHERE UPPER(country_name) = $1 OR UPPER(country_code) = $2",
    [normalizedInput, normalizedInput]
  );

  if (result.rows.length !== 0) {
    const countryCode = result.rows[0].country_code;

    await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)", [
      countryCode,
    ]);
    res.redirect("/");
  } else {
    res.redirect("/");
  }
});


// app.listen(port1, () => {
//   console.log(`Server running on http://localhost:${port1}`);
// });
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
