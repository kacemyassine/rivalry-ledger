import { getMockLeagueData } from "../fixtures/mockSelectors";
import { fetchData, base64ToUtf8, GitHubConfig } from "@/lib/githubUtils";

jest.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: {
      invoke: jest.fn(),
    },
  },
}));

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
  },
}));

import { toast } from "sonner";

if (!globalThis.fetch) {
  globalThis.fetch = jest.fn();
}

describe("base64ToUtf8", () => {
  test("converts base64 string to UTF-8 string", () => {
    const base64String = btoa("Hello, World!");
    const result = base64ToUtf8(base64String);
    expect(result).toBe("Hello, World!");
  });
});

describe("fetchData", () => {
  let fetchSpy: jest.SpyInstance;
  const config: GitHubConfig = {
    owner: "owner",
    repo: "repo",
    path: "path",
    branch: "branch",
  };
  const mock404 = {
    ok: false,
    status: 404,
    text: async () => "Not Found",
  };
  const mock401 = {
    ok: false,
    status: 401,
    text: async () => "Unauthorized",
  };
  const mock403 = {
    ok: false,
    status: 403,
    text: async () => "Forbidden",
  };
  const mock500 = {
    ok: false,
    status: 500,
    text: async () => "Internal Server Error",
  };
  const mockSuccessResponse = (encoded: string) => ({
    ok: true,
    json: async () => ({ content: encoded }),
  });
  beforeAll(() => {
    // set up the spy once for the whole suite
    fetchSpy = jest.spyOn(window, "fetch");
  });

  beforeEach(() => {
    // clear call history between tests
    jest.clearAllMocks();
  });
  afterAll(() => {
    // restore original fetch after all tests
    fetchSpy.mockRestore();
  });

  describe("on success", () => {
    test("fetches data and returns parsed LeagueData", async () => {
      const mockData = getMockLeagueData();
      const encoded = btoa(
        unescape(encodeURIComponent(JSON.stringify(mockData))),
      );

      fetchSpy.mockResolvedValueOnce(mockSuccessResponse(encoded) as Response);
      const result = await fetchData(config, "token");
      expect(fetchSpy).toHaveBeenCalledWith(
        "https://api.github.com/repos/owner/repo/contents/path?ref=branch",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer token",
          }),
        }),
      );
      expect(result).toEqual(mockData);
    });

    test("returns LeagueData after internal server error on the first try and success on the second try", async () => {
      jest.useFakeTimers();
      const mockData = getMockLeagueData();
      const encoded = btoa(
        unescape(encodeURIComponent(JSON.stringify(mockData))),
      );

      fetchSpy.mockResolvedValueOnce(mock500 as Response);
      fetchSpy.mockResolvedValueOnce(mockSuccessResponse(encoded) as Response);
      const promise = fetchData(config, "token");
      await jest.runAllTimersAsync();
      const result = await promise;

      expect(fetchSpy).toHaveBeenCalledWith(
        "https://api.github.com/repos/owner/repo/contents/path?ref=branch",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer token",
          }),
        }),
      );
      expect(result).toEqual(mockData);
      expect(fetchSpy).toHaveBeenCalledTimes(2);
      jest.useRealTimers();
    });

    test("returns LeagueData after two internal server errors and success on the third try", async () => {
      jest.useFakeTimers();
      const mockData = getMockLeagueData();
      const encoded = btoa(
        unescape(encodeURIComponent(JSON.stringify(mockData))),
      );

      fetchSpy.mockResolvedValueOnce(mock500 as Response);
      fetchSpy.mockResolvedValueOnce(mock500 as Response);
      fetchSpy.mockResolvedValueOnce(mockSuccessResponse(encoded) as Response);
      const promise = fetchData(config, "token");
      await jest.runAllTimersAsync();
      const result = await promise;
      expect(fetchSpy).toHaveBeenCalledTimes(3);
      jest.useRealTimers();
      expect(result).toEqual(mockData);
    });
  });

  describe("on failure", () => {
    test("returns null when response is 404 and calls toast.error with correct message", async () => {
      fetchSpy.mockResolvedValueOnce(mock404 as Response);
      const result = await fetchData(config, "token");
      expect(result).toBeNull();
      expect(toast.error as jest.Mock).toHaveBeenCalledWith(
        "League data not found",
      
      );
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    test("returns null when response is 401 and calls toast.error with correct message", async () => {
      fetchSpy.mockResolvedValueOnce(mock401 as Response);
      const result = await fetchData(config, "token");
      expect(result).toBeNull();
      expect(toast.error as jest.Mock).toHaveBeenCalledWith("Access denied");
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    test("returns null when response is 403 and calls toast.error with correct message", async () => {
      fetchSpy.mockResolvedValueOnce(mock403 as Response);
      const result = await fetchData(config, "token");
      expect(result).toBeNull();
      expect(toast.error as jest.Mock).toHaveBeenCalledWith("Access denied");
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    test("returns null and calls toast.error after 3 retries on 500", async () => {
      jest.useFakeTimers();
      fetchSpy.mockResolvedValueOnce(mock500 as Response);
      fetchSpy.mockResolvedValueOnce(mock500 as Response);
      fetchSpy.mockResolvedValueOnce(mock500 as Response);
      const promise = fetchData(config, "token");
      await jest.runAllTimersAsync();
      const result = await promise;
      expect(result).toBeNull();
      expect(toast.error as jest.Mock).toHaveBeenCalledWith(
        "Something went wrong, try again later",
      );
      expect(fetchSpy).toHaveBeenCalledTimes(3);
      jest.useRealTimers();
    });

    test("returns null when fetch throws and calls toast.error with correct message after 3 retries", async () => {
      jest.useFakeTimers();
      fetchSpy.mockRejectedValue(new Error("Fetch error"));
      const promise = fetchData(config, "token");
      await jest.runAllTimersAsync();
      const result = await promise;
      expect(result).toBeNull();
      expect(toast.error as jest.Mock).toHaveBeenCalledWith(
        "Could not connect, check your internet connection",
      );
      expect(fetchSpy).toHaveBeenCalledTimes(3);
      jest.useRealTimers();
    });
  });

  describe("updateData", () => {
    describe("on success", () => {});
    describe("on failure", () => {});
  });

  describe("archiveLeague", () => {
    describe("on success", () => {});
    describe("on failure", () => {});
  });

  describe("uploadImage", () => {
    describe("when file does not exist (no sha)", () => {});
    describe("when file already exists (sha present)", () => {});
    describe("on failure", () => {});
  });

  describe("fetchCups", () => {
    describe("on success", () => {});
    describe("on failure", () => {});
  });

  describe("updateCups", () => {
    describe("on success", () => {});
    describe("on failure", () => {});
  });

  describe("fetchArchiveIndex", () => {
    describe("on success", () => {});
    describe("on failure", () => {});
  });
});
