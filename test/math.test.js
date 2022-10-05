const { calculateTrip } = require("../src/math");
test("Math test", () => {
  expect(1).toBe(1);
});

test("Calculate Trip", () => {
  expect(calculateTrip(100, 0.2)).toBe(120);
});
