import { describe, it, expect } from "vitest";
import { isInternalReferrer } from "./site";

describe("isInternalReferrer", () => {
  it("recognizes our own apex + www + .com + vercel.app hosts", () => {
    expect(isInternalReferrer("https://matthewdenzin.ai/")).toBe(true);
    expect(isInternalReferrer("https://www.matthewdenzin.ai/x")).toBe(true);
    expect(isInternalReferrer("https://matthewdenzin.com")).toBe(true);
    expect(isInternalReferrer("https://matt-denzin-resume.vercel.app/")).toBe(true);
    expect(isInternalReferrer("https://foo.matthewdenzin.ai")).toBe(true);
  });
  it("does not match external or look-alike hosts", () => {
    expect(isInternalReferrer("https://www.google.com/")).toBe(false);
    expect(isInternalReferrer("https://notmatthewdenzin.ai/")).toBe(false);
    expect(isInternalReferrer(null)).toBe(false);
    expect(isInternalReferrer("")).toBe(false);
  });
});
