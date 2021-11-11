import { Point, Snake } from "./snake"
import * as w4 from "./wasm4";

var snake = new Snake()
var frameCount = 0

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

export function update (): void {
	frameCount++
	
	if (frameCount % 15 == 0) {
		snake.update()
	}

	snake.draw()
}
