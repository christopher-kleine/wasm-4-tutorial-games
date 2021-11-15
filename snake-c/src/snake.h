#ifndef SNAKE_H
#define SNAKE_H
#include <stdint.h>

struct point {
    int16_t x;
    int16_t y;
};

struct snake {
    struct point* body;
    struct point direction;
    uint16_t length;
};

void snake_create(struct snake *snake);
void snake_push(struct snake *snake, struct point p);
void snake_draw(struct snake *snake);
void snake_update(struct snake *snake);

void snake_up(struct snake *snake);
void snake_down(struct snake *snake);
void snake_left(struct snake *snake);
void snake_right(struct snake *snake);
int snake_isdead(struct snake *snake);
#endif