import { IAppRoute } from "./";
import { IReq } from "./misc";

export interface IQuery {
  _req: IReq;
  fields: object;
  files: object;
  _boundary: Buffer;
}

export interface IRouter {
  routes: IAppRoute[];
  layers: any;
  request_path: string;
  request_method: string;
}