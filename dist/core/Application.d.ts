import IAppSettings from "../models/IAppSettings";
import IAppRoute from "../models/IAppRoute";
import { IMiddleware, ServerSettings } from "../models/internal/misc";
export default class Application {
    private _req;
    private _res;
    private _settings;
    private _router;
    start(serverSettings: ServerSettings): void;
    /**
     * Process every request to application
     */
    private processRequest;
    /**
     * Change application settings
     */
    tune(params: IAppSettings): void;
    /**
     * Proxy method of routing "addRoute"
     */
    addRoute(route: IAppRoute, layers: any, callback: any): void;
    /**
     * Proxy method of layers "addGlobal" (new middleware function(s))
     */
    useLayer(args: IMiddleware[]): void;
    /**
     * Request finished (show debug information)
     */
    private finishRequest;
}
