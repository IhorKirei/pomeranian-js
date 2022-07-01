/// <reference types="node" />
import { IReq, IQueryBody, IQueryFields, IQueryFiles } from "../models/internal/misc";
import IQuery from "../models/internal/IQuery";
export default class Query implements IQuery {
    _req: IReq;
    fields: IQueryFields;
    files: IQueryFiles;
    _boundary: Buffer;
    constructor(req: IReq);
    /**
     * Parse body content, search for fields and files
     */
    parseBody(): Promise<IQueryBody>;
    /**
     * Parse body with content-type "application/json"
     */
    private json;
    /**
     * Parse body with content-type "application/x-www-form-urlencoded"
     */
    private form;
    /**
     * Parse body with content-type "multipart/form-data"
     */
    private multipart;
    private getBoundary;
    private getSubPositions;
    private parseEachPart;
    private getFileExtension;
}
