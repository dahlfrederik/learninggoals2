import * as mongo from "mongodb";
import FriendFacade from "../src/facades/friendFacade";

import chai from "chai";
const expect = chai.expect;

//use these two lines for more streamlined tests of promise operations
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);

import bcryptjs, { hash } from "bcryptjs";
import { InMemoryDbConnector } from "../src/config/dbConnector";
import { ApiError } from "../src/errors/apiError";

let friendCollection: mongo.Collection;
let facade: FriendFacade;

describe("## Verify the Friends Facade ##", () => {
  before(async function () {
    const client = await InMemoryDbConnector.connect(); //Connect to inmemory test database
    const db = client.db();
    friendCollection = db.collection("friends"); //Initialize friendCollection, to operate on the database without the facade
    facade = new FriendFacade(db); //Get the database and initialize the facade
  });

  beforeEach(async () => {
    const hashedPW = await bcryptjs.hash("secret", 4);
    await friendCollection.deleteMany({});
    await friendCollection.insertMany([
      {
        firstName: "Donald",
        lastName: "Trump",
        email: "trump@tower.com",
        password: hashedPW,
        role: "user",
      },
      {
        firstName: "Joe",
        lastName: "Biden",
        email: "biden@cnn.com",
        password: hashedPW,
        role: "user",
      },
      {
        firstName: "Peter",
        lastName: "Pan",
        email: "pp@b.com",
        password: hashedPW,
        role: "user",
      },
    ]);
  });

  describe("Verify the addFriend method", () => {
    it("It should Add the user Jan", async () => {
      const newFriend = {
        firstName: "Jan",
        lastName: "Olsen",
        email: "jan@b.dk",
        password: "secret",
      };
      const status = await facade.addFriend(newFriend);
      expect(status).to.be.not.null;
      const jan = await friendCollection.findOne({ email: "jan@b.dk" });
      expect(jan.firstName).to.be.equal("Jan");
    });

    it("It should not add a user with a role (validation fails)", async () => {
      const newFriend = {
        firstName: "Jan",
        lastName: "Olsen",
        email: "jan@b.dk",
        password: "secret",
        role: "admin",
      };
      try {
        await facade.addFriend(newFriend);
        expect(false).to.be.true("Should never get here");
      } catch (err) {
        expect(err instanceof ApiError).to.be.true;
      }
    });
  });

  describe("Verify the editFriend method", () => {
    it("It should change lastName to XXXX", async () => {
      const newLastName = {
        firstName: "Joe",
        lastName: "XXXX",
        email: "biden@cnn.com",
        password: "secret",
      };
      const status = await facade.editFriend("biden@cnn.com", newLastName);
      expect(status.modifiedCount).to.equal(1);
      const editedFriend = await friendCollection.findOne({
        email: "biden@cnn.com",
      });
      expect(editedFriend.lastName).to.be.equal("XXXX");
    });
  });

  describe("Verify the deleteFriend method", () => {
    it("It should remove the user Peter", async () => {
      const status = await facade.deleteFriend("pp@b.com");
      expect(status).to.be.true;
    });
    it("It should return false, for a user that does not exist", async () => {
      const status = await facade.deleteFriend("nouser@notauser.com");
      expect(status).to.be.false;
    });
  });

  describe("Verify the getAllFriends method", () => {
    it("It should get three friends", async () => {
      const friends = await facade.getAllFriends();
      expect(friends.length).equal(3);
    });
  });

  describe("Verify the getFriend method", () => {
    it("It should find Donald Trump", async () => {
      const friend = await facade.getFrind("trump@tower.com");
      if (friend != null) {
        expect(friend.firstName + " " + friend.lastName).to.be.equal(
          "Donald Trump"
        );
      }
    });
    it("It should not find xxx.@.b.dk", async () => {
      try {
        await facade.getFrind("xxx.@.b.dk");
      } catch (err) {
        expect(err instanceof ApiError).to.be.true;
      }
    });
  });

  describe("Verify the getVerifiedUser method", () => {
    it("It should correctly validate Peter Pan's credential,s", async () => {
      const veriefiedPeter = await facade.getVerifiedUser("pp@b.com", "secret");
      expect(veriefiedPeter).to.be.not.null;
    });

    it("It should NOT validate Peter Pan's false credential,s", async () => {
      const veriefiedPeter = await facade.getVerifiedUser("pp@b.com", "XXXXX");
      expect(veriefiedPeter).to.be.null;
    });

    it("It should NOT validate a non-existing users credentials", async () => {
      const notVerifed = await facade.getVerifiedUser(
        "false@false.false",
        "false"
      );
      expect(notVerifed).to.be.null;
    });
  });
});
