import * as w4 from "./wasm4";
import * as Maze from "./maze";

/** Collision alls. */
let walls: Maze.Wall[];

/** Playable character. */
let player: Maze.Player;

/**
 * @event start
 */
export function start(): void {
  // Set walls for collision...
  walls = [
    // Boundaries
    new Maze.Wall(0,    0, 160,   8),
    new Maze.Wall(0,  152, 160,   8),
    new Maze.Wall(0,    8,   8, 148),
    new Maze.Wall(152,  8,   8, 148),

    // Corridors
    new Maze.Wall(26,  29,  16,  60),
    new Maze.Wall(62,  41,  72,   8),
    new Maze.Wall(90,  72,  16,  64),
    new Maze.Wall(34, 103,  40,  32)
  ];

  // Instance player and set collision walls for it...
  player = new Maze.Player(80, 80);
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
      let wall: Maze.Wall = walls[i];
      wall.update();
      wall.draw();
    }
}
