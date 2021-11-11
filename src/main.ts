import { Point, Snake } from "./snake"
import * as w4 from "./wasm4";

var snake = new Snake()
var frameCount = 0
var prevState : u8

export function start (): void {
	store<u32>(w4.PALETTE, 0xfbf7f3, 0 * sizeof<u32>());
	store<u32>(w4.PALETTE, 0xe5b083, 1 * sizeof<u32>());
	store<u32>(w4.PALETTE, 0x426e5d, 2 * sizeof<u32>());
	store<u32>(w4.PALETTE, 0x20283d, 3 * sizeof<u32>());

	snake.body.push(new Point(2, 0))
	snake.body.push(new Point(1, 0))
	snake.body.push(new Point(0, 0))
	snake.direction = new Point(1, 0)
}

function input() :void {
	const gamepad = load<u8>(w4.GAMEPAD1);
	const justPressed = gamepad & (gamepad ^ prevState)
	
	if (justPressed & w4.BUTTON_UP) {
		snake.up()
	}
	if (justPressed & w4.BUTTON_DOWN) {
		snake.down()
	}
	if (justPressed & w4.BUTTON_LEFT) {
		snake.left()
	}
	if (justPressed & w4.BUTTON_RIGHT) {
		snake.right()
	}

	prevState = gamepad
}

export function update (): void {
	frameCount++

	input()
	
	if (frameCount % 15 == 0) {
		snake.update()
	}

	snake.draw()
}
