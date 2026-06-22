import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
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

const getTheImage = () => screen.getByAltText("Example Image");

describe("ImageLightbox - rendering", () => {
  test("renders image with correct src and alt when src is provided", () => {
    renderImageLightbox();
    const image = getTheImage();
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "https://example.com/image.jpg");
  });
  test("renders close button", () => {
    renderImageLightbox();
    expect(screen.getByTestId("x-icon")).toBeInTheDocument();
  });
  test("renders 404 message when src is empty", () => {
    render(<ImageLightbox src="" alt="Example Image" onClose={() => {}} />);
    expect(screen.getByTestId("image-off-icon")).toBeInTheDocument();
  });

  test("renders 404 message when src is provided but the image fails to load (broken/missing file)", () => {
    renderImageLightbox({ src: "/images/players/missing-player.webp" });
    const image = getTheImage();
    expect(screen.queryByTestId("image-off-icon")).not.toBeInTheDocument();
    fireEvent.error(image);
    expect(screen.getByTestId("image-off-icon")).toBeInTheDocument();
    expect(screen.queryByAltText("Example Image")).not.toBeInTheDocument();
  });
});

describe("ImageLightbox - close behavior", () => {
  let onClose: jest.Mock;

  beforeEach(() => {
    onClose = jest.fn();
  });

  test("calls onClose when backdrop is clicked", async () => {
    renderImageLightbox({ onClose });
    await userEvent.click(getTheImage().parentElement!);
    expect(onClose).toHaveBeenCalled();
  });
  test("calls onClose when close button is clicked", async () => {
    renderImageLightbox({ onClose });
    await userEvent.click(screen.getByTestId("x-icon"));
    expect(onClose).toHaveBeenCalled();
  });
  test("does not call onClose when image is clicked", async () => {
    renderImageLightbox({ onClose });
    await userEvent.click(getTheImage());
    expect(onClose).not.toHaveBeenCalled();
  });
  test("calls onClose when Escape key is pressed", async () => {
    renderImageLightbox({ onClose });
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });
});

describe("ImageLightbox - upload", () => {
  const mockIsAuthenticated = (value: boolean) => {
    (AuthService.isAuthenticated as jest.Mock).mockReturnValue(value);
  };
  const getUploadIcon = (exists = true) =>
    exists
      ? screen.getByTestId("upload-icon")
      : screen.queryByTestId("upload-icon");

  test("renders Add Image button when src is empty, admin is authenticated and uploadPath is provided", async () => {
    mockIsAuthenticated(true);
    renderImageLightbox({ src: "" });
    expect(getUploadIcon()).toBeInTheDocument();
  });
  test("does not render Add Image button when src is empty but user is not admin", async () => {
    mockIsAuthenticated(false);
    renderImageLightbox({ src: "" });
    expect(getUploadIcon(false)).not.toBeInTheDocument();
  });
  test("does not render Add Image button when src is empty, admin is authenticated but uploadPath is missing", async () => {
    mockIsAuthenticated(false);
    renderImageLightbox({ src: "", uploadPath: undefined });
    expect(getUploadIcon(false)).not.toBeInTheDocument();
  });
});
