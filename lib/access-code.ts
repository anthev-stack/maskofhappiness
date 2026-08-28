import { timingSafeEqual } from "crypto";

export const ACCESS_CODE_PATTERN = /^\d{6}$/;

export function randomAccessCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function normalizeAccessCode(value: unknown) {
  return String(value ?? "").replace(/\D/g, "").slice(0, 6);
}

export function accessCodesMatch(expected: string, provided: string) {
  if (!ACCESS_CODE_PATTERN.test(expected) || !ACCESS_CODE_PATTERN.test(provided)) {
    return false;
  }
  const left = Buffer.from(expected);
  const right = Buffer.from(provided);
  return left.length === right.length && timingSafeEqual(left, right);
}
