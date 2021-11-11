const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const PORT = 8080;

//bodyParser converts the request body from a buffer
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.set("view engine", "ejs");

//ulrDB
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
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

//function matching if email exists on userDB
const userEmailCheck = (userDB, email) => {
  for (const id in userDB) {
    if (userDB[id].email === email) {
      return true;
    }
  }
  return false;
};

//function matching password
const userPasswordCheck = (userDB, password) => {
  for (const id in userDB) {
    if (userDB[id].password === password) {
      return true;
    }
  }
  return false;
};
//function matching userID
const matchingUserId = (userDB, email) => {
  for (const id in userDB) {
    if (userDB[id].email === email) {
      return id;
    }
  }
};

//function for longURL
const urlsForUser = (urlDB, cookie) => {
  const urlForUser = {};
  for (const short in urlDB) {
    if (urlDB[short].userID === cookie) {
      urlForUser[short] = {
        longURL: urlDB[short].longURL,
        userID: cookie
      };
    }
  }
  return urlForUser;
};



//GET urls homepage
app.get('/urls', (req, res) => {
  const user_id = req.cookies.user_id;
  const urls = urlsForUser(urlDatabase, user_id);
  const templateVars = {
    users: users,
    user_id: user_id,
    urls: urls
  };
  res.render('urls_index', templateVars);
});


//POST add new short and long urls
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const userId = req.cookies.user_id;
  if (!userId) {
    return res.sendStatus(401);
  }
  if (longURL.includes('https://') || longURL.includes('http://')) {
    urlDatabase[shortURL] = { longURL: longURL, userID: userId };
  } else {
    urlDatabase[shortURL] = { longURL: `https://${longURL}`, userID: userId };
  }
  res.redirect(`/urls/${shortURL}`);
});


//GET Creat New URL
app.get('/urls/new', (req, res) => {
  const user_id = req.cookies.user_id;
  const templateVars = {
    users: users,
    user_id: user_id,
  };
  if (!user_id) {
    return res.sendStatus(401);
  }
  res.render('urls_new', templateVars);
});


//POST delete url
app.post(`/urls/:shortURL/delete`, (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    return res.sendStatus(404);
  }

  const userId = req.cookies.user_id;
  if (!userId || urlDatabase[shortURL].userID !== userId) {
    return res.sendStatus(401);
  }
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});


//POST edit long url
app.post(`/urls/:id`, (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  const userId = req.cookies.user_id;

  if (longURL.includes('https://') || longURL.includes('http://')) {
    urlDatabase[shortURL] = { longURL: longURL, userID: userId };
  } else {
    urlDatabase[shortURL] = { longURL: `https://${longURL}`, userID: userId };
  }
  if (!userId || urlDatabase[shortURL].userID !== userId) {
    return res.sendStatus(401);
  }
  res.redirect('/urls');
});

//GET short URL web page
app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    return res.sendStatus(404);
  }
  const longURL = urlDatabase[shortURL].longURL;
  const userId = req.cookies.user_id;
  const templateVars = {
    shortURL: shortURL,
    longURL: longURL,
    users: users,
    user_id: userId
  };
  if (!userId) {
    return res.sendStatus(401);
  }
  res.render('urls_show', templateVars);
});

//GET leading to long URL
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    return res.sendStatus(404);
  }
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});


//GET register
app.get('/register', (req, res) => {
  const templateVars = {
    users: users,
    user_id: req.cookies.user_id
  };
  res.render('urls_register', templateVars);
});


//POST add userId to database and cookie
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userId = generateRandomString();

  if (!email || !password) {
    return res.sendStatus(400);
  }
  if (userEmailCheck(users, email)) {
    return res.sendStatus(400);
  }
  users[userId] = {
    id: userId,
    email: email,
    password: password
  };
  res.cookie('user_id', users[userId].id);
  res.redirect('/urls');
});


//GET login
app.get('/login', (req, res) => {
  const templateVars = {
    users: users,
    user_id: req.cookies.user_id
  };
  res.render('urls_login', templateVars);
});

//POST login
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userId = matchingUserId(users, email);
  if (!userEmailCheck(users, email) || !userPasswordCheck(users, password)) {
    return res.sendStatus(403);
  }
  res.cookie('user_id', userId);
  res.redirect('/urls');
});

//POST logout
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get('/hello', (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get('/', (req, res) => {
  res.send('Hello');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});