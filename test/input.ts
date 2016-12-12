interface IPoint {
    x: number;
    y: number;
    angle: IAngle;
    points: number[];

    add(vector: IPoint): IPoint;
}

interface IAngle {
    deg: number;
}