import { describe, expect, it } from "vitest";

import {
  isResolutionConfirmation,
  maskEmail,
  maskPhone,
} from "@/lib/conversations/policies";

describe("conversation policies", () => {
  it("recognizes explicit resolution confirmations", () => {
    expect(isResolutionConfirmation("问题已经解决，谢谢！")).toBe(true);
    expect(isResolutionConfirmation("还没有解决，请继续处理")).toBe(false);
  });

  it("masks contact details without double masking", () => {
    expect(maskPhone("13812342174")).toBe("138 **** 2174");
    expect(maskPhone("138 **** 2174")).toBe("138 **** 2174");
    expect(maskEmail("xiaoyu.lin@example.com")).toBe("x***@example.com");
  });
});
