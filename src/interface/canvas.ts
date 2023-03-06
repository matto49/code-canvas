interface Arr {
  isIndex: boolean;
  value: string;
  type?: string;
  key: string;
}
interface Var {
  varKey: string;
  value: string | Array<Array<Arr>>;
  type: string;
  key: string;
}
export interface Scope {
  key: string;
  style: any;
  typeName: string;
  children: Var[];
  name?: string;
}
