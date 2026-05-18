import { PLAYER_NAME_RULES } from "@/lib/rules";
import { PLAYER_ERRORS } from "@/lib/errors";

export function runNameValidationTests(action: (name: string) => void) {
  // FIND-18: no empty name validation in store — UI silently blocks but store accepts empty string
  test("throws an error if player name is empty", () => {
    expect(() => action("")).toThrow(PLAYER_ERRORS.NAME_REQUIRED);
  });

  // FIND-18: no whitespace validation in store — UI silently blocks but store accepts whitespace-only strings
  test("throws an error if player name is whitespace only", () => {
    expect(() => action("     ")).toThrow(PLAYER_ERRORS.NAME_REQUIRED);
  });

  // missing validation — no character type validation in store, digits and symbols accepted
  test.each([
    ["cr7", "contains a digit"],
    ["Player!", "contains a symbol"],
    ["Player@name", "contains @ symbol"],
    ["Player#1", "contains # and digit"],
  ])(
    "throws an error if player name contains invalid characters: %s (%s)",
    (name) => {
      expect(() => action(name)).toThrow(PLAYER_ERRORS.NAME_INVALID_CHARS);
    },
  );

  test("throws an error if player name below minimum length", () => {
    expect(() => action("a".repeat(PLAYER_NAME_RULES.minLength - 1))).toThrow(
      PLAYER_ERRORS.NAME_INVALID,
    );
  });

  // missing validation — no minimum letter count check, separators count toward length
  test.each([
    ["a b", "space between two single letters"],
    ["a-b", "hyphen between two single letters"],
  ])(
    "name with minimum length characters but not enough valid letters is not allowed: %s (%s)",
    (name) => {
      expect(() => action(name)).toThrow(PLAYER_ERRORS.NAME_INVALID);
    },
  );

  // missing validation — no leading/trailing whitespace trimming in store
  test("trims leading and trailing whitespace before validation", () => {
    // after trimming " c " becomes "c" which is below minLength and should be rejected
    expect(() => action(" c ")).toThrow(PLAYER_ERRORS.NAME_INVALID);
  });

  // BVA: minimum valid boundary — exactly minLength characters
  test("player name with exactly minimum length characters is allowed", () => {
    expect(() => action("a".repeat(PLAYER_NAME_RULES.minLength))).not.toThrow();
  });

  // BVA: maximum valid boundary — exactly maxLength characters
  test("player name with exactly maximum length characters is allowed", () => {
    expect(() => action("a".repeat(PLAYER_NAME_RULES.maxLength))).not.toThrow();
  });

  // BVA: above maximum boundary — maxLength + 1 characters should be rejected
  test("throws an error if player name exceeds maximum length", () => {
    expect(() => action("a".repeat(PLAYER_NAME_RULES.maxLength + 1))).toThrow(
      PLAYER_ERRORS.NAME_INVALID,
    );
  });
}
