/// <reference types="node" />
import { UrlWithParsedQuery } from "url";
import IAppRoute from "../IAppRoute";
export interface IRouter {
    routes: IAppRoute[];
    layers: any;
    parsed_all: any;
    parsed_query: UrlWithParsedQuery | null;
    request_uri: string;
    request_path: string;
    request_method: string;
}
