import IAppRoute from "../IAppRoute";
export interface IRouter {
    routes: IAppRoute[];
    layers: any;
    request_path: string;
    request_method: string;
}
