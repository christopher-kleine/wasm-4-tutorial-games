use crate::palette::set_draw_color;
use crate::snake::{Point, Snake};
use crate::wasm4;
use rand::prelude::*;
use rand_pcg::Pcg64;

pub struct Game {
    rng: Pcg64,
    frame_count: u32,
    snake: Snake,
    prev_gamepad: u8,
    fruit: Point,
}

static FRUIT_SPRITE: [u8; 16] = [
    0x00, 0xa0, 0x02, 0x00, 0x0e, 0xf0, 0x36, 0x5c, 0xd6, 0x57, 0xd5, 0x57, 0x35, 0x5c, 0x0f, 0xf0,
];

impl Game {
    pub fn new() -> Self {
        let mut rng = Pcg64::seed_from_u64(345);
        Self {
            frame_count: 0,
            snake: Snake::new(),
            prev_gamepad: 0,
            fruit: Point {
                x: rng.gen_range(0..20),
                y: rng.gen_range(0..20),
            },
            rng,
        }
    }

    pub fn process_input(&mut self) {
        let gamepad = unsafe { *wasm4::GAMEPAD1 };
        let just_pressed = gamepad & (gamepad ^ self.prev_gamepad);

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

        self.prev_gamepad = gamepad;
    }

    pub fn update(&mut self) {
        self.frame_count = self.frame_count.overflowing_add(1).0;

        self.process_input();

        if self.frame_count % 15 == 0 {
            let dropped_pos = self.snake.update();

            if self.snake.is_dead() {
                self.snake = Snake::new();
                self.fruit = Point {
                    x: self.rng.gen_range(0..20),
                    y: self.rng.gen_range(0..20),
                };
            }

            if self.snake.body[0] == self.fruit {
                if let Some(last_pos) = dropped_pos {
                    self.snake.grow_tail(last_pos);
                }

                self.rng = Pcg64::seed_from_u64(self.frame_count.into());
                self.fruit.x = self.rng.gen_range(0..20);
                self.fruit.y = self.rng.gen_range(0..20);
            }
        }

        self.snake.draw();
        set_draw_color(0x4320u16);

        wasm4::blit(
            &FRUIT_SPRITE,
            self.fruit.x * 8,
            self.fruit.y * 8,
            8,
            8,
            wasm4::BLIT_2BPP,
        );
    }
}
