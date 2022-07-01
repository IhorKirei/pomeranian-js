import Middleware from "./Middleware";
import { IReq, IRes } from "../models/internal/misc";
import IAppRoute from "../models/IAppRoute";
import { IRouter } from "../models/internal/IRouter";
export default class Router implements IRouter {
    routes: IAppRoute[];
    layers: Middleware;
    request_path: string;
    request_method: string;
    /**
     * Add new rule for routing, set callback
     */
    addRoute(route: IAppRoute, callback: (req: IReq, res: IRes) => void): void;
    /**
     * Parse url for query parameters
     */
    parseQuery(req: IReq): Promise<IAppRoute | null>;
    /**
     * Compare current request to available route rules
     */
    private matchUrl;
    /**
     * Compare current request to specified route rule
     */
    private isMatch;
    /**
     * Get incoming parameters
     */
    private getParams;
    /**
     * Customize Node Request
     */
    private setBasicData;
}
