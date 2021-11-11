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
}

