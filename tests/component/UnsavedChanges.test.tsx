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
describe("UnsavedChanges - rendering", () => {
  test("renders nothing when hasChanges is false", () => {
    renderUnsavedChanges({ hasChanges: false });
    expect(screen.queryByTestId("alert-icon")).not.toBeInTheDocument();
  });
  test("renders when hasChanges is true", () => {
    renderUnsavedChanges({ hasChanges: true });
    // Check for the presence of the alert icon to confirm rendering,
    //  since there are two alert icons in the component,
    //  we check that at least one is rendered
    expect(screen.getAllByTestId("alert-icon").length).toBeGreaterThan(0)

  });
  test("renders correct unsaved changes count", () => {
     const changeLog: string[] = [
        "Added match: Harbor United 2-1 Ocean Dragon",
        "Updated player stats for John Doe",
      ];
    renderUnsavedChanges({ changeLog });
    expect(screen.getAllByText(new RegExp(`${changeLog.length} unsaved changes`, "i")).length).toBeGreaterThan(0);
  });
  test("renders singular label when there is one change", () => {
    renderUnsavedChanges({
      changeLog: ["Added match: Harbor United 2-1 Ocean Dragon"],
    });
    expect(screen.getAllByText(/1 unsaved change/i).length).toBeGreaterThan(0);
  });
  test("renders plural label when there are multiple changes", () => {
    renderUnsavedChanges({
      changeLog: [
        "Added match: Harbor United 2-1 Ocean Dragon",
        "Updated player stats for John Doe",
        "Removed match: Harbor United 2-1 Ocean Dragon",
      ],
    });
    expect(screen.getAllByText(/3 unsaved changes/i).length).toBeGreaterThan(0);
  });
});

describe("UnsavedChanges - save button", () => {
  test("calls onSave when save button is clicked", async () => {
    renderUnsavedChanges();
    const saveButton = screen.getAllByTestId("save-button")[0];
    await userEvent.click(saveButton);
    expect(defaultProps.onSave).toHaveBeenCalled();
  });
  test("shows loader when saving is true", () => {
    renderUnsavedChanges({ saving: true });
    expect(screen.getAllByTestId("loader-icon").length).toBeGreaterThan(0);
  });
  test("disables save button when saving is true", () => {
    renderUnsavedChanges({ saving: true });
    const saveButton = screen.getAllByTestId("save-button")[0];
    expect(saveButton).toBeDisabled();
  });
});

describe("UnsavedChanges - mobile expand", () => {
  test("change log is hidden by default on mobile", () => {
  renderUnsavedChanges();
  expect(screen.queryByTestId("expanded-changelog-mobile")).not.toBeInTheDocument();
});

test("change log is visible after clicking the expand button", async () => {
  renderUnsavedChanges();
  await userEvent.click(screen.getByTestId("expand-button"));
  expect(screen.getByTestId("expanded-changelog-mobile")).toBeInTheDocument();
});
});

// 🔜 Upcoming feature — full undo cycle not yet implemented
// describe("UnsavedChanges - undo", () => {
//   test("calls onUndo with correct index when undo button is clicked", () => {});
//   test("calls onUndoAll when undo all button is clicked", () => {});
//   test("undo button is disabled when saving is true", () => {});
//   test("undo all button is disabled when saving is true", () => {});
// });
