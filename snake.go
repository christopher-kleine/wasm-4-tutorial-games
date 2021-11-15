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

func (s *Snake) Update() {
	for i := len(s.Body) - 1; i > 0; i-- {
		s.Body[i] = s.Body[i-1]
	}

	s.Body[0].X = (s.Body[0].X + s.Direction.X) % 20
	s.Body[0].Y = (s.Body[0].Y + s.Direction.Y) % 20
	if s.Body[0].X < 0 {
		s.Body[0].X = 19
	}
	if s.Body[0].Y < 0 {
		s.Body[0].Y = 19
	}
}

func (s *Snake) Up() {
	if s.Direction.Y == 0 {
		s.Direction = Point{X: 0, Y: -1}
	}
}

func (s *Snake) Down() {
	if s.Direction.Y == 0 {
		s.Direction = Point{X: 0, Y: 1}
	}
}

func (s *Snake) Left() {
	if s.Direction.X == 0 {
		s.Direction = Point{X: -1, Y: -0}
	}
}

func (s *Snake) Right() {
	if s.Direction.X == 0 {
		s.Direction = Point{X: 1, Y: 0}
	}
}

func (s *Snake) IsDead() bool {
	for index := 1; index < len(s.Body)-1; index++ {
		if s.Body[0].X == s.Body[index].X && s.Body[0].Y == s.Body[index].Y {
			return true
		}
	}

	return false
}
