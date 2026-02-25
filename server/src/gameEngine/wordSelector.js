const words = [
  "apple",
  "banana",
  "orange",
  "grape",
  "mango",
  "cherry",
  "peach",
  "lemon"
];

const getRandomWord = () => {
  const index = Math.floor(Math.random() * words.length);
  return words[index];
};

module.exports = { getRandomWord };