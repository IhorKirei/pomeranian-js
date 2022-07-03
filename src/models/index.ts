import { IReq, IRes } from "./misc";

export interface IAppRoute {
  id: string;
  method: string;
  url: string;
  match: any;
  query: any;
  fileParsing: boolean;
  callback(req: IReq, res: IRes): void;
}

export interface IAppSettings {
  cors?: boolean;
  debug?: boolean;
}