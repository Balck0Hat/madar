import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import App from "../App";
import { ApiError } from "../../shared/utils/api";

const db = { registrationOpen: false };

vi.mock("../../features/auth/services/auth.service", () => ({
  providers: vi.fn(async () => ({ google: false, registrationOpen: db.registrationOpen })),
  googleUrl: () => "/api/v1/auth/google",
  me: vi.fn(async () => { throw new ApiError("no session", 401, "UNAUTHORIZED"); }),
  register: vi.fn(),
  login: vi.fn(async () => { throw new ApiError("البريد أو كلمة المرور غير صحيحة", 401, "BAD_CREDENTIALS"); }),
  logout: vi.fn(),
  updateMe: vi.fn(),
}));

beforeEach(() => {
  db.registrationOpen = false;
  try { localStorage.setItem("madar.tour.v1", "done"); } catch (err) { /* التخزين محجوب */ }
});

// الباب مقفل: لا مدخل للتسجيل من أي شاشة، ولا حتى برابط مباشر
describe("closed registration", () => {
  it("should offer login instead of starting a new account on the landing screen", async () => {
    render(<App />);
    expect(await screen.findByText("ادخل إلى حسابك")).toBeInTheDocument();
    expect(screen.queryByText("ابدأ الرحلة")).not.toBeInTheDocument();
    expect(screen.queryByText("لديّ حساب")).not.toBeInTheDocument();
  });

  it("should land on the login form with no way to switch to registration", async () => {
    render(<App />);
    fireEvent.click(await screen.findByText("ادخل إلى حسابك"));
    expect(await screen.findByText("ادخل")).toBeInTheDocument();
    expect(screen.queryByLabelText("الاسم")).not.toBeInTheDocument();
    expect(screen.queryByText("ليس لديّ حساب")).not.toBeInTheDocument();
    expect(screen.queryByText("أنشئ الحساب")).not.toBeInTheDocument();
  });

  it("should show the login form even when /auth/register is opened directly", async () => {
    window.history.replaceState(null, "", "/auth/register");
    render(<App />);
    expect(await screen.findByText("ادخل")).toBeInTheDocument();
    expect(screen.queryByLabelText("الاسم")).not.toBeInTheDocument();
  });

  it("should restore the registration entry points once the door is opened", async () => {
    db.registrationOpen = true;
    render(<App />);
    expect(await screen.findByText("ابدأ الرحلة")).toBeInTheDocument();
    expect(screen.getByText("لديّ حساب")).toBeInTheDocument();
  });
});
