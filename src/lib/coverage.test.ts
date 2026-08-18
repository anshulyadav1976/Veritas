import { describe, expect, it } from "vitest";
import { coverageInput, topicInput } from "./coverage";
const id="7814f7ef-95e5-4a59-8e2b-21e5cdf0ac70";
describe("reviewed coverage input",()=>{it("requires bounded topic and article coverage records",()=>expect(topicInput.parse({storyId:id,topic:"climate"}).topic).toBe("climate"));it("rejects invented forms",()=>expect(coverageInput.safeParse({storyId:id,articleId:"a",coverageForm:"left",focusNote:"A bounded and reviewable focus note."}).success).toBe(false));});
