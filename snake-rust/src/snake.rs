use crate::{palette::set_draw_color, wasm4};
use heapless::Vec;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Point {
    pub x: i32,
    pub y: i32,
}

pub struct Snake {
    pub body: Vec<Point, 400>,
    pub direction: Point,
}

impl Snake {
    pub fn new() -> Self {
        let mut body = Vec::new();
        unsafe {
            body.push_unchecked(Point { x: 2, y: 0 });
            body.push_unchecked(Point { x: 1, y: 0 });
            body.push_unchecked(Point { x: 0, y: 0 });
        }
        Self {
            body,
            direction: Point { x: 1, y: 0 },
        }
    }

    pub fn draw(&self) {
        set_draw_color(0x43);

        for &Point { x, y } in self.body.iter() {
            wasm4::rect(x * 8, y * 8, 8, 8);
        }

        set_draw_color(0x4);
        wasm4::rect(self.body[0].x * 8, self.body[0].y * 8, 8, 8);
    }

    pub fn update(&mut self) -> Option<Point> {
        let mut new_head = Point {
            x: (self.body[0].x + self.direction.x) % 20,
            y: (self.body[0].y + self.direction.y) % 20,
        };
        if new_head.x < 0 {
            new_head.x = 19;
        }

        if new_head.y < 0 {
            new_head.y = 19;
        }
        let body_len = self.body.len();
        let old_tail = self.body[body_len - 1];
        self.body.copy_within(0..body_len - 1, 1);
        self.body[0] = new_head;
        Some(old_tail)
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
        self.body
            .iter()
            .skip(1)
            .any(|&body_section| body_section == self.body[0])
    }
}
