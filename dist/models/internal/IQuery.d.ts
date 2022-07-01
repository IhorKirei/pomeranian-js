/// <reference types="node" />
import { IReq } from "./misc";
export default interface IQuery {
    _req: IReq;
    fields: object;
    files: object;
    boundary: Buffer;
}
