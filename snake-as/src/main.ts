import { Point, Snake } from "./snake"
import * as w4 from "./wasm4";

const snake = new Snake()
const fruit = new Point(rnd(), rnd())
let frameCount = 0
let prevState : u8

const fruitSprite = memory.data<u8>([
	0b0_0000000,
	0b1_0100000,
	0b0_0000010,
	0b0_0000000,
	0b0_0001110,
	0b1_1110000,
	0b0_0110110,
	0b0_1011100,
	0b1_1010110,
	0b0_1010111,
	0b1_1010101,
	0b0_1010111,
	0b0_0110101,
	0b0_1011100,
	0b0_0001111,
	0b1_1110000
]);

function rnd(n : u16 = 20) : u16 {
	return u16(Math.floor(Math.random() * n))
}

export function start(): void {
	store<u32>(w4.PALETTE, 0xfbf7f3, 0 * sizeof<u32>())
	store<u32>(w4.PALETTE, 0xe5b083, 1 * sizeof<u32>())
	store<u32>(w4.PALETTE, 0x426e5d, 2 * sizeof<u32>())
	store<u32>(w4.PALETTE, 0x20283d, 3 * sizeof<u32>())
}

function input(): void {
	const gamepad = load<u8>(w4.GAMEPAD1)
	const justPressed = gamepad & (gamepad ^ prevState)

	if (justPressed & w4.BUTTON_UP) snake.up()
	if (justPressed & w4.BUTTON_DOWN) snake.down()
	if (justPressed & w4.BUTTON_LEFT) snake.left()
	if (justPressed & w4.BUTTON_RIGHT) snake.right()

	prevState = gamepad
}

export function update(): void {
	frameCount++

	input()

	if (frameCount % 15 == 0) {
		snake.update()

		if (snake.isDead()) {
			snake.body = [
				new Point(2, 0),
				new Point(1, 0),
				new Point(0, 0)
			]
			snake.direction.x = 1
			snake.direction.y = 0
		}

		if (snake.body[0].equals(fruit)) {
			let tail = snake.body[snake.body.length - 1]
			snake.body.push(new Point(tail.x, tail.y))
			fruit.x = rnd()
			fruit.y = rnd()
		}
	}

	snake.draw()

	store<u16>(w4.DRAW_COLORS, 0x4320)
	w4.blit(fruitSprite, fruit.x * 8, fruit.y * 8, 8, 8, w4.BLIT_2BPP)
}
