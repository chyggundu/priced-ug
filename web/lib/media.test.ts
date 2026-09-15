import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildMediaSlides, looksLikeVideo, photoCount, wrapIndex } from "./media.js";

/*
  The slide order is the one contract the mobile app and the website have to
  agree on: photos first, cover first among them, video last. Each app keeps
  its own copy of these helpers (nothing is shared between them by design), so
  each keeps its own copy of this suite.
*/

describe("buildMediaSlides", () => {
  it("puts the gallery photos first and the video last", () => {
    assert.deepEqual(buildMediaSlides("cover.jpg", ["a.jpg", "b.jpg"], "clip.mp4"), [
      { type: "image", uri: "a.jpg" },
      { type: "image", uri: "b.jpg" },
      { type: "video", uri: "clip.mp4" },
    ]);
  });

  it("falls back to the single cover column for rows written before the gallery", () => {
    assert.deepEqual(buildMediaSlides("cover.jpg", [], null), [
      { type: "image", uri: "cover.jpg" },
    ]);
    assert.deepEqual(buildMediaSlides("cover.jpg", null, null), [
      { type: "image", uri: "cover.jpg" },
    ]);
  });

  it("prefers the gallery over the cover column when both are set", () => {
    assert.deepEqual(buildMediaSlides("cover.jpg", ["a.jpg"], null), [
      { type: "image", uri: "a.jpg" },
    ]);
  });

  it("shows a video-only item as one video slide rather than nothing", () => {
    assert.deepEqual(buildMediaSlides(null, [], "clip.mp4"), [
      { type: "video", uri: "clip.mp4" },
    ]);
  });

  it("returns nothing for an item with no media at all", () => {
    assert.deepEqual(buildMediaSlides(null, null, null), []);
    assert.deepEqual(buildMediaSlides(undefined, undefined, undefined), []);
  });

  it("drops empty entries so a blank url never becomes a blank slide", () => {
    assert.deepEqual(buildMediaSlides(null, ["a.jpg", ""], null), [
      { type: "image", uri: "a.jpg" },
    ]);
  });
});

describe("photoCount", () => {
  it("counts the gallery when there is one", () => {
    assert.equal(photoCount("cover.jpg", ["a.jpg", "b.jpg", "c.jpg"]), 3);
  });

  it("counts the legacy cover as one photo", () => {
    assert.equal(photoCount("cover.jpg", []), 1);
    assert.equal(photoCount("cover.jpg", null), 1);
  });

  it("is zero for an item with no photos", () => {
    assert.equal(photoCount(null, []), 0);
  });
});

describe("wrapIndex", () => {
  it("wraps past the last slide back to the first", () => {
    assert.equal(wrapIndex(3, 3), 0);
    assert.equal(wrapIndex(4, 3), 1);
  });

  it("wraps before the first slide back to the last", () => {
    assert.equal(wrapIndex(-1, 3), 2);
    assert.equal(wrapIndex(-4, 3), 2);
  });

  it("leaves an in-range index alone", () => {
    assert.equal(wrapIndex(1, 3), 1);
  });

  it("does not divide by zero on an empty list", () => {
    assert.equal(wrapIndex(2, 0), 0);
  });
});

describe("looksLikeVideo", () => {
  it("recognises the extensions the pickers actually produce", () => {
    for (const url of ["/a/b.mp4", "/a/b.MOV", "/a/b.webm", "/a/b.m4v", "/a/b.3gp"]) {
      assert.equal(looksLikeVideo(url), true, url);
    }
  });

  it("leaves photos to the <img> branch", () => {
    for (const url of ["/a/b.jpg", "/a/b.jpeg", "/a/b.png", "/a/b.heic", "/a/b.webp"]) {
      assert.equal(looksLikeVideo(url), false, url);
    }
  });

  it("ignores a query string or fragment after the extension", () => {
    assert.equal(looksLikeVideo("/a/b.mp4?token=x"), true);
    assert.equal(looksLikeVideo("/a/b.jpg?v=mp4"), false);
  });
});
