#![no_std]

mod game;
mod palette;
mod snake;
mod wasm4;
use game::Game;

static mut SNAKE_GAME: Option<Game> = None;

#[no_mangle]
fn start() {
    palette::set_palette([0xfff6d3, 0xf9a875, 0xeb6b6f, 0x7c3f58]);
    let snake = unsafe { &mut SNAKE_GAME };
    *snake = Some(Game::new());
}

#[no_mangle]
fn update() {
    let snake = unsafe { SNAKE_GAME.as_mut().unwrap() };
    snake.update();
}
