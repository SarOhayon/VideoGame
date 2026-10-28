# DRIP DROP: Brandeis Block

> This repo also has **[Ella's World](ellas-world/)**, a magical rainforest pet café game for Ella. It lives at `/ellas-world/`.

A top-down action-adventure game set in Côte Saint-Luc, QC. It runs in any browser on a computer or phone. There's no install and no build step.

## Story
The Cavendish Mall Bums, a crew of teen mall rats, stole **Arieh**'s gold Rolex. His best friend **Emma Fisher** sends him Snaps with intel; they pop up on screen and disappear after 10 seconds. Arieh leaves **5911 Brandeis** in his dad's **black Cybertruck** and works his way across the neighbourhood:

1. **5911 Brandeis**: get in the Cybertruck
2. **Cavendish Mall**: beat 4 Mall Bums in the parking lot
3. **Skatepark in the parc**: catch Speedy (skate to keep up)
4. **Westminster**: clear the Mall Bums' hideout behind the dépanneur
5. **CP rail yard**: boss fight with **King Kav**, the Mall Bums' boss, on his e-scooter. Make him crash into a boxcar, then hit him.
6. Grab the Rolex and go back to 5911 for Emma's party, where Noa is waiting with everyone. After that, free roam.

## Features
- **Drip Shop** at 5911 (press E at the front door). Spend silver on a cross-patch hoodie, Habs jersey, Rabbi Suit with a black fedora, a tallit, leather pants, dagger rings, a horseshoe trucker hat, a beanie, shades, and chrome Cybertruck rims. Arieh starts with his silver cross chain. Every item shows on Arieh and gives a stat boost.
- **Snap streak** 🔥: goes up with every mission and boosts punch damage.
- **Montreal stuff**: poutine (+50 HP) at the poutinerie, bagels (+25 HP), a slippery outdoor rink, a Habs jersey, French street signs, and first snow.
- **Snap Map** minimap, plus a yellow arrow pointing to your next objective.
- Easy mode: you heal automatically when you're out of a fight.
- Progress saves automatically in your browser.

## Controls
| | Keyboard | Phone |
|---|---|---|
| Move / drive | WASD or arrows | Joystick |
| Punch (on foot) / honk (in truck) | Space | 👊 / 📢 |
| Get in or out of the truck, shop | E | E |
| Skateboard | Shift | 🛹 |
| Music / pause | M / Esc | II |

## Play locally
Open `index.html` in a browser, or run a local server:
```
python3 -m http.server 8000   # then go to http://localhost:8000
```

## Host on Vercel (free)
1. Go to <https://vercel.com/new> and sign in with GitHub.
2. Import this repo (`VideoGame`) and pick the branch you want to deploy.
3. Leave **Framework Preset** on **Other**. There's no build command and no output directory to set.
4. Click **Deploy**. You get a link like `videogame-xxxx.vercel.app` that works on any phone or computer.

Every push to the branch redeploys the game automatically.

## Files
- `index.html`, `css/style.css`: the page, HUD, and menus
- `js/world.js`: the map (Brandeis, Cavendish, Westminster, Kildare, Guelph, the parc, the rail yard)
- `js/sprites.js`: all the art, drawn in code (Arieh, Emma, Noa, the Mall Bums, King Kav, the Cybertruck)
- `js/entities.js`: enemy AI
- `js/game.js`: story, driving, combat, shop, and saving
- `js/ui.js`, `js/input.js`, `js/audio.js`: HUD and Snaps, controls, and generated sound and music
