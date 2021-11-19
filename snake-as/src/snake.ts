import * as w4 from "./wasm4"

export class Point {
	constructor(
		public x : i32,
		public y : i32
	) {}

	equals(other : Point) : bool {
		return this.x == other.x && this.y == other.y
	}
}

export class Snake {
	body : Array<Point> = [
		new Point(2, 0),
		new Point(1, 0),
		new Point(0, 0)
	]
	direction : Point = new Point(1, 0)

	draw() : void {
		store<u16>(w4.DRAW_COLORS, 0x0043)
		this.body.forEach(part => w4.rect(part.x * 8, part.y * 8, 8, 8))

		store<u16>(w4.DRAW_COLORS, 0x0004)
		w4.rect(this.body[0].x * 8, this.body[0].y * 8, 8, 8)
	}

	update() : void {
		const body = this.body
		const head = unchecked(body[0])

		for (let i = body.length - 1; i > 0; i--) {
			unchecked(body[i].x = body[i - 1].x)
			unchecked(body[i].y = body[i - 1].y)
		}

		head.x = (head.x + this.direction.x) % 20
		head.y = (head.y + this.direction.y) % 20

		if (head.x < 0) {
			head.x = 19
		}
		if (head.y < 0) {
			head.y = 19
		}
	}

	up() : void {
		if (this.direction.y == 0) {
			this.direction.x = 0
			this.direction.y = -1
		}
	}

	down() : void {
		if (this.direction.y == 0) {
			this.direction.x = 0
			this.direction.y = 1
		}
	}

	left() : void {
		if (this.direction.x == 0) {
			this.direction.x = -1
			this.direction.y = 0
		}
	}

	right() : void {
		if (this.direction.x == 0) {
			this.direction.x = 1
			this.direction.y = 0
		}
	}

	growTail(lastPos : Point) : void {
		this.body.push(lastPos)
	}

	isDead() : bool {
		const body = this.body
		const head = unchecked(body[0])

		for (let i = 1, len = body.length; i < len; i++) {
			if (unchecked(body[i]).equals(head)) {
				return true
			}
		}
		return false
	}
}

