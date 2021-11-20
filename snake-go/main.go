package main

import (
	"math/rand"

	"cart/w4"
)

var (
	snake       = &Snake{}
	frameCount  = 0
	prevState   uint8
	fruit       = Point{X: 10, Y: 10}
	rnd         func(int) int
	fruitSprite = [16]byte{0x00, 0xa0, 0x02, 0x00, 0x0e, 0xf0, 0x36, 0x5c, 0xd6, 0x57, 0xd5, 0x57, 0x35, 0x5c, 0x0f, 0xf0}
)

func input() {
	justPressed := *w4.GAMEPAD1 & (*w4.GAMEPAD1 ^ prevState)

	if *w4.GAMEPAD1 != 0 && rnd == nil {
		rnd = rand.New(rand.NewSource(int64(frameCount))).Intn
	}

	if justPressed&w4.BUTTON_UP != 0 {
		snake.Up()
	}
	if justPressed&w4.BUTTON_DOWN != 0 {
		snake.Down()
	}
	if justPressed&w4.BUTTON_LEFT != 0 {
		snake.Left()
	}
	if justPressed&w4.BUTTON_RIGHT != 0 {
		snake.Right()
	}

	prevState = *w4.GAMEPAD1
}

//go:export start
func start() {
	w4.PALETTE[0] = 0xfbf7f3
	w4.PALETTE[1] = 0xe5b083
	w4.PALETTE[2] = 0x426e5d
	w4.PALETTE[3] = 0x20283d

	snake.Reset()
}

//go:export update
func update() {
	frameCount++

	input()

	if frameCount%15 == 0 {
		snake.Update()

		if snake.IsDead() {
			snake.Reset()
		}

		if snake.Body[0] == fruit {
			snake.Body = append(snake.Body, snake.Body[len(snake.Body)-1])
			fruit.X = rnd(20)
			fruit.Y = rnd(20)
		}
	}
	snake.Draw()

	*w4.DRAW_COLORS = 0x4320
	w4.Blit(&fruitSprite[0], fruit.X*8, fruit.Y*8, 8, 8, w4.BLIT_2BPP)
}
