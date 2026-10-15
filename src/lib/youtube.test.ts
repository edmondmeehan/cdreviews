import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { normalizeYoutubeUrl, youtubeVideoId } from "./youtube";

describe("review YouTube links", () => {
  it("accepts watch and shared video URLs", () => {
    assert.equal(youtubeVideoId("https://www.youtube.com/watch?v=dQw4w9WgXc&t=30"), "dQw4w9WgXc");
    assert.equal(normalizeYoutubeUrl("https://youtu.be/dQw4w9WgXc?si=abc"), "https://www.youtube.com/watch?v=dQw4w9WgXc");
  });
  it("accepts shorts, live and embed video links", () => {
    for (const path of ["shorts", "live", "embed"]) {
      assert.equal(youtubeVideoId(`https://www.youtube.com/${path}/dQw4w9WgXc`), "dQw4w9WgXc");
    }
  });
  it("rejects other sites, unsafe schemes, playlists and invalid IDs", () => {
    for (const url of ["https://youtube.com.evil.test/watch?v=dQw4w9WgXc", "javascript:alert(1)", "ftp://youtube.com/watch?v=dQw4w9WgXc", "https://youtube.com/playlist?list=123", "https://youtu.be/short", "https://youtu.be/dQw4w9WgXc/extra"]) {
      assert.equal(youtubeVideoId(url), null);
    }
  });
  it("clears an optional video when the link is removed", () => {
    assert.equal(normalizeYoutubeUrl(""), undefined);
    assert.equal(youtubeVideoId(undefined), null);
  });
});