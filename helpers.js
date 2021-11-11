
//function matching if email exists on userDB
const getUserByEmail = (userDB, email) => {
  for (const id in userDB) {
    if (userDB[id].email === email) {
      return id;
    }
  }
  return undefined;
};



module.exports = { getUserByEmail };