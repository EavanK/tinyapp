const express = require('express');
const app = express();
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { getUserByEmail, urlsForUser, generateRandomString } = require('./helpers');
const methodOverride = require('method-override');
const PORT = 8080;

app.use(express.urlencoded({ extended: false }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
app.use(methodOverride('_method'));
app.set("view engine", "ejs");

//ulrDB
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aaaaaa"
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
  },
  "aaaaaa": {
    id: 'aaaaaa',
    email: 'a@a',
    password: bcrypt.hashSync('123', 10)
  }
};


// /login , logout
//GET login
app.get('/login', (req, res) => {
  const user_id = req.session.user_id;

  if (users[user_id]) {
    return res.redirect('/urls');
  }
  res.render('urls_login', { users, user_id });
});

//POST login
app.post('/login', (req, res) => {
  const email = req.body.email;
  const userId = getUserByEmail(users, email);
  const user = users[userId];

  if (!userId || !bcrypt.compareSync(req.body.password, user.password)) {
    return res.status(403).send(`Please check your email or password <a href='/login'>try again</a>`);
  }

  req.session.user_id = userId;
  res.redirect('/urls');
});

//POST logout
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});





// /register
//GET register
app.get('/register', (req, res) => {
  const user_id = req.session.user_id;

  if (users[user_id]) {
    return res.redirect('/urls');
  }

  res.render('urls_register', { users, user_id });
});

//POST add userId to database and cookie
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
  const id = generateRandomString();

  if (!email || !req.body.password) {
    return res.status(400).send(`Missing email or password, Please <a href='/register'>try again</a>`);
  }
  if (getUserByEmail(users, email)) {
    return res.status(400).send(`User exists! Please <a href='/register'>try again</a>`);
  }

  const user = { id, email, password };
  users[id] = user;
 
  req.session.user_id = id;
  res.redirect('/urls');
});





//  /urls
//GET urls homepage
app.get('/urls', (req, res) => {
  const user_id = req.session.user_id;
  const urls = urlsForUser(urlDatabase, user_id);
  const templateVars = { users, user_id, urls };

  if (!user_id) {
    return res.status(401).send(`You must <a href='/login'>login</a> first`);
  }

  res.render('urls_index', templateVars);
});

//POST add new short and long urls
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const userID = req.session.user_id;

  if (!userID) {
    return res.status(401)
      .send(`You are unauthorized, You must <a href='/login'>login</a> first`);
  }

  if (longURL.includes('https://')) {
    urlDatabase[shortURL] = { longURL, userID };
  } else {
    urlDatabase[shortURL] = { longURL: `https://${longURL}`, userID };
  }

  res.redirect(`/urls/${shortURL}`);
});





// /urls/new
//GET Creat New URL
app.get('/urls/new', (req, res) => {
  const user_id = req.session.user_id;

  if (!user_id) {
    return res.redirect('/login');
  }
  res.render('urls_new', { users, user_id });
});





// /urls/:id
//PUT edit long url
app.put(`/urls/:id`, (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  const userID = req.session.user_id;
  const user = users[userID];
  
  if (!user) {
    return res.status(401).send(`You must <a href='/login'>login</a> first`);
  }
  
  if (urlDatabase[shortURL].userID !== user.id) {
    return res.status(401).send(`You are unauthorized, Please <a href='/urls'>go back</a>`);
  }
  
  if (!longURL.includes('https://')) {
    urlDatabase[shortURL] = { longURL: `https://${longURL}`, userID };
  } else {
    urlDatabase[shortURL] = { longURL, userID };
  }
  
  res.redirect('/urls');
});






// /urls/:shortURL
//GET short URL web page
app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const user_id = req.session.user_id;
  const user = users[user_id];
  
  if (!user) {
    return res.status(401).send(`You must <a href='/login'>login</a> first`);
  }
  
  if (!urlDatabase[shortURL]) {
    return res.status(404).send(`It doesn't exist <a href='/urls'>go back</a>`);
  }
  if (urlDatabase[shortURL].userID !== user.id) {
    return res.status(401).send(`You are unauthorized, Please <a href='/urls'>go back</a>`);
  }
  const longURL = urlDatabase[shortURL].longURL;
  const templateVars = { shortURL, longURL, user_id, users };
  
  res.render('urls_show', templateVars);
});

//DELETE delete url
app.delete(`/urls/:shortURL/delete`, (req, res) => {
  const shortURL = req.params.shortURL;
  const user_id = req.session.user_id;
  const user = users[user_id];
  
  if (!user) {
    return res.status(401).send(`You must <a href='/login'>login</a> first`);
  }
  
  if (urlDatabase[shortURL].userID !== user.id) {
    return res.status(401).send(`You are unauthorized, Please <a href='/urls'>go back</a>`);
  }

  delete urlDatabase[shortURL];
  res.redirect('/urls');
});





// /u/:shortURL
//GET leading to long URL
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    return res.status(404).send(`We can't find the shortURL`);
  }
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});




//GET if user logged in redirect /urls or not redirect /login
app.get('/', (req, res) => {
  const id = req.session.user_id;
  if (!id) {
    return res.redirect('/login');
  }
  res.redirect('/urls');
});



app.get('/hello', (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});