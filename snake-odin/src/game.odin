package main

import "w4"
import "core:math/rand"
import "core:runtime"

fruit_sprite := [16]u8{ 0x00,0xa0,0x02,0x00,0x0e,0xf0,0x36,0x5c,0xd6,0x57,0xd5,0x57,0x35,0x5c,0x0f,0xf0 }
snake := &Snake{}
frameCount : i32 = 0
prevState : w4.Buttons
fruit := Point{10, 10}

@export
start :: proc "c" () {
	reset_snake(snake)

	w4.PALETTE[0] = 0xfbf7f3
	w4.PALETTE[1] = 0xe5b083
	w4.PALETTE[2] = 0x426e5d
	w4.PALETTE[3] = 0x20283d
}

input :: proc "c" () {
	justPressed := w4.GAMEPAD1^ & (w4.GAMEPAD1^ ~ prevState)

	if .UP in justPressed {
		snake_dir_up(snake)
	}

	if .DOWN in justPressed {
		snake_dir_down(snake)
	}

	if .LEFT in justPressed {
		snake_dir_left(snake)
	}

	if .RIGHT in justPressed {
		snake_dir_right(snake)
	}

	prevState = w4.GAMEPAD1^
}

@export
update :: proc "c" () {
	context = runtime.default_context()

	frameCount = frameCount + 1

	input()

	if frameCount % 15 == 0 {
		update_snake(snake)

		if snake.body[0] == fruit {
			grow_snake(snake)
			fruit = {rand.int31_max(20), rand.int31_max(20)}
		}

		if is_snake_dead(snake) {
			reset_snake(snake)
		}
	}

	draw_snake(snake)

	w4.DRAW_COLORS^ = 0x4320
	w4.blit(&fruit_sprite[0], fruit.x*8, fruit.y*8, 8, 8, {.USE_2BPP})
}
