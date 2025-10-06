export default function () {}

export function placeholder(...numbers: number[]) {
  return numbers.reduce((acc, cur) => acc + cur, 0)
}
