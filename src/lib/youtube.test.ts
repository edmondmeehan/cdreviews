import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { normalizeYoutubeUrl, youtubeVideoId } from "./youtube";

describe("review YouTube links", () => {
  it("accepts watch and shared video URLs", () => {
    assert.equal(youtubeVideoId("https://www.youtube.com/watch?v=M7lc1UVf-VE&t=30"), "M7lc1UVf-VE");
    assert.equal(normalizeYoutubeUrl("https://youtu.be/M7lc1UVf-VE?si=abc"), "https://www.youtube.com/watch?v=M7lc1UVf-VE");
  });
  it("accepts shorts, live and embed video links", () => {
    for (const path of ["shorts", "live", "embed"]) {
      assert.equal(youtubeVideoId(`https://www.youtube.com/${path}/M7lc1UVf-VE`), "M7lc1UVf-VE");
    }
  });
  it("rejects other sites, unsafe schemes, playlists and invalid IDs", () => {
    for (const url of ["https://youtube.com.evil.test/watch?v=M7lc1UVf-VE", "javascript:alert(1)", "ftp://youtube.com/watch?v=M7lc1UVf-VE", "https://youtube.com/playlist?list=123", "https://youtu.be/short", "https://youtu.be/M7lc1UVf-VE/extra"]) {
      assert.equal(youtubeVideoId(url), null);
    }
  });
  it("clears an optional video when the link is removed", () => {
    assert.equal(normalizeYoutubeUrl(""), undefined);
    assert.equal(youtubeVideoId(undefined), null);
  });
});