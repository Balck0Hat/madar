import { describe, it, expect } from "vitest";
import * as auth from "../auth.service.js";
import User from "../../users/user.model.js";

const creds = { name: "سارة", email: "Sara@Example.com", password: "pass1234" };

describe("auth.service register", () => {
  it("should create a user with a hashed password and return tokens", async () => {
    const { user, tokens } = await auth.register(creds);
    expect(user.email).toBe("sara@example.com");
    expect(user.password).toBeUndefined();
    expect(tokens.access).toBeTruthy();
    expect(tokens.refresh).toBeTruthy();
    const stored = await User.findOne({ email: "sara@example.com" }).select("+password +refreshTokens");
    expect(stored.password).not.toBe(creds.password);
    expect(stored.refreshTokens).toHaveLength(1);
    expect(stored.refreshTokens[0].hash).not.toBe(tokens.refresh);
  });

  it("should reject a duplicate email with 409", async () => {
    await auth.register(creds);
    await expect(auth.register(creds)).rejects.toMatchObject({ statusCode: 409, code: "EMAIL_TAKEN" });
  });
});

describe("auth.service login", () => {
  it("should log in with correct credentials", async () => {
    await auth.register(creds);
    const { user } = await auth.login({ email: "sara@example.com", password: "pass1234" });
    expect(user.name).toBe("سارة");
  });

  it("should return 401 for a wrong password and count the failure", async () => {
    await auth.register(creds);
    await expect(auth.login({ email: "sara@example.com", password: "wrong123" })).rejects.toMatchObject({ statusCode: 401 });
    const stored = await User.findOne({ email: "sara@example.com" }).select("+failedLogins");
    expect(stored.failedLogins).toBe(1);
  });

  it("should return 401 for an unknown email", async () => {
    await expect(auth.login({ email: "nobody@example.com", password: "pass1234" })).rejects.toMatchObject({ statusCode: 401 });
  });
});

describe("auth.service refresh rotation", () => {
  it("should rotate the refresh token and invalidate the old one", async () => {
    const { tokens } = await auth.register(creds);
    const rotated = await auth.refresh(tokens.refresh);
    expect(rotated.tokens.refresh).not.toBe(tokens.refresh);
    await expect(auth.refresh(tokens.refresh)).rejects.toMatchObject({ statusCode: 401, code: "REFRESH_REUSED" });
  });

  it("should revoke every session when a used token is replayed", async () => {
    const { tokens } = await auth.register(creds);
    const rotated = await auth.refresh(tokens.refresh);
    await auth.refresh(tokens.refresh).catch(() => {});
    await expect(auth.refresh(rotated.tokens.refresh)).rejects.toMatchObject({ statusCode: 401 });
  });

  it("should reject a missing or garbage token", async () => {
    await expect(auth.refresh(undefined)).rejects.toMatchObject({ code: "NO_REFRESH" });
    await expect(auth.refresh("not.a.jwt")).rejects.toMatchObject({ code: "INVALID_REFRESH" });
  });
});

describe("auth.service logout", () => {
  it("should remove the refresh token from the user", async () => {
    const { tokens } = await auth.register(creds);
    await auth.logout(tokens.refresh);
    await expect(auth.refresh(tokens.refresh)).rejects.toMatchObject({ statusCode: 401 });
  });

  it("should not throw for an invalid token", async () => {
    await expect(auth.logout("garbage")).resolves.toBeUndefined();
  });
});
