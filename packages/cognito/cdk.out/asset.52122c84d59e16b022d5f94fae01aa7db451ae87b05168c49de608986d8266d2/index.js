"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/lambda/user.ts
var user_exports = {};
__export(user_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(user_exports);
var GH_API_URL = "https://api.github.com/user";
var handler = async (event) => {
  const authHeaders = event.headers.Authorization;
  if (!authHeaders) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "Unauthorized" })
    };
  }
  try {
    const response = await fetch(GH_API_URL, {
      method: "GET",
      headers: {
        authorization: `token ${authHeaders.split("Bearer ")[1]}`,
        accept: "application/json"
      }
    });
    const token = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify({
        sub: token.id,
        ...token
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error })
    };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
