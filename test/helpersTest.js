const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
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

describe('getUserByEmail', () => {
  it('should return a user with valid email', function() {
    const user = getUserByEmail(testUsers, "user@example.com");
    const expectedUserID = "userRandomID";
    assert.equal(user, expectedUserID);
  });

  it('should return a user with valid email', function() {
    const user = getUserByEmail(testUsers, "user2@example.com");
    const expectedUserID = "user2RandomID";
    assert.equal(user, expectedUserID);
  });

  it('should return undefined', () => {
    const user = getUserByEmail(testUsers, "example@example.com");
    const expectedUserID = undefined;
    assert.equal(user, expectedUserID);
  });
});