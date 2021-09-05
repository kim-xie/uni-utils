export interface IuploadImg {
    input: { size: number, type: string },
    output: {
        size: number,
        type: string,
        width: number,
        height: number,
        ratio: number,
        url: string
    }
}

export interface IcompressImgByDirParam {
    dirPath: string;
    outputPath: string;
    isRecursion?: boolean;
    showLog?: boolean;
}