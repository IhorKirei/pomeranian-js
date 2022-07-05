[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Linux Build][travis-image]][travis-url]
[![Coverage Status](https://coveralls.io/repos/github/IhorKirei/pomeranian-js/badge.svg?branch=master)](https://coveralls.io/github/IhorKirei/pomeranian.js?branch=master)

# Pomeranian.js
Hello buddy! This is another light-weight high performance, extendable solution for you to build modern, scalable Node.js applications. It's similar to what you have already seen, to get details please read this documentation.

### Installation

```bash
npm install pomeranian-js --save
```
or
```bash
yarn add pomeranian-js
```

### Hello World
Just a quick example how you can start.
```js
import { Application, Router } from "pomeranian-js";

const app = new Application();
const router = new Router();

router.addRule(
  { method: "GET", url: "/" },
  (req, res) => {
    res.json(200, { status: "Success" });
  }
);

app.useRouter(router);

app.start({
  port: 3000,
  callback: () => {
    console.log("Server is running...");
  }
});
```

### Middlewares
Basically this is a simple way to do something with **req** and **res** objects while processing client's requests, e.g. add authorization logic before API callback runs. I call this feature as **layers**.

You can define layers using two ways:

##### Local
For specific route rule (route-level):
```js
router.addRule(options, callback, (req, res, next) => {
  // do something with "req" and "res" objects and run callback
  next();
});
```

##### Global
Will be executed for all routes (app-level):
```js
app.useMiddleware((req, res, next) => {
  // do something with "req" and "res" objects and run callback
  next();
});
```

### Routes
For adding a new routing rule, you should use **addRule** method:

```js
router.addRule({
  method: String, // default GET
  url: String,
  match: Object,
  query: Object,
  fileParsing: Boolean // default false
}, (req, res) => {});
```

##### Options
- **method** - HTTP method, can be GET, POST, PUT, DELETE (optional)
- **url** - pattern for request url (required)
- **match** - patterns for special parameters in request url (optional)
- **query** - patterns for query string parameters, after question mark (optional)
- **fileParsing** - framework parses (if true) or doesn't parse (if false) request's body for uploaded files if Content-Type is *multipart/form-data* (optional)

##### Callback
This is how you can handle client's requests.

You can do it with typical way:
```js
router.addRule(options, (req, res) => {
  res.statusCode = httpCode;
  res.end(content);
});
```
Or using our methods out of the box (**res.html**, **res.json**, **res.redirect**):

```js
router.addRule(options, (req, res) => {
  res.html(httpCode, html); // return HTML content
});
```
```js
router.addRule(options, (req, res) => {
  res.json(httpCode, json); // return JSON object
});
```
```js
router.addRule(options, (req, res) => {
  res.redirect("/path/", 301); // redirect user to another page or website
});
```

### Routes Examples
Just a few examples how you can use it:

```js
router.addRule({
  url: "/{category}",
  match: {
    category: ["phones", "tablets"]
  }
}, (req, res) => {
  res.json(200, req.params);
});
```
```js
router.addRule({
  url: "/{category}/{name}",
  match: {
    category: ["phones", "tablets"],
    name: "([a-z0-9]{3,50}"
  }
}, (req, res) => {
  res.json(200, req.params);
});
```
```js
router.addRule({
  url: "/{category}/{name}",
  query: {
    password: "[a-z0-9]{3,50}"
  }
}, (req, res) => {
  res.json(200, { ...req.params, ...req.query });
});
```

### Variables
While processing client's request you can get access to internal variables in **req** object:

- **req.clientIpAddress** - client's IP address
- **req.referer** - client's referrer, identifies URL that linked to resource being requested
- **req.params** - URL parameters
- **req.query** - query string parameters
- **req.files** - name, extension, mime and content of uploaded file

### Advices
We collected some advices for you, it can be useful in some cases.

##### Page not found
If some client's request doesn't match your routing rules, our framework will shows blank page with 404 http status. Of course for production we need more intelligent solution, so here is example how you can show your custom "not found" page:
```js
router.addRule({
  url: "/{url}",
  match: {
    url: "(.*)"
  }
}, (req, res) => {
  res.html(404, content);
});
```
Just need add new routing rule for processing all requests. Important thing: this rule must be last one - just in case to overwrite previous, it's very important.

## Contributing
You can help to improve my framework, here is a lot of work to do:
- review [pull requests](https://github.com/IhorKirei/pomeranian-js/pulls)
- find new [issue](https://github.com/IhorKirei/pomeranian-js/issues) or fix existing
- add new feature or improve old
- update documentation


## License
The Pomeranian JS framework is open-source software licensed under the [MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/pomeranian-js.svg?style=flat
[npm-url]: https://npmjs.org/package/pomeranian-js
[downloads-image]: https://img.shields.io/npm/dm/pomeranian-js.svg?style=flat
[downloads-url]: https://npmjs.org/package/pomeranian-js
[travis-image]: https://img.shields.io/travis/IhorKirei/pomeranian-js.svg?style=flat
[travis-url]: https://travis-ci.org/IhorKirei/pomeranian-js