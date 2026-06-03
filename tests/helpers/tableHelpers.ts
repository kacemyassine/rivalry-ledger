import { screen, within } from "@testing-library/react";

export function getColumnIndex(header: string): number {
  const headers = screen.getAllByRole("columnheader");
  const index = headers.findIndex((h) => h.textContent === header);
  if (index === -1) {
    throw new Error(`Column with header "${header}" not found`);
  }
  return index;
}

export function getCellByColumn(row: HTMLElement, header: string): HTMLElement {
  const cells = within(row).getAllByRole("cell");
  return cells[getColumnIndex(header)];
}