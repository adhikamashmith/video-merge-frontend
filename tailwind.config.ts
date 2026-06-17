import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14171f",
        panel: "#f7f8fb",
        line: "#d7dce6",
        accent: "#0d9488",
        coral: "#e85d4f",
        gold: "#d69e2e"
      },
      boxShadow: {
        soft: "0 14px 45px rgba(20, 23, 31, 0.09)"
      }
    }
  },
  plugins: []
} satisfies Config;
