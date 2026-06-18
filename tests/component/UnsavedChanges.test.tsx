import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UnsavedChanges } from "@/components/UnsavedChanges";

jest.mock("lucide-react", () => ({
  Save: () => <div data-testid="save-icon" />,
  ChevronUp: () => <div data-testid="chevron-up-icon" />,
  ChevronDown: () => <div data-testid="chevron-down-icon" />,
  Loader2: () => <div data-testid="loader-icon" />,
  AlertTriangle: () => <div data-testid="alert-icon" />,
  Undo2: () => <div data-testid="undo-icon" />,
  RotateCcw: () => <div data-testid="rotate-ccw-icon" />,
}));

const defaultProps = {
  changeLog: ["Added match: Harbor United 2-1 Ocean Dragon"],
  onSave: jest.fn(),
  onUndo: jest.fn(),
  onUndoAll: jest.fn(),
  saving: false,
  hasChanges: true,
};

const renderUnsavedChanges = (props = {}) => {
  return render(<UnsavedChanges {...defaultProps} {...props} />);
};

afterEach(() => {
  jest.clearAllMocks();
});

const getUnsavedChangesComponent = (exists: boolean = true) =>
  exists
    ? screen.getAllByTestId("alert-icon")[0]
    : screen.queryByTestId("alert-icon");
describe("UnsavedChanges - rendering", () => {
  test("renders nothing when hasChanges is false", () => {
    renderUnsavedChanges({ hasChanges: false });
    const component = getUnsavedChangesComponent(false);
    expect(component).not.toBeInTheDocument();
  });
  test("renders when hasChanges is true", () => {
    renderUnsavedChanges({ hasChanges: true });
    const component = getUnsavedChangesComponent();
    expect(component).toBeInTheDocument();
  });
  test("renders correct unsaved changes count", () => {
    const changeLog: string[] = [
      "Added match: Harbor United 2-1 Ocean Dragon",
      "Updated player stats for John Doe",
    ];
    renderUnsavedChanges({ changeLog });
    expect(
      screen.getAllByText(
        new RegExp(`${changeLog.length} unsaved changes`, "i"),
      ).length,
    ).toBeGreaterThan(0);
  });
  test("renders singular label when there is one change", () => {
    renderUnsavedChanges({
      changeLog: ["Added match: Harbor United 2-1 Ocean Dragon"],
    });
    expect(screen.getAllByText(/1 unsaved change/i).length).toBeGreaterThan(0);
  });
});

describe("UnsavedChanges - save button", () => {
  const getSaveButton = () => screen.getAllByTestId("save-button")[0];
  test("calls onSave when save button is clicked", async () => {
    renderUnsavedChanges();
    const saveButton = getSaveButton();
    await userEvent.click(saveButton);
    expect(defaultProps.onSave).toHaveBeenCalled();
  });
  test("shows loader when saving is true", () => {
    renderUnsavedChanges({ saving: true });
    expect(screen.getAllByTestId("loader-icon").length).toBeGreaterThan(0);
  });
  test("disables save button when saving is true", () => {
    renderUnsavedChanges({ saving: true });
    const saveButton = getSaveButton();
    expect(saveButton).toBeDisabled();
  });
});

describe("UnsavedChanges - mobile expand", () => {
  const getExpandButton = () => screen.getByTestId("expand-button");
  const getExpandedChangelog = (exists: boolean = true) =>
    exists
      ? screen.getByTestId("expanded-changelog-mobile")
      : screen.queryByTestId("expanded-changelog-mobile");
  test("change log is hidden by default on mobile", () => {
    renderUnsavedChanges();
    expect(getExpandedChangelog(false)).not.toBeInTheDocument();
  });

  test("change log is visible after clicking the expand button", async () => {
    renderUnsavedChanges();
    const expandButton = getExpandButton();
    await userEvent.click(expandButton);
    expect(getExpandedChangelog()).toBeInTheDocument();
  });

  test("change log is hidden after clicking the expand button twice", async () => {
    renderUnsavedChanges();
    const expandButton = getExpandButton();
    await userEvent.click(expandButton);
    await userEvent.click(expandButton);
    expect(getExpandedChangelog(false)).not.toBeInTheDocument();
  });
});

// 🔜 Upcoming feature — full undo cycle not yet implemented
// describe("UnsavedChanges - undo", () => {
//   test("calls onUndo with correct index when undo button is clicked", () => {});
//   test("calls onUndoAll when undo all button is clicked", () => {});
//   test("undo button is disabled when saving is true", () => {});
//   test("undo all button is disabled when saving is true", () => {});
// });
