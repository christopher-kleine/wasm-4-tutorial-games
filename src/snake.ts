import * as w4 from "./wasm4"

export class Point {
	public X : i16
	public Y : i16

	constructor(X : i16, Y : i16) {
		this.X = X
		this.Y = Y
	}
}

export class Snake {
	public body : Array<Point>
	public direction : Point

	constructor () {
		this.body = new Array<Point>()
		this.direction = new Point(1, 0)
	}

	public draw() : void {
		store<u16>(w4.DRAW_COLORS, 0x0043)
		this.body.forEach(part => w4.rect(part.X*8, part.Y*8, 8, 8))
		
		store<u16>(w4.DRAW_COLORS, 0x0004)
		w4.rect(this.body[0].X*8,this.body[0].Y*8, 8, 8)
	}

	public update() : void {
		for (let i = this.body.length-1; i > 0; i--) {
			this.body[i] = new Point(this.body[i-1].X, this.body[i-1].Y)
		}

		this.body[0].X = (this.body[0].X + this.direction.X) % 20
		this.body[0].Y = (this.body[0].Y + this.direction.Y) % 20
		if (this.body[0].X < 0) {
			this.body[0].X = 19
		}
		if (this.body[0].Y < 0) {
			this.body[0].Y = 19
		}
	}
}

