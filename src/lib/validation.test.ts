import { describe, expect, it } from "vitest";
import { acceptFor, validateSelection } from "./validation";

describe("file validation", () => {
  it("allows primary image and video formats", () => {
    expect(validateSelection(new File([""], "cover.webp"), "media1")).toBeNull();
    expect(validateSelection(new File([""], "clip.mkv"), "media1")).toBeNull();
  });

  it("rejects audio as primary media", () => {
    expect(validateSelection(new File([""], "song.mp3"), "media1")).toBe("Input 1 must be an image or video.");
  });

  it("allows audio source audio and video formats", () => {
    expect(validateSelection(new File([""], "song.ogg"), "media2")).toBeNull();
    expect(validateSelection(new File([""], "music-video.webm"), "media2")).toBeNull();
  });

  it("reports accepted formats for inputs", () => {
    expect(acceptFor("media1")).toContain("image/*");
    expect(acceptFor("media2")).toContain("audio/*");
  });
});
