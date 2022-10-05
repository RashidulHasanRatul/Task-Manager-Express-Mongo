const calculateTrip = (total, tipPercent) => {
  const tip = total * tipPercent;
  return total + tip;
};

module.exports = {
  calculateTrip,
};
