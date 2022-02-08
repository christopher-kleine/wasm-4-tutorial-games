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
   * Check collision between two sprites, if the current instance were at a
   * different location.
   *
   * @param {i32} x X position.
   * @param {i32} y Y position.
   * @param {Sprite} sprite Sprite to check against.
   *
   * @return {boolean}
   */
  intersectAt(x: i32, y: i32, sprite: Sprite): boolean {
    // Temporarily store position...
    let xprev: i32 = this.x;
    let yprev: i32 = this.y;

    // Move this sprite to a different location...
    this.x = x;
    this.y = y;

    // Test if it will collide with the other sprite there:
    let result: boolean = this.intersect(sprite);

    // Return to original position...
    this.x = xprev;
    this.y = yprev;

    return result;
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
  /** Player acceleration. */
  acceleration: f32 = 0.0;

  /** Player gravity. */
  gravity: f32 = 0.0;

  /** How fast can the player run. */
  speed: f32 = 1.0;

  /** How high can the player jump. */
  jumpForce: f32 = 6.0;

  /** Falling speed. */
  fallSpeed: f32 = 0.25;

  /** Maximum falling speed. */
  maxFallSpeed: f32 = 4.0;

  /** Indicate if player is standing on top of a wall. */
  onGround: boolean = true;

  /** Collision walls. */
  walls: Wall[] = new Array<Wall>();

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
   * Handle player acceleration, either moving to the left or to the right.
   */
  handleAcceleration(): void {
    // Move the player...
    this.x += i32(this.acceleration);

    // Check for collisions...
    for(let i = 0; i < this.walls.length; i += 1) {
      let wall = this.walls[i];

      // If the player hit a wall, it'll be pushed back to the sides...
      if(this.intersect(wall)) {

        // Push the player to the left side of the wall:
        if(this.acceleration < 0.0) {
          this.x = wall.x + wall.width;
        }

        // Push the player to the right side of the wall:
        else if(this.acceleration > 0.0) {
          this.x = wall.x - this.width;
        }

        // Reset player's acceleration and move on...
        this.acceleration = 0.0;
        break;
      }
    }
  }

  /**
   * Handle player gravity, either jumping or falling.
   */
  handleGravity(): void {
    // Increase gravity...
    this.gravity += this.fallSpeed;

    // Apply speed cap on gravity based on maximum falling speed:
    if(this.gravity > this.maxFallSpeed) {
      this.gravity = this.maxFallSpeed;
    }

    // Move the player...
    this.y += i32(this.gravity);

    // Reset this variable to "false". If the player hit any wall from below,
    // this flag will change it back to "true" again.
    this.onGround = false;

    // Check for collisions...
    for(let i = 0; i < this.walls.length; i += 1) {
      let wall = this.walls[i];

      // If the player hit a wall, it must be either hitting from the ceiling
      // or landing...
      if(this.intersect(wall)) {

        // If it's jumping, it must be hitting the ceiling:
        if(this.gravity < 0.0) {
          this.y = wall.y + wall.height;

        }

        // If it's falling, it must be landing on top of the wall. We'll also
        // mark the standing flag back to "true":
        else if(this.gravity > 0.0) {
          this.y = wall.y - this.height;
          this.onGround = true;
        }

        // Reset player's gravity and move on...
        this.gravity = 0.0;
        break;
      }
    }
  }

  /**
   * Handle input controls for player movement.
   */
  handleInput(): void {
    // Poll gamepad controls...
    const gamepad = load<u8>(w4.GAMEPAD1);

    // Decelerate player:
    this.acceleration = 0;

    // Player movement...
    if (gamepad & w4.BUTTON_LEFT) {
      this.acceleration = -this.speed;
    }
    if (gamepad & w4.BUTTON_RIGHT) {
      this.acceleration = this.speed;
    }
    if ((gamepad & w4.BUTTON_UP) && this.onGround) {
      this.gravity = -this.jumpForce;
    }
  }

  /**
   * @event update
   */
  update(): void {
    this.handleInput();
    this.handleAcceleration();
    this.handleGravity();
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
