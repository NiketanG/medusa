import { readdir } from "fs/promises"
import { join } from "path"
import { readDirRecursive } from "../read-dir-recursive"

jest.mock("fs/promises")
jest.mock("path")

describe("readDirRecursive", () => {
  it("should recursively read directories and return all entries", async () => {
    const mockReaddir = readdir as jest.MockedFunction<typeof readdir>
    const mockJoin = join as jest.MockedFunction<typeof join>

    // dir structure
    const dirStructure = {
      "/root": [
        { name: "file1.txt", isDirectory: () => false },
        { name: "subdir", isDirectory: () => true },
      ],
      "/root/subdir": [
        { name: "file2.txt", isDirectory: () => false },
        { name: "nested", isDirectory: () => true },
      ],
      "/root/subdir/nested": [{ name: "file3.txt", isDirectory: () => false }],
    }

    mockReaddir.mockImplementation((dir) => {
      return dirStructure[dir as string] ?? []
    })
    mockJoin.mockImplementation((...paths) => paths.join("/"))

    const result = await readDirRecursive("/root")

    const paths = result.map((r) => r.path)

    expect(paths).toEqual([
      "/root",
      "/root",
      "/root/subdir",
      "/root/subdir",
      "/root/subdir/nested",
    ])

    expect(result).toEqual([
      { name: "file1.txt", isDirectory: expect.any(Function) },
      { name: "subdir", isDirectory: expect.any(Function) },
      {
        name: "file2.txt",
        isDirectory: expect.any(Function),
      },
      {
        name: "nested",
        isDirectory: expect.any(Function),
      },
      {
        name: "file3.txt",
        isDirectory: expect.any(Function),
      },
    ])

    expect(mockReaddir).toHaveBeenCalledWith("/root", { withFileTypes: true })
    expect(mockReaddir).toHaveBeenCalledWith("/root/subdir", {
      withFileTypes: true,
    })
    expect(mockReaddir).toHaveBeenCalledWith("/root/subdir/nested", {
      withFileTypes: true,
    })
  })
})
