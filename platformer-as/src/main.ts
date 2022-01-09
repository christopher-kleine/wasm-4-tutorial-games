import * as w4 from "./wasm4";
import * as Platformer from "./platformer";

/** Collision alls. */
let walls: Platformer.Wall[];

/** Playable character. */
let player: Platformer.Player;

/**
 * @event start
 */
export function start(): void {
  // Set walls for collision...
  walls = [
    // Boundaries
    new Platformer.Wall(0,    0, 160,   8),
    new Platformer.Wall(0,  152, 160,   8),
    new Platformer.Wall(0,    8,   8, 148),
    new Platformer.Wall(152,  8,   8, 148),

    // Walls
    new Platformer.Wall(48, 48,  24,  32),
    new Platformer.Wall(104, 56,  32,   8),
    new Platformer.Wall(32, 80,  56,  48),
    new Platformer.Wall(120, 104,  32,  8)
  ];

  // Instance player and set collision walls for it...
  player = new Platformer.Player(80, 144);
  player.walls = walls;
}

/**
 * @event update
 */
export function update(): void {
    store<u16>(w4.DRAW_COLORS, 2);

    // Update/draw player...
    player.update();
    player.draw();

    // Update/draw walls...
    for(let i = 0; i < walls.length; i += 1) {
      let wall: Platformer.Wall = walls[i];
      wall.update();
      wall.draw();
    }
}
