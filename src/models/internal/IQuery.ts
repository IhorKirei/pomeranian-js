import { IReq } from "./misc";

export default interface IQuery {
  _req: IReq;
  fields: object;
  files: object;
  _boundary: Buffer;
}
