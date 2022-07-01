import querystring from "querystring";

import * as utils from "../utils";
import {
  IReq,
  IQueryBody,
  IReqHeaders,
  IQueryFields,
  IQueryFiles,
} from "../models/internal/misc";
import IQuery from "../models/internal/IQuery";

export default class Query implements IQuery {
  _req;
  fields: IQueryFields = {};
  files: IQueryFiles = {};
  boundary;

  constructor(req: IReq) {
    this._req = req;
    this.boundary = this.getBoundary(req.headers);
  }

  /**
   * Parse body content, search for fields and files
   */
  public parseBody(): Promise<IQueryBody> {
    return new Promise((resolve, reject) => {
      if (this._req.method) {
        if (["GET", "HEAD"].includes(this._req.method)) {
          return resolve({
            fields: this.fields,
            files: this.files,
          });
        }

        if (!["PUT", "POST", "DELETE"].includes(this._req.method)) {
          return reject("unsupported HTTP method");
        }
      }

      const isJson = /application\/json/.test(
        this._req.headers["content-type"]
      );
      const isForm = /application\/x-www-form-urlencoded/.test(
        this._req.headers["content-type"]
      );
      const isMultipart = /multipart\/form-data/.test(
        this._req.headers["content-type"]
      );

      if (!isJson && !isForm && !isMultipart) {
        return resolve({
          fields: this.fields,
          files: this.files,
        });
      }

      let body: Buffer;

      this._req.on("data", (chunk) => {
        if (!body) {
          body = chunk;
        } else {
          body = Buffer.concat([body, chunk]);
        }
      });

      this._req.on("end", () => {
        if (isJson) {
          this.json(body);
        } else if (isForm) {
          this.form(body);
        } else if (isMultipart) {
          this.multipart(body);
        }

        resolve({
          fields: this.fields,
          files: this.files,
        });
      });
    });
  }

  /**
   * Parse body with content-type "application/json"
   */
  private json(body: Buffer): void {
    if (!Buffer.isBuffer(body)) {
      return;
    }

    const strBody: string = body.toString("utf8");

    if (!utils.validate.json(strBody)) {
      return console.error("invalid JSON");
    }

    this.fields = JSON.parse(strBody);
  }

  /**
   * Parse body with content-type "application/x-www-form-urlencoded"
   */
  private form(body: Buffer): void {
    if (!Buffer.isBuffer(body)) {
      return;
    }

    const strBody: string = body.toString("utf8");

    this.fields = querystring.parse(strBody) as IQueryFields;
  }

  /**
   * Parse body with content-type "multipart/form-data"
   */
  private multipart(body: Buffer): void {
    if (!Buffer.isBuffer(body)) {
      return;
    }

    // get boundary
    if (this._req.headers["content-type"].indexOf("boundary") < 0) {
      return console.error("invalid headers, boundary is required");
    }

    // convert buffers
    const aBody = utils.buff2arr(body);
    const aBoundary = utils.buff2arr(this.boundary);

    // get "coordinates" of body content parts
    const positions = this.getSubPositions(aBody, aBoundary);

    // get arrays with parts, exclude boundaries
    const parts = [];

    for (let i = 0, max = positions.length; i < max; i++) {
      if (positions[i].start === undefined || positions[i].end === undefined) {
        continue;
      }

      if (positions[i + 1] === undefined) {
        continue;
      }

      parts.push(aBody.slice(positions[i].end + 1, positions[i + 1].start - 1));
    }

    // parse each part, get text fields and files
    for (let i = 0, max = parts.length; i < max; i++) {
      const parsed = this.parseEachPart(parts[i]);

      if (!parsed.name.length || !parsed.value.length) {
        continue;
      }

      const objName = utils.arr2buff2str(parsed.name);

      if (parsed.filefield.length && parsed.filename.length) {
        const fileName = utils.arr2buff2str(parsed.filename);

        this.files[objName] = {
          name: fileName,
          ext: this.getFileExtension(fileName),
          mime: utils.arr2buff2str(parsed.mime),
          body: utils.arr2buff(parsed.value),
        };
      } else if (parsed.field.length && parsed.name.length) {
        this.fields[objName] = utils.arr2buff2str(parsed.value);
      }
    }
  }

  private getBoundary(headers: IReqHeaders): Buffer {
    if (!headers["content-type"]) {
      return Buffer.from("");
    }

    return Buffer.from(
      "--" + headers["content-type"].replace(/(.*)boundary=/, "")
    );
  }

  private getSubPositions(base: number[], sub: number[]) {
    if (!utils.validate.array(base)) {
      utils.showError('getSubPositions() invalid "base" array');
    }
    if (!utils.validate.array(sub)) {
      utils.showError('getSubPositions() invalid "sub" array');
    }

    const positions = [];
    const max_i = base.length;
    const max_j = sub.length;
    let next, found;

    // iterate point
    let i = 0;

    while (i < max_i) {
      if (sub.indexOf(base[i]) < 0) {
        i++;
      } else {
        next = i;
        found = true;

        for (let j = 0; j < max_j; j++) {
          if (!found) {
            break;
          }

          if (sub[j] !== base[next]) {
            found = false;
          } else {
            next++;
          }
        }

        if (found) {
          positions.push({
            start: i,
            end: --next,
          });

          i += max_j;
        } else {
          i++;
        }
      }
    }

    return positions;
  }

