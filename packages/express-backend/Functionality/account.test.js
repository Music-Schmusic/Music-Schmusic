import src from "./account.js";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

afterEach(async () => {
  // Drop collections instead of entire database (fixes "not allowed to drop database" error)
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

test("Hash password", () => {
  const target = src.hashPassword("examplePassword");
  const result =
    "c668bfca4f595524053592d642cf97373d4fc778372bbd2364fbbe1b4b9eaafd";
  expect(target).toBe(result);
});

test("Create account", () => {
  const body = {
    spotifyId: "spotify",
    spotifySecret: "spotifypassword",
    username: "testuser",
    email: "user@example.com",
    password: "examplePassword",
  };

  const target = src.createAccount(body);

  expect(target).toBeDefined();
  expect(target.username).toBe(body.username);
  expect(target.email).toBe(body.email);
  expect(target.password).toBe(
    "c668bfca4f595524053592d642cf97373d4fc778372bbd2364fbbe1b4b9eaafd"
  );
});
