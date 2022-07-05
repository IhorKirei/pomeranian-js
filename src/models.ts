import { IncomingHttpHeaders, IncomingMessage, ServerResponse } from "http";
import { UrlWithParsedQuery } from "url";

export interface AppRoute {
  id: string;
  method: string;
  url: string;
  match: any;
  query: any;
  fileParsing: boolean;
}

export interface AppMiddleware {
  (req: Req, res: Res, next: (err?: Error) => void): void;
}

export interface Req extends IncomingMessage {
  url?: string;
  method?: string;
  headers: IncomingHttpHeaders | any;
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

export interface Res extends ServerResponse {
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

export interface QueryField {}

export interface QueryFields {
  [key: string]: QueryField;
}

export interface QueryFile {
  name: string;
  ext: string | undefined;
  mime: string;
  body: Buffer;
}

export interface QueryFiles {
  [key: string]: QueryFile;
}

export interface QueryBody {
  fields: QueryFields | {};
  files: QueryFiles | {};
}
