import * as w4 from "./wasm4";

// spr_player
const SPR_PLAYER_WIDTH:  u32 = 8;
const SPR_PLAYER_HEIGHT: u32 = 8;
const SPR_PLAYER_FLAGS:  u32 = w4.BLIT_1BPP;
const SPR_PLAYER = memory.data<u8>([
  0b11111111,
  0b10100101,
  0b10100101,
  0b10000001,
  0b10100101,
  0b10111101,
  0b10000001,
  0b11111111,
]);

// spr_wall
const SPR_WALL_WIDTH:  u32 = 8;
const SPR_WALL_HEIGHT: u32 = 8;
const SPR_WALL_FLAGS:  u32 = w4.BLIT_1BPP;
const SPR_WALL = memory.data<u8>([
  0b11101111,
  0b11101111,
  0b11101111,
  0b11101111,
  0b00000000,
  0b11111101,
  0b11111101,
  0b11111101,
]);

/**
 * @class Hitbox
 *
 * @description
 * Bounding box used for collision detection.
 */
export class Hitbox {
  /** Left position. */
  left: i32;

  /** Top position. */
  top: i32;

  /** Right position. */
  right: i32;

  /** Bottom position. */
  bottom: i32;

  /**
   * @constructor
   *
   * @param {i32} left Left position.
   * @param {i32} top Top position.
   * @param {i32} right Right position.
   * @param {i32} bottom Bottom position.
   */
  constructor(left: i32, top: i32, right: i32, bottom: i32) {
    this.left   = left;
    this.top    = top;
    this.right  = right;
    this.bottom = bottom;
  }
}

/**
 * @class Sprite
 *
 * @description
 * Generic Sprite class.
 */
export class Sprite {
  /** X position. */
  x: i32;

  /** Y position. */
  y: i32;

  /** Sprite width. */
  width: i32;

  /** Sprite height. */
  height: i32;

  /** Collision box. */
  hitbox: Hitbox;

  /**
   * @constructor
   *
   * @param {i32} x X position.
   * @param {i32} y Y position.
   * @param {i32} width Sprite width.
   * @param {i32} height Sprite height.
   */
  constructor(x: i32, y: i32, width: i32, height: i32) {
    this.x = x;
    this.y = y;
    this.width  = width;
    this.height = height;
    this.hitbox = new Hitbox(0, 0, width, height);
  }

  /**
   * Check collision between two sprites.
   *
   * @param {Sprite} sprite Sprite to check against.
   *
   * @return {boolean}
   */
  intersect(sprite: Sprite): boolean {
    return (
      this.x + this.hitbox.left   < sprite.x + sprite.hitbox.right  &&
      this.x + this.hitbox.right  > sprite.x + sprite.hitbox.left   &&
      this.y + this.hitbox.top    < sprite.y + sprite.hitbox.bottom &&
      this.y + this.hitbox.bottom > sprite.y + sprite.hitbox.top
    );
  }

  /**
   * @event update
   */
  update(): void {
    // [...]
  }

  /**
   * @event draw
   */
  draw(): void {
    // [...]
  }
}

/**
 * @class Wall
 * @extends Sprite
 *
 * @description
 * Collision wall that prevents player position.
 */
export class Wall extends Sprite {
  /** Tile rows to draw. */
  rows: i32;

  /** Tile columns to draw. */
  columns: i32;

  /**
   * @constructor
   *
   * @param {i32} x X position.
   * @param {i32} y Y position.
   * @param {i32} width Sprite width.
   * @param {i32} height Sprite height.
   */
  constructor(x: i32, y: i32, width: i32, height: i32) {
    super(
      x,
      y,
      Math.floor(width  / 8) as i32 * 8,
      Math.floor(height / 8) as i32 * 8
    );

    // Calculate rows and columns...
    this.rows    = Math.floor(height / 8) as i32;
    this.columns = Math.floor(width  / 8) as i32;
  }

  /**
   * @event draw
   */
  draw(): void {
    store<u16>(w4.DRAW_COLORS, 0x41);

    // Draw a wall of bricks...
    for(let row = 0; row < this.rows; row += 1) {
      for(let column = 0; column < this.columns; column += 1) {

        w4.blit(
          SPR_WALL,
          this.x + (column * 8),
          this.y + (row * 8),
          SPR_WALL_WIDTH,
          SPR_WALL_HEIGHT,
          SPR_WALL_FLAGS
        );

      }
    }
  }
}

/**
 * @class Player
 * @extends Sprite
 *
 * @description
 * Default player class with basic 8-direction controls.
 */
export class Player extends Sprite {
  /** Player speed. */
  speed: i32 = 1;

  /** Collision walls. */
  walls: Wall[] = new Array<Wall>();

  /** Previous X position. */
  xprev: i32 = 0;

  /** Previous Y position. */
  yprev: i32 = 0;

  /**
   * @constructor
   *
   * @param {i32} x X position.
   * @param {i32} y Y position.
   */
  constructor(x: i32, y: i32) {
    super(x, y, 8, 8);
  }

  /**
   * @event update
   */
  update(): void {
    // Poll gamepad controls...
    const gamepad = load<u8>(w4.GAMEPAD1);

    // Player movement...
    if (gamepad & w4.BUTTON_UP   ) { this.y -= this.speed; }
    if (gamepad & w4.BUTTON_DOWN ) { this.y += this.speed; }
    if (gamepad & w4.BUTTON_LEFT ) { this.x -= this.speed; }
    if (gamepad & w4.BUTTON_RIGHT) { this.x += this.speed; }

    // Check for collisions...
    for(let i = 0; i < this.walls.length; i += 1) {
      let wall = this.walls[i];

      // Warp back to previous position if collide with a wall:
      if(this.intersect(wall)) {
        this.x = this.xprev;
        this.y = this.yprev;

        break;
      }
    }

    // Store previous position for the next frame...
    this.xprev = this.x;
    this.yprev = this.y;
  }

  /**
   * @event draw
   */
  draw(): void {
    store<u16>(w4.DRAW_COLORS, 0x40);
    w4.blit(
      SPR_PLAYER,
      this.x,
      this.y,
      SPR_PLAYER_WIDTH,
      SPR_PLAYER_HEIGHT,
      SPR_PLAYER_FLAGS
    );
  }
}
