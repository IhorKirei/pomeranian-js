import { IReq, IRes, IMiddleware } from "../models/internal/misc";
export default class Middleware {
    /**
     * List with layers for specific request, unique route rule
     */
    locals: any;
    /**
     * List with layers for all requests
     */
    globals: any;
    /**
     * Add middleware layers for specific request
     */
    addLocal(route_id: string, layers: IMiddleware[]): void;
    /**
     * Add middleware layers for all requests
     */
    addGlobal(layers: IMiddleware[]): void;
    /**
     * Get middleware layer for specific query
     */
    private applyLocal;
    /**
     * Get middleware layers for all queries
     */
    private applyGlobal;
    /**
     * Apply all middleware layers
     */
    applyLayers(routeId: string, req: IReq, res: IRes): Promise<void>;
}
