import { IReq, IRes } from "./internal/misc";
export default interface IAppRoute {
    id: string;
    method: string;
    url: string;
    match: any;
    query: any;
    fileParsing: boolean;
    callback(req: IReq, res: IRes): void;
}
