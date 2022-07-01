import { UrlWithParsedQuery } from "url";
import { IncomingMessage, ServerResponse } from "http";

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

export interface IReq extends IncomingMessage {
  url?: string;
  method?: string;
  headers: IReqHeaders | any;
  connection: any;
  socket: any;
  referer?: UrlWithParsedQuery | null;
  client_ip?: string;
  route?: any;
  query?: any;
  files?: any;
  params?: any;
  startTime?: number;
}

export interface IRes extends ServerResponse {
  json?(code: number, content: object): any;
  html?(code: number, content?: string): any;
  redirect?(url: string, code: number): any;
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
