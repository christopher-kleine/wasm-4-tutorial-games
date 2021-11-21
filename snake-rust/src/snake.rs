use crate::{palette::set_draw_color, wasm4};

#[derive(Clone, Copy, PartialEq, Eq)]
pub struct Point {
    pub x: i32,
    pub y: i32,
}

pub struct Snake {
    pub body: Vec<Point>,
    pub direction: Point,
}

impl Snake {
    pub fn new() -> Self {
        Self {
            body: vec![
                Point { x: 2, y: 0 },
                Point { x: 1, y: 0 },
                Point { x: 0, y: 0 },
            ],
            direction: Point { x: 1, y: 0 },
        }
    }

    pub fn draw(&self) {
        if let Some(first) = self.body.first() {
            set_draw_color(0x43u16);

            for &Point { x, y } in self.body.iter() {
                wasm4::rect(x * 8, y * 8, 8, 8);
            }

            set_draw_color(0x4u16);
            wasm4::rect(first.x * 8, first.y * 8, 8, 8);
        }
    }

    pub fn update(&mut self) -> Option<Point> {
        if !self.body.is_empty() {
            self.body.insert(
                0,
                Point {
                    x: (self.body[0].x + self.direction.x) % 20,
                    y: (self.body[0].y + self.direction.y) % 20,
                },
            );

            if self.body[0].x < 0 {
                self.body[0].x = 19;
            }

            if self.body[0].y < 0 {
                self.body[0].y = 19;
            }

            self.body.pop()
        } else {
            None
        }
    }

    pub fn grow_tail(&mut self, last_pos: Point) {
        self.body.push(last_pos);
    }

    pub fn left(&mut self) {
        if self.direction.x == 0 {
            self.direction = Point { x: -1, y: 0 };
        }
    }

    pub fn right(&mut self) {
        if self.direction.x == 0 {
            self.direction = Point { x: 1, y: 0 };
        }
    }

    pub fn up(&mut self) {
        if self.direction.y == 0 {
            self.direction = Point { x: 0, y: -1 };
        }
    }

    pub fn down(&mut self) {
        if self.direction.y == 0 {
            self.direction = Point { x: 0, y: 1 };
        }
    }

    pub fn is_dead(&self) -> bool {
        match self.body.first() {
            None => true,
            Some(first) => self
                .body
                .iter()
                .skip(1)
                .any(|body_section| body_section == first),
        }
    }
}
