import type { Entity, Reconciliation } from './types';

export type FixtureRow = [
  string,
  string,
  string,
  Entity,
  string,
  Reconciliation['status'],
  Reconciliation['risk'],
  number,
  number,
  string,
];
