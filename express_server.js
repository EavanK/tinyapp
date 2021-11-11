const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const PORT = 8080;

//bodyParser converts the request body from a buffer
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.set("view engine", "ejs");

//url database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//user database
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// function creating Random ID
const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
};

app.get('/', (req, res) => {
  res.send('Hello');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// urls homepage
app.get('/urls', (req, res) => {
  const templateVars = {
    users: users,
    user_id: req.cookies.user_id,
    urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  const templateVars = {
    users: users,
    user_id: req.cookies.user_id,
  };
  res.render('urls_new', templateVars);
});

//register
app.get('/register', (req, res) => {
  const templateVars = {
    users : users,
    user_id: req.cookies.user_id
  };
  res.render('urls_register', templateVars);
});

//function checking if email exists on userDB
const userEmailCheck = (userDB, email) => {
  for (const id in userDB) {
    if (userDB[id].email === email) {
      return true;
    }
  }
  return false;
};

//add userId to database and cookie
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userId = generateRandomString();

  // if empty email or password are given, send error
  if (!email || !password) {
    // return res.status(400).send("I guess you forgot something ;)");
    return res.sendStatus(400);
  }
  if (userEmailCheck(users, email)) {
    //return res.status(400).send("Your email already exists :)");
    return res.sendStatus(400);
  }

  // create new user id
  // add new user id and info to user database
  users[userId] = {
    id: userId,
    email: email,
    password: password
  };

  // set user id cookie
  res.cookie('user_id', users[userId].id);
  res.redirect('/urls');
});
  
  
// add new short and long urls
app.post('/urls', (req, res) => {
  const templateVars = {
    shortURL: generateRandomString(),
    longURL: req.body.longURL
  };
  urlDatabase[templateVars.shortURL] = templateVars.longURL;
  res.redirect(`/urls/${templateVars.shortURL}`);
});


//delete url
app.post(`/urls/:shortURL/delete`, (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});


//edit long url
app.post(`/urls/:id`, (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
});

//short URL web page
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    users: users,
    user_id: req.cookies.user_id
  };
  res.render('urls_show', templateVars);
});

//login
app.get('/login', (req, res) => {
  const templateVars = {
    users : users,
    user_id: req.cookies.user_id
  };
  res.render('urls_login', templateVars);
});

app.post('/login', (req, res) => {

  
  res.redirect('/urls');
});

//logout
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


app.get('/hello', (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});