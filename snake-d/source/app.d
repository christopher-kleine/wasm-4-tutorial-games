module app;

import w4 = wasm4;
import snake : Point, Snake;

Snake snake;
Point fruit;

extern(C) int rand();

extern(C) void start()
{
    static const uint[] palette = [0xfbf7f3, 0xe5b083, 0x426e5d, 0x20283d];
    w4.palette[0 .. palette.length] = palette;

    fruit.x = rand() % 20;
    fruit.y = rand() % 20;
}

void input()
{
    static ubyte prevState;
    const gamepad = *w4.gamepad1;
    const justPressed = gamepad & (gamepad ^ prevState);

    if (justPressed & w4.buttonLeft) snake.left();
    if (justPressed & w4.buttonRight) snake.right();
    if (justPressed & w4.buttonUp) snake.up();
    if (justPressed & w4.buttonDown) snake.down();

    prevState = gamepad;
}

extern(C) void update()
{
    static uint frameCount;
    ++frameCount;
    input();

    // Slowing down to 60 / 15 = 4 units per second.
    if (frameCount % 15 == 0)
    {
        snake.update();

        if (snake.isDead) snake = Snake.init;

        if (snake.head == fruit)
        {
            snake.extend();
            fruit.x = rand() % 20;
            fruit.y = rand() % 20;
        }
    }

    snake.draw();

    // Rendering a png file with transparent background.
    *w4.drawColors = 0x4320;
    static const ubyte[] fruitSprite = [
        0x00,0xa0,0x02,0x00,0x0e,0xf0,0x36,0x5c,0xd6,0x57,0xd5,0x57,0x35,0x5c,0x0f,0xf0
    ];
    w4.blit(&fruitSprite[0], fruit.x * 8, fruit.y * 8, 8, 8, w4.blit2Bpp);
}
