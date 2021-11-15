#include "wasm4.h"
#include "snake.h"
#include <stdlib.h>

struct snake snake;
int frame_count = 0;
uint8_t prev_state = 0;
struct point fruit;
const uint8_t fruit_sprite[] = {
    0x00,0xa0,0x02,0x00,0x0e,0xf0,0x36,0x5c,0xd6,0x57,0xd5,0x57,0x35,0x5c,0x0f,0xf0
};

void start() 
{
    PALETTE[0] = 0xfbf7f3;
    PALETTE[1] = 0xe5b083;
    PALETTE[2] = 0x426e5d;
    PALETTE[3] = 0x20283d;

    snake_create(&snake);
    snake_push(&snake,(struct point){2,0});
    snake_push(&snake,(struct point){1,0});
    snake_push(&snake,(struct point){0,0});
   
    snake.direction = (struct point){1,0};

    fruit = (struct point){rand()%20, rand()%20};
}

void input()
{
    const uint8_t just_pressed = *GAMEPAD1 & (*GAMEPAD1 ^ prev_state);

    if (just_pressed & BUTTON_UP)
    {
        snake_up(&snake);
    } 
    if(just_pressed & BUTTON_DOWN)
    {
        snake_down(&snake);
    }
    if(just_pressed & BUTTON_LEFT)
    {
       snake_left(&snake);
    }
    if(just_pressed & BUTTON_RIGHT)
    {
        snake_right(&snake);
    }
 
    prev_state = *GAMEPAD1;
}

void update () 
{
    frame_count++;

    input();

    if (frame_count % 15 == 0)
    {
        snake_update(&snake);

        if(snake_isdead(&snake))
        {
            snake_create(&snake);
           
            snake_push(&snake,(struct point){2,0});
            snake_push(&snake,(struct point){1,0});
            snake_push(&snake,(struct point){0,0});

            snake.direction = (struct point){1,0};
        }

        if(snake.body[0].x == fruit.x && snake.body[0].y == fruit.y)
        {
            struct point p = snake.body[snake.length-1];
            snake_push(&snake,p);
            fruit.x = rand()%20;
            fruit.y = rand()%20;
        }
    }

    snake_draw(&snake);

    *DRAW_COLORS = 0x4320;
    blit(fruit_sprite,fruit.x*8,fruit.y*8,8,8,BLIT_2BPP);

}
