import url, { UrlWithParsedQuery } from "url";

import Middleware from "./Middleware.js";
import Query from "./Query.js";
import { showError, val2regexp } from "../utils.js";

import { IReq, IRes, IQueryBody } from "../models/misc";
import { IAppRoute } from "../models";
import { IRouter } from "../models/internal";

export default class Router implements IRouter {
  routes: IAppRoute[] = [];

  layers = new Middleware();

  request_path: string = "";

  request_method = "";

  /**
   * Add new rule for routing, set callback
   */
  public addRoute(route: IAppRoute, callback: (req: IReq, res: IRes) => void) {
    const methods = ["GET", "POST", "PUT", "DELETE"];

    if (!route.method) {
      route.method = "GET";
    }

    if (!methods.includes(route.method)) {
      showError("addRoute() invalid method in route");
    }

    if (
      this.routes.find(
        (item: IAppRoute) =>
          item.url === route.url && item.method === route.method
      )
    ) {
      showError("addRoute() duplicated url and method");
    }

    route.callback = callback;

    this.routes.push(route);
  }

  /**
   * Parse url for query parameters
   */
  public async parseQuery(req: IReq): Promise<IAppRoute | null> {
    if (!req.url) {
      return null;
    }

    const parsedQuery: UrlWithParsedQuery = url.parse(req.url, true);

    this.request_path = parsedQuery.pathname || "";
    this.request_method = req.method || "GET";

    const route = this.matchUrl();

    if (!route) {
      return null;
    }

    req.route = { ...route };
    delete req.route.callback;

    req.query = {};
    req.files = {};
    req.params = {};

    if (!route.fileParsing) {
      return route;
    }

    const query = new Query(req);

    const { fields, files }: IQueryBody = await query.parseBody();

    req.query = { ...parsedQuery.query, ...fields };
    req.files = files;
    req.params = this.getParams(route.url);

    this.setBasicData(req);

    return route;
  }

  /**
   * Compare current request to available route rules
   */
  private matchUrl(): IAppRoute | undefined {
    for (let i = 0; i < this.routes.length; i++) {
      if (
        this.isMatch(
          this.routes[i].url,
          this.routes[i].match,
          this.routes[i].method
        )
      ) {
        return this.routes[i];
      }
    }
  }

  /**
   * Compare current request to specified route rule
   */
  private isMatch(path: string, match: any = {}, method: string) {
    if (/\?/.test(path)) {
      path = path.replace("?", "\\?");
    }

    const tags = path.match(/{([a-z_]{1,50})}/gi) || [];

    tags.forEach((tag) => {
      let name = tag.replace(/({})/g, "");

      if (match[name]) {
        path = path.replace(tag, val2regexp(match[name]));
      } else {
        path = path.replace(tag, "([a-zA-Z0-9-_%.]{1,100})");
      }
    });

    const rule = new RegExp("^" + path + "/?$", "g");

    // need check also with trailing slash
    let changed_path = this.request_path;

    if (!/\/$/.test(changed_path)) {
      changed_path += "/";
    }

    return changed_path.match(rule) && method === this.request_method;
  }

  /**
   * Get incoming parameters
   */
  private getParams(path: string) {
    const params: any = {};
    const path_keys = path.split("/");
    const request_keys = this.request_path.split("/");

    for (let i = 0; i < path_keys.length; i++) {
      let key = path_keys[i];

      if (!/({})/.test(key)) {
        continue;
      }

      key = key.replace(/({})/g, "");

      if (request_keys[i] && !params[key]) {
        params[key] = request_keys[i];
      }
    }

    return params;
  }

  /**
   * Customize Node Request
   */
  private setBasicData(req: IReq) {
    // get client IP address
    req.client_ip =
      req.headers["x-real-ip"] ||
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress;

    // get client referer
    req.referer = req.headers.referer
      ? url.parse(req.headers.referer, true)
      : null;
  }
}
