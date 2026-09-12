import { render, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ImageFigure from "../components/figures/ImageFigure";

const fig = { t: "image", src: "/figures/x.jpg", w: 960, h: 516, alt: "منمنمة", credit: "مقامات الحريري", license: "Public domain" };

// صورة غلط أو صورة لا تصل أسوأ من رسمة عامة: البديل جاهز دائماً
describe("ImageFigure", () => {
  it("should render a lazy image with its dimensions and credit", () => {
    const { container } = render(<ImageFigure fig={fig} art="scroll" color="#c33" />);
    const img = container.querySelector("img");
    expect(img).toHaveAttribute("loading", "lazy");
    expect(img).toHaveAttribute("width", "960");
    expect(container.querySelector("figcaption")).toHaveTextContent("مقامات الحريري · Public domain");
  });

  it("should fall back to the line art when the image fails to load", () => {
    const { container } = render(<ImageFigure fig={fig} art="scroll" color="#c33" />);
    fireEvent.error(container.querySelector("img"));
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("should show the line art when there is no source", () => {
    const { container } = render(<ImageFigure fig={{ t: "image" }} art="scroll" color="#c33" />);
    expect(container.querySelector("svg")).not.toBeNull();
  });
});
