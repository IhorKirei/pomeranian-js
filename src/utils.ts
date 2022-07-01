import chalk from "chalk";

export const showError = (err: any): void => {
  console.error(chalk.red(err.stack || err));

  process.exit(1);
};

export const validate = {
  json: (val: string): boolean => {
    try {
      JSON.parse(val);
    } catch (e) {
      return false;
    }

    return true;
  },
  object: (val: any): boolean => {
    return (
      !!val &&
      Object.prototype.toString.call(val) === "[object Object]" &&
      val instanceof Object
    );
  },
  array: (val: any[]): boolean => {
    return Object.prototype.toString.call(val) === "[object Array]";
  },
  string: (val: any): boolean => {
    return typeof val === "string";
  },
  integer: (val: any): boolean => {
    return typeof val === "number";
  },
  bool: (val: any): boolean => {
    return val === true || val === false;
  },
};

export const val2regexp = (val: any): string => {
  if (exports.validate.string(val)) {
    return val;
  } else if (exports.validate.array(val)) {
    return "(" + val.join("|") + ")";
  } else {
    return "";
  }
};

export const buff2arr = (buff: Buffer): number[] => {
  if (!Buffer.isBuffer(buff)) {
    exports.showError("buff2arr() invalid buffer");
  }

  const result = [];
  let len = buff.length;

  while (len--) {
    result.push(buff[len]);
  }

  result.reverse();

  return result;
};

export const arr2buff = (arr: number[]): Buffer => {
  if (!exports.validate.array(arr)) {
    exports.showError("arr2buff() invalid array");
  }

  return Buffer.from(arr);
};

export const arr2buff2str = (arr: number[]): string => {
  return exports.arr2buff(arr).toString();
};
