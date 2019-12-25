import { Observable } from '../../observable/src';

type Item =
  | string
  | object;
type Items = Item[];

type ItemsCreator = (() => Items) | Observable<Items>;

type NodeCreator = (item: Item, i: number, items: Items) => Node;

export function map(
  items: ItemsCreator,
  expr: NodeCreator,
  cleaning?: boolean
): DocumentFragment;
