const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//GET ALL Movie Names API

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `SELECT * FROM movie;`;
  const dbResponse = await db.all(getMoviesQuery);
  let moviesArray = dbResponse.map((x) => ({ movieName: x.movie_name }));
  //console.log(moviesArray);
  response.send(moviesArray);
});

//ADD Movie Details API

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieDetailsQuery = `INSERT INTO
  movie (director_id,movie_name,lead_actor)
   VALUES
      (
         ${directorId},
        '${movieName}',
        '${leadActor}'
      );`;
  const insertedDetails = await db.run(addMovieDetailsQuery);
  console.log(insertedDetails);
  response.send("Movie Successfully Added");
});

// GET movie details based on id API

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT
    *
    FROM
        movie
    WHERE
        movie_id = ${movieId};`;
  const movie = await db.get(getMovieQuery);
  console.log(movie);
  response.send(movie);
});

//Update Movie API

app.put("/movies/:movieId/", async (require, request) => {
  const { movieId } = request.params;
  const movieDetails = request.body;

  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
    UPDATE
      movie
    SET
      director_id=${directorId},
      movie_name='${movieName}',
      lead_actor='${leadActor}',
    WHERE
      movie_id = ${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//DELETE API

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `DELETE FROM movie WHERE movie_id=${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//GET ALL Directors API
app.get("/directors/", async (request, response) => {
  const getMoviesQuery = `SELECT * FROM directors;`;
  const directorsObj = await db.all(getMoviesQuery);
  let directorsArray = directorsObj.map((x) => ({
    directorId: x.director_id,
    directorName: x.directorName,
  }));

  //console.log(moviesArray);
  response.send(directorsArray);
});

//GET director based on id API

app.get("/directors/:directorsId/movies/", async (request, response) => {
  const { directorsId } = request.params;

  const getMovieQuery = `SELECT movie_name FROM directors INNER JOIN movie ON directors.director_id=movie.director_id WHERE director.director_id=directorsId;`;
  let movie = await db.get(getMovieQuery);
  let outPut = movie.map((x) => ({
    movieName: x.movie_name,
  }));
  console.log(outPut);
  response.send(outPut);
});

module.exports = app;
