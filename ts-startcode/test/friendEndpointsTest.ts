import path from "path";
import { expect } from "chai";
import app from "../src/app";

import supertest from "supertest";
const request = supertest(app);

import bcryptjs from "bcryptjs";
import * as mongo from "mongodb";
import { InMemoryDbConnector } from "../src/config/dbConnector";
let friendCollection: mongo.Collection;

describe("### Describe the Friend Endpoints (/api/friends) ###", function () {
  let URL: string;

  before(async function () {
    //Connect to IN-MEMORY test database
    //Get the database and set it on the app-object to make it availabe for the friendRoutes
    //(See bin/www.ts if you are in doubt relateded to the part above)
    //Initialize friendCollection, to operate on the database without the facade
    const client = await InMemoryDbConnector.connect(); //Connect to inmemory test database
    const db = client.db();
    app.set("db", db);
    app.set("db-type", "TEST-DB");
    friendCollection = db.collection("friends");
  });

  beforeEach(async function () {
    const hashedPW = await bcryptjs.hash("secret", 4);
    await friendCollection.deleteMany({});
    //Last friend below is only necessary if you have added authentications
    await friendCollection.insertMany([
      {
        firstName: "Peter",
        lastName: "Pan",
        email: "pp@b.dk",
        password: hashedPW,
        role: "user",
      },
      {
        firstName: "Donald",
        lastName: "Duck",
        email: "dd@b.dk",
        password: hashedPW,
        role: "user",
      },
      {
        firstName: "Ad",
        lastName: "Admin",
        email: "aa@a.dk",
        password: hashedPW,
        role: "admin",
      },
    ]);
  });

  //In this, and all the following REMOVE tests that requires authentication if you are using the simple version of friendRoutes
  describe("While attempting to get all users", function () {
    it("it should get two users when authenticated", async () => {
      const response = await request
        .get("/api/friends/all")
        .auth("pp@b.dk", "secret");
      expect(response.status).to.equal(200);
      expect(response.body.length).to.equal(3);
    });

    it("it should get a 401 when NOT authenticated", async () => {
      const response = await request.get("/api/friends/all");
      expect(response.status).to.equal(401);
    });
  });

  describe("While attempting to add a user", function () {
    it("it should Add the user Jan Olsen", async () => {
      const newFriend = {
        firstName: "Jan",
        lastName: "Olsen",
        email: "jan@b.dk",
        password: "secret",
      };
      const response = await request.post("/api/friends").send(newFriend);
      console.log(response.body);
      expect(response.status).to.equal(200);
      expect(response.body.id).to.be.not.null;
    });

    xit("It should fail to Add user due to wrong password length", async () => {});
  });
});
