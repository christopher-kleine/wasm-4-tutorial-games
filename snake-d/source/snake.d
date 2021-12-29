module snake;

import w4 = wasm4;

struct Point
{
    int x;
    int y;
}

struct Snake
{
    ref inout(Point) head() inout { return body_[0]; }

    void draw() const
    {
        // Drawing the body.
        *w4.drawColors = 0x0043;
        foreach (part; body_[0 .. length])
        {
            w4.rect(part.x * 8, part.y * 8, 8, 8);
        }

        // Drawing the head.
        *w4.drawColors = 0x0004;
        w4.rect(head.x * 8, head.y * 8, 8, 8);
    }

    void update()
    {
        // Moving the body.
        foreach_reverse (i; 1 .. length)
        {
            body_[i].x = body_[i - 1].x;
            body_[i].y = body_[i - 1].y;
        }

        // Moving the head.
        head.x = (head.x + direction.x) % 20;
        head.y = (head.y + direction.y) % 20;
        if (head.x < 0) head.x = 19;
        if (head.y < 0) head.y = 19;
    }

    void left()
    {
        direction.x = -1;
        direction.y = 0;
    }

    void right()
    {
        direction.x = 1;
        direction.y = 0;
    }

    void up()
    {
        direction.x = 0;
        direction.y = -1;
    }

    void down()
    {
        direction.x = 0;
        direction.y = 1;
    }

    void extend()
    {
        if (body_.length <= length)
        {
            w4.trace("couldn't grow snake");
            return;
        }
        body_[length] = body_[length - 1];
        ++length;
    }

    bool isDead() const
    {
        foreach (part; body_[1 .. length]) if (part == head) return true;
        return false;
    }

  private:
    Point[400] body_ = [{2, 0}, {1, 0}, {0, 0}];
    size_t length = 3;
    Point direction = {1, 0};
}
