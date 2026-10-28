'use strict';
// Things about Ella's World that are still being decided live here, so they're easy to change.
// Ella can also change the café name, the dog's name and whether animals talk in the game's ⚙️ menu.
const CONFIG = {
  playerName: 'Ella',

  // The café's name isn't decided yet. Ella types one (or taps an idea) the first time she plays.
  cafeNameIdeas: ["Ella's Rainforest Café", 'The Axolotl Treehouse', 'The Leafy Cup'],

  // Ella's black Great Dane. Is it "Arlo" or "Carlo"? Ella picks on the first screen.
  dogName: 'Arlo',
  dogNameIdeas: ['Arlo', 'Carlo'],

  // Do the animals talk? null = Ella chooses on the first screen.
  // true = speech bubbles with words, false = animal sounds only ("Woof!", "Squawk!").
  animalsTalk: null,

  // Sarah's favourite order, once it's decided: a recipe id from RECIPES in game.js
  // ('mango', 'pancakes', 'cocoa', 'cupcake', 'fruit' or 'bubble').
  // null = she orders something different each visit.
  sarahFavourite: null,

  customersPerDay: (day) => Math.min(4 + day, 8),
};