  private parseEachPart(args: number[]) {
    // process flags
    const start = {
      disposition: true,
      field: false,
      name: false,
      filefield: false,
      filename: false,
      mime: false,
      charset: false,
      value: false,
    };

    // result arrays with symbols
    const result: {
      disposition: number[];
      field: number[];
      name: number[];
      filefield: number[];
      filename: number[];
      mime: number[];
      charset: number[];
      value: number[];
    } = {
      disposition: [],
      field: [],
      name: [],
      filefield: [],
      filename: [],
      mime: [],
      charset: [],
      value: [],
    };

    // codes of symbols
    const codes = {
      LF: 10,
      CR: 13,
      SPACE: 32,
      QUOTE: 34,
      HYPHEN: 45,
      SLASH: 47,
      NUMB_ZERO: 48,
      NUMB_NINE: 57,
      COLON: 58,
      SEMICOLON: 59,
      EQUAL: 61,
      CHAR_A: 97,
      CHAR_Z: 122,
    };

    for (let i = 0, flag = false, max = args.length; i < max; i++) {
      switch (true) {
        case start.disposition:
          if (!result.disposition.length && args[i] === codes.COLON) {
            flag = true;

            continue;
          }

          if (flag) {
            if (
              (args[i] >= codes.CHAR_A && args[i] <= codes.CHAR_Z) ||
              args[i] === codes.HYPHEN
            ) {
              result.disposition.push(args[i]);
            } else if (args[i] === codes.SEMICOLON) {
              flag = false;

              start.disposition = false;

              start.field = true;
            }
          }
          break;
        case start.field:
          if (
            !result.field.length &&
            (args[i] === codes.SPACE ||
              args[i] === codes.EQUAL ||
              args[i] === codes.QUOTE)
          ) {
            continue;
          } else if (args[i] >= codes.CHAR_A && args[i] <= codes.CHAR_Z) {
            result.field.push(args[i]);
          } else {
            start.field = false;

            start.name = true;
          }
          break;
        case start.name:
          if (
            !result.name.length &&
            (args[i] === codes.EQUAL || args[i] === codes.QUOTE)
          ) {
            continue;
          } else if (args[i] === codes.QUOTE) {
            start.name = false;

            start.filefield = true;
          } else {
            result.name.push(args[i]);
          }
          break;
        case start.filefield:
          if (
            !result.filefield.length &&
            (args[i] === codes.LF || args[i] === codes.CR)
          ) {
            start.filefield = false;

            start.value = true;
          } else if (
            !result.filefield.length &&
            (args[i] === codes.SEMICOLON ||
              args[i] === codes.SPACE ||
              args[i] === codes.EQUAL ||
              args[i] === codes.QUOTE)
          ) {
            continue;
          } else if (args[i] >= codes.CHAR_A && args[i] <= codes.CHAR_Z) {
            result.filefield.push(args[i]);
          } else {
            start.filefield = false;

            start.filename = true;
          }
          break;
        case start.filename:
          if (!result.filefield.length) {
            continue;
          }

          if (
            !result.filename.length &&
            (args[i] === codes.EQUAL || args[i] === codes.QUOTE)
          ) {
            continue;
          } else if (args[i] === codes.QUOTE) {
            start.filename = false;

            start.mime = true;
          } else {
            result.filename.push(args[i]);
          }
          break;
        case start.mime:
          if (!result.mime.length && args[i] === codes.COLON) {
            flag = true;

            continue;
          }

          if (flag) {
            if (
              (args[i] >= codes.CHAR_A && args[i] <= codes.CHAR_Z) ||
              args[i] === codes.COLON ||
              args[i] === codes.HYPHEN ||
              args[i] === codes.SLASH
            ) {
              result.mime.push(args[i]);
            } else if (args[i] === codes.SEMICOLON) {
              flag = false;

              start.mime = false;

              start.charset = true;
            } else if (args[i] === codes.LF || args[i] === codes.CR) {
              flag = false;

              start.mime = false;

              start.value = true;
            }
          }
          break;
        case start.charset:
          if (
            !result.charset.length &&
            (args[i] === codes.SPACE ||
              args[i] === codes.EQUAL ||
              args[i] === codes.QUOTE)
          ) {
            continue;
          } else if (
            (args[i] >= codes.NUMB_ZERO && args[i] <= codes.NUMB_NINE) ||
            (args[i] >= codes.CHAR_A && args[i] <= codes.CHAR_Z) ||
            args[i] === codes.HYPHEN
          ) {
            result.charset.push(args[i]);
          } else if (args[i] === codes.LF || args[i] === codes.CR) {
            start.charset = false;

            start.value = true;
          }
          break;
        case start.value:
          if (
            !result.value.length &&
            (args[i] === codes.LF || args[i] === codes.CR)
          ) {
            continue;
          }

          result.value.push(args[i]);
          break;
      }
    }

    // remove line feed and carriage return from value tail
    if (result.value.length) {
      let clean = false;
      let len = result.value.length;

      while (!clean) {
        len--;

        if (result.value[len] === codes.LF || result.value[len] === codes.CR) {
          result.value.splice(len, 1);
        } else {
          clean = true;
        }
      }
    }

    return result;
  }

  private getFileExtension(name: string): string | undefined {
    const parts = name.split(".");

    return parts.pop()?.toLowerCase();
  }
}
