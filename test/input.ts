interface IPoint {
    x: number;
    y: number;
    angle: IAngle

    add(vector: IPoint): IPoint;
}

interface IAngle {
    deg: number;
}