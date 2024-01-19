const express = require("express");
const app = express();

const path = require("path");
const notes = require(path.resolve("src/data/notes-data"));

app.use(express.json());

// 1. move validation logic GET /notes/:noteId  below as a middleware function
function noteWithId(req, res, next) {
  const noteId = Number(req.params.noteId);
  const foundNote = notes.find((note) => note.id === noteId);
  if (foundNote) {
    return next();
  } else {
    // 2. if error, validation middleware calls next() with the error object
    next({
      status: 404,
      message: `Note id not found: ${req.params.noteId}`,
    })
  }
};

app.get(
  "/notes/:noteId",
  noteWithId,
  (req, res) => {
  const noteId = Number(req.params.noteId);
  const foundNote = notes.find((note) => note.id === noteId);
  // if (foundNote)  {
    res.json({ data: foundNote });
  });

app.get("/notes", (req, res) => {
  res.json({ data: notes });
});

let lastNoteId = notes.reduce((maxId, note) => Math.max(maxId, note.id), 0);

// create function to check post has text property + middleware error
function postHasText(req, res, next) {
  const { data: { text } = {} } = req.body;
  if (text) {
    return next();
  } else {
    // 3. if error, validaiton middleware calls next() with error object see example in lesson
    return next({
      status: 400,
      message: "A 'text' property is required.",
    })
  }
};

// post the note if it has text, status 201
app.post(
  "/notes", postHasText,
  (req, res) => {
    const { data: { text } = {} } = req.body;
    // if (text) {
      const newNote = {
        id: ++lastNoteId,
        text,
      };
      notes.push(newNote);
      res.status(201).json({ data: newNote });
  });

// Not found handler
app.use((req, res, next) => {
  next({
    status: 404,
    message: `Not found: ${req.originalUrl}`,
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error(error);
  // return 500   
  const {
    status = 500,
    message = 'Something went wrong!',
  } = error
  //   returns status of error object
  res.status(status).json({ error: message });
});

module.exports = app;