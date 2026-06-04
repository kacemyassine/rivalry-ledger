import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ImageLightbox } from "@/components/ImageLightbox";
import { AuthService } from "@/lib/authService";

jest.mock("react-dom", () => ({
  ...jest.requireActual("react-dom"),
  createPortal: (node: React.ReactNode) => node,
}));

jest.mock("@/lib/authService", () => ({
  AuthService: {
    isAuthenticated: jest.fn(),
  },
}));

jest.mock("@/hooks/useGitHubData", () => ({
  useGitHubData: jest.fn().mockReturnValue({
    uploadImage: jest.fn(),
  }),
}));

jest.mock("lucide-react", () => ({
  X: () => <div data-testid="x-icon" />,
  Upload: () => <div data-testid="upload-icon" />,
  ImageOff: () => <div data-testid="image-off-icon" />,
  Loader2: () => <div data-testid="loader-icon" />,
}));

const renderImageLightbox = (
  props: Partial<React.ComponentProps<typeof ImageLightbox>> = {},
) => {
  const defaultProps = {
    src: "https://example.com/image.jpg",
    alt: "Example Image",
    onClose: jest.fn(),
    onUpload: jest.fn(),
    uploadPath: "images",
  };
  return render(<ImageLightbox {...defaultProps} {...props} />);
};
describe("ImageLightbox - rendering", () => {
  test("renders image with correct src and alt when src is provided", () => {
    renderImageLightbox();
    expect(screen.getByAltText("Example Image")).toBeInTheDocument();
  });
  test("renders close button", () => {
    renderImageLightbox();
    expect(screen.getByTestId("x-icon")).toBeInTheDocument();
  });
  test("renders 404 message when src is empty", () => {
    render(<ImageLightbox src="" alt="Example Image" onClose={() => {}} />);
    expect(screen.getByTestId("image-off-icon")).toBeInTheDocument();
  });
});

describe("ImageLightbox - close behavior", () => {
  test("calls onClose when backdrop is clicked", async() => {
    const onClose = jest.fn();
    renderImageLightbox({ onClose });
    await userEvent.click(screen.getByAltText("Example Image").parentElement!);
    expect(onClose).toHaveBeenCalled();
  });
  test("calls onClose when close button is clicked", async() => {
    const onClose = jest.fn();
    renderImageLightbox({ onClose });
    await userEvent.click(screen.getByTestId("x-icon"));
    expect(onClose).toHaveBeenCalled();
  });
  test("does not call onClose when image is clicked", async() => {
    const onClose = jest.fn();
    renderImageLightbox({ onClose });
    await userEvent.click(screen.getByAltText("Example Image"));
    expect(onClose).not.toHaveBeenCalled();
  });
  test("calls onClose when Escape key is pressed", async() => {
    const onClose = jest.fn();
    renderImageLightbox({ onClose });
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });
});

describe("ImageLightbox - upload", () => {
  test("renders Add Image button when src is empty, admin is authenticated and uploadPath is provided", async () => {
    (AuthService.isAuthenticated as jest.Mock).mockReturnValue(true);
    renderImageLightbox({ src: "" });
    expect(screen.getByTestId("upload-icon")).toBeInTheDocument();
  });
  test("does not render Add Image button when src is empty but user is not admin", async () => {
    (AuthService.isAuthenticated as jest.Mock).mockReturnValue(false);
    renderImageLightbox({ src: "" });
    expect(screen.queryByTestId("upload-icon")).not.toBeInTheDocument();
  });
  test("does not render Add Image button when src is empty, admin is authenticated but uploadPath is missing", async () => {
    (AuthService.isAuthenticated as jest.Mock).mockReturnValue(true);
    renderImageLightbox({ src: "", uploadPath: undefined });
    expect(screen.queryByTestId("upload-icon")).not.toBeInTheDocument();
  });
});
