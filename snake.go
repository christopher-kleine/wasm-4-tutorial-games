package main

import "cart/w4"

type Point struct {
	X int
	Y int
}

type Snake struct {
	Body      []Point
	Direction Point
}

func (s *Snake) Draw() {
	*w4.DRAW_COLORS = 0x0043
	for _, part := range s.Body {
		w4.Rect(part.X*8, part.Y*8, 8, 8)
	}

	*w4.DRAW_COLORS = 0x0004
	w4.Rect(s.Body[0].X*8, s.Body[0].Y*8, 8, 8)
}
