import http from "http";
import chalk from "chalk";
import { nanoid } from "nanoid";

import Router from "./Router.js";
import { validate, showError } from "../utils.js";

import {
  AppSettings,
  AppRoute,
  AppMiddleware,
  Req,
  Res,
  ServerSettings,
} from "../models";

export default class Application {
  private _req: Req | null = null;
  private _res: Res | null = null;
  private _settings: AppSettings = {};
  private _router = new Router();

  public start(serverSettings?: ServerSettings): void {
    http
      .createServer((req, res) => {
        this.processRequest(req as Req, res as Res);
      })
      .listen(
        serverSettings?.port,
        serverSettings?.hostname,
        serverSettings?.backlog,
        serverSettings?.callback
      );
  }

  /**
   * Process every request to application
   */
  private async processRequest(req: Req, res: Res) {
    const self = this;

    self._req = req;
    self._res = res;

    req.startTime = Date.now();

    res.json = function (code: number, content: object) {
      if (!validate.integer(code)) {
        showError("res.json() invalid status code");
      }

      this.statusCode = code;
      this.setHeader("content-type", "application/json; charset=utf-8");
      this.end(JSON.stringify(content));

      self.finishRequest();
    };

    res.html = function (code: number, content: string) {
      if (!validate.integer(code)) {
        showError("res.html() invalid status code");
      }

      this.statusCode = code;
      this.setHeader("content-type", "text/html; charset=utf-8");

      if (content) {
        this.setHeader("content-length", Buffer.byteLength(content));
      }

      this.end(content);

      self.finishRequest();
    };

    res.redirect = function (url: string, code: number) {
      if (!url) {
        showError("res.redirect() invalid url for redirecting");
      }
      if (code !== 301 && code !== 302) {
        showError("res.redirect() invalid code for redirecting");
      }

      this.statusCode = code;
      this.setHeader(
        "location",
        `${req.connection.encrypted ? "https" : "http"}://${
          req.headers.host
        }${url}`
      );
      this.end();

      self.finishRequest();
    };

    // cross-origin resource sharing
    if (self._settings.cors) {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader(
        "Access-Control-Allow-Methods",
        "HEAD,GET,PUT,POST,PATCH,DELETE"
      );
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Accept,Authorization,Content-Type,Content-Length,Origin,X-Requested-With"
      );

      if (req.method === "OPTIONS") {
        return res.html(200);
      }
    }

    try {
      const route = await self._router.parseQuery(req);

      if (!route) {
        return res.html(404);
      }

      await self._router.layers.applyLayers(route.id, req, res);

      route.callback(req, res);
    } catch (err) {
      showError(err);
    }
  }

  /**
   * Change application settings
   */
  public tune(params: AppSettings) {
    if (!validate.object(params)) {
      showError("tune() invalid settings");
    }

    for (let name in params) {
      if (name !== "cors" && name !== "debug") {
        return showError("tune() invalid name");
      }

      if (params[name] !== true && params[name] !== false) {
        return showError("tune() invalid value, expected boolean");
      }

      switch (name) {
        case "cors":
        case "debug":
          this._settings[name] = params[name];
          break;
        default:
          break;
      }
    }
  }

  /**
   * Proxy method of routing "addRoute"
   */
  public addRoute(route: AppRoute, layers: any, callback: any) {
    if (!callback) {
      callback = layers;
      layers = null;
    }

    // validate new rule
    if (!validate.object(route)) {
      showError("addRoute() invalid route");
    }

    if (!validate.string(route.url)) {
      showError('addRoute() invalid route "url"');
    }
    route.url = route.url.replace(/\/+$/g, "");

    if (route.method) {
      if (!validate.string(route.method)) {
        showError('addRoute() invalid route "method"');
      }
      route.method = route.method.toUpperCase();
    }

    if (route.match !== undefined && !validate.object(route.match)) {
      showError('addRoute() invalid route "match"');
    }

    if (route.query !== undefined && !validate.object(route.query)) {
      showError('addRoute() invalid route "query"');
    }

    if (route.fileParsing !== undefined && !validate.bool(route.fileParsing)) {
      showError('addRoute() invalid route "fileParsing"');
    }

    route.id = nanoid();

    this._router.addRoute(route, callback);

    this._router.layers.addLocal(route.id, layers);
  }

  /**
   * Proxy method of layers "addGlobal" (new middleware function(s))
   */
  public useLayer(args: AppMiddleware[]): void {
    this._router.layers.addGlobal(args);
  }

  /**
   * Request finished (show debug information)
   */
  private finishRequest(): void {
    if (!this._settings.debug) {
      return;
    }
    if (!this._req || !this._req.url || !this._req.startTime) {
      return;
    }

    const spentTime = Date.now() - this._req.startTime;

    console.log(`${chalk.gray(this._req.url)} ${chalk.cyan(spentTime + "ms")}`);
  }
}
