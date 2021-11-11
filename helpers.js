
//function get user ID by Email
const getUserByEmail = (userDB, email) => {
  for (const id in userDB) {
    if (userDB[id].email === email) {
      return id;
    }
  }
  return undefined;
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


// function creating Random ID
const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
};



module.exports = { getUserByEmail, urlsForUser, generateRandomString };