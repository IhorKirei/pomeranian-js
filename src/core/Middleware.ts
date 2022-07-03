import { showError } from "../utils.js";

import { IReq, IRes, IMiddleware } from "../models";

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
  addLocal(route_id: string, layers: IMiddleware[]) {
    if (!route_id) {
      showError("addLocal() invalid route id");
    }

    if (!layers) {
      return;
    }

    const result: { id: string; layers: IMiddleware[] } = {
      id: route_id,
      layers: [],
    };

    layers.forEach((layer: IMiddleware) => {
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
  addGlobal(layers: IMiddleware[]) {
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
   * Get middleware layer for specific query
   */
  private async applyLocal(
    routeId: string,
    req: IReq,
    res: IRes
  ): Promise<void> {
    if (!routeId) {
      showError("applyLocal() invalid route id");
    }

    const result = [];

    for (let i = 0; i < this.locals.length; i++) {
      if (this.locals[i].id !== routeId) {
        continue;
      }

      for (let k = 0; k < this.locals[i].layers.length; k++) {
        result.push(
          new Promise((resolve, reject) => {
            this.locals[i].layers[k](req, res, (err: Error) => {
              if (err) {
                reject(err);
              } else {
                resolve(null);
              }
            });
          })
        );
      }
    }

    await Promise.all(result);
  }

  /**
   * Get middleware layers for all queries
   */
  private async applyGlobal(req: IReq, res: IRes): Promise<void> {
    const result = [];

    for (let i = 0; i < this.globals.length; i++) {
      result.push(
        new Promise((resolve, reject) => {
          this.globals[i](req, res, (err: Error) => {
            if (err) {
              reject(err);
            } else {
              resolve(null);
            }
          });
        })
      );
    }

    await Promise.all(result);
  }

  /**
   * Apply all middleware layers
   */
  public async applyLayers(
    routeId: string,
    req: IReq,
    res: IRes
  ): Promise<void> {
    await this.applyLocal(routeId, req, res);
    await this.applyGlobal(req, res);
  }
}
