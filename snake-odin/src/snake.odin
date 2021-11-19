package main

import "w4"
import "core:runtime"

Point :: struct {
	X: i32,
	Y: i32,
}

are_points_colliding :: proc "c" (a, b : Point) -> bool {
	return a.X == b.X && a.Y == b.Y 
}

Snake :: struct {
	body: [20*20]Point,
	direction: Point,
	len: int,
}

reset_snake :: proc "c" (s : ^Snake) {
	using s

	len = 3
	body[0] = Point{X = 2, Y = 0}
	body[1] = Point{X = 1, Y = 0}
	body[2] = Point{X = 0, Y = 0}
	direction = Point{X = 1, Y = 0}
}

draw_snake :: proc "c" (s : ^Snake) {
	using s

	w4.DRAW_COLORS^ = 0x43
	for i in 0..<len {
		w4.rect(body[i].X*8, body[i].Y*8, 8, 8)
	}

	w4.DRAW_COLORS^ = 0x4
	w4.rect(body[0].X*8, body[0].Y*8, 8, 8)
}

update_snake :: proc "c" (s : ^Snake) {
	using s

	for i := len-1; i > 0; i = i - 1 {
		body[i] = body[i-1]
	}

	body[0].X = (body[0].X + direction.X) % 20
	body[0].Y = (body[0].Y + direction.Y) % 20
	if body[0].X < 0 {
		body[0].X = 19
	}
	if body[0].Y < 0 {
		body[0].Y = 19
	}
}

snake_dir_up :: proc "c" (s : ^Snake) {
	using s

	if direction.Y == 0 {
		direction = Point{X = 0, Y = -1}
	}
}

snake_dir_down :: proc "c" (s : ^Snake) {
	using s

	if direction.Y == 0 {
		direction = Point{X = 0, Y = 1}
	}
}

snake_dir_left :: proc "c" (s : ^Snake) {
	using s

	if direction.X == 0 {
		direction = Point{X = -1, Y = 0}
	}
}

snake_dir_right :: proc "c" (s : ^Snake) {
	using s

	if direction.X == 0 {
		direction = Point{X = 1, Y = 0}
	}
}

grow_snake :: proc "c" (s : ^Snake) {
	using s

	body[len] = body[len-1]
	len = len + 1
}

is_snake_dead :: proc "c" (s : ^Snake) -> bool {
	using s

	for i in 1..<len {
		if are_points_colliding(body[0], body[i]) {
			return true
		}
	}

	return false
}
