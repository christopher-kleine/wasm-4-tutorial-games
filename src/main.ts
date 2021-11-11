import { Point, Snake } from "./snake"
import * as w4 from "./wasm4";

var snake = new Snake()
var frameCount = 0
var prevState : u8
var fruit = new Point(rnd(20), rnd(20))
const fruitSprite = memory.data<u8>([ 0x00,0xa0,0x02,0x00,0x0e,0xf0,0x36,0x5c,0xd6,0x57,0xd5,0x57,0x35,0x5c,0x0f,0xf0 ]);

function rnd(n : u16) : u16 {
	return u16(Math.floor(Math.random()*n))
}

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

		if (snake.isDead()) {
			snake.body = []

			snake.body.push(new Point(2, 0))
			snake.body.push(new Point(1, 0))
			snake.body.push(new Point(0, 0))
			snake.direction = new Point(1, 0)
		}

		if (snake.body[0].X == fruit.X && snake.body[0].Y == fruit.Y) {
			let p = snake.body[snake.body.length-1]
			snake.body.push(new Point(p.X, p.Y))
			fruit.X = rnd(20)
			fruit.Y = rnd(20)
		}
	}

	snake.draw()

	store<u16>(w4.DRAW_COLORS, 0x4320)
	w4.blit(fruitSprite, fruit.X*8, fruit.Y*8, 8, 8, w4.BLIT_2BPP)
}
