const testFunction = require("../../../dist/frontend/scripts/index");

describe("Hello", () => {
    test("testFunction", () => { expect(testFunction()).toBe(true); });
});