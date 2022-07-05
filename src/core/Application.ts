import http from "http";
import chalk from "chalk";

import { Router } from "./Router.js";
import { AppError } from "../exceptions.js";
import { validate } from "../utils.js";

import { AppMiddleware, Req, Res, ServerSettings } from "../models";

export class Application {
  private _req: Req | null = null;
  private _res: Res | null = null;
  private _router = new Router();
  private _middlewares: AppMiddleware[] = [];

  public start(serverSettings?: ServerSettings): void {
    this._router.layers.addGlobal(this._middlewares);

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
        throw AppError.InternalError("res.json() invalid status code");
      }

      this.statusCode = code;
      this.setHeader("content-type", "application/json; charset=utf-8");
      this.end(JSON.stringify(content));

      self.finishRequest();
    };

    res.html = function (code: number, content: string) {
      if (!validate.integer(code)) {
        throw AppError.InternalError("res.html() invalid status code");
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
        throw AppError.InternalError(
          "res.redirect() invalid url for redirecting"
        );
      }
      if (code !== 301 && code !== 302) {
        throw AppError.InternalError(
          "res.redirect() invalid code for redirecting"
        );
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

    try {
      const routeAction = await self._router.handleRequest(req, res);

      if (!routeAction) {
        res.statusCode = 404;
        res.end();
      } else {
        routeAction(req, res);
      }
    } catch (err) {
      console.error(err);

      if (err instanceof AppError) {
        res.statusCode = err.status;
        res.end();
      }
    }
  }

  /**
   * Add app-level middlewares
   */
  public useMiddleware(...list: AppMiddleware[]): void {
    this._middlewares = this._middlewares.concat(list);
  }

  public useRouter(router: Router) {
    this._router = router;
  }

  private finishRequest(): void {
    if (!this._req || !this._req.url || !this._req.startTime) {
      return;
    }

    const spentTime = Date.now() - this._req.startTime;

    console.log(`${chalk.gray(this._req.url)} ${chalk.cyan(spentTime + "ms")}`);
  }
}
