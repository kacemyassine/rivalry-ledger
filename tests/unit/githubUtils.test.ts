import { getMockLeagueData } from "../fixtures/mockSelectors";
import {
  fetchData,
  base64ToUtf8,
  GitHubConfig,
  updateData,
  LeagueData,
  uploadImage,
} from "@/lib/githubUtils";
import { Team, Player, Match } from "@/store/leagueStore";
import { API_ERRORS, API_SUCCESS } from "@/lib/errors";

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
    success: jest.fn(),
  },
}));

import { supabase } from "@/integrations/supabase/client";
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

const config: GitHubConfig = {
  owner: "owner",
  repo: "repo",
  path: "path",
  branch: "branch",
};

// ===========================================================================================
// Unit tests for updateData function
// ===========================================================================================

describe("fetchData", () => {
  let fetchSpy: jest.SpyInstance;
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
        API_ERRORS.LEAGUE_NOT_FOUND,
      );
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    test("returns null when response is 401 and calls toast.error with correct message", async () => {
      fetchSpy.mockResolvedValueOnce(mock401 as Response);
      const result = await fetchData(config, "token");
      expect(result).toBeNull();
      expect(toast.error as jest.Mock).toHaveBeenCalledWith(
        API_ERRORS.ACCESS_DENIED,
      );
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });

    test("returns null when response is 403 and calls toast.error with correct message", async () => {
      fetchSpy.mockResolvedValueOnce(mock403 as Response);
      const result = await fetchData(config, "token");
      expect(result).toBeNull();
      expect(toast.error as jest.Mock).toHaveBeenCalledWith(
        API_ERRORS.ACCESS_DENIED,
      );
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
        API_ERRORS.GENERIC_ERROR,
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
        API_ERRORS.CONNECTION_ERROR,
      );
      expect(fetchSpy).toHaveBeenCalledTimes(3);
      jest.useRealTimers();
    });
    // TODO: test malformed/unexpected response body from GitHub (e.g. missing `content` field, invalid base64)
    // based on the rare likelihood those tests will be implemented in other cycles.
  });

  // =================================================================
  // Unit Tests for updateData function
  // =================================================================

  describe("updateData", () => {
    const invokeMock = supabase.functions.invoke as jest.Mock;
    const toastErrorMock = toast.error as jest.Mock;
    const toastSuccessMock = toast.success as jest.Mock;
    beforeEach(() => {
      invokeMock.mockReset();
      toastErrorMock.mockReset();
      toastSuccessMock.mockReset();
    });
    describe("on success", () => {
      test("returns { success: true } and calls toast.success when data is valid and invoke succeeds", async () => {
        const mockData: LeagueData = getMockLeagueData();
        invokeMock.mockResolvedValueOnce({
          data: { success: true },
          error: null,
        });
        const result = await updateData(mockData, config);
        expect(result).toEqual({ success: true });
        expect(toastSuccessMock).toHaveBeenCalledWith(API_SUCCESS.SAVE_SUCCESS);
        expect(invokeMock).toHaveBeenCalledWith("update-json", {
          body: {
            data: mockData,
            owner: config.owner,
            repo: config.repo,
            path: config.path,
            branch: config.branch,
          },
        });
      });
      test("returns { success: true } when players and matches are empty", async () => {
        const mockData: LeagueData = {
          ...getMockLeagueData(),
          players: [],
          matches: [],
        };
        invokeMock.mockResolvedValueOnce({
          data: { success: true },
          error: null,
        });
        const result = await updateData(mockData, config);
        expect(result).toEqual({ success: true });
        expect(toastSuccessMock).toHaveBeenCalledWith(API_SUCCESS.SAVE_SUCCESS);
      });
    });

    describe("on invalid data shape", () => {
      const expectInvalidData = async (mockData: unknown) => {
        const result = await updateData(mockData as LeagueData, config);
        expect(result).toEqual({ success: false, error: "INVALID_DATA" });
        expect(toastErrorMock).toHaveBeenCalledWith(
          API_ERRORS.SAVE_DATA_INTEGRITY,
        );
        expect(invokeMock).not.toHaveBeenCalled();
      };

      test("returns { success: false, error: 'INVALID_DATA' } when data is null", async () => {
        await expectInvalidData(null);
      });
      test("returns { success: false, error: 'INVALID_DATA' } when teams is not an array", async () => {
        await expectInvalidData({
          ...getMockLeagueData(),
          teams: "not an array" as unknown as LeagueData["teams"],
        });
      });
      test("returns { success: false, error: 'INVALID_DATA' } when players is not an array", async () => {
        await expectInvalidData({
          ...getMockLeagueData(),
          players: "not an array" as unknown as Player[],
        });
      });
      test("returns { success: false, error: 'INVALID_DATA' } when matches is not an array", async () => {
        await expectInvalidData({
          ...getMockLeagueData(),
          matches: "not an array" as unknown as Match[],
        });
      });
      test("returns { success: false, error: 'INVALID_DATA' } when teams is empty", async () => {
        await expectInvalidData({ ...getMockLeagueData(), teams: [] });
      });
      test("returns { success: false, error: 'INVALID_DATA' } when a team is missing id", async () => {
        await expectInvalidData({
          ...getMockLeagueData(),
          teams: [{ name: "Team 1" }] as unknown as Team[],
        });
      });
      test("returns { success: false, error: 'INVALID_DATA' } when a player is missing teamId", async () => {
        await expectInvalidData({
          ...getMockLeagueData(),
          players: [{ id: "player1", name: "Player 1" }] as unknown as Player[],
        });
      });

      test("returns { success: false, error: 'INVALID_DATA' } when a match is missing homeTeamId", async () => {
        const mockData = getMockLeagueData({ withMatches: true });
        const [firstMatch, ...rest] = mockData.matches;
        await expectInvalidData({
          ...mockData,
          matches: [
            { ...firstMatch, homeTeamId: undefined },
            ...rest,
          ] as unknown as Match[],
        });
      });
      test("returns { success: false, error: 'INVALID_DATA' } when leagueConfig is omitted", async () => {
        await expectInvalidData({
          ...getMockLeagueData(),
          leagueConfig: undefined,
        });
      });
      test("returns { success: false, error: 'INVALID_DATA' } when leagueConfig.name is not a string", async () => {
        await expectInvalidData({
          ...getMockLeagueData(),
          leagueConfig: { ...getMockLeagueData().leagueConfig, name: 123 },
        });
      });
      test("returns { success: false, error: 'INVALID_DATA' } when targetMatches is omitted", async () => {
        await expectInvalidData({
          ...getMockLeagueData(),
          targetMatches: undefined,
        });
      });
      test("returns { success: false, error: 'INVALID_DATA' } when targetMatches is not a number", async () => {
        await expectInvalidData({
          ...getMockLeagueData(),
          targetMatches: "not a number" as unknown as number,
        });
      });
    });

    describe("on invoke error", () => {
      test("returns { success: false, error: 'INVOKE_ERROR' } and calls toast.error when supabase returns error", async () => {
        invokeMock.mockResolvedValueOnce({
          data: null,
          error: new Error("client error"),
        });
        const result = await updateData(getMockLeagueData(), config);
        expect(result).toEqual({ success: false, error: "INVOKE_ERROR" });
        expect(toastErrorMock).toHaveBeenCalledWith(
          API_ERRORS.UPDATE_GITHUB_FAILED,
        );
      });
      test("returns { success: false, error: 'INVOKE_ERROR' } and calls toast.error when result.error is set", async () => {
        invokeMock.mockResolvedValueOnce({
          data: { error: "edge function failed" },
          error: null,
        });
        const result = await updateData(getMockLeagueData(), config);
        expect(result).toEqual({ success: false, error: "INVOKE_ERROR" });
        expect(toastErrorMock).toHaveBeenCalledWith(
          API_ERRORS.UPDATE_GITHUB_FAILED,
        );
      });
    });

    describe("on network error", () => {
      test("returns { success: false, error: 'NETWORK_ERROR' } when invoke throws TypeError after all retries fail", async () => {
        jest.useFakeTimers();
        invokeMock.mockRejectedValue(new TypeError("Failed to fetch"));
        const promise = updateData(getMockLeagueData(), config);
        await jest.runAllTimersAsync();
        const result = await promise;
        expect(result).toEqual({ success: false, error: "NETWORK_ERROR" });
        expect(toastErrorMock).toHaveBeenCalledWith(
          API_ERRORS.CONNECTION_ERROR,
        );
        jest.useRealTimers();
      });
    });

    describe("retry logic", () => {
      beforeEach(() => {
        jest.useFakeTimers();
      });
      afterEach(() => {
        jest.useRealTimers();
      });
      test("returns { success: true } after invoke fails on first attempt and succeeds on second", async () => {
        const mockData: LeagueData = getMockLeagueData();
        invokeMock.mockResolvedValueOnce({
          data: null,
          error: new Error("client error"),
        });
        invokeMock.mockResolvedValueOnce({
          data: { success: true },
          error: null,
        });
        const promise = updateData(mockData, config);
        await jest.runAllTimersAsync();
        const result = await promise;
        expect(result).toEqual({ success: true });
        expect(invokeMock).toHaveBeenCalledTimes(2);
      });
      describe("when file already exists (sha present)", () => {
        test("returns image path and fires PUT with sha when file already exists", async () => {
          fetchSpy.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ sha: "abc123sha" }),
          } as Response);
          fetchSpy.mockResolvedValueOnce({ ok: true } as Response);

          const result = await uploadImage(
            "data:image/png;base64,abc123",
            "filename.png",
            config,
            "token",
          );

          expect(result).toBe("/images/filename.png");

          const putBody = JSON.parse(fetchSpy.mock.calls[1][1].body);
          expect(putBody.sha).toBe("abc123sha");
        });
      });

      describe("on failure", () => {
        test("returns null and calls toast.error when PUT response is not ok", async () => {
          fetchSpy.mockResolvedValueOnce({
            ok: false,
            status: 404,
          } as Response);
          fetchSpy.mockResolvedValueOnce({
            ok: false,
            status: 422,
          } as Response);

          const result = await uploadImage(
            "data:image/png;base64,abc123",
            "filename.png",
            config,
            "token",
          );

          expect(result).toBeNull();
          expect(toast.error as jest.Mock).toHaveBeenCalledWith(
            API_ERRORS.IMAGE_UPLOAD_FAILED,
          );
        });

        test("returns null and calls toast.error when fetch throws", async () => {
          fetchSpy.mockRejectedValueOnce(new Error("Network error"));

          const result = await uploadImage(
            "data:image/png;base64,abc123",
            "filename.png",
            config,
            "token",
          );

          expect(result).toBeNull();
          expect(toast.error as jest.Mock).toHaveBeenCalledWith(
            API_ERRORS.IMAGE_UPLOAD_FAILED,
          );
        });
      });
      test("returns { success: false, error: 'INVOKE_ERROR' } after all 3 attempts fail with invoke error", async () => {
        const mockData: LeagueData = getMockLeagueData();
        invokeMock.mockResolvedValue({
          data: null,
          error: new Error("client error"),
        });
        const promise = updateData(mockData, config);
        await jest.runAllTimersAsync();
        const result = await promise;
        expect(result).toEqual({ success: false, error: "INVOKE_ERROR" });
        expect(invokeMock).toHaveBeenCalledTimes(3);
      });
      test("calls invoke exactly once on immediate success", async () => {
        const mockData: LeagueData = getMockLeagueData();
        invokeMock.mockResolvedValueOnce({
          data: { success: true },
          error: null,
        });
        const result = await updateData(mockData, config);
        expect(result).toEqual({ success: true });
        expect(invokeMock).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("uploadImage", () => {
    let fetchSpy: jest.SpyInstance;
    beforeAll(() => {
      fetchSpy = jest.spyOn(window, "fetch");
    });
    beforeEach(() => {
      jest.clearAllMocks();
    });
    afterAll(() => {
      fetchSpy.mockRestore();
    });

    describe("when file does not exist (no sha)", () => {
      test("returns image path and fires PUT without sha when file does not exist", async () => {
        fetchSpy.mockResolvedValueOnce({ ok: false, status: 404 } as Response);
        fetchSpy.mockResolvedValueOnce({ ok: true } as Response);

        const result = await uploadImage(
          "data:image/png;base64,abc123",
          "filename.png",
          config,
          "token",
        );

        expect(result).toBe("/images/filename.png");

        const putCall = fetchSpy.mock.calls[1];
        const putBody = JSON.parse(putCall[1].body);
        expect(putBody).not.toHaveProperty("sha");
        expect(putBody.content).toBe("abc123");
        expect(putBody.message).toBe("Upload image: filename.png");
      });
    });

    describe("when file already exists (sha present)", () => {
      test("returns image path and fires PUT with sha when file already exists", async () => {
        fetchSpy.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ sha: "abc123sha" }),
        } as Response);
        fetchSpy.mockResolvedValueOnce({ ok: true } as Response);

        const result = await uploadImage(
          "data:image/png;base64,abc123",
          "filename.png",
          config,
          "token",
        );

        expect(result).toBe("/images/filename.png");

        const putBody = JSON.parse(fetchSpy.mock.calls[1][1].body);
        expect(putBody.sha).toBe("abc123sha");
      });
    });

    describe("on failure", () => {
      test("returns null and calls toast.error when PUT response is not ok", async () => {
        fetchSpy.mockResolvedValueOnce({ ok: false, status: 404 } as Response);
        fetchSpy.mockResolvedValueOnce({ ok: false, status: 422 } as Response);

        const result = await uploadImage(
          "data:image/png;base64,abc123",
          "filename.png",
          config,
          "token",
        );

        expect(result).toBeNull();
        expect(toast.error as jest.Mock).toHaveBeenCalledWith(
          API_ERRORS.IMAGE_UPLOAD_FAILED,
        );
      });

      test("returns null and calls toast.error when fetch throws", async () => {
        fetchSpy.mockRejectedValueOnce(new Error("Network error"));

        const result = await uploadImage(
          "data:image/png;base64,abc123",
          "filename.png",
          config,
          "token",
        );

        expect(result).toBeNull();
        expect(toast.error as jest.Mock).toHaveBeenCalledWith(
          API_ERRORS.IMAGE_UPLOAD_FAILED,
        );
      });
    });
  });

  // archiveLeague is not fully implemented yet — tests will be added once the feature is complete
  describe("archiveLeague", () => {
    describe("on success", () => {});
    describe("on failure", () => {});
  });

  // cups feature is being refactored — tests deliberately omitted until refactor is complete
  describe("fetchCups", () => {
    describe("on success", () => {});
    describe("on failure", () => {});
  });

  // updateCups is not fully implemented yet — tests will be added once the feature is complete
  describe("updateCups", () => {
    describe("on success", () => {});
    describe("on failure", () => {});
  });

  // fetchArchiveIndex is not fully implemented yet — tests will be added once the feature is complete
  describe("fetchArchiveIndex", () => {
    describe("on success", () => {});
    describe("on failure", () => {});
  });
});
