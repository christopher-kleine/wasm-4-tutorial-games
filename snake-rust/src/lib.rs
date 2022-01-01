#[cfg(feature = "buddy-alloc")]
mod alloc;
mod wasm4;
use wasm4::*;

// ========================================================================= //
// Sprites
// ========================================================================= //

const FRUIT_SPRITE_FLAGS: u32 = 1;
const FRUIT_SPRITE: [u8; 16] = [
    0x00, 0xa0, 0x02, 0x00,
    0x0e, 0xf0, 0x36, 0x5c,
    0xd6, 0x57, 0xd5, 0x57,
    0x35, 0x5c, 0x0f, 0xf0,
];

// ========================================================================= //
// Random
// ========================================================================= //

/// Random seed for pseudo-number generator.
static mut RAND_SEED: u64 = 0xFF;

/// Generate a random number using Xorshift algorithm.
fn rand() -> u64 {
    unsafe {
        RAND_SEED ^= RAND_SEED << 13;
        RAND_SEED ^= RAND_SEED >> 17;
        RAND_SEED ^= RAND_SEED << 5;

        return RAND_SEED;
    }
}

fn range(n: u64) -> i32 {
    return (rand() % n) as i32;
}

// ========================================================================= //
// Palette
// ========================================================================= //

/// Set the drawing color for display.
///
/// # Arguments
///
/// * `idx` - Color index.
fn set_draw_color(idx: u16) {
    unsafe {
        *DRAW_COLORS = idx;
    }
}

/// Set the color palette. You can only have up to 4 colors.
///
/// # Arguments
///
/// * `palette` - Color palette.
fn set_palette(palette: [u32; 4]) {
    unsafe {
        *PALETTE = palette;
    }
}

// ========================================================================= //
// Snake
// ========================================================================= //

/// # Position
///
/// This represents a coordinate.
///
/// TODO Explain why these are required.
#[derive(Clone, Copy, PartialEq, Eq)]
struct Position {
    /// X position.
    x: i32,
    /// Y position.
    y: i32,
}

/// # Snake
///
/// The main character for our game. It has a body and a sense of direction.
struct Snake {
    body: Vec<Position>,
    direction: Position,
}

impl Snake {
    pub fn new() -> Self {
        return Snake {
            body: vec![
                Position { x: 2, y: 0 },
                Position { x: 1, y: 0 },
                Position { x: 0, y: 0 },
            ],
            direction: Position { x: 1, y: 0 },
        };
    }

    /// Draw the snake.
    pub fn draw(&mut self) {
        // Set a color for snake.
        set_draw_color(0x43);

        // Draw the snake body...
        for position in &self.body {
            rect(position.x * 8, position.y * 8, 8, 8);
        }

        // ...and the head. Note how we're setting the color again. We need to
        // do this everytime we want to draw something with a different color
        // order:
        set_draw_color(0x4);
        rect(self.body[0].x * 8, self.body[0].y * 8, 8, 8);
    }

    /// Update method for snake.
    ///
    /// TODO Comment this part and provide explanation for why position is returned.
    pub fn update(&mut self) -> Option<Position> {
        self.body.insert(
            0,
            Position {
                x: (self.body[0].x + self.direction.x) % 20,
                y: (self.body[0].y + self.direction.y) % 20,
            },
        );

        if self.body[0].x < 0 {
            self.body[0].x = 19;
        }

        if self.body[0].y < 0 {
            self.body[0].y = 19;
        }

        return self.body.pop();
    }

    /// Move snake to the left.
    pub fn left(&mut self) {
        if self.direction.x == 0 {
            self.direction = Position { x: -1, y: 0 };
        }
    }

    /// Move snake to the right.
    pub fn right(&mut self) {
        if self.direction.x == 0 {
            self.direction = Position { x: 1, y: 0 };
        }
    }

    /// Move snake up.
    pub fn up(&mut self) {
        if self.direction.y == 0 {
            self.direction = Position { x: 0, y: -1 };
        }
    }

    /// Move snake down.
    pub fn down(&mut self) {
        if self.direction.y == 0 {
            self.direction = Position { x: 0, y: 1 };
        }
    }

    /// Returns if snake is dead.
    ///
    /// TODO Fix this.
    pub fn is_dead(&self) -> bool {
        for (index, position) in self.body.iter().enumerate() {
            // First element is the head. We can skip it.
            if index == 0 {
                continue;
            }
            // If any other part has the same position as the body, then the
            // snake is biting it's own tail, so it's dead:
            else if position == &self.body[0] {
                return true;
            }
        }

        return false;
    }
}

// ========================================================================= //
// Game
// ========================================================================= //

/// # Game
///
/// Self-contained game logic.
pub struct Game {
    /// Frame counter.
    frame_count: u32,
    /// Main snake.
    snake: Snake,
    /// Gamepad input from last frame.
    prev_gamepad: u8,
    /// Fruit position.
    fruit: Position,
}

impl Game {
    pub fn new() -> Self {
        Self {
            frame_count: 0,
            snake: Snake::new(),
            prev_gamepad: 0,
            fruit: Position {
                x: range(20),
                y: range(20),
            }
        }
    }

    /// Check for player input.
    pub fn input(&mut self) {
        unsafe {
            // Check for gamepad. We'll also compare the input we saved on the
            // previous frame. This is so we can only check one press at a
            // time.
            let gamepad = *GAMEPAD1;
            let just_pressed = gamepad & (gamepad ^ self.prev_gamepad);

            // Move the snake...
            if just_pressed & wasm4::BUTTON_LEFT != 0 {
                self.snake.left();
            }
            if just_pressed & wasm4::BUTTON_RIGHT != 0 {
                self.snake.right();
            }
            if just_pressed & wasm4::BUTTON_UP != 0 {
                self.snake.up();
            }
            if just_pressed & wasm4::BUTTON_DOWN != 0 {
                self.snake.down();
            }

        // Save current gamepad input.
        self.prev_gamepad = gamepad;
        }
    }

    /// Update event.
    pub fn update(&mut self) {
        // Increase frame counter. This will be useful for slowing down the
        // game (the snake moves too fast).
        self.frame_count += 1;

        // Handle player input.
        self.input();

        if self.frame_count % 15 == 0 {
            let dropped_pos = self.snake.update();

            if self.snake.is_dead() {
                self.snake = Snake::new();
                self.fruit = Position {
                    x: range(20),
                    y: range(20),
                };
            }

            if self.snake.body[0] == self.fruit {
                if let Some(last_pos) = dropped_pos {
                    self.snake.body.push(last_pos);
                }

                self.fruit.x = range(20);
                self.fruit.y = range(20);
            }
        }

        self.snake.draw();
        set_draw_color(0x4320);

        blit(
            &FRUIT_SPRITE,
            self.fruit.x * 8,
            self.fruit.y * 8,
            8,
            8,
            FRUIT_SPRITE_FLAGS,
        );
    }
}

// ========================================================================= //
// Main
// ========================================================================= //

// Main game instance.
static mut GAME: Game = Game {
    frame_count: 0,
    snake: Snake {
        body: vec![],
        direction: Position { x: 1, y: 0 },
    },
    prev_gamepad: 0,
    fruit: Position {
        x: 0,
        y: 0,
    }
};

#[no_mangle]
fn start() {
    unsafe {
        set_palette([0xfff6d3, 0xf9a875, 0xeb6b6f, 0x7c3f58]);
        GAME = Game::new();
    }
}

#[no_mangle]
fn update() {
    unsafe {
        GAME.update();
    }
}
