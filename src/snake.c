#include "snake.h"
#include "wasm4.h"
#include <stdlib.h>

void snake_create(struct snake *snake)
{
    struct point* body;
    body = malloc(0);
    if(body)
    {
        if(snake->body != NULL)
        {
            free(snake->body);
        }
        snake->body = body;
        snake->length = 0;
    }
}

void snake_push(struct snake *snake, struct point p)
{
    if(snake->body)
    {
        struct point* body = realloc(snake->body,sizeof body * (snake->length+1));
        if(body)
        {
            snake->body = body;
            snake->body[snake->length++] = p;
        }
    }
}

void snake_draw(struct snake *snake)
{
    *DRAW_COLORS = 0x0043;
    for(size_t i = 0; i < snake->length; ++i)
    {
        rect(snake->body[i].x*8, snake->body[i].y*8,8,8);  
    }

    *DRAW_COLORS = 0x0004;
    rect(snake->body[0].x*8,snake->body[0].y*8,8,8);
}

void snake_update(struct snake *snake)
{
    for(int i = (snake->length)-1; i > 0; i--)
    { 
        snake->body[i] = snake->body[i-1];
    }

    snake->body[0].x = (snake->body[0].x + snake->direction.x) % 20;
    snake->body[0].y = (snake->body[0].y + snake->direction.y) % 20;
     
    if(snake->body[0].x < 0)
    {
        snake->body[0].x = 19;
    }
    if(snake->body[0].y < 0)
    {
        snake->body[0].x = 19;
    }
}

void snake_up(struct snake *snake)
{
    if(snake->direction.y == 0)
    {
        snake->direction = (struct point){0,-1};
    }
}

void snake_down(struct snake *snake)
{
    if(snake->direction.y == 0)
    { 
        snake->direction = (struct point){0,1};
    }
}

void snake_left(struct snake *snake)
{
    if(snake->direction.x == 0)
    {
        snake->direction = (struct point){-1,0};
    }
}

void snake_right(struct snake *snake)
{
    if(snake->direction.x == 0)
    {
        snake->direction = (struct point){1,0};
    }
}

int snake_isdead(struct snake *snake)
{
    for(size_t i = 1; i < snake->length; i++)
    {
        if(snake->body[i].x == snake->body[0].x && snake->body[i].y == snake->body[0].y)
        {
            return 1;
        }
    }

    return 0;
}