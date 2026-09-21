# love-letter-website

A beautifully designed static love letter website for expressing deep affection and love.

## Live Demo

[love.qzydustin.com](https://love.qzydustin.com)

## Features

- Zero Dependencies: Pure HTML5, CSS3, and ES6+ JavaScript with no third-party libraries
- Responsive Design: Adapts to all screen sizes with HiDPI and touch support
- Beautiful Animations: Tree growing, heart falling, and typewriter letter effect
- Easy Customization: Personalize content and dates through a single config file

## Getting Started

```sh
git clone https://github.com/qzydustin/love-letter-website
```

Edit `config.js` to personalize content and replace `bgm.mp3` with your favorite music, then open `index.html` in your browser.

## Project Structure

```
love-letter-website/
├── index.html          # Main page
├── styles.css          # Stylesheet
├── config.js           # Text content configuration
├── js/
│   ├── geometry.js     # Point, Heart, and math utilities
│   ├── animation.js    # Frame runner, animation phases, typewriter
│   ├── tree.js         # Tree, Branch, Bloom, Seed, Footer classes
│   ├── ui.js           # Clock, scaling, content init, canvas setup
│   └── main.js         # Entry point and orchestration
├── bgm.mp3             # Background music
├── favicon.svg         # Website icon
└── README.md           # Project documentation
```

## Contributing

Issues and Pull Requests are welcome!

## Acknowledgments

Thanks to the original creator of the initial version of this project. This version has been extensively modernized and optimized.

## License

MIT License
