# Ella's World: Magical Rainforest Pet Café

A game for Ella (age 8). She runs a magical café in the rainforest, makes food and drinks for her family and the jungle animals, and looks after her dog and the axolotls. It runs in any browser on a tablet, phone or computer. There's no install, no build step, and no way to lose.

## Who's in it
- **Ella**: blonde ponytail, light skin, freckles, a flower clip and a café apron. She works behind the counter.
- **Arlo** (or **Carlo**): Ella's black Great Dane with a white patch on his chest. He lies in front of the counter.
- **The axolotls**: Bubbles (pink) and Mochi (lilac) live in the café pond. Goldie (gold) and Splash (blue) can join later from the shop.
- **Sarah**: Ella's big sister, with long brown hair. She's the first customer every day.
- **Rainforest visitors**: Tico the Toucan, Sunny the Sloth, Pip the Frog and Coco the Capybara.

## How to play
1. A customer walks in and says what they want in a speech bubble. Tap them.
2. In the kitchen, follow the recipe card and tap the right ingredients. A wrong one just gets a friendly "check the recipe card!"
3. Tap the big button to blend, flip, stir, bake, mix or shake. Then serve it and earn 🪙 coins.
4. Tap the dog for treats, water, ball and pets. Tap the pond to feed the axolotls worms, and scrub away the green muck spots. Looking after the animals earns ❤️ hearts.
5. Spend coins and hearts in the 🛍️ **Shop**: fairy lights, flower baskets, lanterns, a waterfall rainbow, a comfy dog bed, butterflies and new axolotls.
6. After every customer is served, the day ends and a new recipe unlocks: Mango Smoothie and Banana Pancakes on day 1, then Hot Cocoa, Rainbow Cupcake, Jungle Fruit Bowl and Axolotl Bubble Tea.

Words are read out loud with the device's built-in voice, so Ella doesn't have to read everything herself. This can be turned off in ⚙️ Settings, along with sound effects and music. Progress saves automatically in the browser.

## Still to decide (Ella decides some of these in the game)
| Question | Where it's handled |
|---|---|
| The café's name | Ella types one or picks an idea on the first screen. She can change it any time in ⚙️. Ideas are listed in `js/config.js`. |
| Arlo or Carlo? | Ella picks on the first screen, or types any name. The default is in `js/config.js`. |
| Do the animals talk? | Ella chooses on the first screen: talking bubbles or animal sounds only ("Woof!", "Squawk!"). Changeable in ⚙️. |
| Sarah's favourite order | `sarahFavourite` in `js/config.js`. Until it's set, she orders something different each time. |

To add more family members, copy Sarah's entry in `FAMILY` at the top of `js/game.js` and give them their own hair colour, outfit and lines.

## Play
Open `ellas-world/index.html` in a browser, or run a local server from the repo root:
```
python3 -m http.server 8000   # then go to http://localhost:8000/ellas-world/
```
If the repo is deployed on Vercel, the game is at `/ellas-world/` on the same link.

## Files
- `index.html`, `style.css`: the page, HUD, kitchen, shop, settings and title screen
- `js/config.js`: the undecided things (names, talking animals, Sarah's favourite)
- `js/art.js`: all the characters and café art, drawn in code
- `js/game.js`: recipes, customers, animal care, shop, days and saving
- `js/sound.js`: generated sound effects and marimba music
