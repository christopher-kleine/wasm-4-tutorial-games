package main

import "w4"
import "core:runtime"

Point :: distinct [2]i32

Snake :: struct {
	body: [20*20]Point,
	direction: Point,
	len: int,
}

reset_snake :: proc "c" (s : ^Snake) {
	s.len = 3
	s.body[0] = {2, 0}
	s.body[1] = {1, 0}
	s.body[2] = {0, 0}
	s.direction = {1, 0}
}

draw_snake :: proc "c" (s : ^Snake) {
	w4.DRAW_COLORS^ = 0x43
	for i in 0..<s.len {
		w4.rect(s.body[i].x*8, s.body[i].y*8, 8, 8)
	}

	w4.DRAW_COLORS^ = 0x4
	w4.rect(s.body[0].x*8, s.body[0].y*8, 8, 8)
}

update_snake :: proc "c" (s : ^Snake) {
	for i := s.len-1; i > 0; i = i - 1 {
		s.body[i] = s.body[i-1]
	}

	s.body[0] = (s.body[0] + s.direction) % 20
	if s.body[0].x < 0 {
		s.body[0].x = 19
	}
	if s.body[0].y < 0 {
		s.body[0].y = 19
	}
}

snake_dir_up :: proc "c" (s : ^Snake) {
	if s.direction.y == 0 {
		s.direction = {0, -1}
	}
}

snake_dir_down :: proc "c" (s : ^Snake) {
	if s.direction.y == 0 {
		s.direction = {0, 1}
	}
}

snake_dir_left :: proc "c" (s : ^Snake) {
	if s.direction.x == 0 {
		s.direction = {-1, 0}
	}
}

snake_dir_right :: proc "c" (s : ^Snake) {
	if s.direction.x == 0 {
		s.direction = {1, 0}
	}
}

grow_snake :: proc "c" (s : ^Snake) {
	s.body[s.len] = s.body[s.len-1]
	s.len = s.len + 1
}

is_snake_dead :: proc "c" (s : ^Snake) -> bool {
	for i in 1..<s.len {
		if s.body[0] == s.body[i] {
			return true
		}
	}

	return false
}
