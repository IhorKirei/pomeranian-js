import { IncomingMessage, ServerResponse } from "http";
import { UrlWithParsedQuery } from "url";

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

export interface IReq extends IncomingMessage {
  url?: string;
  method?: string;
  headers: IReqHeaders | any;
  connection: any;
  socket: any;
  referer?: UrlWithParsedQuery | null;
  clientIpAddress?: string;
  route?: any;
  query?: any;
  files?: any;
  params?: any;
  startTime?: number;
}

export interface IRes extends ServerResponse {
  json(code: number, content: object): void;
  html(code: number, content?: string): void;
  redirect(url: string, code: number): void;
}

export interface ServerSettings {
  port?: number;
  hostname?: string;
  backlog?: number;
  callback?: () => void;
}

export interface IReqHeaders {
  Authorization?: string;
  "content-type": string;
}

export interface IQueryField {}

export interface IQueryFields {
  [key: string]: IQueryField;
}

export interface IQueryFile {
  name: string;
  ext: string | undefined;
  mime: string;
  body: Buffer;
}

export interface IQueryFiles {
  [key: string]: IQueryFile;
}

export interface IQueryBody {
  fields: IQueryFields | {};
  files: IQueryFiles | {};
}

export interface IMiddleware {
  (req: IReq, res: IRes, next: () => void): void;
}
