import * as w4 from "./wasm4"

export class Point {
	constructor(
		public x : i16,
		public y : i16
	) {}

	equals(other: Point): bool {
		return this.x == other.x && this.y == other.y
	}
}

export class Snake {
	body : Array<Point> = []
	direction : Point = new Point(1, 0)

	draw() : void {
		store<u16>(w4.DRAW_COLORS, 0x0043)
		this.body.forEach(part => w4.rect(part.x * 8, part.y * 8, 8, 8))

		store<u16>(w4.DRAW_COLORS, 0x0004)
		w4.rect(this.body[0].x * 8,this.body[0].y * 8, 8, 8)
	}

	update() : void {
		const body = this.body;
		for (let i = body.length - 1; i > 0; i--) {
			unchecked(body[i].x = body[i - 1].x)
			unchecked(body[i].y = body[i - 1].y)
		}
		let firstBody = unchecked(body[0]);
		firstBody.x = (firstBody.x + this.direction.x) % 20
		firstBody.y = (firstBody.y + this.direction.y) % 20

		if (firstBody.x < 0) {
			firstBody.x = 19
		}
		if (firstBody.y < 0) {
			firstBody.y = 19
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
			this.direction.x = 0
		}
	}

	isDead() : bool {
		const body = this.body;
		const firstBody = body[0];

		for (let i = 1, len = body.length; i < len; i++) {
			if (body[i].equals(firstBody)) {
				return true
			}
		}
		return false
	}
}

