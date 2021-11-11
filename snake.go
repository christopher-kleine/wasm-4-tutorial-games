package main

type Point struct {
	X int
	Y int
}

type Snake struct {
	Body      []Point
	Direction Point
}
