# casper-element-screenshot

Take a screenshot of an element on a page with [casperjs](http://casperjs.org/).

This started as a way to take a screenshot of a [Leaflet](http://leafletjs.com/) map, but it's abstract enough to potentially work for other screenshotting needs..

## Usage

`casper-element-screenshot` runs as a simple webserver. To set it up:

 1. Clone this repo.
 2. Copy `example.config.js` to `config.js` and change settings as needed.
 3. Run with `npm start`.
 4. Make a GET request to the server. The server expects to receive the following parameters:
  * `element`: (string) selector for the element to take a screenshot of,
  * `remove`: (string) comma-separated list of CSS selectors for elements that should not be included in the screenshot,
  * `height`: (number) the height of the page,
  * `width`: (number) the width of the page,
  * `url`: (string) the url to take a screenshot of.

## License

MIT
