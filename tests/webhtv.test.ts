import { describe, expect, it } from "vitest"
import { parseRecentWatching } from "@/lib/webhtv"

describe("WebHTV recent watching", () => {
  it("keeps the latest record for each title and sorts newest first", () => {
    const result = parseRecentWatching({
      changes: [
        {
          action: "upsert",
          historyKey: "site-a@@@show-a@@@1",
          siteKey: "site-a",
          vodId: "show-a",
          vodName: "动画 A",
          vodPic: "https://img.example.com/a-old.jpg",
          episodeName: "第 1 集",
          progress: 0.2,
          updatedAt: 100,
        },
        {
          action: "upsert",
          historyKey: "site-b@@@show-a@@@1",
          siteKey: "site-b",
          vodId: "show-a",
          vodName: "动画 A",
          vodPic: "https://img.example.com/a.jpg",
          episodeName: "第 2 集",
          progress: 0.4,
          updatedAt: 300,
        },
        {
          action: "upsert",
          historyKey: "site-a@@@film-b@@@1",
          siteKey: "site-a",
          vodId: "film-b",
          vodName: "电影 B",
          vodPic: "https://img.example.com/b.jpg",
          episodeName: "正片",
          completed: true,
          progress: 1,
          updatedAt: 200,
        },
      ],
    })

    expect(result.map((item) => item.title)).toEqual(["动画 A", "电影 B"])
    expect(result[0]).toMatchObject({
      poster: "https://img.example.com/a.jpg",
      episode: "第 2 集",
      progress: 0.4,
    })
  })

  it("ignores deletions, malformed entries, and invalid poster URLs", () => {
    const result = parseRecentWatching({
      changes: [
        { action: "delete", vodName: "已删除" },
        {
          action: "upsert",
          vodName: "无海报",
          vodPic: "javascript:alert(1)",
          updatedAt: 300,
        },
        {
          action: "upsert",
          vodName: "有效影片",
          vodPic: "https://img.example.com/valid.jpg",
          updatedAt: 200,
        },
      ],
    })

    expect(result).toHaveLength(1)
    expect(result[0]?.title).toBe("有效影片")
  })

  it("honors the display limit", () => {
    const changes = Array.from({ length: 5 }, (_, index) => ({
      action: "upsert",
      vodName: `影片 ${index}`,
      vodPic: `https://img.example.com/${index}.jpg`,
      updatedAt: index + 1,
    }))

    expect(parseRecentWatching({ changes }, 2).map((item) => item.title)).toEqual([
      "影片 4",
      "影片 3",
    ])
  })
})
