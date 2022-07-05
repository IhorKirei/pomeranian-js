import { showError } from "../utils.js";

import { AppMiddleware, Req, Res } from "../models";

export default class Middleware {
  /**
   * List with layers for specific request, unique route rule
   */
  locals: any = [];

  /**
   * List with layers for all requests
   */
  globals: any = [];

  /**
   * Add middleware layers for specific request
   */
  addLocal(route_id: string, layers: AppMiddleware[]) {
    if (!route_id) {
      showError("addLocal() invalid route id");
    }

    if (!layers) {
      return;
    }

    const result: { id: string; layers: AppMiddleware[] } = {
      id: route_id,
      layers: [],
    };

    layers.forEach((layer: AppMiddleware) => {
      if (typeof layer !== "function") {
        showError("addLocal() need function for middleware layer");
      }

      if (!layer.length || layer.length !== 3) {
        showError("addLocal() invalid function arguments");
      }

      result.layers.push(layer);
    });

    this.locals.push(result);
  }

  /**
   * Add middleware layers for all requests
   */
  addGlobal(layers: AppMiddleware[]) {
    if (!layers) {
      return;
    }

    layers.forEach((layer) => {
      if (typeof layer !== "function") {
        showError("addGlobal() need function for middleware layer");
      }

      if (!layer.length || layer.length !== 3) {
        showError("addGlobal() invalid function arguments");
      }

      this.globals.push(layer);
    });
  }

  /**
   * Apply route-level middlewares
   */
  private async applyLocal(routeId: string, req: Req, res: Res): Promise<void> {
    if (!routeId) {
      showError("applyLocal() invalid route id");
    }

    const found = this.locals.find(
      (el: { id: string; layers: AppMiddleware[] }) => el.id === routeId
    );

    if (!found?.layers) {
      return;
    }

    await Promise.all(
      found.layers.map((layer: AppMiddleware) => {
        return new Promise((resolve, reject) => {
          layer(req, res, (err) => {
            if (err) {
              reject(err);
            } else {
              resolve(null);
            }
          });
        });
      })
    );
  }

  /**
   * Apply app-level middlewares
   */
  private async applyGlobal(req: Req, res: Res): Promise<void> {
    await Promise.all(
      this.globals.map((layer: AppMiddleware) => {
        return new Promise((resolve, reject) => {
          layer(req, res, (err) => {
            if (err) {
              reject(err);
            } else {
              resolve(null);
            }
          });
        });
      })
    );
  }

  /**
   * Apply all middleware layers
   */
  public async applyLayers(routeId: string, req: Req, res: Res): Promise<void> {
    await this.applyLocal(routeId, req, res);
    await this.applyGlobal(req, res);
  }
}
