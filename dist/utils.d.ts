export declare const showError: (err: any) => void;
export declare const validate: {
    json: (val: string) => boolean;
    object: (val: any) => boolean;
    array: (val: any[]) => boolean;
    string: (val: any) => boolean;
    integer: (val: any) => boolean;
    bool: (val: any) => boolean;
};
export declare const val2regexp: (val: any) => string;
export declare const buff2arr: (buff: Buffer) => number[];
export declare const arr2buff: (arr: number[]) => Buffer;
export declare const arr2buff2str: (arr: number[]) => string;
